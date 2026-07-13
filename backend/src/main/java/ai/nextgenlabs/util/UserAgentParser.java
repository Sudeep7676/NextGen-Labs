package ai.nextgenlabs.util;

import org.springframework.util.StringUtils;

/**
 * Lightweight User-Agent parser producing a "Browser on OS" device label
 * for login telemetry and security notifications.
 */
public final class UserAgentParser {

    private UserAgentParser() {
    }

    public static String describe(String ua) {
        if (!StringUtils.hasText(ua)) {
            return "Unknown device";
        }
        return browser(ua) + " on " + os(ua);
    }

    public static String browser(String ua) {
        if (ua.contains("Edg")) return "Edge";
        if (ua.contains("OPR") || ua.contains("Opera")) return "Opera";
        if (ua.contains("Chrome")) return "Chrome";
        if (ua.contains("Firefox")) return "Firefox";
        if (ua.contains("Safari")) return "Safari";
        return "Unknown browser";
    }

    public static String os(String ua) {
        if (ua.contains("Windows NT 10")) return "Windows";
        if (ua.contains("Windows")) return "Windows";
        if (ua.contains("Mac OS X") || ua.contains("Macintosh")) return "macOS";
        if (ua.contains("Android")) return "Android";
        if (ua.contains("iPhone") || ua.contains("iPad") || ua.contains("iOS")) return "iOS";
        if (ua.contains("Linux")) return "Linux";
        return "Unknown OS";
    }
}
