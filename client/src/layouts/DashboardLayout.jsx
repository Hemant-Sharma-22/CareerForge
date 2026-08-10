import React, { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export default function DashboardLayout() {
  const { user, loading } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('careerforge_sidebar_collapsed') === 'true';
  });

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('careerforge_sidebar_collapsed', String(next));
      return next;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-900">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-zinc-200 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-medium text-zinc-400">Loading CareerForge...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-900 text-zinc-100">
      <Navbar sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
