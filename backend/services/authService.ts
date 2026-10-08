import { UserRecord } from '../types/backendTypes.ts';

// In-Memory User Database with pre-seeded demo accounts
export const usersDb: UserRecord[] = [
  {
    id: 'usr_demo_101',
    email: 'farmer@agri.com',
    passwordHash: 'password123',
    fullName: 'David K. Miller',
    farmName: 'GreenValley Organic Orchards',
    role: 'farmer',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr_demo_102',
    email: 'dr.smith@botany.org',
    passwordHash: 'password123',
    fullName: 'Dr. Sarah Smith',
    farmName: 'National Agronomy Research Lab',
    role: 'agronomist',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&q=80',
    createdAt: new Date().toISOString(),
  },
];

export function sanitizeUser(user: UserRecord) {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

export function registerUser(data: {
  fullName: string;
  email: string;
  password: string;
  farmName?: string;
  role?: 'farmer' | 'agronomist' | 'researcher' | 'student';
}) {
  const cleanEmail = data.email.toLowerCase().trim();
  const existing = usersDb.find((u) => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    throw new Error('An account with this email address already exists. Please log in.');
  }

  const newUser: UserRecord = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    email: cleanEmail,
    passwordHash: data.password,
    fullName: data.fullName.trim(),
    farmName: data.farmName ? data.farmName.trim() : undefined,
    role: data.role || 'farmer',
    createdAt: new Date().toISOString(),
  };

  usersDb.push(newUser);
  const token = `jwt_token_${newUser.id}_${Date.now()}`;
  return { user: sanitizeUser(newUser), token };
}

export function authenticateUser(email: string, password: string) {
  const cleanEmail = email.toLowerCase().trim();
  const user = usersDb.find(
    (u) => u.email.toLowerCase() === cleanEmail && u.passwordHash === password
  );

  if (!user) {
    throw new Error('Invalid email or password. Please verify credentials.');
  }

  const token = `jwt_token_${user.id}_${Date.now()}`;
  return { user: sanitizeUser(user), token };
}

export function getUserFromToken(token: string) {
  const prefix = 'jwt_token_';
  if (token.startsWith(prefix)) {
    const rest = token.substring(prefix.length);
    const lastUnderscore = rest.lastIndexOf('_');
    const userId = lastUnderscore !== -1 ? rest.substring(0, lastUnderscore) : rest;
    const user = usersDb.find((u) => u.id === userId);
    if (user) {
      return sanitizeUser(user);
    }
  }
  // Default to first demo user if token is valid mock
  return sanitizeUser(usersDb[0]);
}
