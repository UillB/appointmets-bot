import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

export interface DecodedToken {
  userId: number;
  email: string;
  name: string;
  role: string;
  organizationId: number;
  organization?: {
    id: number;
    name: string;
  };
  iat: number;
  exp: number;
}

export async function verifyToken(token: string): Promise<DecodedToken> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

export function generateToken(payload: any): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}
