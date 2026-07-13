package ai.nextgenlabs.service;

import ai.nextgenlabs.config.AppProperties;
import ai.nextgenlabs.domain.ContactInquiry;
import ai.nextgenlabs.domain.EmailMessage;
import ai.nextgenlabs.repository.EmailMessageRepository;
import ai.nextgenlabs.util.InputSanitizer;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;

import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Sends transactional email and records every outgoing message with its
 * delivery status. Uses Resend's HTTP API when RESEND_API_KEY is configured
 * (works on hosts that block SMTP, e.g. Render); otherwise falls back to SMTP
 * (Gmail) for local development.
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private static final DateTimeFormatter TS =
            DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm 'UTC'");
    private static final int MAX_ATTEMPTS = 3;

    private final AppProperties props;
    private final JavaMailSender mailSender;
    private final EmailMessageRepository emailRepo;
    private final RestClient http = RestClient.create();

    public EmailService(AppProperties props,
                        JavaMailSender mailSender,
                        EmailMessageRepository emailRepo) {
        this.props = props;
        this.mailSender = mailSender;
        this.emailRepo = emailRepo;
    }

    private boolean enabled() {
        return props.getEmail().isEnabled();
    }

    private boolean useBrevo() {
        return StringUtils.hasText(props.getEmail().getBrevoApiKey());
    }

    private boolean useResend() {
        return StringUtils.hasText(props.getEmail().getResendApiKey());
    }

    /** Splits an "Name <email>" address into [name, email]. */
    private String[] parseFrom() {
        String from = props.getEmail().getFrom();
        if (from != null && from.contains("<") && from.contains(">")) {
            String name = from.substring(0, from.indexOf('<')).trim();
            String email = from.substring(from.indexOf('<') + 1, from.indexOf('>')).trim();
            return new String[]{name.isEmpty() ? "NextGen Labs" : name, email};
        }
        return new String[]{"NextGen Labs", from == null ? "" : from.trim()};
    }

    /* ---------------------- Acknowledgment (on submit) --------------------- */

    @Async
    public void sendAcknowledgment(ContactInquiry c) {
        String body = """
                <div style="font-family:-apple-system,Segoe UI,Inter,sans-serif;max-width:560px;margin:auto;color:#111827">
                  <p>Hello %s,</p>
                  <p>Thank you for contacting <b>NextGen Labs</b>.</p>
                  <p>We have received your inquiry and our team will review it shortly.</p>
                  <p>A member of our team will respond within <b>24–48 business hours</b>.</p>
                  <p style="margin-top:24px">Regards,<br/>NextGen Labs</p>
                </div>
                """.formatted(InputSanitizer.escapeHtml(c.getFullName()));
        dispatch(c.getId(), c.getEmail(), "Thank You for Contacting NextGen Labs",
                body, "ACKNOWLEDGMENT", "system");
    }

    @Async
    public void sendCompanyNotification(ContactInquiry c) {
        String body = """
                <div style="font-family:-apple-system,Segoe UI,Inter,sans-serif;max-width:560px;margin:auto">
                  <h2 style="color:#0E3A5C">🚀 New Contact Inquiry Received</h2>
                  <table style="width:100%%;border-collapse:collapse;font-size:14px">
                    <tr><td style="padding:8px 0;color:#6B7280">Name</td><td style="padding:8px 0"><b>%s</b></td></tr>
                    <tr><td style="padding:8px 0;color:#6B7280">Email</td><td style="padding:8px 0">%s</td></tr>
                    <tr><td style="padding:8px 0;color:#6B7280">Company</td><td style="padding:8px 0">%s</td></tr>
                    <tr><td style="padding:8px 0;color:#6B7280">Phone</td><td style="padding:8px 0">%s</td></tr>
                    <tr><td style="padding:8px 0;color:#6B7280">Inquiry Type</td><td style="padding:8px 0">%s</td></tr>
                    <tr><td style="padding:8px 0;color:#6B7280;vertical-align:top">Message</td><td style="padding:8px 0;white-space:pre-wrap">%s</td></tr>
                    <tr><td style="padding:8px 0;color:#6B7280">Received</td><td style="padding:8px 0">%s</td></tr>
                  </table>
                </div>
                """.formatted(
                InputSanitizer.escapeHtml(c.getFullName()),
                InputSanitizer.escapeHtml(c.getEmail()),
                InputSanitizer.escapeHtml(orDash(c.getCompanyName())),
                InputSanitizer.escapeHtml(orDash(c.getPhoneNumber())),
                InputSanitizer.escapeHtml(c.getInquiryType().getLabel()),
                InputSanitizer.escapeHtml(c.getMessage()),
                (c.getCreatedAt() == null ? OffsetDateTime.now() : c.getCreatedAt()).format(TS)
        );
        dispatch(c.getId(), props.getEmail().getCompanyInbox(),
                "🚀 New Contact Inquiry Received", body, "NOTIFICATION", "system");
    }

    /* ------------------------- Custom admin reply -------------------------- */

    public EmailMessage sendCustomReply(UUID inquiryId, String to, String subject,
                                        String plainMessage, String actor) {
        String html = """
                <div style="font-family:-apple-system,Segoe UI,Inter,sans-serif;max-width:560px;margin:auto;color:#111827;white-space:pre-wrap">%s</div>
                """.formatted(InputSanitizer.escapeHtml(plainMessage));
        return dispatch(inquiryId, to, subject, html, "CUSTOM_REPLY", actor);
    }

    /* --------------------- Security notifications ------------------------- */

    @Async
    public void sendSecurityNotice(String to, String subject, String innerHtml) {
        if (!enabled()) return;
        String html = """
                <div style="font-family:-apple-system,Segoe UI,Inter,sans-serif;max-width:560px;margin:auto;color:#111827">
                  <h2 style="color:#0E3A5C">%s</h2>
                  %s
                  <p style="margin-top:24px;color:#6B7280;font-size:12px">If this wasn't you, secure your account immediately.</p>
                  <p style="color:#6B7280;font-size:12px">— NextGen Labs Security</p>
                </div>
                """.formatted(InputSanitizer.escapeHtml(subject), innerHtml);
        deliver(to, subject, html, null);
    }

    /* ------------------------------ internals ------------------------------ */

    private EmailMessage dispatch(UUID inquiryId, String to, String subject,
                                  String html, String kind, String sender) {
        String status = "SENT";
        String error = null;

        if (!enabled()) {
            status = "FAILED";
            error = "Email delivery disabled";
        } else {
            boolean delivered = false;
            for (int attempt = 1; attempt <= MAX_ATTEMPTS && !delivered; attempt++) {
                try {
                    delivered = deliver(to, subject, html, null);
                    if (!delivered) {
                        error = "delivery returned false";
                        sleep(attempt * 500L);
                    }
                } catch (Exception ex) {
                    error = ex.getMessage();
                    log.warn("Email attempt {}/{} to {} failed: {}", attempt, MAX_ATTEMPTS, to, error);
                    sleep(attempt * 500L);
                }
            }
            status = delivered ? "SENT" : "FAILED";
        }

        EmailMessage record = new EmailMessage();
        record.setInquiryId(inquiryId);
        record.setRecipient(to);
        record.setSubject(subject);
        record.setBody(html);
        record.setSender(sender);
        record.setKind(kind);
        record.setStatus(status);
        record.setError(error == null ? null : error.substring(0, Math.min(error.length(), 500)));
        return emailRepo.save(record);
    }

    /** Sends one email via Brevo → Resend → SMTP (first configured wins). */
    private boolean deliver(String to, String subject, String html, String replyTo) {
        if (useBrevo()) {
            return sendViaBrevo(to, subject, html, replyTo);
        }
        if (useResend()) {
            return sendViaResend(to, subject, html, replyTo);
        }
        return sendViaSmtp(to, subject, html, replyTo);
    }

    private boolean sendViaBrevo(String to, String subject, String html, String replyTo) {
        try {
            String[] from = parseFrom();
            var payload = new java.util.HashMap<String, Object>();
            payload.put("sender", Map.of("name", from[0], "email", from[1]));
            payload.put("to", List.of(Map.of("email", to)));
            payload.put("subject", subject);
            payload.put("htmlContent", html);
            if (StringUtils.hasText(replyTo)) {
                payload.put("replyTo", Map.of("email", replyTo));
            }
            Map<?, ?> res = http.post()
                    .uri("https://api.brevo.com/v3/smtp/email")
                    .header("api-key", props.getEmail().getBrevoApiKey())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .body(Map.class);
            boolean ok = res != null && res.get("messageId") != null;
            if (ok) log.info("Brevo email '{}' sent to {}", subject, to);
            else log.warn("Brevo email '{}' to {} returned no messageId: {}", subject, to, res);
            return ok;
        } catch (Exception ex) {
            log.error("Brevo send to {} failed: {}", to, ex.getMessage());
            return false;
        }
    }

    private boolean sendViaResend(String to, String subject, String html, String replyTo) {
        try {
            var payload = new java.util.HashMap<String, Object>();
            payload.put("from", props.getEmail().getFrom());
            payload.put("to", List.of(to));
            payload.put("subject", subject);
            payload.put("html", html);
            if (StringUtils.hasText(replyTo)) {
                payload.put("reply_to", replyTo);
            }
            Map<?, ?> res = http.post()
                    .uri("https://api.resend.com/emails")
                    .header("Authorization", "Bearer " + props.getEmail().getResendApiKey())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .body(Map.class);
            boolean ok = res != null && res.get("id") != null;
            if (ok) log.info("Resend email '{}' sent to {}", subject, to);
            else log.warn("Resend email '{}' to {} returned no id: {}", subject, to, res);
            return ok;
        } catch (Exception ex) {
            log.error("Resend send to {} failed: {}", to, ex.getMessage());
            return false;
        }
    }

    private boolean sendViaSmtp(String to, String subject, String html, String replyTo) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper =
                    new MimeMessageHelper(message, false, StandardCharsets.UTF_8.name());
            helper.setFrom(props.getEmail().getFrom());
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            if (StringUtils.hasText(replyTo)) {
                helper.setReplyTo(replyTo);
            }
            mailSender.send(message);
            log.info("SMTP email '{}' sent to {}", subject, to);
            return true;
        } catch (Exception ex) {
            log.error("SMTP send to {} failed: {}", to, ex.getMessage());
            return false;
        }
    }

    private void sleep(long ms) {
        try {
            Thread.sleep(ms);
        } catch (InterruptedException ignored) {
            Thread.currentThread().interrupt();
        }
    }

    private static String orDash(String v) {
        return StringUtils.hasText(v) ? v : "—";
    }
}
