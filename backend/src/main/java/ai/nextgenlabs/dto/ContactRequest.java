package ai.nextgenlabs.dto;

import ai.nextgenlabs.domain.enums.InquiryType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ContactRequest(

        @NotBlank(message = "Full name is required")
        @Size(min = 2, max = 160, message = "Full name must be 2–160 characters")
        String fullName,

        @NotBlank(message = "Email is required")
        @Email(message = "Enter a valid email address")
        @Size(max = 255)
        String email,

        @Size(max = 200, message = "Company name is too long")
        String companyName,

        @Size(max = 40)
        @Pattern(
                regexp = "^$|^[+0-9 ()-]{6,40}$",
                message = "Enter a valid phone number"
        )
        String phoneNumber,

        @NotNull(message = "Inquiry type is required")
        InquiryType inquiryType,

        @NotBlank(message = "Message is required")
        @Size(min = 10, max = 5000, message = "Message must be 10–5000 characters")
        String message,

        // Cloudflare Turnstile token (optional when Turnstile disabled)
        String turnstileToken
) {
}
