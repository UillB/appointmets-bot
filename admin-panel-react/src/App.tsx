import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { LanguageProvider, useLanguage } from "./i18n";
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
import { Toaster } from "./components/ui/sonner";

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const { language } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  return (
    <MobileOptimizedWrapper>
      <div className="h-screen bg-[#FAFAFA] flex overflow-hidden">
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)}
          activePage={window.location.pathname}
          onNavigate={() => {}}
        />
        
        <div className="flex-1 flex flex-col min-h-0">
          <Header 
            onMenuClick={() => setSidebarOpen(true)}
          />
          
          <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
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
      <LanguageProvider>
        <AuthProvider>
          <div>
            <AppContent />
            <Toaster />
          </div>
        </AuthProvider>
      </LanguageProvider>
    </Router>
  );
}

export default App;