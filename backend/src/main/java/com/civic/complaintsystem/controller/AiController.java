package com.civic.complaintsystem.controller;

import com.civic.complaintsystem.ai.OllamaService;
import com.civic.complaintsystem.dto.AiDtos.*;
import com.civic.complaintsystem.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final OllamaService ollamaService;
    private final AdminService adminService;

    /** Feature 1: rewrite/improve complaint text before submit */
    @PostMapping("/rewrite")
    public ResponseEntity<AiTextResponse> rewrite(@Valid @RequestBody TextRequest request) {
        String result = ollamaService.rewriteComplaint(request.getText());
        return ResponseEntity.ok(AiTextResponse.builder().result(result).build());
    }

    /** Feature 2: category auto-prediction (live suggestion while typing) */
    @PostMapping("/category")
    public ResponseEntity<AiTextResponse> category(@Valid @RequestBody TextRequest request) {
        var category = ollamaService.predictCategory(request.getText());
        return ResponseEntity.ok(AiTextResponse.builder().result(category.name()).build());
    }

    /** Feature 3: priority detection */
    @PostMapping("/priority")
    public ResponseEntity<AiTextResponse> priority(@Valid @RequestBody TextRequest request) {
        var priority = ollamaService.predictPriority(request.getText());
        return ResponseEntity.ok(AiTextResponse.builder().result(priority.name()).build());
    }

    /** Feature 4: chat assistant */
    @PostMapping("/chat")
    public ResponseEntity<AiTextResponse> chat(@Valid @RequestBody ChatRequest request) {
        String result = ollamaService.chat(request.getMessage());
        return ResponseEntity.ok(AiTextResponse.builder().result(result).build());
    }

    /** Feature 5: admin complaint summary */
    @GetMapping("/summary")
    public ResponseEntity<SummaryResponse> summary() {
        String summary = adminService.generateAiSummary();
        long total = (long) adminService.getDashboardStats().get("totalComplaints");
        return ResponseEntity.ok(SummaryResponse.builder().summary(summary).totalComplaints(total).build());
    }
}
