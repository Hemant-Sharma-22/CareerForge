import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import AtsScoreGauge from '../components/AtsScoreGauge';
import { 
  SearchCode, 
  FileText, 
  Briefcase, 
  CheckCircle2, 
  AlertTriangle, 
  Sliders, 
  Edit3, 
  Upload,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AtsAnalysisPage() {
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [jdText, setJdText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const res = await api.get('/resumes');
      if (res.success && res.resumes.length > 0) {
        setResumes(res.resumes);
        setSelectedResumeId(res.resumes[0].id);
      }
    } catch (err) {
      console.error('Error fetching resumes:', err.message);
    }
  };

  const handleRunAnalysis = async (e) => {
    e.preventDefault();
    if (!selectedResumeId || !jdText.trim()) {
      setError('Please select a candidate resume and paste a valid Job Description.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await api.post('/analysis', {
        resumeId: selectedResumeId,
        jobDescriptionText: jdText
      });

      if (res.success) {
        setAnalysis(res.analysis);
      }
    } catch (err) {
      setError(err.message || 'ATS analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-zinc-800 bg-zinc-900">
        <h1 className="text-2xl font-extrabold font-heading text-white flex items-center gap-2">
          <SearchCode className="w-6 h-6 text-zinc-300" />
          Explainable ATS Scoring & Skill Gap Engine
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Compare your candidate resume against a target job description to get measurable scoring and keyword gap detection.
        </p>
      </div>

      {/* Input Form */}
      <div className="glass-panel p-6 rounded-2xl border border-zinc-800 bg-zinc-900 space-y-6">
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleRunAnalysis} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-zinc-400" />
                  Select Candidate Resume
                </label>
                <Link to="/app/resumes" className="text-[11px] text-zinc-300 hover:underline flex items-center gap-1 font-semibold">
                  <Plus className="w-3 h-3" /> Upload New
                </Link>
              </div>

              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 focus:border-zinc-500 rounded-xl p-3 text-sm text-zinc-100 focus:outline-none cursor-pointer"
              >
                {resumes.length === 0 ? (
                  <option value="" className="bg-zinc-800 text-zinc-300">-- No resumes uploaded yet (Click Upload New above) --</option>
                ) : (
                  resumes.map((r) => (
                    <option key={r.id} value={r.id} className="bg-zinc-800 text-zinc-100 font-medium py-2">
                      📄 {r.title} ({r.originalFileName}) {r.isDefault ? '• Default' : ''}
                    </option>
                  ))
                )}
              </select>

              {resumes.length === 0 && (
                <div className="p-3 bg-zinc-800 border border-zinc-700 rounded-xl flex items-center justify-between text-xs">
                  <span className="text-zinc-400">No resumes found in your account.</span>
                  <Link to="/app/resumes" className="btn-primary py-1 px-3 text-xs">
                    <Upload className="w-3.5 h-3.5" /> Upload Resume
                  </Link>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-zinc-400" />
                Target Job Description (Paste Text)
              </label>
              <textarea
                required
                rows={5}
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder="Paste full job description requirements, responsibilities, and qualifications here..."
                className="w-full bg-zinc-800 border border-zinc-700 focus:border-zinc-500 rounded-xl p-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none"
              ></textarea>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !selectedResumeId || !jdText.trim()}
            className="w-full btn-primary py-3 text-sm font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Calculating Explainable ATS Scores...' : 'Run Complete ATS Analysis'}
            <Sliders className="w-4 h-4 ml-1" />
          </button>
        </form>
      </div>

      {/* Analysis Results Display */}
      {analysis && (
        <div className="space-y-8">
          {/* Top Score Banner */}
          <div className="glass-panel p-8 rounded-2xl border border-zinc-800 bg-zinc-900 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="md:col-span-1 flex justify-center">
              <AtsScoreGauge score={analysis.score} />
            </div>

            <div className="md:col-span-2 space-y-4">
              <h3 className="font-heading font-bold text-xl text-white">Score Breakdown & Dimensions</h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="bg-zinc-800 p-3 rounded-xl border border-zinc-700">
                  <span className="text-[10px] text-zinc-400 uppercase font-semibold">Skills Match (35%)</span>
                  <div className="text-xl font-bold text-zinc-100">{analysis.skillMatchScore}%</div>
                </div>

                <div className="bg-zinc-800 p-3 rounded-xl border border-zinc-700">
                  <span className="text-[10px] text-zinc-400 uppercase font-semibold">Keywords Match (25%)</span>
                  <div className="text-xl font-bold text-zinc-100">{analysis.keywordMatchScore}%</div>
                </div>

                <div className="bg-zinc-800 p-3 rounded-xl border border-zinc-700">
                  <span className="text-[10px] text-zinc-400 uppercase font-semibold">Experience (15%)</span>
                  <div className="text-xl font-bold text-zinc-100">{analysis.experienceMatchScore}%</div>
                </div>

                <div className="bg-zinc-800 p-3 rounded-xl border border-zinc-700">
                  <span className="text-[10px] text-zinc-400 uppercase font-semibold">Education (10%)</span>
                  <div className="text-xl font-bold text-zinc-100">{analysis.educationMatchScore}%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Matched vs Missing Skills Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Matched Skills */}
            <div className="glass-panel p-6 rounded-2xl border border-zinc-800 bg-zinc-900 space-y-3">
              <h4 className="font-heading font-bold text-lg text-zinc-200 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                Matched Skills ({analysis.matchedSkills.length})
              </h4>
              <div className="flex flex-wrap gap-2 pt-1">
                {analysis.matchedSkills.map((s, idx) => (
                  <span key={idx} className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-950/50 text-emerald-300 border border-emerald-800/50">
                    ✓ {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="glass-panel p-6 rounded-2xl border border-zinc-800 bg-zinc-900 space-y-3">
              <h4 className="font-heading font-bold text-lg text-zinc-200 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                Missing Skills ({analysis.missingSkills.length})
              </h4>
              <div className="flex flex-wrap gap-2 pt-1">
                {analysis.missingSkills.map((s, idx) => (
                  <span key={idx} className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">
                    ⚠ {s}
                  </span>
                ))}
              </div>
            </div>

          </div>

          {/* Actionable Recommendations */}
          <div className="glass-panel p-6 rounded-2xl border border-zinc-800 bg-zinc-900 space-y-4">
            <h4 className="font-heading font-bold text-lg text-white">Actionable Resume Improvement Steps</h4>
            <div className="space-y-3">
              {analysis.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-zinc-800 rounded-xl border border-zinc-700 text-xs text-zinc-200">
                  <div className="w-5 h-5 rounded-full bg-zinc-700 text-zinc-200 font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </div>
                  <span>{rec}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <Link to="/app/builder" className="btn-primary text-xs py-2.5 px-5">
                <Edit3 className="w-4 h-4" />
                Enhance Bullet Points & Generate Resume
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
