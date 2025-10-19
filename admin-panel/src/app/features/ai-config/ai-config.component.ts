import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';

import { AIConfigService, AIConfig, AvailableModel, AIUsageStats } from '../../core/services/ai-config.service';
import { AuthService, User } from '../../core/services/auth';

@Component({
  selector: 'app-ai-config',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule,
    MatExpansionModule
  ],
  templateUrl: './ai-config.component.html',
  styleUrls: ['./ai-config.component.scss']
})
export class AIConfigComponent implements OnInit {
  aiConfigForm: FormGroup;
  customPromptsForm: FormGroup;
  advancedPromptsForm: FormGroup;
  isLoading = false;
  isValidatingApiKey = false;
  isTestingAI = false;
  isSaving = false;
  
  currentConfig: AIConfig | null = null;
  availableModels: AvailableModel[] = [];
  usageStats: AIUsageStats | null = null;
  currentUser: User | null = null;
  isLoadingStats = false;
  
  providers = [
    { value: 'openai', label: 'OpenAI (ChatGPT)', icon: '🤖' },
    { value: 'claude', label: 'Claude (Anthropic)', icon: '🧠' },
    { value: 'custom', label: 'Custom API', icon: '⚙️' }
  ];

  scenarios = [
    { key: 'greeting', label: 'Приветствие новых пользователей', placeholder: 'Привет! Я AI ассистент...' },
    { key: 'bookingHelp', label: 'Помощь с записью', placeholder: 'Помогу вам выбрать услугу и время...' },
    { key: 'serviceInfo', label: 'Информация об услугах', placeholder: 'Расскажу подробно об услугах...' },
    { key: 'general', label: 'Общие вопросы', placeholder: 'Отвечу на любые вопросы...' },
    { key: 'support', label: 'Поддержка', placeholder: 'Помогу решить проблемы...' }
  ];

  constructor(
    private fb: FormBuilder,
    private aiConfigService: AIConfigService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.aiConfigForm = this.fb.group({
      provider: ['openai', Validators.required],
      apiKey: ['', Validators.required],
      model: ['gpt-4o-mini', Validators.required],
      maxTokens: [1000],
      temperature: [0.7],
      systemPrompt: [''],
      enabled: [false]
    });

    this.customPromptsForm = this.fb.group({
      greeting: [''],
      bookingHelp: [''],
      serviceInfo: [''],
      general: [''],
      support: ['']
    });

    this.advancedPromptsForm = this.fb.group({
      baseSystemPrompt: [''],
      contextInstructions: [''],
      behaviorInstructions: [''],
      fallbackPrompt: ['']
    });
  }

  ngOnInit(): void {
    // Получаем текущего пользователя
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      this.snackBar.open('Ошибка: пользователь не авторизован', 'Закрыть', { duration: 3000 });
      return;
    }
    
    this.loadAIConfig();
    this.loadUsageStats();
  }

  loadAIConfig(): void {
    if (!this.currentUser?.organizationId) {
      this.snackBar.open('Ошибка: не удалось определить организацию', 'Закрыть', { duration: 3000 });
      return;
    }
    
    const organizationId = this.currentUser.organizationId;

    this.isLoading = true;
    this.aiConfigService.getAIConfig(organizationId).subscribe({
      next: (config) => {
        this.currentConfig = config;
        this.populateForms(config);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading AI config:', error);
        this.isLoading = false;
        // Если конфигурации нет, это нормально - пользователь может создать новую
      }
    });
  }

  populateForms(config: AIConfig): void {
    this.aiConfigForm.patchValue({
      provider: config.provider,
      apiKey: config.apiKey,
      model: config.model,
      maxTokens: config.maxTokens || 1000,
      temperature: config.temperature || 0.7,
      systemPrompt: config.systemPrompt || '',
      enabled: config.enabled
    });

    if (config.customPrompts) {
      this.customPromptsForm.patchValue(config.customPrompts);
    }

    // Загружаем расширенные промпты
    this.advancedPromptsForm.patchValue({
      baseSystemPrompt: config.baseSystemPrompt || '',
      contextInstructions: config.contextInstructions || '',
      behaviorInstructions: config.behaviorInstructions || '',
      fallbackPrompt: config.fallbackPrompt || ''
    });
  }

  onProviderChange(): void {
    const provider = this.aiConfigForm.get('provider')?.value;
    this.loadAvailableModels(provider);
  }

  loadAvailableModels(provider: string): void {
    const apiKey = this.aiConfigForm.get('apiKey')?.value;
    if (!apiKey) return;

    this.aiConfigService.getAvailableModels(provider, apiKey).subscribe({
      next: (models) => {
        this.availableModels = models;
      },
      error: (error) => {
        console.error('Error loading models:', error);
        this.availableModels = [];
      }
    });
  }

  validateApiKey(): void {
    const provider = this.aiConfigForm.get('provider')?.value;
    const apiKey = this.aiConfigForm.get('apiKey')?.value;
    
    if (!provider || !apiKey) {
      this.snackBar.open('Заполните провайдера и API ключ', 'Закрыть', { duration: 3000 });
      return;
    }

    // Базовая валидация формата API ключа
    if (provider === 'openai' && !apiKey.startsWith('sk-')) {
      this.snackBar.open('❌ OpenAI API ключ должен начинаться с "sk-"', 'Закрыть', { duration: 3000 });
      return;
    }

    this.isValidatingApiKey = true;
    this.aiConfigService.validateApiKey(provider, apiKey).subscribe({
      next: (result) => {
        this.isValidatingApiKey = false;
        if (result.valid) {
          this.snackBar.open('✅ API ключ действителен!', 'Закрыть', { duration: 3000 });
          this.loadAvailableModels(provider);
        } else {
          this.snackBar.open(`❌ Ошибка: ${result.error}`, 'Закрыть', { duration: 5000 });
        }
      },
      error: (error) => {
        this.isValidatingApiKey = false;
        this.snackBar.open('❌ Ошибка при проверке API ключа', 'Закрыть', { duration: 3000 });
      }
    });
  }

  testAI(): void {
    const config = this.buildConfigFromForms();
    if (!config) return;

    this.isTestingAI = true;
    this.aiConfigService.testAIConfig(config, 'Привет! Как дела?').subscribe({
      next: (result) => {
        this.isTestingAI = false;
        if (result.success) {
          this.snackBar.open(`✅ AI работает! Ответ: ${result.response}`, 'Закрыть', { duration: 5000 });
        } else {
          this.snackBar.open(`❌ Ошибка: ${result.error}`, 'Закрыть', { duration: 5000 });
        }
      },
      error: (error) => {
        this.isTestingAI = false;
        this.snackBar.open('❌ Ошибка при тестировании AI', 'Закрыть', { duration: 3000 });
      }
    });
  }

  saveConfig(): void {
    const config = this.buildConfigFromForms();
    if (!config) return;

    if (!this.currentUser?.organizationId) {
      this.snackBar.open('Ошибка: не удалось определить организацию', 'Закрыть', { duration: 3000 });
      return;
    }

    this.isSaving = true;
    const organizationId = this.currentUser.organizationId;

    config.organizationId = organizationId;

    // Всегда используем POST для сохранения (upsert)
    const saveOperation = this.aiConfigService.saveAIConfig(config);

    saveOperation.subscribe({
      next: (savedConfig) => {
        this.currentConfig = savedConfig;
        this.isSaving = false;
        this.snackBar.open('✅ Конфигурация AI сохранена!', 'Закрыть', { duration: 3000 });
        this.loadUsageStats();
      },
      error: (error) => {
        this.isSaving = false;
        this.snackBar.open('❌ Ошибка при сохранении конфигурации', 'Закрыть', { duration: 3000 });
      }
    });
  }

  buildConfigFromForms(): AIConfig | null {
    if (this.aiConfigForm.invalid) {
      this.snackBar.open('Заполните все обязательные поля', 'Закрыть', { duration: 3000 });
      return null;
    }

    const baseConfig = this.aiConfigForm.value;
    const customPrompts = this.customPromptsForm.value;
    const advancedPrompts = this.advancedPromptsForm.value;

    // Убираем пустые промпты
    const filteredPrompts = Object.fromEntries(
      Object.entries(customPrompts).filter(([_, value]) => value && typeof value === 'string' && value.trim())
    );

    // Убираем пустые расширенные промпты
    const filteredAdvancedPrompts = Object.fromEntries(
      Object.entries(advancedPrompts).filter(([_, value]) => value && typeof value === 'string' && value.trim())
    );

    return {
      ...this.currentConfig,
      ...baseConfig,
      customPrompts: Object.keys(filteredPrompts).length > 0 ? filteredPrompts : undefined,
      baseSystemPrompt: filteredAdvancedPrompts['baseSystemPrompt'],
      contextInstructions: filteredAdvancedPrompts['contextInstructions'],
      behaviorInstructions: filteredAdvancedPrompts['behaviorInstructions'],
      fallbackPrompt: filteredAdvancedPrompts['fallbackPrompt']
    };
  }

  loadUsageStats(): void {
    if (!this.currentUser?.organizationId) return;
    
    const organizationId = this.currentUser.organizationId;
    this.isLoadingStats = true;

    this.aiConfigService.getUsageStats(organizationId).subscribe({
      next: (stats) => {
        this.usageStats = stats;
        this.isLoadingStats = false;
      },
      error: (error) => {
        console.error('Error loading usage stats:', error);
        this.isLoadingStats = false;
        this.snackBar.open('❌ Ошибка при загрузке статистики', 'Закрыть', { duration: 3000 });
      }
    });
  }

  getScenarioIcon(scenario: string): string {
    const icons: Record<string, string> = {
      greeting: '👋',
      bookingHelp: '📅',
      serviceInfo: 'ℹ️',
      general: '💬',
      support: '🆘'
    };
    return icons[scenario] || '💭';
  }

  formatTokens(tokens: number | undefined): string {
    if (!tokens || tokens === 0) {
      return '0';
    }
    if (tokens >= 1000000) {
      return `${(tokens / 1000000).toFixed(1)}M`;
    } else if (tokens >= 1000) {
      return `${(tokens / 1000).toFixed(1)}K`;
    }
    return tokens.toString();
  }

  getScenarioKeys(): string[] {
    if (!this.usageStats?.requestsByScenario) return [];
    return Object.keys(this.usageStats.requestsByScenario);
  }
}
