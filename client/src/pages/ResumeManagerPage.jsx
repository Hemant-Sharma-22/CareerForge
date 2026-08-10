import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  FileText, 
  Upload, 
  Trash2, 
  Check, 
  Download, 
  CheckCircle2
} from 'lucide-react';

export default function ResumeManagerPage() {
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const res = await api.get('/resumes');
      if (res.success && res.resumes) {
        setResumes(res.resumes);
        if (res.resumes.length > 0 && !selectedResume) {
          setSelectedResume(res.resumes[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching resumes:', err.message);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    try {
      setUploading(true);
      setMessage('');

      const formData = new FormData();
      formData.append('resume', file);
      if (title) formData.append('title', title);

      const res = await api.post('/resumes/upload', formData, true);
      if (res.success && res.resume) {
        setMessage('Resume uploaded and parsed successfully!');
        setFile(null);
        setTitle('');
        
        setResumes(prev => [res.resume, ...prev]);
        setSelectedResume(res.resume);
        
        fetchResumes();
      }
    } catch (err) {
      setMessage(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await api.patch(`/resumes/${id}/default`);
      fetchResumes();
    } catch (err) {
      console.error('Failed to set default resume:', err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) return;
    try {
      await api.delete(`/resumes/${id}`);
      const updated = resumes.filter(r => r.id !== id);
      setResumes(updated);
      if (selectedResume?.id === id) {
        setSelectedResume(updated.length > 0 ? updated[0] : null);
      }
    } catch (err) {
      console.error('Failed to delete resume:', err.message);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-zinc-800 bg-zinc-900">
        <div>
          <h1 className="text-2xl font-extrabold font-heading text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-zinc-300" />
            Resume Manager & Versions
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Upload, parse, version, and manage your candidate resumes
          </p>
        </div>
      </div>

      {/* Upload Box */}
      <div className="glass-panel p-6 rounded-2xl border border-zinc-800 bg-zinc-900 space-y-4">
        <h3 className="font-heading font-bold text-lg text-white flex items-center gap-2">
          <Upload className="w-5 h-5 text-zinc-300" />
          Upload New Resume Document
        </h3>

        {message && (
          <div className="p-3 bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs rounded-xl font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {message}
          </div>
        )}

        <form onSubmit={handleUpload} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Resume Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Fullstack Engineer Resume 2026"
              className="w-full bg-zinc-800 border border-zinc-700 focus:border-zinc-500 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Select File (PDF / DOCX)</label>
            <input
              type="file"
              required
              accept=".pdf,.docx,.doc,.txt"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-300 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-zinc-700 file:text-zinc-100 hover:file:bg-zinc-600 cursor-pointer"
            />
          </div>

          <button
            type="submit"
            disabled={uploading || !file}
            className="btn-primary py-2.5 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Parsing File...' : 'Upload & Parse'}
            <Upload className="w-4 h-4 ml-1" />
          </button>
        </form>
      </div>

      {/* Resumes Grid & Versions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Resumes List */}
        <div className="space-y-4">
          <h3 className="font-heading font-bold text-lg text-white">Uploaded Resumes ({resumes.length})</h3>
          
          {resumes.length === 0 ? (
            <div className="glass-panel p-8 rounded-2xl text-center text-xs text-zinc-400 border border-zinc-800 bg-zinc-900">
              No resumes uploaded yet. Upload your PDF or DOCX file above.
            </div>
          ) : (
            resumes.map((r) => (
              <div
                key={r.id}
                onClick={() => setSelectedResume(r)}
                className={`glass-panel p-5 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                  selectedResume?.id === r.id
                    ? 'border-zinc-600 bg-zinc-800 shadow-md'
                    : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-heading font-bold text-base text-white">{r.title}</h4>
                    <span className="text-[11px] text-zinc-400">{r.originalFileName}</span>
                  </div>
                  {r.isDefault && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
                      DEFAULT
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-xs">
                  <span className="text-zinc-400">Versions: {r.versions?.length || 1}</span>
                  <div className="flex items-center gap-2">
                    {!r.isDefault && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleSetDefault(r.id); }}
                        className="text-zinc-400 hover:text-emerald-400 p-1"
                        title="Set as Default"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(r.id); }}
                      className="text-zinc-400 hover:text-rose-400 p-1"
                      title="Delete Resume"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right 2 Columns: Selected Resume Parsed Sections */}
        <div className="lg:col-span-2 space-y-6">
          {selectedResume ? (
            <div className="glass-panel p-6 rounded-2xl border border-zinc-800 bg-zinc-900 space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <div>
                  <h3 className="font-heading font-bold text-xl text-white">{selectedResume.title}</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">Parsed Internal Structure & Skill Highlights</p>
                </div>
                <div className="flex gap-2">
                  <a
                    href={selectedResume.fileUrl || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary text-xs py-1.5 px-3"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download Original
                  </a>
                </div>
              </div>

              {/* Parsed Sections Preview */}
              <div className="space-y-4">
                <div>
                  <h5 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Detected Skills</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {(selectedResume.parsedData?.skills || ['JavaScript', 'React', 'Node.js', 'SQL', 'Git']).map((sk, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-800 text-zinc-200 border border-zinc-700">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Professional Summary</h5>
                  <p className="text-xs text-zinc-300 bg-zinc-800 p-3 rounded-xl border border-zinc-700 leading-relaxed">
                    {selectedResume.parsedData?.summary || 'Experienced candidate developer with background in building web applications and REST APIs.'}
                  </p>
                </div>

                <div>
                  <h5 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Work History Highlights</h5>
                  <div className="space-y-2">
                    {(selectedResume.parsedData?.experience || []).map((exp, i) => (
                      <div key={i} className="bg-zinc-800 p-3 rounded-xl border border-zinc-700 text-xs space-y-1">
                        <div className="font-bold text-white">{exp.role} • {exp.company || 'Tech Org'}</div>
                        <ul className="list-disc pl-4 text-zinc-300 space-y-1">
                          {(exp.highlights || []).map((h, hIdx) => (
                            <li key={hIdx}>{h}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-12 rounded-2xl text-center text-xs text-zinc-400 border border-zinc-800 bg-zinc-900">
              Select a resume from the list to view parsed sections.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
