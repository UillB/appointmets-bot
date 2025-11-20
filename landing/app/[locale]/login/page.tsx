'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import Link from 'next/link'
import {
  LogIn,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Calendar,
  ArrowRight,
  Shield,
  Zap,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react'
import toast from 'react-hot-toast'
import AppointexoLogo from '@/components/AppointexoLogo'

export default function LoginPage() {
  const router = useRouter()
  const locale = useLocale()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Always start with light theme, then check localStorage for saved preference
    document.documentElement.classList.remove('dark')
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark') {
      setIsDark(true)
      document.documentElement.classList.add('dark')
    } else {
      setIsDark(false)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast.error('Please fill in all fields')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      if (response.ok) {
        const result = await response.json()

        if (result.token) {
          // Save token and user data temporarily in sessionStorage for cross-origin transfer
          // Also save in localStorage for current domain
          localStorage.setItem('accessToken', result.token)
          localStorage.setItem('user', JSON.stringify(result.user))
          
          // CRITICAL: Pass token via URL parameter since localStorage is not shared between domains
          // Admin panel will read from URL and save to its localStorage
          // Use environment variable for production, fallback to localhost for development
          const adminPanelUrl = process.env.NEXT_PUBLIC_ADMIN_PANEL_URL 
            ? new URL(process.env.NEXT_PUBLIC_ADMIN_PANEL_URL)
            : new URL('http://localhost:4200')
          
          adminPanelUrl.searchParams.set('token', result.token)
          // Encode user JSON to handle special characters safely
          adminPanelUrl.searchParams.set('user', encodeURIComponent(JSON.stringify(result.user)))
          
          toast.success('Welcome back!', {
            description: 'You have successfully logged in',
          })
          
          // Redirect to admin panel with token in URL
          window.location.href = adminPanelUrl.toString()
        } else {
          toast.error('Login failed')
        }
      } else {
        let errorMessage = 'Login failed'
        try {
          const error = await response.json()
          errorMessage = error.message || 'Login failed'
        } catch (e) {
          if (response.status === 401) {
            errorMessage = 'Invalid email or password'
          } else if (response.status === 400) {
            errorMessage = 'Invalid data'
          }
        }
        toast.error(errorMessage)
      }
    } catch (error) {
      toast.error('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-950 dark:via-indigo-950/50 dark:to-purple-950/50 flex items-center justify-center p-4 relative transition-colors">
      {/* Back to Landing Button */}
      <Link
        href={`/${locale}`}
        className="absolute top-4 left-4 flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors z-50"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="hidden sm:inline">Back to Home</span>
      </Link>

      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-200 dark:bg-indigo-900 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-xl opacity-30 dark:opacity-10 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-200 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-xl opacity-30 dark:opacity-10 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-200 dark:bg-pink-900 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-xl opacity-20 dark:opacity-5 animate-pulse delay-2000"></div>
      </div>

      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 relative z-10">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex flex-col justify-center space-y-8">
          {/* Logo */}
          <Link href={`/${locale}`} className="space-y-4 group">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl group-hover:scale-105 transition-transform">
              <AppointexoLogo size={48} className="text-white" />
            </div>
            <div>
              <h1 className="text-5xl mb-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 dark:from-indigo-400 dark:via-purple-400 dark:to-indigo-500 bg-clip-text text-transparent group-hover:opacity-80 transition-opacity">
                Appointexo
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Manage your bookings with ease
              </p>
            </div>
          </Link>

          {/* Features */}
          <div className="space-y-6">
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
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl">
              <div className="text-3xl text-indigo-600 dark:text-indigo-400 mb-1">10K+</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Users</div>
            </div>
            <div className="text-center p-4 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl">
              <div className="text-3xl text-purple-600 dark:text-purple-400 mb-1">50K+</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Bookings</div>
            </div>
            <div className="text-center p-4 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl">
              <div className="text-3xl text-pink-600 dark:text-pink-400 mb-1">99.9%</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Uptime</div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-md p-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl rounded-2xl border border-white/60 dark:border-gray-800/60">
            {/* Mobile Logo */}
            <Link href={`/${locale}`} className="lg:hidden mb-8 text-center block group">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl mx-auto mb-4 group-hover:scale-105 transition-transform">
                <AppointexoLogo size={40} className="text-white" />
              </div>
              <h2 className="text-2xl mb-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 dark:from-indigo-400 dark:via-purple-400 dark:to-indigo-500 bg-clip-text text-transparent group-hover:opacity-80 transition-opacity">
                Appointexo
              </h2>
            </Link>

            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg hidden lg:flex">
                <LogIn className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl mb-2 text-gray-900 dark:text-gray-100">Welcome Back</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Sign in to access your dashboard
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 h-12 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors"
                    placeholder="your@email.com"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-11 h-12 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors"
                    placeholder="Enter your password"
                    disabled={isLoading}
                    required
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
                  <input
                    id="remember"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={isLoading}
                    className="w-4 h-4 text-indigo-600 border-gray-300 dark:border-gray-700 rounded focus:ring-indigo-500 dark:focus:ring-indigo-400 bg-white dark:bg-gray-800"
                  />
                  <label
                    htmlFor="remember"
                    className="text-sm cursor-pointer select-none text-gray-900 dark:text-gray-100"
                  >
                    Remember me
                  </label>
                </div>
                <button
                  type="button"
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 px-0"
                  disabled={isLoading}
                  onClick={() => toast.info('Password reset link sent to your email')}
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl rounded-lg transition-all flex items-center justify-center font-semibold disabled:opacity-50"
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
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/80 dark:bg-gray-900/80 text-gray-500 dark:text-gray-400">
                  New to Appointexo?
                </span>
              </div>
            </div>

            {/* Register Link */}
            <Link
              href={`/${locale}/register`}
              className="block w-full h-12 border-2 border-indigo-200 dark:border-indigo-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-lg transition-colors flex items-center justify-center font-semibold text-gray-900 dark:text-gray-100"
            >
              Create an Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
