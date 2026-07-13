package ai.nextgenlabs.repository;

import ai.nextgenlabs.domain.ContactInquiry;
import ai.nextgenlabs.domain.enums.InquiryStatus;
import ai.nextgenlabs.domain.enums.InquiryType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ContactInquiryRepository extends JpaRepository<ContactInquiry, UUID> {

    @Query("""
            SELECT c FROM ContactInquiry c
            WHERE (:status IS NULL OR c.status = :status)
              AND (:type IS NULL OR c.inquiryType = :type)
              AND (
                    :search IS NULL
                 OR LOWER(c.fullName)    LIKE LOWER(CONCAT('%', :search, '%'))
                 OR LOWER(c.email)       LIKE LOWER(CONCAT('%', :search, '%'))
                 OR LOWER(COALESCE(c.companyName, '')) LIKE LOWER(CONCAT('%', :search, '%'))
              )
            """)
    Page<ContactInquiry> search(
            @Param("search") String search,
            @Param("status") InquiryStatus status,
            @Param("type") InquiryType type,
            Pageable pageable
    );

    long countByStatus(InquiryStatus status);
}
