import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Sliders, 
  Edit3, 
  Copy, 
  Check, 
  Layers
} from 'lucide-react';

export default function ResumeBuilderPage() {
  const [bullet, setBullet] = useState('Worked on backend APIs.');
  const [style, setStyle] = useState('ATS optimized');
  const [keywordsInput, setKeywordsInput] = useState('REST API, validation, authentication');
  const [optimization, setOptimization] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Resume Generator State
  const [resumes, setResumes] = useState([]);
  const [jds, setJds] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [selectedJdId, setSelectedJdId] = useState('');
  const [genLoading, setGenLoading] = useState(false);
  const [generatedVersion, setGeneratedVersion] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [resumesRes, jdsRes] = await Promise.all([
        api.get('/resumes').catch(() => null),
        api.get('/job-descriptions').catch(() => null)
      ]);

      if (resumesRes?.success && resumesRes.resumes.length > 0) {
        setResumes(resumesRes.resumes);
        setSelectedResumeId(resumesRes.resumes[0].id);
      }

      if (jdsRes?.success && jdsRes.jobDescriptions.length > 0) {
        setJds(jdsRes.jobDescriptions);
        setSelectedJdId(jdsRes.jobDescriptions[0].id);
      }
    } catch (err) {
      console.error('Error fetching builder initial data:', err.message);
    }
  };

  const handleOptimizeBullet = async (e) => {
    e.preventDefault();
    if (!bullet.trim()) return;

    try {
      setLoading(true);
      const targetKeywords = keywordsInput.split(',').map(k => k.trim()).filter(Boolean);
      const res = await api.post('/analysis/improve-bullet', {
        bullet,
        style,
        targetKeywords
      });

      if (res.success) {
        setOptimization(res.optimization);
      }
    } catch (err) {
      console.error('Bullet optimization error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateResume = async (e) => {
    e.preventDefault();
    if (!selectedResumeId || !selectedJdId) return;

    try {
      setGenLoading(true);
      const res = await api.post('/analysis/generate-resume', {
        resumeId: selectedResumeId,
        jobDescriptionId: selectedJdId,
        versionLabel: 'Tailored ATS Version'
      });

      if (res.success) {
        setGeneratedVersion(res.version);
      }
    } catch (err) {
      console.error('Resume generation error:', err.message);
    } finally {
      setGenLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-zinc-800 bg-zinc-900">
        <h1 className="text-2xl font-extrabold font-heading text-white flex items-center gap-2">
          <Sliders className="w-6 h-6 text-zinc-300" />
          Resume Bullet Point Enhancer
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Transform weak resume statements into impactful, ATS-ready bullets using measurable action verbs and keywords.
        </p>
      </div>

      {/* SECTION 1: Bullet Point Optimizer */}
      <div className="glass-panel p-6 rounded-2xl border border-zinc-800 bg-zinc-900 space-y-6">
        <h3 className="font-heading font-bold text-lg text-white flex items-center gap-2">
          <Edit3 className="w-5 h-5 text-zinc-300" />
          Interactive Bullet Point Enhancer
        </h3>

        <form onSubmit={handleOptimizeBullet} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Paste Resume Bullet Point</label>
            <input
              type="text"
              required
              value={bullet}
              onChange={(e) => setBullet(e.target.value)}
              placeholder="e.g. Worked on backend APIs."
              className="w-full bg-zinc-800 border border-zinc-700 focus:border-zinc-500 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Enhancement Focus</label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 focus:border-zinc-500 rounded-xl px-3 py-2.5 text-xs text-zinc-100 focus:outline-none cursor-pointer"
              >
                <option value="ATS optimized" className="bg-zinc-800 text-zinc-100">ATS Optimized (Default)</option>
                <option value="Impact focused" className="bg-zinc-800 text-zinc-100">Impact Focused (Metrics)</option>
                <option value="Technical" className="bg-zinc-800 text-zinc-100">Technical & Architecture</option>
                <option value="Concise" className="bg-zinc-800 text-zinc-100">Concise & Direct</option>
                <option value="Recruiter friendly" className="bg-zinc-800 text-zinc-100">Recruiter Friendly</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Target Keywords (Comma Separated)</label>
              <input
                type="text"
                value={keywordsInput}
                onChange={(e) => setKeywordsInput(e.target.value)}
                placeholder="REST API, Node.js, validation"
                className="w-full bg-zinc-800 border border-zinc-700 focus:border-zinc-500 rounded-xl px-3 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !bullet.trim()}
            className="btn-primary py-2.5 px-6 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Enhancing Bullet...' : 'Enhance Bullet Point'}
            <Sliders className="w-4 h-4 ml-1" />
          </button>
        </form>

        {/* Optimization Output Result Box */}
        {optimization && (
          <div className="p-6 rounded-2xl border border-zinc-700 bg-zinc-800 space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Improved Result</span>
              <span className="text-xs font-semibold text-zinc-200 bg-zinc-700 px-2.5 py-1 rounded-full border border-zinc-600">
                Strength Score: {optimization.strengthScore}/100
              </span>
            </div>

            <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-700 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs text-zinc-500 line-through">Original: "{optimization.original}"</div>
                <div className="text-sm font-bold text-white">"{optimization.improved}"</div>
              </div>

              <button
                onClick={() => copyToClipboard(optimization.improved)}
                className="p-2 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                title="Copy improved bullet"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              <span className="font-semibold text-zinc-300">Keywords Added:</span>
              {optimization.keywordsAdded.map((k, i) => (
                <span key={i} className="px-2 py-0.5 rounded text-[11px] font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">
                  + {k}
                </span>
              ))}
            </div>

            <p className="text-xs text-zinc-400 italic">
              Explanation: {optimization.explanation}
            </p>
          </div>
        )}
      </div>

      {/* SECTION 2: Full Optimized Resume Generator */}
      <div className="glass-panel p-6 rounded-2xl border border-zinc-800 bg-zinc-900 space-y-6">
        <h3 className="font-heading font-bold text-lg text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-zinc-300" />
          Generate Tailored Resume Version
        </h3>

        <p className="text-xs text-zinc-400">
          Combine candidate resume data + target JD missing keywords to generate a new tailored resume version.
        </p>

        <form onSubmit={handleGenerateResume} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Source Resume</label>
            <select
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 focus:border-zinc-500 rounded-xl px-3 py-2.5 text-xs text-zinc-100 focus:outline-none cursor-pointer"
            >
              {resumes.length === 0 ? (
                <option value="" className="bg-zinc-800 text-zinc-300">-- Upload a resume first --</option>
              ) : (
                resumes.map(r => (
                  <option key={r.id} value={r.id} className="bg-zinc-800 text-zinc-100">{r.title}</option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Target Job Description</label>
            <select
              value={selectedJdId}
              onChange={(e) => setSelectedJdId(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 focus:border-zinc-500 rounded-xl px-3 py-2.5 text-xs text-zinc-100 focus:outline-none cursor-pointer"
            >
              {jds.length > 0 ? (
                jds.map(j => <option key={j.id} value={j.id} className="bg-zinc-800 text-zinc-100">{j.title} ({j.company})</option>)
              ) : (
                <option value="" className="bg-zinc-800 text-zinc-300">Paste or Save a JD first</option>
              )}
            </select>
          </div>

          <button
            type="submit"
            disabled={genLoading || !selectedResumeId || !selectedJdId}
            className="btn-primary py-2.5 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {genLoading ? 'Generating Version...' : 'Generate Tailored Resume'}
            <Sliders className="w-4 h-4 ml-1" />
          </button>
        </form>

        {generatedVersion && (
          <div className="p-6 rounded-2xl border border-zinc-700 bg-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-200">Generated Version v{generatedVersion.versionNumber}</span>
              <span className="text-xs font-bold text-white">{generatedVersion.label}</span>
            </div>

            <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-700 text-xs space-y-3">
              <div>
                <span className="font-bold text-zinc-300">Updated Summary:</span>
                <p className="text-zinc-300 mt-1">{generatedVersion.content?.summary}</p>
              </div>

              <div>
                <span className="font-bold text-zinc-300">Added Keywords:</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {(generatedVersion.content?.skills || []).slice(0, 8).map((sk, i) => (
                    <span key={i} className="px-2 py-0.5 rounded text-[11px] bg-zinc-800 text-zinc-300 border border-zinc-700">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
