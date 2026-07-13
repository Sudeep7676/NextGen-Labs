package ai.nextgenlabs.web;

import ai.nextgenlabs.dto.AuthResponse;
import ai.nextgenlabs.dto.LoginRequest;
import ai.nextgenlabs.dto.LoginStepResponse;
import ai.nextgenlabs.dto.MfaRequests;
import ai.nextgenlabs.service.AuthService;
import ai.nextgenlabs.service.RateLimitService;
import ai.nextgenlabs.util.RequestUtils;
import ai.nextgenlabs.util.UserAgentParser;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final RateLimitService rateLimit;

    public AuthController(AuthService authService, RateLimitService rateLimit) {
        this.authService = authService;
        this.rateLimit = rateLimit;
    }

    private String device(HttpServletRequest http) {
        return UserAgentParser.describe(http.getHeader("User-Agent"));
    }

    @PostMapping("/login")
    public LoginStepResponse login(@Valid @RequestBody LoginRequest req, HttpServletRequest http) {
        String ip = RequestUtils.clientIp(http);
        if (!rateLimit.allowLogin(ip)) {
            throw new RateLimitExceededException("Too many login attempts. Please wait a minute.");
        }
        return authService.login(req.email(), req.password(), ip, device(http));
    }

    @PostMapping("/mfa/setup")
    public MfaRequests.SetupResponse setup(@Valid @RequestBody MfaRequests.SetupRequest req) {
        return authService.setupMfa(req.challengeToken());
    }

    @PostMapping("/mfa/enable")
    public MfaRequests.EnableResponse enable(@Valid @RequestBody MfaRequests.EnableRequest req,
                                             HttpServletRequest http) {
        return authService.enableMfa(req.challengeToken(), req.secret(), req.code(),
                RequestUtils.clientIp(http), device(http));
    }

    @PostMapping("/mfa/verify")
    public AuthResponse verify(@Valid @RequestBody MfaRequests.VerifyRequest req, HttpServletRequest http) {
        return authService.verifyMfa(req.challengeToken(), req.code(),
                RequestUtils.clientIp(http), device(http));
    }

    @PostMapping("/refresh")
    public AuthResponse refresh(@Valid @RequestBody MfaRequests.RefreshRequest req, HttpServletRequest http) {
        return authService.refresh(req.refreshToken(), RequestUtils.clientIp(http), device(http));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@Valid @RequestBody MfaRequests.LogoutRequest req,
                                       HttpServletRequest http) {
        authService.logout(req.refreshToken(), RequestUtils.clientIp(http));
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/change-password")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody MfaRequests.ChangePasswordRequest req,
                                               @AuthenticationPrincipal String email,
                                               HttpServletRequest http) {
        authService.changePassword(email, req.currentPassword(), req.newPassword(),
                RequestUtils.clientIp(http));
        return ResponseEntity.noContent().build();
    }
}
