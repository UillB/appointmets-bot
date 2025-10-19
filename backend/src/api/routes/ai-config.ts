import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { AIService } from '../../lib/ai/ai-service';

const router = Router();
const aiService = new AIService();

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

// Extend Request interface to include user
interface AuthenticatedRequest extends Request {
  user: {
    userId: number;
    email: string;
    name: string;
    role: string;
    organizationId: number;
  };
}

// Middleware to verify JWT token
const verifyToken = (req: any, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    (req as AuthenticatedRequest).user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Validation schemas
const aiConfigSchema = z.object({
  provider: z.enum(['openai', 'claude', 'custom']),
  apiKey: z.string().min(1, 'API key is required'),
  model: z.string().min(1, 'Model is required'),
  maxTokens: z.number().int().min(1).max(4000).optional(),
  temperature: z.number().min(0).max(2).optional(),
  systemPrompt: z.string().optional(),
  customPrompts: z.object({
    greeting: z.string().optional(),
    bookingHelp: z.string().optional(),
    serviceInfo: z.string().optional(),
    general: z.string().optional()
  }).optional(),
  enabled: z.boolean().default(false)
});

// GET /ai-config - Get AI configuration for organization
router.get('/', verifyToken, async (req: any, res: Response) => {
  try {
    const { organizationId } = req.user;

    const config = await aiService.getOrganizationAIConfig(organizationId);
    
    if (!config) {
      return res.json({
        hasConfig: false,
        config: null
      });
    }

    // Не возвращаем API ключ в ответе
    const { apiKey, ...safeConfig } = config;
    
    res.json({
      hasConfig: true,
      config: safeConfig
    });
  } catch (error) {
    console.error('Get AI config error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /ai-config - Create or update AI configuration
router.post('/', verifyToken, async (req: any, res: Response) => {
  try {
    const { organizationId } = req.user;
    const validatedData = aiConfigSchema.parse(req.body);

    // Проверяем валидность API ключа
    const validation = await aiService.validateApiKey(validatedData.provider, validatedData.apiKey);
    if (!validation.valid) {
      return res.status(400).json({ 
        error: 'Invalid API key', 
        details: validation.error 
      });
    }

    const config = {
      organizationId,
      ...validatedData
    };

    await aiService.saveOrganizationAIConfig(config);

    // Не возвращаем API ключ в ответе
    const { apiKey, ...safeConfig } = config;

    res.json({
      message: 'AI configuration saved successfully',
      config: safeConfig
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.issues });
    }
    
    console.error('Save AI config error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /ai-config/validate - Validate API key
router.post('/validate', verifyToken, async (req: any, res: Response) => {
  try {
    const { provider, apiKey } = req.body;

    if (!provider || !apiKey) {
      return res.status(400).json({ error: 'Provider and API key are required' });
    }

    const validation = await aiService.validateApiKey(provider, apiKey);
    
    res.json(validation);
  } catch (error) {
    console.error('Validate API key error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /ai-config/models - Get available models for provider
router.get('/models', verifyToken, async (req: any, res: Response) => {
  try {
    const { provider, apiKey } = req.query;

    if (!provider) {
      return res.status(400).json({ error: 'Provider is required' });
    }

    const models = await aiService.getAvailableModels(provider as string, apiKey as string);
    
    res.json({ models });
  } catch (error) {
    console.error('Get models error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /ai-config/test - Test AI configuration
router.post('/test', verifyToken, async (req: any, res: Response) => {
  try {
    const { organizationId } = req.user;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const conversation = {
      messages: [
        {
          role: 'user' as const,
          content: message
        }
      ],
      context: {
        organizationId,
        organizationName: 'Test Organization'
      }
    };

    const response = await aiService.sendMessage(organizationId, conversation, 'general_chat');
    
    res.json({
      success: true,
      response: response.content,
      usage: response.usage
    });
  } catch (error) {
    console.error('Test AI config error:', error);
    res.status(500).json({ 
      error: 'Failed to test AI configuration', 
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /ai-config/usage - Get AI usage statistics
router.get('/usage', verifyToken, async (req: any, res: Response) => {
  try {
    const { organizationId } = req.user;
    const { days = 30 } = req.query;

    const stats = await aiService.getUsageStats(organizationId, Number(days));
    
    res.json(stats);
  } catch (error) {
    console.error('Get AI usage stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /ai-config - Delete AI configuration
router.delete('/', verifyToken, async (req: any, res: Response) => {
  try {
    const { organizationId } = req.user;

    // Здесь можно добавить логику удаления конфигурации
    // Пока что просто отключаем AI
    const config = await aiService.getOrganizationAIConfig(organizationId);
    if (config) {
      config.enabled = false;
      await aiService.saveOrganizationAIConfig(config);
    }

    res.json({ message: 'AI configuration disabled successfully' });
  } catch (error) {
    console.error('Delete AI config error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
