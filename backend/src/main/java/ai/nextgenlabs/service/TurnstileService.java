package ai.nextgenlabs.service;

import ai.nextgenlabs.config.AppProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;

import java.util.Map;

/**
 * Verifies Cloudflare Turnstile tokens to block bot/spam submissions.
 */
@Service
public class TurnstileService {

    private static final Logger log = LoggerFactory.getLogger(TurnstileService.class);

    private final AppProperties props;
    private final RestClient restClient;

    public TurnstileService(AppProperties props) {
        this.props = props;
        this.restClient = RestClient.create();
    }

    @SuppressWarnings("unchecked")
    public boolean verify(String token, String ip) {
        if (!props.getTurnstile().isEnabled()) {
            return true; // verification disabled (e.g. local/dev)
        }
        if (!StringUtils.hasText(token)) {
            return false;
        }
        try {
            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("secret", props.getTurnstile().getSecretKey());
            body.add("response", token);
            if (StringUtils.hasText(ip)) {
                body.add("remoteip", ip);
            }
            Map<String, Object> result = restClient.post()
                    .uri(props.getTurnstile().getVerifyUrl())
                    .body(body)
                    .retrieve()
                    .body(Map.class);
            return result != null && Boolean.TRUE.equals(result.get("success"));
        } catch (Exception ex) {
            log.warn("Turnstile verification failed: {}", ex.getMessage());
            return false;
        }
    }
}
