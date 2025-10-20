'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Globe, User, LogIn } from 'lucide-react'
import Link from 'next/link'
import { useLocale } from 'next-intl'

export default function Header() {
  const t = useTranslations('navigation')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [currentLocale, setCurrentLocale] = useState('ru')

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

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  const changeLanguage = (locale: string) => {
    const currentPath = pathname.replace(/^\/[a-z]{2}/, '') || '/'
    router.push(`/${locale}${currentPath}`)
  }

  const navigation = [
    { name: t('home'), href: '/' },
    { name: t('features'), href: '#features' },
    { name: t('pricing'), href: '#pricing' },
    { name: t('about'), href: '#about' },
    { name: t('contact'), href: '#contact' },
  ]

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg' 
          : 'bg-transparent'
      }`}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Bookly</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-600 hover:text-primary-600 transition-colors duration-200 font-medium"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Language Selector */}
            <div className="relative group">
              <button className="flex items-center space-x-1 text-gray-600 hover:text-primary-600 transition-colors">
                <Globe className="w-4 h-4" />
                <span className="text-sm font-medium uppercase">{currentLocale}</span>
              </button>
              
              <div className="absolute right-0 top-full mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="py-2">
                  <button
                    onClick={() => changeLanguage('ru')}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                      currentLocale === 'ru' ? 'text-primary-600 font-medium' : 'text-gray-600'
                    }`}
                  >
                    🇷🇺 Русский
                  </button>
                  <button
                    onClick={() => changeLanguage('en')}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                      currentLocale === 'en' ? 'text-primary-600 font-medium' : 'text-gray-600'
                    }`}
                  >
                    🇺🇸 English
                  </button>
                  <button
                    onClick={() => changeLanguage('he')}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                      currentLocale === 'he' ? 'text-primary-600 font-medium' : 'text-gray-600'
                    }`}
                  >
                    🇮🇱 עברית
                  </button>
                </div>
              </div>
            </div>

            {/* Auth Buttons */}
            <Link
              href={`/${locale}/login`}
              className="flex items-center space-x-1 text-gray-600 hover:text-primary-600 transition-colors"
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
            className="md:hidden p-2 text-gray-600 hover:text-primary-600 transition-colors"
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
              className="md:hidden bg-white border-t border-gray-200"
            >
              <div className="px-4 py-6 space-y-4">
                {/* Mobile Navigation */}
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-gray-600 hover:text-primary-600 transition-colors duration-200 font-medium"
                  >
                    {item.name}
                  </Link>
                ))}

                {/* Mobile Language Selector */}
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-900 mb-3">Язык / Language / שפה</p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => changeLanguage('ru')}
                      className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                        currentLocale === 'ru' 
                          ? 'bg-primary-100 text-primary-700' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
                  </div>
                </div>

                {/* Mobile Auth Buttons */}
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  <Link
                    href={`/${locale}/login`}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-center space-x-2 w-full py-2 text-gray-600 hover:text-primary-600 transition-colors"
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
    </motion.header>
  )
}
