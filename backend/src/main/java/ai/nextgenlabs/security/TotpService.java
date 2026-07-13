package ai.nextgenlabs.security;

import ai.nextgenlabs.config.AppProperties;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.List;

/**
 * RFC 6238 TOTP (HMAC-SHA1, 30s step, 6 digits) compatible with Google
 * Authenticator / Authy, plus Base32 secret handling and otpauth URI.
 */
@Service
public class TotpService {

    private static final String BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    private static final int DIGITS = 6;
    private static final int STEP_SECONDS = 30;
    private static final int WINDOW = 1; // ±1 step tolerance for clock drift

    private final SecureRandom random = new SecureRandom();
    private final AppProperties props;

    public TotpService(AppProperties props) {
        this.props = props;
    }

    /** Generates a new 160-bit Base32 secret. */
    public String generateSecret() {
        byte[] bytes = new byte[20];
        random.nextBytes(bytes);
        return base32Encode(bytes);
    }

    /** otpauth:// provisioning URI for QR codes. */
    public String provisioningUri(String secret, String accountEmail) {
        String issuer = props.getSecurity().getMfaIssuer();
        String label = URLEncoder.encode(issuer + ":" + accountEmail, StandardCharsets.UTF_8);
        String iss = URLEncoder.encode(issuer, StandardCharsets.UTF_8);
        return "otpauth://totp/%s?secret=%s&issuer=%s&algorithm=SHA1&digits=%d&period=%d"
                .formatted(label, secret, iss, DIGITS, STEP_SECONDS);
    }

    public boolean verify(String secret, String code) {
        if (secret == null || code == null || !code.matches("\\d{6}")) {
            return false;
        }
        long counter = System.currentTimeMillis() / 1000L / STEP_SECONDS;
        int target = Integer.parseInt(code);
        for (int w = -WINDOW; w <= WINDOW; w++) {
            if (generateCode(secret, counter + w) == target) {
                return true;
            }
        }
        return false;
    }

    private int generateCode(String secret, long counter) {
        try {
            byte[] key = base32Decode(secret);
            byte[] data = new byte[8];
            for (int i = 7; i >= 0; i--) {
                data[i] = (byte) (counter & 0xff);
                counter >>= 8;
            }
            Mac mac = Mac.getInstance("HmacSHA1");
            mac.init(new SecretKeySpec(key, "HmacSHA1"));
            byte[] hash = mac.doFinal(data);
            int offset = hash[hash.length - 1] & 0xf;
            int binary = ((hash[offset] & 0x7f) << 24)
                    | ((hash[offset + 1] & 0xff) << 16)
                    | ((hash[offset + 2] & 0xff) << 8)
                    | (hash[offset + 3] & 0xff);
            return binary % (int) Math.pow(10, DIGITS);
        } catch (Exception e) {
            return -1;
        }
    }

    /** Generates n human-friendly backup recovery codes (plaintext, shown once). */
    public List<String> generateBackupCodes(int n) {
        return java.util.stream.IntStream.range(0, n)
                .mapToObj(i -> randomBackupCode())
                .toList();
    }

    private String randomBackupCode() {
        String alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 10; i++) {
            if (i == 5) sb.append('-');
            sb.append(alphabet.charAt(random.nextInt(alphabet.length())));
        }
        return sb.toString();
    }

    /* ------------------------------ Base32 ------------------------------ */

    static String base32Encode(byte[] data) {
        StringBuilder result = new StringBuilder();
        int buffer = 0, bitsLeft = 0;
        for (byte b : data) {
            buffer = (buffer << 8) | (b & 0xff);
            bitsLeft += 8;
            while (bitsLeft >= 5) {
                int index = (buffer >> (bitsLeft - 5)) & 0x1f;
                bitsLeft -= 5;
                result.append(BASE32.charAt(index));
            }
        }
        if (bitsLeft > 0) {
            int index = (buffer << (5 - bitsLeft)) & 0x1f;
            result.append(BASE32.charAt(index));
        }
        return result.toString();
    }

    static byte[] base32Decode(String s) {
        s = s.replace("=", "").toUpperCase();
        int bytes = s.length() * 5 / 8;
        byte[] result = new byte[bytes];
        int buffer = 0, bitsLeft = 0, index = 0;
        for (char c : s.toCharArray()) {
            int val = BASE32.indexOf(c);
            if (val < 0) continue;
            buffer = (buffer << 5) | val;
            bitsLeft += 5;
            if (bitsLeft >= 8) {
                result[index++] = (byte) ((buffer >> (bitsLeft - 8)) & 0xff);
                bitsLeft -= 8;
            }
        }
        return result;
    }
}
