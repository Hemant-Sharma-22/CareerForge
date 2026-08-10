import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import JobCard from '../components/JobCard';
import { Search, Briefcase, RefreshCw, Bookmark, Clock } from 'lucide-react';

export default function JobSearchPage() {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'saved'
  const [jobs, setJobs] = useState([]);
  const [savedJobsList, setSavedJobsList] = useState([]);
  const [query, setQuery] = useState('Software Engineer');
  const [remoteType, setRemoteType] = useState('All');
  const [sortBy, setSortBy] = useState('match');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    handleSearch();
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    try {
      const res = await api.get('/jobs/saved/list');
      if (res.success) {
        setSavedJobsList(res.savedJobs || []);
      }
    } catch (err) {
      console.error('Error fetching saved jobs:', err.message);
    }
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();

    try {
      setLoading(true);
      const res = await api.post('/jobs/search', {
        query,
        remoteType,
        sortBy
      });

      if (res.success) {
        setJobs(res.jobs);
      }
    } catch (err) {
      console.error('Job search error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshAll = () => {
    handleSearch();
    fetchSavedJobs();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-zinc-800 bg-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold font-heading text-zinc-100 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-zinc-300" />
            Job Discovery & Reminders
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Discover real tech opportunities and access your saved job reminders in one place.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex bg-zinc-800 p-1 rounded-xl border border-zinc-700 text-xs font-semibold shrink-0">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-zinc-700 text-white shadow-sm font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            Search All ({jobs.length})
          </button>
          
          <button
            onClick={() => { setActiveTab('saved'); fetchSavedJobs(); }}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'saved'
                ? 'bg-zinc-700 text-white shadow-sm font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-400" />
            Bookmarked Reminders ({savedJobsList.length})
          </button>
        </div>
      </div>

      {activeTab === 'all' ? (
        <>
          {/* Search Bar & Filters */}
          <div className="glass-panel p-6 rounded-2xl border border-zinc-800 bg-zinc-900 space-y-4">
            <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-zinc-300 mb-1">Search Role or Technologies</label>
                <div className="relative">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Software Engineer, React, Java..."
                    className="w-full bg-zinc-800/80 border border-zinc-700 focus:border-zinc-500 rounded-xl pl-10 pr-4 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Work Preference</label>
                <select
                  value={remoteType}
                  onChange={(e) => setRemoteType(e.target.value)}
                  className="w-full bg-zinc-800/80 border border-zinc-700 focus:border-zinc-500 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none cursor-pointer"
                >
                  <option value="All" className="bg-zinc-800 text-zinc-100">All Locations & Remote</option>
                  <option value="Remote" className="bg-zinc-800 text-zinc-100">Remote Only</option>
                  <option value="Hybrid" className="bg-zinc-800 text-zinc-100">Hybrid</option>
                  <option value="On-site" className="bg-zinc-800 text-zinc-100">On-site</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary py-2 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Fetching Live Jobs...' : 'Find Matches'}
                <RefreshCw className={`w-3.5 h-3.5 ml-1 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </form>
          </div>

          {/* Jobs Results List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Found {jobs.length} Real Live Opportunities
              </span>

              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <span>Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value); handleSearch(); }}
                  className="bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-zinc-200 focus:outline-none cursor-pointer"
                >
                  <option value="match" className="bg-zinc-800 text-zinc-100">Best Profile Match</option>
                  <option value="newest" className="bg-zinc-800 text-zinc-100">Newest First</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="glass-panel p-12 rounded-2xl text-center space-y-3 bg-zinc-900 border border-zinc-800">
                <div className="w-7 h-7 border-3 border-zinc-300 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <span className="text-xs text-zinc-400 font-medium">Querying live job feeds...</span>
              </div>
            ) : jobs.length === 0 ? (
              <div className="glass-panel p-12 rounded-2xl text-center text-xs text-zinc-400 border border-zinc-800 bg-zinc-900">
                No live job opportunities found matching your query. Try broadening your search terms.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} onStatusChange={handleRefreshAll} />
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        /* Saved Jobs & Reminders View */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Bookmark className="w-4 h-4 text-amber-400" />
              Bookmarked Jobs & Saved Reminders ({savedJobsList.length})
            </span>
          </div>

          {savedJobsList.length === 0 ? (
            <div className="glass-panel p-12 rounded-2xl text-center space-y-3 border border-zinc-800 bg-zinc-900">
              <Bookmark className="w-8 h-8 text-zinc-500 mx-auto" />
              <div className="text-xs text-zinc-300 font-semibold">No Bookmarked Jobs Yet</div>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Click the bookmark icon on any job card in Search All Jobs to save it here as a reminder.
              </p>
              <button
                onClick={() => setActiveTab('all')}
                className="btn-primary py-2 px-4 text-xs font-semibold mt-2"
              >
                Browse & Save Jobs
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedJobsList.map((item) => (
                <div key={item.id || item.jobId} className="relative">
                  <div className="absolute top-3 right-16 z-10 text-[10px] font-medium bg-zinc-800 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Saved Reminder
                  </div>
                  <JobCard job={item.job} onStatusChange={handleRefreshAll} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
