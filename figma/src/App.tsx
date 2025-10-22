import { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { Dashboard } from "./components/Dashboard";
import { AppointmentsPage } from "./components/AppointmentsPage";
import { ServicesPage } from "./components/ServicesPage";
import { OrganizationsPage } from "./components/OrganizationsPage";
import { BotManagementPage } from "./components/BotManagementPage";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");

  const renderPage = () => {
    switch (activePage) {
      case "appointments":
        return <AppointmentsPage />;
      case "services":
        return <ServicesPage />;
      case "organizations":
        return <OrganizationsPage />;
      case "bot-management":
        return <BotManagementPage />;
      case "dashboard":
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        activePage={activePage}
        onNavigate={setActivePage}
      />

      {/* Main Content */}
      <div className="lg:ml-64 min-h-screen flex flex-col">
        {/* Header */}
        <Header onMenuClick={() => setSidebarOpen(true)} />

        {/* Main Dashboard Content */}
        <main className="flex-1 p-4 lg:p-6">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}