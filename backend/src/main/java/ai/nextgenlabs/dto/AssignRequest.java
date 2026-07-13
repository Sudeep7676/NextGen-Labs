package ai.nextgenlabs.dto;

import ai.nextgenlabs.domain.enums.Priority;
import jakarta.validation.constraints.Size;

public record AssignRequest(
        @Size(max = 160) String assignedTo,
        Priority priority
) {
}
