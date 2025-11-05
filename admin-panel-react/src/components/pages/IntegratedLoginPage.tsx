import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  UserPlus,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Calendar,
  ArrowRight,
  CheckCircle2,
  Shield,
  Zap,
  LogIn,
  Building,
  ArrowLeft,
  Sun,
  Moon,
  Check,
} from "lucide-react";
import { toast } from "sonner";

export function IntegratedLoginPage() {
  const { login, register, isLoading } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  
  // Login form state
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  
  // Register form state
  const [registerData, setRegisterData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    organizationName: "",
    agreeToTerms: false,
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginData.email || !loginData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      await login(loginData.email, loginData.password);
      toast.success("Welcome back!", {
        description: "You have successfully logged in",
      });
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!registerData.fullName || !registerData.email || !registerData.password || !registerData.confirmPassword || !registerData.organizationName) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (registerData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!registerData.agreeToTerms) {
      toast.error("Please agree to the terms and conditions");
      return;
    }

    try {
      await register(
        registerData.email,
        registerData.password,
        registerData.fullName,
        registerData.organizationName
      );
      toast.success("Account created successfully!", {
        description: "Welcome to Appointments Bot",
      });
    } catch (error) {
      // Error is handled in the hook
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-950 dark:via-indigo-950/50 dark:to-purple-950/50 flex items-center justify-center p-4 overflow-x-hidden transition-colors relative">
      {/* Theme Toggle Button - Top Right */}
      <div className="absolute top-4 right-4 z-50">
        <DropdownMenu open={themeMenuOpen} onOpenChange={setThemeMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="w-9 h-9 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700"
            >
              {resolvedTheme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="w-40 !bg-white dark:!bg-gray-900 !border-gray-200 dark:!border-gray-800 z-[10000]"
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setTheme("light");
                setThemeMenuOpen(false);
              }}
              className="flex items-center justify-between cursor-pointer text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-800"
            >
              <span>Light</span>
              {resolvedTheme === "light" && <Check className="w-4 h-4" />}
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setTheme("dark");
                setThemeMenuOpen(false);
              }}
              className="flex items-center justify-between cursor-pointer text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-800"
            >
              <span>Dark</span>
              {resolvedTheme === "dark" && <Check className="w-4 h-4" />}
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setTheme("light"); // Auto = light for now
                setThemeMenuOpen(false);
              }}
              className="flex items-center justify-between cursor-pointer text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-800"
            >
              <span>System</span>
              {theme === "auto" && <Check className="w-4 h-4" />}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-200 dark:bg-indigo-900/30 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-xl opacity-30 dark:opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-200 dark:bg-purple-900/30 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-xl opacity-30 dark:opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-200 dark:bg-pink-900/30 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-xl opacity-20 dark:opacity-10 animate-pulse delay-2000"></div>
      </div>

      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 relative z-10 min-h-screen lg:min-h-0">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex flex-col justify-center space-y-8">
          {/* Logo */}
          <div className="space-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <Calendar className="w-12 h-12 text-white" />
            </div>
            <div>
              <h1 className="text-5xl mb-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 dark:from-indigo-400 dark:via-purple-400 dark:to-indigo-500 bg-clip-text text-transparent">
                {isLoginMode ? "Appointments Bot" : "Join Us Today"}
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                {isLoginMode 
                  ? "Manage your bookings with ease" 
                  : "Start managing appointments effortlessly"
                }
              </p>
            </div>
          </div>

          {/* Features/Benefits */}
          <div className="space-y-6">
            {isLoginMode ? (
              // Login features
              <>
                <div className="flex items-start gap-4 p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-white/60 dark:border-gray-700/60 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg mb-1 text-gray-900 dark:text-gray-100">Lightning Fast</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Instant booking confirmations and real-time updates
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-white/60 dark:border-gray-700/60 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg mb-1 text-gray-900 dark:text-gray-100">Secure & Private</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Your data is encrypted and protected at all times
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-white/60 dark:border-gray-700/60 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg mb-1 text-gray-900 dark:text-gray-100">Easy to Use</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Intuitive interface designed for efficiency
                    </p>
                  </div>
                </div>
              </>
            ) : (
              // Register benefits
              <>
                <div className="flex items-start gap-4 p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-white/60 dark:border-gray-700/60 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg mb-1 text-gray-900 dark:text-gray-100">Free to Start</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Create your account and start managing bookings immediately
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-white/60 dark:border-gray-700/60 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg mb-1 text-gray-900 dark:text-gray-100">Quick Setup</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Get up and running in minutes with our guided onboarding
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-white/60 dark:border-gray-700/60 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg mb-1 text-gray-900 dark:text-gray-100">Enterprise Security</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Bank-level encryption to keep your data safe and secure
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl border border-white/40 dark:border-gray-700/40">
              <div className="text-3xl text-indigo-600 dark:text-indigo-400 mb-1">10K+</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Users</div>
            </div>
            <div className="text-center p-4 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl border border-white/40 dark:border-gray-700/40">
              <div className="text-3xl text-purple-600 dark:text-purple-400 mb-1">50K+</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Bookings</div>
            </div>
            <div className="text-center p-4 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl border border-white/40 dark:border-gray-700/40">
              <div className="text-3xl text-pink-600 dark:text-pink-400 mb-1">99.9%</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Uptime</div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex items-center justify-center w-full px-4 py-8 lg:py-0">
          <Card className="login-form-card p-6 lg:p-8 bg-white/80 dark:bg-gray-900/90 backdrop-blur-xl shadow-2xl border-white/60 dark:border-gray-700/60 relative">
            {/* Back to Landing Button */}
            <a
              href="http://localhost:3000"
              className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-4 lg:absolute lg:top-6 lg:left-6"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back to Landing</span>
            </a>
            
            {/* Mobile Logo */}
            <div className="lg:hidden mb-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl mx-auto mb-4">
                <Calendar className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl mb-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent">
                Appointments Bot
              </h2>
            </div>

            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg hidden lg:flex">
                {isLoginMode ? (
                  <LogIn className="w-6 h-6 text-white" />
                ) : (
                  <UserPlus className="w-6 h-6 text-white" />
                )}
              </div>
              <h2 className="text-2xl mb-2 text-gray-900 dark:text-gray-100">
                {isLoginMode ? "Welcome Back" : "Create Account"}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isLoginMode 
                  ? "Sign in to access your dashboard" 
                  : "Join thousands of users managing appointments"
                }
              </p>
            </div>

            {/* Login Form */}
            {isLoginMode ? (
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-900 dark:text-gray-100 font-medium">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <Input
                      id="email"
                      type="email"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      className="pl-11 h-10 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                      placeholder="your@email.com"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-900 dark:text-gray-100 font-medium">
                    Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      className="pl-11 pr-11 h-10 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                      placeholder="Enter your password"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={loginData.rememberMe}
                      onCheckedChange={(checked) =>
                        setLoginData({ ...loginData, rememberMe: checked as boolean })
                      }
                      disabled={isLoading}
                    />
                    <Label
                      htmlFor="remember"
                      className="text-sm cursor-pointer select-none text-gray-900 dark:text-gray-100"
                    >
                      Remember me
                    </Label>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 px-0"
                    disabled={isLoading}
                    onClick={() => toast.info("Password reset link sent to your email")}
                  >
                    Forgot password?
                  </Button>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-10 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            ) : (
              /* Register Form */
              <form onSubmit={handleRegister} className="space-y-4">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-gray-900 dark:text-gray-100 font-medium">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <Input
                      id="fullName"
                      type="text"
                      value={registerData.fullName}
                      onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
                      className="pl-11 h-10 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                      placeholder="John Doe"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-900 dark:text-gray-100 font-medium">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <Input
                      id="email"
                      type="email"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      className="pl-11 h-10 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                      placeholder="your@email.com"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Organization */}
                <div className="space-y-2">
                  <Label htmlFor="organization" className="text-gray-900 dark:text-gray-100 font-medium">
                    Organization Name <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <Input
                      id="organization"
                      type="text"
                      value={registerData.organizationName}
                      onChange={(e) => setRegisterData({ ...registerData, organizationName: e.target.value })}
                      className="pl-11 h-10 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                      placeholder="Enter organization name"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-900 dark:text-gray-100 font-medium">
                    Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      className="pl-11 pr-11 h-10 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                      placeholder="Min. 6 characters"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-900 dark:text-gray-100 font-medium">
                    Confirm Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                      className="pl-11 pr-11 h-10 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                      placeholder="Re-enter password"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Terms Agreement */}
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={registerData.agreeToTerms}
                    onCheckedChange={(checked) =>
                      setRegisterData({ ...registerData, agreeToTerms: checked as boolean })
                    }
                    disabled={isLoading}
                    className="mt-1"
                  />
                  <Label
                    htmlFor="terms"
                    className="text-sm cursor-pointer select-none leading-relaxed text-gray-900 dark:text-gray-100"
                  >
                    I agree to the{" "}
                    <button
                      type="button"
                      className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 underline"
                      onClick={() => toast.info("Terms & Conditions")}
                    >
                      Terms & Conditions
                    </button>{" "}
                    and{" "}
                    <button
                      type="button"
                      className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 underline"
                      onClick={() => toast.info("Privacy Policy")}
                    >
                      Privacy Policy
                    </button>
                  </Label>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-10 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            )}

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/80 dark:bg-gray-900/80 text-gray-500 dark:text-gray-400">
                  {isLoginMode ? "New to Appointments Bot?" : "Already have an account?"}
                </span>
              </div>
            </div>

            {/* Switch Mode Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-10 border-2 border-indigo-200 dark:border-indigo-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors text-gray-900 dark:text-gray-100"
              onClick={() => setIsLoginMode(!isLoginMode)}
            >
              {isLoginMode ? "Create an Account" : "Sign In Instead"}
            </Button>

            {/* Demo Credentials */}
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-200">
                  <p className="font-medium mb-1">Demo Credentials</p>
                  <p className="text-xs">
                    Email: some@example.com<br />
                    Password: Test1234
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
