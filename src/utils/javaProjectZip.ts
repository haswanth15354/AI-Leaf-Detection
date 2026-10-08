import JSZip from 'jszip';

export async function generateJavaProjectZip(): Promise<Blob> {
  const zip = new JSZip();

  // Root files
  zip.file(
    'pom.xml',
    `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.3.4</version>
        <relativePath/>
    </parent>
    <groupId>com.florascan</groupId>
    <artifactId>plant-disease-detection</artifactId>
    <version>1.0.0</version>
    <name>FloraScan Plant Disease Detection</name>
    <description>AI-Powered Plant Disease Pathology System with Spring Boot and Google Gemini</description>

    <properties>
        <java.version>17</java.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        <dependency>
            <groupId>com.fasterxml.jackson.core</groupId>
            <artifactId>jackson-databind</artifactId>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-devtools</artifactId>
            <scope>runtime</scope>
            <optional>true</optional>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>`
  );

  zip.file(
    'Dockerfile',
    `FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=build /app/target/plant-disease-detection-1.0.0.jar app.jar
ENV PORT=8080
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]`
  );

  zip.file(
    'README.md',
    `# FloraScan Plant Disease Detection - Java Spring Boot Backend

## Quick Start
1. Set Gemini API key:
   export GEMINI_API_KEY="your_api_key_here"

2. Build and run:
   mvn clean package
   mvn spring-boot:run

Server runs on: http://localhost:8080

## Endpoints
- GET  /api/health
- POST /api/diagnose
- POST /api/diagnose/upload
- POST /api/chat
- POST /api/calculate-dosage`
  );

  // Resources
  const resources = zip.folder('src/main/resources');
  resources?.file(
    'application.properties',
    `server.port=8080
spring.servlet.multipart.max-file-size=50MB
spring.servlet.multipart.max-request-size=50MB
gemini.api.key=\${GEMINI_API_KEY:}
gemini.api.model=gemini-2.5-flash
gemini.api.endpoint=https://generativelanguage.googleapis.com/v1beta/models
cors.allowed-origins=http://localhost:3000,http://localhost:5173
logging.level.root=INFO
logging.level.com.florascan=DEBUG`
  );

  // Java files
  const javaFolder = zip.folder('src/main/java/com/florascan');
  
  javaFolder?.file(
    'PlantDiseaseApplication.java',
    `package com.florascan;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class PlantDiseaseApplication {
    public static void main(String[] args) {
        SpringApplication.run(PlantDiseaseApplication.class, args);
        System.out.println("FloraScan Spring Boot Backend active on port 8080!");
    }
}`
  );

  // Controller
  const controllerFolder = javaFolder?.folder('controller');
  controllerFolder?.file(
    'PlantDiseaseController.java',
    `package com.florascan.controller;

import com.florascan.dto.*;
import com.florascan.service.PlantDiseaseService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Base64;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class PlantDiseaseController {

    private final PlantDiseaseService diseaseService;

    public PlantDiseaseController(PlantDiseaseService diseaseService) {
        this.diseaseService = diseaseService;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "backend", "Spring Boot 3 (Java 17)",
            "geminiModel", "gemini-2.5-flash"
        ));
    }

    @PostMapping("/diagnose")
    public ResponseEntity<?> diagnoseLeaf(@RequestBody DiagnosisRequest request) {
        try {
            if (request.getImageBase64() == null || request.getImageBase64().isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Missing imageBase64"));
            }
            DiagnosisResponse response = diseaseService.diagnoseLeaf(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/diagnose/upload")
    public ResponseEntity<?> diagnoseUpload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "plantHint", required = false) String plantHint) {
        try {
            byte[] bytes = file.getBytes();
            String base64 = Base64.getEncoder().encodeToString(bytes);
            DiagnosisRequest req = DiagnosisRequest.builder()
                    .imageBase64(base64)
                    .mimeType(file.getContentType())
                    .plantHint(plantHint)
                    .build();
            return ResponseEntity.ok(diseaseService.diagnoseLeaf(req));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/chat")
    public ResponseEntity<?> chat(@RequestBody ChatRequest request) {
        try {
            return ResponseEntity.ok(Map.of("response", diseaseService.chatWithAgronomist(request)));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/calculate-dosage")
    public ResponseEntity<?> calculateDosage(@RequestBody DosageRequest request) {
        try {
            return ResponseEntity.ok(diseaseService.calculateDosage(request));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}`
  );

  controllerFolder?.file(
    'AuthController.java',
    `package com.florascan.controller;

import com.florascan.dto.*;
import com.florascan.entity.UserEntity;
import com.florascan.security.JwtUtils;
import com.florascan.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;
    private final JwtUtils jwtUtils;

    public AuthController(AuthService authService, JwtUtils jwtUtils) {
        this.authService = authService;
        this.jwtUtils = jwtUtils;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            AuthResponse response = authService.register(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Missing token"));
        }
        String token = authHeader.substring(7);
        if (!jwtUtils.validateToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid or expired token"));
        }
        String email = jwtUtils.getEmailFromToken(token);
        UserEntity user = authService.getUserByEmail(email);
        return ResponseEntity.ok(user);
    }
}`
  );

  // Security
  const securityFolder = javaFolder?.folder('security');
  securityFolder?.file(
    'JwtUtils.java',
    `package com.florascan.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Component
public class JwtUtils {
    @Value("\${jwt.secret:FloraScanSecuredSecretKeyForAgriculturalApp2026}")
    private String jwtSecret;

    public String generateToken(String email, String role) {
        long now = System.currentTimeMillis();
        long expiry = now + (24 * 60 * 60 * 1000);
        String header = Base64.getUrlEncoder().withoutPadding().encodeToString("{\\"alg\\":\\"HS256\\",\\"typ\\":\\"JWT\\"}".getBytes(StandardCharsets.UTF_8));
        String payloadJson = String.format("{\\"sub\\":\\"%s\\",\\"role\\":\\"%s\\",\\"iat\\":%d,\\"exp\\":%d}", email, role, now / 1000, expiry / 1000);
        String payload = Base64.getUrlEncoder().withoutPadding().encodeToString(payloadJson.getBytes(StandardCharsets.UTF_8));
        String signature = sign(header + "." + payload);
        return header + "." + payload + "." + signature;
    }

    public boolean validateToken(String token) {
        try {
            String[] parts = token.split("\\\\.");
            return parts.length == 3 && sign(parts[0] + "." + parts[1]).equals(parts[2]);
        } catch (Exception e) {
            return false;
        }
    }

    public String getEmailFromToken(String token) {
        try {
            String[] parts = token.split("\\\\.");
            String payloadJson = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
            int subIdx = payloadJson.indexOf("\\"sub\\":\\"");
            if (subIdx != -1) {
                int start = subIdx + 7;
                int end = payloadJson.indexOf("\\"", start);
                return payloadJson.substring(start, end);
            }
        } catch (Exception ignored) {}
        return null;
    }

    private String sign(String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(jwtSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(mac.doFinal(data.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}`
  );

  // Entity & Repository
  const entityFolder = javaFolder?.folder('entity');
  entityFolder?.file(
    'UserEntity.java',
    `package com.florascan.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class UserEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true, nullable = false)
    private String email;
    private String password;
    private String fullName;
    private String farmName;
    private String role;
    private LocalDateTime createdAt;
}`
  );

  const repositoryFolder = javaFolder?.folder('repository');
  repositoryFolder?.file(
    'UserRepository.java',
    `package com.florascan.repository;

import com.florascan.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<UserEntity, Long> {
    Optional<UserEntity> findByEmail(String email);
    boolean existsByEmail(String email);
}`
  );

  // Service
  const serviceFolder = javaFolder?.folder('service');
  serviceFolder?.file(
    'PlantDiseaseService.java',
    `package com.florascan.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.florascan.dto.*;
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

    @Value("\${gemini.api.key}")
    private String geminiApiKey;

    @Value("\${gemini.api.model:gemini-2.5-flash}")
    private String geminiModel;

    @Value("\${gemini.api.endpoint:https://generativelanguage.googleapis.com/v1beta/models}")
    private String geminiEndpoint;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(20))
            .build();

    public DiagnosisResponse diagnoseLeaf(DiagnosisRequest request) throws Exception {
        if (geminiApiKey == null || geminiApiKey.isBlank()) {
            throw new IllegalStateException("GEMINI_API_KEY environment variable is missing.");
        }

        String rawBase64 = cleanBase64(request.getImageBase64());
        String mimeType = (request.getMimeType() != null) ? request.getMimeType() : "image/jpeg";

        String systemPrompt = "You are a Master Plant Pathologist. Analyze the plant leaf image and return strictly valid JSON matching botanical pathology schema.";

        Map<String, Object> inlineData = Map.of("mime_type", mimeType, "data", rawBase64);
        List<Map<String, Object>> parts = List.of(
            Map.of("inline_data", inlineData),
            Map.of("text", "Diagnose this leaf pathology: " + (request.getPlantHint() != null ? request.getPlantHint() : ""))
        );

        Map<String, Object> requestBody = Map.of(
            "system_instruction", Map.of("parts", List.of(Map.of("text", systemPrompt))),
            "contents", List.of(Map.of("role", "user", "parts", parts)),
            "generationConfig", Map.of("response_mime_type", "application/json", "temperature", 0.2)
        );

        String jsonPayload = objectMapper.writeValueAsString(requestBody);
        String url = String.format("%s/%s:generateContent?key=%s", geminiEndpoint, geminiModel, geminiApiKey);

        HttpRequest req = HttpRequest.newBuilder()
            .uri(URI.create(url))
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
            .timeout(Duration.ofSeconds(45))
            .build();

        HttpResponse<String> resp = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
        if (resp.statusCode() != 200) {
            throw new RuntimeException("Gemini error (" + resp.statusCode() + "): " + resp.body());
        }

        JsonNode root = objectMapper.readTree(resp.body());
        String text = root.at("/candidates/0/content/parts/0/text").asText();
        return objectMapper.readValue(text, DiagnosisResponse.class);
    }

    public String chatWithAgronomist(ChatRequest request) throws Exception {
        String url = String.format("%s/%s:generateContent?key=%s", geminiEndpoint, geminiModel, geminiApiKey);
        Map<String, Object> payload = Map.of("contents", List.of(Map.of("parts", List.of(Map.of("text", "Plant advisory: " + request.getMessage())))));
        HttpRequest req = HttpRequest.newBuilder().uri(URI.create(url)).header("Content-Type", "application/json").POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(payload))).build();
        HttpResponse<String> resp = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
        return objectMapper.readTree(resp.body()).at("/candidates/0/content/parts/0/text").asText();
    }

    public DosageResponse calculateDosage(DosageRequest request) {
        double area = request.getLandArea() <= 0 ? 1.0 : request.getLandArea();
        return DosageResponse.builder()
            .treatmentName(request.getTreatmentName())
            .targetCrop(request.getCropType() != null ? request.getCropType() : "Crop")
            .calculatedChemicalQuantity(area * 1000)
            .chemicalUnit("ml")
            .requiredWaterLiters(area * 200)
            .sprayCoverageDescription("Uniform foliar application")
            .build();
    }

    private String cleanBase64(String input) {
        if (input == null) return "";
        return input.contains(",") ? input.substring(input.indexOf(",") + 1) : input;
    }
}`
  );

  // DTOs
  const dtoFolder = javaFolder?.folder('dto');
  dtoFolder?.file(
    'DiagnosisRequest.java',
    `package com.florascan.dto;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DiagnosisRequest {
    private String imageBase64;
    private String mimeType;
    private String plantHint;
    private String environmentContext;
}`
  );

  dtoFolder?.file(
    'AuthRequest.java',
    `package com.florascan.dto;
import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AuthRequest {
    private String email;
    private String password;
}`
  );

  dtoFolder?.file(
    'RegisterRequest.java',
    `package com.florascan.dto;
import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class RegisterRequest {
    private String fullName;
    private String email;
    private String password;
    private String farmName;
    private String role;
}`
  );

  dtoFolder?.file(
    'AuthResponse.java',
    `package com.florascan.dto;
import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AuthResponse {
    private String token;
    private String tokenType;
    private Long id;
    private String email;
    private String fullName;
    private String farmName;
    private String role;
    private String message;
}`
  );

  dtoFolder?.file(
    'DiagnosisResponse.java',
    `package com.florascan.dto;
import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DiagnosisResponse {
    private boolean isPlant;
    private String cropName;
    private String diseaseName;
    private String scientificName;
    private String pathogenType;
    private double confidenceScore;
    private String severityLevel;
    private double affectedPercentage;
    private String executiveSummary;
    private List<String> keySymptoms;
    private List<String> biologicalCauses;
    private List<TreatmentOption> organicTreatments;
    private List<TreatmentOption> chemicalTreatments;
    private List<String> preventionPractices;
    private String recoveryEstimate;
    private String contagiousness;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class TreatmentOption {
        private String name;
        private String dosage;
        private String applicationMethod;
        private String frequency;
    }
}`
  );

  dtoFolder?.file(
    'ChatRequest.java',
    `package com.florascan.dto;
import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ChatRequest {
    private String message;
}`
  );

  dtoFolder?.file(
    'DosageRequest.java',
    `package com.florascan.dto;
import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DosageRequest {
    private String treatmentName;
    private double landArea;
    private String areaUnit;
    private String cropType;
}`
  );

  dtoFolder?.file(
    'DosageResponse.java',
    `package com.florascan.dto;
import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DosageResponse {
    private String treatmentName;
    private String targetCrop;
    private double calculatedChemicalQuantity;
    private String chemicalUnit;
    private double requiredWaterLiters;
    private String sprayCoverageDescription;
}`
  );

  // Config
  const configFolder = javaFolder?.folder('config');
  configFolder?.file(
    'CorsConfig.java',
    `package com.florascan.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000", "http://localhost:5173")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS");
    }
}`
  );

  return await zip.generateAsync({ type: 'blob' });
}
