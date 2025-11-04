import { useState } from "react";
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
import { toast } from "sonner@2.0.3";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Switch } from "../ui/switch";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { useLanguage } from "../../i18n";

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const { language, setLanguage } = useLanguage();
  
  // User Profile State
  const [fullName, setFullName] = useState("Vladi");
  const [email, setEmail] = useState("some@example.com");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // System Settings State (language is now from global context)
  const [theme, setTheme] = useState("light");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [timezone, setTimezone] = useState("UTC");
  const [dateFormat, setDateFormat] = useState("MM/DD/YYYY");
  const [timeFormat, setTimeFormat] = useState("12");
  const [refreshInterval, setRefreshInterval] = useState("30");

  const stats = [
    {
      icon: User,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      title: "Account Status",
      value: "Active",
      subtitle: "Since Oct 2023",
    },
    {
      icon: Shield,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      title: "Security Level",
      value: "High",
      subtitle: "2FA Enabled",
    },
    {
      icon: Calendar,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
      title: "Member Since",
      value: "N/A",
      subtitle: "Active user",
    },
  ];

  const handleRefresh = () => {
    toast.success("Settings refreshed");
  };


  const handleUpdateProfile = () => {
    if (!fullName || !email) {
      toast.error("Please fill all required fields");
      return;
    }
    toast.success("Profile updated successfully");
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill all password fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    
    toast.success("Password changed successfully");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleSaveSettings = () => {
    toast.success("System settings saved successfully");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<SettingsIcon className="w-7 h-7 text-white" />}
        title="Settings"
        description="Manage your account and system preferences"
        onRefresh={handleRefresh}
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
          </>
        }
      />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.map((stat) => (
              <StatCard key={stat.title} {...stat} />
            ))}
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="profile" className="gap-2">
                <User className="w-4 h-4" />
                User Profile
              </TabsTrigger>
              <TabsTrigger value="system" className="gap-2">
                <SettingsIcon className="w-4 h-4" />
                System Settings
              </TabsTrigger>
            </TabsList>

            {/* User Profile Tab */}
            <TabsContent value="profile" className="mt-0 space-y-6">
              {/* Current Profile Info */}
              <Card className="p-6 bg-white">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg">User Profile</h3>
                      <p className="text-sm text-gray-500">
                        Manage your personal information
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Profile Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <User className="w-5 h-5 text-blue-600" />
                        <span className="text-xs text-blue-600 font-medium uppercase">
                          Full Name
                        </span>
                      </div>
                      <p className="text-gray-900">{fullName}</p>
                    </div>

                    <div className="p-4 bg-purple-50 border border-purple-100 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <Mail className="w-5 h-5 text-purple-600" />
                        <span className="text-xs text-purple-600 font-medium uppercase">
                          Email Address
                        </span>
                      </div>
                      <p className="text-gray-900">{email}</p>
                    </div>

                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <Shield className="w-5 h-5 text-emerald-600" />
                        <span className="text-xs text-emerald-600 font-medium uppercase">
                          Role
                        </span>
                      </div>
                      <Badge className="bg-emerald-600 hover:bg-emerald-700">
                        Manager
                      </Badge>
                    </div>

                    <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <Building2 className="w-5 h-5 text-indigo-600" />
                        <span className="text-xs text-indigo-600 font-medium uppercase">
                          Organization
                        </span>
                      </div>
                      <p className="text-gray-900">Demo Org</p>
                    </div>

                    <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg sm:col-span-2">
                      <div className="flex items-center gap-3 mb-2">
                        <Calendar className="w-5 h-5 text-amber-600" />
                        <span className="text-xs text-amber-600 font-medium uppercase">
                          Member Since
                        </span>
                      </div>
                      <p className="text-gray-900">N/A</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Update Profile Form */}
              <Card className="p-6 bg-white">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-lg">Update Profile</h3>
                      <p className="text-sm text-gray-500">
                        Update your profile information
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">
                        Full Name <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="fullName"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="pl-10"
                          placeholder="Enter your full name"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">
                        Email Address <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                          placeholder="Enter your email"
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
                      Update Profile
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Change Password */}
              <Card className="p-6 bg-white">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <Lock className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-lg">Change Password</h3>
                      <p className="text-sm text-gray-500">
                        Update your password to keep your account secure
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">
                        Current Password <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="currentPassword"
                          type={showCurrentPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="pl-10 pr-10"
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
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
                          New Password <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="newPassword"
                            type={showNewPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="pl-10 pr-10"
                            placeholder="Enter new password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
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
                          Confirm Password <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="pl-10 pr-10"
                            placeholder="Confirm new password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
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

                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                      <p className="text-sm text-blue-700">
                        <strong>Password Requirements:</strong>
                      </p>
                      <ul className="list-disc list-inside text-sm text-blue-600 mt-2 space-y-1">
                        <li>At least 8 characters long</li>
                        <li>Include uppercase and lowercase letters</li>
                        <li>Include at least one number</li>
                        <li>Include at least one special character</li>
                      </ul>
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button
                        onClick={handleChangePassword}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <Lock className="w-4 h-4 mr-2" />
                        Change Password
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* System Settings Tab */}
            <TabsContent value="system" className="mt-0 space-y-6">
              {/* Language & Theme */}
              <Card className="p-6 bg-white">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Globe className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg">Language & Theme</h3>
                      <p className="text-sm text-gray-500">
                        Configure system preferences
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10 pointer-events-none" />
                        <Select value={language} onValueChange={(value) => setLanguage(value as 'ru' | 'en' | 'he')}>
                          <SelectTrigger id="language" className="pl-10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">🇬🇧 English</SelectItem>
                            <SelectItem value="ru">🇷🇺 Русский</SelectItem>
                            <SelectItem value="he">🇮🇱 עברית</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="theme">Theme</Label>
                      <div className="relative">
                        <Palette className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10 pointer-events-none" />
                        <Select value={theme} onValueChange={setTheme}>
                          <SelectTrigger id="theme" className="pl-10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">Light Theme</SelectItem>
                            <SelectItem value="dark">Dark Theme</SelectItem>
                            <SelectItem value="auto">Auto (System)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Notifications */}
              <Card className="p-6 bg-white">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Bell className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg">Notifications</h3>
                      <p className="text-sm text-gray-500">
                        Manage how you receive notifications
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3 flex-1">
                        <Mail className="w-5 h-5 text-blue-600" />
                        <div>
                          <Label className="text-base cursor-pointer">
                            Email Notifications
                          </Label>
                          <p className="text-sm text-gray-500 mt-1">
                            Receive notifications via email
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                        className="ml-4"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3 flex-1">
                        <Bell className="w-5 h-5 text-purple-600" />
                        <div>
                          <Label className="text-base cursor-pointer">
                            Push Notifications
                          </Label>
                          <p className="text-sm text-gray-500 mt-1">
                            Receive push notifications in browser
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
              <Card className="p-6 bg-white">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <SettingsIcon className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-lg">System Preferences</h3>
                      <p className="text-sm text-gray-500">
                        Configure date, time, and refresh settings
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10 pointer-events-none" />
                        <Select value={timezone} onValueChange={setTimezone}>
                          <SelectTrigger id="timezone" className="pl-10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="UTC">UTC</SelectItem>
                            <SelectItem value="America/New_York">
                              Eastern Time (ET)
                            </SelectItem>
                            <SelectItem value="America/Los_Angeles">
                              Pacific Time (PT)
                            </SelectItem>
                            <SelectItem value="Europe/London">
                              London (GMT)
                            </SelectItem>
                            <SelectItem value="Europe/Moscow">
                              Moscow (MSK)
                            </SelectItem>
                            <SelectItem value="Asia/Jerusalem">
                              Israel (IST)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="dateFormat">Date Format</Label>
                        <div className="relative">
                          <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10 pointer-events-none" />
                          <Select value={dateFormat} onValueChange={setDateFormat}>
                            <SelectTrigger id="dateFormat" className="pl-10">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                              <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                              <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="timeFormat">Time Format</Label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10 pointer-events-none" />
                          <Select value={timeFormat} onValueChange={setTimeFormat}>
                            <SelectTrigger id="timeFormat" className="pl-10">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="12">12 Hour (AM/PM)</SelectItem>
                              <SelectItem value="24">24 Hour</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="refreshInterval">
                        Refresh Interval (seconds)
                      </Label>
                      <div className="relative">
                        <Timer className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10 pointer-events-none" />
                        <Select
                          value={refreshInterval}
                          onValueChange={setRefreshInterval}
                        >
                          <SelectTrigger id="refreshInterval" className="pl-10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15">15 seconds</SelectItem>
                            <SelectItem value="30">30 seconds</SelectItem>
                            <SelectItem value="60">1 minute</SelectItem>
                            <SelectItem value="300">5 minutes</SelectItem>
                            <SelectItem value="0">Manual only</SelectItem>
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
                      Save Settings
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
