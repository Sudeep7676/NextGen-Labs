package ai.nextgenlabs.domain.enums;

public enum InquiryType {
    BOOK_DEMO("Book Demo"),
    PRODUCT_INQUIRY("Product Inquiry"),
    PARTNERSHIP_INQUIRY("Partnership Inquiry"),
    CAREER_OPPORTUNITY("Career Opportunity"),
    TECHNICAL_SUPPORT("Technical Support"),
    GENERAL_INQUIRY("General Inquiry");

    private final String label;

    InquiryType(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
