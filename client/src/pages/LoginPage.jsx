import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleAuthButton from '../components/GoogleAuthButton';
import { LogIn, Mail, Lock, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      setError(err.message || 'Unable to connect to server.');
    } finally {
      setLoading(false);
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
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl text-center font-medium">
            {error}
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
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Password</label>
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
    </div>
  );
}
