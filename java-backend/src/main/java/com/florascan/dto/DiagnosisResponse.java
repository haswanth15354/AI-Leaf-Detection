package com.florascan.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class DiagnosisResponse {
    private boolean isPlant;
    private String plantIdentified;
    private String cropName;
    private String diseaseName;
    private String scientificName;
    private String pathogenType; // Fungal, Bacterial, Viral, Pest / Insect, Deficiency, Physiological, Healthy
    private double confidenceScore;
    private String severityLevel; // None, Low, Moderate, Severe, Critical
    private double affectedPercentage;
    private String executiveSummary;
    private List<String> keySymptoms;
    private List<String> biologicalCauses;
    private List<TreatmentOption> organicTreatments;
    private List<TreatmentOption> chemicalTreatments;
    private List<String> preventionPractices;
    private String recoveryEstimate;
    private String contagiousness; // Low, Moderate, High, Extremely Rapid
    private boolean quarantineRecommended;
    private List<BoundingBox> boundingBoxes;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class TreatmentOption {
        private String name;
        private String dosage;
        private String applicationMethod;
        private String frequency;
        private String safetyInterval;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class BoundingBox {
        private String label;
        private double confidence;
        private double ymin;
        private double xmin;
        private double ymax;
        private double xmax;
    }
}
