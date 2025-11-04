import { useState } from "react";
import {
  Bot,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  CheckCircle2,
  Power,
  Key,
  QrCode,
  Terminal,
  UserPlus,
  Shield,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  PlayCircle,
  ArrowRight,
} from "lucide-react";
import { PageTitle } from "./PageTitle";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { toastNotifications } from "./toast-notifications";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";

export function BotManagementPage() {
  // Bot state (simulating API data)
  const [botExists, setBotExists] = useState(false);
  const [adminLinked, setAdminLinked] = useState(false);
  const [currentStep, setCurrentStep] = useState("create"); // create, token, admin
  
  // Form states
  const [showToken, setShowToken] = useState(false);
  const [token, setToken] = useState("");
  const [botActive] = useState(true);
  const [botUsername] = useState("@BooklyTestOneBot");
  const [botLink] = useState("https://t.me/BooklyTestOneBot");
  const [adminAuthLink] = useState("https://t.me/BooklyTestOneBot?start=admin_auth_abc123xyz");

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toastNotifications.system.saved();
  };

  const handleValidateToken = () => {
    if (!token) {
      toastNotifications.errors.validation("Please enter a bot token");
      return;
    }
    toastNotifications.system.saved();
    setCurrentStep("admin");
  };

  const handleAdminAuth = () => {
    window.open(adminAuthLink, "_blank");
    setTimeout(() => {
      setAdminLinked(true);
      toastNotifications.system.saved();
    }, 2000);
  };

  const handleCreateBot = () => {
    setBotExists(true);
    setCurrentStep("create");
  };

  // Empty State - No bot created yet
  if (!botExists) {
    return (
      <div className="max-w-5xl mx-auto">
        <PageTitle
          icon={<Bot className="w-6 h-6 text-white" />}
          title="Bot Management"
          description="Configure and manage your Telegram bot integration"
        />

        <div className="mt-8">
          <Card className="p-12">
            <div className="text-center max-w-2xl mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Bot className="w-10 h-10 text-indigo-600" />
              </div>
              
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                No Bot Connected Yet
              </h2>
              <p className="text-gray-600 mb-8">
                You haven't set up your Telegram bot yet. Follow our simple step-by-step guide to create and configure your bot in minutes.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <button
                  onClick={handleCreateBot}
                  className="p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors cursor-pointer border-2 border-transparent hover:border-indigo-200 text-center"
                >
                  <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center mx-auto mb-2">
                    1
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-1">Create Bot</p>
                  <p className="text-xs text-gray-600">Use @BotFather</p>
                </button>

                <button
                  onClick={handleCreateBot}
                  className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors cursor-pointer border-2 border-transparent hover:border-purple-200 text-center"
                >
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-2">
                    2
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-1">Add Token</p>
                  <p className="text-xs text-gray-600">Configure bot</p>
                </button>

                <button
                  onClick={handleCreateBot}
                  className="p-4 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors cursor-pointer border-2 border-transparent hover:border-pink-200 text-center"
                >
                  <div className="w-8 h-8 bg-pink-600 text-white rounded-full flex items-center justify-center mx-auto mb-2">
                    3
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-1">Link Admin</p>
                  <p className="text-xs text-gray-600">Authorize access</p>
                </button>
              </div>

              <Button
                onClick={handleCreateBot}
                size="lg"
                className="bg-indigo-600 hover:bg-indigo-700 h-12 px-8"
              >
                <PlayCircle className="w-5 h-5 mr-2" />
                Start Bot Setup
              </Button>

              <p className="text-sm text-gray-500 mt-4">
                Setup takes approximately 5 minutes
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Main Bot Management Interface with Tabs
  const getStepStatus = (step: string) => {
    const steps = {
      create: botExists,
      token: botExists,
      admin: adminLinked,
    };
    return steps[step as keyof typeof steps];
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <PageTitle
          icon={<Bot className="w-6 h-6 text-white" />}
          title="Bot Management"
          description="Configure and manage your Telegram bot integration"
        />
        
        {/* Demo Controls */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setBotExists(false);
              setAdminLinked(false);
              setCurrentStep("create");
            }}
          >
            Reset to Empty
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setAdminLinked(!adminLinked);
            }}
          >
            Toggle Admin: {adminLinked ? "Linked" : "Not Linked"}
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              botActive ? 'bg-emerald-100' : 'bg-gray-100'
            }`}>
              <Power className={`w-5 h-5 ${botActive ? 'text-emerald-600' : 'text-gray-400'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-600">Status</p>
              <p className="font-medium text-gray-900">
                {botActive ? "Active" : "Inactive"}
              </p>
            </div>
            {botActive && (
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse mt-2" />
            )}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-600">Bot</p>
              <p className="font-medium text-gray-900 truncate">{botUsername}</p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              adminLinked ? 'bg-purple-100' : 'bg-amber-100'
            }`}>
              <Shield className={`w-5 h-5 ${adminLinked ? 'text-purple-600' : 'text-amber-600'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-600">Admin</p>
              <p className="font-medium text-gray-900">
                {adminLinked ? 'Linked' : 'Not Linked'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Admin Not Linked Alert */}
      {!adminLinked && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-900">
            <div className="flex items-center justify-between">
              <span>
                <strong>Action Required:</strong> Admin account not linked. Complete Step 3 to authorize admin access.
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentStep("admin")}
                className="ml-4 border-amber-300 hover:bg-amber-100"
              >
                Link Admin
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Step-by-Step Tabs */}
      <Tabs value={currentStep} onValueChange={setCurrentStep}>
        <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-gray-100">
          <TabsTrigger value="create" className="flex items-center gap-2 py-3">
            {getStepStatus('create') ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center text-xs text-gray-400">
                1
              </div>
            )}
            <span className="hidden sm:inline">1. Create Bot</span>
            <span className="sm:hidden">1</span>
          </TabsTrigger>
          
          <TabsTrigger value="token" className="flex items-center gap-2 py-3">
            {getStepStatus('token') ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center text-xs text-gray-400">
                2
              </div>
            )}
            <span className="hidden sm:inline">2. Add Token</span>
            <span className="sm:hidden">2</span>
          </TabsTrigger>
          
          <TabsTrigger value="admin" className="flex items-center gap-2 py-3">
            {adminLinked ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-amber-500 flex items-center justify-center text-xs text-amber-500">
                3
              </div>
            )}
            <span className="hidden sm:inline">3. Link Admin</span>
            <span className="sm:hidden">3</span>
          </TabsTrigger>
        </TabsList>

        {/* Step 1: Create Bot */}
        <TabsContent value="create" className="mt-6">
          <Card className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold text-lg">
                1
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Create Your Telegram Bot</h2>
                <p className="text-gray-600">Use BotFather to create a new bot</p>
              </div>
            </div>

            <div className="space-y-6">
              <Alert className="border-blue-200 bg-blue-50">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-900 text-sm">
                  BotFather is Telegram's official bot for creating and managing bots. This process is quick and easy.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                  <ChevronRight className="w-5 h-5 text-indigo-600" />
                  Step-by-Step Instructions
                </h3>
                
                <div className="space-y-3 pl-7">
                  <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm flex-shrink-0">
                      1
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 mb-1">Open Telegram</p>
                      <p className="text-sm text-gray-600">
                        Search for <code className="px-2 py-1 bg-white rounded border text-indigo-600">@BotFather</code> in the Telegram search bar
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm flex-shrink-0">
                      2
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 mb-1">Start Conversation</p>
                      <p className="text-sm text-gray-600">
                        Click "Start" and send the command <code className="px-2 py-1 bg-white rounded border text-indigo-600">/newbot</code>
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm flex-shrink-0">
                      3
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 mb-1">Choose Bot Name</p>
                      <p className="text-sm text-gray-600">
                        BotFather will ask for a name (e.g., "My Booking Bot") and a username (must end with "bot", e.g., "mybooking_bot")
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm flex-shrink-0">
                      4
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 mb-1">Get Bot Token</p>
                      <p className="text-sm text-gray-600">
                        BotFather will provide an API token like <code className="px-2 py-1 bg-white rounded border text-xs">123456789:ABCdefGHIjklmn...</code>
                      </p>
                      <p className="text-sm text-amber-700 mt-2">
                        ⚠️ Keep this token safe and never share it publicly!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => window.open("https://t.me/BotFather", "_blank")}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open BotFather
                </Button>
                
                <Button
                  onClick={() => setCurrentStep("token")}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  Next: Add Token
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Step 2: Add Token */}
        <TabsContent value="token" className="mt-6">
          <Card className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold text-lg">
                2
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Add Bot Token</h2>
                <p className="text-gray-600">Enter the token you received from BotFather</p>
              </div>
            </div>

            <div className="space-y-6">
              <Alert className="border-amber-200 bg-amber-50">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-900 text-sm">
                  <strong>Security Note:</strong> Your bot token is like a password. Keep it secure and never commit it to public repositories.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="bot-token" className="text-base font-medium">
                    Bot Token <span className="text-red-500">*</span>
                  </Label>
                  <p className="text-sm text-gray-600 mt-1 mb-3">
                    The token should look like: <code className="text-xs bg-gray-100 px-2 py-1 rounded">123456789:ABCdefGHIjklmnOPQRstuvwxyz</code>
                  </p>
                  <div className="relative">
                    <Input
                      id="bot-token"
                      type={showToken ? "text" : "password"}
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="Paste your bot token here"
                      className="pr-10 font-mono text-sm h-12"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowToken(!showToken)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                    >
                      {showToken ? (
                        <EyeOff className="w-4 h-4 text-gray-500" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2">What happens when you validate?</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• We'll verify the token with Telegram</li>
                    <li>• Bot information will be retrieved</li>
                    <li>• Webhook will be configured automatically</li>
                    <li>• Connection will be established</li>
                  </ul>
                </div>

                {/* Demo Helper */}
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-purple-900 mb-1">Demo Mode</h4>
                      <p className="text-sm text-purple-800">Quick fill with test token</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setToken("123456789:ABCdefGHIjklmnOPQRstuvwxyz123456")}
                      className="border-purple-300 hover:bg-purple-100"
                    >
                      Fill Test Token
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep("create")}
                >
                  <ChevronRight className="w-4 h-4 mr-2 rotate-180" />
                  Back
                </Button>
                
                <Button
                  onClick={handleValidateToken}
                  disabled={!token || token.length < 20}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  <Key className="w-4 h-4 mr-2" />
                  Validate & Configure Bot
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Step 3: Link Admin */}
        <TabsContent value="admin" className="mt-6">
          <Card className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold text-lg">
                3
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Link Admin Account</h2>
                <p className="text-gray-600">Authorize your Telegram account as administrator</p>
              </div>
            </div>

            <div className="space-y-6">
              {!adminLinked ? (
                <>
                  <Alert className="border-amber-200 bg-amber-50">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-900 text-sm">
                      <strong>Important:</strong> Only authorized admins can access this management panel. Complete this step to enable admin access.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border-2 border-dashed border-indigo-200">
                      <h3 className="font-medium text-gray-900 mb-4 text-center">Scan QR Code or Click Button</h3>
                      
                      {/* QR Code */}
                      <div className="flex flex-col items-center mb-4">
                        <div className="w-48 h-48 bg-white rounded-lg shadow-md p-3">
                          <div className="w-full h-full bg-gradient-to-br from-indigo-600 to-purple-600 rounded flex items-center justify-center">
                            <QrCode className="w-24 h-24 text-white" />
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 text-center mt-3">
                          Scan with Telegram mobile app
                        </p>
                      </div>

                      <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-4 bg-gradient-to-br from-indigo-50 to-purple-50 text-gray-600">or</span>
                        </div>
                      </div>

                      {/* Authorization Buttons */}
                      <div className="space-y-3">
                        <Button
                          onClick={handleAdminAuth}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 h-12"
                        >
                          <UserPlus className="w-5 h-5 mr-2" />
                          Authorize as Admin
                        </Button>

                        <Button
                          variant="outline"
                          onClick={() => handleCopy(adminAuthLink, "Admin link")}
                          className="w-full h-12"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Authorization Link
                        </Button>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-900 mb-2">How it works:</h4>
                      <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                        <li>Click "Authorize as Admin" button</li>
                        <li>You'll be redirected to Telegram</li>
                        <li>Click "Start" in the bot conversation</li>
                        <li>Your account will be linked automatically</li>
                      </ol>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep("token")}
                    >
                      <ChevronRight className="w-4 h-4 mr-2 rotate-180" />
                      Back
                    </Button>
                    
                    <p className="text-sm text-gray-500">Complete authorization to continue</p>
                  </div>
                </>
              ) : (
                <>
                  <Alert className="border-emerald-200 bg-emerald-50">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <AlertDescription className="text-emerald-900">
                      <strong>Success!</strong> Your admin account has been linked. You now have full access to the bot management panel.
                    </AlertDescription>
                  </Alert>

                  <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg border border-emerald-200 text-center">
                    <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Setup Complete!</h3>
                    <p className="text-gray-600 mb-4">
                      Your Telegram bot is fully configured and ready to use.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-3 max-w-md mx-auto mt-6">
                      <Button
                        variant="outline"
                        onClick={() => window.open(botLink, "_blank")}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open Bot
                      </Button>
                      <Button
                        onClick={() => handleCopy(botLink, "Bot link")}
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Share Bot
                      </Button>
                    </div>
                  </div>

                  {/* Bot Commands Reference */}
                  <Card className="p-6 bg-gray-50">
                    <div className="flex items-center gap-3 mb-4">
                      <Terminal className="w-5 h-5 text-indigo-600" />
                      <h3 className="font-medium text-gray-900">Available Bot Commands</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { cmd: "/start", desc: "Start conversation" },
                        { cmd: "/book", desc: "Create appointment" },
                        { cmd: "/my", desc: "View appointments" },
                        { cmd: "/cancel", desc: "Cancel appointment" },
                      ].map(({ cmd, desc }) => (
                        <div
                          key={cmd}
                          className="flex items-center justify-between p-3 bg-white rounded-lg group hover:bg-gray-50 transition-colors"
                        >
                          <div>
                            <code className="text-sm font-medium text-indigo-600">{cmd}</code>
                            <p className="text-xs text-gray-600 mt-0.5">{desc}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(cmd, "Command")}
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </Card>
                </>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
