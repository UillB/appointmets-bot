import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
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
  Save,
  TestTube,
  Brain,
  Info,
  AlertCircle,
  Crown,
  CheckCircle2,
  Zap,
  MessageSquare,
  Shield,
} from "lucide-react";
import { PageTitle } from "./PageTitle";
import { toast } from "sonner@2.0.3";
import { Switch } from "./ui/switch";
import { Slider } from "./ui/slider";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

interface AIAssistantPageProps {}

export function AIAssistantPage({}: AIAssistantPageProps) {
  const [aiEnabled, setAiEnabled] = useState(false);
  const [autoReply, setAutoReply] = useState(false);
  const [instructions, setInstructions] = useState("");
  const [model, setModel] = useState("gpt-4");
  const [temperature, setTemperature] = useState([0.7]);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [testResponse, setTestResponse] = useState("");
  const [testLoading, setTestLoading] = useState(false);

  const handleSave = () => {
    toast.success("AI Assistant configuration saved successfully");
  };

  const handleTest = () => {
    if (!aiEnabled) {
      toast.error("Please enable AI Assistant first");
      return;
    }
    
    setTestDialogOpen(true);
    setTestLoading(true);
    setTestResponse("");
    
    // Simulate AI response
    setTimeout(() => {
      setTestResponse(
        "Hello! I'm your AI assistant. I can help you with:\n\n" +
        "✅ Answering questions about your services\n" +
        "✅ Helping clients book appointments\n" +
        "✅ Providing information about your business hours\n" +
        "✅ Managing appointment confirmations\n\n" +
        "I'm ready to assist your clients 24/7! 🚀"
      );
      setTestLoading(false);
    }, 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageTitle
        icon={<Sparkles className="w-6 h-6 text-white" />}
        title="AI Assistant"
        description="Intelligent chatbot for automated client support"
        actions={
          <>
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 gap-1">
              <Crown className="w-3 h-3" />
              PRO Feature
            </Badge>
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

      {/* PRO Feature Notice */}
      <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 border-amber-200 dark:border-amber-900">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg mb-2 flex items-center gap-2 text-gray-900 dark:text-gray-100">
              Professional Feature
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              AI Assistant is available on Professional and Enterprise plans. Upgrade to unlock automated intelligent responses for your clients.
            </p>
            <Button size="sm" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Pro
            </Button>
          </div>
        </div>
      </Card>

      {/* How It Works */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-900">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
            <Info className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg mb-3 text-gray-900 dark:text-gray-100">How AI Assistant Works</h3>
            <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Already Knows Your Business</p>
                  <p className="text-gray-600 dark:text-gray-300">AI has access to all your appointments, services, schedule, and organization data from this system</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Teach It Your Personality</p>
                  <p className="text-gray-600 dark:text-gray-300">Add custom instructions below to define how the AI should communicate - like training a human employee</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Automated Responses</p>
                  <p className="text-gray-600 dark:text-gray-300">When enabled, AI automatically answers client questions, helps with bookings, and provides information 24/7</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Activation Toggles */}
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
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors">
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

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors">
              <div className="flex-1">
                <Label className="text-base cursor-pointer text-gray-900 dark:text-gray-100">Auto-Reply Mode</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Automatically respond to all Telegram messages
                </p>
              </div>
              <Switch
                checked={autoReply}
                onCheckedChange={setAutoReply}
                disabled={!aiEnabled}
                className="ml-4"
              />
            </div>
          </div>

          {aiEnabled && (
            <div className="pt-4 border-t bg-emerald-50 dark:bg-emerald-950 border-emerald-100 dark:border-emerald-900 rounded-lg p-4">
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

      {/* AI Configuration */}
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
              <SelectTrigger id="model" className="h-11 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
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
                {temperature[0].toFixed(1)}
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

      {/* Custom Instructions */}
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
              className="resize-none border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {instructions.length} characters • Think of this as training a new employee
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

      {/* Test AI */}
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
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg"
            disabled={!aiEnabled}
          >
            <TestTube className="w-4 h-4 mr-2" />
            Run Test
          </Button>
        </div>
      </Card>

      {/* Best Practices Warning */}
      <Card className="p-6 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-900">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-700 dark:text-amber-300">
            <p className="font-medium mb-2">Before Enabling Auto-Reply</p>
            <ul className="space-y-1.5 list-disc list-inside">
              <li>Test the AI thoroughly with different questions</li>
              <li>Review generated responses for accuracy</li>
              <li>Start with manual mode before enabling auto-reply</li>
              <li>Monitor AI conversations regularly</li>
              <li>Have a human backup plan for complex issues</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Test Dialog */}
      <Dialog open={testDialogOpen} onOpenChange={setTestDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TestTube className="w-5 h-5 text-indigo-600" />
              AI Assistant Test
            </DialogTitle>
            <DialogDescription>
              Testing AI configuration with a sample message
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Test Message */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-2">Test Message:</p>
              <p className="text-gray-900">"Hello! Can you tell me about your services?"</p>
            </div>

            {/* AI Response */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-4 min-h-[120px]">
              <p className="text-sm text-gray-500 mb-2">AI Response:</p>
              {testLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce delay-200" />
                  <span className="text-sm text-gray-600 ml-2">AI is thinking...</span>
                </div>
              ) : (
                <p className="text-gray-900 whitespace-pre-line">{testResponse}</p>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setTestDialogOpen(false)}
                variant="outline"
                className="flex-1"
              >
                Close
              </Button>
              <Button
                onClick={handleTest}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                disabled={testLoading}
              >
                Test Again
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
