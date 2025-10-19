import { BaseAIProvider } from './base-provider';
import { AIConversation, AIResponse, AIConfig } from './types';

export class OpenAIProvider extends BaseAIProvider {
  name = 'openai';
  models = [
    'gpt-4o',
    'gpt-4o-mini',
    'gpt-4-turbo',
    'gpt-4',
    'gpt-3.5-turbo'
  ];

  private apiKey: string;
  private baseUrl: string;

  constructor(config: AIConfig) {
    super();
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.openai.com/v1';
  }

  async sendMessage(conversation: AIConversation, model: string = 'gpt-4o-mini'): Promise<AIResponse> {
    try {
      const messages = this.formatMessages(conversation);
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: 500,
          temperature: 0.7,
          stream: false
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenAI API error: ${response.status} - ${error}`);
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response from OpenAI API');
      }

      return this.createResponse(
        data.choices[0].message.content,
        model,
        this.name,
        data.usage?.prompt_tokens,
        data.usage?.completion_tokens
      );

    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error(`Failed to get response from OpenAI: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  validateConfig(config: any): boolean {
    return !!(
      config.apiKey && 
      typeof config.apiKey === 'string' && 
      config.apiKey.startsWith('sk-')
    );
  }

  // Метод для получения доступных моделей
  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        }
      });

      if (!response.ok) {
        console.warn('Failed to fetch OpenAI models, using default list');
        return this.models;
      }

      const data = await response.json();
      const chatModels = data.data
        .filter((model: any) => model.id.includes('gpt'))
        .map((model: any) => model.id)
        .sort();

      return chatModels.length > 0 ? chatModels : this.models;
    } catch (error) {
      console.warn('Error fetching OpenAI models:', error);
      return this.models;
    }
  }

  // Метод для проверки баланса API ключа
  async checkApiKey(): Promise<{ valid: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        }
      });

      if (response.ok) {
        return { valid: true };
      } else if (response.status === 401) {
        return { valid: false, error: 'Invalid API key' };
      } else if (response.status === 429) {
        return { valid: false, error: 'Rate limit exceeded' };
      } else {
        return { valid: false, error: `API error: ${response.status}` };
      }
    } catch (error) {
      return { valid: false, error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }
}
