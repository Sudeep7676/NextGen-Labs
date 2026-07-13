package ai.nextgenlabs.service;

import ai.nextgenlabs.config.AppProperties;
import ai.nextgenlabs.domain.MfaBackupCode;
import ai.nextgenlabs.domain.RefreshToken;
import ai.nextgenlabs.domain.UserAccount;
import ai.nextgenlabs.domain.enums.AuditAction;
import ai.nextgenlabs.dto.AuthResponse;
import ai.nextgenlabs.dto.LoginStepResponse;
import ai.nextgenlabs.dto.MfaRequests;
import ai.nextgenlabs.repository.MfaBackupCodeRepository;
import ai.nextgenlabs.repository.RefreshTokenRepository;
import ai.nextgenlabs.repository.UserAccountRepository;
import ai.nextgenlabs.security.JwtService;
import ai.nextgenlabs.security.TotpService;
import io.jsonwebtoken.Claims;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.Base64;
import java.util.List;
import java.util.UUID;

@Service
public class AuthService {

    private final UserAccountRepository users;
    private final RefreshTokenRepository refreshTokens;
    private final MfaBackupCodeRepository backupCodes;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final TotpService totpService;
    private final AuditService audit;
    private final EmailService email;
    private final AppProperties props;
    private final ai.nextgenlabs.security.PasswordPolicy passwordPolicy;

    private final SecureRandom random = new SecureRandom();

    public AuthService(UserAccountRepository users,
                       RefreshTokenRepository refreshTokens,
                       MfaBackupCodeRepository backupCodes,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       TotpService totpService,
                       AuditService audit,
                       EmailService email,
                       AppProperties props,
                       ai.nextgenlabs.security.PasswordPolicy passwordPolicy) {
        this.users = users;
        this.refreshTokens = refreshTokens;
        this.backupCodes = backupCodes;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.totpService = totpService;
        this.audit = audit;
        this.email = email;
        this.props = props;
        this.passwordPolicy = passwordPolicy;
    }

    /* ------------------------------ Step 1: password ---------------------- */

    @Transactional
    public LoginStepResponse login(String rawEmail, String password, String ip, String device) {
        String email = rawEmail == null ? "" : rawEmail.trim().toLowerCase();
        UserAccount user = users.findByEmailIgnoreCase(email).orElse(null);

        // Account-enumeration safe: identical failure for unknown users.
        if (user == null || !user.isEnabled()) {
            audit.security(AuditAction.ADMIN_LOGIN_FAILED, email, null, ip, device, "FAILED", "unknown/disabled");
            throw new BadCredentialsException("Invalid credentials");
        }

        if (isLocked(user)) {
            audit.security(AuditAction.ADMIN_LOGIN_FAILED, email, user.getId(), ip, device, "LOCKED", "account locked");
            throw new ai.nextgenlabs.web.AccountLockedException(
                    "Account is locked. Try again later or contact an administrator.");
        }

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            registerFailure(user, ip, device);
            throw new BadCredentialsException("Invalid credentials");
        }

        // Password OK — reset counters, require MFA before issuing any JWT.
        user.setFailedAttempts(0);
        users.save(user);

        String challenge = jwtService.generateChallengeToken(user.getEmail());
        boolean enrolled = user.isMfaEnabled() && StringUtils.hasText(user.getMfaSecret());
        return new LoginStepResponse(true, enrolled, challenge,
                enrolled ? "Enter your authenticator code." : "Multi-factor setup required.");
    }

    private boolean isLocked(UserAccount user) {
        if (user.isManualUnlockRequired()) return true;
        return user.getLockedUntil() != null && user.getLockedUntil().isAfter(OffsetDateTime.now());
    }

    private void registerFailure(UserAccount user, String ip, String device) {
        int attempts = user.getFailedAttempts() + 1;
        user.setFailedAttempts(attempts);
        int max = props.getSecurity().getMaxFailedAttempts();
        int manual = props.getSecurity().getManualUnlockThreshold();

        if (attempts >= manual) {
            user.setManualUnlockRequired(true);
            user.setLockedUntil(OffsetDateTime.now().plusYears(100));
            audit.security(AuditAction.ACCOUNT_LOCKED, user.getEmail(), user.getId(), ip, device,
                    "LOCKED", "Manual unlock required after " + attempts + " failures");
            notify(user, "Account locked (manual unlock required)",
                    "<p>Your account was locked after repeated failed logins and requires a SUPER_ADMIN to unlock.</p>");
        } else if (attempts >= max) {
            user.setLockedUntil(OffsetDateTime.now().plusMinutes(props.getSecurity().getLockMinutes()));
            audit.security(AuditAction.ACCOUNT_LOCKED, user.getEmail(), user.getId(), ip, device,
                    "LOCKED", "Locked for " + props.getSecurity().getLockMinutes() + " min after " + attempts + " failures");
            notify(user, "Account temporarily locked",
                    "<p>Your account was locked for " + props.getSecurity().getLockMinutes()
                            + " minutes after " + attempts + " failed login attempts.</p>");
        }
        users.save(user);
        audit.security(AuditAction.ADMIN_LOGIN_FAILED, user.getEmail(), user.getId(), ip, device,
                "FAILED", "attempt " + attempts);
    }

    /* ------------------------- Step 2: MFA verify ------------------------- */

    @Transactional
    public AuthResponse verifyMfa(String challengeToken, String code, String ip, String device) {
        UserAccount user = requireChallenge(challengeToken);
        if (!user.isMfaEnabled() || !StringUtils.hasText(user.getMfaSecret())) {
            throw new ai.nextgenlabs.web.MfaException("MFA is not set up for this account.");
        }
        boolean ok = totpService.verify(user.getMfaSecret(), code) || consumeBackupCode(user, code);
        if (!ok) {
            audit.security(AuditAction.MFA_FAILED, user.getEmail(), user.getId(), ip, device, "FAILED", null);
            throw new ai.nextgenlabs.web.MfaException("Invalid verification code.");
        }
        audit.security(AuditAction.MFA_SUCCESS, user.getEmail(), user.getId(), ip, device, "SUCCESS", null);
        return issueTokens(user, ip, device);
    }

    private boolean consumeBackupCode(UserAccount user, String code) {
        if (code == null) return false;
        String normalized = code.trim().toUpperCase();
        for (MfaBackupCode bc : backupCodes.findByUserIdAndUsedFalse(user.getId())) {
            if (passwordEncoder.matches(normalized, bc.getCodeHash())) {
                bc.setUsed(true);
                backupCodes.save(bc);
                return true;
            }
        }
        return false;
    }

    /* --------------------------- MFA enrollment --------------------------- */

    @Transactional
    public MfaRequests.SetupResponse setupMfa(String challengeToken) {
        UserAccount user = requireChallenge(challengeToken);
        String secret = totpService.generateSecret();
        String uri = totpService.provisioningUri(secret, user.getEmail());
        // secret is returned to the client and confirmed on enable — not yet persisted
        return new MfaRequests.SetupResponse(secret, uri, List.of());
    }

    @Transactional
    public MfaRequests.EnableResponse enableMfa(String challengeToken, String secret,
                                                String code, String ip, String device) {
        UserAccount user = requireChallenge(challengeToken);
        if (!totpService.verify(secret, code)) {
            audit.security(AuditAction.MFA_FAILED, user.getEmail(), user.getId(), ip, device, "FAILED", "enrollment");
            throw new ai.nextgenlabs.web.MfaException("Invalid verification code. Check your authenticator.");
        }
        user.setMfaSecret(secret);
        user.setMfaEnabled(true);
        users.save(user);

        // fresh backup codes (returned once)
        backupCodes.deleteByUserId(user.getId());
        List<String> codes = totpService.generateBackupCodes(10);
        for (String c : codes) {
            MfaBackupCode bc = new MfaBackupCode();
            bc.setUserId(user.getId());
            bc.setCodeHash(passwordEncoder.encode(c));
            backupCodes.save(bc);
        }
        audit.security(AuditAction.MFA_ENABLED, user.getEmail(), user.getId(), ip, device, "SUCCESS", null);
        notify(user, "MFA enabled", "<p>Multi-factor authentication was enabled on your account.</p>");

        AuthResponse auth = issueTokens(user, ip, device);
        return new MfaRequests.EnableResponse(auth, codes);
    }

    private UserAccount requireChallenge(String challengeToken) {
        Claims claims;
        try {
            claims = jwtService.parse(challengeToken);
        } catch (Exception e) {
            throw new ai.nextgenlabs.web.MfaException("Session expired. Please sign in again.");
        }
        if (!JwtService.PURPOSE_CHALLENGE.equals(claims.get("purpose", String.class))) {
            throw new ai.nextgenlabs.web.MfaException("Invalid MFA session.");
        }
        return users.findByEmailIgnoreCase(claims.getSubject())
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));
    }

    /* --------------------------- Token issuance --------------------------- */

    private AuthResponse issueTokens(UserAccount user, String ip, String device) {
        String access = jwtService.generateAccessToken(
                user.getEmail(), user.getRole().name(), user.getFullName());

        String rawRefresh = randomToken();
        RefreshToken rt = new RefreshToken();
        rt.setUserId(user.getId());
        rt.setTokenHash(sha256(rawRefresh));
        rt.setJti(UUID.randomUUID().toString());
        rt.setExpiresAt(OffsetDateTime.now().plusDays(props.getJwt().getRefreshTokenTtlDays()));
        rt.setIpAddress(ip);
        rt.setDevice(device);
        refreshTokens.save(rt);

        OffsetDateTime prevLogin = user.getLastLoginAt();
        String prevIp = user.getLastLoginIp();
        user.setLastLoginAt(OffsetDateTime.now());
        user.setLastLoginIp(ip);
        user.setLastLoginDevice(device);
        users.save(user);

        audit.security(AuditAction.ADMIN_LOGIN_SUCCESS, user.getEmail(), user.getId(), ip, device, "SUCCESS", null);
        notify(user, "New sign-in to your NextGen Labs admin account",
                "<p>A sign-in was detected:</p><ul>"
                        + "<li><b>IP:</b> " + safe(ip) + "</li>"
                        + "<li><b>Device:</b> " + safe(device) + "</li>"
                        + "<li><b>Time:</b> " + OffsetDateTime.now() + "</li></ul>");

        return new AuthResponse(access, "Bearer", jwtService.getAccessTtlSeconds(), rawRefresh,
                user.getEmail(), user.getFullName(), user.getRole().name(),
                prevLogin, prevIp, user.getLastLoginDevice());
    }

    /* --------------------- Refresh rotation + reuse ----------------------- */

    @Transactional
    public AuthResponse refresh(String rawRefresh, String ip, String device) {
        RefreshToken token = refreshTokens.findByTokenHash(sha256(rawRefresh))
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        if (token.isRevoked() || token.getExpiresAt().isBefore(OffsetDateTime.now())) {
            throw new BadCredentialsException("Invalid credentials");
        }
        if (token.isUsed()) {
            // Reuse of a rotated token => likely theft: revoke the whole family.
            refreshTokens.revokeAllForUser(token.getUserId());
            audit.security(AuditAction.TOKEN_REUSE_DETECTED, "system", token.getUserId(), ip, device,
                    "BLOCKED", "Refresh token reuse detected — all sessions revoked");
            throw new BadCredentialsException("Invalid credentials");
        }

        token.setUsed(true);
        refreshTokens.save(token);

        UserAccount user = users.findById(token.getUserId())
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));
        audit.security(AuditAction.TOKEN_REFRESHED, user.getEmail(), user.getId(), ip, device, "SUCCESS", null);
        return issueTokens(user, ip, device);
    }

    @Transactional
    public void logout(String rawRefresh, String ip) {
        refreshTokens.findByTokenHash(sha256(rawRefresh)).ifPresent(t -> {
            t.setRevoked(true);
            refreshTokens.save(t);
            audit.security(AuditAction.ADMIN_LOGOUT, "user", t.getUserId(), ip, null, "SUCCESS", null);
        });
    }

    /* ----------------------------- Password ------------------------------- */

    @Transactional
    public void changePassword(String email, String currentPassword, String newPassword, String ip) {
        UserAccount user = users.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid credentials");
        }
        var result = passwordPolicy.validate(newPassword, email);
        if (!result.valid()) {
            throw new IllegalArgumentException(result.message());
        }
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setPasswordUpdatedAt(OffsetDateTime.now());
        users.save(user);
        refreshTokens.revokeAllForUser(user.getId()); // force re-login everywhere
        audit.security(AuditAction.PASSWORD_CHANGED, email, user.getId(), ip, null, "SUCCESS", null);
        notify(user, "Your password was changed",
                "<p>Your admin account password was changed. All active sessions were signed out.</p>");
    }

    /* ------------------------------ helpers ------------------------------- */

    private void notify(UserAccount user, String subject, String innerHtml) {
        email.sendSecurityNotice(user.getEmail(), subject, innerHtml);
    }

    private String randomToken() {
        byte[] b = new byte[32];
        random.nextBytes(b);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(b);
    }

    private static String sha256(String v) {
        try {
            byte[] d = MessageDigest.getInstance("SHA-256").digest(v.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte x : d) sb.append(String.format("%02x", x));
            return sb.toString();
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }

    private static String safe(String v) {
        return v == null ? "—" : v.replace("<", "&lt;").replace(">", "&gt;");
    }
}
