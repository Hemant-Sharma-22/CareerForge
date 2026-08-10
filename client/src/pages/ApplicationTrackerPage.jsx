import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { CheckSquare, Plus, Building2, Calendar, Trash2, Bookmark, ExternalLink } from 'lucide-react';

export default function ApplicationTrackerPage() {
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [company, setCompany] = useState('');
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('Applied');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const statuses = ['Saved', 'Applied', 'Assessment', 'Interview', 'Offer', 'Rejected', 'Withdrawn'];

  useEffect(() => {
    fetchApplications();
    fetchSavedJobs();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await api.get('/applications');
      if (res.success) {
        setApplications(res.applications);
      }
    } catch (err) {
      console.error('Error fetching applications:', err.message);
    }
  };

  const fetchSavedJobs = async () => {
    try {
      const res = await api.get('/jobs/saved/list');
      if (res.success) {
        setSavedJobs(res.savedJobs || []);
      }
    } catch (err) {
      console.error('Error fetching saved jobs for tracker:', err.message);
    }
  };

  const handleAddApplication = async (e) => {
    e.preventDefault();
    if (!company || !title) return;

    try {
      setLoading(true);
      const res = await api.post('/applications', {
        company,
        title,
        status,
        notes
      });

      if (res.success) {
        setCompany('');
        setTitle('');
        setNotes('');
        fetchApplications();
      }
    } catch (err) {
      console.error('Add application error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await api.patch(`/applications/${id}`, { status: newStatus });
      fetchApplications();
    } catch (err) {
      console.error('Status update error:', err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete application record?')) return;
    try {
      await api.delete(`/applications/${id}`);
      fetchApplications();
    } catch (err) {
      console.error('Delete application error:', err.message);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-zinc-800 bg-zinc-900">
        <h1 className="text-2xl font-extrabold font-heading text-white flex items-center gap-2">
          <CheckSquare className="w-6 h-6 text-zinc-300" />
          Job Application Funnel & Reminders
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Track interview stages, saved job reminders, assessments, and offers across all your active job submissions.
        </p>
      </div>

      {/* Add New Application Form */}
      <div className="glass-panel p-6 rounded-2xl border border-zinc-800 bg-zinc-900 space-y-4">
        <h3 className="font-heading font-bold text-lg text-white flex items-center gap-2">
          <Plus className="w-5 h-5 text-zinc-300" />
          Track New Application
        </h3>

        <form onSubmit={handleAddApplication} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Company Name</label>
            <input
              type="text"
              required
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Google"
              className="w-full bg-zinc-800 border border-zinc-700 focus:border-zinc-500 rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Job Role Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Software Engineer"
              className="w-full bg-zinc-800 border border-zinc-700 focus:border-zinc-500 rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Current Status Stage</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 focus:border-zinc-500 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none cursor-pointer"
            >
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary py-2 text-xs font-semibold"
          >
            {loading ? 'Adding...' : 'Add Application'}
            <Plus className="w-4 h-4 ml-1" />
          </button>
        </form>
      </div>

      {/* Application Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-x-auto pb-4">
        {['Saved', 'Applied', 'Assessment', 'Interview', 'Offer'].map((colStatus) => {
          const colApps = applications.filter(a => a.status === colStatus);
          const isSavedCol = colStatus === 'Saved';
          const totalCount = isSavedCol ? colApps.length + savedJobs.length : colApps.length;

          return (
            <div key={colStatus} className="glass-panel p-4 rounded-2xl border border-zinc-800 bg-zinc-900 space-y-3 min-w-[240px]">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">{colStatus}</span>
                <span className="text-[11px] font-semibold bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full border border-zinc-700">
                  {totalCount}
                </span>
              </div>

              <div className="space-y-3">
                {/* Render Bookmarked Job Reminders in Saved Column */}
                {isSavedCol && savedJobs.map((item) => (
                  <div key={item.id || item.jobId} className="glass-card p-3 rounded-xl border border-amber-500/30 bg-zinc-800/90 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1 text-[10px] text-amber-400 font-semibold mb-0.5">
                          <Bookmark className="w-3 h-3 fill-amber-400" /> Bookmarked Job
                        </div>
                        <h4 className="font-bold text-xs text-white">{item.job?.title || 'Software Developer'}</h4>
                        <div className="flex items-center gap-1 text-[11px] text-zinc-400 mt-0.5">
                          <Building2 className="w-3 h-3" />
                          {item.job?.company || 'Tech Org'}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-zinc-700/60 flex items-center justify-between text-[10px]">
                      <span className="text-zinc-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(item.savedAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>

                      <a
                        href={item.job?.applicationUrl || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sky-400 hover:underline flex items-center gap-0.5 font-semibold"
                      >
                        Apply <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                ))}

                {/* Render Tracked Applications */}
                {colApps.map((app) => (
                  <div key={app.id} className="glass-card p-3 rounded-xl border border-zinc-800 bg-zinc-800 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-xs text-white">{app.title}</h4>
                        <div className="flex items-center gap-1 text-[11px] text-zinc-400 mt-0.5">
                          <Building2 className="w-3 h-3" />
                          {app.company}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(app.id)}
                        className="text-zinc-500 hover:text-rose-400 p-1"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="pt-2 border-t border-zinc-700/60 flex items-center justify-between text-[10px]">
                      <span className="text-zinc-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(app.appliedAt || app.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>

                      <select
                        value={app.status}
                        onChange={(e) => handleStatusUpdate(app.id, e.target.value)}
                        className="bg-zinc-900 border border-zinc-700 rounded px-1.5 py-0.5 text-[10px] text-zinc-300 focus:outline-none"
                      >
                        {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
