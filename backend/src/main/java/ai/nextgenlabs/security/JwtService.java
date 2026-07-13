package ai.nextgenlabs.security;

import ai.nextgenlabs.config.AppProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.Map;
import java.util.UUID;

@Service
public class JwtService {

    public static final String PURPOSE_ACCESS = "ACCESS";
    public static final String PURPOSE_CHALLENGE = "MFA_CHALLENGE";

    private final AppProperties props;
    private final SecretKey key;

    public JwtService(AppProperties props) {
        this.props = props;
        // Derive a fixed 512-bit key via SHA-512 so HS512 works regardless of
        // the configured secret's length.
        this.key = Keys.hmacShaKeyFor(sha512(props.getJwt().getSecret()));
    }

    private static byte[] sha512(String secret) {
        try {
            return MessageDigest.getInstance("SHA-512")
                    .digest(secret == null ? new byte[0] : secret.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            throw new IllegalStateException("SHA-512 unavailable", e);
        }
    }

    public String generateAccessToken(String email, String role, String fullName) {
        Instant now = Instant.now();
        Instant exp = now.plus(props.getJwt().getAccessTokenTtlMinutes(), ChronoUnit.MINUTES);
        return Jwts.builder()
                .issuer(props.getJwt().getIssuer())
                .subject(email)
                .id(UUID.randomUUID().toString())
                .claims(Map.of("role", role, "name", fullName, "purpose", PURPOSE_ACCESS))
                .issuedAt(Date.from(now))
                .expiration(Date.from(exp))
                .signWith(key, Jwts.SIG.HS512)
                .compact();
    }

    /** Short-lived token proving password step passed; used to gate MFA verify. */
    public String generateChallengeToken(String email) {
        Instant now = Instant.now();
        Instant exp = now.plus(props.getJwt().getChallengeTtlMinutes(), ChronoUnit.MINUTES);
        return Jwts.builder()
                .issuer(props.getJwt().getIssuer())
                .subject(email)
                .id(UUID.randomUUID().toString())
                .claims(Map.of("purpose", PURPOSE_CHALLENGE))
                .issuedAt(Date.from(now))
                .expiration(Date.from(exp))
                .signWith(key, Jwts.SIG.HS512)
                .compact();
    }

    public Claims parse(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .requireIssuer(props.getJwt().getIssuer())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public long getAccessTtlSeconds() {
        return props.getJwt().getAccessTokenTtlMinutes() * 60;
    }
}
