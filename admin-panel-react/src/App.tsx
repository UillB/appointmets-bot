import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { 
  Sidebar, 
  Header, 
  Dashboard, 
  AppointmentsPage, 
  ServicesPage, 
  OrganizationsPage, 
  BotManagementPage, 
  SlotsPage, 
  AIAssistantPage, 
  SettingsPage, 
  IntegratedLoginPage 
} from "./components";
import { Toaster } from "./components/ui/sonner";

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
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
        
        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/appointments" element={<AppointmentsPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/organizations" element={<OrganizationsPage />} />
            <Route path="/bot-management" element={<BotManagementPage />} />
            <Route path="/slots" element={<SlotsPage />} />
            <Route path="/ai" element={<AIAssistantPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider children={
        <div>
          <AppContent />
          <Toaster />
        </div>
      } />
    </Router>
  );
}

export default App;