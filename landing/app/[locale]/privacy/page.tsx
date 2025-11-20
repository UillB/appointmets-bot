'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import Link from 'next/link'
import {
  ArrowLeft,
  Shield,
  Lock,
  Eye,
  FileText,
  CheckCircle2,
} from 'lucide-react'
import AppointexoLogo from '@/components/AppointexoLogo'

export default function PrivacyPage() {
  const router = useRouter()
  const locale = useLocale()
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark)
    setIsDark(shouldBeDark)
    if (shouldBeDark) {
      document.documentElement.classList.add('dark')
    }
  }, [])

  const onBackToLanding = () => {
    router.push(`/${locale}`)
  }

  const sections = [
    {
      icon: FileText,
      title: "Information We Collect",
      content: [
        "We collect information that you provide directly to us, including:",
        "• Account information (name, email address, organization name)",
        "• Appointment data and scheduling information",
        "• Communication data when you contact our support team",
        "• Usage data and analytics to improve our services"
      ]
    },
    {
      icon: Lock,
      title: "How We Use Your Information",
      content: [
        "We use the information we collect to:",
        "• Provide, maintain, and improve our services",
        "• Process and manage your appointments",
        "• Send you technical notices and support messages",
        "• Respond to your comments and questions",
        "• Monitor and analyze trends and usage"
      ]
    },
    {
      icon: Shield,
      title: "Data Security",
      content: [
        "We implement appropriate technical and organizational measures to protect your personal data:",
        "• Encryption of data in transit and at rest",
        "• Regular security audits and updates",
        "• Access controls and authentication",
        "• Secure data storage with industry-standard practices"
      ]
    },
    {
      icon: Eye,
      title: "Your Rights",
      content: [
        "You have the right to:",
        "• Access your personal data",
        "• Correct inaccurate data",
        "• Request deletion of your data",
        "• Object to processing of your data",
        "• Data portability",
        "• Withdraw consent at any time"
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 dark:bg-gray-950/95 backdrop-blur-lg border-b border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={onBackToLanding}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </button>

            <Link href={`/${locale}`} className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <AppointexoLogo size={24} className="text-white" />
              </div>
              <span className="text-2xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-bold group-hover:opacity-80 transition-opacity">
                Appointexo
              </span>
            </Link>

            <div className="w-20" /> {/* Spacer for centering */}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-indigo-50/50 via-white to-white dark:from-indigo-950/30 dark:via-gray-950 dark:to-gray-950 transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border-0 inline-flex items-center px-3 py-1 rounded-full mb-6 text-xs lg:text-sm">
            <Shield className="w-3 h-3 mr-1" />
            Privacy & Security
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl mb-6 text-gray-900 dark:text-gray-100 font-bold">
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20 bg-white dark:bg-gray-950 transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <div className="mb-12">
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                At Appointexo, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our appointment booking platform.
              </p>
            </div>

            {sections.map((section, index) => (
              <div key={index} className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                    <section.icon className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-3xl text-gray-900 dark:text-gray-100 font-bold">{section.title}</h2>
                </div>
                <div className="space-y-3">
                  {section.content.map((item, itemIndex) => (
                    <p key={itemIndex} className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {item}
                    </p>
                  ))}
                </div>
              </div>
            ))}

            <div className="mb-12">
              <h2 className="text-3xl mb-6 text-gray-900 dark:text-gray-100 font-bold">Cookies and Tracking</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We use cookies and similar tracking technologies to track activity on our platform and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
              </p>
            </div>

            <div className="mb-12">
              <h2 className="text-3xl mb-6 text-gray-900 dark:text-gray-100 font-bold">Third-Party Services</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We may use third-party services that collect, monitor, and analyze information to help us improve our services. These services have their own privacy policies.
              </p>
            </div>

            <div className="mb-12">
              <h2 className="text-3xl mb-6 text-gray-900 dark:text-gray-100 font-bold">Changes to This Policy</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
              </p>
            </div>

            <div className="mb-12">
              <h2 className="text-3xl mb-6 text-gray-900 dark:text-gray-100 font-bold">Contact Us</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-6 border border-indigo-100 dark:border-indigo-900">
                <p className="text-gray-900 dark:text-gray-100 font-semibold mb-2">Email:</p>
                <a href="mailto:support@appointexo.com" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                  support@appointexo.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Note */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <p className="text-sm">
              Your privacy is important to us. We are committed to protecting your personal information.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

