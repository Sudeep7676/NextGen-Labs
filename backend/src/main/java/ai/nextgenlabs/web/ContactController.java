package ai.nextgenlabs.web;

import ai.nextgenlabs.dto.ContactRequest;
import ai.nextgenlabs.dto.ContactResponse;
import ai.nextgenlabs.service.ContactService;
import ai.nextgenlabs.util.RequestUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/contact")
public class ContactController {

    private final ContactService contactService;

    public ContactController(ContactService contactService) {
        this.contactService = contactService;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> submit(
            @Valid @RequestBody ContactRequest request,
            HttpServletRequest http) {

        ContactResponse created = contactService.create(request, RequestUtils.clientIp(http));

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "message", "Your inquiry has been received. We'll respond within 24–48 hours.",
                "id", created.id()
        ));
    }
}
