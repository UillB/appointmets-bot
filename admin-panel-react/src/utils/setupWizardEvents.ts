// Setup Wizard Event System
// Used to trigger success modals from different components

export type SetupWizardStep = 'service' | 'bot' | 'admin' | 'complete';

export interface SetupWizardModalData {
  step: SetupWizardStep;
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

const SETUP_WIZARD_EVENT = 'setup-wizard:show-modal';

export function triggerSetupWizardModal(data: SetupWizardModalData) {
  console.log('🚀 triggerSetupWizardModal called with data:', data);
  const event = new CustomEvent(SETUP_WIZARD_EVENT, { detail: data });
  window.dispatchEvent(event);
  console.log('✅ CustomEvent dispatched:', SETUP_WIZARD_EVENT);
}

export function listenToSetupWizardModal(
  callback: (data: SetupWizardModalData) => void
) {
  console.log('👂 Setting up listener for:', SETUP_WIZARD_EVENT);
  const handler = (event: CustomEvent<SetupWizardModalData>) => {
    console.log('👂 Event received in listener:', event.detail);
    callback(event.detail);
  };
  window.addEventListener(SETUP_WIZARD_EVENT, handler as EventListener);
  console.log('✅ Listener added for:', SETUP_WIZARD_EVENT);
  return () => {
    window.removeEventListener(SETUP_WIZARD_EVENT, handler as EventListener);
    console.log('🗑️ Listener removed for:', SETUP_WIZARD_EVENT);
  };
}

