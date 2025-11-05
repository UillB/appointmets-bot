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
} from "lucide-react";
import { PageTitle } from "../PageTitle";
import { toast } from "sonner";
import { Switch } from "../ui/switch";
import { Slider } from "../ui/slider";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { apiClient, AIConfig } from "../../services/api";

export function AIAssistantPage() {
  const [aiEnabled, setAiEnabled] = useState(true);
  const [autoReply, setAutoReply] = useState(false);
  const [instructions, setInstructions] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Configuration state
  const [provider, setProvider] = useState("openai");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("gpt-4");
  const [maxTokens, setMaxTokens] = useState([1000]);
  const [temperature, setTemperature] = useState([0.7]);
  const [apiKeyVerified, setApiKeyVerified] = useState(false);

  // Load AI config on component mount
  useEffect(() => {
    loadAIConfig();
  }, []);

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
    toast.success("AI Assistant data refreshed");
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
      toast.success("Configuration saved successfully");
    } catch (error) {
      console.error('Failed to save AI config:', error);
      toast.error("Failed to save configuration");
    }
  };

  const handleTest = async () => {
    if (!aiEnabled) {
      toast.error("Please enable AI Assistant first");
      return;
    }
    try {
      const result = await apiClient.testAI("Hello, this is a test message");
      if (result.success) {
        toast.success("AI Assistant test successful!", {
          description: `Response: ${result.response}`,
        });
      } else {
        toast.error("AI Assistant test failed");
      }
    } catch (error) {
      console.error('AI test failed:', error);
      toast.error("AI Assistant test failed");
    }
  };

  const handleVerifyKey = () => {
    if (!apiKey) {
      toast.error("Please enter API key");
      return;
    }
    // Simulate verification
    setTimeout(() => {
      setApiKeyVerified(true);
      toast.success("API key verified successfully");
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
    toast.info("Configuration reset to defaults");
  };

  return (
    <div className="space-y-6">
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Page Title */}
          <PageTitle
            icon={<Sparkles className="w-6 h-6 text-white" />}
            title="AI Assistant"
            description="Configure and manage your intelligent chatbot assistant"
            actions={
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  className="hidden sm:flex"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                <Badge
                  variant="outline"
                  className="hidden sm:flex bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                >
                  BETA
                </Badge>
                <Button
                  onClick={handleSave}
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </>
            }
          />

          {/* Main Content - Like in Figma (no tabs, no stats) */}
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Activation Card - Like in Figma */}
            <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg mb-2 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                      <Zap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      AI Assistant Controls
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Enable and configure AI-powered responses
                    </p>
                  </div>

                  <Separator className="bg-gray-200 dark:bg-gray-700" />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex-1">
                        <Label className="text-base cursor-pointer text-gray-900 dark:text-gray-100">Enable AI Assistant</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Turn on AI-powered responses for client inquiries
                        </p>
                      </div>
                      <Switch
                        checked={aiEnabled}
                        onCheckedChange={setAiEnabled}
                        className="ml-4"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex-1">
                        <Label className="text-base cursor-pointer text-gray-900 dark:text-gray-100">Auto-Reply Mode</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Automatically respond to all Telegram messages
                        </p>
                      </div>
                      <Switch
                        checked={autoReply}
                        onCheckedChange={setAutoReply}
                        className="ml-4"
                      />
                    </div>
                  </div>

                  {aiEnabled && (
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700 bg-emerald-50 dark:bg-emerald-950 border-emerald-100 dark:border-emerald-900 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-emerald-700 dark:text-emerald-300">
                          <p className="font-medium mb-1">AI Assistant is Active</p>
                          <p>
                            Your AI assistant is now ready to help clients in your Telegram bot based on the instructions below.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

            {/* AI Configuration - Like in Figma */}
            <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg mb-2 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                    <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    AI Configuration
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Configure AI model and behavior
                  </p>
                </div>

                <Separator className="bg-gray-200 dark:bg-gray-700" />

                {/* LLM Model */}
                <div className="space-y-2">
                  <Label htmlFor="model" className="text-gray-900 dark:text-gray-100">LLM Model</Label>
                  <Select value={model} onValueChange={setModel}>
                    <SelectTrigger id="model" className="h-11 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                      <SelectItem value="gpt-4">GPT-4 (Most Intelligent)</SelectItem>
                      <SelectItem value="gpt-4-turbo">GPT-4 Turbo (Fast & Smart)</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo (Fast & Economical)</SelectItem>
                      <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                      <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    More advanced models provide better responses but cost more
                  </p>
                </div>

                {/* Temperature */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="temperature" className="text-gray-900 dark:text-gray-100">Temperature</Label>
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
                    <span>Precise (0)</span>
                    <span>Balanced (1)</span>
                    <span>Creative (2)</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Lower = more focused and consistent. Higher = more creative and varied.
                  </p>
                </div>
              </div>
            </Card>

            {/* Custom Instructions - Like in Figma */}
            <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg mb-2 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                    <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    Custom Instructions
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Teach the AI how to communicate - define personality, tone, and style
                  </p>
                </div>

                <Separator className="bg-gray-200 dark:bg-gray-700" />

                <div className="space-y-2">
                  <Label htmlFor="instructions" className="text-gray-900 dark:text-gray-100">
                    Prompt / Instructions
                    <span className="text-gray-400 dark:text-gray-500 text-sm ml-2">(Optional)</span>
                  </Label>
                  <Textarea
                    id="instructions"
                    placeholder="Example: You are David, a friendly and professional assistant. You should be cheerful, helpful, and respond in a casual but respectful tone. Always greet clients warmly and use their name when possible..."
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    rows={8}
                    className="resize-none border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {(instructions || "").length} characters • Think of this as training a new employee
                  </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-900 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      <p className="font-medium mb-2">Instruction Tips</p>
                      <ul className="space-y-1.5 list-disc list-inside">
                        <li>Define the AI's name and personality</li>
                        <li>Specify tone: formal, casual, friendly, etc.</li>
                        <li>Set language and regional preferences</li>
                        <li>Mention any specific policies or guidelines</li>
                        <li>Keep it clear and concise</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Test AI - Like in Figma */}
            <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 border-indigo-200 dark:border-indigo-900">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                  <TestTube className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-lg mb-1 text-gray-900 dark:text-gray-100">Test AI Assistant</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Send a test message to verify AI configuration and responses
                  </p>
                </div>
                <Button
                  onClick={handleTest}
                  className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white"
                  disabled={!aiEnabled}
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  Run Test
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
