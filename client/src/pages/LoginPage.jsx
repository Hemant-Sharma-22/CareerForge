import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleAuthButton from '../components/GoogleAuthButton';
import { LogIn, Mail, Lock, ArrowRight, KeyRound, Check, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot Password Modal State
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMsg, setResetMsg] = useState('');
  const [resetErr, setResetErr] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        navigate('/app/dashboard');
      } else {
        setError(res.message || 'Login failed.');
      }
    } catch (err) {
      setError(err.message || 'Incorrect password or email. Click "Forgot Password?" to reset.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenResetModal = (presetEmail = '') => {
    setResetEmail(presetEmail || email || '');
    setNewPassword('');
    setResetMsg('');
    setResetErr('');
    setShowResetModal(true);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail || !newPassword) return;

    try {
      setResetLoading(true);
      setResetMsg('');
      setResetErr('');

      const res = await api.post('/auth/reset-password', {
        email: resetEmail,
        newPassword
      });

      if (res.success) {
        setResetMsg(res.message || 'Password reset successfully!');
        setEmail(resetEmail);
        setPassword(newPassword);
        setTimeout(() => {
          setShowResetModal(false);
        }, 1800);
      } else {
        setResetErr(res.message || 'Password reset failed.');
      }
    } catch (err) {
      setResetErr(err.message || 'Error updating password.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-panel p-8 rounded-2xl border border-zinc-700 bg-zinc-800 space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-zinc-700 text-sky-400 flex items-center justify-center mx-auto border border-zinc-600">
            <LogIn className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold font-heading text-white">Welcome Back</h2>
          <p className="text-xs text-zinc-400">Sign in to access your ATS scores, resumes, and job matches</p>
        </div>

        {/* Google 1-Click Authentication */}
        <div className="space-y-3">
          <GoogleAuthButton label="Sign in with Google" />
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-zinc-700"></div>
            <span className="flex-shrink mx-4 text-xs font-semibold text-zinc-400 uppercase">Or Email Sign In</span>
            <div className="flex-grow border-t border-zinc-700"></div>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex flex-col items-center gap-2 text-center font-medium">
            <div className="flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>

            {/* Direct Forgot Password Trigger when login fails */}
            <button
              type="button"
              onClick={() => handleOpenResetModal(email)}
              className="text-xs text-sky-400 underline hover:text-sky-300 font-semibold cursor-pointer"
            >
              Forgot Password? Reset it here
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-zinc-900 border border-zinc-600 focus:border-sky-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-zinc-300">Password</label>
              <button
                type="button"
                onClick={() => handleOpenResetModal(email)}
                className="text-xs text-sky-400 hover:underline font-semibold cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>

            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-900 border border-zinc-600 focus:border-sky-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 text-sm font-semibold cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Signing In...' : 'Sign In'}
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </form>

        <div className="text-center text-xs text-zinc-400 pt-2 border-t border-zinc-700">
          Don't have an account?{' '}
          <Link to="/register" className="text-sky-400 font-semibold hover:underline">
            Create Free Account
          </Link>
        </div>
      </div>

      {/* Forgot Password Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="bg-zinc-800 border border-zinc-700 rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-700 pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-sky-400" />
                <h4 className="font-heading font-bold text-white text-base">Reset Password</h4>
              </div>
              <button 
                onClick={() => setShowResetModal(false)}
                className="text-zinc-400 hover:text-white text-lg font-bold"
              >
                ×
              </button>
            </div>

            {resetMsg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center gap-2 font-medium">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{resetMsg}</span>
              </div>
            )}

            {resetErr && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl text-center font-medium">
                {resetErr}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Your Registered Email Address</label>
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-zinc-900 border border-zinc-600 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Enter New Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full bg-zinc-900 border border-zinc-600 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <button
                type="submit"
                disabled={resetLoading || !resetEmail || !newPassword}
                className="w-full btn-primary py-2.5 text-xs font-semibold mt-2"
              >
                {resetLoading ? 'Updating Password...' : 'Reset Password & Sign In'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
