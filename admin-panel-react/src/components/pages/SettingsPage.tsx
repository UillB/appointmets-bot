import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Settings as SettingsIcon,
  RefreshCw,
  Download,
  Save,
  User,
  Mail,
  Building2,
  Calendar,
  Shield,
  Globe,
  Palette,
  Bell,
  Clock,
  CalendarDays,
  Timer,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";
import { StatCard } from "../cards/StatCard";
import { PageHeader } from "../PageHeader";
import { PageTitle } from "../PageTitle";
import React from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Switch } from "../ui/switch";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { useLanguage } from "../../i18n";
import { useSearchParams } from "react-router-dom";
import { useTheme } from "../../hooks/useTheme";

export function SettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam || "profile");
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();

  // Update active tab when URL param changes
  useEffect(() => {
    if (tabParam && (tabParam === 'profile' || tabParam === 'system')) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);
  
  // User Profile State
  const [fullName, setFullName] = useState("Vladi");
  const [email, setEmail] = useState("some@example.com");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [timezone, setTimezone] = useState("UTC");
  const [dateFormat, setDateFormat] = useState("MM/DD/YYYY");
  const [timeFormat, setTimeFormat] = useState("12");
  const [refreshInterval, setRefreshInterval] = useState("30");

  const stats = [
    {
      icon: User,
      iconBg: "bg-blue-50 dark:bg-blue-900/50",
      iconColor: "text-blue-600 dark:text-blue-400",
      title: t('settings.stats.accountStatus'),
      value: t('settings.stats.active'),
      subtitle: t('settings.stats.sinceOct2023'),
    },
    {
      icon: Shield,
      iconBg: "bg-emerald-50 dark:bg-emerald-900/50",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      title: t('settings.stats.securityLevel'),
      value: t('settings.stats.high'),
      subtitle: t('settings.stats.twoFAEnabled'),
    },
    {
      icon: Calendar,
      iconBg: "bg-purple-50 dark:bg-purple-900/50",
      iconColor: "text-purple-600 dark:text-purple-400",
      title: t('settings.stats.memberSince'),
      value: t('common.notAvailable'),
      subtitle: t('settings.stats.activeUser'),
    },
  ];

  const handleRefresh = () => {
    toast.success(t('toasts.settingsRefreshed'));
  };


  const handleUpdateProfile = () => {
    if (!fullName || !email) {
      toast.error(t('settings.errors.fillAllRequiredFields'));
      return;
    }
    toast.success(t('settings.profileUpdatedSuccessfully'));
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error(t('settings.errors.fillAllPasswordFields'));
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(t('settings.errors.passwordsDoNotMatch'));
      return;
    }
    if (newPassword.length < 8) {
      toast.error(t('settings.errors.passwordMinLength'));
      return;
    }
    
    toast.success(t('settings.passwordChangedSuccessfully'));
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleSaveSettings = () => {
    toast.success(t('settings.systemSettingsSavedSuccessfully'));
  };

  return (
    <div className="space-y-6">
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Page Title */}
          <PageTitle
            icon={<SettingsIcon className="w-6 h-6 text-white" />}
            title={t('settings.title')}
            description={t('settings.description')}
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
              </>
            }
          />
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.map((stat) => (
              <StatCard 
                key={stat.title}
                icon={stat.icon}
                iconBg={stat.iconBg}
                iconColor={stat.iconColor}
                title={stat.title}
                value={stat.value}
                subtitle={stat.subtitle}
              />
            ))}
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100 dark:bg-gray-800">
              <TabsTrigger value="profile" className="gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100 text-gray-600 dark:text-gray-400">
                <User className="w-4 h-4" />
                {t('settings.tabs.userProfile')}
              </TabsTrigger>
              <TabsTrigger value="system" className="gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100 text-gray-600 dark:text-gray-400">
                <SettingsIcon className="w-4 h-4" />
                {t('settings.tabs.systemSettings')}
              </TabsTrigger>
            </TabsList>

            {/* User Profile Tab */}
            <TabsContent value="profile" className="mt-0 space-y-6">
              {/* Current Profile Info */}
              <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg text-gray-900 dark:text-gray-100">{t('settings.profile.title')}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('settings.profile.description')}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Profile Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <span className="text-xs text-blue-600 dark:text-blue-400 font-medium uppercase">
                          {t('settings.profile.fields.fullName')}
                        </span>
                      </div>
                      <p className="text-gray-900 dark:text-gray-100">{fullName}</p>
                    </div>

                    <div className="p-4 bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <Mail className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        <span className="text-xs text-purple-600 dark:text-purple-400 font-medium uppercase">
                          {t('settings.profile.fields.emailAddress')}
                        </span>
                      </div>
                      <p className="text-gray-900 dark:text-gray-100">{email}</p>
                    </div>

                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium uppercase">
                          {t('settings.profile.fields.role')}
                        </span>
                      </div>
                      <Badge className="bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 dark:hover:bg-emerald-600">
                        {t('settings.profile.role.manager')}
                      </Badge>
                    </div>

                    <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium uppercase">
                          {t('settings.profile.fields.organization')}
                        </span>
                      </div>
                      <p className="text-gray-900 dark:text-gray-100">Demo Org</p>
                    </div>

                    <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900 rounded-lg sm:col-span-2">
                      <div className="flex items-center gap-3 mb-2">
                        <Calendar className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        <span className="text-xs text-amber-600 dark:text-amber-400 font-medium uppercase">
                          {t('settings.profile.fields.memberSince')}
                        </span>
                      </div>
                      <p className="text-gray-900 dark:text-gray-100">{t('common.notAvailable')}</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Update Profile Form */}
              <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-lg text-gray-900 dark:text-gray-100">{t('settings.profile.updateTitle')}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('settings.profile.updateDescription')}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">
                        {t('settings.profile.fields.fullName')} <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <Input
                          id="fullName"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="pl-10 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                          placeholder={t('settings.profile.placeholders.fullName')}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">
                        {t('settings.profile.fields.emailAddress')} <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                          placeholder={t('settings.profile.placeholders.email')}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button
                      onClick={handleUpdateProfile}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      {t('settings.profile.updateButton')}
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Change Password */}
              <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                      <Lock className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-lg text-gray-900 dark:text-gray-100">{t('settings.password.title')}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('settings.password.description')}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">
                        {t('settings.password.fields.currentPassword')} <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <Input
                          id="currentPassword"
                          type={showCurrentPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="pl-10 pr-10 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                          placeholder={t('settings.password.placeholders.currentPassword')}
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">
                          {t('settings.password.fields.newPassword')} <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                          <Input
                            id="newPassword"
                            type={showNewPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="pl-10 pr-10 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                            placeholder={t('settings.password.placeholders.newPassword')}
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
                          >
                            {showNewPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">
                          {t('settings.password.fields.confirmPassword')} <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="pl-10 pr-10 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                            placeholder={t('settings.password.placeholders.confirmPassword')}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900 rounded-lg p-4">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        <strong>{t('settings.password.requirements.title')}</strong>
                      </p>
                      <ul className="list-disc list-inside text-sm text-blue-600 dark:text-blue-400 mt-2 space-y-1">
                        <li>{t('settings.password.requirements.minLength')}</li>
                        <li>{t('settings.password.requirements.uppercaseLowercase')}</li>
                        <li>{t('settings.password.requirements.number')}</li>
                        <li>{t('settings.password.requirements.specialCharacter')}</li>
                      </ul>
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button
                        onClick={handleChangePassword}
                        className="bg-red-500 hover:bg-red-600 text-white"
                      >
                        <Lock className="w-4 h-4 mr-2" />
                        {t('settings.password.changeButton')}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* System Settings Tab */}
            <TabsContent value="system" className="mt-0 space-y-6">
              {/* Language & Theme */}
              <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                      <Globe className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-lg text-gray-900 dark:text-gray-100">{t('settings.system.languageTheme.title')}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('settings.system.languageTheme.description')}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="language">{t('settings.system.languageTheme.language')}</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 z-10 pointer-events-none" />
                        <Select value={language} onValueChange={(value) => setLanguage(value as 'ru' | 'en' | 'he' | 'de' | 'fr' | 'es' | 'pt')}>
                          <SelectTrigger id="language" className="pl-10 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                            <SelectItem value="en" className="text-gray-900 dark:text-gray-100">🇬🇧 English</SelectItem>
                            <SelectItem value="ru" className="text-gray-900 dark:text-gray-100">🇷🇺 Русский</SelectItem>
                            <SelectItem value="he" className="text-gray-900 dark:text-gray-100">🇮🇱 עברית</SelectItem>
                            <SelectItem value="de" className="text-gray-900 dark:text-gray-100">🇩🇪 Deutsch</SelectItem>
                            <SelectItem value="fr" className="text-gray-900 dark:text-gray-100">🇫🇷 Français</SelectItem>
                            <SelectItem value="es" className="text-gray-900 dark:text-gray-100">🇪🇸 Español</SelectItem>
                            <SelectItem value="pt" className="text-gray-900 dark:text-gray-100">🇵🇹 Português</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="theme">{t('settings.system.languageTheme.theme')}</Label>
                      <div className="relative">
                        <Palette className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 z-10 pointer-events-none" />
                        <Select value={theme} onValueChange={setTheme}>
                          <SelectTrigger id="theme" className="pl-10 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                            <SelectItem value="light" className="text-gray-900 dark:text-gray-100">{t('settings.system.languageTheme.themeOptions.light')}</SelectItem>
                            <SelectItem value="dark" className="text-gray-900 dark:text-gray-100">{t('settings.system.languageTheme.themeOptions.dark')}</SelectItem>
                            <SelectItem value="auto" className="text-gray-900 dark:text-gray-100">{t('settings.system.languageTheme.themeOptions.auto')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Notifications */}
              <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg text-gray-900 dark:text-gray-100">{t('settings.system.notifications.title')}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('settings.system.notifications.description')}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <div className="flex items-center gap-3 flex-1">
                        <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <div>
                          <Label className="text-base cursor-pointer text-gray-900 dark:text-gray-100">
                            {t('settings.system.notifications.emailNotifications')}
                          </Label>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {t('settings.system.notifications.emailNotificationsDescription')}
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                        className="ml-4"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <div className="flex items-center gap-3 flex-1">
                        <Bell className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        <div>
                          <Label className="text-base cursor-pointer text-gray-900 dark:text-gray-100">
                            {t('settings.system.notifications.pushNotifications')}
                          </Label>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {t('settings.system.notifications.pushNotificationsDescription')}
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={pushNotifications}
                        onCheckedChange={setPushNotifications}
                        className="ml-4"
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {/* System Preferences */}
              <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                      <SettingsIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-lg text-gray-900 dark:text-gray-100">{t('settings.system.preferences.title')}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('settings.system.preferences.description')}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="timezone" className="text-gray-900 dark:text-gray-100">{t('settings.system.preferences.timezone')}</Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 z-10 pointer-events-none" />
                        <Select value={timezone} onValueChange={setTimezone}>
                          <SelectTrigger id="timezone" className="pl-10 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                            <SelectItem value="UTC" className="text-gray-900 dark:text-gray-100">UTC</SelectItem>
                            <SelectItem value="America/New_York" className="text-gray-900 dark:text-gray-100">
                              Eastern Time (ET)
                            </SelectItem>
                            <SelectItem value="America/Los_Angeles" className="text-gray-900 dark:text-gray-100">
                              Pacific Time (PT)
                            </SelectItem>
                            <SelectItem value="Europe/London" className="text-gray-900 dark:text-gray-100">
                              London (GMT)
                            </SelectItem>
                            <SelectItem value="Europe/Moscow" className="text-gray-900 dark:text-gray-100">
                              Moscow (MSK)
                            </SelectItem>
                            <SelectItem value="Asia/Jerusalem" className="text-gray-900 dark:text-gray-100">
                              Israel (IST)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="dateFormat" className="text-gray-900 dark:text-gray-100">{t('settings.system.preferences.dateFormat')}</Label>
                        <div className="relative">
                          <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 z-10 pointer-events-none" />
                          <Select value={dateFormat} onValueChange={setDateFormat}>
                            <SelectTrigger id="dateFormat" className="pl-10 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                              <SelectItem value="MM/DD/YYYY" className="text-gray-900 dark:text-gray-100">MM/DD/YYYY</SelectItem>
                              <SelectItem value="DD/MM/YYYY" className="text-gray-900 dark:text-gray-100">DD/MM/YYYY</SelectItem>
                              <SelectItem value="YYYY-MM-DD" className="text-gray-900 dark:text-gray-100">YYYY-MM-DD</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="timeFormat" className="text-gray-900 dark:text-gray-100">{t('settings.system.preferences.timeFormat')}</Label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 z-10 pointer-events-none" />
                          <Select value={timeFormat} onValueChange={setTimeFormat}>
                            <SelectTrigger id="timeFormat" className="pl-10 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                              <SelectItem value="12" className="text-gray-900 dark:text-gray-100">{t('settings.system.preferences.timeFormat12')}</SelectItem>
                              <SelectItem value="24" className="text-gray-900 dark:text-gray-100">{t('settings.system.preferences.timeFormat24')}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="refreshInterval" className="text-gray-900 dark:text-gray-100">
                        {t('settings.system.preferences.refreshInterval')}
                      </Label>
                      <div className="relative">
                        <Timer className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 z-10 pointer-events-none" />
                        <Select
                          value={refreshInterval}
                          onValueChange={setRefreshInterval}
                        >
                          <SelectTrigger id="refreshInterval" className="pl-10 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                            <SelectItem value="15" className="text-gray-900 dark:text-gray-100">{t('settings.system.preferences.refreshInterval15')}</SelectItem>
                            <SelectItem value="30" className="text-gray-900 dark:text-gray-100">{t('settings.system.preferences.refreshInterval30')}</SelectItem>
                            <SelectItem value="60" className="text-gray-900 dark:text-gray-100">{t('settings.system.preferences.refreshInterval60')}</SelectItem>
                            <SelectItem value="300" className="text-gray-900 dark:text-gray-100">{t('settings.system.preferences.refreshInterval300')}</SelectItem>
                            <SelectItem value="0" className="text-gray-900 dark:text-gray-100">{t('settings.system.preferences.refreshIntervalManual')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button
                      onClick={handleSaveSettings}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {t('settings.system.saveButton')}
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
