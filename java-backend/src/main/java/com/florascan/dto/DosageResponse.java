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
public class DosageResponse {
    private String treatmentName;
    private String targetCrop;
    private double calculatedChemicalQuantity;
    private String chemicalUnit; // "g", "ml", "kg", "L"
    private double requiredWaterLiters;
    private String sprayCoverageDescription;
    private String applicationTechnique;
    private List<String> safetyEquipmentRequired;
    private String reEntryInterval;
    private String preHarvestInterval;
    private List<String> environmentalCautions;
}
