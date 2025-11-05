import { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { MobileBottomNav } from "./components/MobileBottomNav";
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
import { LandingPage } from "./components/LandingPage";
import { PricingPage } from "./components/PricingPage";
import { ContactPage } from "./components/ContactPage";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner@2.0.3";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<"landing" | "login" | "register" | "pricing" | "contact" | "app">("landing");
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile and TWA
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle login
  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentView("app");
    setActivePage("dashboard");
  };

  // Handle register
  const handleRegister = () => {
    setIsAuthenticated(true);
    setCurrentView("app");
    setActivePage("dashboard");
  };

  // Handle logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentView("landing");
    setActivePage("dashboard"); // Reset to dashboard for next login
    setSidebarOpen(false); // Close sidebar on mobile
    toast.success("Logged out successfully", {
      description: "You have been logged out. See you soon!",
    });
  };

  // Show different views based on current state
  if (currentView === "landing") {
    return (
      <>
        <Toaster position="top-right" richColors closeButton />
        <LandingPage
          onGetStarted={() => setCurrentView("register")}
          onLogin={() => setCurrentView("login")}
          onViewPricing={() => setCurrentView("pricing")}
          onViewContact={() => setCurrentView("contact")}
        />
      </>
    );
  }

  if (currentView === "pricing") {
    return (
      <>
        <Toaster position="top-right" richColors closeButton />
        <PricingPage
          onBackToLanding={() => setCurrentView("landing")}
          onGetStarted={() => setCurrentView("register")}
          onContact={() => setCurrentView("contact")}
        />
      </>
    );
  }

  if (currentView === "contact") {
    return (
      <>
        <Toaster position="top-right" richColors closeButton />
        <ContactPage
          onBackToLanding={() => setCurrentView("landing")}
        />
      </>
    );
  }

  if (currentView === "login") {
    return (
      <>
        <Toaster position="top-right" richColors closeButton />
        <LoginPage
          onLogin={handleLogin}
          onSwitchToRegister={() => setCurrentView("register")}
          onBackToLanding={() => setCurrentView("landing")}
        />
      </>
    );
  }

  if (currentView === "register") {
    return (
      <>
        <Toaster position="top-right" richColors closeButton />
        <RegisterPage
          onRegister={handleRegister}
          onSwitchToLogin={() => setCurrentView("login")}
          onBackToLanding={() => setCurrentView("landing")}
        />
      </>
    );
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
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-gray-950 transition-colors">
      {/* Toast Notifications */}
      <Toaster position="top-right" richColors closeButton />
      
      {/* Sidebar - Desktop only */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        activePage={activePage}
        onNavigate={setActivePage}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="lg:ml-64 min-h-screen flex flex-col">
        {/* Header for all pages */}
        <Header 
          onMenuClick={() => setSidebarOpen(true)} 
          currentPage={activePage}
          onLogout={handleLogout}
          onNavigate={setActivePage}
        />

        {/* Main Content - добавляем padding для mobile bottom nav */}
        <main className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6">
          {renderPage()}
        </main>

        {/* Mobile Bottom Navigation - только для мобильных */}
        {isMobile && (
          <MobileBottomNav 
            activePage={activePage} 
            onNavigate={(page) => {
              setActivePage(page);
              setSidebarOpen(false);
            }} 
          />
        )}
      </div>
    </div>
  );
}