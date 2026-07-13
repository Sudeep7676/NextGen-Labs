package ai.nextgenlabs.dto;

import ai.nextgenlabs.domain.enums.InquiryStatus;
import ai.nextgenlabs.domain.enums.Priority;
import jakarta.validation.constraints.NotNull;

public record StatusUpdateRequest(
        @NotNull(message = "Status is required")
        InquiryStatus status,

        Priority priority,

        String assignedTo
) {
}
