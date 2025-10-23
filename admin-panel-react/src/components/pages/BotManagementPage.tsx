import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
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

export function BotManagementPage() {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
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
      toast.error('Failed to load bot status');
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
    toast.success("Статус обновлен");
  };

  const handleValidateToken = async () => {
    if (!token.trim()) {
      toast.error("Введите токен бота");
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
        toast.success("Токен валиден! Бот найден.");
      } else {
        toast.error(result.error || "Неверный токен бота");
      }
    } catch (error) {
      console.error('Token validation error:', error);
      toast.error("Ошибка при проверке токена");
    } finally {
      setIsValidating(false);
    }
  };

  const handleActivateBot = async () => {
    if (!token.trim()) {
      toast.error("Введите токен бота");
      return;
    }

    if (!user?.organizationId) {
      toast.error("Ошибка: не найден ID организации");
      return;
    }

    try {
      setIsActivating(true);
      const result = await apiClient.activateBot(token, user.organizationId);

      if (result.success) {
        setBotActive(true);
        toast.success("Бот успешно активирован!");
        loadBotStatus();
      } else {
        toast.error(result.error || "Ошибка при активации бота");
      }
    } catch (error) {
      console.error('Bot activation error:', error);
      toast.error("Ошибка при активации бота");
    } finally {
      setIsActivating(false);
    }
  };

  const handleUpdateBotSettings = async () => {
    if (!user?.organizationId) {
      toast.error("Ошибка: не найден ID организации");
      return;
    }

    try {
      setIsActivating(true);
      const result = await apiClient.updateBotSettings(user.organizationId, {
        name: botName,
        description: botDescription
      });

      if (result.success) {
        toast.success("Настройки бота обновлены!");
        loadBotStatus();
      } else {
        toast.error(result.error || "Ошибка при обновлении настроек");
      }
    } catch (error) {
      console.error('Bot settings update error:', error);
      toast.error("Ошибка при обновлении настроек бота");
    } finally {
      setIsActivating(false);
    }
  };


  const handleHelp = () => {
    toast.info("Открытие справки");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(botLink);
    toast.success("Ссылка скопирована в буфер обмена");
  };

  const handleOpenBot = () => {
    window.open(botLink, "_blank");
    toast.info("Открытие бота в Telegram");
  };

  const handleShare = () => {
    toast.info("Функция поделиться");
  };

  const handleDownloadQR = () => {
    toast.success("QR код загружен");
  };

  const handleUpdateSettings = () => {
    toast.success("Настройки обновлены успешно!");
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
                <p className="text-gray-500">Загрузка пользователя...</p>
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
        title="Bot Management"
        description="Create and configure Telegram bot for automatic client booking"
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
              Refresh Status
            </Button>
            <Button
              size="sm"
              onClick={handleHelp}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <HelpCircle className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Help</span>
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
            <Card className="p-5 border-l-4 border-emerald-500 bg-gradient-to-br from-white to-emerald-50/30 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-1">Бот активен</h3>
                  <p className="text-sm text-gray-600">
                    {botActive ? "Telegram бот готов к работе" : "Бот не активен"}
                  </p>
                </div>
                <div
                  className={`w-3 h-3 rounded-full flex-shrink-0 mt-1.5 ${
                    botActive ? "bg-emerald-500 animate-pulse" : "bg-gray-300"
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
                  <h3 className="font-semibold text-gray-900 mb-1">Организация</h3>
                  <p className="text-sm text-gray-600">{organizationName || user?.organization?.name || "Загрузка..."}</p>
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
                  <h3 className="font-semibold text-gray-900 mb-1">Ссылка на бота</h3>
                  <p className="text-sm text-gray-600 truncate">{botLink}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Progress Card */}
          <Card className="p-6 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Прогресс настройки бота</h3>
              {setupProgress === 100 && (
                <span className="text-sm text-emerald-600 font-medium">
                  Настройка завершена
                </span>
              )}
            </div>
            <Progress value={setupProgress} className="h-2.5 mb-3" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{setupProgress}% завершено</span>
              {setupProgress === 100 && (
                <div className="flex items-center gap-1.5 text-emerald-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Настройка завершена</span>
                </div>
              )}
              {setupProgress > 0 && setupProgress < 100 && (
                <div className="flex items-center gap-1.5 text-blue-600">
                  <RefreshCw className="w-4 h-4" />
                  <span className="text-sm font-medium">В процессе</span>
                </div>
              )}
            </div>
          </Card>

          {/* Main Tabs */}
          <Tabs defaultValue="settings" className="w-full">
            <TabsList className="w-full grid grid-cols-3 bg-white border border-gray-200 p-1 h-auto shadow-sm">
              <TabsTrigger
                value="instructions"
                className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm py-3 gap-2"
              >
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Инструкция</span>
              </TabsTrigger>
              <TabsTrigger
                value="activation"
                className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm py-3 gap-2"
              >
                <Key className="w-4 h-4" />
                <span className="hidden sm:inline">Активация</span>
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm py-3 gap-2"
              >
                <SettingsIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Настройки</span>
              </TabsTrigger>
            </TabsList>

            {/* Instructions Tab */}
            <TabsContent value="instructions" className="mt-6">
              <Card className="p-8 bg-white">
                <div className="max-w-4xl mx-auto">
                  <div className="text-center mb-8">
                    <div className="text-7xl mb-4">📚</div>
                    <h2 className="text-3xl text-gray-900 mb-3">
                      Как создать Telegram бота
                    </h2>
                    <p className="text-gray-600">
                      Простое пошаговое руководство для начинающих
                    </p>
                  </div>

                  <div className="space-y-6">
                    {/* Step 1 */}
                    <div className="flex items-start gap-4 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                      <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                        1
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Откройте Telegram и найдите @BotFather
                        </h4>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          BotFather — это официальный бот Telegram для создания новых ботов.
                          Просто введите <code className="bg-white px-2 py-0.5 rounded text-indigo-600">@BotFather</code> в
                          поиске и откройте чат.
                        </p>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex items-start gap-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                        2
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Отправьте команду /newbot
                        </h4>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          BotFather попросит указать имя бота и его username. Username должен
                          заканчиваться на "bot" (например, MyAwesomeBot).
                        </p>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex items-start gap-4 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                      <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                        3
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Получите токен доступа
                        </h4>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          После создания бота BotFather отправит вам токен. Скопируйте его и
                          используйте во вкладке "Активация" для подключения бота.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Warning Alert */}
                  <div className="mt-8 p-5 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="flex gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-amber-900 mb-2">
                          ⚠️ Важно: Безопасность токена
                        </h4>
                        <ul className="text-sm text-amber-800 space-y-1">
                          <li>• Никогда не делитесь токеном с посторонними</li>
                          <li>• Не публикуйте токен в открытом доступе</li>
                          <li>• Храните токен в безопасном месте</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Activation Tab */}
            <TabsContent value="activation" className="mt-6">
              <Card className="p-8 bg-white">
                <div className="max-w-2xl mx-auto">
                  <div className="text-center mb-8">
                    <div className="text-7xl mb-4">🔑</div>
                    <h2 className="text-3xl text-gray-900 mb-3">Активация бота</h2>
                    <p className="text-gray-600">
                      Введите токен вашего Telegram бота для активации
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="bot-token" className="text-base mb-3 block">
                        Токен бота *
                      </Label>
                      <div className="relative">
                        <Input
                          id="bot-token"
                          type={showToken ? "text" : "password"}
                          value={token}
                          onChange={(e) => setToken(e.target.value)}
                          placeholder="123456789:ABCdefGHijKlMNOpqrsTUVwxyz"
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

                    {/* Info Card */}
                    <div className="p-5 bg-blue-50 border border-blue-200 rounded-xl">
                      <div className="flex gap-3">
                        <div className="text-2xl">ℹ️</div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-blue-900 mb-2">
                            Формат токена
                          </h4>
                          <p className="text-sm text-blue-800 mb-2">
                            Токен должен иметь следующий формат:
                          </p>
                          <code className="block text-xs bg-white px-3 py-2 rounded border border-blue-200 text-blue-700">
                            123456789:ABCdefGHijKlMNOpqrsTUVwxyz
                          </code>
                          <p className="text-sm text-blue-800 mt-3">
                            Получите токен у @BotFather после создания бота
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                      <Button
                        variant="outline"
                        onClick={() => setToken("")}
                        disabled={!token}
                        className="flex-1 h-11"
                      >
                        Очистить
                      </Button>
                      <Button
                        onClick={handleValidateToken}
                        disabled={!token || isValidating}
                        className="flex-1 h-11 bg-indigo-600 hover:bg-indigo-700 text-white"
                      >
                        {isValidating ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4 mr-2" />
                        )}
                        {isValidating ? "Проверка..." : "Проверить токен"}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="mt-6 space-y-6">
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
                    <div className="w-48 h-48 bg-white rounded-lg shadow-md p-3 mb-4">
                      {/* Placeholder QR Code - In real app, use a QR library */}
                      <div className="w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded flex items-center justify-center">
                        <QrCode className="w-24 h-24 text-white" />
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Отсканируйте QR код для быстрого доступа к боту
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-3 gap-3">
                    <Button
                      variant="outline"
                      onClick={handleOpenBot}
                      className="h-11"
                    >
                      <ExternalLink className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Открыть</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleDownloadQR}
                      className="h-11"
                    >
                      <Download className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Скачать</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleShare}
                      className="h-11"
                    >
                      <Share2 className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Поделиться</span>
                    </Button>
                  </div>

                  <Separator />

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={handleShare}
                      className="flex-1 h-11"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Поделиться
                    </Button>
                    <Button
                      onClick={handleCopyLink}
                      className="flex-1 h-11 bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Копировать ссылку
                    </Button>
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