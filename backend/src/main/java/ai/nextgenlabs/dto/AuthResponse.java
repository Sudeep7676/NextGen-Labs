package ai.nextgenlabs.dto;

import java.time.OffsetDateTime;

public record AuthResponse(
        String accessToken,
        String tokenType,
        long expiresInSeconds,
        String refreshToken,
        String email,
        String fullName,
        String role,
        OffsetDateTime lastLoginAt,
        String lastLoginIp,
        String lastLoginDevice
) {
}
