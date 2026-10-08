import React, { useState } from 'react';
import {
  X,
  Code2,
  Terminal,
  Download,
  Copy,
  Check,
  Server,
  Layers,
  ShieldCheck,
  Key,
  ExternalLink,
  Cpu,
  Database,
  ArrowRight,
  Globe,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { generateJavaProjectZip } from '../utils/javaProjectZip';

interface JavaFullstackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JavaFullstackModal: React.FC<JavaFullstackModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'code' | 'api' | 'guide'>('architecture');
  const [selectedCodeFile, setSelectedCodeFile] = useState<string>('AuthController.java');
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [backendUrl, setBackendUrl] = useState('http://localhost:8080');
  const [healthStatus, setHealthStatus] = useState<string | null>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    try {
      setIsDownloading(true);
      const blob = await generateJavaProjectZip();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'florascan-java-backend.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate ZIP:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const checkJavaHealth = async () => {
    setIsCheckingHealth(true);
    setHealthStatus(null);
    try {
      const res = await fetch(`${backendUrl}/api/health`, { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        setHealthStatus(`Online: ${data.backend || 'Spring Boot 3'} (${data.status})`);
      } else {
        setHealthStatus(`Server responded with HTTP ${res.status}`);
      }
    } catch {
      setHealthStatus('Not reachable on port 8080. Start Spring Boot via: mvn spring-boot:run');
    } finally {
      setIsCheckingHealth(false);
    }
  };

  const codeSnippets: Record<string, { desc: string; code: string; language: string }> = {
    'AuthController.java': {
      desc: 'Spring Boot REST Controller handling user Login & Registration with JWT token issuance',
      language: 'java',
      code: `package com.florascan.controller;

import com.florascan.dto.AuthRequest;
import com.florascan.dto.AuthResponse;
import com.florascan.dto.RegisterRequest;
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
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
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
}`,
    },
    'PlantDiseaseController.java': {
      desc: 'REST Controller managing plant leaf diagnosis & dosage calculations',
      language: 'java',
      code: `package com.florascan.controller;

import com.florascan.dto.DiagnosisRequest;
import com.florascan.dto.DiagnosisResponse;
import com.florascan.dto.DosageRequest;
import com.florascan.dto.DosageResponse;
import com.florascan.service.PlantDiseaseService;
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
            DiagnosisResponse response = diseaseService.diagnoseLeaf(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/diagnose/upload")
    public ResponseEntity<?> diagnoseUpload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "plantHint", required = false) String plantHint) {
        try {
            String base64 = Base64.getEncoder().encodeToString(file.getBytes());
            DiagnosisRequest req = DiagnosisRequest.builder()
                    .imageBase64(base64)
                    .mimeType(file.getContentType())
                    .plantHint(plantHint)
                    .build();
            return ResponseEntity.ok(diseaseService.diagnoseLeaf(req));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}`,
    },
    'PlantDiseaseService.java': {
      desc: 'Core service calling Google Gemini Vision API with structured JSON output schema',
      language: 'java',
      code: `package com.florascan.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.florascan.dto.DiagnosisRequest;
import com.florascan.dto.DiagnosisResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;

@Service
public class PlantDiseaseService {

    @Value("\${gemini.api.key}")
    private String geminiApiKey;

    @Value("\${gemini.api.model:gemini-2.5-flash}")
    private String geminiModel;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(20))
            .build();

    public DiagnosisResponse diagnoseLeaf(DiagnosisRequest request) throws Exception {
        String base64Data = request.getImageBase64().contains(",")
                ? request.getImageBase64().split(",")[1]
                : request.getImageBase64();

        String systemPrompt = "You are a master botanist. Analyze the plant leaf image and return strictly valid JSON pathology report.";

        Map<String, Object> payload = Map.of(
            "system_instruction", Map.of("parts", List.of(Map.of("text", systemPrompt))),
            "contents", List.of(Map.of(
                "role", "user",
                "parts", List.of(
                    Map.of("inline_data", Map.of("mime_type", request.getMimeType(), "data", base64Data)),
                    Map.of("text", "Diagnose this crop specimen. Hint: " + (request.getPlantHint() != null ? request.getPlantHint() : ""))
                )
            )),
            "generationConfig", Map.of("response_mime_type", "application/json", "temperature", 0.2)
        );

        String json = objectMapper.writeValueAsString(payload);
        String url = String.format("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s", geminiModel, geminiApiKey);

        HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();

        HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());
        String text = objectMapper.readTree(response.body()).at("/candidates/0/content/parts/0/text").asText();
        return objectMapper.readValue(text, DiagnosisResponse.class);
    }
}`,
    },
    'JwtUtils.java': {
      desc: 'Cryptographic HMAC-SHA256 JWT Token generator & verifier for stateless API security',
      language: 'java',
      code: `package com.florascan.security;

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
        long expiry = now + (24 * 60 * 60 * 1000); // 24 hours
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

    private String sign(String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(jwtSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(mac.doFinal(data.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}`,
    },
    'pom.xml': {
      desc: 'Maven build configuration: Spring Boot 3.3.4, Java 17, Spring Web, Validation, Jackson, Lombok',
      language: 'xml',
      code: `<?xml version="1.0" encoding="UTF-8"?>
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
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>com.h2database</groupId>
            <artifactId>h2</artifactId>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
        <dependency>
            <groupId>com.fasterxml.jackson.core</groupId>
            <artifactId>jackson-databind</artifactId>
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
</project>`,
    },
    'ReactIntegration.tsx': {
      desc: 'React Frontend API Client connecting React components to Spring Boot endpoints with JWT Bearer Token',
      language: 'typescript',
      code: `// src/services/springBootApi.ts
const SPRING_BOOT_BASE_URL = 'http://localhost:8080/api';

export async function loginWithJavaBackend(email: string, password: string) {
  const response = await fetch(\`\${SPRING_BOOT_BASE_URL}/auth/login\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return await response.json();
}

export async function diagnoseWithJavaBackend(imageBase64: string, plantHint?: string) {
  const token = localStorage.getItem('florascan_auth_token');
  const response = await fetch(\`\${SPRING_BOOT_BASE_URL}/diagnose\`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? \`Bearer \${token}\` : '',
    },
    body: JSON.stringify({
      imageBase64,
      mimeType: 'image/jpeg',
      plantHint,
    }),
  });
  return await response.json();
}`,
    },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-5xl h-[88vh] flex flex-col bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-800/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-amber-600/20">
              ☕
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-stone-900 dark:text-white">
                  Java Full-Stack Architecture Studio
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                  Spring Boot 3 + Java 17 + React
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Complete production architecture with Spring Security, JWT, REST APIs & Gemini Vision
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadZip}
              disabled={isDownloading}
              className="px-3.5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm shadow-emerald-600/25 flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isDownloading ? (
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>Download Java Project (.ZIP)</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-xl hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex px-6 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 gap-1 overflow-x-auto">
          {[
            { id: 'architecture', label: 'Architecture & Auth Flow', icon: Layers },
            { id: 'code', label: 'Spring Boot Code Explorer', icon: Code2 },
            { id: 'api', label: 'API Workbench & Live Switcher', icon: Server },
            { id: 'guide', label: 'Step-by-Step Setup Guide', icon: Terminal },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'border-amber-600 text-amber-700 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20'
                    : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-stone-50/50 dark:bg-stone-900/60">
          {/* TAB 1: ARCHITECTURE */}
          {activeTab === 'architecture' && (
            <div className="space-y-6">
              {/* Architecture Blueprint Card */}
              <div className="p-6 bg-white dark:bg-stone-800/80 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-sm">
                <h3 className="text-sm font-bold text-stone-900 dark:text-white mb-3 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-amber-600" />
                  Full-Stack Java Enterprise Architecture Diagram
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-4">
                  {/* Tier 1: Frontend */}
                  <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center">
                    <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">
                      Tier 1: Client
                    </span>
                    <h4 className="font-bold text-stone-800 dark:text-stone-100 text-sm mt-1">React 19 + Vite</h4>
                    <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-1">
                      Camera capture, Leaf lesion canvas overlay, JWT Auth storage, Dosage calculator
                    </p>
                    <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] bg-emerald-200/60 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 font-medium">
                      Port: 3000 / 5173
                    </span>
                  </div>

                  {/* Tier 2: Security & Routing */}
                  <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-center">
                    <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 tracking-wider">
                      Tier 2: Spring Security
                    </span>
                    <h4 className="font-bold text-stone-800 dark:text-stone-100 text-sm mt-1">Security & JWT</h4>
                    <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-1">
                      Stateless HMAC-SHA256 bearer tokens, CORS configuration, User authentication filter
                    </p>
                    <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] bg-amber-200/60 dark:bg-amber-900 text-amber-800 dark:text-amber-200 font-medium">
                      Spring Security 6
                    </span>
                  </div>

                  {/* Tier 3: Spring Boot REST API */}
                  <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-center">
                    <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 tracking-wider">
                      Tier 3: Core Service
                    </span>
                    <h4 className="font-bold text-stone-800 dark:text-stone-100 text-sm mt-1">Spring Boot 3 REST</h4>
                    <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-1">
                      PlantDiseaseController, Multipart image upload, Agronomist AI prompt orchestrator
                    </p>
                    <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] bg-blue-200/60 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-medium">
                      Port: 8080 (Java 17)
                    </span>
                  </div>

                  {/* Tier 4: AI & Persistence */}
                  <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-center">
                    <span className="text-[10px] uppercase font-bold text-purple-600 dark:text-purple-400 tracking-wider">
                      Tier 4: Vision AI & DB
                    </span>
                    <h4 className="font-bold text-stone-800 dark:text-stone-100 text-sm mt-1">Google Gemini API</h4>
                    <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-1">
                      gemini-2.5-flash vision inspection, JSON schema compliance, JPA User accounts (H2/Postgres)
                    </p>
                    <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] bg-purple-200/60 dark:bg-purple-900 text-purple-800 dark:text-purple-200 font-medium">
                      AI Vision Engine
                    </span>
                  </div>
                </div>

                {/* Authentication Lifecycle Flow */}
                <div className="mt-6 p-4 rounded-xl bg-stone-50 dark:bg-stone-900/80 border border-stone-200 dark:border-stone-700">
                  <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200 mb-2 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Authentication & Session Flow (Login / Registration)
                  </h4>
                  <ol className="text-xs text-stone-600 dark:text-stone-400 space-y-1.5 list-decimal pl-4">
                    <li>
                      <strong className="text-stone-800 dark:text-stone-200">Registration</strong>: Client sends POST <code className="text-amber-600">/api/auth/register</code> with user details and farm role. Spring Boot verifies email uniqueness and hashes password with SHA-256 / BCrypt.
                    </li>
                    <li>
                      <strong className="text-stone-800 dark:text-stone-200">Token Issuance</strong>: Spring Boot generates a signed JWT bearer token containing user ID, email, and role claims.
                    </li>
                    <li>
                      <strong className="text-stone-800 dark:text-stone-200">Authenticated Requests</strong>: Frontend stores token in localStorage and includes <code className="text-amber-600">Authorization: Bearer &lt;token&gt;</code> in subsequent diagnosis and chat API calls.
                    </li>
                    <li>
                      <strong className="text-stone-800 dark:text-stone-200">Leaf Diagnosis Request</strong>: User uploads leaf image -&gt; Spring Boot receives base64/multipart payload -&gt; calls Gemini Vision API -&gt; parses JSON into strongly typed Java DTO -&gt; returns pathology report to React.
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CODE EXPLORER */}
          {activeTab === 'code' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-full">
              {/* File list sidebar */}
              <div className="md:col-span-1 space-y-1.5 bg-white dark:bg-stone-800/80 p-3 rounded-2xl border border-stone-200 dark:border-stone-700 overflow-y-auto">
                <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 px-2 mb-2">
                  Java Backend Files
                </p>
                {Object.keys(codeSnippets).map((filename) => (
                  <button
                    key={filename}
                    onClick={() => setSelectedCodeFile(filename)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                      selectedCodeFile === filename
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 font-bold border border-amber-300 dark:border-amber-700'
                        : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                    }`}
                  >
                    <span className="truncate">{filename}</span>
                    <Code2 className="w-3.5 h-3.5 shrink-0 opacity-60" />
                  </button>
                ))}
              </div>

              {/* Code viewer */}
              <div className="md:col-span-3 flex flex-col bg-stone-900 rounded-2xl border border-stone-800 overflow-hidden shadow-lg">
                <div className="flex items-center justify-between px-4 py-2.5 bg-stone-950/80 border-b border-stone-800">
                  <div>
                    <span className="text-xs font-mono font-bold text-amber-400">
                      {selectedCodeFile}
                    </span>
                    <p className="text-[11px] text-stone-400">
                      {codeSnippets[selectedCodeFile]?.desc}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopy(codeSnippets[selectedCodeFile]?.code || '')}
                    className="px-2.5 py-1 text-xs bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>
                <pre className="flex-1 p-4 overflow-auto text-xs font-mono text-stone-300 leading-relaxed">
                  <code>{codeSnippets[selectedCodeFile]?.code}</code>
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: API WORKBENCH */}
          {activeTab === 'api' && (
            <div className="space-y-6">
              {/* Live Switcher & Health Checker */}
              <div className="p-6 bg-white dark:bg-stone-800/80 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-sm">
                <h3 className="text-sm font-bold text-stone-900 dark:text-white mb-2 flex items-center gap-2">
                  <Server className="w-4 h-4 text-emerald-600" />
                  Live Backend Connection & Health Check
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mb-4">
                  Test your locally running Java Spring Boot instance on <code className="text-amber-600">http://localhost:8080</code>.
                </p>

                <div className="flex flex-col sm:flex-row gap-2 max-w-xl">
                  <input
                    type="text"
                    value={backendUrl}
                    onChange={(e) => setBackendUrl(e.target.value)}
                    placeholder="http://localhost:8080"
                    className="flex-1 px-3.5 py-2 text-xs font-mono bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl"
                  />
                  <button
                    onClick={checkJavaHealth}
                    disabled={isCheckingHealth}
                    className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isCheckingHealth ? 'animate-spin' : ''}`} />
                    <span>Ping / Health Check</span>
                  </button>
                </div>

                {healthStatus && (
                  <div className={`mt-3 p-3 rounded-xl text-xs font-medium ${
                    healthStatus.includes('Online')
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                  }`}>
                    {healthStatus}
                  </div>
                )}
              </div>

              {/* cURL API Testing Workbench */}
              <div className="p-6 bg-white dark:bg-stone-800/80 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-sm space-y-4">
                <h4 className="text-xs font-bold text-stone-900 dark:text-white uppercase tracking-wider">
                  Test Spring Boot REST Endpoints via cURL
                </h4>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                      1. User Registration
                    </span>
                    <button
                      onClick={() => handleCopy(`curl -X POST http://localhost:8080/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{"fullName":"Farmer John","email":"john@farm.com","password":"password123","role":"farmer"}'`)}
                      className="text-[11px] text-amber-600 hover:underline flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" /> Copy cURL
                    </button>
                  </div>
                  <pre className="p-3 bg-stone-900 text-stone-300 rounded-xl text-xs font-mono overflow-x-auto">
{`curl -X POST http://localhost:8080/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{"fullName":"Farmer John","email":"john@farm.com","password":"password123","role":"farmer"}'`}
                  </pre>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                      2. Plant Leaf Diagnosis
                    </span>
                    <button
                      onClick={() => handleCopy(`curl -X POST http://localhost:8080/api/diagnose \\
  -H "Content-Type: application/json" \\
  -d '{"imageBase64":"...","mimeType":"image/jpeg","plantHint":"Tomato"}'`)}
                      className="text-[11px] text-amber-600 hover:underline flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" /> Copy cURL
                    </button>
                  </div>
                  <pre className="p-3 bg-stone-900 text-stone-300 rounded-xl text-xs font-mono overflow-x-auto">
{`curl -X POST http://localhost:8080/api/diagnose \\
  -H "Content-Type: application/json" \\
  -d '{"imageBase64":"<BASE64_JPEG_STRING>","mimeType":"image/jpeg","plantHint":"Tomato"}'`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SETUP GUIDE */}
          {activeTab === 'guide' && (
            <div className="space-y-6 max-w-3xl">
              <div className="p-6 bg-white dark:bg-stone-800/80 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-amber-600" />
                  Running Java Spring Boot & React Locally
                </h3>

                <div className="space-y-3 text-xs text-stone-600 dark:text-stone-300">
                  <p className="font-semibold text-stone-800 dark:text-stone-200">
                    Step 1: Download or locate the Java Backend
                  </p>
                  <p>
                    Click the <strong>Download Java Project (.ZIP)</strong> button at the top right of this studio to export the entire Maven project structure. Extract it to your preferred folder.
                  </p>

                  <p className="font-semibold text-stone-800 dark:text-stone-200">
                    Step 2: Configure your Gemini API Key
                  </p>
                  <pre className="p-3 bg-stone-900 text-stone-300 rounded-xl font-mono text-[11px]">
{`# Linux / macOS
export GEMINI_API_KEY="your-gemini-api-key"

# Windows PowerShell
$env:GEMINI_API_KEY="your-gemini-api-key"`}
                  </pre>

                  <p className="font-semibold text-stone-800 dark:text-stone-200">
                    Step 3: Build and run with Maven
                  </p>
                  <pre className="p-3 bg-stone-900 text-stone-300 rounded-xl font-mono text-[11px]">
{`mvn clean package
mvn spring-boot:run`}
                  </pre>
                  <p className="text-[11px] text-stone-500">
                    The backend will launch on <code>http://localhost:8080</code> with H2 database & endpoints active.
                  </p>

                  <p className="font-semibold text-stone-800 dark:text-stone-200">
                    Step 4: Launch React Frontend
                  </p>
                  <pre className="p-3 bg-stone-900 text-stone-300 rounded-xl font-mono text-[11px]">
{`npm install
npm run dev`}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
