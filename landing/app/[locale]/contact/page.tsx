'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import Link from 'next/link'
import AppointexoLogo from '@/components/AppointexoLogo'
import {
  ArrowLeft,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Send,
  MessageSquare,
  Clock,
  Globe,
  CheckCircle2,
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function ContactPage() {
  const router = useRouter()
  const locale = useLocale()
  const [isDark, setIsDark] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields")
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error("Please enter a valid email address")
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      toast.success("Message sent successfully!", {
        description: "We'll get back to you as soon as possible",
      })
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      })
    }, 1500)
  }

  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      value: "support@appointexo.com",
      link: "mailto:support@appointexo.com",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Phone,
      title: "Phone",
      value: "+1 (800) 555-0123",
      link: "tel:+18005550123",
      color: "from-emerald-500 to-teal-500",
    },
    {
      icon: MessageSquare,
      title: "Telegram",
      value: "@appointexo_support",
      link: "https://t.me/appointexo_support",
      color: "from-indigo-500 to-purple-500",
    },
    {
      icon: MapPin,
      title: "Address",
      value: "123 Business St, San Francisco, CA",
      link: "#",
      color: "from-pink-500 to-rose-500",
    },
  ]

  const workingHours = [
    { day: "Monday - Friday", hours: "9:00 AM - 6:00 PM" },
    { day: "Saturday", hours: "10:00 AM - 4:00 PM" },
    { day: "Sunday", hours: "Closed" },
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

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <Link href={`/${locale}`} className="flex items-center gap-3 group">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                  <AppointexoLogo size={24} className="text-white" />
                </div>
                <span className="text-2xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-bold group-hover:opacity-80 transition-opacity">
                  Appointexo
                </span>
              </Link>
            </div>

            <div className="w-20" /> {/* Spacer for centering */}
          </div>
        </div>
      </nav>

      {/* Hero Section - White */}
      <section className="py-20 bg-white dark:bg-gray-950 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border-0 inline-flex items-center px-3 py-1 rounded-full mb-6 text-xs lg:text-sm">
            <MessageSquare className="w-3 h-3 mr-1" />
            Get in Touch
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl mb-6 text-gray-900 dark:text-gray-100 font-bold">
            We're here to
            <span className="block mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              help you
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Have questions? Need assistance? Drop us a message and we'll get back to you soon
          </p>
        </div>
      </section>

      {/* Contact Info Cards - Light Gray */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info) => (
              <a
                key={info.title}
                href={info.link}
                className="block group"
              >
                <div className="p-6 bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className={`w-14 h-14 bg-gradient-to-br ${info.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                    <info.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg mb-2 text-gray-900 dark:text-gray-100 font-semibold">{info.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {info.value}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Info - White */}
      <section className="py-20 bg-white dark:bg-gray-950 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <div className="mb-8">
                <h2 className="text-3xl mb-4 text-gray-900 dark:text-gray-100 font-bold">Send us a Message</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Fill out the form below and our team will get back to you within 24 hours
                </p>
              </div>

              <div className="p-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 rounded-xl border border-gray-200 dark:border-gray-800">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="John Doe"
                      className="w-full h-12 px-4 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                      disabled={isSubmitting}
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                      <input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="john@example.com"
                        className="w-full h-12 pl-11 pr-4 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                        disabled={isSubmitting}
                        required
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                      <input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        placeholder="+1 (555) 123-4567"
                        className="w-full h-12 pl-11 pr-4 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="space-y-2">
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Subject</label>
                    <input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                      placeholder="Question about pricing"
                      className="w-full h-12 px-4 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      placeholder="Tell us how we can help..."
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                      disabled={isSubmitting}
                      required
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg text-white rounded-lg font-semibold flex items-center justify-center transition-all disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Additional Info */}
            <div className="space-y-8">
              {/* Working Hours */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl text-gray-900 dark:text-gray-100 font-bold">Support Hours</h3>
                </div>
                <div className="p-6 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 rounded-xl border border-gray-200 dark:border-gray-800">
                  <div className="space-y-4">
                    {workingHours.map((schedule) => (
                      <div
                        key={schedule.day}
                        className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-800 last:border-0"
                      >
                        <span className="text-gray-700 dark:text-gray-300">{schedule.day}</span>
                        <span className="text-gray-900 dark:text-gray-100 font-medium">{schedule.hours}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Help */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl text-gray-900 dark:text-gray-100 font-bold">Quick Help</h3>
                </div>
                <div className="p-6 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 rounded-xl border border-gray-200 dark:border-gray-800">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-gray-700 dark:text-gray-300 mb-1 font-medium">Knowledge Base</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Find answers to common questions in our help center
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-gray-700 dark:text-gray-300 mb-1 font-medium">Video Tutorials</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Watch step-by-step guides to using the platform
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-gray-700 dark:text-gray-300 mb-1 font-medium">Live Chat</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Get real-time support through Telegram
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map Placeholder */}
              <div>
                <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-100 dark:border-indigo-900 rounded-xl overflow-hidden">
                  <div className="aspect-video bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-12 h-12 text-indigo-600 dark:text-indigo-400 mx-auto mb-3" />
                      <p className="text-gray-700 dark:text-gray-300 font-medium">123 Business St</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        San Francisco, CA 94102
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Quick Links - Light Gray */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl mb-4 text-gray-900 dark:text-gray-100 font-bold">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Your question might already be answered here
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                question: "How do I get started?",
                answer: "Sign up and follow our simple setup wizard",
              },
              {
                question: "What does it cost?",
                answer: "Start free, paid plans from $29/month",
              },
              {
                question: "Is there support?",
                answer: "Yes, we're available via email, phone, and Telegram",
              },
              {
                question: "Can I integrate with other systems?",
                answer: "Yes, API available for integrations",
              },
              {
                question: "Is my data secure?",
                answer: "We use enterprise-grade encryption and security",
              },
              {
                question: "Can I cancel anytime?",
                answer: "Yes, you can cancel your subscription at any time",
              },
            ].map((faq, index) => (
              <div
                key={index}
                className="p-6 bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow"
              >
                <h3 className="text-lg mb-3 text-gray-900 dark:text-gray-100 font-semibold">{faq.question}</h3>
                <p className="text-gray-600 dark:text-gray-400">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

