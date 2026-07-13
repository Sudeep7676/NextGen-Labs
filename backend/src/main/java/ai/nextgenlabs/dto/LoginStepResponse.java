package ai.nextgenlabs.dto;

/**
 * Result of the password step. The client must complete MFA (verify or
 * first-time setup) using the challengeToken before any JWT is issued.
 */
public record LoginStepResponse(
        boolean mfaRequired,
        boolean mfaEnrolled,
        String challengeToken,
        String message
) {
}
