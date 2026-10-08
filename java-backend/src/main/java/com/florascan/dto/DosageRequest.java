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
public class DosageRequest {
    private String treatmentName;
    private double landArea;
    private String areaUnit; // "sq_meters", "acres", "hectares", "pots"
    private String cropType;
    private String severity;
    private String waterVolume;
}
