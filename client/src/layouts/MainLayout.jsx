import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19]">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500 glass-panel">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>© 2026 CareerForge Platform. All rights reserved.</span>
          <span className="text-slate-400">Rule-Based Explainable ATS & Multi-Source Job Intelligence</span>
        </div>
      </footer>
    </div>
  );
}
