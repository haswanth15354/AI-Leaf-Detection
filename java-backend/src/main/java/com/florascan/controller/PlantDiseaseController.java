package com.florascan.controller;

import com.florascan.dto.ChatRequest;
import com.florascan.dto.DiagnosisRequest;
import com.florascan.dto.DiagnosisResponse;
import com.florascan.dto.DosageRequest;
import com.florascan.dto.DosageResponse;
import com.florascan.service.PlantDiseaseService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Base64;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // Global or configured via CorsConfig
public class PlantDiseaseController {

    private static final Logger log = LoggerFactory.getLogger(PlantDiseaseController.class);
    private final PlantDiseaseService diseaseService;

    public PlantDiseaseController(PlantDiseaseService diseaseService) {
        this.diseaseService = diseaseService;
    }

    /**
     * Health check endpoint for frontend connection verification
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "backend", "Spring Boot 3 (Java 17)",
                "service", "FloraScan Plant Disease Detection API",
                "geminiModel", "gemini-2.5-flash",
                "timestamp", System.currentTimeMillis()
        ));
    }

    /**
     * Diagnose plant leaf image via JSON payload containing Base64 string
     */
    @PostMapping("/diagnose")
    public ResponseEntity<?> diagnoseLeaf(@RequestBody DiagnosisRequest request) {
        try {
            if (request.getImageBase64() == null || request.getImageBase64().isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Missing imageBase64 data in request body."));
            }

            log.info("Received plant disease diagnosis request. Crop hint: '{}'", request.getPlantHint());
            DiagnosisResponse response = diseaseService.diagnoseLeaf(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Diagnosis error:", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Failed to analyze plant disease."));
        }
    }

    /**
     * Diagnose plant leaf image via direct Multipart file upload (Alternative to Base64)
     */
    @PostMapping("/diagnose/upload")
    public ResponseEntity<?> diagnoseLeafUpload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "plantHint", required = false) String plantHint,
            @RequestParam(value = "environmentContext", required = false) String environmentContext
    ) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Uploaded file is empty."));
            }

            byte[] bytes = file.getBytes();
            String base64 = Base64.getEncoder().encodeToString(bytes);
            String mimeType = file.getContentType() != null ? file.getContentType() : "image/jpeg";

            DiagnosisRequest request = DiagnosisRequest.builder()
                    .imageBase64(base64)
                    .mimeType(mimeType)
                    .plantHint(plantHint)
                    .environmentContext(environmentContext)
                    .build();

            DiagnosisResponse response = diseaseService.diagnoseLeaf(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Multipart diagnosis error:", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Real-time Agronomist chat consultation
     */
    @PostMapping("/chat")
    public ResponseEntity<?> chat(@RequestBody ChatRequest request) {
        try {
            if (request.getMessage() == null || request.getMessage().isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Message cannot be empty."));
            }

            String answer = diseaseService.chatWithAgronomist(request);
            return ResponseEntity.ok(Map.of("response", answer));
        } catch (Exception e) {
            log.error("Chat error:", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Scientific chemical / organic spray dosage calculator
     */
    @PostMapping("/calculate-dosage")
    public ResponseEntity<?> calculateDosage(@RequestBody DosageRequest request) {
        try {
            DosageResponse response = diseaseService.calculateDosage(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Dosage calculation error:", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
