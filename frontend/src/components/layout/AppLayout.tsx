import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  // Read and persist sidebar collapse preference
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved === 'true';
  });

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  if (isAuthPage) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#080d1a] relative overflow-hidden">
        {/* Abstract Glowing Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-35" />
        {/* Large Ambient Gradient Blur */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-500/10 to-violet-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 w-full flex items-center justify-center">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-500/10 dark:bg-slate-900 transition-colors duration-300">
      {/* Top Navbar */}
      <Header onMobileMenuToggle={() => setMobileSidebarOpen(true)} />

      {/* Main Body Shell */}
      <div className="flex-1 flex flex-row relative">
        {/* Collapsible Left Sidebar */}
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          mobileOpen={mobileSidebarOpen}
          onMobileClose={() => setMobileSidebarOpen(false)}
        />

        {/* Dynamic Content Panel */}
        <div className="flex-grow flex flex-col min-w-0">
          <main className="flex-grow p-4 md:p-6">
            {children}
          </main>
          
          {/* Footer Component */}
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
