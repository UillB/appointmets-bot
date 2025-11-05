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
  PlayCircle,
  UserPlus,
  Shield,
  Unlink,
  Terminal,
} from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import { useLanguage } from "../../i18n";
import { useWebSocket } from "../../hooks/useWebSocket";
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
import { PageTitle } from "../PageTitle";
import { Alert, AlertDescription } from "../ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import QRCode from "qrcode";

export function BotManagementPage() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { events } = useWebSocket();
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
  const [adminLinked, setAdminLinked] = useState(false);
  const [adminLink, setAdminLink] = useState<string | null>(null);
  const [adminDeepLink, setAdminDeepLink] = useState<string | null>(null);
  const [adminLinkQRCode, setAdminLinkQRCode] = useState<string | null>(null);
  const [isGeneratingAdminLink, setIsGeneratingAdminLink] = useState(false);
  const [showUnlinkDialog, setShowUnlinkDialog] = useState(false);
  const [isUnlinking, setIsUnlinking] = useState(false);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Load bot status ONLY on mount - no automatic reloads
  const hasLoadedInitialStatus = useRef(false);
  useEffect(() => {
    if (!hasLoadedInitialStatus.current && user?.organizationId) {
      hasLoadedInitialStatus.current = true;
      loadBotStatus();
    }
  }, [user?.organizationId]); // Only load when user or organizationId changes

  // Don't poll - rely on WebSocket events for updates instead
  // Polling causes unnecessary reloads and performance issues

  // Handle real-time WebSocket events for admin link - NO automatic reloads
  const processedEventIds = useRef<Set<string>>(new Set());
  
  useEffect(() => {
    if (events.length === 0) return;

    // Process only new events to avoid duplicates
    const latestEvent = events[0];
    
    // Skip if already processed
    if (processedEventIds.current.has(latestEvent.id)) {
      return;
    }
    
    if (latestEvent.type === 'admin.linked' || latestEvent.type === 'admin_linked') {
      processedEventIds.current.add(latestEvent.id);
      
      // Update admin linked status immediately from event data
      setAdminLinked(true);
      
      // Also reload bot status to ensure everything is in sync
      setTimeout(() => {
        loadBotStatus();
      }, 500);
    }
    
    if (latestEvent.type === 'admin.unlinked' || latestEvent.type === 'admin_unlinked') {
      processedEventIds.current.add(latestEvent.id);
      
      // Update admin linked status immediately from event data
      setAdminLinked(false);
      
      // Clear admin link data
      setAdminLink(null);
      setAdminDeepLink(null);
      setAdminLinkQRCode(null);
      
      // Also reload bot status to ensure everything is in sync
      setTimeout(() => {
        loadBotStatus();
      }, 500);
      
      toast.success("Admin account unlinked", {
        description: "Your Telegram account has been unlinked from the bot"
      });
    }
    
    // Don't reload bot status for any events - rely on user actions or initial load only
    // This prevents unnecessary API calls and page reloads
  }, [events]);

  // Set default tab based on bot status - only once on initial load
  const hasSetInitialTab = useRef(false);
  useEffect(() => {
    if (!isLoading && !hasSetInitialTab.current) {
      // Show instructions by default, then user can navigate
      setActiveTab("instructions");
      hasSetInitialTab.current = true;
    }
  }, [isLoading]);

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
        
        // Check admin link status from response
        if (response.botStatus?.adminLinked !== undefined) {
          setAdminLinked(response.botStatus.adminLinked);
        } else if ('adminLinked' in response && response.adminLinked !== undefined) {
          setAdminLinked((response as any).adminLinked);
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

  const handleGenerateAdminLink = async () => {
    if (!botActive) {
      toast.error("Бот должен быть активирован для генерации ссылки администратора");
      return;
    }

    try {
      setIsGeneratingAdminLink(true);
      const result = await apiClient.generateAdminLink();
      
      if (result.success && result.adminLink) {
        setAdminLink(result.adminLink);
        setAdminDeepLink(result.deepLink || null);
        
        // Generate QR code for admin link
        // Используем deep link для мобильных устройств (tg://) - гарантирует открытие в Telegram
        // Для веб-браузеров используем обычную ссылку (https://t.me/)
        const qrLink = result.deepLink || result.adminLink;
        
        try {
          const qrDataUrl = await QRCode.toDataURL(qrLink, {
            width: 300,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          });
          setAdminLinkQRCode(qrDataUrl);
        } catch (qrError) {
          console.error('Failed to generate admin link QR code:', qrError);
        }
        
        toast.success("Ссылка администратора сгенерирована", {
          description: "Ссылка действительна в течение 1 часа"
        });
      } else {
        toast.error(result.error || "Не удалось сгенерировать ссылку администратора");
      }
    } catch (error: any) {
      console.error('Failed to generate admin link:', error);
      toast.error(error.message || "Ошибка при генерации ссылки администратора");
    } finally {
      setIsGeneratingAdminLink(false);
    }
  };

  const handleCopyAdminLink = () => {
    if (!adminLink) {
      toast.error("Сначала сгенерируйте ссылку администратора");
      return;
    }
    navigator.clipboard.writeText(adminLink);
    toast.success("Ссылка администратора скопирована в буфер обмена");
  };

  const handleOpenAdminLink = () => {
    if (!adminLink) {
      toast.error("Сначала сгенерируйте ссылку администратора");
      return;
    }
    // Используем deep link для нативных приложений (открывается в Telegram)
    // Если deep link не доступен, используем обычную ссылку
    const linkToOpen = adminDeepLink || adminLink;
    
    // Для deep link (tg://) просто открываем напрямую
    if (linkToOpen.startsWith('tg://')) {
      window.location.href = linkToOpen;
    } else {
      // Для обычных ссылок открываем в новой вкладке
      window.open(linkToOpen, "_blank");
    }
  };

  const handleUnlinkAdmin = async () => {
    try {
      setIsUnlinking(true);
      const result = await apiClient.unlinkAdmin();
      
      if (result.success) {
        setAdminLinked(false);
        setAdminLink(null);
        setAdminDeepLink(null);
        setAdminLinkQRCode(null);
        setShowUnlinkDialog(false);
        
        toast.success("Admin account unlinked successfully", {
          description: "Your Telegram account has been unlinked from the bot"
        });
        
        // Reload bot status to update UI
        await loadBotStatus();
      } else {
        toast.error(result.error || "Failed to unlink admin account");
      }
    } catch (error: any) {
      console.error('Failed to unlink admin:', error);
      toast.error(error.message || "Error unlinking admin account");
    } finally {
      setIsUnlinking(false);
    }
  };



  // Show loading if user is not loaded yet
  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Empty State - No bot configured yet
  if (!botActive && !botName && !botUsername && !isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          icon={<Bot className="w-7 h-7 text-white" />}
          title={t('botManagement.title')}
          description={t('botManagement.description')}
        />
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
          <div className="max-w-5xl mx-auto">
            <Card className="p-8 sm:p-12">
              <div className="text-center max-w-2xl mx-auto">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Bot className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                </div>
                
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  {t('botManagement.emptyState.title')}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                  {t('botManagement.emptyState.description')}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="p-4 bg-indigo-50 dark:bg-indigo-950/50 rounded-lg border-2 border-transparent hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors text-center">
                    <div className="w-8 h-8 bg-indigo-600 dark:bg-indigo-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">
                      1
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                      {t('botManagement.emptyState.step1.title')}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {t('botManagement.emptyState.step1.description')}
                    </p>
                  </div>

                  <div className="p-4 bg-purple-50 dark:bg-purple-950/50 rounded-lg border-2 border-transparent hover:border-purple-200 dark:hover:border-purple-800 transition-colors text-center">
                    <div className="w-8 h-8 bg-purple-600 dark:bg-purple-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">
                      2
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                      {t('botManagement.emptyState.step2.title')}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {t('botManagement.emptyState.step2.description')}
                    </p>
                  </div>

                  <div className="p-4 bg-pink-50 dark:bg-pink-950/50 rounded-lg border-2 border-transparent hover:border-pink-200 dark:hover:border-pink-800 transition-colors text-center">
                    <div className="w-8 h-8 bg-pink-600 dark:bg-pink-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">
                      3
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                      {t('botManagement.emptyState.step3.title')}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {t('botManagement.emptyState.step3.description')}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => setActiveTab("instructions")}
                  size="lg"
                  className="bg-indigo-600 hover:bg-indigo-700 h-12 px-8"
                >
                  <PlayCircle className="w-5 h-5 mr-2" />
                  {t('botManagement.emptyState.startButton')}
                </Button>

                <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                  {t('botManagement.emptyState.footer')}
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 px-4 sm:px-6 py-6" style={{ animation: 'none', transition: 'none' }}>
          {/* Page Title */}
          <PageTitle
            icon={<Bot className="w-6 h-6 text-white" />}
            title={t('botManagement.title')}
            description={t('botManagement.description')}
            actions={
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefreshStatus}
                  className="hidden sm:flex"
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
          {/* Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-5">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  botActive ? 'bg-emerald-100 dark:bg-emerald-900/50' : 'bg-gray-100 dark:bg-gray-800'
                }`}>
                  <Power className={`w-5 h-5 ${botActive ? 'text-emerald-600' : 'text-gray-400'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {botActive ? "Active" : "Inactive"}
                  </p>
                </div>
                {botActive && (
                  <div className="w-2 h-2 bg-emerald-500 dark:bg-emerald-400 rounded-full animate-pulse mt-2" />
                )}
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Bot</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{botUsername || t('common.loading')}</p>
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  adminLinked ? 'bg-purple-100 dark:bg-purple-900/50' : 'bg-amber-100 dark:bg-amber-900/50'
                }`}>
                  <Shield className={`w-5 h-5 ${adminLinked ? 'text-purple-600' : 'text-amber-600'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Admin</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {adminLinked ? 'Linked' : 'Not Linked'}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Admin Not Linked Alert */}
          {!adminLinked && botActive && (
            <Alert className="border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/50">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <AlertDescription className="text-amber-900 dark:text-amber-100">
                <div className="flex items-center justify-between">
                  <span>
                    <strong>Action Required:</strong> Admin account not linked. Complete Step 3 to authorize admin access.
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab("admin-link")}
                    className="ml-4 border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/50"
                  >
                    Link Admin
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Main Tabs - Step-by-Step Setup */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 h-auto p-1 bg-gray-100 dark:bg-gray-800">
              <TabsTrigger value="instructions" className="flex items-center gap-2 py-3 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                {botName ? (
                  <CheckCircle2Icon className="w-4 h-4 text-emerald-600" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center text-xs text-gray-400 data-[state=active]:border-white data-[state=active]:text-white">
                    1
                  </div>
                )}
                <span className="hidden sm:inline">1. Create Bot</span>
                <span className="sm:hidden">1</span>
              </TabsTrigger>
              
              <TabsTrigger value="activation" className="flex items-center gap-2 py-3 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                {botActive ? (
                  <CheckCircle2Icon className="w-4 h-4 text-emerald-600" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center text-xs text-gray-400 data-[state=active]:border-white data-[state=active]:text-white">
                    2
                  </div>
                )}
                <span className="hidden sm:inline">2. Add Token</span>
                <span className="sm:hidden">2</span>
              </TabsTrigger>
              
              <TabsTrigger value="admin-link" className="flex items-center gap-2 py-3 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                {adminLinked ? (
                  <CheckCircle2Icon className="w-4 h-4 text-emerald-600" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-amber-500 flex items-center justify-center text-xs text-amber-500 data-[state=active]:border-white data-[state=active]:text-white">
                    3
                  </div>
                )}
                <span className="hidden sm:inline">3. Link Admin</span>
                <span className="sm:hidden">3</span>
              </TabsTrigger>

              <TabsTrigger value="settings" className="flex items-center gap-2 py-3 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                <SettingsIcon className="w-4 h-4" />
                <span className="hidden sm:inline">{t('botManagement.settings')}</span>
                <span className="sm:hidden">Settings</span>
              </TabsTrigger>
            </TabsList>

            {/* Instructions Tab */}
            <TabsContent value="instructions" className="mt-6">
              <Card className="p-8 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <div className="max-w-4xl mx-auto">
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                      {t('botManagement.howToCreateBot')}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                      {t('botManagement.stepByStepGuide')}
                    </p>
                  </div>

                  <div className="space-y-6">
                    {/* Step 1 */}
                    <div className="flex items-start gap-4 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 rounded-xl border border-indigo-100 dark:border-indigo-900 hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 rounded-full bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-lg">
                        1
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                            {t('botManagement.step1Title')}
                          </h4>
                          <CheckCircle2Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                          {t('botManagement.step1Description')}
                        </p>
                        <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-indigo-200 dark:border-indigo-900">
                          <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">{t('botManagement.step1HowTo')}</p>
                          <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1 list-disc list-inside">
                            <li>{t('botManagement.step1List1')}</li>
                            <li>{t('botManagement.step1List2')}</li>
                            <li>{t('botManagement.step1List3')}</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex items-start gap-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 rounded-xl border border-blue-100 dark:border-blue-900 hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 rounded-full bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-lg">
                        2
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                            {t('botManagement.step2Title')}
                          </h4>
                          <CheckCircle2Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                          {t('botManagement.step2Description')}
                        </p>
                        <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-900">
                          <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">{t('botManagement.step2HowTo')}</p>
                          <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1 list-disc list-inside">
                            <li>{t('botManagement.step2List1')}</li>
                            <li>{t('botManagement.step2List2')}</li>
                            <li>{t('botManagement.step2List3')}</li>
                            <li>{t('botManagement.step2List4')}</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex items-start gap-4 p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 rounded-xl border border-purple-100 dark:border-purple-900 hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 rounded-full bg-purple-600 dark:bg-purple-500 text-white flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-lg">
                        3
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                            {t('botManagement.step3Title')}
                          </h4>
                          <CheckCircle2Icon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                          {t('botManagement.step3Description')}
                        </p>
                        <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-900">
                          <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">{t('botManagement.step3Format')}</p>
                          <code className="block text-xs bg-gray-900 dark:bg-gray-950 text-green-400 dark:text-green-500 px-3 py-2 rounded font-mono mt-2">
                            123456789:ABCdefGHijKlMNOpqrsTUVwxyz
                          </code>
                          <div className="flex items-start gap-2 mt-2">
                            <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              <span className="font-semibold text-red-600 dark:text-red-400">{t('common.error')}:</span> {t('botManagement.step3Important')}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                          <ArrowRight className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          <Button
                            onClick={() => setActiveTab("activation")}
                            variant="outline"
                            size="sm"
                            className="text-xs hover:bg-purple-50 dark:hover:bg-purple-950/50 hover:border-purple-300 dark:hover:border-purple-700"
                          >
                            {t('botManagement.step3GoToActivation')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Warning Alert */}
                  <div className="mt-8 p-5 bg-amber-50 dark:bg-amber-950/50 border-2 border-amber-200 dark:border-amber-900 rounded-xl">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-2 flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                          {t('botManagement.securityWarning')}
                        </h4>
                        <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1.5">
                          <li className="flex items-start gap-2">
                            <span className="text-amber-600 dark:text-amber-400 mt-0.5">•</span>
                            <span>{t('botManagement.securityWarning1')}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-amber-600 dark:text-amber-400 mt-0.5">•</span>
                            <span>{t('botManagement.securityWarning2')}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-amber-600 dark:text-amber-400 mt-0.5">•</span>
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
              <Card className="p-8 bg-white dark:bg-gray-900 border-2 border-indigo-100 dark:border-indigo-900 shadow-lg">
                <div className="max-w-2xl mx-auto">
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Key className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">{t('botManagement.activationTitle')}</h2>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                      {t('botManagement.activationDescription')}
                    </p>
                    {!botActive && (
                      <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <span className="text-sm text-amber-800 dark:text-amber-200">
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
                    <div className="p-5 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 rounded-xl">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                            {t('botManagement.tokenFormat')}
                          </h4>
                          <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                            {t('botManagement.tokenFormatDescription')}
                          </p>
                          <code className="block text-xs bg-white dark:bg-gray-800 px-3 py-2 rounded border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 font-mono">
                            123456789:ABCdefGHijKlMNOpqrsTUVwxyz
                          </code>
                          <p className="text-sm text-blue-800 dark:text-blue-200 mt-3">
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
              <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Статус бота</h3>
                </div>

                {isLoading ? (
                  <p className="text-gray-500 dark:text-gray-400">Загрузка статуса бота...</p>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={botActive ? "default" : "destructive"}
                        className={`text-sm px-3 py-1 ${botActive ? "bg-green-500 dark:bg-green-600" : "bg-red-500 dark:bg-red-600"} text-white`}
                      >
                        {botActive ? "Активен" : "Неактивен"}
                      </Badge>
                      {botStatus?.error && (
                        <span className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" /> {botStatus.error}
                        </span>
                      )}
                    </div>
                    {botActive && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <Users className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            <div className="flex-1">
                              <p className="text-sm text-gray-600 dark:text-gray-400">Имя бота</p>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{botName || "Не указано"}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <AtSign className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            <div className="flex-1">
                              <p className="text-sm text-gray-600 dark:text-gray-400">Username</p>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{botUsername || "Не указано"}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <LinkIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                          <div className="flex-1">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Ссылка на бота</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {botLink ? (
                                <a href={botLink} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">
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
                            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                              <div className="flex-1">
                                <p className="text-sm text-gray-600 dark:text-gray-400">Может присоединяться к группам</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {botStatus.canJoinGroups ? "Да" : "Нет"}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                              <div className="flex-1">
                                <p className="text-sm text-gray-600 dark:text-gray-400">Может читать сообщения групп</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {botStatus.canReadAllGroupMessages ? "Да" : "Нет"}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                    {!botActive && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Бот неактивен. Пожалуйста, введите и активируйте токен бота.
                      </p>
                    )}
                  </div>
                )}
              </Card>

              {/* Basic Settings Section */}
              <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center">
                    <SettingsIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Основные настройки</h3>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
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
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                      {botName.length}/64
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="bot-description" className="mb-2 block text-gray-900 dark:text-gray-100">
                      Описание бота
                    </Label>
                    <Textarea
                      id="bot-description"
                      value={botDescription}
                      onChange={(e) => setBotDescription(e.target.value)}
                      placeholder="Краткое описание функций бота..."
                      rows={4}
                      maxLength={512}
                      className="resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
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
              <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center">
                    <Share2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Поделиться ботом</h3>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Поделитесь ссылкой на вашего бота с клиентами
                </p>

                <div className="space-y-5">
                  {/* Link Field */}
                  <div>
                    <Label className="mb-2 block text-gray-900 dark:text-gray-100">Ссылка на бота</Label>
                    <div className="flex gap-2">
                      <Input
                        value={botLink}
                        readOnly
                        className="flex-1 bg-gray-50 dark:bg-gray-800 h-11 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"
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
                  <div className="flex flex-col items-center py-8 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
                    {qrCodeDataUrl ? (
                      <>
                        <div className="relative w-48 h-48 bg-white dark:bg-gray-900 rounded-lg shadow-md p-3 mb-4 group">
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
                              className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Копировать
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center">
                          Отсканируйте QR код для быстрого доступа к боту
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 text-center">
                          Наведите курсор на QR-код для копирования
                        </p>
                      </>
                    ) : botLink && botLink !== "https://t.me/" ? (
                      <div className="flex flex-col items-center">
                        <div className="w-48 h-48 bg-white dark:bg-gray-900 rounded-lg shadow-md p-3 mb-4 flex items-center justify-center">
                          <RefreshCw className="w-8 h-8 text-gray-400 dark:text-gray-500 animate-spin" />
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          Генерация QR-кода...
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="w-48 h-48 bg-white dark:bg-gray-900 rounded-lg shadow-md p-3 mb-4 flex items-center justify-center">
                          <QrCode className="w-24 h-24 text-gray-300 dark:text-gray-600" />
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center">
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
                    <Label className="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
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

            {/* Step 3: Link Admin Account Tab */}
            <TabsContent value="admin-link" className="mt-6">
              <Card className="p-8 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center font-semibold text-lg">
                    3
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Link Admin Account</h2>
                    <p className="text-gray-600 dark:text-gray-400">Authorize your Telegram account as administrator</p>
                  </div>
                </div>

                {!botActive ? (
                  <div className="space-y-4">
                    <Alert className="border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/50">
                      <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      <AlertDescription className="text-amber-900 dark:text-amber-100 text-sm">
                        <strong>Bot must be activated first:</strong> Please complete Step 2 (Activation) before linking your admin account.
                      </AlertDescription>
                    </Alert>
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab("activation")}
                      className="w-full"
                    >
                      <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                      Go to Step 2: Activation
                    </Button>
                  </div>
                ) : adminLinked ? (
                  <div className="space-y-6">
                    <Alert className="border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/50">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <AlertDescription className="text-emerald-900 dark:text-emerald-100">
                        <strong>Success!</strong> Your admin account has been linked. You now have full access to the bot management panel.
                      </AlertDescription>
                    </Alert>

                    <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50 rounded-lg border border-emerald-200 dark:border-emerald-900 text-center">
                      <div className="w-16 h-16 bg-emerald-600 dark:bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Setup Complete!</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Your Telegram bot is fully configured and ready to use.
                      </p>
                      
                      <div className="grid grid-cols-2 gap-3 max-w-md mx-auto mt-6">
                        <Button
                          variant="outline"
                          onClick={handleOpenBot}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Open Bot
                        </Button>
                        <Button
                          onClick={handleCopyLink}
                          className="bg-indigo-600 hover:bg-indigo-700"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Share Bot
                        </Button>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-emerald-200 dark:border-emerald-900">
                        <Button
                          variant="outline"
                          onClick={() => setShowUnlinkDialog(true)}
                          className="w-full text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/50 border-red-200 dark:border-red-900"
                        >
                          <Unlink className="w-4 h-4 mr-2" />
                          Unlink Telegram Account
                        </Button>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                          Unlink your Telegram account to remove admin access from the bot
                        </p>
                      </div>
                    </div>

                    {/* Admin Commands Reference */}
                    <Card className="p-6 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3 mb-4">
                        <Terminal className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">Available Admin Commands</h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        These commands are only available when your Telegram account is linked and the bot is active:
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          { cmd: "/admin", desc: "Open admin panel (Web App)" },
                          { cmd: "/stats", desc: "View appointment statistics" },
                          { cmd: "/appointments", desc: "List all appointments" },
                          { cmd: "/confirm <id>", desc: "Confirm appointment by ID" },
                          { cmd: "/reject <id>", desc: "Reject appointment by ID" },
                        ].map(({ cmd, desc }) => (
                          <div
                            key={cmd}
                            className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded-lg group hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            <div>
                              <code className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{cmd}</code>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{desc}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                navigator.clipboard.writeText(cmd);
                                toast.success(`Copied: ${cmd}`);
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <Alert className="border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/50">
                      <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      <AlertDescription className="text-amber-900 dark:text-amber-100 text-sm">
                        <strong>Important:</strong> Only authorized admins can access this management panel. Complete this step to enable admin access.
                      </AlertDescription>
                    </Alert>

                    <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 rounded-lg border-2 border-dashed border-indigo-200 dark:border-indigo-900">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4 text-center">Scan QR Code or Click Button</h3>
                      
                      {/* QR Code */}
                      {adminLinkQRCode ? (
                        <div className="flex flex-col items-center mb-4">
                          <div className="w-48 h-48 bg-white dark:bg-gray-900 rounded-lg shadow-md p-3">
                            <img 
                              src={adminLinkQRCode} 
                              alt="Admin Link QR Code" 
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-3">
                            Scan with Telegram mobile app
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center mb-4">
                          <div className="w-48 h-48 bg-white dark:bg-gray-900 rounded-lg shadow-md p-3 flex items-center justify-center">
                            <QrCode className="w-24 h-24 text-gray-300 dark:text-gray-600" />
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-3">
                            QR code will appear after generating link
                          </p>
                        </div>
                      )}

                      <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 text-gray-600 dark:text-gray-400">or</span>
                        </div>
                      </div>

                      {/* Authorization Buttons */}
                      <div className="space-y-3">
                        {!adminLink ? (
                          <Button
                            onClick={handleGenerateAdminLink}
                            disabled={isGeneratingAdminLink}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 h-12"
                          >
                            {isGeneratingAdminLink ? (
                              <>
                                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                                Generating link...
                              </>
                            ) : (
                              <>
                                <UserPlus className="w-5 h-5 mr-2" />
                                Generate Admin Link
                              </>
                            )}
                          </Button>
                        ) : (
                          <>
                            <div className="space-y-2">
                              <Label className="mb-2 block text-gray-900 dark:text-gray-100">Authorization Link</Label>
                              <div className="flex gap-2">
                                <Input
                                  value={adminLink}
                                  readOnly
                                  className="flex-1 bg-gray-50 dark:bg-gray-800 h-11 font-mono text-xs text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"
                                />
                                <Button
                                  variant="outline"
                                  onClick={handleCopyAdminLink}
                                  className="h-11 px-4"
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Link expires in 1 hour
                              </p>
                            </div>
                            <Button
                              onClick={handleOpenAdminLink}
                              className="w-full bg-indigo-600 hover:bg-indigo-700 h-12"
                            >
                              <ExternalLink className="w-5 h-5 mr-2" />
                              Open in Telegram
                            </Button>
                            <Button
                              variant="outline"
                              onClick={handleGenerateAdminLink}
                              disabled={isGeneratingAdminLink}
                              className="w-full h-12"
                            >
                              <RefreshCw className={`w-4 h-4 mr-2 ${isGeneratingAdminLink ? 'animate-spin' : ''}`} />
                              Generate New Link
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 dark:bg-blue-950/50 rounded-lg border border-blue-200 dark:border-blue-900">
                      <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">How it works:</h4>
                      <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
                        <li>Click "Generate Admin Link" button</li>
                        <li>Click "Open in Telegram" button (this will open the link in Telegram app)</li>
                        <li><strong>Important:</strong> The link must be opened in Telegram app, not in browser</li>
                        <li>When you open the link, Telegram should automatically send the /start command</li>
                        <li>If you don't see a confirmation message, try typing /start manually in the bot chat</li>
                        <li>You will receive a confirmation message when the link is successful</li>
                      </ol>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab("activation")}
                      >
                        <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                        Back
                      </Button>
                      
                      <p className="text-sm text-gray-500 dark:text-gray-400">Complete authorization to continue</p>
                    </div>
                  </div>
                )}
              </Card>
            </TabsContent>
          </Tabs>

      {/* Unlink Admin Dialog */}
      <AlertDialog open={showUnlinkDialog} onOpenChange={setShowUnlinkDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Unlink className="h-5 w-5 text-red-600" />
              Unlink Telegram Account
            </AlertDialogTitle>
            <AlertDialogDescription className="pt-2">
              Are you sure you want to unlink your Telegram account? This action will:
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-4 space-y-3">
            <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950/50 rounded-lg border border-red-200 dark:border-red-900">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900 dark:text-red-100 mb-1">
                  You will lose access to admin commands in the bot
                </p>
                <p className="text-xs text-red-700 dark:text-red-300">
                  You won't be able to use commands like /admin, /stats, or manage appointments through Telegram
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-950/50 rounded-lg border border-amber-200 dark:border-amber-900">
              <LinkIcon className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-1">
                  You can always link again later
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  Just generate a new admin link and open it in Telegram to restore access
                </p>
              </div>
            </div>
          </div>

          <AlertDialogFooter className="flex-row gap-3 sm:justify-end">
            <AlertDialogCancel 
              disabled={isUnlinking}
              className="flex-1 sm:flex-initial min-w-[100px]"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUnlinkAdmin}
              disabled={isUnlinking}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600 text-white flex-1 sm:flex-initial min-w-[120px] inline-flex items-center justify-center"
            >
              {isUnlinking ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Unlinking...
                </>
              ) : (
                <>
                  <Unlink className="w-4 h-4 mr-2" />
                  Unlink Account
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}