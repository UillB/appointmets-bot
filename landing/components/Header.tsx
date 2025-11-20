'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X, Globe, User, LogIn, Moon, Sun } from 'lucide-react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import AppointexoLogo from './AppointexoLogo'

export default function Header() {
  const t = useTranslations('navigation')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [currentLocale, setCurrentLocale] = useState('ru')
  const [isDark, setIsDark] = useState(false)

  // Определяем текущий язык из URL
  useEffect(() => {
    const locale = pathname.split('/')[1] || 'ru'
    setCurrentLocale(locale)
  }, [pathname])

  // Отслеживаем скролл для изменения стиля header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Theme management
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark)
    setIsDark(shouldBeDark)
    if (shouldBeDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    if (newTheme) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  const changeLanguage = (locale: string) => {
    const currentPath = pathname.replace(/^\/[a-z]{2}/, '') || '/'
    router.push(`/${locale}${currentPath}`)
  }

  const navigation = [
    { name: t('home'), href: '/' },
    { name: t('features'), href: '#features' },
    { name: t('pricing'), href: `/${locale}/pricing` },
    { name: t('contact'), href: `/${locale}/contact` },
    { name: 'Privacy', href: `/${locale}/privacy` },
  ]

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 dark:bg-gray-950/95 backdrop-blur-md shadow-lg' 
          : 'bg-transparent'
      }`}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2.5">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <AppointexoLogo size={28} />
            </div>
            <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Appointexo</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200 font-medium"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Language Selector */}
            <div className="relative group">
               <button className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <Globe className="w-4 h-4" />
                <span className="text-sm font-medium uppercase">{currentLocale}</span>
              </button>
              
              <div className="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-2">
                  <button
                    onClick={() => changeLanguage('ru')}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      currentLocale === 'ru' ? 'text-indigo-600 dark:text-indigo-400 font-medium' : 'text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    🇷🇺 Русский
                  </button>
                  <button
                    onClick={() => changeLanguage('en')}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      currentLocale === 'en' ? 'text-primary-600 dark:text-primary-400 font-medium' : 'text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    🇺🇸 English
                  </button>
                  <button
                    onClick={() => changeLanguage('he')}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      currentLocale === 'he' ? 'text-primary-600 dark:text-primary-400 font-medium' : 'text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    🇮🇱 עברית
                  </button>
                  <button
                    onClick={() => changeLanguage('de')}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      currentLocale === 'de' ? 'text-primary-600 dark:text-primary-400 font-medium' : 'text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    🇩🇪 Deutsch
                  </button>
                  <button
                    onClick={() => changeLanguage('fr')}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      currentLocale === 'fr' ? 'text-primary-600 dark:text-primary-400 font-medium' : 'text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    🇫🇷 Français
                  </button>
                  <button
                    onClick={() => changeLanguage('es')}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      currentLocale === 'es' ? 'text-primary-600 dark:text-primary-400 font-medium' : 'text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    🇪🇸 Español
                  </button>
                  <button
                    onClick={() => changeLanguage('pt')}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      currentLocale === 'pt' ? 'text-primary-600 dark:text-primary-400 font-medium' : 'text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    🇵🇹 Português
                  </button>
                  <button
                    onClick={() => changeLanguage('ja')}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      currentLocale === 'ja' ? 'text-primary-600 dark:text-primary-400 font-medium' : 'text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    🇯🇵 日本語
                  </button>
                  <button
                    onClick={() => changeLanguage('zh')}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      currentLocale === 'zh' ? 'text-primary-600 dark:text-primary-400 font-medium' : 'text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    🇨🇳 中文
                  </button>
                  <button
                    onClick={() => changeLanguage('ar')}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      currentLocale === 'ar' ? 'text-indigo-600 dark:text-indigo-400 font-medium' : 'text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    🇸🇦 العربية
                  </button>
              </div>
            </div>
            </div>

            {/* Auth Buttons */}
            <Link
              href={`/${locale}/login`}
               className="flex items-center space-x-1 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span className="text-sm font-medium">{t('login')}</span>
            </Link>
            
            <Link
              href={`/${locale}/register`}
              className="btn-primary text-sm"
            >
              {t('register')}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
             className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
               className="md:hidden bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800"
            >
              <div className="px-4 py-6 space-y-4">
                {/* Mobile Navigation */}
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                     className="block text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200 font-medium"
                  >
                    {item.name}
                  </Link>
                ))}

                {/* Mobile Theme Toggle */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Theme</p>
                  <button
                    onClick={toggleTheme}
                    className="w-full flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {isDark ? 'Light Mode' : 'Dark Mode'}
                    </span>
                    {isDark ? <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" /> : <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
                  </button>
                </div>

                {/* Mobile Language Selector */}
                 <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                   <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Language</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => changeLanguage('ru')}
                      className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                        currentLocale === 'ru' 
                          ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300' 
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      🇷🇺 RU
                    </button>
                    <button
                      onClick={() => changeLanguage('en')}
                      className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                        currentLocale === 'en' 
                          ? 'bg-primary-100 text-primary-700' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      🇺🇸 EN
                    </button>
                    <button
                      onClick={() => changeLanguage('he')}
                      className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                        currentLocale === 'he' 
                          ? 'bg-primary-100 text-primary-700' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      🇮🇱 HE
                    </button>
                    <button
                      onClick={() => changeLanguage('de')}
                      className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                        currentLocale === 'de' 
                          ? 'bg-primary-100 text-primary-700' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      🇩🇪 DE
                    </button>
                    <button
                      onClick={() => changeLanguage('fr')}
                      className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                        currentLocale === 'fr' 
                          ? 'bg-primary-100 text-primary-700' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      🇫🇷 FR
                    </button>
                    <button
                      onClick={() => changeLanguage('es')}
                      className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                        currentLocale === 'es' 
                          ? 'bg-primary-100 text-primary-700' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      🇪🇸 ES
                    </button>
                    <button
                      onClick={() => changeLanguage('pt')}
                      className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                        currentLocale === 'pt' 
                          ? 'bg-primary-100 text-primary-700' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      🇵🇹 PT
                    </button>
                    <button
                      onClick={() => changeLanguage('ja')}
                      className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                        currentLocale === 'ja' 
                          ? 'bg-primary-100 text-primary-700' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      🇯🇵 JA
                    </button>
                    <button
                      onClick={() => changeLanguage('zh')}
                      className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                        currentLocale === 'zh' 
                          ? 'bg-primary-100 text-primary-700' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      🇨🇳 ZH
                    </button>
                    <button
                      onClick={() => changeLanguage('ar')}
                      className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                        currentLocale === 'ar' 
                          ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300' 
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      🇸🇦 AR
                    </button>
                  </div>
                </div>

                {/* Mobile Auth Buttons */}
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  <Link
                    href={`/${locale}/login`}
                    onClick={() => setIsMenuOpen(false)}
                     className="flex items-center justify-center space-x-2 w-full py-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    <span className="font-medium">{t('login')}</span>
                  </Link>
                  
                  <Link
                    href={`/${locale}/register`}
                    onClick={() => setIsMenuOpen(false)}
                    className="btn-primary w-full text-center"
                  >
                    {t('register')}
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
