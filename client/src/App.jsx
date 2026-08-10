import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ResumeManagerPage from './pages/ResumeManagerPage';
import AtsAnalysisPage from './pages/AtsAnalysisPage';
import ResumeBuilderPage from './pages/ResumeBuilderPage';
import JobSearchPage from './pages/JobSearchPage';
import ApplicationTrackerPage from './pages/ApplicationTrackerPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Protected Dashboard Pages */}
      <Route path="/app" element={<DashboardLayout />}>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="resumes" element={<ResumeManagerPage />} />
        <Route path="ats-analysis" element={<AtsAnalysisPage />} />
        <Route path="builder" element={<ResumeBuilderPage />} />
        <Route path="jobs" element={<JobSearchPage />} />
        <Route path="applications" element={<ApplicationTrackerPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Catch-all Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
