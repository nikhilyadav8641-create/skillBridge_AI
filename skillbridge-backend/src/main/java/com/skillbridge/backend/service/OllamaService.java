package com.skillbridge.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.net.http.HttpClient;
import java.time.Duration;
import java.util.Map;

@Service
public class OllamaService {

    private static final Logger log =
            LoggerFactory.getLogger(OllamaService.class);

    private static final String MODEL = "qwen2.5:7b";

    /*
     * IMPORTANT: keep NUM_CTX identical for every request.
     * If it changes between calls, Ollama reloads the model (5-10 s lost).
     */
    private static final int NUM_CTX = 6144;

    // Safety cap used when the caller does not pass its own limit.
    private static final int DEFAULT_MAX_TOKENS = 1024;

    // Keep the model in memory between requests.
    private static final String KEEP_ALIVE = "30m";

    private final RestClient restClient;

    public OllamaService() {
        HttpClient httpClient = HttpClient.newBuilder()
                // Ollama speaks HTTP/1.1; avoids h2c upgrade problems
                .version(HttpClient.Version.HTTP_1_1)
                .connectTimeout(Duration.ofSeconds(5))
                .build();

        JdkClientHttpRequestFactory requestFactory =
                new JdkClientHttpRequestFactory(httpClient);
        requestFactory.setReadTimeout(Duration.ofSeconds(180));

        this.restClient = RestClient.builder()
                .baseUrl("http://localhost:11434")
                .requestFactory(requestFactory)
                .build();
    }

    // Same signature as before, so existing callers keep working.
    public String generate(String prompt) {
        return generate(prompt, DEFAULT_MAX_TOKENS);
    }

    public String generate(String prompt, int maxTokens) {
        try {
            Map<?, ?> response = restClient.post()
                    .uri("/api/generate")
                    .body(Map.of(
                            "model", MODEL,
                            "prompt", prompt,
                            "stream", false,
                            "format", "json",
                            "keep_alive", KEEP_ALIVE,
                            "options", Map.of(
                                    "temperature", 0.1,
                                    "num_ctx", NUM_CTX,
                                    "num_predict", maxTokens
                            )
                    ))
                    .retrieve()
                    .body(Map.class);

            if (response == null) {
                throw new IllegalStateException(
                        "Ollama returned an empty HTTP response."
                );
            }

            Object generatedText = response.get("response");

            if (!(generatedText instanceof String text)
                    || text.isBlank()) {
                throw new IllegalStateException(
                        "Ollama returned no generated text. Response: "
                                + response
                );
            }

            logMetrics(response, maxTokens);

            return text;

        } catch (Exception exception) {
            throw new IllegalStateException(
                    "Ollama generation failed. Check that Ollama is running, "
                            + "the model exists, and the response is valid. Details: "
                            + exception.getMessage(),
                    exception
            );
        }
    }

    private void logMetrics(Map<?, ?> response, int maxTokens) {
        long promptTokens = toLong(response.get("prompt_eval_count"));
        long outputTokens = toLong(response.get("eval_count"));
        long totalMs = toLong(response.get("total_duration")) / 1_000_000L;
        long loadMs = toLong(response.get("load_duration")) / 1_000_000L;

        log.info(
                "Ollama: prompt_tokens={}, output_tokens={}, total={} ms, model_load={} ms",
                promptTokens, outputTokens, totalMs, loadMs
        );

        if ("length".equals(response.get("done_reason"))) {
            log.warn(
                    "Ollama stopped at the num_predict limit ({}). "
                            + "The JSON may be cut off; shorten the prompt "
                            + "output or raise the limit.",
                    maxTokens
            );
        }
    }

    private long toLong(Object value) {
        return value instanceof Number number ? number.longValue() : 0L;
    }

    /*
     * Loads the model into memory as soon as the backend starts, so the
     * first user request does not pay the 5-10 s model load time.
     */
    @EventListener(ApplicationReadyEvent.class)
    public void warmUp() {
        Thread thread = new Thread(() -> {
            try {
                restClient.post()
                        .uri("/api/generate")
                        .body(Map.of(
                                "model", MODEL,
                                "keep_alive", KEEP_ALIVE,
                                "options", Map.of("num_ctx", NUM_CTX)
                        ))
                        .retrieve()
                        .toBodilessEntity();

                log.info("Ollama model {} warmed up.", MODEL);

            } catch (Exception exception) {
                log.warn("Ollama warm-up skipped: {}", exception.getMessage());
            }
        }, "ollama-warmup");

        thread.setDaemon(true);
        thread.start();
    }
}