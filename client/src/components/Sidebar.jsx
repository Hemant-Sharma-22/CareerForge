import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  SearchCode, 
  Sliders, 
  Briefcase, 
  CheckSquare, 
  BarChart3, 
  UserCircle,
  PanelLeftClose
} from 'lucide-react';

export default function Sidebar({ sidebarCollapsed, toggleSidebar }) {
  if (sidebarCollapsed) {
    return null; // Fully hidden to maximize screen space per user demand
  }

  const navItems = [
    { label: 'Overview', path: '/app/dashboard', icon: LayoutDashboard },
    { label: 'Resumes', path: '/app/resumes', icon: FileText },
    { label: 'ATS Analyzer', path: '/app/ats-analysis', icon: SearchCode },
    { label: 'Resume Enhancer', path: '/app/builder', icon: Sliders },
    { label: 'Job Discovery', path: '/app/jobs', icon: Briefcase },
    { label: 'Applications', path: '/app/applications', icon: CheckSquare },
    { label: 'Analytics', path: '/app/analytics', icon: BarChart3 },
    { label: 'Profile', path: '/app/profile', icon: UserCircle },
  ];

  return (
    <aside className="w-60 bg-zinc-900 border-r border-zinc-800 min-h-[calc(100vh-4rem)] p-4 hidden md:block shrink-0 transition-all">
      <div className="space-y-1">
        <div className="flex items-center justify-between px-3 py-2 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
          <span>Main Navigation</span>
          <button
            onClick={toggleSidebar}
            title="Hide Sidebar"
            className="text-zinc-500 hover:text-zinc-300 transition-colors p-0.5 cursor-pointer"
          >
            <PanelLeftClose className="w-3.5 h-3.5" />
          </button>
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-zinc-800 text-zinc-100 border border-zinc-700 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                }`
              }
            >
              <Icon className="w-4 h-4 text-zinc-400" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </aside>
  );
}
