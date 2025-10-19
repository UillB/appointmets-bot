'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Clock, Zap, Heart, Smartphone, TrendingUp, Users } from 'lucide-react'

export default function Benefits() {
  const t = useTranslations('benefits')

  const benefits = [
    {
      icon: Clock,
      title: t('benefit1.title'),
      description: t('benefit1.description'),
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      icon: Zap,
      title: t('benefit2.title'),
      description: t('benefit2.description'),
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600'
    },
    {
      icon: Heart,
      title: t('benefit3.title'),
      description: t('benefit3.description'),
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600'
    },
    {
      icon: Smartphone,
      title: t('benefit4.title'),
      description: t('benefit4.description'),
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    }
  ]

  const stats = [
    { value: '95%', label: 'Удовлетворенность клиентов' },
    { value: '3x', label: 'Увеличение записей' },
    { value: '50%', label: 'Сокращение времени на администрирование' },
    { value: '24/7', label: 'Доступность для клиентов' }
  ]

  return (
    <section className="section-padding bg-gradient-to-br from-primary-50 to-primary-100">
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

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-start space-x-4">
                {/* Icon */}
                <div className={`w-16 h-16 ${benefit.bgColor} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                  <benefit.icon className={`w-8 h-8 ${benefit.iconColor}`} />
                </div>

                {/* Content */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl p-8 md:p-12 shadow-xl"
        >
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Результаты наших клиентов
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Посмотрите, как Bookly помогает бизнесу расти и развиваться
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-sm md:text-base text-gray-600">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Success Stories Preview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Story 1 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Клиника "Здоровье"</h4>
                  <p className="text-sm text-gray-600">Медицинский центр</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                "За 3 месяца использования Bookly количество записей увеличилось в 2.5 раза. Клиенты довольны удобством записи через Telegram."
              </p>
              <div className="mt-4 text-sm font-medium text-primary-600">
                +150% записей
              </div>
            </div>

            {/* Story 2 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Салон "Красота"</h4>
                  <p className="text-sm text-gray-600">Салон красоты</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                "Теперь 80% записей приходит через бота. Освободилось время для работы с клиентами вместо ответов на звонки."
              </p>
              <div className="mt-4 text-sm font-medium text-success-600">
                +80% автоматизации
              </div>
            </div>

            {/* Story 3 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                  <Heart className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Доктор Иванов</h4>
                  <p className="text-sm text-gray-600">Частная практика</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                "Простая настройка, понятный интерфейс. Клиенты записываются в любое время, а я получаю уведомления."
              </p>
              <div className="mt-4 text-sm font-medium text-purple-600">
                100% довольных клиентов
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
