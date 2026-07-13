package ai.nextgenlabs.dto;

public record DashboardStats(
        long total,
        long fresh,        // NEW
        long inReview,
        long responded,
        long followUp,
        long closed,
        double responseRate
) {
}
