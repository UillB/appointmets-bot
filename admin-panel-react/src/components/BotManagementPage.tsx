import { useState, useEffect } from "react";
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
import { toast } from "sonner@2.0.3";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card } from "./ui/card";

interface BotManagementPageProps {
  onMenuClick?: () => void;
}

export function BotManagementPage({ onMenuClick }: BotManagementPageProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showToken, setShowToken] = useState(false);
  const [token, setToken] = useState("");
  const [botActive] = useState(true);
  const [setupProgress] = useState(100);
  const [botName, setBotName] = useState("Bookly Demo Bot One");
  const [botDescription, setBotDescription] = useState(
    "Бот для записи на консультацию. Используйте /book для записи, /my для просмотра ваших записей."
  );
  const [botUsername] = useState("@BooklyTestOneBot");
  const [botLink] = useState("https://t.me/BooklyTestOneBot");

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
    toast.success("Статус обновлен");
  };

  const handleExportData = () => {
    toast.success("Экспорт данных начат");
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

  const handleValidateToken = () => {
    if (!token) {
      toast.error("Введите токен");
      return;
    }
    toast.success("Токен проверен успешно!");
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-gray-50">
      {/* Beautiful Gradient Header with Date/Time */}
      <div className="flex-shrink-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 px-4 sm:px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="text-white">
            <p className="text-sm opacity-90 mb-1">{formatDate(currentTime)}</p>
            <p className="text-3xl font-bold tracking-tight">{formatTime(currentTime)}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
            onClick={handleRefreshStatus}
          >
            <RefreshCw className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Page Header */}
      <div className="flex-shrink-0 bg-white px-4 sm:px-6 py-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl text-gray-900 mb-1">Управление ботом</h1>
              <p className="text-sm text-gray-500">
                Создайте и настройте Telegram бота для автоматической записи клиентов
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshStatus}
              className="hidden sm:flex"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Обновить статус
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportData}
              className="hidden sm:flex"
            >
              <Download className="w-4 h-4 mr-2" />
              Экспорт данных
            </Button>
            <Button
              size="sm"
              onClick={handleHelp}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <HelpCircle className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Помощь</span>
            </Button>
          </div>
        </div>
      </div>

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
                  <p className="text-sm text-gray-600">Demo Organization</p>
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
              <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium hover:underline">
                Настройка завершена
              </button>
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
                        disabled={!token}
                        className="flex-1 h-11 bg-indigo-600 hover:bg-indigo-700"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Проверить токен
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

                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Активен</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Users className="w-5 h-5 text-gray-600" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Username</p>
                      <p className="font-medium text-gray-900">{botUsername}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <LinkIcon className="w-5 h-5 text-gray-600" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Ссылка</p>
                      <p className="font-medium text-gray-900">{botLink}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <AtSign className="w-5 h-5 text-gray-600" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Возможности</p>
                      <p className="font-medium text-gray-900">
                        Может присоединиться к группам
                      </p>
                    </div>
                  </div>
                </div>
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

                  <Button
                    onClick={handleUpdateSettings}
                    className="w-full h-11 bg-indigo-600 hover:bg-indigo-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Обновить настройки
                  </Button>
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