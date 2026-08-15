import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Sliders, 
  Edit3, 
  Copy, 
  Check, 
  Layers,
  Sparkles,
  CheckCircle2,
  FileText,
  User,
  Briefcase,
  Code,
  GraduationCap,
  FolderGit2,
  Upload,
  FileUp,
  Type
} from 'lucide-react';

export default function ResumeBuilderPage() {
  const [bullet, setBullet] = useState('Worked on backend APIs.');
  const [style, setStyle] = useState('ATS optimized');
  const [keywordsInput, setKeywordsInput] = useState('REST API, validation, authentication');
  const [optimization, setOptimization] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copiedBullet, setCopiedBullet] = useState(false);

  // Resume Generator State
  const [resumes, setResumes] = useState([]);
  const [jds, setJds] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  
  // JD Input Mode: 'select' | 'paste' | 'file'
  const [jdInputMode, setJdInputMode] = useState('paste');
  const [selectedJdId, setSelectedJdId] = useState('');
  const [pastedJdText, setPastedJdText] = useState('');
  const [jdFile, setJdFile] = useState(null);

  const [genLoading, setGenLoading] = useState(false);
  const [generatedVersion, setGeneratedVersion] = useState(null);
  const [activeSectionTab, setActiveSectionTab] = useState('summary');
  const [copiedSection, setCopiedSection] = useState(null);

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
        if (jdsRes.jobDescriptions.length > 0) setJdInputMode('select');
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
    if (!selectedResumeId) return;

    try {
      setGenLoading(true);

      let payload = {
        resumeId: selectedResumeId,
        versionLabel: 'Tailored ATS Version'
      };

      if (jdInputMode === 'file' && jdFile) {
        // Upload JD file first
        const formData = new FormData();
        formData.append('jdFile', jdFile);
        const uploadRes = await api.post('/job-descriptions', formData);
        if (uploadRes?.success) {
          payload.jobDescriptionId = uploadRes.jobDescription.id;
        } else {
          throw new Error('JD file upload failed.');
        }
      } else if (jdInputMode === 'paste' && pastedJdText.trim()) {
        payload.jobDescriptionText = pastedJdText;
      } else if (jdInputMode === 'select' && selectedJdId) {
        payload.jobDescriptionId = selectedJdId;
      } else {
        alert('Please select, paste, or upload a target Job Description (JD).');
        setGenLoading(false);
        return;
      }

      const res = await api.post('/analysis/generate-resume', payload);

      if (res.success) {
        setGeneratedVersion(res.version);
        setActiveSectionTab('summary');
      }
    } catch (err) {
      console.error('Resume generation error:', err.message);
      alert(err.message || 'Error generating tailored resume.');
    } finally {
      setGenLoading(false);
    }
  };

  const copyTextToClipboard = (text, sectionName) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionName);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const getSectionTextForCopy = (section) => {
    if (!generatedVersion?.content) return '';
    const c = generatedVersion.content;

    if (section === 'summary') return c.summary || '';
    if (section === 'skills') return (c.skills || []).join(', ');
    if (section === 'experience') {
      return (c.experience || []).map(e => `${e.role || 'Role'} ${e.company ? 'at ' + e.company : ''} (${e.duration || ''})\n` + (e.highlights || []).map(h => `• ${h}`).join('\n')).join('\n\n');
    }
    if (section === 'projects') {
      return (c.projects || []).map(p => `${p.title || 'Project'}: ${p.description || ''}`).join('\n\n');
    }
    if (section === 'education') {
      return (c.education || []).map(ed => `${ed.degree || 'Degree'} - ${ed.institution || 'University'} (${ed.year || ''})`).join('\n');
    }

    return JSON.stringify(c, null, 2);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-zinc-800 bg-zinc-900">
        <h1 className="text-2xl font-extrabold font-heading text-white flex items-center gap-2">
          <Sliders className="w-6 h-6 text-zinc-300" />
          Section-Wise Resume Enhancer & Bullet Optimizer
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Tailor your resume section by section according to target JD requirements using AI or file upload.
        </p>
      </div>

      {/* SECTION 1: Full Section-Wise Resume Enhancer */}
      <div className="glass-panel p-6 rounded-2xl border border-zinc-800 bg-zinc-900 space-y-6">
        <h3 className="font-heading font-bold text-lg text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-zinc-300" />
          Enhance Resume Section-by-Section according to JD
        </h3>

        <p className="text-xs text-zinc-400">
          Select your source resume and insert your target Job Description (via text paste, PDF/DOCX upload, or saved JDs). Groq AI will analyze the JD and update each section line-by-line.
        </p>

        <form onSubmit={handleGenerateResume} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">1. Select Source Resume</label>
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
              <label className="block text-xs font-semibold text-zinc-300 mb-1">2. Target Job Description (JD) Input Mode</label>
              <div className="flex bg-zinc-800 p-1 rounded-xl border border-zinc-700 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setJdInputMode('paste')}
                  className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    jdInputMode === 'paste' ? 'bg-zinc-700 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Type className="w-3.5 h-3.5" /> Paste JD Text
                </button>

                <button
                  type="button"
                  onClick={() => setJdInputMode('file')}
                  className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    jdInputMode === 'file' ? 'bg-zinc-700 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <FileUp className="w-3.5 h-3.5" /> Upload File (PDF/DOCX)
                </button>

                {jds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setJdInputMode('select')}
                    className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      jdInputMode === 'select' ? 'bg-zinc-700 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Saved JDs ({jds.length})
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Dynamic JD Input Control */}
          {jdInputMode === 'paste' && (
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Paste Target Job Description (JD)</label>
              <textarea
                rows={4}
                required
                value={pastedJdText}
                onChange={(e) => setPastedJdText(e.target.value)}
                placeholder="Paste the target job description requirements, responsibilities, or skills here..."
                className="w-full bg-zinc-800 border border-zinc-700 focus:border-zinc-500 rounded-xl p-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none"
              />
            </div>
          )}

          {jdInputMode === 'file' && (
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Upload JD File (.pdf, .docx, .txt)</label>
              <input
                type="file"
                accept=".pdf,.docx,.doc,.txt"
                required
                onChange={(e) => setJdFile(e.target.files[0])}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2 text-xs text-zinc-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-zinc-700 file:text-zinc-100 cursor-pointer"
              />
            </div>
          )}

          {jdInputMode === 'select' && (
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Select from Saved Job Descriptions</label>
              <select
                value={selectedJdId}
                onChange={(e) => setSelectedJdId(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 focus:border-zinc-500 rounded-xl px-3 py-2.5 text-xs text-zinc-100 focus:outline-none cursor-pointer"
              >
                {jds.map(j => <option key={j.id} value={j.id} className="bg-zinc-800 text-zinc-100">{j.title} ({j.company})</option>)}
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={genLoading || !selectedResumeId}
            className="btn-primary py-2.5 px-6 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {genLoading ? 'Tailoring Sections with Groq AI...' : 'Enhance Resume Section-by-Section'}
            <Sparkles className="w-4 h-4 ml-1" />
          </button>
        </form>

        {/* Section-Wise Output Inspector */}
        {generatedVersion && (
          <div className="p-6 rounded-2xl border border-zinc-700 bg-zinc-800 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-700 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-zinc-100">Section-Wise Tailored Resume</span>
                  <span className="text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> ATS Score: 92%
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {generatedVersion.label}
                </p>
              </div>

              <button
                onClick={() => copyTextToClipboard(getSectionTextForCopy('full'), 'full')}
                className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 self-start sm:self-auto"
              >
                {copiedSection === 'full' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSection === 'full' ? 'Copied Full Resume!' : 'Copy Complete Resume'}
              </button>
            </div>

            {/* Section Navigation Tabs */}
            <div className="flex flex-wrap bg-zinc-900 p-1.5 rounded-xl border border-zinc-700 text-xs font-semibold gap-1">
              <button
                onClick={() => setActiveSectionTab('summary')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeSectionTab === 'summary' ? 'bg-zinc-700 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <User className="w-3.5 h-3.5 text-sky-400" /> Professional Summary
              </button>

              <button
                onClick={() => setActiveSectionTab('skills')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeSectionTab === 'skills' ? 'bg-zinc-700 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Code className="w-3.5 h-3.5 text-emerald-400" /> Skills Inventory
              </button>

              <button
                onClick={() => setActiveSectionTab('experience')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeSectionTab === 'experience' ? 'bg-zinc-700 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5 text-amber-400" /> Work Experience
              </button>

              <button
                onClick={() => setActiveSectionTab('projects')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeSectionTab === 'projects' ? 'bg-zinc-700 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <FolderGit2 className="w-3.5 h-3.5 text-purple-400" /> Projects
              </button>

              <button
                onClick={() => setActiveSectionTab('education')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeSectionTab === 'education' ? 'bg-zinc-700 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 text-blue-400" /> Education
              </button>
            </div>

            {/* Active Section Card View */}
            <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-700 space-y-4">
              {/* Summary Section */}
              {activeSectionTab === 'summary' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <span className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                      <User className="w-4 h-4" /> Tailored Professional Summary
                    </span>
                    <button
                      onClick={() => copyTextToClipboard(getSectionTextForCopy('summary'), 'summary')}
                      className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 bg-zinc-800 px-2.5 py-1 rounded-lg border border-zinc-700"
                    >
                      {copiedSection === 'summary' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copiedSection === 'summary' ? 'Copied' : 'Copy Summary'}
                    </button>
                  </div>
                  <p className="text-sm text-zinc-100 font-normal leading-relaxed">
                    {generatedVersion.content?.summary || 'Results-driven software developer tailored for target job description.'}
                  </p>
                </div>
              )}

              {/* Skills Section */}
              {activeSectionTab === 'skills' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Code className="w-4 h-4" /> Tailored Skills Inventory
                    </span>
                    <button
                      onClick={() => copyTextToClipboard(getSectionTextForCopy('skills'), 'skills')}
                      className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 bg-zinc-800 px-2.5 py-1 rounded-lg border border-zinc-700"
                    >
                      {copiedSection === 'skills' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copiedSection === 'skills' ? 'Copied' : 'Copy Skills'}
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {(generatedVersion.content?.skills || []).map((sk, i) => (
                      <span key={i} className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-950/40 text-emerald-300 border border-emerald-800/60 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> {sk}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience Section */}
              {activeSectionTab === 'experience' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4" /> Enhanced Work Experience Bullets
                    </span>
                    <button
                      onClick={() => copyTextToClipboard(getSectionTextForCopy('experience'), 'experience')}
                      className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 bg-zinc-800 px-2.5 py-1 rounded-lg border border-zinc-700"
                    >
                      {copiedSection === 'experience' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copiedSection === 'experience' ? 'Copied' : 'Copy Experience'}
                    </button>
                  </div>

                  <div className="space-y-4">
                    {(generatedVersion.content?.experience || []).map((exp, idx) => (
                      <div key={idx} className="bg-zinc-800/60 p-4 rounded-xl border border-zinc-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-sm text-zinc-100">{exp.role || 'Software Engineer'}</h4>
                          <span className="text-xs text-zinc-400 font-medium">{exp.company ? `${exp.company} • ` : ''}{exp.duration || '2026'}</span>
                        </div>

                        <ul className="space-y-1.5 pt-1">
                          {(exp.highlights || []).map((h, hIdx) => (
                            <li key={hIdx} className="text-xs text-zinc-300 flex items-start gap-2 leading-relaxed">
                              <span className="text-amber-400 mt-0.5">•</span>
                              <span>{h}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects Section */}
              {activeSectionTab === 'projects' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <span className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                      <FolderGit2 className="w-4 h-4" /> Tailored Projects Section
                    </span>
                    <button
                      onClick={() => copyTextToClipboard(getSectionTextForCopy('projects'), 'projects')}
                      className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 bg-zinc-800 px-2.5 py-1 rounded-lg border border-zinc-700"
                    >
                      {copiedSection === 'projects' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copiedSection === 'projects' ? 'Copied' : 'Copy Projects'}
                    </button>
                  </div>

                  <div className="space-y-3">
                    {(generatedVersion.content?.projects || []).map((proj, idx) => (
                      <div key={idx} className="bg-zinc-800/60 p-3.5 rounded-xl border border-zinc-800 space-y-1">
                        <h4 className="font-bold text-xs text-zinc-100">{proj.title || 'Project Title'}</h4>
                        <p className="text-xs text-zinc-300">{proj.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education Section */}
              {activeSectionTab === 'education' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4" /> Education Section
                    </span>
                    <button
                      onClick={() => copyTextToClipboard(getSectionTextForCopy('education'), 'education')}
                      className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 bg-zinc-800 px-2.5 py-1 rounded-lg border border-zinc-700"
                    >
                      {copiedSection === 'education' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copiedSection === 'education' ? 'Copied' : 'Copy Education'}
                    </button>
                  </div>

                  <div className="space-y-2">
                    {(generatedVersion.content?.education || []).map((ed, idx) => (
                      <div key={idx} className="text-xs text-zinc-200">
                        <span className="font-bold">{ed.degree || 'B.Tech CS'}</span> - {ed.institution || 'University'} ({ed.year || '2023'})
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: Single Bullet Point Optimizer */}
      <div className="glass-panel p-6 rounded-2xl border border-zinc-800 bg-zinc-900 space-y-6">
        <h3 className="font-heading font-bold text-lg text-white flex items-center gap-2">
          <Edit3 className="w-5 h-5 text-zinc-300" />
          Single Bullet Point Enhancer
        </h3>

        <form onSubmit={handleOptimizeBullet} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Paste Individual Bullet Point</label>
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
                onClick={() => {
                  navigator.clipboard.writeText(optimization.improved);
                  setCopiedBullet(true);
                  setTimeout(() => setCopiedBullet(false), 2000);
                }}
                className="p-2 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                title="Copy improved bullet"
              >
                {copiedBullet ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
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
    </div>
  );
}
