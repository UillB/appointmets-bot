import { Router, Request, Response } from 'express';
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
  
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '2h' });
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

    // Create organization, user, and UserOrganization link in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create organization
      const organization = await tx.organization.create({
        data: {
          name: organizationName
        }
      });

      // Create user (without organizationId)
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: 'OWNER' // User role (not organization role)
        }
      });

      // Link user to organization as OWNER
      await tx.userOrganization.create({
        data: {
          userId: user.id,
          organizationId: organization.id,
          role: 'OWNER'
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
      result.organization.id,
      result.organization.name
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
        organizationId: result.organization.id,
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

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Get user's first organization (or most recent)
    const userOrg = await prisma.userOrganization.findFirst({
      where: { userId: user.id },
      include: {
        organization: true
      },
      orderBy: {
        createdAt: 'asc' // Get first organization (or change to 'desc' for most recent)
      }
    });

    if (!userOrg) {
      return res.status(400).json({ error: 'User has no organizations. Please contact support.' });
    }

    // Generate tokens with the first organization
    const { accessToken, refreshToken } = generateTokens(
      user.id,
      user.email,
      user.name,
      user.role,
      userOrg.organization.id,
      userOrg.organization.name
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organizationId: userOrg.organization.id,
        organization: userOrg.organization
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
      where: { id: decoded.userId }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Use organizationId from token (current active organization)
    // If not present, get first organization
    let organizationId = decoded.organizationId;
    let organizationName = decoded.organization?.name;

    if (!organizationId) {
      const userOrg = await prisma.userOrganization.findFirst({
        where: { userId: user.id },
        include: { organization: true },
        orderBy: { createdAt: 'asc' }
      });

      if (!userOrg) {
        return res.status(400).json({ error: 'User has no organizations' });
      }

      organizationId = userOrg.organization.id;
      organizationName = userOrg.organization.name;
    }

    // Generate new tokens with same organization context
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      user.id,
      user.email,
      user.name,
      user.role,
      organizationId,
      organizationName
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

    // Attempt to find existing user first
    let user = await prisma.user.findFirst({
      where: { telegramId: telegramId.toString() }
    });
    console.log('🔐 Found user by telegramId:', !!user, 'userId:', user?.id);

    // Если пользователь не найден, создаем нового (только для админов)
    if (!user) {
      // Новый пользователь через TWA без онбординга организации запрещен
      console.warn('🔐 Telegram login: user not found for telegramId', telegramId);
      console.log('❌ Returning 403 - user not found');
      return res.status(403).json({ error: 'User not found. Complete organization onboarding in web admin first.' });
    }

    console.log('✅ User found, determining organization from bot...');
    
    // Get all organizations user belongs to
    const userOrgs = await prisma.userOrganization.findMany({
      where: { userId: user.id },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            botToken: true,
            botUsername: true
          }
        }
      }
    });

    if (userOrgs.length === 0) {
      console.warn('⚠️ User has no organizations');
      return res.status(400).json({ error: 'User has no organizations. Please contact support.' });
    }

    // Determine organization from bot token (if initData provided)
    let targetOrg = null;
    
    if (initData) {
      // Try to verify initData with each organization's bot token
      // The bot token that successfully verifies initData is the bot the user came from
      for (const userOrg of userOrgs) {
        if (userOrg.organization.botToken) {
          const isValid = verifyTelegramInitData(initData, userOrg.organization.botToken);
          if (isValid) {
            targetOrg = userOrg.organization;
            console.log(`✅ InitData verified with bot token for organization: ${targetOrg.name} (ID: ${targetOrg.id})`);
            break;
          }
        }
      }

      // If verification failed for all bots, check if we're in dev mode
      if (!targetOrg) {
        const allowInDev = (process.env.NODE_ENV || 'development') !== 'production';
        if (allowInDev) {
          console.warn('⚠️ InitData verification failed for all bots, but dev mode allows fallback');
          // In dev mode, use first organization with bot as fallback
          targetOrg = userOrgs.find(uo => uo.organization.botToken)?.organization || userOrgs[0].organization;
        } else {
          console.error('❌ InitData verification failed for all bots');
          return res.status(401).json({ error: 'Invalid Telegram initData signature' });
        }
      }
    } else {
      // No initData provided - use first organization (fallback)
      console.log('⚠️ No initData provided, using first organization');
      targetOrg = userOrgs[0].organization;
    }

    if (!targetOrg) {
      console.warn('⚠️ Could not determine target organization');
      return res.status(400).json({ error: 'Could not determine organization. Please contact support.' });
    }

    console.log(`✅ Using organization: ${targetOrg.name} (ID: ${targetOrg.id})`);
    
    // Генерируем токены с правильной организацией
    const { accessToken, refreshToken } = generateTokens(
      user.id,
      user.email,
      user.name,
      user.role,
      targetOrg.id,
      targetOrg.name
    );

    console.log('✅ Tokens generated, sending response...');
    console.log('✅ Sending response with user:', {
      id: user.id,
      email: user.email,
      role: user.role,
      organizationId: targetOrg.id,
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organizationId: targetOrg.id,
        organization: {
          id: targetOrg.id,
          name: targetOrg.name
        }
      },
      accessToken,
      refreshToken
    });
    
    console.log('✅ Response sent successfully');
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

// POST /auth/switch-organization - Switch active organization
const switchOrganizationSchema = z.object({
  organizationId: z.number()
});

router.post('/switch-organization', async (req: Request, res: Response) => {
  try {
    // Verify current token
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as any;
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { userId } = decoded;
    const validatedData = switchOrganizationSchema.parse(req.body);
    const { organizationId } = validatedData;

    // Verify user has access to this organization
    const userOrg = await prisma.userOrganization.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId
        }
      },
      include: {
        organization: true,
        user: true
      }
    });

    if (!userOrg) {
      return res.status(403).json({ 
        error: 'ORGANIZATION_ACCESS_DENIED',
        message: 'You do not have access to this organization' 
      });
    }

    // Generate new tokens with new organization context
    const { accessToken, refreshToken } = generateTokens(
      userOrg.user.id,
      userOrg.user.email,
      userOrg.user.name,
      userOrg.user.role,
      userOrg.organization.id,
      userOrg.organization.name
    );

    res.json({
      message: 'Organization switched successfully',
      user: {
        id: userOrg.user.id,
        email: userOrg.user.email,
        name: userOrg.user.name,
        role: userOrg.user.role,
        organizationId: userOrg.organization.id,
        organization: userOrg.organization
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.issues });
    }
    
    console.error('Switch organization error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /auth/logout
router.post('/logout', (req: any, res: any) => {
  // In a stateless JWT implementation, logout is handled client-side
  // by removing the token from storage
  res.json({ message: 'Logout successful' });
});

export default router;
