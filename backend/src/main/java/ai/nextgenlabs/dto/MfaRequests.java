package ai.nextgenlabs.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.List;

/** Grouped request/response records for the MFA flow. */
public final class MfaRequests {

    private MfaRequests() {
    }

    public record VerifyRequest(
            @NotBlank String challengeToken,
            @NotBlank String code
    ) {
    }

    public record SetupRequest(
            @NotBlank String challengeToken
    ) {
    }

    public record SetupResponse(
            String secret,
            String otpauthUri,
            List<String> backupCodes
    ) {
    }

    public record EnableRequest(
            @NotBlank String challengeToken,
            @NotBlank String secret,
            @NotBlank String code
    ) {
    }

    public record EnableResponse(
            AuthResponse auth,
            List<String> backupCodes
    ) {
    }

    public record ChangePasswordRequest(
            @NotBlank String currentPassword,
            @NotBlank String newPassword
    ) {
    }

    public record RefreshRequest(
            @NotBlank String refreshToken
    ) {
    }

    public record LogoutRequest(
            @NotBlank String refreshToken
    ) {
    }
}
