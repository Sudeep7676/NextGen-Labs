package ai.nextgenlabs.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private Cors cors = new Cors();
    private Jwt jwt = new Jwt();
    private Email email = new Email();
    private Turnstile turnstile = new Turnstile();
    private RateLimit rateLimit = new RateLimit();
    private Bootstrap bootstrap = new Bootstrap();
    private Security security = new Security();

    public Cors getCors() { return cors; }
    public void setCors(Cors cors) { this.cors = cors; }

    public Jwt getJwt() { return jwt; }
    public void setJwt(Jwt jwt) { this.jwt = jwt; }

    public Security getSecurity() { return security; }
    public void setSecurity(Security security) { this.security = security; }

    public Email getEmail() { return email; }
    public void setEmail(Email email) { this.email = email; }

    public Turnstile getTurnstile() { return turnstile; }
    public void setTurnstile(Turnstile turnstile) { this.turnstile = turnstile; }

    public RateLimit getRateLimit() { return rateLimit; }
    public void setRateLimit(RateLimit rateLimit) { this.rateLimit = rateLimit; }

    public Bootstrap getBootstrap() { return bootstrap; }
    public void setBootstrap(Bootstrap bootstrap) { this.bootstrap = bootstrap; }

    public static class Cors {
        private List<String> allowedOrigins = List.of("http://localhost:5173");
        public List<String> getAllowedOrigins() { return allowedOrigins; }
        public void setAllowedOrigins(List<String> allowedOrigins) { this.allowedOrigins = allowedOrigins; }
    }

    public static class Jwt {
        private String secret;
        private long accessTokenTtlMinutes = 15;
        private long refreshTokenTtlDays = 30;
        private long challengeTtlMinutes = 5;
        private String issuer = "nextgen-labs";
        public String getSecret() { return secret; }
        public void setSecret(String secret) { this.secret = secret; }
        public long getAccessTokenTtlMinutes() { return accessTokenTtlMinutes; }
        public void setAccessTokenTtlMinutes(long v) { this.accessTokenTtlMinutes = v; }
        public long getRefreshTokenTtlDays() { return refreshTokenTtlDays; }
        public void setRefreshTokenTtlDays(long v) { this.refreshTokenTtlDays = v; }
        public long getChallengeTtlMinutes() { return challengeTtlMinutes; }
        public void setChallengeTtlMinutes(long v) { this.challengeTtlMinutes = v; }
        public String getIssuer() { return issuer; }
        public void setIssuer(String issuer) { this.issuer = issuer; }
    }

    public static class Security {
        private int maxFailedAttempts = 5;
        private int lockMinutes = 30;
        private int manualUnlockThreshold = 10;
        private int loginRatePerMinute = 5;
        private String mfaIssuer = "TalentOS";
        public int getMaxFailedAttempts() { return maxFailedAttempts; }
        public void setMaxFailedAttempts(int v) { this.maxFailedAttempts = v; }
        public int getLockMinutes() { return lockMinutes; }
        public void setLockMinutes(int v) { this.lockMinutes = v; }
        public int getManualUnlockThreshold() { return manualUnlockThreshold; }
        public void setManualUnlockThreshold(int v) { this.manualUnlockThreshold = v; }
        public int getLoginRatePerMinute() { return loginRatePerMinute; }
        public void setLoginRatePerMinute(int v) { this.loginRatePerMinute = v; }
        public String getMfaIssuer() { return mfaIssuer; }
        public void setMfaIssuer(String v) { this.mfaIssuer = v; }
    }

    public static class Email {
        private boolean enabled = true;
        private String from;
        private String companyInbox;
        private String resendApiKey;   // Resend HTTP API (requires verified domain)
        private String brevoApiKey;    // Brevo HTTP API (single verified sender, no domain needed)
        public boolean isEnabled() { return enabled; }
        public void setEnabled(boolean enabled) { this.enabled = enabled; }
        public String getFrom() { return from; }
        public void setFrom(String from) { this.from = from; }
        public String getCompanyInbox() { return companyInbox; }
        public void setCompanyInbox(String companyInbox) { this.companyInbox = companyInbox; }
        public String getResendApiKey() { return resendApiKey; }
        public void setResendApiKey(String resendApiKey) { this.resendApiKey = resendApiKey; }
        public String getBrevoApiKey() { return brevoApiKey; }
        public void setBrevoApiKey(String brevoApiKey) { this.brevoApiKey = brevoApiKey; }
    }

    public static class Turnstile {
        private boolean enabled = false;
        private String secretKey;
        private String verifyUrl;
        public boolean isEnabled() { return enabled; }
        public void setEnabled(boolean enabled) { this.enabled = enabled; }
        public String getSecretKey() { return secretKey; }
        public void setSecretKey(String secretKey) { this.secretKey = secretKey; }
        public String getVerifyUrl() { return verifyUrl; }
        public void setVerifyUrl(String verifyUrl) { this.verifyUrl = verifyUrl; }
    }

    public static class RateLimit {
        private int contactPerHour = 5;
        public int getContactPerHour() { return contactPerHour; }
        public void setContactPerHour(int contactPerHour) { this.contactPerHour = contactPerHour; }
    }

    public static class Bootstrap {
        private String superAdminEmail;
        private String superAdminPassword;
        public String getSuperAdminEmail() { return superAdminEmail; }
        public void setSuperAdminEmail(String superAdminEmail) { this.superAdminEmail = superAdminEmail; }
        public String getSuperAdminPassword() { return superAdminPassword; }
        public void setSuperAdminPassword(String superAdminPassword) { this.superAdminPassword = superAdminPassword; }
    }
}
