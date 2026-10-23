package com.skillbridge.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    private static final Logger log =
            LoggerFactory.getLogger(GeminiService.class);

    private final RestClient restClient = RestClient.create();

    @Value("${gemini.api.key}")
    private String apiKey;

    public String generateResponse(String prompt) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException(
                    "Gemini API key is missing. Check your application configuration."
            );
        }

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of(
                                "parts", List.of(
                                        Map.of("text", prompt)
                                )
                        )
                ),
                "generationConfig", Map.of(
                        "responseMimeType", "application/json",
                        "temperature", 0.3
                )
        );

        for (int attempt = 1; attempt <= 3; attempt++) {
            try {
                Map<?, ?> response = restClient.post()
                        .uri("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent")
                        .header("x-goog-api-key", apiKey)
                        .header("Content-Type", "application/json")
                        .body(requestBody)
                        .retrieve()
                        .body(Map.class);

                if (response == null
                        || !(response.get("candidates") instanceof List<?> candidates)
                        || candidates.isEmpty()) {
                    throw new IllegalStateException(
                            "Gemini returned no candidates. Check model access and API limits."
                    );
                }

                Object candidateObject = candidates.get(0);

                if (!(candidateObject instanceof Map<?, ?> candidate)
                        || !(candidate.get("content") instanceof Map<?, ?> content)
                        || !(content.get("parts") instanceof List<?> parts)
                        || parts.isEmpty()
                        || !(parts.get(0) instanceof Map<?, ?> part)
                        || !(part.get("text") instanceof String text)) {
                    throw new IllegalStateException(
                            "Gemini response did not contain the expected text."
                    );
                }

                return text;

            } catch (RestClientResponseException exception) {
                HttpStatusCode status = exception.getStatusCode();

                boolean temporaryError =
                        status.value() == 429 || status.is5xxServerError();

                log.error(
                        "Gemini API request failed: HTTP {}, attempt {}/3, response: {}",
                        status.value(),
                        attempt,
                        exception.getResponseBodyAsString()
                );

                if (!temporaryError || attempt == 3) {
                    throw new IllegalStateException(
                            temporaryError
                                    ? "Gemini is temporarily unavailable. Please try again shortly."
                                    : "Gemini API rejected the request. Check the backend logs.",
                            exception
                    );
                }

                try {
                    Thread.sleep(attempt * 1500L);
                } catch (InterruptedException interruptedException) {
                    Thread.currentThread().interrupt();
                    throw new IllegalStateException(
                            "Gemini request was interrupted.",
                            interruptedException
                    );
                }
            }
        }

        throw new IllegalStateException("Gemini could not generate a response.");
    }
}