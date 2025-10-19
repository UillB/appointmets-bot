'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Check, Star, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function Pricing() {
  const t = useTranslations('pricing')

  const plans = [
    {
      name: t('free.name'),
      price: t('free.price'),
      period: t('free.period'),
      description: t('free.description'),
      features: [
        'До 50 записей в месяц',
        '1 организация',
        'Telegram бот',
        'Базовая аналитика',
        'Поддержка по email'
      ],
      cta: t('free.cta'),
      popular: false,
      color: 'border-gray-200',
      buttonColor: 'btn-outline'
    },
    {
      name: t('professional.name'),
      price: t('professional.price'),
      period: t('professional.period'),
      description: t('professional.description'),
      features: [
        'До 500 записей в месяц',
        '3 организации',
        'Расширенная аналитика',
        'Email уведомления',
        'Приоритетная поддержка',
        'Кастомизация бота'
      ],
      cta: t('professional.cta'),
      popular: true,
      color: 'border-primary-500',
      buttonColor: 'btn-primary'
    },
    {
      name: t('business.name'),
      price: t('business.price'),
      period: t('business.period'),
      description: t('business.description'),
      features: [
        'Неограниченные записи',
        'Неограниченные организации',
        'Полная аналитика',
        'SMS уведомления',
        'Интеграции с CRM',
        'Персональный менеджер',
        'API доступ'
      ],
      cta: t('business.cta'),
      popular: false,
      color: 'border-gray-200',
      buttonColor: 'btn-outline'
    }
  ]

  return (
    <section id="pricing" className="section-padding bg-white">
      <div className="container-custom">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-responsive-lg font-bold text-gray-900 mb-4">
            {t('title')}
          </h2>
          <p className="text-responsive-md text-gray-600 max-w-3xl mx-auto">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`relative bg-white rounded-2xl border-2 ${plan.color} p-8 shadow-lg hover:shadow-xl transition-all duration-300 ${
                plan.popular ? 'scale-105 lg:scale-110' : ''
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-primary-600 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center">
                    <Star className="w-4 h-4 mr-1" />
                    {t('professional.popular')}
                  </div>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 mb-6">
                  {plan.description}
                </p>
                
                {/* Price */}
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">
                    {plan.price}
                  </span>
                  <span className="text-gray-600 ml-2">
                    {plan.period}
                  </span>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: featureIndex * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center space-x-3"
                  >
                    <Check className="w-5 h-5 text-success-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </motion.div>
                ))}
              </div>

              {/* CTA Button */}
              <Link
                href="/register"
                className={`w-full ${plan.buttonColor} flex items-center justify-center group`}
              >
                {plan.cta}
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gray-50 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Нужен индивидуальный план?
            </h3>
            <p className="text-gray-600 mb-6">
              Свяжитесь с нами для обсуждения корпоративных решений и специальных условий.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-primary">
                Связаться с нами
              </button>
              <button className="btn-outline">
                Запросить демо
              </button>
            </div>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Частые вопросы о тарифах
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="space-y-6">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Можно ли изменить тариф?
                </h4>
                <p className="text-gray-600 text-sm">
                  Да, вы можете изменить тариф в любое время. Изменения вступают в силу в следующем биллинговом цикле.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Есть ли пробный период?
                </h4>
                <p className="text-gray-600 text-sm">
                  Да, все платные тарифы имеют 14-дневный пробный период без обязательств.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Что происходит при превышении лимитов?
                </h4>
                <p className="text-gray-600 text-sm">
                  Мы уведомим вас заранее. Вы можете обновить тариф или приобрести дополнительные записи.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Какие способы оплаты доступны?
                </h4>
                <p className="text-gray-600 text-sm">
                  Мы принимаем банковские карты, PayPal и банковские переводы для корпоративных клиентов.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
