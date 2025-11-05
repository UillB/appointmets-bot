import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Check,
  X,
  Zap,
  Calendar,
  ArrowLeft,
  Sparkles,
  Crown,
  Rocket,
} from "lucide-react";

interface PricingPageProps {
  onBackToLanding: () => void;
  onGetStarted: () => void;
  onContact: () => void;
}

export function PricingPage({ onBackToLanding, onGetStarted, onContact }: PricingPageProps) {
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
  ];

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
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 lg:h-16">
            <button
              onClick={onBackToLanding}
              className="flex items-center gap-1 lg:gap-2 text-gray-600 hover:text-indigo-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 lg:w-5 lg:h-5" />
              <span className="text-sm lg:text-base">Back</span>
            </button>

            <div className="flex items-center gap-2 lg:gap-3">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg lg:rounded-xl flex items-center justify-center shadow-lg">
                <Calendar className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <span className="text-lg lg:text-2xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                AppointBot
              </span>
            </div>

            <Button onClick={onGetStarted} className="bg-gradient-to-r from-indigo-600 to-purple-600 h-8 lg:h-10 text-xs lg:text-sm px-3 lg:px-4">
              <span className="hidden sm:inline">Get Started</span>
              <span className="sm:hidden">Start</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section - White */}
      <section className="py-8 lg:py-16 xl:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-0 mb-4 lg:mb-6 text-xs lg:text-sm">
            <Sparkles className="w-3 h-3 mr-1" />
            Transparent Pricing
          </Badge>
          <h1 className="text-2xl sm:text-3xl lg:text-5xl xl:text-6xl mb-4 lg:mb-6">
            Choose the perfect plan
            <span className="block mt-1 lg:mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              for your business
            </span>
          </h1>
          <p className="text-sm lg:text-lg xl:text-xl text-gray-600 max-w-2xl mx-auto">
            Start free and scale as you grow. No hidden fees.
          </p>
        </div>
      </section>

      {/* Pricing Cards - Light Gray */}
      <section className="py-8 lg:py-16 xl:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 xl:gap-8">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative p-4 lg:p-6 xl:p-8 bg-white ${
                  plan.popular
                    ? "border-2 border-indigo-600 shadow-2xl lg:scale-105 z-10"
                    : "border border-gray-200 shadow-lg"
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <Badge className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0 shadow-lg px-3 lg:px-4 py-0.5 lg:py-1 text-xs">
                      <Rocket className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                <div className="text-center mb-6 lg:mb-8">
                  <div className={`w-12 h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16 bg-gradient-to-br ${plan.color} rounded-xl lg:rounded-2xl flex items-center justify-center mx-auto mb-3 lg:mb-4 shadow-lg`}>
                    <plan.icon className="w-6 h-6 lg:w-7 lg:h-7 xl:w-8 xl:h-8 text-white" />
                  </div>
                  <h3 className="text-lg lg:text-xl xl:text-2xl mb-1 lg:mb-2">{plan.name}</h3>
                  <p className="text-sm lg:text-base text-gray-600 mb-4 lg:mb-6">{plan.description}</p>
                  <div className="mb-2">
                    {plan.price === "Custom" ? (
                      <div className="text-2xl lg:text-3xl">{plan.price}</div>
                    ) : (
                      <>
                        <span className="text-3xl lg:text-4xl xl:text-5xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                          {plan.price === "0" ? "Free" : `$${plan.price}`}
                        </span>
                        {plan.period && (
                          <span className="text-sm lg:text-base text-gray-500 ml-2">/ {plan.period}</span>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      {feature.included ? (
                        <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-emerald-600" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <X className="w-3 h-3 text-gray-400" />
                        </div>
                      )}
                      <span className={feature.included ? "text-gray-700" : "text-gray-400"}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={plan.name === "Enterprise" ? onContact : onGetStarted}
                  className={`w-full h-12 ${
                    plan.popular
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                      : "bg-gray-900 hover:bg-gray-800"
                  }`}
                >
                  {plan.cta}
                </Button>
              </Card>
            ))}
          </div>

          <p className="text-center text-gray-600 mt-12">
            All plans include a 14-day free trial. No credit card required.
          </p>
        </div>
      </section>

      {/* Features Comparison - White */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl mb-4">
              Compare Features
            </h2>
            <p className="text-gray-600">
              Detailed comparison of all features in each plan
            </p>
          </div>

          <Card className="p-8 bg-gradient-to-br from-gray-50 to-white border border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Check className="w-5 h-5 text-blue-600" />
                  </div>
                  Starter
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• 50 appointments/month</li>
                  <li>• 1 bot</li>
                  <li>• 1 organization</li>
                  <li>• Basic support</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-indigo-600" />
                  </div>
                  Professional
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Unlimited appointments</li>
                  <li>• Up to 3 bots</li>
                  <li>• Up to 5 organizations</li>
                  <li>• Priority support</li>
                  <li>• API access</li>
                </ul>
              </div>

              <div className="sm:col-span-2">
                <h3 className="text-xl mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Crown className="w-5 h-5 text-purple-600" />
                  </div>
                  Enterprise
                </h3>
                <ul className="space-y-2 text-sm text-gray-600 columns-1 sm:columns-2 gap-8">
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
          </Card>
        </div>
      </section>

      {/* FAQ - Light Gray */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600">
              Common questions about pricing and plans
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="p-6 bg-white border border-gray-200 hover:shadow-lg transition-shadow">
                <h3 className="text-lg mb-3">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA - Gradient */}
      <section className="py-20 bg-gradient-to-br from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl text-white mb-6">
            Still have questions?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Contact us and we'll help you choose the right plan
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={onContact}
              size="lg"
              className="bg-white text-indigo-600 hover:bg-gray-50 h-14 px-10"
            >
              Contact Us
            </Button>
            <Button
              onClick={onGetStarted}
              size="lg"
              variant="outline"
              className="border-2 border-white text-white bg-transparent hover:bg-white/10 h-14 px-10"
            >
              Start Free Trial
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
