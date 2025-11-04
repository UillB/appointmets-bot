import { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { Dashboard } from "./components/Dashboard";
import { AppointmentsPage } from "./components/AppointmentsPage";
import { ServicesPage } from "./components/ServicesPage";
import { AnalyticsPage } from "./components/AnalyticsPage";
import { OrganizationsPage } from "./components/OrganizationsPage";
import { BotManagementPage } from "./components/BotManagementPage";
import { AIAssistantPage } from "./components/AIAssistantPage";
import { SettingsPage } from "./components/SettingsPage";
import { LoginPage } from "./components/LoginPage";
import { RegisterPage } from "./components/RegisterPage";
import { Toaster } from "./components/ui/sonner";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authView, setAuthView] = useState<"login" | "register">("login");

  // Handle login
  const handleLogin = () => {
    setIsAuthenticated(true);
    setActivePage("dashboard");
  };

  // Handle register
  const handleRegister = () => {
    setIsAuthenticated(true);
    setActivePage("dashboard");
  };

  // Handle logout (you can add this to settings or header later)
  const handleLogout = () => {
    setIsAuthenticated(false);
    setAuthView("login");
  };

  // If not authenticated, show auth pages
  if (!isAuthenticated) {
    if (authView === "login") {
      return (
        <>
          <Toaster position="top-right" richColors closeButton />
          <LoginPage
            onLogin={handleLogin}
            onSwitchToRegister={() => setAuthView("register")}
          />
        </>
      );
    } else {
      return (
        <>
          <Toaster position="top-right" richColors closeButton />
          <RegisterPage
            onRegister={handleRegister}
            onSwitchToLogin={() => setAuthView("login")}
          />
        </>
      );
    }
  }

  const renderPage = () => {
    switch (activePage) {
      case "appointments":
        return <AppointmentsPage />;
      case "services":
        return <ServicesPage />;
      case "analytics":
        return <AnalyticsPage />;
      case "organizations":
        return <OrganizationsPage />;
      case "bot-management":
        return <BotManagementPage />;
      case "ai":
        return <AIAssistantPage />;
      case "settings":
        return <SettingsPage onLogout={handleLogout} />;
      case "dashboard":
      default:
        return <Dashboard />;
    }
  };

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
        {/* Header for all pages */}
        <Header onMenuClick={() => setSidebarOpen(true)} />

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}