import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { botManager } from '../../bot/bot-manager';

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const validateTokenSchema = z.object({
  token: z.string().min(1, 'Token is required')
});

const activateBotSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  organizationId: z.number().int().positive('Organization ID must be positive')
});

const updateBotSettingsSchema = z.object({
  organizationId: z.number().int().positive('Organization ID must be positive'),
  name: z.string().optional(),
  description: z.string().optional()
});

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

// Middleware для проверки аутентификации
interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    email: string;
    name: string;
    role: string;
    organizationId: number;
  };
}

const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// POST /api/bot/validate-token - Валидация токена бота
router.post('/validate-token', async (req: Request, res: Response) => {
  try {
    const validatedData = validateTokenSchema.parse(req.body);
    const { token } = validatedData;

    // Проверяем токен через Telegram API
    const response = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const data = await response.json();

    if (!data.ok) {
      return res.status(400).json({
        success: false,
        error: 'Invalid bot token'
      });
    }

    // Проверяем, не используется ли уже этот токен
    const existingOrg = await prisma.organization.findFirst({
      where: { botToken: token }
    });

    if (existingOrg) {
      return res.status(400).json({
        success: false,
        error: 'This bot token is already in use'
      });
    }

    res.json({
      success: true,
      bot: {
        id: data.result.id,
        username: data.result.username,
        first_name: data.result.first_name,
        can_join_groups: data.result.can_join_groups,
        can_read_all_group_messages: data.result.can_read_all_group_messages,
        supports_inline_queries: data.result.supports_inline_queries
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.issues
      });
    }

    console.error('Token validation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// POST /api/bot/activate - Активация бота
router.post('/activate', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('🔄 Bot activation request received');
    const validatedData = activateBotSchema.parse(req.body);
    const { token, organizationId } = validatedData;

    console.log(`🔄 Activating bot for organization ${organizationId}`);

    // Проверяем права доступа к организации
    if (req.user!.role !== 'SUPER_ADMIN' && req.user!.organizationId !== organizationId) {
      console.error(`❌ Access denied: user ${req.user!.userId} attempted to access org ${organizationId}`);
      return res.status(403).json({
        success: false,
        error: 'Access denied to this organization'
      });
    }

    // Валидируем токен
    const validationResponse = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const validationData = await validationResponse.json();

    if (!validationData.ok) {
      return res.status(400).json({
        success: false,
        error: 'Invalid bot token'
      });
    }

    // Проверяем, не используется ли уже этот токен
    const existingOrg = await prisma.organization.findFirst({
      where: { 
        botToken: token,
        id: { not: organizationId }
      }
    });

    if (existingOrg) {
      return res.status(400).json({
        success: false,
        error: 'This bot token is already in use by another organization'
      });
    }

    // Обновляем организацию
    const organization = await prisma.organization.update({
      where: { id: organizationId },
      data: {
        botToken: token,
        botUsername: validationData.result.username
      }
    });

    // Настраиваем бота
    await setupBot(token, organization);

    // Останавливаем предыдущий бот для этой организации (если был)
    await botManager.removeBotByOrganizationId(organizationId);
    
    // Небольшая задержка перед запуском нового бота
    await new Promise(resolve => setTimeout(resolve, 500));

    // Запускаем бота через менеджер
    console.log(`🤖 Starting bot for organization ${organizationId}...`);
    await botManager.addBot(token, organizationId);
    console.log(`✅ Bot started successfully for organization ${organizationId}`);

    res.json({
      success: true,
      organization: {
        id: organization.id,
        name: organization.name,
        botUsername: validationData.result.username,
        botLink: `https://t.me/${validationData.result.username}`
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Validation error:', error.issues);
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.issues
      });
    }

    console.error('❌ Bot activation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
});

// PUT /api/bot/settings - Обновление настроек бота
router.put('/settings', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validatedData = updateBotSettingsSchema.parse(req.body);
    const { organizationId, name, description } = validatedData;

    // Проверяем права доступа к организации
    if (req.user!.role !== 'SUPER_ADMIN' && req.user!.organizationId !== organizationId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this organization'
      });
    }

    // Получаем организацию
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId }
    });

    if (!organization || !organization.botToken) {
      return res.status(404).json({
        success: false,
        error: 'Organization or bot not found'
      });
    }

    // Обновляем настройки бота через Telegram API
    const updates: any = {};

    if (name) {
      const nameResponse = await fetch(`https://api.telegram.org/bot${organization.botToken}/setMyName`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      
      if (!nameResponse.ok) {
        return res.status(400).json({
          success: false,
          error: 'Failed to update bot name'
        });
      }
    }

    if (description) {
      const descResponse = await fetch(`https://api.telegram.org/bot${organization.botToken}/setMyDescription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description })
      });
      
      if (!descResponse.ok) {
        return res.status(400).json({
          success: false,
          error: 'Failed to update bot description'
        });
      }
    }

    res.json({
      success: true,
      message: 'Bot settings updated successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.issues
      });
    }

    console.error('Bot settings update error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /api/bot/webapp-url/:organizationId - Получение URL для Telegram WebApp
router.get('/webapp-url/:organizationId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const organizationId = parseInt(req.params.organizationId);

    // Проверяем права доступа к организации
    if (req.user!.role !== 'SUPER_ADMIN' && req.user!.organizationId !== organizationId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this organization'
      });
    }

    // Получаем организацию
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId }
    });

    if (!organization || !organization.botToken) {
      return res.status(404).json({
        success: false,
        error: 'Organization or bot not found'
      });
    }

    // Генерируем WebApp URL
    const webAppUrl = `${process.env.FRONTEND_URL || 'http://localhost:4200'}/bot-creation/webapp/${organizationId}`;

    res.json({
      success: true,
      webAppUrl,
      organization: {
        id: organization.id,
        name: organization.name,
        botUsername: organization.botUsername
      }
    });
  } catch (error) {
    console.error('WebApp URL generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /api/bot/all - Получение информации о всех ботах (только для супер-админа)
router.get('/all', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Проверяем права супер-админа
    if (req.user!.role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Super admin role required.'
      });
    }

    const botsInfo = await botManager.getBotsInfo();
    const status = botManager.getStatus();

    res.json({
      success: true,
      status,
      bots: botsInfo
    });
  } catch (error) {
    console.error('Get all bots error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /api/bot/status/:organizationId - Получение статуса бота
router.get('/status/:organizationId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const organizationId = parseInt(req.params.organizationId);

    // Проверяем права доступа к организации
    if (req.user!.role !== 'SUPER_ADMIN' && req.user!.organizationId !== organizationId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this organization'
      });
    }

    // Получаем организацию
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId }
    });

    if (!organization) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found'
      });
    }

    let botStatus = null;
    let botActive = false;
    if (organization.botToken) {
      try {
        const response = await fetch(`https://api.telegram.org/bot${organization.botToken}/getMe`);
        const data = await response.json();
        
        if (data.ok) {
          botActive = true;
          botStatus = {
            isActive: true,
            botActive: true,
            username: data.result.username,
            firstName: data.result.first_name,
            canJoinGroups: data.result.can_join_groups,
            canReadAllGroupMessages: data.result.can_read_all_group_messages,
            supportsInlineQueries: data.result.supports_inline_queries,
            botLink: `https://t.me/${data.result.username}`
          };
        } else {
          botActive = false;
          botStatus = {
            isActive: false,
            botActive: false,
            error: 'Bot token is invalid or expired'
          };
        }
      } catch (error) {
        botActive = false;
        botStatus = {
          isActive: false,
          botActive: false,
          error: 'Failed to check bot status'
        };
      }
    }

    // Check if admin is linked (user has telegramId)
    let adminLinked = false;
    if (req.user!.userId) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: req.user!.userId },
          select: { telegramId: true }
        });
        adminLinked = !!user?.telegramId;
      } catch (error) {
        console.error('Error checking admin link status:', error);
        // Continue with adminLinked = false
      }
    }

    res.json({
      success: true,
      organization: {
        id: organization.id,
        name: organization.name,
        botToken: organization.botToken ? '***' + organization.botToken.slice(-4) : null,
        botUsername: organization.botUsername
      },
      botStatus: botStatus ? {
        ...botStatus,
        botActive,
        adminLinked
      } : {
        isActive: false,
        botActive: false,
        adminLinked
      }
    });
  } catch (error) {
    console.error('Bot status check error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Функция для настройки бота
async function setupBot(token: string, organization: any) {
  try {
    // Устанавливаем команды бота
    const commands = [
      { command: 'start', description: 'Начать работу с ботом' },
      { command: 'book', description: 'Записаться на консультацию' },
      { command: 'my', description: 'Мои записи' },
      { command: 'help', description: 'Помощь' },
      { command: 'cancel', description: 'Отменить запись' }
    ];

    await fetch(`https://api.telegram.org/bot${token}/setMyCommands`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commands })
    });

    // Устанавливаем описание бота
    const description = `Бот для записи на консультацию в ${organization.name}. Используйте /book для записи, /my для просмотра ваших записей.`;
    
    await fetch(`https://api.telegram.org/bot${token}/setMyDescription`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description })
    });

    console.log(`Bot setup completed for organization: ${organization.name}`);
  } catch (error) {
    console.error('Bot setup error:', error);
    throw error;
  }
}

// In-memory storage for short tokens (expires after 1 hour)
// Format: { shortToken: { userId, organizationId, expiresAt } }
// Export this so bot handlers can access it
export const adminLinkTokens = new Map<string, { userId: number; organizationId: number; expiresAt: number }>();

// Clean up expired tokens every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [token, data] of adminLinkTokens.entries()) {
    if (data.expiresAt < now) {
      adminLinkTokens.delete(token);
    }
  }
}, 5 * 60 * 1000);

// POST /api/bot/generate-admin-link - Generate admin link token
router.post('/generate-admin-link', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const organizationId = req.user!.organizationId;

    // Get organization to get bot username
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { botUsername: true, botToken: true }
    });

    if (!organization || !organization.botToken) {
      return res.status(404).json({
        success: false,
        error: 'Bot not found for this organization'
      });
    }

    // Generate SHORT random token (8-12 characters) instead of long JWT
    // This is critical - Telegram has limits on start parameter length
    const crypto = require('crypto');
    const shortToken = crypto.randomBytes(8).toString('base64url').substring(0, 12); // 12 chars max
    
    // Store token in memory with expiration (1 hour)
    const expiresAt = Date.now() + (60 * 60 * 1000); // 1 hour
    adminLinkTokens.set(shortToken, { userId, organizationId, expiresAt });

    // Create admin link URL with SHORT token
    const botUsername = organization.botUsername || 'bot';
    const cleanUsername = botUsername.replace('@', '');
    const startParam = shortToken; // Just the short token, no prefix needed
    
    // Основная ссылка - используется для QR кода и веб
    const adminLink = `https://t.me/${cleanUsername}?start=${startParam}`;

    console.log(`🔗 [Org ${organizationId}] Generated admin link for user ${userId}:`);
    console.log(`🔗 [Org ${organizationId}] Bot username: ${botUsername}`);
    console.log(`🔗 [Org ${organizationId}] Admin link: ${adminLink}`);
    console.log(`🔗 [Org ${organizationId}] Short token: ${shortToken} (${shortToken.length} chars)`);
    console.log(`🔗 [Org ${organizationId}] Token expires at: ${new Date(expiresAt).toISOString()}`);

    res.json({
      success: true,
      adminLink,
      deepLink: adminLink, // Same format
      linkToken: shortToken, // Short token for reference
      expiresIn: 3600, // 1 hour in seconds
      botUsername: organization.botUsername
    });
  } catch (error) {
    console.error('Generate admin link error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// POST /api/bot/unlink-admin - Unlink admin Telegram account
router.post('/unlink-admin', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const organizationId = req.user!.organizationId;

    // Get user to check if they have telegramId
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { telegramId: true, organizationId: true }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (!user.telegramId) {
      return res.status(400).json({
        success: false,
        error: 'User is not linked to Telegram'
      });
    }

    // Check that user belongs to the correct organization
    if (user.organizationId !== organizationId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this organization'
      });
    }

    const telegramId = user.telegramId;

    // Unlink user by setting telegramId to null
    await prisma.user.update({
      where: { id: userId },
      data: { telegramId: null }
    });

    console.log(`🔗 [Org ${organizationId}] Admin unlinked. User ${userId} unlinked from Telegram ${telegramId}`);

    // Emit WebSocket event for admin unlink
    try {
      const botEmitter = (global as any).botEmitter;
      if (botEmitter) {
        await botEmitter.emitAdminUnlinked(userId, organizationId, telegramId);
      }
    } catch (wsError) {
      console.error('Failed to emit admin unlinked event:', wsError);
    }

    res.json({
      success: true,
      message: 'Admin account unlinked successfully'
    });
  } catch (error) {
    console.error('Unlink admin error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;
