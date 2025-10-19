import { AIProvider, AIConversation, AIResponse } from './types';

export abstract class BaseAIProvider implements AIProvider {
  abstract name: string;
  abstract models: string[];

  abstract sendMessage(conversation: AIConversation, model?: string): Promise<AIResponse>;
  abstract validateConfig(config: any): boolean;

  // Общие методы для всех провайдеров
  protected formatMessages(conversation: AIConversation): any[] {
    const messages = [...conversation.messages];
    
    // Добавляем системный промпт с контекстом организации
    if (conversation.context) {
      const systemPrompt = this.buildSystemPrompt(conversation.context);
      messages.unshift({
        role: 'system',
        content: systemPrompt
      });
    }
    
    return messages;
  }

  protected buildSystemPrompt(context: any): string {
    let prompt = `Ты - AI ассистент для организации "${context.organizationName}". `;
    prompt += `Твоя задача - помогать клиентам с записью на услуги и отвечать на вопросы. `;
    
    if (context.services && context.services.length > 0) {
      prompt += `\n\nДоступные услуги:\n`;
      context.services.forEach((service: any) => {
        prompt += `- ${service.nameRu || service.name} (${service.durationMin} минут)\n`;
      });
    }
    
    prompt += `\nБудь вежливым, профессиональным и полезным. `;
    prompt += `Если клиент хочет записаться, направь его к боту для записи. `;
    prompt += `Отвечай кратко и по делу.`;
    
    return prompt;
  }

  protected calculateTokens(text: string): number {
    // Простая оценка токенов (примерно 4 символа = 1 токен)
    return Math.ceil(text.length / 4);
  }

  protected createResponse(
    content: string, 
    model: string, 
    provider: string, 
    inputTokens?: number, 
    outputTokens?: number
  ): AIResponse {
    const response: AIResponse = {
      content,
      model,
      provider
    };

    if (inputTokens !== undefined && outputTokens !== undefined) {
      response.usage = {
        promptTokens: inputTokens,
        completionTokens: outputTokens,
        totalTokens: inputTokens + outputTokens
      };
    }

    return response;
  }
}
