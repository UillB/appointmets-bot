'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import {
  Calendar,
  Clock,
  Zap,
  Shield,
  Users,
  BarChart3,
  Bot,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Phone,
  Mail,
  Globe,
  MessageSquare,
  Star,
  TrendingUp,
  Heart,
  Award,
  DollarSign,
  Moon,
  Sun,
} from 'lucide-react'
import Header from './Header'

export default function LandingPage() {
  const router = useRouter()
  const locale = useLocale()
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Always start with light theme
    document.documentElement.classList.remove('dark')
    // Then check localStorage for saved preference
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark') {
      setIsDark(true)
      document.documentElement.classList.add('dark')
    } else {
      setIsDark(false)
    }
  }, [])

  const onGetStarted = () => {
    router.push(`/${locale}/register`)
  }

  const onLogin = () => {
    router.push(`/${locale}/login`)
  }

  const onViewPricing = () => {
    router.push(`/${locale}/pricing`)
  }

  const onViewContact = () => {
    router.push(`/${locale}/contact`)
  }

  const features = [
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "Automated appointment booking with intelligent time slot management",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Bot,
      title: "Telegram Bot",
      description: "Instant communication with customers directly in their favorite messenger",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Complete statistics and insights to grow your business",
      color: "from-emerald-500 to-teal-500",
    },
    {
      icon: Users,
      title: "Multi-Organization",
      description: "Manage multiple locations from a single unified interface",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: Clock,
      title: "24/7 Availability",
      description: "Customers can book appointments anytime, from anywhere",
      color: "from-indigo-500 to-purple-500",
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with real-time synchronization",
      color: "from-pink-500 to-rose-500",
    },
  ]

  const stats = [
    { value: "10K+", label: "Active Users", icon: Users },
    { value: "50K+", label: "Appointments Processed", icon: Calendar },
    { value: "99.9%", label: "Uptime", icon: TrendingUp },
    { value: "24/7", label: "Customer Support", icon: MessageSquare },
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Beauty Salon Owner",
      content: "This platform completely transformed how we manage appointments. Our no-show rate dropped by 60%!",
      avatar: "SJ",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Fitness Studio Director",
      content: "The Telegram bot integration is brilliant. Our clients love the convenience.",
      avatar: "MC",
      rating: 5,
    },
    {
      name: "Emma Williams",
      role: "Spa Center Manager",
      content: "Best booking system we've used. The analytics help us optimize our schedule perfectly.",
      avatar: "EW",
      rating: 5,
    },
  ]

  const benefits = [
    {
      icon: Heart,
      title: "Happy Customers",
      description: "Convenient booking directly in Telegram without downloading extra apps",
    },
    {
      icon: TrendingUp,
      title: "Business Growth",
      description: "Automation frees up time for development and customer acquisition",
    },
    {
      icon: Award,
      title: "Professional Image",
      description: "Modern technology emphasizes your business status",
    },
    {
      icon: DollarSign,
      title: "Cost Savings",
      description: "Fewer missed appointments = more profit every month",
    },
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors">
      {/* Header with Logo and Language Switcher */}
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/50 via-white to-white dark:from-indigo-950/30 dark:via-gray-950 dark:to-gray-950 py-12 lg:py-24 xl:py-32 transition-colors">
        {/* Animated Background Elements - скрыты на мобильных */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none hidden lg:block">
          <svg className="absolute top-0 left-0 w-full h-full opacity-30" viewBox="0 0 1000 1000">
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            <circle cx="100" cy="100" r="80" fill="url(#grad1)" className="animate-pulse" />
            <circle cx="900" cy="200" r="100" fill="url(#grad1)" className="animate-pulse delay-1000" />
            <circle cx="800" cy="800" r="120" fill="url(#grad1)" className="animate-pulse delay-2000" />
            <circle cx="200" cy="900" r="90" fill="url(#grad1)" className="animate-pulse delay-500" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-4 lg:space-y-6 xl:space-y-8 text-center lg:text-left">
              <div className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border-0 inline-flex items-center px-3 py-1 rounded-full text-xs lg:text-sm">
                <Sparkles className="w-3 h-3 mr-1" />
                Powered by AI & Telegram
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl text-gray-900 dark:text-gray-100 font-bold">
                Online Booking
                <span className="block mt-1 lg:mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Made Simple
                </span>
              </h1>

              <p className="text-base lg:text-lg xl:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto lg:mx-0">
                Automate customer bookings with a Telegram bot. 
                No more phone calls and confusion — just a clear schedule and happy clients.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 lg:gap-4">
                <button
                  onClick={onGetStarted}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 h-11 lg:h-12 xl:h-14 px-6 lg:px-8 text-sm lg:text-base xl:text-lg shadow-xl text-white rounded-lg flex items-center gap-2 w-full sm:w-auto transition-all"
                >
                  Try Free for 14 Days
                  <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5" />
                </button>
                <button
                  onClick={onViewPricing}
                  className="h-11 lg:h-12 xl:h-14 px-6 lg:px-8 text-sm lg:text-base xl:text-lg border-2 border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:border-indigo-700 dark:hover:border-indigo-400 w-full sm:w-auto rounded-lg flex items-center justify-center gap-2 transition-all"
                >
                  <DollarSign className="w-4 h-4 lg:w-5 lg:h-5" />
                  View Pricing
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 lg:gap-6 text-xs lg:text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 lg:w-5 lg:h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 lg:w-5 lg:h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>14-day free trial</span>
                </div>
              </div>
            </div>

            {/* Right Illustration */}
            <div className="relative">
              <div className="relative w-full aspect-square max-w-lg mx-auto">
                {/* Animated SVG Illustration */}
                <svg viewBox="0 0 500 500" className="w-full h-full">
                  <defs>
                    <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                    <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>

                  {/* Background Circle */}
                  <circle cx="250" cy="250" r="200" fill="url(#gradient1)" opacity="0.1" className="animate-pulse" />
                  
                  {/* Phone Shape */}
                  <rect x="150" y="100" width="200" height="300" rx="30" fill="url(#gradient1)" opacity="0.9" />
                  <rect x="160" y="110" width="180" height="280" rx="25" fill="white" />
                  
                  {/* Screen Content */}
                  <rect x="175" y="140" width="150" height="15" rx="7" fill="#e5e7eb" />
                  <rect x="175" y="170" width="100" height="12" rx="6" fill="#e5e7eb" />
                  
                  {/* Calendar Icon */}
                  <rect x="180" y="200" width="60" height="60" rx="10" fill="url(#gradient1)" opacity="0.2" />
                  <rect x="190" y="210" width="15" height="15" rx="3" fill="url(#gradient1)" />
                  
                  {/* Bot Icon */}
                  <circle cx="310" cy="230" r="30" fill="url(#gradient2)" opacity="0.2" />
                  <circle cx="310" cy="230" r="15" fill="url(#gradient2)" />
                  
                  {/* Check Marks */}
                  <circle cx="200" cy="320" r="12" fill="#10b981" className="animate-pulse" />
                  <circle cx="250" cy="320" r="12" fill="#10b981" className="animate-pulse delay-300" />
                  <circle cx="300" cy="320" r="12" fill="#10b981" className="animate-pulse delay-700" />
                  
                  {/* Floating Elements */}
                  <circle cx="100" cy="150" r="20" fill="url(#gradient1)" opacity="0.3" className="animate-bounce" />
                  <circle cx="400" cy="350" r="25" fill="url(#gradient2)" opacity="0.3" className="animate-bounce delay-500" />
                </svg>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-12 lg:mt-16 xl:mt-20 grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 xl:gap-8">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="text-center p-3 lg:p-4 xl:p-6 bg-white dark:bg-gray-900 rounded-xl lg:rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-lg lg:rounded-xl flex items-center justify-center mx-auto mb-2 lg:mb-3">
                  <stat.icon className="w-5 h-5 lg:w-6 lg:h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="text-2xl lg:text-3xl xl:text-4xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-1 font-bold">
                  {stat.value}
                </div>
                <div className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Light Gray Background */}
      <section id="features" className="py-12 lg:py-20 xl:py-32 bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 lg:space-y-4 mb-8 lg:mb-12 xl:mb-16">
            <div className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border-0 inline-flex px-3 py-1 rounded-full text-xs lg:text-sm">
              Features
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl text-gray-900 dark:text-gray-100 font-bold">
              Everything you need to
              <span className="block mt-1 lg:mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                manage appointments
              </span>
            </h2>
            <p className="text-sm lg:text-base xl:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Powerful tools to optimize your booking process
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 xl:gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="p-4 lg:p-6 xl:p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 rounded-xl relative overflow-hidden group cursor-pointer"
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                {/* Animated background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                
                <div className={`w-12 h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16 bg-gradient-to-br ${feature.color} rounded-xl lg:rounded-2xl flex items-center justify-center mb-4 lg:mb-5 xl:mb-6 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg`}>
                  <feature.icon className="w-6 h-6 lg:w-7 lg:h-7 xl:w-8 xl:h-8 text-white" />
                </div>
                <h3 className="text-lg lg:text-xl xl:text-2xl mb-2 lg:mb-3 text-gray-900 dark:text-gray-100 font-semibold">{feature.title}</h3>
                <p className="text-sm lg:text-base text-gray-600 dark:text-gray-300 leading-relaxed">{feature.description}</p>
                
                {/* Animated underline */}
                <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${feature.color} transition-all duration-500 ${hoveredFeature === index ? 'w-full' : 'w-0'}`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section - White Background */}
      <section id="benefits" className="py-12 lg:py-20 xl:py-32 bg-white dark:bg-gray-950 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 lg:space-y-4 mb-8 lg:mb-12 xl:mb-16">
            <div className="bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 border-0 inline-flex px-3 py-1 rounded-full text-xs lg:text-sm">
              Benefits
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl text-gray-900 dark:text-gray-100 font-bold">
              Why choose
              <span className="block mt-1 lg:mt-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Appointexo
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 xl:gap-8 max-w-5xl mx-auto">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="flex gap-3 lg:gap-4 xl:gap-6 p-4 lg:p-6 xl:p-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 rounded-xl lg:rounded-2xl border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all duration-300"
              >
                <div className="w-10 h-10 lg:w-12 lg:h-12 xl:w-14 xl:h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg lg:rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <benefit.icon className="w-5 h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-base lg:text-lg xl:text-xl mb-1 lg:mb-2 text-gray-900 dark:text-gray-100 font-semibold">{benefit.title}</h3>
                  <p className="text-sm lg:text-base text-gray-600 dark:text-gray-300">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Light Gray Background */}
      <section className="py-12 lg:py-20 xl:py-32 bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 lg:space-y-4 mb-8 lg:mb-12 xl:mb-16">
            <div className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border-0 inline-flex px-3 py-1 rounded-full text-xs lg:text-sm">
              How It Works
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl text-gray-900 dark:text-gray-100 font-bold">
              Get started in
              <span className="block mt-1 lg:mt-2 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                3 simple steps
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 xl:gap-12 max-w-6xl mx-auto">
            {[
              {
                step: "1",
                title: "Create Your Bot",
                description: "Set up your Telegram bot in minutes using our simple wizard",
                icon: Bot,
                color: "from-blue-500 to-cyan-500",
              },
              {
                step: "2",
                title: "Add Services",
                description: "Define your services, prices, and available working hours",
                icon: Zap,
                color: "from-purple-500 to-pink-500",
              },
              {
                step: "3",
                title: "Accept Bookings",
                description: "Share your bot link and start receiving appointments instantly",
                icon: CheckCircle2,
                color: "from-emerald-500 to-teal-500",
              },
            ].map((item, index) => (
              <div key={item.step} className="relative text-center group">
                <div className={`inline-flex items-center justify-center w-16 h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24 bg-gradient-to-br ${item.color} rounded-full text-white text-2xl lg:text-3xl xl:text-4xl mb-4 lg:mb-5 xl:mb-6 shadow-2xl group-hover:scale-110 transition-all duration-300 font-bold`}>
                  {item.step}
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-8 lg:top-10 xl:top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-indigo-200 to-purple-200 dark:from-indigo-800 dark:to-purple-800" />
                )}
                <div className={`w-12 h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16 bg-gradient-to-br ${item.color} rounded-xl lg:rounded-2xl flex items-center justify-center mx-auto mb-3 lg:mb-4 opacity-20 dark:opacity-30`}>
                  <item.icon className="w-6 h-6 lg:w-7 lg:h-7 xl:w-8 xl:h-8 text-white" />
                </div>
                <h3 className="text-lg lg:text-xl xl:text-2xl mb-2 lg:mb-3 text-gray-900 dark:text-gray-100 font-semibold">{item.title}</h3>
                <p className="text-sm lg:text-base text-gray-600 dark:text-gray-300">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials - White Background */}
      <section className="py-12 lg:py-20 xl:py-32 bg-white dark:bg-gray-950 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 lg:space-y-4 mb-8 lg:mb-12 xl:mb-16">
            <div className="bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 border-0 inline-flex px-3 py-1 rounded-full text-xs lg:text-sm">
              Testimonials
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl text-gray-900 dark:text-gray-100 font-bold">
              Trusted by businesses
              <span className="block mt-1 lg:mt-2 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                around the world
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 xl:gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.name} className="p-4 lg:p-6 xl:p-8 border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 rounded-xl hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-1 mb-3 lg:mb-4 xl:mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 lg:w-5 lg:h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-4 lg:mb-5 xl:mb-6 text-sm lg:text-base xl:text-lg leading-relaxed">"{testimonial.content}"</p>
                <div className="flex items-center gap-3 lg:gap-4">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm lg:text-base shadow-lg flex-shrink-0 font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="text-sm lg:text-base font-medium text-gray-900 dark:text-gray-100">{testimonial.name}</div>
                    <div className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Gradient Background */}
      <section className="py-12 lg:py-20 xl:py-32 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
        {/* Animated background - скрыто на мобильных */}
        <div className="absolute inset-0 opacity-30 hidden lg:block">
          <svg className="w-full h-full" viewBox="0 0 1000 1000">
            <circle cx="200" cy="200" r="150" fill="white" opacity="0.1" className="animate-pulse" />
            <circle cx="800" cy="800" r="200" fill="white" opacity="0.1" className="animate-pulse delay-1000" />
            <circle cx="900" cy="300" r="100" fill="white" opacity="0.1" className="animate-pulse delay-500" />
          </svg>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl text-white mb-4 lg:mb-6 font-bold">
            Ready to transform your booking process?
          </h2>
          <p className="text-base lg:text-lg xl:text-xl text-white/90 mb-6 lg:mb-8 xl:mb-10">
            Join thousands of happy Appointexo users today
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 lg:gap-4">
            <button
              onClick={onGetStarted}
              className="bg-white text-indigo-600 hover:bg-gray-50 h-11 lg:h-12 xl:h-14 px-6 lg:px-8 xl:px-10 text-sm lg:text-base xl:text-lg shadow-2xl rounded-lg flex items-center gap-2 w-full sm:w-auto transition-all font-semibold"
            >
              Start Your Free Trial
              <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5" />
            </button>
            <button
              onClick={onViewContact}
              className="border-2 border-white text-white bg-transparent hover:bg-white/10 h-11 lg:h-12 xl:h-14 px-6 lg:px-8 xl:px-10 text-sm lg:text-base xl:text-lg rounded-lg w-full sm:w-auto transition-all"
            >
              Contact Us
            </button>
          </div>
          <p className="mt-4 lg:mt-6 text-sm lg:text-base text-white/80">
            Try free for 14 days. No credit card required.
          </p>
        </div>
      </section>

      {/* Footer - Dark Background */}
      <footer className="bg-gray-900 text-gray-300 py-8 lg:py-12 xl:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8 xl:gap-12 mb-6 lg:mb-8 xl:mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 lg:gap-3 mb-4 lg:mb-6">
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg lg:rounded-xl flex items-center justify-center shadow-lg">
                  <Calendar className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                </div>
                <span className="text-lg lg:text-xl xl:text-2xl text-white font-bold">Appointexo</span>
              </div>
              <p className="text-xs lg:text-sm text-gray-400 leading-relaxed">
                Smart appointment management powered by Telegram
              </p>
            </div>

            <div>
              <h3 className="text-white mb-3 lg:mb-4 text-sm lg:text-base xl:text-lg font-semibold">Product</h3>
              <ul className="space-y-2 lg:space-y-3 text-xs lg:text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><button onClick={onViewPricing} className="hover:text-white transition-colors">Pricing</button></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white mb-3 lg:mb-4 text-sm lg:text-base xl:text-lg font-semibold">Company</h3>
              <ul className="space-y-2 lg:space-y-3 text-xs lg:text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><button onClick={onViewContact} className="hover:text-white transition-colors">Contact</button></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white mb-3 lg:mb-4 text-sm lg:text-base xl:text-lg font-semibold">Connect</h3>
              <div className="flex gap-2 lg:gap-3 mb-4 lg:mb-6">
                <a href="#" className="w-9 h-9 lg:w-10 lg:h-10 xl:w-11 xl:h-11 bg-gray-800 rounded-lg lg:rounded-xl flex items-center justify-center hover:bg-gray-700 transition-colors">
                  <MessageSquare className="w-4 h-4 lg:w-5 lg:h-5" />
                </a>
                <a href="#" className="w-9 h-9 lg:w-10 lg:h-10 xl:w-11 xl:h-11 bg-gray-800 rounded-lg lg:rounded-xl flex items-center justify-center hover:bg-gray-700 transition-colors">
                  <Mail className="w-4 h-4 lg:w-5 lg:h-5" />
                </a>
                <a href="#" className="w-9 h-9 lg:w-10 lg:h-10 xl:w-11 xl:h-11 bg-gray-800 rounded-lg lg:rounded-xl flex items-center justify-center hover:bg-gray-700 transition-colors">
                  <Globe className="w-4 h-4 lg:w-5 lg:h-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-4 lg:pt-6 xl:pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 lg:gap-4">
            <p className="text-xs lg:text-sm text-gray-400">
              © 2025 Appointexo. All rights reserved.
            </p>
            <div className="flex gap-4 lg:gap-6 text-xs lg:text-sm">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

