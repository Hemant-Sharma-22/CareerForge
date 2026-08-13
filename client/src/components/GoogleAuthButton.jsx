import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function GoogleAuthButton({ label = 'Continue with Google', title = 'Software Engineer Candidate', experienceLevel = 'Mid' }) {
  const { googleLogin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [gmailInput, setGmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const googleBtnRef = useRef(null);

  const rawClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '669722402174-a8ktjadpkkjsll6k3hsbq8h47duouqhb.apps.googleusercontent.com';
  const hasValidClientId = Boolean(rawClientId && rawClientId.includes('.apps.googleusercontent.com'));

  const handleCredentialResponse = async (response) => {
    try {
      setLoading(true);
      setError('');
      
      let email = '';
      let name = '';
      let googleId = `g_${Date.now()}`;

      if (response.credential) {
        // Decode standard Google ID Token (JWT)
        const base64Url = response.credential.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
        const payload = JSON.parse(jsonPayload);
        email = payload.email || email;
        name = payload.name || name;
        googleId = payload.sub || googleId;
      }

      if (!email) {
        setError('Could not retrieve Gmail address from Google.');
        return;
      }

      const res = await googleLogin({
        email,
        name: name || email.split('@')[0],
        googleId,
        title,
        experienceLevel
      });

      if (res.success) {
        navigate('/app/dashboard');
      } else {
        setError(res.message || 'Google Auth failed.');
      }
    } catch (err) {
      console.error('Google credential error:', err.message);
      setError('Google Sign In failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initGoogleGsi = () => {
      if (hasValidClientId && window.google?.accounts?.id && googleBtnRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: rawClientId,
            callback: handleCredentialResponse,
            auto_select: false
          });

          googleBtnRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: 'filled_black',
            size: 'large',
            type: 'standard',
            text: 'continue_with',
            shape: 'rectangular',
            width: 320
          });
        } catch (err) {
          console.warn('GSI render error:', err.message);
        }
      }
    };

    if (window.google?.accounts?.id) {
      initGoogleGsi();
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval);
          initGoogleGsi();
        }
      }, 300);
      return () => clearInterval(interval);
    }
  }, [hasValidClientId, rawClientId]);

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!gmailInput || !gmailInput.includes('@')) {
      setError('Please enter a valid Gmail address.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const cleanEmail = gmailInput.trim().toLowerCase();
      const res = await googleLogin({
        email: cleanEmail,
        name: nameInput.trim() || cleanEmail.split('@')[0],
        googleId: `g_${Date.now()}`,
        title,
        experienceLevel
      });

      if (res.success) {
        setShowAccountModal(false);
        navigate('/app/dashboard');
      } else {
        setError(res.message || 'Google Sign-In failed.');
      }
    } catch (err) {
      setError(err.message || 'Google Sign-In error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center space-y-2">
      {error && (
        <div className="w-full p-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl text-center font-medium">
          {error}
        </div>
      )}

      {/* Official Google GSI Render Target Container */}
      <div ref={googleBtnRef} className="flex justify-center w-full min-h-[44px]"></div>

      {/* Fallback button if GSI fails or user prefers instant account selection */}
      <button
        type="button"
        onClick={() => setShowAccountModal(true)}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-zinc-400 hover:text-sky-400 py-1 transition-colors cursor-pointer"
      >
        <span>Alternative Gmail Sign-In</span>
      </button>

      {/* Gmail Account Picker Modal */}
      {showAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="bg-zinc-800 border border-zinc-700 rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-700 pb-3">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <h4 className="font-heading font-bold text-white text-base">Sign in with Google</h4>
              </div>
              <button 
                onClick={() => setShowAccountModal(false)}
                className="text-zinc-400 hover:text-white text-lg font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Your Gmail Address</label>
                <input
                  type="email"
                  required
                  value={gmailInput}
                  onChange={(e) => setGmailInput(e.target.value)}
                  placeholder="e.g. user@gmail.com"
                  className="w-full bg-zinc-900 border border-zinc-600 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Full Name (Optional)</label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="e.g. Alex Johnson"
                  className="w-full bg-zinc-900 border border-zinc-600 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !gmailInput}
                className="w-full btn-primary py-2.5 text-xs font-semibold mt-2"
              >
                {loading ? 'Authenticating...' : 'Continue to CareerForge'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
