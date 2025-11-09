import { useState, useEffect } from 'react';
import { apiClient } from '../services/api';
import { useAuth } from './useAuth';

export interface SetupState {
  hasServices: boolean;
  botActive: boolean;
  adminLinked: boolean;
  isLoading: boolean;
}

export function useSetupWizard() {
  const { user } = useAuth();
  const [setupState, setSetupState] = useState<SetupState>({
    hasServices: false,
    botActive: false,
    adminLinked: false,
    isLoading: true,
  });

  const checkSetupState = async () => {
    if (!user?.organizationId) {
      setSetupState({
        hasServices: false,
        botActive: false,
        adminLinked: false,
        isLoading: false,
      });
      return;
    }

    try {
      setSetupState(prev => ({ ...prev, isLoading: true }));

      // Check services
      const servicesResponse = await apiClient.getServices();
      const hasServices = servicesResponse.services && servicesResponse.services.length > 0;

      // Check bot status
      let botActive = false;
      let adminLinked = false;
      try {
        const botStatusResponse = await apiClient.getBotStatus(user.organizationId);
        if (botStatusResponse?.success && botStatusResponse.botStatus) {
          botActive = botStatusResponse.botStatus.botActive || botStatusResponse.botStatus.isActive || false;
          adminLinked = botStatusResponse.botStatus.adminLinked !== undefined 
            ? botStatusResponse.botStatus.adminLinked 
            : !!user.telegramId;
        }
      } catch (error) {
        // Bot status check failed, assume not active
        console.warn('Failed to check bot status:', error);
      }

      setSetupState({
        hasServices,
        botActive,
        adminLinked,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to check setup state:', error);
      setSetupState(prev => ({ ...prev, isLoading: false }));
    }
  };

  useEffect(() => {
    checkSetupState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.organizationId]);

  return {
    ...setupState,
    refresh: checkSetupState,
  };
}

