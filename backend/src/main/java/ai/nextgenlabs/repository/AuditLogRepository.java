package ai.nextgenlabs.repository;

import ai.nextgenlabs.domain.AuditLog;
import ai.nextgenlabs.domain.enums.AuditAction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {

    Page<AuditLog> findByActionInOrderByCreatedAtDesc(List<AuditAction> actions, Pageable pageable);

    Page<AuditLog> findAllByOrderByCreatedAtDesc(Pageable pageable);

    long countByActionAndCreatedAtAfter(AuditAction action, OffsetDateTime after);
}
