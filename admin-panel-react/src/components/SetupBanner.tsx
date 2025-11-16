import React from 'react';
import { AlertCircle, Bot, UserCheck, ArrowRight } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { cn } from './ui/utils';

interface SetupBannerProps {
  type: 'services' | 'bot' | 'admin';
  message: string;
  actionLabel: string;
  onAction: () => void;
  onDismiss?: () => void;
}

const bannerConfig = {
  services: {
    icon: AlertCircle,
    title: 'No Services',
    colors: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      iconBg: 'bg-blue-100 dark:bg-blue-900/40',
      icon: 'text-blue-600 dark:text-blue-400',
      title: 'text-blue-900 dark:text-blue-100',
      text: 'text-blue-800 dark:text-blue-200',
      button: 'bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-800',
      dismiss: 'text-blue-700 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200',
    },
  },
  bot: {
    icon: Bot,
    title: 'Bot Not Connected',
    colors: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      iconBg: 'bg-red-100 dark:bg-red-900/40',
      icon: 'text-red-600 dark:text-red-400',
      title: 'text-red-900 dark:text-red-100',
      text: 'text-red-800 dark:text-red-200',
      button: 'bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-800',
      dismiss: 'text-red-700 hover:text-red-800 dark:text-red-300 dark:hover:text-red-200',
    },
  },
  admin: {
    icon: UserCheck,
    title: 'Admin Not Linked',
    colors: {
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      border: 'border-amber-200 dark:border-amber-800',
      iconBg: 'bg-amber-100 dark:bg-amber-900/40',
      icon: 'text-amber-600 dark:text-amber-400',
      title: 'text-amber-900 dark:text-amber-100',
      text: 'text-amber-800 dark:text-amber-200',
      button: 'bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-700 dark:hover:bg-amber-800',
      dismiss: 'text-amber-700 hover:text-amber-800 dark:text-amber-300 dark:hover:text-amber-200',
    },
  },
};

export function SetupBanner({ type, message, actionLabel, onAction, onDismiss }: SetupBannerProps) {
  const config = bannerConfig[type];
  const Icon = config.icon;

  const colors = config.colors;

  return (
    <Card
      className={cn(
        'relative overflow-hidden border',
        colors.bg,
        colors.border,
        'animate-pulse-subtle'
      )}
    >
      <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 md:p-6">
        <div className="flex-shrink-0">
          <div className={cn('rounded-full p-3', colors.iconBg)}>
            <Icon className={cn('h-5 w-5', colors.icon)} />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className={cn('font-semibold mb-1', colors.title)}>
            {config.title}
          </h3>
          <p className={cn('text-sm', colors.text)}>
            {message}
          </p>
        </div>

        <div className="flex-shrink-0 flex items-center gap-2 w-full sm:w-auto">
          <Button
            onClick={onAction}
            className={cn('w-full sm:w-auto', colors.button)}
          >
            {actionLabel}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className={cn('w-full sm:w-auto', colors.dismiss)}
            >
              Dismiss
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

