# FloraScan AI - Backend Services

This folder contains the complete backend architecture for FloraScan AI.

## Directory Structure

```
/backend
├── app.ts                    # Main API router combining all service routes
├── routes/
│   ├── authRoutes.ts         # User login, registration, and session token verification
│   ├── diagnoseRoutes.ts     # Multimodal plant leaf vision analysis using Gemini 3.8 Flash
│   ├── chatRoutes.ts         # Real-time Agronomist AI Q&A consultation
│   └── dosageRoutes.ts       # Scientific spray dilution & dosage calculations
├── services/
│   ├── authService.ts        # User credentials database & JWT token operations
│   └── geminiService.ts      # Server-side Google GenAI initialization & error handler
└── types/
    └── backendTypes.ts       # TypeScript request & response data schemas
```

## REST API Endpoints

- `GET  /api/health` - System health check
- `POST /api/auth/register` - New user account creation
- `POST /api/auth/login` - User sign in & JWT bearer token generation
- `GET  /api/auth/me` - Authenticated user profile retrieval
- `POST /api/diagnose` - Multimodal plant pathology diagnosis from leaf base64 photo
- `POST /api/chat` - AI Agronomist consultation
- `POST /api/calculate-dosage` - Field spray volume & chemical dilution computation
