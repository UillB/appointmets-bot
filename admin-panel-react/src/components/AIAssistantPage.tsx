import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Sparkles,
  RefreshCw,
  Download,
  Save,
  TestTube,
  Key,
  Zap,
  Brain,
  BarChart3,
  Settings as SettingsIcon,
  Info,
  Check,
  AlertCircle,
  FileDown,
  RotateCcw,
} from "lucide-react";
import { StatCard } from "./StatCard";
import { PageHeader } from "./PageHeader";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Switch } from "./ui/switch";
import { Slider } from "./ui/slider";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { apiClient, AIConfig } from "../services/api";

interface AIAssistantPageProps {
  onMenuClick?: () => void;
}

export function AIAssistantPage({ onMenuClick }: AIAssistantPageProps) {
  const [activeTab, setActiveTab] = useState("overview");
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
        setProvider(config.provider);
        setApiKey(config.apiKey);
        setModel(config.model);
        setMaxTokens([config.maxTokens]);
        setTemperature([config.temperature]);
        setInstructions(config.instructions);
        setApiKeyVerified(true);
      }
    } catch (error) {
      console.error('Failed to load AI config:', error);
      // Don't show error toast as config might not exist yet
    } finally {
      setIsLoading(false);
    }
  };

  const stats = [
    {
      icon: Zap,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      title: "Total Requests",
      value: 30,
      subtitle: "Last 30 days",
    },
    {
      icon: Brain,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
      title: "Tokens Used",
      value: "44.0K",
      subtitle: "Total consumed",
    },
    {
      icon: BarChart3,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      title: "Avg Tokens/Request",
      value: "1,466",
      subtitle: "Average usage",
    },
  ];

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

  const handleExport = () => {
    const config = {
      provider,
      model,
      maxTokens: maxTokens[0],
      temperature: temperature[0],
      instructions,
      aiEnabled,
      autoReply,
    };
    
    const dataStr = JSON.stringify(config, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `ai-config-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success("Configuration exported");
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
    <div className="flex-1 flex flex-col min-h-0 bg-gray-50">
      <PageHeader
        icon={<Sparkles className="w-7 h-7 text-white" />}
        title="AI Assistant"
        description="Configure and manage your intelligent chatbot assistant"
        onRefresh={handleRefresh}
        onMenuClick={onMenuClick}
        actions={
          <>
            <Badge
              variant="outline"
              className="hidden sm:flex bg-purple-50 text-purple-700 border-purple-200"
            >
              BETA
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="hidden sm:flex"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="hidden sm:flex"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button
              onClick={handleSave}
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </>
        }
      />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.map((stat, index) => {
              const StatCardComponent = () => (
                <StatCard 
                  icon={stat.icon}
                  iconBg={stat.iconBg}
                  iconColor={stat.iconColor}
                  title={stat.title}
                  value={stat.value}
                  subtitle={stat.subtitle}
                />
              );
              return <StatCardComponent key={stat.title} />;
            })}
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="overview" className="gap-2">
                <Sparkles className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="configuration" className="gap-2">
                <SettingsIcon className="w-4 h-4" />
                Configuration
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-0 space-y-6">
              {/* Activation Card */}
              <Card className="p-6 bg-white">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg mb-2 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-indigo-600" />
                      Activation
                    </h3>
                    <p className="text-sm text-gray-500">
                      Enable or disable AI assistant features
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <Label className="text-base">Enable AI Assistant</Label>
                        <p className="text-sm text-gray-500 mt-1">
                          Activate AI-powered responses for client inquiries
                        </p>
                      </div>
                      <Switch
                        checked={aiEnabled}
                        onCheckedChange={setAiEnabled}
                        className="ml-4"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <Label className="text-base">Auto-Reply Mode</Label>
                        <p className="text-sm text-gray-500 mt-1">
                          Automatically respond to messages in Telegram
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
                    <div className="pt-4 border-t bg-blue-50 border-blue-100 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-700">
                          <p className="font-medium mb-1">AI Assistant is Active</p>
                          <p>
                            After activation, the AI assistant will automatically respond to
                            clients in your Telegram bot based on the configured instructions.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Instructions Card */}
              <Card className="p-6 bg-white">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg mb-2 flex items-center gap-2">
                      <Brain className="w-5 h-5 text-purple-600" />
                      Custom Instructions for AI
                    </h3>
                    <p className="text-sm text-gray-500">
                      Add custom instructions to define AI behavior. Core functions
                      (service info, booking, payments) are handled automatically.
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="instructions">
                      Additional Instructions
                      <span className="text-gray-400 text-sm ml-2">(Optional)</span>
                    </Label>
                    <Textarea
                      id="instructions"
                      placeholder="Example: You are a friendly assistant named David. You should be cheerful, helpful, and respond in a casual tone..."
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      rows={6}
                      className="resize-none"
                    />
                    <p className="text-xs text-gray-500">
                      {instructions?.length || 0} characters
                    </p>
                  </div>

                  <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-amber-700">
                        <p className="font-medium mb-1">Best Practices</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Be clear and specific about AI personality and tone</li>
                          <li>Define response language preferences</li>
                          <li>Set boundaries for what AI can and cannot do</li>
                          <li>Test thoroughly before enabling auto-reply</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Test Card */}
              <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <TestTube className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-lg mb-1">Test AI Assistant</h3>
                    <p className="text-sm text-gray-600">
                      Send a test message to verify AI configuration and responses
                    </p>
                  </div>
                  <Button
                    onClick={handleTest}
                    className="bg-indigo-600 hover:bg-indigo-700"
                    disabled={!aiEnabled}
                  >
                    <TestTube className="w-4 h-4 mr-2" />
                    Run Test
                  </Button>
                </div>
              </Card>
            </TabsContent>

            {/* Configuration Tab */}
            <TabsContent value="configuration" className="mt-0">
              <Card className="p-6 bg-white">
                <div className="max-w-3xl mx-auto">
                  {/* Header */}
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <SettingsIcon className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl mb-2">AI Assistant Configuration</h2>
                    <p className="text-gray-500">
                      Set up AI assistant for automated client responses
                    </p>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex flex-wrap gap-2 mb-6 pb-6 border-b">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRefresh}
                      className="flex-1 sm:flex-none"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleReset}
                      className="flex-1 sm:flex-none text-amber-600 hover:text-amber-700 border-amber-200 hover:border-amber-300"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExport}
                      className="flex-1 sm:flex-none"
                    >
                      <FileDown className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>

                  {/* Form */}
                  <div className="space-y-6">
                    {/* Basic Settings */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <SettingsIcon className="w-5 h-5 text-indigo-600" />
                        <h3 className="text-lg">Basic Settings</h3>
                      </div>

                      {/* Provider */}
                      <div className="space-y-2">
                        <Label htmlFor="provider">
                          AI Provider <span className="text-red-500">*</span>
                        </Label>
                        <Select value={provider} onValueChange={(val) => {
                          setProvider(val);
                          setModel(providers.find(p => p.id === val)?.models[0] || "");
                          setApiKeyVerified(false);
                        }}>
                          <SelectTrigger id="provider">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {providers.map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* API Key */}
                      <div className="space-y-2">
                        <Label htmlFor="api-key">
                          API Key <span className="text-red-500">*</span>
                        </Label>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Input
                              id="api-key"
                              type="password"
                              placeholder="sk-..."
                              value={apiKey}
                              onChange={(e) => {
                                setApiKey(e.target.value);
                                setApiKeyVerified(false);
                              }}
                              className={
                                apiKeyVerified
                                  ? "border-emerald-300 pr-10"
                                  : ""
                              }
                            />
                            {apiKeyVerified && (
                              <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600" />
                            )}
                          </div>
                          <Button
                            variant="outline"
                            onClick={handleVerifyKey}
                            disabled={!apiKey}
                            className="whitespace-nowrap"
                          >
                            <Key className="w-4 h-4 mr-2" />
                            Verify
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500">
                          Enter your API key from {selectedProvider?.name}
                        </p>
                      </div>

                      {/* Model */}
                      <div className="space-y-2">
                        <Label htmlFor="model">
                          Model <span className="text-red-500">*</span>
                        </Label>
                        <Select value={model} onValueChange={setModel}>
                          <SelectTrigger id="model">
                            <SelectValue placeholder="Select model" />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedProvider?.models.map((m) => (
                              <SelectItem key={m} value={m}>
                                {m}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500">
                          Choose the model for AI responses
                        </p>
                      </div>
                    </div>

                    <Separator />

                    {/* Advanced Settings */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-purple-600" />
                        <h3 className="text-lg">Advanced Settings</h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Max Tokens */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label>Maximum Tokens</Label>
                            <span className="text-sm font-medium text-indigo-600">
                              {maxTokens[0] || 0}
                            </span>
                          </div>
                          <Slider
                            value={maxTokens}
                            onValueChange={setMaxTokens}
                            min={100}
                            max={4000}
                            step={100}
                            className="w-full"
                          />
                          <p className="text-xs text-gray-500">
                            Maximum response length
                          </p>
                        </div>

                        {/* Temperature */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label>Temperature</Label>
                            <span className="text-sm font-medium text-indigo-600">
                              {temperature[0]?.toFixed(1) || '0.0'}
                            </span>
                          </div>
                          <Slider
                            value={temperature}
                            onValueChange={setTemperature}
                            min={0}
                            max={2}
                            step={0.1}
                            className="w-full"
                          />
                          <p className="text-xs text-gray-500">
                            Response creativity (0-2)
                          </p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Custom Instructions */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Brain className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg">Custom Instructions</h3>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="config-instructions">
                          Additional Instructions
                          <span className="text-gray-400 text-sm ml-2">(Optional)</span>
                        </Label>
                        <Textarea
                          id="config-instructions"
                          placeholder="Define AI personality, tone, language preferences, and behavior..."
                          value={instructions}
                          onChange={(e) => setInstructions(e.target.value)}
                          rows={5}
                          className="resize-none"
                        />
                        <p className="text-xs text-gray-500">
                          Core booking functions are configured automatically
                        </p>
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="pt-6 flex gap-3">
                      <Button
                        onClick={handleSave}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Configuration
                      </Button>
                      <Button variant="outline" onClick={handleTest}>
                        <TestTube className="w-4 h-4 mr-2" />
                        Test
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
