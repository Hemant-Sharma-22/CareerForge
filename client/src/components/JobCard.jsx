import React, { useState, useEffect } from 'react';
import { Bookmark, ExternalLink, MapPin, Building2, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function JobCard({ job, onStatusChange }) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(job.isSaved || false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSaved(job.isSaved || false);
  }, [job.isSaved]);

  const toggleSave = async () => {
    if (loading) return;

    const previousState = saved;
    const nextState = !saved;

    // Instant optimistic UI update
    setSaved(nextState);
    setLoading(true);

    try {
      const encodedId = encodeURIComponent(job.id);
      let res;
      if (previousState) {
        res = await api.delete(`/jobs/${encodedId}/save`);
      } else {
        res = await api.post(`/jobs/${encodedId}/save`, { job });
      }

      if (res.success) {
        if (onStatusChange) onStatusChange();
      } else {
        setSaved(previousState); // Revert on API failure
      }
    } catch (err) {
      console.error('Error toggling job bookmark:', err.message);
      setSaved(previousState); // Revert on network error
    } finally {
      setLoading(false);
    }
  };

  // Get real candidate skills from user profile if uploaded
  const rawSkills = user?.profile?.skills;
  const candidateSkills = Array.isArray(rawSkills) 
    ? rawSkills 
    : (typeof rawSkills === 'string' ? JSON.parse(rawSkills || '[]') : []);

  const jobSkills = job.skills || [];
  const hasUserSkills = candidateSkills.length > 0;

  const matchedSkills = hasUserSkills 
    ? jobSkills.filter(s => candidateSkills.some(cs => cs.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(cs.toLowerCase())))
    : [];

  const hasScore = typeof job.matchScore === 'number' && job.matchScore !== null && hasUserSkills;

  return (
    <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between group shadow-sm">
      <div>
        {/* Header: Title, Company, Match Badge */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              {hasScore ? (
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                  job.matchScore >= 75 
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60' 
                    : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                }`}>
                  {job.matchScore}% MATCH
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700">
                  MATCH PENDING (UPLOAD RESUME)
                </span>
              )}
              <span className="text-[11px] text-zinc-400 px-2 py-0.5 bg-zinc-800/80 rounded-md border border-zinc-700/50">
                {job.remoteType || 'Remote'}
              </span>
            </div>
            
            <h3 className="font-heading font-bold text-base text-zinc-100 group-hover:text-white transition-colors">
              {job.title}
            </h3>
            
            <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1">
              <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5 text-zinc-500" />{job.company}</span>
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-zinc-500" />{job.location}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleSave}
            title={saved ? "Remove Bookmark" : "Save / Bookmark Job"}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              saved
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-400 shadow-sm'
                : 'bg-zinc-800/90 border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${saved ? 'fill-amber-400 text-amber-400' : 'text-zinc-400'}`} />
          </button>
        </div>

        {/* Description snippet */}
        <p className="text-xs text-zinc-400 line-clamp-2 my-3 font-normal leading-relaxed">
          {job.description}
        </p>

        {/* Required Skills Inventory */}
        <div className="flex flex-wrap gap-1.5 my-3">
          {jobSkills.slice(0, 5).map((skill, idx) => {
            const isMatched = matchedSkills.some(m => m.toLowerCase() === skill.toLowerCase());
            return (
              <span 
                key={idx} 
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium border ${
                  isMatched 
                    ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/50' 
                    : 'bg-zinc-800/70 text-zinc-300 border-zinc-700/60'
                }`}
              >
                {isMatched && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                {skill}
              </span>
            );
          })}
        </div>
      </div>

      {/* Footer: Direct Apply & Salary */}
      <div className="pt-3 border-t border-zinc-800 flex items-center justify-between mt-2">
        <span className="text-xs font-medium text-zinc-400">
          {job.salary || 'Competitive Pay'}
        </span>

        <a
          href={job.applicationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary text-xs py-1.5 px-3.5"
        >
          Apply Now
          <ExternalLink className="w-3.5 h-3.5 ml-1" />
        </a>
      </div>
    </div>
  );
}
