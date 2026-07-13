package ai.nextgenlabs.service;

import ai.nextgenlabs.domain.AuditLog;
import ai.nextgenlabs.domain.enums.AuditAction;
import ai.nextgenlabs.repository.AuditLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class AuditService {

    private final AuditLogRepository repository;

    public AuditService(AuditLogRepository repository) {
        this.repository = repository;
    }

    /** Records an audit entry in its own transaction. */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void record(AuditAction action, String actor, UUID entityId, String ip, String details) {
        save(action, actor, entityId, ip, null, null, details);
    }

    /** Security-event overload capturing device + result. */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void security(AuditAction action, String actor, UUID entityId,
                         String ip, String device, String result, String details) {
        save(action, actor, entityId, ip, device, result, details);
    }

    private void save(AuditAction action, String actor, UUID entityId,
                      String ip, String device, String result, String details) {
        AuditLog log = new AuditLog();
        log.setAction(action);
        log.setActor(actor == null ? "anonymous" : actor);
        log.setEntityId(entityId);
        log.setIpAddress(ip);
        log.setDevice(device);
        log.setResult(result);
        log.setDetails(details);
        repository.save(log);
    }
}
