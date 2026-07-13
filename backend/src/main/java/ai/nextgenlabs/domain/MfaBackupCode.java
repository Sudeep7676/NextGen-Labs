package ai.nextgenlabs.domain;

import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name = "mfa_backup_codes")
public class MfaBackupCode {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    /** BCrypt hash of a single-use recovery code. */
    @Column(name = "code_hash", nullable = false, length = 100)
    private String codeHash;

    @Column(nullable = false)
    private boolean used = false;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public String getCodeHash() { return codeHash; }
    public void setCodeHash(String codeHash) { this.codeHash = codeHash; }
    public boolean isUsed() { return used; }
    public void setUsed(boolean used) { this.used = used; }
}
