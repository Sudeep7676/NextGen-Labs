package ai.nextgenlabs.util;

import org.springframework.util.StringUtils;

import java.util.regex.Pattern;

/**
 * Defensive input sanitization. JPA/Hibernate already parameterizes queries
 * (SQL-injection safe); this focuses on stripping control characters and
 * neutralizing HTML/script content to prevent stored XSS.
 */
public final class InputSanitizer {

    private static final Pattern SCRIPT_TAG =
            Pattern.compile("<\\s*script[^>]*>.*?<\\s*/\\s*script\\s*>",
                    Pattern.CASE_INSENSITIVE | Pattern.DOTALL);
    private static final Pattern HTML_TAG = Pattern.compile("<[^>]+>");
    private static final Pattern CONTROL_CHARS = Pattern.compile("[\\p{Cntrl}&&[^\r\n\t]]");

    private InputSanitizer() {
    }

    public static String clean(String input) {
        if (!StringUtils.hasText(input)) {
            return input == null ? null : input.trim();
        }
        String cleaned = SCRIPT_TAG.matcher(input).replaceAll("");
        cleaned = HTML_TAG.matcher(cleaned).replaceAll("");
        cleaned = CONTROL_CHARS.matcher(cleaned).replaceAll("");
        return cleaned.trim();
    }

    /**
     * HTML-escapes a value for safe inclusion in an email/HTML template.
     */
    public static String escapeHtml(String input) {
        if (input == null) {
            return "";
        }
        return input
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#x27;");
    }
}
