package ai.nextgenlabs.service;

import ai.nextgenlabs.domain.ContactInquiry;
import ai.nextgenlabs.domain.EmailMessage;
import ai.nextgenlabs.domain.enums.*;
import ai.nextgenlabs.dto.*;
import ai.nextgenlabs.repository.ContactInquiryRepository;
import ai.nextgenlabs.repository.EmailMessageRepository;
import ai.nextgenlabs.util.InputSanitizer;
import ai.nextgenlabs.web.RateLimitExceededException;
import ai.nextgenlabs.web.SpamRejectedException;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class ContactService {

    private final ContactInquiryRepository repository;
    private final EmailMessageRepository emailRepo;
    private final EmailService emailService;
    private final AuditService auditService;
    private final TurnstileService turnstileService;
    private final RateLimitService rateLimitService;

    public ContactService(ContactInquiryRepository repository,
                          EmailMessageRepository emailRepo,
                          EmailService emailService,
                          AuditService auditService,
                          TurnstileService turnstileService,
                          RateLimitService rateLimitService) {
        this.repository = repository;
        this.emailRepo = emailRepo;
        this.emailService = emailService;
        this.auditService = auditService;
        this.turnstileService = turnstileService;
        this.rateLimitService = rateLimitService;
    }

    /* --------------------------- Public: create --------------------------- */

    @Transactional
    public ContactResponse create(ContactRequest req, String ip) {
        if (!rateLimitService.allowContact(ip)) {
            throw new RateLimitExceededException("Too many requests. Please try again later.");
        }
        if (!turnstileService.verify(req.turnstileToken(), ip)) {
            throw new SpamRejectedException("Spam verification failed. Please refresh and try again.");
        }

        ContactInquiry inquiry = new ContactInquiry();
        inquiry.setFullName(InputSanitizer.clean(req.fullName()));
        inquiry.setEmail(req.email().trim().toLowerCase());
        inquiry.setCompanyName(InputSanitizer.clean(req.companyName()));
        inquiry.setPhoneNumber(InputSanitizer.clean(req.phoneNumber()));
        inquiry.setInquiryType(req.inquiryType());
        inquiry.setMessage(InputSanitizer.clean(req.message()));
        inquiry.setStatus(InquiryStatus.NEW);
        inquiry.setPriority(derivePriority(req.inquiryType()));
        inquiry.setSource("WEBSITE");
        inquiry.setIpAddress(ip);

        ContactInquiry saved = repository.saveAndFlush(inquiry);

        auditService.record(AuditAction.CONTACT_CREATED, saved.getEmail(),
                saved.getId(), ip, "Inquiry created: " + saved.getInquiryType());

        // acknowledgment to visitor + internal notification (async, logged to history)
        emailService.sendAcknowledgment(saved);
        emailService.sendCompanyNotification(saved);

        return ContactResponse.from(saved);
    }

    private Priority derivePriority(InquiryType type) {
        return switch (type) {
            case PARTNERSHIP_INQUIRY, BOOK_DEMO -> Priority.HIGH;
            case TECHNICAL_SUPPORT, PRODUCT_INQUIRY -> Priority.MEDIUM;
            case CAREER_OPPORTUNITY, GENERAL_INQUIRY -> Priority.LOW;
        };
    }

    /* --------------------------- Admin: read ------------------------------ */

    @Transactional(readOnly = true)
    public PageResponse<ContactResponse> list(String search, InquiryStatus status,
                                              InquiryType type, Pageable pageable) {
        Specification<ContactInquiry> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (StringUtils.hasText(search)) {
                String like = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("fullName")), like),
                        cb.like(cb.lower(root.get("email")), like),
                        cb.like(cb.lower(cb.coalesce(root.get("companyName"), "")), like)
                ));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (type != null) {
                predicates.add(cb.equal(root.get("inquiryType"), type));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        Page<ContactInquiry> page = repository.findAll(spec, pageable);
        return PageResponse.of(page, ContactResponse::from);
    }

    @Transactional
    public ContactDetail view(UUID id, String actor, String ip) {
        ContactInquiry inquiry = find(id);
        auditService.record(AuditAction.CONTACT_VIEWED, actor, id, ip, null);
        List<EmailMessageResponse> emails = emailRepo.findByInquiryIdOrderByCreatedAtDesc(id)
                .stream().map(EmailMessageResponse::from).toList();
        return new ContactDetail(ContactResponse.from(inquiry), emails);
    }

    /* --------------------------- Admin: workflow -------------------------- */

    @Transactional
    public ContactResponse updateStatus(UUID id, StatusUpdateRequest req, String actor, String ip) {
        ContactInquiry inquiry = find(id);
        InquiryStatus previous = inquiry.getStatus();
        inquiry.setStatus(req.status());
        if (req.priority() != null) {
            inquiry.setPriority(req.priority());
        }
        if (req.assignedTo() != null) {
            inquiry.setAssignedTo(InputSanitizer.clean(req.assignedTo()));
        }
        ContactInquiry saved = repository.save(inquiry);

        AuditAction action = req.status() == InquiryStatus.CLOSED
                ? AuditAction.CONTACT_CLOSED
                : AuditAction.CONTACT_STATUS_CHANGED;
        auditService.record(action, actor, id, ip,
                "Status %s -> %s".formatted(previous, req.status()));
        return ContactResponse.from(saved);
    }

    @Transactional
    public ContactResponse assign(UUID id, AssignRequest req, String actor, String ip) {
        ContactInquiry inquiry = find(id);
        inquiry.setAssignedTo(InputSanitizer.clean(req.assignedTo()));
        if (req.priority() != null) {
            inquiry.setPriority(req.priority());
        }
        ContactInquiry saved = repository.save(inquiry);
        auditService.record(AuditAction.CONTACT_ASSIGNED, actor, id, ip,
                "Assigned to " + saved.getAssignedTo());
        return ContactResponse.from(saved);
    }

    @Transactional
    public ContactResponse updateNotes(UUID id, NotesRequest req, String actor, String ip) {
        ContactInquiry inquiry = find(id);
        inquiry.setNotes(InputSanitizer.clean(req.notes()));
        ContactInquiry saved = repository.save(inquiry);
        auditService.record(AuditAction.CONTACT_STATUS_CHANGED, actor, id, ip, "Notes updated");
        return ContactResponse.from(saved);
    }

    /* --------------------------- Admin: reply ----------------------------- */

    @Transactional
    public EmailMessageResponse reply(UUID id, ReplyRequest req, String actor, String ip) {
        ContactInquiry inquiry = find(id);
        EmailMessage sent = emailService.sendCustomReply(
                inquiry.getId(),
                req.to().trim(),
                InputSanitizer.clean(req.subject()),
                req.message(),
                actor
        );
        // move the inquiry into RESPONDED once a reply is dispatched
        if (inquiry.getStatus() != InquiryStatus.CLOSED) {
            inquiry.setStatus(InquiryStatus.RESPONDED);
            repository.save(inquiry);
        }
        auditService.record(AuditAction.CONTACT_RESPONDED, actor, id, ip,
                "Reply sent to %s (%s)".formatted(req.to(), sent.getStatus()));
        return EmailMessageResponse.from(sent);
    }

    /* --------------------------- Admin: delete ---------------------------- */

    @Transactional
    public void delete(UUID id, String actor, String ip) {
        ContactInquiry inquiry = find(id);
        emailRepo.findByInquiryIdOrderByCreatedAtDesc(id).forEach(emailRepo::delete);
        repository.delete(inquiry);
        auditService.record(AuditAction.CONTACT_CLOSED, actor, id, ip,
                "Deleted inquiry from " + inquiry.getEmail());
    }

    @Transactional(readOnly = true)
    public DashboardStats stats() {
        long total = repository.count();
        long fresh = repository.countByStatus(InquiryStatus.NEW);
        long inReview = repository.countByStatus(InquiryStatus.IN_REVIEW);
        long responded = repository.countByStatus(InquiryStatus.RESPONDED);
        long followUp = repository.countByStatus(InquiryStatus.FOLLOW_UP);
        long closed = repository.countByStatus(InquiryStatus.CLOSED);
        double responseRate = total == 0 ? 0.0
                : Math.round(((double) (total - fresh) / total) * 1000.0) / 10.0;
        return new DashboardStats(total, fresh, inReview, responded, followUp, closed, responseRate);
    }

    private ContactInquiry find(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Inquiry not found: " + id));
    }
}
