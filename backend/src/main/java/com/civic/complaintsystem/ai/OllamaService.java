package com.civic.complaintsystem.ai;

import com.civic.complaintsystem.entity.ComplaintCategory;
import com.civic.complaintsystem.entity.Priority;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.Map;

/**
 * Wraps calls to a local Ollama instance (http://ollama:11434 in docker, http://localhost:11434 locally).
 * Every method degrades gracefully (rule-based fallback) if Ollama is unreachable or disabled,
 * so the rest of the app never breaks because the AI container is down.
 */
@Slf4j
@Service
public class OllamaService {

    private final WebClient webClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${app.ai.model}")
    private String model;

    @Value("${app.ai.enabled}")
    private boolean aiEnabled;

    public OllamaService(@Value("${app.ai.base-url}") String baseUrl) {
        this.webClient = WebClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    /** Low level call to /api/generate (non-streaming). Returns raw text response from the model. */
    private String generate(String prompt) {
        if (!aiEnabled) {
            throw new IllegalStateException("AI disabled");
        }
        try {
            Map<String, Object> body = Map.of(
                    "model", model,
                    "prompt", prompt,
                    "stream", false
            );

            String response = webClient.post()
                    .uri("/api/generate")
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block(Duration.ofSeconds(30));

            JsonNode node = objectMapper.readTree(response);
            return node.path("response").asText("").trim();
        } catch (Exception e) {
            log.warn("Ollama call failed, falling back to rule-based logic: {}", e.getMessage());
            throw new RuntimeException(e);
        }
    }

    // ---------- Feature 1: Rewrite / improve complaint description ----------
    public String rewriteComplaint(String rawText) {
        try {
            String prompt = """
                    Rewrite the following civic complaint into one clear, professional,
                    concise sentence suitable for a government complaint record.
                    Do not add facts that are not present in the original text.
                    Only return the rewritten sentence, nothing else.

                    Complaint: "%s"
                    """.formatted(rawText);
            String result = generate(prompt);
            return result.isBlank() ? rawText : stripQuotes(result);
        } catch (Exception e) {
            return rawText; // graceful fallback: return original text unchanged
        }
    }

    // ---------- Feature 2: Category prediction ----------
    public ComplaintCategory predictCategory(String text) {
        try {
            String prompt = """
                    Classify the following civic complaint into exactly ONE of these categories:
                    GARBAGE, ROAD_DAMAGE, WATER_SUPPLY, ELECTRICITY, STREET_LIGHTS, SEWAGE, PUBLIC_TRANSPORT, OTHER.
                    Reply with ONLY the category word, nothing else.

                    Complaint: "%s"
                    """.formatted(text);
            String result = generate(prompt).toUpperCase().replaceAll("[^A-Z_]", "");
            return ComplaintCategory.valueOf(result);
        } catch (Exception e) {
            return ruleBasedCategory(text);
        }
    }

    private ComplaintCategory ruleBasedCategory(String text) {
        String t = text.toLowerCase();
        if (t.contains("garbage") || t.contains("trash") || t.contains("waste")) return ComplaintCategory.GARBAGE;
        if (t.contains("road") || t.contains("pothole")) return ComplaintCategory.ROAD_DAMAGE;
        if (t.contains("water") || t.contains("pipeline") || t.contains("pipe")) return ComplaintCategory.WATER_SUPPLY;
        if (t.contains("electric") || t.contains("power") || t.contains("transformer")) return ComplaintCategory.ELECTRICITY;
        if (t.contains("street light") || t.contains("streetlight") || t.contains("lamp")) return ComplaintCategory.STREET_LIGHTS;
        if (t.contains("sewage") || t.contains("drain")) return ComplaintCategory.SEWAGE;
        if (t.contains("bus") || t.contains("transport") || t.contains("auto")) return ComplaintCategory.PUBLIC_TRANSPORT;
        return ComplaintCategory.OTHER;
    }

    // ---------- Feature 3: Priority detection ----------
    public Priority predictPriority(String text) {
        try {
            String prompt = """
                    Classify the urgency of the following civic complaint as exactly ONE word: LOW, MEDIUM, or HIGH.
                    Consider risk to safety/health (e.g. burst pipelines, live wires, major accidents) as HIGH.
                    Reply with ONLY the word.

                    Complaint: "%s"
                    """.formatted(text);
            String result = generate(prompt).toUpperCase().replaceAll("[^A-Z]", "");
            return Priority.valueOf(result);
        } catch (Exception e) {
            return ruleBasedPriority(text);
        }
    }

    private Priority ruleBasedPriority(String text) {
        String t = text.toLowerCase();
        if (t.contains("burst") || t.contains("fire") || t.contains("live wire") || t.contains("accident") || t.contains("danger")) {
            return Priority.HIGH;
        }
        if (t.contains("not working") || t.contains("broken") || t.contains("leak")) {
            return Priority.MEDIUM;
        }
        return Priority.LOW;
    }

    // ---------- Feature 4: Chat assistant ----------
    public String chat(String message) {
        try {
            String prompt = """
                    You are a helpful assistant for a civic complaint management portal.
                    Answer the citizen's question in 1-3 short sentences, in a friendly and clear way.
                    If the question is about complaint tracking, mention the "Complaint History" section.
                    If it's about raising a complaint, mention the "Raise Complaint" button on the dashboard.

                    Question: "%s"
                    """.formatted(message);
            String result = generate(prompt);
            return result.isBlank() ? fallbackChatAnswer(message) : result;
        } catch (Exception e) {
            return fallbackChatAnswer(message);
        }
    }

    private String fallbackChatAnswer(String message) {
        String m = message.toLowerCase();
        if (m.contains("track")) return "You can track your complaint status in the 'Complaint History' section of your dashboard.";
        if (m.contains("raise") || m.contains("complaint") && m.contains("how")) return "Click the 'Raise Complaint' button on your dashboard, fill the form, and submit.";
        if (m.contains("delete")) return "You can request deletion of a complaint from the complaint details page; admins can also remove it.";
        return "I'm here to help with complaint tracking, raising new complaints, or general questions about this portal.";
    }

    // ---------- Feature 5: Summary for admin ----------
    public String summarize(String aggregatedText) {
        try {
            String prompt = """
                    Summarize the following civic complaint statistics in 2-3 short sentences
                    for a municipal admin dashboard. Be concise and factual.

                    Data: %s
                    """.formatted(aggregatedText);
            String result = generate(prompt);
            return result.isBlank() ? aggregatedText : result;
        } catch (Exception e) {
            return aggregatedText; // fallback: just show the raw stats
        }
    }

    // ---------- Bonus: spam detection ----------
    public boolean isLikelySpam(String title, String description) {
        try {
            String prompt = """
                    Decide if the following civic complaint text looks like spam, gibberish,
                    or unrelated to civic issues (roads, water, electricity, garbage, etc).
                    Reply with ONLY "YES" or "NO".

                    Title: "%s"
                    Description: "%s"
                    """.formatted(title, description);
            String result = generate(prompt).toUpperCase();
            return result.contains("YES");
        } catch (Exception e) {
            // fallback heuristic: too short or no letters
            String combined = (title + " " + description).trim();
            return combined.length() < 8 || !combined.matches(".*[a-zA-Z].*");
        }
    }

    private String stripQuotes(String text) {
        String t = text.trim();
        if (t.startsWith("\"") && t.endsWith("\"") && t.length() > 1) {
            t = t.substring(1, t.length() - 1);
        }
        return t;
    }
}
