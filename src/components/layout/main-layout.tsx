import { useState, useEffect } from 'react';
import { Header } from './header';
import { Sidebar } from './sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMenuToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onMenuToggle={handleMenuToggle} isMobile={isMobile} />
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={handleSidebarClose} 
        isMobile={isMobile} 
      />
      
      <main className={`
        transition-all duration-300
        ${isMobile ? 'ml-0' : 'ml-64'}
        pt-16
      `}>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}