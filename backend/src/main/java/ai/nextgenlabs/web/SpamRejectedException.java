package ai.nextgenlabs.web;

public class SpamRejectedException extends RuntimeException {
    public SpamRejectedException(String message) {
        super(message);
    }
}
