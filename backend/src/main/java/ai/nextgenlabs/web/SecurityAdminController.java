package ai.nextgenlabs.web;

import ai.nextgenlabs.dto.SecurityDto;
import ai.nextgenlabs.service.SecurityDashboardService;
import ai.nextgenlabs.util.RequestUtils;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/security")
@PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN')")
public class SecurityAdminController {

    private final SecurityDashboardService service;

    public SecurityAdminController(SecurityDashboardService service) {
        this.service = service;
    }

    @GetMapping("/dashboard")
    public SecurityDto.Dashboard dashboard() {
        return service.dashboard();
    }

    /** Manual unlock is a privileged action reserved for SUPER_ADMIN. */
    @PostMapping("/accounts/{id}/unlock")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> unlock(@PathVariable UUID id,
                                       @AuthenticationPrincipal String actor,
                                       HttpServletRequest http) {
        service.unlockAccount(id, actor, RequestUtils.clientIp(http));
        return ResponseEntity.noContent().build();
    }
}
