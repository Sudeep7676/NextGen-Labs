package ai.nextgenlabs.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ReplyRequest(
        @NotBlank @Email String to,
        @NotBlank @Size(max = 255) String subject,
        @NotBlank @Size(max = 10000) String message
) {
}
