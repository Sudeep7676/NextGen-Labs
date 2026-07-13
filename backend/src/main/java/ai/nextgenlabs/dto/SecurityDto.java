package ai.nextgenlabs.dto;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

/** Records powering the Admin Security Dashboard. */
public final class SecurityDto {

    private SecurityDto() {
    }

    public record Overview(
            long failedLogins24h,
            long lockedAccounts,
            long mfaEnabledAccounts,
            long totalAdmins,
            long loginSuccess24h
    ) {
    }

    public record LockedAccount(
            UUID id,
            String email,
            String role,
            int failedAttempts,
            boolean manualUnlockRequired,
            OffsetDateTime lockedUntil
    ) {
    }

    public record SecurityEvent(
            UUID id,
            String action,
            String actor,
            String ipAddress,
            String device,
            String result,
            String details,
            OffsetDateTime createdAt
    ) {
    }

    public record MfaStatus(
            UUID id,
            String email,
            String role,
            boolean mfaEnabled,
            OffsetDateTime lastLoginAt,
            String lastLoginIp
    ) {
    }

    public record Dashboard(
            Overview overview,
            List<LockedAccount> lockedAccounts,
            List<SecurityEvent> recentEvents,
            List<MfaStatus> mfaStatuses
    ) {
    }
}
