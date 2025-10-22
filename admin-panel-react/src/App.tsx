import { useState } from "react";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { SimpleDashboard } from "./components/SimpleDashboard";
import { AppointmentsPage } from "./components/AppointmentsPage";
import { ServicesPage } from "./components/ServicesPage";
import { OrganizationsPage } from "./components/OrganizationsPage";
import { BotManagementPage } from "./components/BotManagementPage";
import { SlotsPage } from "./components/SlotsPage";
import { AIAssistantPage } from "./components/AIAssistantPage";
import { SettingsPage } from "./components/SettingsPage";
import { Toaster } from "./components/ui/sonner";
import { IntegratedLoginPage } from "./components/IntegratedLoginPage";

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <IntegratedLoginPage />;
  }

  const renderPage = () => {
    const handleMenuClick = () => setSidebarOpen(true);
    
    switch (activePage) {
      case "appointments":
        return <AppointmentsPage onMenuClick={handleMenuClick} />;
      case "services":
        return <ServicesPage onMenuClick={handleMenuClick} />;
      case "organizations":
        return <OrganizationsPage onMenuClick={handleMenuClick} />;
      case "bot-management":
        return <BotManagementPage onMenuClick={handleMenuClick} />;
      case "slots":
        return <SlotsPage onMenuClick={handleMenuClick} />;
      case "ai":
        return <AIAssistantPage onMenuClick={handleMenuClick} />;
      case "settings":
        return <SettingsPage onMenuClick={handleMenuClick} />;
      case "dashboard":
      default:
        return <SimpleDashboard />;
    }
  };

  // Pages with PageHeader component (full-height layout)
  const fullHeightPages = ["appointments", "services", "organizations", "bot-management", "slots", "ai", "settings"];
  const isFullHeightPage = fullHeightPages.includes(activePage);

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Toast Notifications */}
      <Toaster position="top-right" richColors closeButton />
      
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        activePage={activePage}
        onNavigate={setActivePage}
      />

      {/* Main Content */}
      <div className="lg:ml-64 min-h-screen flex flex-col">
        {/* Header - only for dashboard */}
        {!isFullHeightPage && <Header onMenuClick={() => setSidebarOpen(true)} />}

        {/* Main Dashboard Content */}
        <main className={isFullHeightPage ? "flex-1 flex flex-col min-h-0" : "flex-1 p-4 lg:p-6"}>
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}