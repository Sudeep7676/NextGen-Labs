package ai.nextgenlabs.dto;

import ai.nextgenlabs.domain.ContactInquiry;

import java.time.OffsetDateTime;
import java.util.UUID;

public record ContactResponse(
        UUID id,
        String fullName,
        String email,
        String companyName,
        String phoneNumber,
        String inquiryType,
        String inquiryTypeLabel,
        String message,
        String status,
        String priority,
        String assignedTo,
        String notes,
        String source,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
    public static ContactResponse from(ContactInquiry c) {
        return new ContactResponse(
                c.getId(),
                c.getFullName(),
                c.getEmail(),
                c.getCompanyName(),
                c.getPhoneNumber(),
                c.getInquiryType().name(),
                c.getInquiryType().getLabel(),
                c.getMessage(),
                c.getStatus().name(),
                c.getPriority().name(),
                c.getAssignedTo(),
                c.getNotes(),
                c.getSource(),
                c.getCreatedAt(),
                c.getUpdatedAt()
        );
    }
}
