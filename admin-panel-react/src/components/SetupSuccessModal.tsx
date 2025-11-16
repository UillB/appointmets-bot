import React from 'react';
import { CheckCircle2, ArrowRight, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Button } from './ui/button';

interface SetupSuccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  step: 'service' | 'bot' | 'admin' | 'complete';
  message: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

const stepConfig = {
  service: {
    title: 'Service Created!',
    icon: CheckCircle2,
  },
  bot: {
    title: 'Bot Activated!',
    icon: CheckCircle2,
  },
  admin: {
    title: 'Admin Linked!',
    icon: CheckCircle2,
  },
  complete: {
    title: 'Setup Complete!',
    icon: CheckCircle2,
  },
};

export function SetupSuccessModal({
  open,
  onOpenChange,
  step,
  message,
  primaryAction,
  secondaryAction,
}: SetupSuccessModalProps) {
  const config = stepConfig[step];
  const Icon = config.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-emerald-100 p-4 dark:bg-emerald-900/40">
              <Icon className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <DialogTitle className="text-center text-xl font-semibold text-emerald-900 dark:text-emerald-100">
            {config.title}
          </DialogTitle>
          <DialogDescription className="text-center text-base text-gray-700 dark:text-gray-300 pt-2">
            {message}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2 mt-4">
          {primaryAction && (
            <Button
              onClick={() => {
                primaryAction.onClick();
                onOpenChange(false);
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-700 dark:hover:bg-emerald-800"
            >
              {primaryAction.label}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="outline"
              onClick={() => {
                secondaryAction.onClick();
                onOpenChange(false);
              }}
              className="w-full"
            >
              {secondaryAction.label}
            </Button>
          )}
          {!primaryAction && !secondaryAction && (
            <Button
              onClick={() => onOpenChange(false)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-700 dark:hover:bg-emerald-800"
            >
              Get Started
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}


