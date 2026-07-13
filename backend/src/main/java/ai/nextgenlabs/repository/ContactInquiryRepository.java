package ai.nextgenlabs.repository;

import ai.nextgenlabs.domain.ContactInquiry;
import ai.nextgenlabs.domain.enums.InquiryStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ContactInquiryRepository
        extends JpaRepository<ContactInquiry, UUID>, JpaSpecificationExecutor<ContactInquiry> {

    long countByStatus(InquiryStatus status);
}
