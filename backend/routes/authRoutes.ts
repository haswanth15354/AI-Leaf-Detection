import { Router, Request, Response } from 'express';
import { registerUser, authenticateUser, getUserFromToken } from '../services/authService.ts';

export const authRouter = Router();

// POST /api/auth/register
authRouter.post('/register', (req: Request, res: Response) => {
  try {
    const { email, password, fullName, farmName, role } = req.body;

    if (!email || !password || !fullName) {
      res.status(400).json({ error: 'Please provide full name, valid email, and password.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      return;
    }

    const result = registerUser({ fullName, email, password, farmName, role });
    res.status(201).json({
      ...result,
      message: 'Account successfully registered!',
    });
  } catch (err: any) {
    const status = err.message.includes('already exists') ? 409 : 500;
    res.status(status).json({ error: err.message || 'Registration failed.' });
  }
});

// POST /api/auth/login
authRouter.post('/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Please provide both email and password.' });
      return;
    }

    const result = authenticateUser(email, password);
    res.json({
      ...result,
      message: 'Login successful.',
    });
  } catch (err: any) {
    res.status(401).json({ error: err.message || 'Authentication failed.' });
  }
});

// GET /api/auth/me
authRouter.get('/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized. Missing bearer token.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const user = getUserFromToken(token);
  if (!user) {
    res.status(404).json({ error: 'User account not found.' });
    return;
  }

  res.json({ user });
});
