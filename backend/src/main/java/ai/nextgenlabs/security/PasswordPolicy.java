package ai.nextgenlabs.security;

import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * Enterprise password policy: length ≥ 14, upper/lower/number/special,
 * rejects common/breached passwords, sequential patterns, and any password
 * containing the account's email/username.
 */
@Component
public class PasswordPolicy {

    public static final int MIN_LENGTH = 14;

    private static final Pattern UPPER = Pattern.compile("[A-Z]");
    private static final Pattern LOWER = Pattern.compile("[a-z]");
    private static final Pattern DIGIT = Pattern.compile("[0-9]");
    private static final Pattern SPECIAL = Pattern.compile("[^A-Za-z0-9]");

    // A representative blocklist of the most commonly breached passwords/roots.
    private static final Set<String> COMMON = Set.of(
            "password", "passw0rd", "password1", "password123", "admin", "admin123",
            "administrator", "letmein", "welcome", "welcome1", "qwerty", "qwerty123",
            "iloveyou", "monkey", "dragon", "abc123", "111111", "123456", "123456789",
            "12345678", "1234567890", "sunshine", "princess", "football", "baseball",
            "superman", "talentos", "talentos123", "nextgen", "nextgenlabs", "changeme",
            "changeme123", "secret", "master", "trustno1", "login", "root", "toor"
    );

    private static final List<String> SEQUENCES = List.of(
            "0123456789", "abcdefghijklmnopqrstuvwxyz", "qwertyuiop", "asdfghjkl", "zxcvbnm"
    );

    public record Result(boolean valid, String message) {
        static Result ok() { return new Result(true, null); }
        static Result fail(String m) { return new Result(false, m); }
    }

    public Result validate(String password, String email) {
        if (!StringUtils.hasText(password) || password.length() < MIN_LENGTH) {
            return Result.fail("Password must be at least " + MIN_LENGTH + " characters.");
        }
        if (!UPPER.matcher(password).find()) return Result.fail("Password must contain an uppercase letter.");
        if (!LOWER.matcher(password).find()) return Result.fail("Password must contain a lowercase letter.");
        if (!DIGIT.matcher(password).find()) return Result.fail("Password must contain a number.");
        if (!SPECIAL.matcher(password).find()) return Result.fail("Password must contain a special character.");

        String lower = password.toLowerCase();

        if (COMMON.contains(lower) || COMMON.stream().anyMatch(lower::contains)) {
            return Result.fail("This password is too common or has appeared in breaches.");
        }
        if (StringUtils.hasText(email)) {
            String local = email.contains("@") ? email.substring(0, email.indexOf('@')) : email;
            if (local.length() >= 3 && lower.contains(local.toLowerCase())) {
                return Result.fail("Password must not contain your email or username.");
            }
        }
        if (hasSequentialPattern(lower)) {
            return Result.fail("Password must not contain sequential or keyboard patterns.");
        }
        if (hasRepeatedRun(lower)) {
            return Result.fail("Password must not contain long repeated characters.");
        }
        return Result.ok();
    }

    private boolean hasSequentialPattern(String s) {
        for (String seq : SEQUENCES) {
            for (int i = 0; i + 4 <= seq.length(); i++) {
                String window = seq.substring(i, i + 4);
                if (s.contains(window) || s.contains(new StringBuilder(window).reverse().toString())) {
                    return true;
                }
            }
        }
        return false;
    }

    private boolean hasRepeatedRun(String s) {
        int run = 1;
        for (int i = 1; i < s.length(); i++) {
            run = (s.charAt(i) == s.charAt(i - 1)) ? run + 1 : 1;
            if (run >= 4) return true;
        }
        return false;
    }
}
