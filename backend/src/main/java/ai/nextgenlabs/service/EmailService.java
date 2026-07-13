package ai.nextgenlabs.service;

import ai.nextgenlabs.config.AppProperties;
import ai.nextgenlabs.domain.ContactInquiry;
import ai.nextgenlabs.domain.EmailMessage;
import ai.nextgenlabs.repository.EmailMessageRepository;
import ai.nextgenlabs.util.InputSanitizer;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

/**
 * Sends transactional email over SMTP (Gmail App Password) and records every
 * outgoing message to the communication history with delivery status.
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private static final DateTimeFormatter TS =
            DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm 'UTC'");
    private static final int MAX_ATTEMPTS = 3;

    private final AppProperties props;
    private final JavaMailSender mailSender;
    private final EmailMessageRepository emailRepo;

    public EmailService(AppProperties props,
                        JavaMailSender mailSender,
                        EmailMessageRepository emailRepo) {
        this.props = props;
        this.mailSender = mailSender;
        this.emailRepo = emailRepo;
    }

    private boolean enabled() {
        return props.getEmail().isEnabled();
    }

    /* ---------------------- Acknowledgment (on submit) --------------------- */

    @Async
    public void sendAcknowledgment(ContactInquiry c) {
        String body = """
                <div style="font-family:-apple-system,Segoe UI,Inter,sans-serif;max-width:560px;margin:auto;color:#111827">
                  <p>Hello %s,</p>
                  <p>Thank you for contacting <b>NextGen Labs</b>.</p>
                  <p>We have received your inquiry and our team will review it shortly.</p>
                  <p>A member of our team will respond within <b>24–48 business hours</b>.</p>
                  <p style="margin-top:24px">Regards,<br/>NextGen Labs</p>
                </div>
                """.formatted(InputSanitizer.escapeHtml(c.getFullName()));

        dispatch(c.getId(), c.getEmail(), "Thank You for Contacting NextGen Labs",
                body, "ACKNOWLEDGMENT", "system");
    }

    @Async
    public void sendCompanyNotification(ContactInquiry c) {
        String body = """
                <div style="font-family:-apple-system,Segoe UI,Inter,sans-serif;max-width:560px;margin:auto">
                  <h2 style="color:#0E3A5C">🚀 New Contact Inquiry Received</h2>
                  <table style="width:100%%;border-collapse:collapse;font-size:14px">
                    <tr><td style="padding:8px 0;color:#6B7280">Name</td><td style="padding:8px 0"><b>%s</b></td></tr>
                    <tr><td style="padding:8px 0;color:#6B7280">Email</td><td style="padding:8px 0">%s</td></tr>
                    <tr><td style="padding:8px 0;color:#6B7280">Company</td><td style="padding:8px 0">%s</td></tr>
                    <tr><td style="padding:8px 0;color:#6B7280">Phone</td><td style="padding:8px 0">%s</td></tr>
                    <tr><td style="padding:8px 0;color:#6B7280">Inquiry Type</td><td style="padding:8px 0">%s</td></tr>
                    <tr><td style="padding:8px 0;color:#6B7280;vertical-align:top">Message</td><td style="padding:8px 0;white-space:pre-wrap">%s</td></tr>
                    <tr><td style="padding:8px 0;color:#6B7280">Received</td><td style="padding:8px 0">%s</td></tr>
                  </table>
                </div>
                """.formatted(
                InputSanitizer.escapeHtml(c.getFullName()),
                InputSanitizer.escapeHtml(c.getEmail()),
                InputSanitizer.escapeHtml(orDash(c.getCompanyName())),
                InputSanitizer.escapeHtml(orDash(c.getPhoneNumber())),
                InputSanitizer.escapeHtml(c.getInquiryType().getLabel()),
                InputSanitizer.escapeHtml(c.getMessage()),
                (c.getCreatedAt() == null ? OffsetDateTime.now() : c.getCreatedAt()).format(TS)
        );

        dispatch(c.getId(), props.getEmail().getCompanyInbox(),
                "🚀 New Contact Inquiry Received", body, "NOTIFICATION", "system");
    }

    /* ------------------------- Custom admin reply -------------------------- */

    /**
     * Sends a fully-customized admin reply synchronously so the caller sees the
     * delivery result, and records it in the communication history.
     */
    public EmailMessage sendCustomReply(UUID inquiryId, String to, String subject,
                                        String plainMessage, String actor) {
        String html = """
                <div style="font-family:-apple-system,Segoe UI,Inter,sans-serif;max-width:560px;margin:auto;color:#111827;white-space:pre-wrap">%s</div>
                """.formatted(InputSanitizer.escapeHtml(plainMessage));
        return dispatch(inquiryId, to, subject, html, "CUSTOM_REPLY", actor);
    }

    /* --------------------- Security notifications ------------------------- */

    @Async
    public void sendSecurityNotice(String to, String subject, String innerHtml) {
        if (!enabled()) {
            return;
        }
        String html = """
                <div style="font-family:-apple-system,Segoe UI,Inter,sans-serif;max-width:560px;margin:auto;color:#111827">
                  <h2 style="color:#0E3A5C">%s</h2>
                  %s
                  <p style="margin-top:24px;color:#6B7280;font-size:12px">If this wasn't you, secure your account immediately.</p>
                  <p style="color:#6B7280;font-size:12px">— NextGen Labs Security</p>
                </div>
                """.formatted(InputSanitizer.escapeHtml(subject), innerHtml);
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper =
                    new MimeMessageHelper(message, false, StandardCharsets.UTF_8.name());
            helper.setFrom(props.getEmail().getFrom());
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(message);
            log.info("Security email '{}' sent to {}", subject, to);
        } catch (Exception ex) {
            log.error("Failed to send security email to {}: {}", to, ex.getMessage());
        }
    }

    /* ------------------------------ internals ------------------------------ */

    private EmailMessage dispatch(UUID inquiryId, String to, String subject,
                                  String html, String kind, String sender) {
        String status = "SENT";
        String error = null;

        if (!enabled()) {
            status = "FAILED";
            error = "Email delivery disabled";
        } else {
            boolean delivered = false;
            for (int attempt = 1; attempt <= MAX_ATTEMPTS && !delivered; attempt++) {
                try {
                    MimeMessage message = mailSender.createMimeMessage();
                    MimeMessageHelper helper =
                            new MimeMessageHelper(message, false, StandardCharsets.UTF_8.name());
                    helper.setFrom(props.getEmail().getFrom());
                    helper.setTo(to);
                    helper.setSubject(subject);
                    helper.setText(html, true);
                    mailSender.send(message);
                    delivered = true;
                    log.info("Email '{}' sent to {} (attempt {})", subject, to, attempt);
                } catch (Exception ex) {
                    error = ex.getMessage();
                    log.warn("Email attempt {}/{} to {} failed: {}", attempt, MAX_ATTEMPTS, to, error);
                    sleep(attempt * 500L);
                }
            }
            status = delivered ? "SENT" : "FAILED";
        }

        EmailMessage record = new EmailMessage();
        record.setInquiryId(inquiryId);
        record.setRecipient(to);
        record.setSubject(subject);
        record.setBody(html);
        record.setSender(sender);
        record.setKind(kind);
        record.setStatus(status);
        record.setError(error == null ? null : error.substring(0, Math.min(error.length(), 500)));
        return emailRepo.save(record);
    }

    private void sleep(long ms) {
        try {
            Thread.sleep(ms);
        } catch (InterruptedException ignored) {
            Thread.currentThread().interrupt();
        }
    }

    private static String orDash(String v) {
        return StringUtils.hasText(v) ? v : "—";
    }
}
