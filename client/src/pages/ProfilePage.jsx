import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { UserCircle, Save, Check, Mail } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUserProfile } = useAuth();

  const [title, setTitle] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Mid');
  const [remotePreference, setRemotePreference] = useState('Hybrid');
  const [skills, setSkills] = useState('JavaScript, React, Node.js, SQL, REST API');
  const [preferredRoles, setPreferredRoles] = useState('Software Engineer, Full Stack Developer');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.profile) {
      setTitle(user.profile.title || '');
      setPhone(user.profile.phone || '');
      setLocation(user.profile.location || '');
      setExperienceLevel(user.profile.experienceLevel || 'Mid');
      setRemotePreference(user.profile.remotePreference || 'Hybrid');
      if (user.profile.skills) {
        const s = typeof user.profile.skills === 'string' ? JSON.parse(user.profile.skills) : user.profile.skills;
        if (Array.isArray(s)) setSkills(s.join(', '));
      }
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const skillsArray = skills.split(',').map(s => s.trim()).filter(Boolean);
      const rolesArray = preferredRoles.split(',').map(r => r.trim()).filter(Boolean);

      const res = await api.patch('/profile', {
        title,
        phone,
        location,
        experienceLevel,
        remotePreference,
        skills: skillsArray,
        preferredRoles: rolesArray
      });

      if (res.success) {
        updateUserProfile(res.profile);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error('Error saving profile:', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-zinc-700 bg-zinc-800">
        <h1 className="text-2xl font-extrabold font-heading text-white flex items-center gap-2">
          <UserCircle className="w-6 h-6 text-sky-400" />
          Candidate Profile & Matching Preferences
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Configure your professional details, skills inventory, and job location preferences for job match scoring.
        </p>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-zinc-700 bg-zinc-800 space-y-6">
        {saved && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
            <Check className="w-4 h-4" />
            Profile and preferences updated successfully!
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Full Name</label>
              <input
                type="text"
                disabled
                value={user?.name || ''}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-zinc-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-sky-400" />
                Authenticated Email / Gmail Account
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-sky-400 font-semibold cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Professional Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Software Developer / Full Stack Engineer"
                className="w-full bg-zinc-900 border border-zinc-600 focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Bangalore, India"
                className="w-full bg-zinc-900 border border-zinc-600 focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Experience Level</label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-600 focus:border-sky-500 rounded-xl px-3 py-2.5 text-xs text-zinc-100 focus:outline-none cursor-pointer"
              >
                <option value="Fresher" className="bg-zinc-800 text-zinc-100">Fresher / Student</option>
                <option value="Entry" className="bg-zinc-800 text-zinc-100">Entry Level (0-2 yrs)</option>
                <option value="Mid" className="bg-zinc-800 text-zinc-100">Mid Level (2-5 yrs)</option>
                <option value="Senior" className="bg-zinc-800 text-zinc-100">Senior Level (5+ yrs)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Remote Preference</label>
              <select
                value={remotePreference}
                onChange={(e) => setRemotePreference(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-600 focus:border-sky-500 rounded-xl px-3 py-2.5 text-xs text-zinc-100 focus:outline-none cursor-pointer"
              >
                <option value="Remote" className="bg-zinc-800 text-zinc-100">Remote Only</option>
                <option value="Hybrid" className="bg-zinc-800 text-zinc-100">Hybrid</option>
                <option value="On-site" className="bg-zinc-800 text-zinc-100">On-site</option>
                <option value="Any" className="bg-zinc-800 text-zinc-100">Flexible / Any</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Skills Inventory (Comma Separated)</label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="Java, React, Node.js, SQL, REST API, Git, Docker"
              className="w-full bg-zinc-900 border border-zinc-600 focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Preferred Job Roles (Comma Separated)</label>
            <input
              type="text"
              value={preferredRoles}
              onChange={(e) => setPreferredRoles(e.target.value)}
              placeholder="Software Engineer, Full Stack Developer, Backend Developer"
              className="w-full bg-zinc-900 border border-zinc-600 focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary py-2.5 px-6 text-xs font-semibold cursor-pointer"
            >
              {loading ? 'Saving Changes...' : 'Save Profile Changes'}
              <Save className="w-4 h-4 ml-1" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
