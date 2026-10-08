package com.florascan.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.florascan.dto.ChatRequest;
import com.florascan.dto.DiagnosisRequest;
import com.florascan.dto.DiagnosisResponse;
import com.florascan.dto.DosageRequest;
import com.florascan.dto.DosageResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.*;

@Service
public class PlantDiseaseService {

    private static final Logger log = LoggerFactory.getLogger(PlantDiseaseService.class);

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @Value("${gemini.api.model:gemini-2.5-flash}")
    private String geminiModel;

    @Value("${gemini.api.endpoint:https://generativelanguage.googleapis.com/v1beta/models}")
    private String geminiEndpoint;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(20))
            .build();

    /**
     * Analyze plant leaf image using Gemini Vision and return structured pathology report.
     */
    public DiagnosisResponse diagnoseLeaf(DiagnosisRequest request) throws Exception {
        if (geminiApiKey == null || geminiApiKey.isBlank()) {
            throw new IllegalStateException("GEMINI_API_KEY is not configured on the Java backend server. Please set the environment variable.");
        }

        String rawBase64 = cleanBase64(request.getImageBase64());
        String mimeType = (request.getMimeType() != null && !request.getMimeType().isBlank())
                ? request.getMimeType()
                : "image/jpeg";

        // Structured JSON system instructions for botanical diagnosis
        String systemPrompt = """
                You are a world-class Senior Plant Pathologist and Agronomist specialized in computer vision diagnosis of agricultural and horticultural crop diseases.
                Analyze the provided leaf/plant image meticulously:
                1. Identify if it is a plant leaf or crop tissue. If not a plant, set isPlant to false.
                2. Identify crop name and precise pathology/disease name (or Healthy if no pathology).
                3. Classify pathogen type (Fungal, Bacterial, Viral, Pest / Insect, Deficiency, Physiological, Healthy).
                4. Estimate confidence score (0.0 to 1.0), severity level (None, Low, Moderate, Severe, Critical), and affected leaf percentage.
                5. Provide concrete executive summary, key symptoms, biological causes, dual-track organic & chemical treatments with exact dosages, prevention practices, recovery estimate, and contagiousness.
                6. Pinpoint lesion or affected bounding boxes in normalized coordinates [0.0 to 1.0] (ymin, xmin, ymax, xmax).
                Return ONLY valid JSON strictly complying with this schema without markdown code blocks.
                """;

        String userPrompt = "Analyze this plant specimen.";
        if (request.getPlantHint() != null && !request.getPlantHint().isBlank()) {
            userPrompt += " Farmer hint regarding crop: " + request.getPlantHint() + ".";
        }
        if (request.getEnvironmentContext() != null && !request.getEnvironmentContext().isBlank()) {
            userPrompt += " Environmental growing context: " + request.getEnvironmentContext() + ".";
        }

        // Build Gemini REST Payload
        Map<String, Object> inlineData = Map.of(
                "mime_type", mimeType,
                "data", rawBase64
        );

        List<Map<String, Object>> parts = List.of(
                Map.of("inline_data", inlineData),
                Map.of("text", userPrompt)
        );

        Map<String, Object> contents = Map.of(
                "role", "user",
                "parts", parts
        );

        Map<String, Object> systemInstruction = Map.of(
                "parts", List.of(Map.of("text", systemPrompt))
        );

        Map<String, Object> generationConfig = Map.of(
                "response_mime_type", "application/json",
                "temperature", 0.2
        );

        Map<String, Object> requestBody = Map.of(
                "system_instruction", systemInstruction,
                "contents", List.of(contents),
                "generationConfig", generationConfig
        );

        String jsonPayload = objectMapper.writeValueAsString(requestBody);
        String requestUrl = String.format("%s/%s:generateContent?key=%s", geminiEndpoint, geminiModel, geminiApiKey);

        HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create(requestUrl))
                .header("Content-Type", "application/json")
                .header("User-Agent", "FloraScan-Java-Backend")
                .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                .timeout(Duration.ofSeconds(45))
                .build();

        log.info("Sending vision diagnosis request to Gemini API (model: {})...", geminiModel);
        HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            log.error("Gemini API returned error code {}: {}", response.statusCode(), response.body());
            throw new RuntimeException("Gemini API Error (" + response.statusCode() + "): " + response.body());
        }

        // Parse candidate response
        JsonNode root = objectMapper.readTree(response.body());
        JsonNode textNode = root.at("/candidates/0/content/parts/0/text");
        if (textNode.isMissingNode() || textNode.asText().isBlank()) {
            throw new RuntimeException("Empty response received from Gemini model.");
        }

        String rawText = textNode.asText().trim();
        // Strip markdown backticks if present
        if (rawText.startsWith("```json")) {
            rawText = rawText.substring(7);
        } else if (rawText.startsWith("```")) {
            rawText = rawText.substring(3);
        }
        if (rawText.endsWith("```")) {
            rawText = rawText.substring(0, rawText.length() - 3);
        }
        rawText = rawText.trim();

        return objectMapper.readValue(rawText, DiagnosisResponse.class);
    }

    /**
     * Interactive Agronomist AI consultation
     */
    public String chatWithAgronomist(ChatRequest request) throws Exception {
        if (geminiApiKey == null || geminiApiKey.isBlank()) {
            throw new IllegalStateException("GEMINI_API_KEY is not configured.");
        }

        String promptContext = "You are Dr. Flora, a master agronomist and crop physician.\n";
        if (request.getCurrentDiagnosis() != null) {
            promptContext += "The farmer is consulting regarding crop: " + request.getCurrentDiagnosis().getCropName()
                    + ", diagnosed with: " + request.getCurrentDiagnosis().getDiseaseName()
                    + " (Severity: " + request.getCurrentDiagnosis().getSeverityLevel() + ").\n";
        }
        promptContext += "User query: " + request.getMessage();

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(Map.of(
                        "role", "user",
                        "parts", List.of(Map.of("text", promptContext))
                ))
        );

        String jsonPayload = objectMapper.writeValueAsString(requestBody);
        String requestUrl = String.format("%s/%s:generateContent?key=%s", geminiEndpoint, geminiModel, geminiApiKey);

        HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create(requestUrl))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                .build();

        HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());
        JsonNode root = objectMapper.readTree(response.body());
        return root.at("/candidates/0/content/parts/0/text").asText();
    }

    /**
     * Compute agricultural dosage recommendations
     */
    public DosageResponse calculateDosage(DosageRequest request) throws Exception {
        double area = request.getLandArea() <= 0 ? 1.0 : request.getLandArea();
        String unit = request.getAreaUnit() != null ? request.getAreaUnit() : "acres";

        double chemicalQuantity;
        String chemUnit = "ml";
        double waterLiters;

        switch (unit.toLowerCase()) {
            case "hectares":
                chemicalQuantity = area * 2500;
                chemUnit = "ml";
                waterLiters = area * 500;
                break;
            case "acres":
                chemicalQuantity = area * 1000;
                chemUnit = "ml";
                waterLiters = area * 200;
                break;
            case "sq_meters":
                chemicalQuantity = (area / 4046.86) * 1000;
                chemUnit = "ml";
                waterLiters = (area / 4046.86) * 200;
                break;
            default: // pots / small garden
                chemicalQuantity = area * 5;
                chemUnit = "ml";
                waterLiters = area * 2;
                break;
        }

        return DosageResponse.builder()
                .treatmentName(request.getTreatmentName())
                .targetCrop(request.getCropType() != null ? request.getCropType() : "Field Crop")
                .calculatedChemicalQuantity(Math.round(chemicalQuantity * 100.0) / 100.0)
                .chemicalUnit(chemUnit)
                .requiredWaterLiters(Math.round(waterLiters * 100.0) / 100.0)
                .sprayCoverageDescription("Foliar canopy spray ensuring uniform undersurface and upper lamina coverage.")
                .applicationTechnique("Apply early morning (before 9 AM) or dusk to avoid phytotoxicity and UV degradation.")
                .safetyEquipmentRequired(List.of("N95/Chemical respirator mask", "Nitrile safety gloves", "Protective goggles", "Long sleeve overalls"))
                .reEntryInterval("24 to 48 hours post-application")
                .preHarvestInterval("14 days before harvest")
                .environmentalCautions(List.of("Toxic to aquatic ecosystems; keep away from drainage canals", "Do not spray during active pollinator bee foraging hours"))
                .build();
    }

    private String cleanBase64(String input) {
        if (input == null) return "";
        if (input.contains(",")) {
            return input.substring(input.indexOf(",") + 1);
        }
        return input;
    }
}
