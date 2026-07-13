package ai.nextgenlabs.service;

import ai.nextgenlabs.config.AppProperties;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Simple in-memory sliding-window rate limiter keyed by client IP.
 * For a multi-instance deployment, back this with Redis instead.
 */
@Service
public class RateLimitService {

    private static final Duration WINDOW = Duration.ofHours(1);

    private final AppProperties props;
    private final Map<String, Window> buckets = new ConcurrentHashMap<>();

    public RateLimitService(AppProperties props) {
        this.props = props;
    }

    private record Window(Instant start, int count) {
    }

    private static final Duration MINUTE = Duration.ofMinutes(1);
    private final Map<String, Window> loginBuckets = new ConcurrentHashMap<>();

    public boolean allowContact(String ip) {
        int limit = props.getRateLimit().getContactPerHour();
        return allow(buckets, ip, limit, WINDOW);
    }

    /** Login endpoint: max N requests/minute per IP. */
    public boolean allowLogin(String ip) {
        int limit = props.getSecurity().getLoginRatePerMinute();
        return allow(loginBuckets, ip, limit, MINUTE);
    }

    private boolean allow(Map<String, Window> map, String ip, int limit, Duration window) {
        Instant now = Instant.now();
        Window updated = map.compute(ip, (k, existing) -> {
            if (existing == null || now.isAfter(existing.start().plus(window))) {
                return new Window(now, 1);
            }
            return new Window(existing.start(), existing.count() + 1);
        });
        return updated.count() <= limit;
    }
}
