import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { LanguageProvider, useLanguage } from "./i18n";
import { ThemeProvider } from "./hooks/useTheme";
import { 
  Sidebar, 
  Header, 
  Dashboard, 
  AppointmentsPage, 
  ServicesPage, 
  OrganizationsPage, 
  BotManagementPage, 
  AIAssistantPage, 
  SettingsPage, 
  IntegratedLoginPage 
} from "./components";
import { AnalyticsPage } from "./components/pages/AnalyticsPage";
import { MobileOptimizedWrapper } from "./components/MobileOptimizations";
import { MobileBottomNav } from "./components/MobileBottomNav";
import { Toaster } from "./components/ui/sonner";
import { ThemeLoader } from "./components/ThemeLoader";

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const { language } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // On desktop, sidebar is always visible (use isOpen=true)
  // On mobile, sidebar is controlled by sidebarOpen state
  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <IntegratedLoginPage />;
  }

  return (
    <MobileOptimizedWrapper>
      <div className="h-screen bg-white dark:bg-gray-900 flex overflow-hidden">
        <Sidebar 
          isOpen={isDesktop ? true : sidebarOpen} 
          onClose={() => setSidebarOpen(false)}
          activePage={window.location.pathname}
          onNavigate={() => {}}
        />
        
        <div className="flex-1 flex flex-col min-h-0 w-full">
          <Header 
            onMenuClick={() => setSidebarOpen(true)}
          />
          
          <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 pb-20 lg:pb-6">
            <div className="max-w-7xl mx-auto">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/appointments" element={<AppointmentsPage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/organizations" element={<OrganizationsPage />} />
                <Route path="/bot-management" element={<BotManagementPage key={language} />} />
                <Route path="/ai" element={<AIAssistantPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </div>
          </main>
        </div>
        
        <MobileBottomNav />
      </div>
    </MobileOptimizedWrapper>
  );
}

function App() {
  // Determine basename based on current path
  // If app is served from /admin-panel, use that as basename
  const basename = window.location.pathname.startsWith('/admin-panel') ? '/admin-panel' : '/';
  
  return (
    <Router basename={basename}>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <div>
              <AppContent />
              <ThemeLoader />
              <Toaster />
            </div>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;