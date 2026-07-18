package com.civic.complaintsystem.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.List;

public class AiDtos {

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class TextRequest {
        @NotBlank
        private String text;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class ChatRequest {
        @NotBlank
        private String message;
    }

    @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
    public static class AiTextResponse {
        private String result;
    }

    @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
    public static class SummaryResponse {
        private String summary;
        private long totalComplaints;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class SpamCheckResponse {
        private boolean spam;
        private String reason;
    }
}
