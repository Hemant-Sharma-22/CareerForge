import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, LogOut, FileText, LayoutDashboard, PanelLeftClose, PanelLeft } from 'lucide-react';

export default function Navbar({ sidebarCollapsed, toggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-zinc-900 border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left Side: Sidebar Toggle & Brand Logo */}
        <div className="flex items-center gap-3">
          {user && (
            <button
              onClick={toggleSidebar}
              title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer border border-zinc-800"
            >
              {sidebarCollapsed ? (
                <PanelLeft className="w-5 h-5" />
              ) : (
                <PanelLeftClose className="w-5 h-5" />
              )}
            </button>
          )}

          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white">
              <Briefcase className="w-4 h-4 text-zinc-300" />
            </div>
            <span className="font-heading font-extrabold text-xl tracking-tight text-white">
              CareerForge
            </span>
          </Link>
        </div>

        {/* User Navigation Links */}
        <nav className="flex items-center gap-3 sm:gap-6">
          {user ? (
            <>
              <Link to="/app/dashboard" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5">
                <LayoutDashboard className="w-4 h-4 text-zinc-400" />
                <span className="hidden md:inline">Dashboard</span>
              </Link>
              <Link to="/app/resumes" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-zinc-400" />
                <span className="hidden md:inline">Resumes</span>
              </Link>
              <Link to="/app/jobs" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-zinc-400" />
                <span className="hidden md:inline">Find Jobs</span>
              </Link>

              {/* User Dropdown / Profile */}
              <div className="flex items-center gap-3 pl-3 border-l border-zinc-800">
                <Link to="/app/profile" className="flex items-center gap-2 group">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-200 font-semibold group-hover:border-zinc-500 transition-colors text-xs">
                    {user.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs font-medium text-zinc-300 hidden lg:inline">{user.name}</span>
                </Link>

                <button 
                  onClick={handleLogout} 
                  title="Sign out"
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-xs font-medium text-zinc-300 hover:text-white px-3 py-1.5 transition-colors">
                Sign In
              </Link>
              <Link to="/register" className="btn-primary text-xs">
                Get Started Free
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
