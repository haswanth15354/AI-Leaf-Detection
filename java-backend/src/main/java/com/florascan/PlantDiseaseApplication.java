package com.florascan;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * FloraScan - AI-Powered Plant Disease Detection Backend
 * Built with Spring Boot 3 & Google Gemini Vision
 */
@SpringBootApplication
public class PlantDiseaseApplication {

    public static void main(String[] args) {
        SpringApplication.run(PlantDiseaseApplication.class, args);
        System.out.println("==========================================================");
        System.out.println("🌱 FloraScan Plant Disease Detection Backend Started!");
        System.out.println("🌐 Server running on: http://localhost:8080");
        System.out.println("🌿 Diagnosis Endpoint: POST http://localhost:8080/api/diagnose");
        System.out.println("💬 Agronomist Chat:   POST http://localhost:8080/api/chat");
        System.out.println("🧪 Dosage Calculator: POST http://localhost:8080/api/calculate-dosage");
        System.out.println("==========================================================");
    }
}
