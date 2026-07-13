package ai.nextgenlabs.dto;

import java.util.List;

public record ContactDetail(
        ContactResponse inquiry,
        List<EmailMessageResponse> emails
) {
}
