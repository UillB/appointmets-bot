import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Sparkles,
  RefreshCw,
  Save,
  TestTube,
  Zap,
  Brain,
  Settings as SettingsIcon,
  Info,
  CheckCircle2,
  MessageSquare,
  Crown,
  Lock,
  ArrowRight,
} from "lucide-react";
import { PageTitle } from "../PageTitle";
import { toast } from "sonner";
import { Switch } from "../ui/switch";
import { Slider } from "../ui/slider";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { apiClient, AIConfig } from "../../services/api";
import { useLanguage } from "../../i18n";
import { useNavigate } from "react-router-dom";

export function AIAssistantPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [aiEnabled, setAiEnabled] = useState(true);
  const [autoReply, setAutoReply] = useState(false);
  const [instructions, setInstructions] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionPlan, setSubscriptionPlan] = useState<'FREE' | 'PRO' | 'ENTERPRISE' | null>(null);
  const [isLoadingPlan, setIsLoadingPlan] = useState(true);

  // Configuration state
  const [provider, setProvider] = useState("openai");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("gpt-4");
  const [maxTokens, setMaxTokens] = useState([1000]);
  const [temperature, setTemperature] = useState([0.7]);
  const [apiKeyVerified, setApiKeyVerified] = useState(false);

  // Load subscription plan and AI config on component mount
  useEffect(() => {
    loadSubscriptionPlan();
    loadAIConfig();
  }, []);

  const loadSubscriptionPlan = async () => {
    try {
      setIsLoadingPlan(true);
      const subscriptionData = await apiClient.getSubscription();
      setSubscriptionPlan(subscriptionData.subscription.plan);
    } catch (error) {
      console.error('Failed to load subscription plan:', error);
      // Default to FREE if error - show error toast but don't block UI
      toast.error(t('settings.subscription.loadError') || 'Failed to load subscription plan');
      setSubscriptionPlan('FREE');
    } finally {
      setIsLoadingPlan(false);
    }
  };

  const loadAIConfig = async () => {
    try {
      setIsLoading(true);
      const config = await apiClient.getAIConfig();
      if (config) {
        setProvider(config.provider || "openai");
        setApiKey(config.apiKey || "");
        setModel(config.model || "gpt-4");
        setMaxTokens([config.maxTokens || 1000]);
        setTemperature([config.temperature || 0.7]);
        setInstructions(config.instructions || "");
        setAiEnabled(config.isActive !== undefined ? config.isActive : true);
        setApiKeyVerified(!!config.apiKey);
      }
    } catch (error) {
      console.error('Failed to load AI config:', error);
      // Don't show error toast as config might not exist yet
      // Set defaults if config doesn't exist
      setInstructions("");
      setAiEnabled(true);
    } finally {
      setIsLoading(false);
    }
  };

  const providers = [
    { id: "openai", name: "OpenAI (ChatGPT)", models: ["gpt-4", "gpt-4-turbo", "gpt-3.5-turbo"] },
    { id: "anthropic", name: "Anthropic (Claude)", models: ["claude-3-opus", "claude-3-sonnet", "claude-3-haiku"] },
    { id: "google", name: "Google (Gemini)", models: ["gemini-pro", "gemini-pro-vision"] },
  ];

  const selectedProvider = providers.find((p) => p.id === provider);

  const handleRefresh = () => {
    toast.success(t('aiAssistant.refreshed'));
  };

  const handleSave = async () => {
    try {
      await apiClient.updateAIConfig({
        provider: provider as 'openai' | 'anthropic' | 'google',
        apiKey,
        model,
        maxTokens: maxTokens[0],
        temperature: temperature[0],
        instructions,
        isActive: aiEnabled
      });
      toast.success(t('aiAssistant.configSaved'));
    } catch (error) {
      console.error('Failed to save AI config:', error);
      toast.error(t('aiAssistant.configSaveFailed'));
    }
  };

  const handleTest = async () => {
    if (!aiEnabled) {
      toast.error(t('aiAssistant.enableFirst'));
      return;
    }
    try {
      const result = await apiClient.testAI("Hello, this is a test message");
      if (result.success) {
        toast.success(t('aiAssistant.testSuccessful'), {
          description: t('aiAssistant.testResponse', { response: result.response }),
        });
      } else {
        toast.error(t('aiAssistant.testFailed'));
      }
    } catch (error) {
      console.error('AI test failed:', error);
      toast.error(t('aiAssistant.testFailed'));
    }
  };

  const handleVerifyKey = () => {
    if (!apiKey) {
      toast.error(t('aiAssistant.enterApiKey'));
      return;
    }
    // Simulate verification
    setTimeout(() => {
      setApiKeyVerified(true);
      toast.success(t('aiAssistant.apiKeyVerified'));
    }, 1000);
  };


  const handleReset = () => {
    setProvider("openai");
    setModel("gpt-4");
    setMaxTokens([1000]);
    setTemperature([0.7]);
    setInstructions("");
    setApiKey("");
    setApiKeyVerified(false);
    toast.info(t('aiAssistant.configReset'));
  };

  // Show placeholder for FREE plan users
  if (isLoadingPlan) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500 dark:text-gray-400">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (subscriptionPlan === 'FREE') {
    return (
      <div className="space-y-6">
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <PageTitle
              icon={<Sparkles className="w-6 h-6 text-white" />}
              title={t('aiAssistant.title')}
              description={t('aiAssistant.description')}
            />

            {/* Free Plan Placeholder */}
            <div className="max-w-3xl mx-auto">
              <Card className="p-6 sm:p-8 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 border-indigo-200 dark:border-indigo-900">
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                    <Lock className="w-10 h-10 text-white" />
                  </div>
                  
                  <div className="space-y-2">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {t('aiAssistant.freePlan.title')}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                      {t('aiAssistant.freePlan.description')}
                    </p>
                  </div>

                  <div className="bg-white dark:bg-gray-900 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-800 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {t('aiAssistant.freePlan.featuresTitle')}
                    </h3>
                    <ul className="space-y-3 text-left">
                      <li className="flex items-start gap-3">
                        <Crown className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                          {t('aiAssistant.freePlan.feature1')}
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Crown className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                          {t('aiAssistant.freePlan.feature2')}
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Crown className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                          {t('aiAssistant.freePlan.feature3')}
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      onClick={() => navigate('/settings?tab=subscription')}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto"
                      size="lg"
                    >
                      {t('aiAssistant.freePlan.upgradeButton')}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Page Title */}
          <PageTitle
            icon={<Sparkles className="w-6 h-6 text-white" />}
            title={t('aiAssistant.title')}
            description={t('aiAssistant.description')}
            actions={
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  className="hidden sm:flex"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {t('common.refresh')}
                </Button>
                <Badge
                  variant="outline"
                  className="hidden sm:flex bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                >
                  {t('navigation.badges.beta')}
                </Badge>
                <Button
                  onClick={handleSave}
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {t('common.save')}
                </Button>
              </>
            }
          />

            {/* Main Content - Like in Figma (no tabs, no stats) */}
            <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
            {/* Activation Card - Like in Figma */}
            <Card className="p-4 sm:p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg mb-2 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                      <Zap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      {t('aiAssistant.controls.title')}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t('aiAssistant.controls.description')}
                    </p>
                  </div>

                  <Separator className="bg-gray-200 dark:bg-gray-700" />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex-1 pr-3">
                        <Label className="text-sm sm:text-base cursor-pointer text-gray-900 dark:text-gray-100">{t('aiAssistant.controls.enableAi')}</Label>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {t('aiAssistant.controls.enableAiDescription')}
                        </p>
                      </div>
                      <Switch
                        checked={aiEnabled}
                        onCheckedChange={setAiEnabled}
                        className="flex-shrink-0"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex-1 pr-3">
                        <Label className="text-sm sm:text-base cursor-pointer text-gray-900 dark:text-gray-100">{t('aiAssistant.controls.autoReply')}</Label>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {t('aiAssistant.controls.autoReplyDescription')}
                        </p>
                      </div>
                      <Switch
                        checked={autoReply}
                        onCheckedChange={setAutoReply}
                        className="flex-shrink-0"
                      />
                    </div>
                  </div>

                  {aiEnabled && (
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700 bg-emerald-50 dark:bg-emerald-950 border-emerald-100 dark:border-emerald-900 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-emerald-700 dark:text-emerald-300">
                          <p className="font-medium mb-1">{t('aiAssistant.controls.activeTitle')}</p>
                          <p>
                            {t('aiAssistant.controls.activeDescription')}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

            {/* AI Configuration - Like in Figma */}
            <Card className="p-4 sm:p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg mb-2 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                    <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    {t('aiAssistant.config.title')}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('aiAssistant.config.description')}
                  </p>
                </div>

                <Separator className="bg-gray-200 dark:bg-gray-700" />

                {/* LLM Model */}
                <div className="space-y-2">
                  <Label htmlFor="model" className="text-gray-900 dark:text-gray-100">{t('aiAssistant.config.modelLabel')}</Label>
                  <Select value={model} onValueChange={setModel}>
                    <SelectTrigger id="model" className="h-11 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                      <SelectItem value="gpt-4">{t('aiAssistant.config.models.gpt4')}</SelectItem>
                      <SelectItem value="gpt-4-turbo">{t('aiAssistant.config.models.gpt4Turbo')}</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">{t('aiAssistant.config.models.gpt35Turbo')}</SelectItem>
                      <SelectItem value="claude-3-opus">{t('aiAssistant.config.models.claude3Opus')}</SelectItem>
                      <SelectItem value="claude-3-sonnet">{t('aiAssistant.config.models.claude3Sonnet')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('aiAssistant.config.modelHint')}
                  </p>
                </div>

                {/* Temperature */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="temperature" className="text-gray-900 dark:text-gray-100">{t('aiAssistant.config.temperatureLabel')}</Label>
                    <Badge variant="outline" className="text-xs border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                      {temperature[0]?.toFixed(1) || '0.0'}
                    </Badge>
                  </div>
                  <Slider
                    id="temperature"
                    min={0}
                    max={2}
                    step={0.1}
                    value={temperature}
                    onValueChange={setTemperature}
                    className="py-2"
                  />
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{t('aiAssistant.config.temperaturePrecise')}</span>
                    <span>{t('aiAssistant.config.temperatureBalanced')}</span>
                    <span>{t('aiAssistant.config.temperatureCreative')}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('aiAssistant.config.temperatureHint')}
                  </p>
                </div>
              </div>
            </Card>

            {/* Custom Instructions - Like in Figma */}
            <Card className="p-4 sm:p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg mb-2 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                    <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    {t('aiAssistant.instructions.title')}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('aiAssistant.instructions.description')}
                  </p>
                </div>

                <Separator className="bg-gray-200 dark:bg-gray-700" />

                <div className="space-y-2">
                  <Label htmlFor="instructions" className="text-gray-900 dark:text-gray-100">
                    {t('aiAssistant.instructions.label')}
                    <span className="text-gray-400 dark:text-gray-500 text-sm ml-2">({t('common.optional')})</span>
                  </Label>
                  <Textarea
                    id="instructions"
                    placeholder={t('aiAssistant.instructions.placeholder')}
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    rows={8}
                    className="resize-none border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('aiAssistant.instructions.characterCount', { count: (instructions || "").length.toString() })} • {t('aiAssistant.instructions.hint')}
                  </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-900 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      <p className="font-medium mb-2">{t('aiAssistant.instructions.tipsTitle')}</p>
                      <ul className="space-y-1.5 list-disc list-inside">
                        <li>{t('aiAssistant.instructions.tip1')}</li>
                        <li>{t('aiAssistant.instructions.tip2')}</li>
                        <li>{t('aiAssistant.instructions.tip3')}</li>
                        <li>{t('aiAssistant.instructions.tip4')}</li>
                        <li>{t('aiAssistant.instructions.tip5')}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Test AI - Like in Figma */}
            <Card className="p-4 sm:p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 border-indigo-200 dark:border-indigo-900">
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                  <TestTube className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-base sm:text-lg mb-1 text-gray-900 dark:text-gray-100">{t('aiAssistant.test.title')}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                    {t('aiAssistant.test.description')}
                  </p>
                </div>
                <Button
                  onClick={handleTest}
                  className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white"
                  disabled={!aiEnabled}
                  size="sm"
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  {t('aiAssistant.test.runTest')}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
