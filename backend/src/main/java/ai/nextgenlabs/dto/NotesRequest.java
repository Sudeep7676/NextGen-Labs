package ai.nextgenlabs.dto;

import jakarta.validation.constraints.Size;

public record NotesRequest(
        @Size(max = 5000) String notes
) {
}
