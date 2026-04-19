package com.mdh.thp.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/tts")
@CrossOrigin(origins = "*")
public class TTSController {

    @Value("${elevenlabs.api.key}")
    private String apiKey;

    @Value("${elevenlabs.voice.id:21m00Tcm4TlvDq8ikWAM}")
    private String voiceId;

    @Value("${elevenlabs.model.id:eleven_multilingual_v2}")
    private String modelId;

    @PostMapping("/speak")
    public ResponseEntity<?> speak(@RequestBody Map<String, String> body) {
        try {
            String text = body.get("text");

            if (text == null || text.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "Text is required."
                ));
            }

            String safeText = text.trim();
            if (safeText.length() > 3500) {
                safeText = safeText.substring(0, 3500);
            }

            String url = "https://api.elevenlabs.io/v1/text-to-speech/" + voiceId + "?output_format=mp3_44100_128";

            RestTemplate restTemplate = new RestTemplate();

            HttpHeaders headers = new HttpHeaders();
            headers.set("xi-api-key", apiKey);
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setAccept(MediaType.parseMediaTypes("audio/mpeg"));

            Map<String, Object> voiceSettings = new HashMap<>();
            voiceSettings.put("stability", 0.35);
            voiceSettings.put("similarity_boost", 0.80);
            voiceSettings.put("style", 0.45);
            voiceSettings.put("use_speaker_boost", true);

            Map<String, Object> payload = new HashMap<>();
            payload.put("text", safeText);
            payload.put("model_id", modelId);
            payload.put("voice_settings", voiceSettings);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

            ResponseEntity<byte[]> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    request,
                    byte[].class
            );

            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(Map.of(
                        "error", "ElevenLabs request failed."
                ));
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.valueOf("audio/mpeg"))
                    .body(response.getBody());

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "TTS generation failed.",
                    "details", e.getMessage()
            ));
        }
    }
}