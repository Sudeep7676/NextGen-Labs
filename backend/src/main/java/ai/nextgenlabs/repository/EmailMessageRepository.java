package ai.nextgenlabs.repository;

import ai.nextgenlabs.domain.EmailMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EmailMessageRepository extends JpaRepository<EmailMessage, UUID> {

    List<EmailMessage> findByInquiryIdOrderByCreatedAtDesc(UUID inquiryId);
}
