package ai.nextgenlabs.dto;

import ai.nextgenlabs.domain.EmailMessage;

import java.time.OffsetDateTime;
import java.util.UUID;

public record EmailMessageResponse(
        UUID id,
        String recipient,
        String subject,
        String body,
        String sender,
        String status,
        String kind,
        OffsetDateTime createdAt
) {
    public static EmailMessageResponse from(EmailMessage m) {
        return new EmailMessageResponse(
                m.getId(),
                m.getRecipient(),
                m.getSubject(),
                m.getBody(),
                m.getSender(),
                m.getStatus(),
                m.getKind(),
                m.getCreatedAt()
        );
    }
}
