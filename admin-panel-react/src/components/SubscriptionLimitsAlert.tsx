import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, ArrowRight, Crown } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { apiClient } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n';

interface LimitViolation {
  type: 'services' | 'appointments';
  current: number;
  limit: number;
}

export function SubscriptionLimitsAlert() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<any>(null);
  const [violations, setViolations] = useState<LimitViolation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const subData = await apiClient.getSubscription();
        setSubscription(subData.subscription);

        // Check for limit violations
        const limits = await import('../lib/subscription-limits');
        const planLimits = limits.getSubscriptionLimits(subData.subscription.plan);
        
        // Get current usage
        const [servicesData, appointmentsData] = await Promise.all([
          apiClient.getServices().catch(() => ({ services: [] })),
          apiClient.getAppointments({ limit: 1000 }).catch(() => ({ appointments: [] })),
        ]);

        const servicesCount = servicesData.services?.length || 0;
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const appointmentsThisMonth = appointmentsData.appointments?.filter((apt: any) => 
          new Date(apt.createdAt) >= startOfMonth
        ).length || 0;

        const violationsList: LimitViolation[] = [];
        if (planLimits.maxServices !== -1 && servicesCount > planLimits.maxServices) {
          violationsList.push({
            type: 'services',
            current: servicesCount,
            limit: planLimits.maxServices,
          });
        }
        if (planLimits.maxAppointmentsPerMonth !== -1 && appointmentsThisMonth > planLimits.maxAppointmentsPerMonth) {
          violationsList.push({
            type: 'appointments',
            current: appointmentsThisMonth,
            limit: planLimits.maxAppointmentsPerMonth,
          });
        }

        setViolations(violationsList);
      } catch (error) {
        console.error('Failed to load subscription limits:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading || dismissed) {
    return null;
  }

  // Show alert if subscription exists and has violations, or if on FREE plan (to show upgrade option)
  if (!subscription) {
    return null;
  }

  // Always show for FREE plan to encourage upgrade, or show if there are violations
  if (subscription.plan === 'FREE' && violations.length === 0) {
    // Don't show alert for FREE without violations - it's expected
    return null;
  }

  if (violations.length === 0) {
    return null;
  }

  const planName = t(`settings.subscription.plans.${subscription.plan.toLowerCase()}`);

  return (
    <Card className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                {t('dashboard.subscriptionLimits.title')}
              </h4>
              <Badge className="bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800">
                {planName}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300"
              onClick={() => setDismissed(true)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <p className="text-sm text-amber-800 dark:text-amber-300">
            {t('dashboard.subscriptionLimits.warning')}
          </p>

          <div className="space-y-1.5">
            {violations.map((violation, index) => (
              <div key={index} className="text-xs text-amber-700 dark:text-amber-400">
                • {t(`dashboard.subscriptionLimits.${violation.type}`, { 
                  current: violation.current, 
                  limit: violation.limit 
                })}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Button
              size="sm"
              onClick={() => navigate('/settings?tab=subscription')}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Crown className="w-3.5 h-3.5 mr-1.5" />
              {t('dashboard.subscriptionLimits.upgradeButton')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/settings?tab=subscription')}
              className="border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300"
            >
              {t('dashboard.subscriptionLimits.viewDetails')}
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

