package ai.nextgenlabs.web;

import ai.nextgenlabs.domain.enums.InquiryStatus;
import ai.nextgenlabs.domain.enums.InquiryType;
import ai.nextgenlabs.dto.*;
import ai.nextgenlabs.service.ContactService;
import ai.nextgenlabs.util.RequestUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/contact-inquiries")
@PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN')")
public class AdminContactController {

    private final ContactService contactService;

    public AdminContactController(ContactService contactService) {
        this.contactService = contactService;
    }

    @GetMapping("/stats")
    public DashboardStats stats() {
        return contactService.stats();
    }

    @GetMapping
    public PageResponse<ContactResponse> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) InquiryStatus status,
            @RequestParam(required = false) InquiryType type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort sort = Sort.by(
                "asc".equalsIgnoreCase(direction) ? Sort.Direction.ASC : Sort.Direction.DESC,
                sortBy);
        return contactService.list(search, status, type,
                PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100), sort));
    }

    @GetMapping("/{id}")
    public ContactDetail get(@PathVariable UUID id,
                             @AuthenticationPrincipal String actor,
                             HttpServletRequest http) {
        return contactService.view(id, actor, RequestUtils.clientIp(http));
    }

    @PutMapping("/{id}/status")
    public ContactResponse updateStatus(@PathVariable UUID id,
                                        @Valid @RequestBody StatusUpdateRequest request,
                                        @AuthenticationPrincipal String actor,
                                        HttpServletRequest http) {
        return contactService.updateStatus(id, request, actor, RequestUtils.clientIp(http));
    }

    @PutMapping("/{id}/assign")
    public ContactResponse assign(@PathVariable UUID id,
                                  @Valid @RequestBody AssignRequest request,
                                  @AuthenticationPrincipal String actor,
                                  HttpServletRequest http) {
        return contactService.assign(id, request, actor, RequestUtils.clientIp(http));
    }

    @PutMapping("/{id}/notes")
    public ContactResponse updateNotes(@PathVariable UUID id,
                                       @Valid @RequestBody NotesRequest request,
                                       @AuthenticationPrincipal String actor,
                                       HttpServletRequest http) {
        return contactService.updateNotes(id, request, actor, RequestUtils.clientIp(http));
    }

    @PostMapping("/{id}/reply")
    public EmailMessageResponse reply(@PathVariable UUID id,
                                      @Valid @RequestBody ReplyRequest request,
                                      @AuthenticationPrincipal String actor,
                                      HttpServletRequest http) {
        return contactService.reply(id, request, actor, RequestUtils.clientIp(http));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable UUID id,
                                       @AuthenticationPrincipal String actor,
                                       HttpServletRequest http) {
        contactService.delete(id, actor, RequestUtils.clientIp(http));
        return ResponseEntity.noContent().build();
    }
}
