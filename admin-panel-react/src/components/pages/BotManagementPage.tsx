import React, { useState, useEffect, useRef } from "react";
import {
  Bot,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  CheckCircle2,
  Power,
  RefreshCw,
  Download,
  Settings,
  HelpCircle,
  Building2,
  Link as LinkIcon,
  CheckCircle,
  BookOpen,
  Key,
  Settings as SettingsIcon,
  AlertCircle,
  Sparkles,
  Users,
  AtSign,
  Share2,
  QrCode,
  MessageCircle,
  Mail,
  ArrowRight,
  CheckCircle2 as CheckCircle2Icon,
} from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import { useLanguage } from "../../i18n";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Card } from "../ui/card";
import { PageHeader } from "../PageHeader";
import QRCode from "qrcode";

export function BotManagementPage() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Debug: log when language changes
  useEffect(() => {
    console.log('[BotManagementPage] Language changed to:', language);
  }, [language]);
  const [showToken, setShowToken] = useState(false);
  const [token, setToken] = useState("");
  const [botActive, setBotActive] = useState(false);
  const [setupProgress, setSetupProgress] = useState(0);
  const [botName, setBotName] = useState("");
  const [botDescription, setBotDescription] = useState("");
  const [botUsername, setBotUsername] = useState("");
  const [botLink, setBotLink] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [botStatus, setBotStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [organizationName, setOrganizationName] = useState("");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const qrCodeCanvasRef = useRef<HTMLCanvasElement>(null);
  const [activeTab, setActiveTab] = useState<string>("instructions");

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Load bot status on mount
  useEffect(() => {
    loadBotStatus();
  }, []);

  // Set default tab based on bot status
  useEffect(() => {
    if (!isLoading) {
      // If bot is active, show settings tab, otherwise show instructions
      setActiveTab(botActive ? "settings" : "instructions");
    }
  }, [botActive, isLoading]);

  // Update progress based on bot status
  useEffect(() => {
    if (botActive && botName && botUsername) {
      setSetupProgress(100);
    } else if (botName && botUsername && !botActive) {
      setSetupProgress(75);
    } else if (botName) {
      setSetupProgress(50);
    } else {
      setSetupProgress(0);
    }
  }, [botActive, botName, botUsername]);

  // Generate QR code when bot link is available
  useEffect(() => {
    if (botLink && botLink !== "https://t.me/") {
      generateQRCode();
    } else {
      setQrCodeDataUrl(null);
    }
  }, [botLink]);

  const generateQRCode = async () => {
    if (!botLink || botLink === "https://t.me/") return;
    
    try {
      const qrDataUrl = await QRCode.toDataURL(botLink, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      setQrCodeDataUrl(qrDataUrl);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      toast.error(t('botManagement.failedToGenerateQR'));
    }
  };

  const loadBotStatus = async () => {
    if (!user?.organizationId) {
      console.error('No organization ID available');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await apiClient.getBotStatus(user.organizationId);
      console.log('Bot status response:', response);
      
      if (response.success) {
        const { organization, botStatus: status } = response;
        
        // Set organization name
        if (organization?.name) {
          setOrganizationName(organization.name);
        }
        
        if (status) {
          setBotStatus(status);
          setBotActive(status.isActive);
          
          if (status.isActive) {
            setBotName(status.firstName || "");
            setBotUsername(`@${status.username}`);
            setBotLink(status.botLink || `https://t.me/${status.username}`);
          } else {
            // Bot is not active, reset progress
            setBotName("");
            setBotUsername("");
            setBotLink("");
          }
        } else {
          // No bot configured
          setBotActive(false);
          setBotName("");
          setBotUsername("");
          setBotLink("");
        }
      } else {
        // No bot configured
        setBotActive(false);
        setBotName("");
        setBotUsername("");
        setBotLink("");
      }
    } catch (error) {
      console.error('Failed to load bot status:', error);
      setBotActive(false);
      setSetupProgress(0);
      toast.error(t('botManagement.failedToLoadStatus'));
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const handleRefreshStatus = () => {
    loadBotStatus();
    toast.success(t('botManagement.statusUpdated'));
  };

  const handleValidateToken = async () => {
    if (!token.trim()) {
      toast.error(t('botManagement.enterBotToken'));
      return;
    }

    try {
      setIsValidating(true);
      const result = await apiClient.validateBotToken(token);
      
      if (result.success && result.bot) {
        setBotName(result.bot.first_name);
        setBotUsername(`@${result.bot.username}`);
        setBotLink(`https://t.me/${result.bot.username}`);
        setSetupProgress(50);
        toast.success(t('botManagement.tokenValid'));
      } else {
        toast.error(result.error || t('botManagement.invalidToken'));
      }
    } catch (error) {
      console.error('Token validation error:', error);
      toast.error(t('botManagement.tokenValidationError'));
    } finally {
      setIsValidating(false);
    }
  };

  const handleActivateBot = async () => {
    if (!token.trim()) {
      toast.error(t('botManagement.enterBotToken'));
      return;
    }

    if (!user?.organizationId) {
      toast.error(t('botManagement.organizationIdError'));
      return;
    }

    setIsActivating(true);
    try {
      console.log('🔄 Activating bot with token:', token.substring(0, 10) + '...');
      const result = await apiClient.activateBot(token, user.organizationId);
      console.log('📥 Activation result:', result);

      if (result && result.success) {
        setBotActive(true);
        setToken(""); // Очищаем токен после успешной активации
        toast.success(t('botManagement.botActivated'));
        // Обновляем статус через небольшую задержку
        setTimeout(() => {
          loadBotStatus();
        }, 1000);
      } else {
        const errorMsg = result?.error || t('botManagement.botActivationError');
        console.error('❌ Activation failed:', errorMsg);
        toast.error(errorMsg);
      }
    } catch (error: any) {
      console.error('❌ Bot activation error:', error);
      const errorMsg = error?.message || error?.error || t('botManagement.botActivationError');
      toast.error(errorMsg);
    } finally {
      // Всегда сбрасываем состояние загрузки
      setIsActivating(false);
    }
  };

  const handleUpdateBotSettings = async () => {
    if (!user?.organizationId) {
      toast.error(t('botManagement.organizationIdError'));
      return;
    }

    try {
      setIsActivating(true);
      const result = await apiClient.updateBotSettings(user.organizationId, {
        name: botName,
        description: botDescription
      });

      if (result.success) {
        toast.success(t('botManagement.botSettingsUpdated'));
        loadBotStatus();
      } else {
        toast.error(result.error || t('botManagement.botSettingsUpdateError'));
      }
    } catch (error) {
      console.error('Bot settings update error:', error);
      toast.error(t('botManagement.botSettingsUpdateError'));
    } finally {
      setIsActivating(false);
    }
  };


  const handleHelp = () => {
    setActiveTab("instructions");
    toast.info(t('botManagement.instructionsOpened'), {
      description: t('botManagement.instructionsDescription'),
      duration: 3000,
    });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(botLink);
    toast.success(t('botManagement.linkCopied'));
  };

  const handleOpenBot = () => {
    window.open(botLink, "_blank");
    toast.info(t('botManagement.openingBot'));
  };


  const handleDownloadQR = async () => {
    if (!qrCodeDataUrl) {
      toast.error("QR-код не сгенерирован");
      return;
    }

    try {
      const link = document.createElement('a');
      link.download = `bot-qr-${botUsername.replace('@', '') || 'code'}.png`;
      link.href = qrCodeDataUrl;
      link.click();
      toast.success(t('botManagement.qrCodeDownloaded'), {
        description: t('botManagement.qrCodeDownloadedDescription'),
      });
    } catch (error) {
      console.error('Failed to download QR code:', error);
      toast.error(t('botManagement.qrCodeCopyFailed'));
    }
  };

  const handleCopyQRCode = async () => {
    if (!qrCodeDataUrl) {
      toast.error("QR-код не сгенерирован");
      return;
    }

    try {
      // Convert data URL to blob
      const response = await fetch(qrCodeDataUrl);
      const blob = await response.blob();
      
      // Copy to clipboard using Clipboard API
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      
      toast.success(t('botManagement.qrCodeCopied'), {
        description: t('botManagement.qrCodeCopiedDescription'),
        duration: 3000,
      });
    } catch (error) {
      console.error('Failed to copy QR code:', error);
      // Fallback: try to copy as image element
      try {
        const img = new Image();
        img.src = qrCodeDataUrl;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            canvas.toBlob(async (blob) => {
              if (blob) {
                await navigator.clipboard.write([
                  new ClipboardItem({ 'image/png': blob })
                ]);
                toast.success(t('botManagement.qrCodeCopied'), {
                  description: t('botManagement.qrCodeCopiedDescription'),
                  duration: 3000,
                });
              }
            });
          }
        };
      } catch (fallbackError) {
        toast.error(t('botManagement.qrCodeCopyFailed'), {
          description: t('botManagement.qrCodeCopyFailedDescription'),
        });
      }
    }
  };

  const handleShareToTelegram = () => {
    if (!botLink) {
      toast.error(t('botManagement.botLinkNotAvailable'));
      return;
    }
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(botLink)}&text=${encodeURIComponent(`Проверьте нашего Telegram бота: ${botUsername || 'бот'}`)}`;
    window.open(telegramUrl, '_blank');
    toast.success(t('botManagement.shareToTelegram'));
  };

  const handleShareToWhatsApp = () => {
    if (!botLink) {
      toast.error(t('botManagement.botLinkNotAvailable'));
      return;
    }
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`Проверьте нашего Telegram бота: ${botLink}`)}`;
    window.open(whatsappUrl, '_blank');
    toast.success(t('botManagement.shareToWhatsApp'));
  };

  const handleShareToEmail = () => {
    if (!botLink) {
      toast.error(t('botManagement.botLinkNotAvailable'));
      return;
    }
    const subject = encodeURIComponent(`Telegram бот для записи`);
    const body = encodeURIComponent(`Привет!\n\nПроверьте нашего Telegram бота для записи на прием:\n${botLink}\n\nИспользуйте QR-код для быстрого доступа.`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    toast.success(t('botManagement.shareToEmail'));
  };



  // Show loading if user is not loaded yet
  if (!user) {
    return (
      <div className="space-y-6">
        <PageHeader
          icon={<Bot className="w-7 h-7 text-white" />}
          title="Bot Management"
          description="Create and configure Telegram bot for automatic client booking"
        />
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">{t('botManagement.loadingUser')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Bot className="w-7 h-7 text-white" />}
        title={t('botManagement.title')}
        description={t('botManagement.description')}
        onRefresh={handleRefreshStatus}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshStatus}
              className="hidden sm:flex bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {t('botManagement.refreshStatus')}
            </Button>
            <Button
              size="sm"
              onClick={handleHelp}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <BookOpen className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">{t('botManagement.instructions')}</span>
            </Button>
          </>
        }
      />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Status Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Bot Active Card */}
            <Card className={`p-5 border-l-4 ${
              botActive 
                ? "border-emerald-500 bg-gradient-to-br from-white to-emerald-50/30" 
                : "border-red-500 bg-gradient-to-br from-white to-red-50/30"
            } hover:shadow-md transition-shadow`}>
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  botActive ? "bg-emerald-100" : "bg-red-100"
                }`}>
                  {botActive ? (
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">
                      {botActive ? t('botManagement.botActive') : t('botManagement.botInactive')}
                    </h3>
                    <Badge
                      variant={botActive ? "default" : "destructive"}
                      className={`text-xs px-2 py-0.5 ${
                        botActive 
                          ? "bg-emerald-500 text-white" 
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {botActive ? t('botManagement.botWorking') : t('botManagement.botNotWorking')}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    {botActive 
                      ? t('botManagement.botReady') 
                      : t('botManagement.botNeedsActivation')}
                  </p>
                </div>
                <div
                  className={`w-3 h-3 rounded-full flex-shrink-0 mt-1.5 ${
                    botActive 
                      ? "bg-emerald-500 animate-pulse" 
                      : "bg-red-500"
                  }`}
                />
              </div>
            </Card>

            {/* Organization Card */}
            <Card className="p-5 border-l-4 border-blue-500 bg-gradient-to-br from-white to-blue-50/30 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-1">{t('botManagement.organization')}</h3>
                  <p className="text-sm text-gray-600">{organizationName || user?.organization?.name || t('common.loading')}</p>
                </div>
              </div>
            </Card>

            {/* Bot Link Card */}
            <Card className="p-5 border-l-4 border-indigo-500 bg-gradient-to-br from-white to-indigo-50/30 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <LinkIcon className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-1">{t('botManagement.botLink')}</h3>
                  <p className="text-sm text-gray-600 truncate">{botLink}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Progress Card */}
          <Card className="p-6 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">{t('botManagement.setupProgress')}</h3>
              {setupProgress === 100 && (
                <span className="text-sm text-emerald-600 font-medium">
                  {t('botManagement.setupComplete')}
                </span>
              )}
            </div>
            <Progress value={setupProgress} className="h-2.5 mb-3" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{setupProgress}% {t('botManagement.completed')}</span>
              {setupProgress === 100 && (
                <div className="flex items-center gap-1.5 text-emerald-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">{t('botManagement.setupComplete')}</span>
                </div>
              )}
              {setupProgress > 0 && setupProgress < 100 && (
                <div className="flex items-center gap-1.5 text-blue-600">
                  <RefreshCw className="w-4 h-4" />
                  <span className="text-sm font-medium">{t('botManagement.inProgress')}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-3 bg-white border border-gray-200 p-1 h-auto shadow-sm">
              <TabsTrigger
                value="instructions"
                className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm py-3 gap-2"
              >
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">{t('botManagement.instructions')}</span>
              </TabsTrigger>
              <TabsTrigger
                value="activation"
                className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm py-3 gap-2"
              >
                <Key className="w-4 h-4" />
                <span className="hidden sm:inline">{t('botManagement.activation')}</span>
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm py-3 gap-2"
              >
                <SettingsIcon className="w-4 h-4" />
                <span className="hidden sm:inline">{t('botManagement.settings')}</span>
              </TabsTrigger>
            </TabsList>

            {/* Instructions Tab */}
            <TabsContent value="instructions" className="mt-6">
              <Card className="p-8 bg-white">
                <div className="max-w-4xl mx-auto">
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="w-10 h-10 text-indigo-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-3">
                      {t('botManagement.howToCreateBot')}
                    </h2>
                    <p className="text-gray-600 text-lg">
                      {t('botManagement.stepByStepGuide')}
                    </p>
                  </div>

                  <div className="space-y-6">
                    {/* Step 1 */}
                    <div className="flex items-start gap-4 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-lg">
                        1
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900">
                            {t('botManagement.step1Title')}
                          </h4>
                          <CheckCircle2Icon className="w-5 h-5 text-indigo-600" />
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed mb-3">
                          {t('botManagement.step1Description')}
                        </p>
                        <div className="mt-3 p-3 bg-white rounded-lg border border-indigo-200">
                          <p className="text-xs text-gray-600 font-medium mb-1">{t('botManagement.step1HowTo')}</p>
                          <ul className="text-xs text-gray-700 space-y-1 list-disc list-inside">
                            <li>{t('botManagement.step1List1')}</li>
                            <li>{t('botManagement.step1List2')}</li>
                            <li>{t('botManagement.step1List3')}</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex items-start gap-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-lg">
                        2
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900">
                            {t('botManagement.step2Title')}
                          </h4>
                          <CheckCircle2Icon className="w-5 h-5 text-blue-600" />
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed mb-3">
                          {t('botManagement.step2Description')}
                        </p>
                        <div className="mt-3 p-3 bg-white rounded-lg border border-blue-200">
                          <p className="text-xs text-gray-600 font-medium mb-1">{t('botManagement.step2HowTo')}</p>
                          <ul className="text-xs text-gray-700 space-y-1 list-disc list-inside">
                            <li>{t('botManagement.step2List1')}</li>
                            <li>{t('botManagement.step2List2')}</li>
                            <li>{t('botManagement.step2List3')}</li>
                            <li>{t('botManagement.step2List4')}</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex items-start gap-4 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100 hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-lg">
                        3
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900">
                            {t('botManagement.step3Title')}
                          </h4>
                          <CheckCircle2Icon className="w-5 h-5 text-purple-600" />
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed mb-3">
                          {t('botManagement.step3Description')}
                        </p>
                        <div className="mt-3 p-3 bg-white rounded-lg border border-purple-200">
                          <p className="text-xs text-gray-600 font-medium mb-1">{t('botManagement.step3Format')}</p>
                          <code className="block text-xs bg-gray-900 text-green-400 px-3 py-2 rounded font-mono mt-2">
                            123456789:ABCdefGHijKlMNOpqrsTUVwxyz
                          </code>
                          <div className="flex items-start gap-2 mt-2">
                            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-gray-600">
                              <span className="font-semibold text-red-600">{t('common.error')}:</span> {t('botManagement.step3Important')}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                          <ArrowRight className="w-4 h-4 text-purple-600" />
                          <Button
                            onClick={() => setActiveTab("activation")}
                            variant="outline"
                            size="sm"
                            className="text-xs hover:bg-purple-50 hover:border-purple-300"
                          >
                            {t('botManagement.step3GoToActivation')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Warning Alert */}
                  <div className="mt-8 p-5 bg-amber-50 border-2 border-amber-200 rounded-xl">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-6 h-6 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-amber-600" />
                          {t('botManagement.securityWarning')}
                        </h4>
                        <ul className="text-sm text-amber-800 space-y-1.5">
                          <li className="flex items-start gap-2">
                            <span className="text-amber-600 mt-0.5">•</span>
                            <span>{t('botManagement.securityWarning1')}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-amber-600 mt-0.5">•</span>
                            <span>{t('botManagement.securityWarning2')}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-amber-600 mt-0.5">•</span>
                            <span>{t('botManagement.securityWarning3')}</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Activation Tab */}
            <TabsContent value="activation" className="mt-6">
              <Card className="p-8 bg-white border-2 border-indigo-100 shadow-lg">
                <div className="max-w-2xl mx-auto">
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Key className="w-10 h-10 text-indigo-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-3">{t('botManagement.activationTitle')}</h2>
                    <p className="text-gray-600 text-lg">
                      {t('botManagement.activationDescription')}
                    </p>
                    {!botActive && (
                      <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        <span className="text-sm text-amber-800">
                          {t('botManagement.botNotActiveAlert')}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="bot-token" className="text-base mb-3 block">
                        {t('botManagement.botToken')}
                      </Label>
                      <div className="relative">
                        <Input
                          id="bot-token"
                          type={showToken ? "text" : "password"}
                          value={token}
                          onChange={(e) => setToken(e.target.value)}
                          placeholder={t('botManagement.botTokenPlaceholder')}
                          className="pr-12 h-12 font-mono text-sm"
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

                    {/* Help Link */}
                    <div className="flex items-center justify-center">
                      <Button
                        variant="ghost"
                        onClick={() => setActiveTab("instructions")}
                        className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                      >
                        <HelpCircle className="w-4 h-4 mr-2" />
                        {t('botManagement.dontKnowHowToActivate')}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>

                    {/* Info Card */}
                    <div className="p-5 bg-blue-50 border border-blue-200 rounded-xl">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <HelpCircle className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-blue-900 mb-2">
                            {t('botManagement.tokenFormat')}
                          </h4>
                          <p className="text-sm text-blue-800 mb-2">
                            {t('botManagement.tokenFormatDescription')}
                          </p>
                          <code className="block text-xs bg-white px-3 py-2 rounded border border-blue-200 text-blue-700 font-mono">
                            123456789:ABCdefGHijKlMNOpqrsTUVwxyz
                          </code>
                          <p className="text-sm text-blue-800 mt-3">
                            {t('botManagement.tokenFormatGetFrom')}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3 pt-2">
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={() => setToken("")}
                          disabled={!token}
                          className="flex-1 h-12"
                        >
                          {t('botManagement.clear')}
                        </Button>
                        <Button
                          onClick={handleValidateToken}
                          disabled={!token || isValidating}
                          className="flex-1 h-12 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg transition-shadow"
                        >
                          {isValidating ? (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              {t('botManagement.validating')}
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 mr-2" />
                              {t('botManagement.validateToken')}
                            </>
                          )}
                        </Button>
                      </div>
                      {botName && botUsername && !botActive && (
                        <Button
                          onClick={handleActivateBot}
                          disabled={!token || isActivating || isValidating}
                          className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg transition-shadow font-semibold"
                        >
                          {isActivating ? (
                            <>
                              <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                              {t('botManagement.activating')}
                            </>
                          ) : (
                            <>
                              <Power className="w-5 h-5 mr-2" />
                              {t('botManagement.activateBot')}
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="mt-6 space-y-6">
              {!botActive && (
                <Card className="p-6 bg-amber-50 border-2 border-amber-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-amber-900 mb-2">
                        Бот не активирован
                      </h3>
                      <p className="text-sm text-amber-800 mb-4">
                        Для использования настроек бота необходимо сначала активировать его во вкладке "Активация".
                      </p>
                      <Button
                        onClick={() => setActiveTab("activation")}
                        variant="outline"
                        className="bg-white hover:bg-amber-100 border-amber-300 text-amber-900"
                      >
                        Перейти к активации
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
              {/* Bot Status Section */}
              <Card className="p-6 bg-white">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Статус бота</h3>
                </div>

                {isLoading ? (
                  <p className="text-gray-500">Загрузка статуса бота...</p>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={botActive ? "default" : "destructive"}
                        className={`text-sm px-3 py-1 ${botActive ? "bg-green-500" : "bg-red-500"} text-white`}
                      >
                        {botActive ? "Активен" : "Неактивен"}
                      </Badge>
                      {botStatus?.error && (
                        <span className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" /> {botStatus.error}
                        </span>
                      )}
                    </div>
                    {botActive && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                            <Users className="w-5 h-5 text-gray-600" />
                            <div className="flex-1">
                              <p className="text-sm text-gray-600">Имя бота</p>
                              <p className="text-sm font-medium text-gray-900">{botName || "Не указано"}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                            <AtSign className="w-5 h-5 text-gray-600" />
                            <div className="flex-1">
                              <p className="text-sm text-gray-600">Username</p>
                              <p className="text-sm font-medium text-gray-900">{botUsername || "Не указано"}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                          <LinkIcon className="w-5 h-5 text-gray-600" />
                          <div className="flex-1">
                            <p className="text-sm text-gray-600">Ссылка на бота</p>
                            <p className="text-sm font-medium text-gray-900">
                              {botLink ? (
                                <a href={botLink} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                                  {botLink}
                                </a>
                              ) : (
                                "Не указано"
                              )}
                            </p>
                          </div>
                        </div>

                        {botStatus && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                              <div className="flex-1">
                                <p className="text-sm text-gray-600">Может присоединяться к группам</p>
                                <p className="text-sm font-medium text-gray-900">
                                  {botStatus.canJoinGroups ? "Да" : "Нет"}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                              <Eye className="w-5 h-5 text-blue-600" />
                              <div className="flex-1">
                                <p className="text-sm text-gray-600">Может читать сообщения групп</p>
                                <p className="text-sm font-medium text-gray-900">
                                  {botStatus.canReadAllGroupMessages ? "Да" : "Нет"}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                    {!botActive && (
                      <p className="text-sm text-gray-500">
                        Бот неактивен. Пожалуйста, введите и активируйте токен бота.
                      </p>
                    )}
                  </div>
                )}
              </Card>

              {/* Basic Settings Section */}
              <Card className="p-6 bg-white">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <SettingsIcon className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Основные настройки</h3>
                </div>

                <p className="text-sm text-gray-600 mb-6">
                  Настройте имя и описание вашего бота
                </p>

                <div className="space-y-5">
                  <div>
                    <Label htmlFor="bot-name" className="mb-2 block">
                      Имя бота *
                    </Label>
                    <Input
                      id="bot-name"
                      value={botName}
                      onChange={(e) => setBotName(e.target.value)}
                      placeholder="Введите имя бота"
                      className="h-11"
                      maxLength={64}
                    />
                    <p className="text-xs text-gray-500 mt-1.5">
                      {botName.length}/64
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="bot-description" className="mb-2 block">
                      Описание бота
                    </Label>
                    <Textarea
                      id="bot-description"
                      value={botDescription}
                      onChange={(e) => setBotDescription(e.target.value)}
                      placeholder="Краткое описание функций бота..."
                      rows={4}
                      maxLength={512}
                      className="resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-1.5">
                      {botDescription.length}/512
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Button
                      onClick={handleActivateBot}
                      disabled={isActivating || !token}
                      className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      {isActivating ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      )}
                      {isActivating ? "Активация..." : "Активировать бота"}
                    </Button>
                    
                    {botActive && (
                      <Button
                        onClick={handleUpdateBotSettings}
                        disabled={isActivating}
                        variant="outline"
                        className="w-full h-11"
                      >
                        {isActivating ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Settings className="w-4 h-4 mr-2" />
                        )}
                        {isActivating ? "Обновление..." : "Обновить настройки"}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>

              {/* Share Bot Section */}
              <Card className="p-6 bg-white">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Share2 className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Поделиться ботом</h3>
                </div>

                <p className="text-sm text-gray-600 mb-6">
                  Поделитесь ссылкой на вашего бота с клиентами
                </p>

                <div className="space-y-5">
                  {/* Link Field */}
                  <div>
                    <Label className="mb-2 block">Ссылка на бота</Label>
                    <div className="flex gap-2">
                      <Input
                        value={botLink}
                        readOnly
                        className="flex-1 bg-gray-50 h-11"
                      />
                      <Button
                        variant="outline"
                        onClick={handleCopyLink}
                        className="h-11 px-4"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="flex flex-col items-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    {qrCodeDataUrl ? (
                      <>
                        <div className="relative w-48 h-48 bg-white rounded-lg shadow-md p-3 mb-4 group">
                          <img 
                            src={qrCodeDataUrl} 
                            alt="QR Code" 
                            className="w-full h-full object-contain"
                          />
                          {/* Copy QR overlay on hover */}
                          <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button
                              onClick={handleCopyQRCode}
                              size="sm"
                              className="bg-white text-gray-900 hover:bg-gray-100"
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Копировать
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-4 text-center">
                          Отсканируйте QR код для быстрого доступа к боту
                        </p>
                        <p className="text-xs text-gray-500 mb-4 text-center">
                          Наведите курсор на QR-код для копирования
                        </p>
                      </>
                    ) : botLink && botLink !== "https://t.me/" ? (
                      <div className="flex flex-col items-center">
                        <div className="w-48 h-48 bg-white rounded-lg shadow-md p-3 mb-4 flex items-center justify-center">
                          <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                          Генерация QR-кода...
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="w-48 h-48 bg-white rounded-lg shadow-md p-3 mb-4 flex items-center justify-center">
                          <QrCode className="w-24 h-24 text-gray-300" />
                        </div>
                        <p className="text-sm text-gray-600 mb-4 text-center">
                          QR-код будет доступен после активации бота
                        </p>
                      </>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Button
                      variant="outline"
                      onClick={handleOpenBot}
                      className="h-11"
                      disabled={!botLink || botLink === "https://t.me/"}
                    >
                      <ExternalLink className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Открыть</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleDownloadQR}
                      className="h-11"
                      disabled={!qrCodeDataUrl}
                    >
                      <Download className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Скачать QR</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCopyQRCode}
                      className="h-11"
                      disabled={!qrCodeDataUrl}
                    >
                      <Copy className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Копировать QR</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCopyLink}
                      className="h-11"
                      disabled={!botLink || botLink === "https://t.me/"}
                    >
                      <LinkIcon className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Копировать ссылку</span>
                    </Button>
                  </div>

                  <Separator />

                  {/* Share Options */}
                  <div>
                    <Label className="mb-3 block text-sm font-medium text-gray-700">
                      Поделиться ботом
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Button
                        variant="outline"
                        onClick={handleShareToTelegram}
                        className="h-11"
                        disabled={!botLink || botLink === "https://t.me/"}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Telegram
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleShareToWhatsApp}
                        className="h-11"
                        disabled={!botLink || botLink === "https://t.me/"}
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        WhatsApp
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleShareToEmail}
                        className="h-11"
                        disabled={!botLink || botLink === "https://t.me/"}
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Email
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