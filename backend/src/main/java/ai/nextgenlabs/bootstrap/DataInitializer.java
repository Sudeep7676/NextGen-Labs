package ai.nextgenlabs.bootstrap;

import ai.nextgenlabs.config.AppProperties;
import ai.nextgenlabs.domain.UserAccount;
import ai.nextgenlabs.domain.enums.Role;
import ai.nextgenlabs.repository.UserAccountRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.ApplicationArguments;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class DataInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserAccountRepository users;
    private final PasswordEncoder passwordEncoder;
    private final AppProperties props;

    public DataInitializer(UserAccountRepository users,
                           PasswordEncoder passwordEncoder,
                           AppProperties props) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.props = props;
    }

    @Override
    public void run(ApplicationArguments args) {
        String email = props.getBootstrap().getSuperAdminEmail();
        String password = props.getBootstrap().getSuperAdminPassword();

        if (!StringUtils.hasText(email) || !StringUtils.hasText(password)) {
            return;
        }
        if (users.existsByEmailIgnoreCase(email)) {
            return;
        }

        UserAccount admin = new UserAccount();
        admin.setEmail(email.toLowerCase());
        admin.setPasswordHash(passwordEncoder.encode(password));
        admin.setFullName("Super Admin");
        admin.setRole(Role.SUPER_ADMIN);
        admin.setEnabled(true);
        admin.setMfaEnabled(false); // must complete MFA enrollment on first login
        admin.setPasswordUpdatedAt(java.time.OffsetDateTime.now());
        users.save(admin);

        log.info("Seeded SUPER_ADMIN account: {}", email);
    }
}
