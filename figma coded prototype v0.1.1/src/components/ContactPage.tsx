import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
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
} from "lucide-react";
import { toast } from "sonner@2.0.3";

interface ContactPageProps {
  onBackToLanding: () => void;
}

export function ContactPage({ onBackToLanding }: ContactPageProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Message sent successfully!", {
        description: "We'll get back to you as soon as possible",
      });
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    }, 1500);
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      value: "support@appointbot.com",
      link: "mailto:support@appointbot.com",
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
      value: "@appointbot_support",
      link: "https://t.me/appointbot_support",
      color: "from-indigo-500 to-purple-500",
    },
    {
      icon: MapPin,
      title: "Address",
      value: "123 Business St, San Francisco, CA",
      link: "#",
      color: "from-pink-500 to-rose-500",
    },
  ];

  const workingHours = [
    { day: "Monday - Friday", hours: "9:00 AM - 6:00 PM" },
    { day: "Saturday", hours: "10:00 AM - 4:00 PM" },
    { day: "Sunday", hours: "Closed" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={onBackToLanding}
              className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                AppointBot
              </span>
            </div>

            <div className="w-20" /> {/* Spacer for centering */}
          </div>
        </div>
      </nav>

      {/* Hero Section - White */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-0 mb-6">
            <MessageSquare className="w-3 h-3 mr-1" />
            Get in Touch
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl mb-6">
            We're here to
            <span className="block mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              help you
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Have questions? Need assistance? Drop us a message and we'll get back to you soon
          </p>
        </div>
      </section>

      {/* Contact Info Cards - Light Gray */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info) => (
              <a
                key={info.title}
                href={info.link}
                className="block group"
              >
                <Card className="p-6 bg-white border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className={`w-14 h-14 bg-gradient-to-br ${info.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                    <info.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg mb-2 text-gray-900">{info.title}</h3>
                  <p className="text-gray-600 group-hover:text-indigo-600 transition-colors">
                    {info.value}
                  </p>
                </Card>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Info - White */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <div className="mb-8">
                <h2 className="text-3xl mb-4">Send us a Message</h2>
                <p className="text-gray-600">
                  Fill out the form below and our team will get back to you within 24 hours
                </p>
              </div>

              <Card className="p-8 bg-gradient-to-br from-gray-50 to-white border border-gray-200">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Your Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="John Doe"
                      className="h-12 bg-white"
                      disabled={isSubmitting}
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="john@example.com"
                        className="pl-11 h-12 bg-white"
                        disabled={isSubmitting}
                        required
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        placeholder="+1 (555) 123-4567"
                        className="pl-11 h-12 bg-white"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                      placeholder="Question about pricing"
                      className="h-12 bg-white"
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <Label htmlFor="message">
                      Message <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      placeholder="Tell us how we can help..."
                      rows={6}
                      className="resize-none bg-white"
                      disabled={isSubmitting}
                      required
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg"
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
                  </Button>
                </form>
              </Card>
            </div>

            {/* Additional Info */}
            <div className="space-y-8">
              {/* Working Hours */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl">Support Hours</h3>
                </div>
                <Card className="p-6 bg-gradient-to-br from-gray-50 to-white border border-gray-200">
                  <div className="space-y-4">
                    {workingHours.map((schedule) => (
                      <div
                        key={schedule.day}
                        className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0"
                      >
                        <span className="text-gray-700">{schedule.day}</span>
                        <span className="text-gray-900">{schedule.hours}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Quick Help */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl">Quick Help</h3>
                </div>
                <Card className="p-6 bg-gradient-to-br from-gray-50 to-white border border-gray-200">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-gray-700 mb-1">Knowledge Base</p>
                        <p className="text-sm text-gray-600">
                          Find answers to common questions in our help center
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-gray-700 mb-1">Video Tutorials</p>
                        <p className="text-sm text-gray-600">
                          Watch step-by-step guides to using the platform
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-gray-700 mb-1">Live Chat</p>
                        <p className="text-sm text-gray-600">
                          Get real-time support through Telegram
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Map Placeholder */}
              <div>
                <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 overflow-hidden">
                  <div className="aspect-video bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-12 h-12 text-indigo-600 mx-auto mb-3" />
                      <p className="text-gray-700">123 Business St</p>
                      <p className="text-sm text-gray-600 mt-1">
                        San Francisco, CA 94102
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Quick Links - Light Gray */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600">
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
              <Card
                key={index}
                className="p-6 bg-white border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <h3 className="text-lg mb-3 text-gray-900">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
