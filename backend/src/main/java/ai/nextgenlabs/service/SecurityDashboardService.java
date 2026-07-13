package ai.nextgenlabs.service;

import ai.nextgenlabs.domain.UserAccount;
import ai.nextgenlabs.domain.enums.AuditAction;
import ai.nextgenlabs.dto.SecurityDto;
import ai.nextgenlabs.repository.AuditLogRepository;
import ai.nextgenlabs.repository.RefreshTokenRepository;
import ai.nextgenlabs.repository.UserAccountRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class SecurityDashboardService {

    private static final List<AuditAction> SECURITY_ACTIONS = List.of(
            AuditAction.ADMIN_LOGIN_SUCCESS, AuditAction.ADMIN_LOGIN_FAILED,
            AuditAction.MFA_SUCCESS, AuditAction.MFA_FAILED,
            AuditAction.MFA_ENABLED, AuditAction.MFA_DISABLED,
            AuditAction.ACCOUNT_LOCKED, AuditAction.ACCOUNT_UNLOCKED,
            AuditAction.PASSWORD_CHANGED, AuditAction.PASSWORD_RESET,
            AuditAction.TOKEN_REUSE_DETECTED, AuditAction.ADMIN_LOGOUT
    );

    private final UserAccountRepository users;
    private final AuditLogRepository auditLogs;
    private final RefreshTokenRepository refreshTokens;
    private final AuditService audit;
    private final EmailService email;

    public SecurityDashboardService(UserAccountRepository users,
                                    AuditLogRepository auditLogs,
                                    RefreshTokenRepository refreshTokens,
                                    AuditService audit,
                                    EmailService email) {
        this.users = users;
        this.auditLogs = auditLogs;
        this.refreshTokens = refreshTokens;
        this.audit = audit;
        this.email = email;
    }

    @Transactional(readOnly = true)
    public SecurityDto.Dashboard dashboard() {
        OffsetDateTime dayAgo = OffsetDateTime.now().minusHours(24);
        OffsetDateTime now = OffsetDateTime.now();

        List<UserAccount> all = users.findAll();
        long mfaEnabled = all.stream().filter(UserAccount::isMfaEnabled).count();

        var overview = new SecurityDto.Overview(
                auditLogs.countByActionAndCreatedAtAfter(AuditAction.ADMIN_LOGIN_FAILED, dayAgo),
                users.findByLockedUntilAfterOrManualUnlockRequiredTrue(now).size(),
                mfaEnabled,
                all.size(),
                auditLogs.countByActionAndCreatedAtAfter(AuditAction.ADMIN_LOGIN_SUCCESS, dayAgo)
        );

        List<SecurityDto.LockedAccount> locked = users
                .findByLockedUntilAfterOrManualUnlockRequiredTrue(now).stream()
                .map(u -> new SecurityDto.LockedAccount(u.getId(), u.getEmail(), u.getRole().name(),
                        u.getFailedAttempts(), u.isManualUnlockRequired(), u.getLockedUntil()))
                .toList();

        List<SecurityDto.SecurityEvent> events = auditLogs
                .findByActionInOrderByCreatedAtDesc(SECURITY_ACTIONS, PageRequest.of(0, 50))
                .map(a -> new SecurityDto.SecurityEvent(a.getId(), a.getAction().name(), a.getActor(),
                        a.getIpAddress(), a.getDevice(), a.getResult(), a.getDetails(), a.getCreatedAt()))
                .toList();

        List<SecurityDto.MfaStatus> mfa = all.stream()
                .map(u -> new SecurityDto.MfaStatus(u.getId(), u.getEmail(), u.getRole().name(),
                        u.isMfaEnabled(), u.getLastLoginAt(), u.getLastLoginIp()))
                .toList();

        return new SecurityDto.Dashboard(overview, locked, events, mfa);
    }

    @Transactional
    public void unlockAccount(UUID targetId, String actor, String ip) {
        UserAccount user = users.findById(targetId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        user.setFailedAttempts(0);
        user.setLockedUntil(null);
        user.setManualUnlockRequired(false);
        users.save(user);
        audit.security(AuditAction.ACCOUNT_UNLOCKED, actor, targetId, ip, null, "SUCCESS",
                "Unlocked by " + actor);
        email.sendSecurityNotice(user.getEmail(), "Your account was unlocked",
                "<p>Your NextGen Labs admin account has been unlocked by an administrator.</p>");
    }
}
