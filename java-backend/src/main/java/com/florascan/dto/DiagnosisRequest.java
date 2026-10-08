package com.florascan.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class DiagnosisRequest {
    /**
     * Base64-encoded image data, with or without data:image/jpeg;base64, prefix
     */
    private String imageBase64;

    /**
     * MIME type of the uploaded image (e.g. image/jpeg, image/png)
     */
    private String mimeType;

    /**
     * Optional crop or plant name hint provided by the user
     */
    private String plantHint;

    /**
     * Optional environmental context (e.g., recent rain, greenhouse, high humidity)
     */
    private String environmentContext;
}
