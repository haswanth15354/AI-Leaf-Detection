import { Router, Request, Response } from 'express';
import { authRouter } from './routes/authRoutes.ts';
import { diagnoseRouter } from './routes/diagnoseRoutes.ts';
import { chatRouter } from './routes/chatRoutes.ts';
import { dosageRouter } from './routes/dosageRoutes.ts';

export const backendApiRouter = Router();

// Health Check
backendApiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'UP',
    system: 'FloraScan AI Plant Pathology Engine',
    geminiModel: 'gemini-3.8-flash',
    timestamp: new Date().toISOString(),
  });
});

// Mount Sub-routers
backendApiRouter.use('/auth', authRouter);
backendApiRouter.use('/diagnose', diagnoseRouter);
backendApiRouter.use('/chat', chatRouter);
backendApiRouter.use('/calculate-dosage', dosageRouter);
