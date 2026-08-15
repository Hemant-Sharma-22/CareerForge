import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleAuthButton from '../components/GoogleAuthButton';
import { UserPlus, Mail, Lock, User, Briefcase, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [title, setTitle] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Mid');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Strict deliverable email regex check
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid, deliverable email address (e.g. name@company.com).');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const res = await register({
        name,
        email: email.trim(),
        password,
        title,
        experienceLevel
      });

      if (res.success) {
        navigate('/app/dashboard');
      } else {
        setError(res.message || 'Registration failed.');
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
            <UserPlus className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold font-heading text-white">Join CareerForge</h2>
          <p className="text-xs text-zinc-400">Create your free account to optimize your resume and discover jobs</p>
        </div>

        {/* Google 1-Click Authentication */}
        <div className="space-y-3">
          <GoogleAuthButton label="Sign up with Google" title={title} experienceLevel={experienceLevel} />
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-zinc-700"></div>
            <span className="flex-shrink mx-4 text-xs font-semibold text-zinc-400 uppercase">Or Register with Email</span>
            <div className="flex-grow border-t border-zinc-700"></div>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl font-medium text-center space-y-1">
            <div>{error}</div>
            {error.includes('already exists') && (
              <div>
                <Link to="/login" className="text-sky-400 font-bold underline hover:text-sky-300">
                  Sign In to your account
                </Link>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Johnson"
                className="w-full bg-zinc-900 border border-zinc-600 focus:border-sky-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
              />
            </div>
          </div>

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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Professional Title</label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Software Engineer"
                  className="w-full bg-zinc-900 border border-zinc-600 focus:border-sky-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Experience Level</label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-600 focus:border-sky-500 rounded-xl px-3 py-2.5 text-sm text-zinc-100 focus:outline-none cursor-pointer"
              >
                <option value="Fresher" className="bg-zinc-800 text-zinc-100">Fresher / Intern</option>
                <option value="Entry" className="bg-zinc-800 text-zinc-100">Entry (0-2 yrs)</option>
                <option value="Mid" className="bg-zinc-800 text-zinc-100">Mid Level (2-5 yrs)</option>
                <option value="Senior" className="bg-zinc-800 text-zinc-100">Senior (5+ yrs)</option>
              </select>
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
            {loading ? 'Creating Account...' : 'Get Started Free'}
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </form>

        <div className="text-center text-xs text-zinc-400 pt-2 border-t border-zinc-700">
          Already have an account?{' '}
          <Link to="/login" className="text-sky-400 font-semibold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
