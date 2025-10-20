import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  organizationName: z.string().min(2)
});

// JWT secrets (in production, use environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-jwt-key';

// Generate JWT tokens
const generateTokens = (userId: number, email: string, name: string, role: string, organizationId: number, organizationName?: string) => {
  const payload = {
    userId,
    email,
    name,
    role,
    organizationId,
    organization: organizationName ? { id: organizationId, name: organizationName } : undefined
  };
  
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
  
  return { accessToken, refreshToken };
};

// POST /auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const { email, password, name, organizationName } = validatedData;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create organization and user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create organization
      const organization = await tx.organization.create({
        data: {
          name: organizationName
        }
      });

      // Create user
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: 'OWNER', // First user in organization is owner
          organizationId: organization.id
        },
        include: {
          organization: true
        }
      });

      return { user, organization };
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(
      result.user.id,
      result.user.email,
      result.user.name,
      result.user.role,
      result.user.organizationId,
      result.organization.name
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
        organizationId: result.user.organizationId,
        organization: result.organization
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.issues });
    }
    
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const { email, password } = validatedData;

    // Find user with organization
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        organization: true
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(
      user.id,
      user.email,
      user.name,
      user.role,
      user.organizationId,
      user.organization.name
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organizationId: user.organizationId,
        organization: user.organization
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.issues });
    }
    
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /auth/refresh
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as any;
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        organization: true
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      user.id,
      user.email,
      user.name,
      user.role,
      user.organizationId,
      user.organization.name
    );

    res.json({
      accessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// Verify Telegram initData signature
function verifyTelegramInitData(initData: string, botToken?: string): boolean {
  try {
    if (!initData || !botToken) return false;
  const url = new URLSearchParams(initData as string);
    const hash = url.get('hash');
    url.delete('hash');
    const dataCheckString = Array.from(url.entries())
      .map(([k, v]) => `${k}=${v}`)
      .sort()
      .join('\n');

    const crypto = require('crypto');
    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
    const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
    return calculatedHash === hash;
  } catch (e) {
    return false;
  }
}

// POST /auth/telegram-login - Аутентификация через Telegram Web App
router.post('/telegram-login', async (req: any, res: any) => {
  try {
    const { telegramId, firstName, lastName, username, languageCode, initData } = req.body;
    console.log('🔐 /auth/telegram-login body:', { telegramId, username, hasInitData: !!initData });

    if (!telegramId) {
      return res.status(400).json({ error: 'Telegram ID is required' });
    }

    // Attempt to find existing user first to determine organization context
    let user = await prisma.user.findFirst({
      where: { telegramId: telegramId.toString() },
      include: { organization: true }
    });
    console.log('🔐 Found user by telegramId:', !!user, 'orgId:', user?.organizationId);

    // Verify initData signature strictly against organization's bot token if available
    if (initData) {
      let tokenForVerification: string | undefined;
      if (user?.organization?.botToken) {
        tokenForVerification = user.organization.botToken;
      } else if (process.env.TELEGRAM_BOT_TOKEN) {
        // fallback only for legacy/global bot (single-tenant); discouraged
        tokenForVerification = process.env.TELEGRAM_BOT_TOKEN;
      }
      if (tokenForVerification) {
        const ok = verifyTelegramInitData(initData, tokenForVerification);
        if (!ok) {
          const allowInDev = (process.env.NODE_ENV || 'development') !== 'production';
          console.warn('Telegram login: invalid initData signature', {
            telegramId,
            hasUser: !!user,
            orgId: user?.organizationId,
            allowInDev
          });
          if (!allowInDev) {
            return res.status(401).json({ error: 'Invalid Telegram initData signature' });
          }
        }
      }
    }

    // Если пользователь не найден, создаем нового (только для админов)
    if (!user) {
      // Новый пользователь через TWA без онбординга организации запрещен
      console.warn('🔐 Telegram login: user not found for telegramId', telegramId);
      return res.status(403).json({ error: 'User not found. Complete organization onboarding in web admin first.' });
    }

    // Генерируем токены
    const { accessToken, refreshToken } = generateTokens(
      user.id,
      user.email,
      user.name,
      user.role,
      user.organizationId,
      user.organization.name
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organizationId: user.organizationId,
        organization: user.organization
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Telegram login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Функция для проверки, является ли пользователь админом
async function checkIfTelegramUserIsAdmin(telegramId: number, username?: string): Promise<boolean> {
  // Здесь можно добавить логику проверки
  // Например, проверка по списку разрешенных Telegram ID или username
  const adminTelegramIds = [123456789, 987654321]; // Добавить реальные ID админов
  const adminUsernames = ['admin_username']; // Добавить реальные username админов
  
  return adminTelegramIds.includes(telegramId) || 
         (username && adminUsernames.includes(username));
}

// POST /auth/logout
router.post('/logout', (req: any, res: any) => {
  // In a stateless JWT implementation, logout is handled client-side
  // by removing the token from storage
  res.json({ message: 'Logout successful' });
});

export default router;
