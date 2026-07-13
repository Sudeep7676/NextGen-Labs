package ai.nextgenlabs;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@EnableAsync
@SpringBootApplication
public class NextGenLabsApplication {

    public static void main(String[] args) {
        SpringApplication.run(NextGenLabsApplication.class, args);
    }
}
