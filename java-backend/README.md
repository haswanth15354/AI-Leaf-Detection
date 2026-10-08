# FloraScan - Plant Disease Detection (Java Spring Boot Backend)

This is the production-ready **Java Spring Boot 3 + Java 17** backend for the **FloraScan AI Plant Disease Detection** system. It exposes RESTful APIs consumed by modern frontend clients (React Vite, Angular, Android/iOS, or Thymeleaf).

---

## 🏗️ System Architecture

```
[ React / Mobile Client ] 
        │
   (REST / JSON)
        ▼
[ Spring Boot 3 REST Controller ]  <-- Port :8080 (PlantDiseaseController.java)
        │
        ▼
[ PlantDiseaseService.java ]
        │
   (HTTP / REST)
        ▼
[ Google Gemini Vision API ]      <-- gemini-2.5-flash / gemini-1.5-pro
        │
   (Structured JSON)
        ▼
[ DiagnosisResponse DTO ]
        │
        ▼
[ React Pathology Dashboard ]
```

---

## 🚀 Prerequisites

1. **Java Development Kit (JDK 17 or 21)**
2. **Apache Maven 3.8+**
3. **Google Gemini API Key** (from [Google AI Studio](https://aistudio.google.com/app/apikey))

---

## ⚡ Quick Start

### 1. Set your Gemini API Key
```bash
# On Linux / macOS
export GEMINI_API_KEY="your-gemini-api-key-here"

# On Windows PowerShell
$env:GEMINI_API_KEY="your-gemini-api-key-here"
```

### 2. Build and Run the Spring Boot Server
```bash
# Build the project
mvn clean package

# Run the Spring Boot application
mvn spring-boot:run
```
The server will start at: `http://localhost:8080`

---

## 📡 REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status check |
| `POST` | `/api/diagnose` | Core vision diagnosis from Base64 leaf image |
| `POST` | `/api/diagnose/upload` | Multipart leaf file upload (`form-data`) |
| `POST` | `/api/chat` | AI Agronomist consultation & follow-up chat |
| `POST` | `/api/calculate-dosage` | Mathematical pesticide/fungicide spray calculator |

---

## 💻 Connecting with React Frontend

In your React frontend (`src/App.tsx` or API client):
```typescript
// Point API calls directly to Spring Boot backend:
const JAVA_BACKEND_URL = 'http://localhost:8080';

const response = await fetch(`${JAVA_BACKEND_URL}/api/diagnose`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    imageBase64: base64Data,
    mimeType: 'image/jpeg',
    plantHint: 'Tomato',
    environmentContext: 'High humidity greenhouse'
  })
});
const diagnosis = await response.json();
```
