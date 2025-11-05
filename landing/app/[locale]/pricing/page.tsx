'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import Link from 'next/link'
import {
  Check,
  X,
  Zap,
  Calendar,
  ArrowLeft,
  Sparkles,
  Crown,
  Rocket,
} from 'lucide-react'

export default function PricingPage() {
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

  const onGetStarted = () => {
    router.push(`/${locale}/register`)
  }

  const onContact = () => {
    router.push(`/${locale}/contact`)
  }

  const plans = [
    {
      name: "Starter",
      description: "Perfect for getting started",
      price: "0",
      period: "forever",
      icon: Calendar,
      color: "from-blue-500 to-cyan-500",
      features: [
        { text: "Up to 50 appointments/month", included: true },
        { text: "1 Telegram bot", included: true },
        { text: "Basic analytics", included: true },
        { text: "Email support", included: true },
        { text: "1 organization", included: true },
        { text: "Priority support", included: false },
        { text: "Advanced analytics", included: false },
        { text: "API access", included: false },
      ],
      popular: false,
      cta: "Start Free",
    },
    {
      name: "Professional",
      description: "For growing businesses",
      price: "29",
      period: "per month",
      icon: Zap,
      color: "from-indigo-500 to-purple-500",
      features: [
        { text: "Unlimited appointments", included: true },
        { text: "Up to 3 Telegram bots", included: true },
        { text: "Advanced analytics", included: true },
        { text: "Priority support", included: true },
        { text: "Up to 5 organizations", included: true },
        { text: "Bot customization", included: true },
        { text: "API access", included: true },
        { text: "White label", included: false },
      ],
      popular: true,
      cta: "Try 14 Days Free",
    },
    {
      name: "Enterprise",
      description: "For large companies",
      price: "Custom",
      period: "",
      icon: Crown,
      color: "from-purple-500 to-pink-500",
      features: [
        { text: "Everything in Professional", included: true },
        { text: "Unlimited bots", included: true },
        { text: "Unlimited organizations", included: true },
        { text: "Dedicated account manager", included: true },
        { text: "White label", included: true },
        { text: "On-premise deployment", included: true },
        { text: "SLA guarantees", included: true },
        { text: "Team training", included: true },
      ],
      popular: false,
      cta: "Contact Sales",
    },
  ]

  const faqs = [
    {
      question: "Can I change my plan at any time?",
      answer: "Yes, you can upgrade or downgrade your plan at any time. Upgrades take effect immediately, while downgrades take effect at the start of the next billing period.",
    },
    {
      question: "Are there any hidden fees?",
      answer: "No hidden fees whatsoever. You only pay for your chosen plan. All features included in your tier are part of the price.",
    },
    {
      question: "What happens after the trial period?",
      answer: "After your 14-day trial ends, you can choose a paid plan or continue using the free Starter plan.",
    },
    {
      question: "Do you offer refunds?",
      answer: "Yes, we offer a 30-day money-back guarantee. If you're not satisfied with the service, we'll refund your payment in full.",
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, MasterCard, Amex), PayPal, and bank transfers for enterprise clients.",
    },
    {
      question: "Do you offer discounts for nonprofits?",
      answer: "Yes, we provide special discounts up to 50% for educational institutions and nonprofit organizations. Contact us for details.",
    },
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 dark:bg-gray-950/95 backdrop-blur-lg border-b border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 lg:h-16">
            <button
              onClick={onBackToLanding}
              className="flex items-center gap-1 lg:gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 lg:w-5 lg:h-5" />
              <span className="text-sm lg:text-base">Back</span>
            </button>

            <div className="flex items-center gap-2 lg:gap-3">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg lg:rounded-xl flex items-center justify-center shadow-lg">
                <Calendar className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <span className="text-lg lg:text-2xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-bold">
                AppointBot
              </span>
            </div>

            <button 
              onClick={onGetStarted} 
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 h-8 lg:h-10 text-xs lg:text-sm px-3 lg:px-4 rounded-lg text-white shadow-lg transition-all"
            >
              <span className="hidden sm:inline">Get Started</span>
              <span className="sm:hidden">Start</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section - White */}
      <section className="py-8 lg:py-16 xl:py-20 bg-white dark:bg-gray-950 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border-0 inline-flex items-center px-3 py-1 rounded-full mb-4 lg:mb-6 text-xs lg:text-sm">
            <Sparkles className="w-3 h-3 mr-1" />
            Transparent Pricing
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-5xl xl:text-6xl mb-4 lg:mb-6 text-gray-900 dark:text-gray-100 font-bold">
            Choose the perfect plan
            <span className="block mt-1 lg:mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              for your business
            </span>
          </h1>
          <p className="text-sm lg:text-lg xl:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Start free and scale as you grow. No hidden fees.
          </p>
        </div>
      </section>

      {/* Pricing Cards - Light Gray */}
      <section className="py-8 lg:py-16 xl:py-20 bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 xl:gap-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative p-4 lg:p-6 xl:p-8 bg-white dark:bg-gray-950 rounded-xl border ${
                  plan.popular
                    ? "border-2 border-indigo-600 dark:border-indigo-500 shadow-2xl lg:scale-105 z-10"
                    : "border-gray-200 dark:border-gray-800 shadow-lg"
                } transition-all`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0 shadow-lg px-3 lg:px-4 py-0.5 lg:py-1 rounded-full text-xs flex items-center gap-1">
                      <Rocket className="w-3 h-3" />
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="text-center mb-6 lg:mb-8">
                  <div className={`w-12 h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16 bg-gradient-to-br ${plan.color} rounded-xl lg:rounded-2xl flex items-center justify-center mx-auto mb-3 lg:mb-4 shadow-lg`}>
                    <plan.icon className="w-6 h-6 lg:w-7 lg:h-7 xl:w-8 xl:h-8 text-white" />
                  </div>
                  <h3 className="text-lg lg:text-xl xl:text-2xl mb-1 lg:mb-2 text-gray-900 dark:text-gray-100 font-semibold">{plan.name}</h3>
                  <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 mb-4 lg:mb-6">{plan.description}</p>
                  <div className="mb-2">
                    {plan.price === "Custom" ? (
                      <div className="text-2xl lg:text-3xl xl:text-4xl text-gray-900 dark:text-gray-100 font-bold">{plan.price}</div>
                    ) : (
                      <>
                        <span className="text-3xl lg:text-4xl xl:text-5xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-bold">
                          {plan.price === "0" ? "Free" : `$${plan.price}`}
                        </span>
                        {plan.period && (
                          <span className="text-sm lg:text-base text-gray-500 dark:text-gray-400 ml-2">/ {plan.period}</span>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      {feature.included ? (
                        <div className="w-5 h-5 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <X className="w-3 h-3 text-gray-400 dark:text-gray-600" />
                        </div>
                      )}
                      <span className={feature.included ? "text-gray-700 dark:text-gray-300" : "text-gray-400 dark:text-gray-600"}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={plan.name === "Enterprise" ? onContact : onGetStarted}
                  className={`w-full h-12 rounded-lg font-semibold transition-all ${
                    plan.popular
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg"
                      : "bg-gray-900 dark:bg-gray-800 hover:bg-gray-800 dark:hover:bg-gray-700 text-white"
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>

          <p className="text-center text-gray-600 dark:text-gray-400 mt-12 text-sm lg:text-base">
            All plans include a 14-day free trial. No credit card required.
          </p>
        </div>
      </section>

      {/* Features Comparison - White */}
      <section className="py-20 bg-white dark:bg-gray-950 transition-colors">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl mb-4 text-gray-900 dark:text-gray-100 font-bold">
              Compare Features
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Detailed comparison of all features in each plan
            </p>
          </div>

          <div className="p-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 rounded-xl border border-gray-200 dark:border-gray-800">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100 font-semibold">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                    <Check className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  Starter
                </h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• 50 appointments/month</li>
                  <li>• 1 bot</li>
                  <li>• 1 organization</li>
                  <li>• Basic support</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100 font-semibold">
                  <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  Professional
                </h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Unlimited appointments</li>
                  <li>• Up to 3 bots</li>
                  <li>• Up to 5 organizations</li>
                  <li>• Priority support</li>
                  <li>• API access</li>
                </ul>
              </div>

              <div className="sm:col-span-2">
                <h3 className="text-xl mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100 font-semibold">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center">
                    <Crown className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  Enterprise
                </h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400 columns-1 sm:columns-2 gap-8">
                  <li>• Everything in Professional</li>
                  <li>• Unlimited bots</li>
                  <li>• Unlimited organizations</li>
                  <li>• Dedicated account manager</li>
                  <li>• White label</li>
                  <li>• On-premise</li>
                  <li>• SLA guarantees</li>
                  <li>• Team training</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ - Light Gray */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl mb-4 text-gray-900 dark:text-gray-100 font-bold">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Common questions about pricing and plans
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="p-6 bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow">
                <h3 className="text-lg mb-3 text-gray-900 dark:text-gray-100 font-semibold">{faq.question}</h3>
                <p className="text-gray-600 dark:text-gray-400">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA - Gradient */}
      <section className="py-20 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30 hidden lg:block">
          <svg className="w-full h-full" viewBox="0 0 1000 1000">
            <circle cx="200" cy="200" r="150" fill="white" opacity="0.1" className="animate-pulse" />
            <circle cx="800" cy="800" r="200" fill="white" opacity="0.1" className="animate-pulse delay-1000" />
            <circle cx="900" cy="300" r="100" fill="white" opacity="0.1" className="animate-pulse delay-500" />
          </svg>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl text-white mb-6 font-bold">
            Still have questions?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Contact us and we'll help you choose the right plan
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onContact}
              className="bg-white text-indigo-600 hover:bg-gray-50 h-14 px-10 rounded-lg font-semibold shadow-2xl transition-all"
            >
              Contact Us
            </button>
            <button
              onClick={onGetStarted}
              className="border-2 border-white text-white bg-transparent hover:bg-white/10 h-14 px-10 rounded-lg font-semibold transition-all"
            >
              Start Free Trial
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

