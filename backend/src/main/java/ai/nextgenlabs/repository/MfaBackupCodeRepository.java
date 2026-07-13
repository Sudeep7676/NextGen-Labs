package ai.nextgenlabs.repository;

import ai.nextgenlabs.domain.MfaBackupCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MfaBackupCodeRepository extends JpaRepository<MfaBackupCode, UUID> {

    List<MfaBackupCode> findByUserIdAndUsedFalse(UUID userId);

    void deleteByUserId(UUID userId);

    long countByUserIdAndUsedFalse(UUID userId);
}
