import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import AtsScoreGauge from '../components/AtsScoreGauge';
import JobCard from '../components/JobCard';
import { 
  FileText, 
  SearchCode, 
  Sliders, 
  Briefcase, 
  AlertTriangle, 
  Plus, 
  ArrowRight,
  Upload
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsRes, jobsRes, resumesRes] = await Promise.all([
          api.get('/analytics/dashboard').catch(() => null),
          api.post('/jobs/search', { query: 'developer' }).catch(() => null),
          api.get('/resumes').catch(() => null)
        ]);

        if (statsRes?.success) setStats(statsRes.metrics);
        if (jobsRes?.success) setRecommendedJobs(jobsRes.jobs.slice(0, 4));
        if (resumesRes?.success) setResumes(resumesRes.resumes);
      } catch (err) {
        console.error('Error loading dashboard data:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const hasResume = resumes.length > 0;
  const avgAtsScore = hasResume ? (stats?.avgAtsScore ?? 0) : 0;
  const jobsMatchedCount = hasResume ? (recommendedJobs.length > 0 ? 18 : 0) : 0;
  const applicationsCount = stats?.totalApplications ?? 0;
  const interviewCount = stats?.interviewCount ?? 0;
  const missingSkills = stats?.topMissingSkills || [];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Welcome Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-zinc-800 bg-zinc-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white">
            Welcome back, {user?.name || 'Candidate'} 👋
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            {user?.profile?.title || 'Software Engineer'} • {user?.profile?.experienceLevel || 'Mid'} Level
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/app/resumes" className="btn-primary text-xs">
            <Plus className="w-4 h-4" />
            Upload Resume
          </Link>
          <Link to="/app/ats-analysis" className="btn-secondary text-xs">
            <SearchCode className="w-4 h-4" />
            Run ATS Match
          </Link>
        </div>
      </div>

      {/* Top 5 Metrics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-zinc-800 bg-zinc-900 space-y-1">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Avg ATS Score</span>
          <div className="text-2xl font-extrabold font-heading text-zinc-100">
            {hasResume && avgAtsScore > 0 ? `${avgAtsScore}%` : '0%'}
          </div>
          <span className="text-[10px] text-zinc-500">{hasResume ? 'Target Match' : 'Upload Resume'}</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-zinc-800 bg-zinc-900 space-y-1">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Jobs Matched</span>
          <div className="text-2xl font-extrabold font-heading text-zinc-100">
            {jobsMatchedCount}
          </div>
          <span className="text-[10px] text-zinc-500">Active feeds</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-zinc-800 bg-zinc-900 space-y-1">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Applications</span>
          <div className="text-2xl font-extrabold font-heading text-zinc-100">
            {applicationsCount}
          </div>
          <span className="text-[10px] text-zinc-500">Tracked</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-zinc-800 bg-zinc-900 space-y-1">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Interviews</span>
          <div className="text-2xl font-extrabold font-heading text-zinc-100">
            {interviewCount}
          </div>
          <span className="text-[10px] text-zinc-500">Stage conversions</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-zinc-800 bg-zinc-900 space-y-1">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Skill Gaps</span>
          <div className="text-2xl font-extrabold font-heading text-zinc-100">
            {missingSkills.length}
          </div>
          <span className="text-[10px] text-zinc-500">Keywords to add</span>
        </div>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: ATS Gauge & Missing Skills */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* ATS Gauge & Latest Resume Status */}
          <div className="glass-panel p-6 rounded-2xl border border-zinc-800 bg-zinc-900 grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            <AtsScoreGauge score={hasResume ? avgAtsScore : 0} />
            <div className="space-y-3 text-left">
              <h3 className="font-heading font-bold text-lg text-white">Latest Resume Status</h3>
              <p className="text-xs text-zinc-300 leading-relaxed">
                {hasResume 
                  ? `Default Resume: "${resumes[0].title}" (${resumes[0].versions?.length || 1} versions)`
                  : 'No candidate resume uploaded yet. Please upload your resume in PDF or DOCX format to calculate ATS score matching.'
                }
              </p>
              <div className="flex gap-2 pt-1">
                <Link to="/app/resumes" className="btn-primary text-xs py-2 px-4">
                  <Upload className="w-3.5 h-3.5" />
                  {hasResume ? 'Manage Resumes' : 'Upload Resume Now'}
                </Link>
                {hasResume && (
                  <Link to="/app/builder" className="btn-secondary text-xs py-2 px-3">
                    <Sliders className="w-3.5 h-3.5" />
                    Enhance Bullets
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Skill Gap Banner */}
          <div className="glass-panel p-6 rounded-2xl border border-zinc-800 bg-zinc-900 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h3 className="font-heading font-bold text-lg text-white">Top Missing Skills Across Target Jobs</h3>
              </div>
              <Link to="/app/ats-analysis" className="text-xs text-zinc-400 hover:text-white flex items-center gap-1">
                View Full Analysis <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {missingSkills.length === 0 ? (
              <div className="p-4 bg-zinc-800 rounded-xl border border-zinc-700 text-xs text-zinc-400 flex items-center justify-between">
                <span>No skill gap analysis recorded yet. Compare your resume against a target job description.</span>
                <Link to="/app/ats-analysis" className="btn-secondary text-xs py-1.5 px-3">
                  Run ATS Match
                </Link>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 pt-2">
                {missingSkills.map((item, idx) => (
                  <div key={idx} className="bg-zinc-800 px-3.5 py-2 rounded-xl border border-zinc-700 flex items-center gap-2">
                    <span className="text-xs font-semibold text-zinc-200">{item.skill}</span>
                    <span className="text-[10px] font-bold bg-zinc-700 text-zinc-300 px-1.5 py-0.5 rounded-full">
                      {item.count} JDs
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recommended Jobs */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-xl text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-zinc-300" />
                Recommended Matches For Your Profile
              </h3>
              <Link to="/app/jobs" className="text-xs text-zinc-400 hover:text-white flex items-center gap-1">
                Browse All Jobs <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendedJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          </div>

        </div>

        {/* Right 1 Column: Quick Action Center */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-zinc-800 bg-zinc-900 space-y-4">
            <h3 className="font-heading font-bold text-lg text-white">CareerForge Workflow</h3>
            <p className="text-xs text-zinc-400">Step-by-step career optimization path</p>

            <div className="space-y-3 text-xs">
              <Link to="/app/resumes" className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800 border border-zinc-700 hover:border-zinc-500 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-zinc-700 text-zinc-200 flex items-center justify-center font-bold">1</div>
                <div>
                  <div className="font-bold text-white">Upload Resume</div>
                  <div className="text-[11px] text-zinc-400">PDF/DOCX normalized parsing</div>
                </div>
              </Link>

              <Link to="/app/ats-analysis" className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800 border border-zinc-700 hover:border-zinc-500 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-zinc-700 text-zinc-200 flex items-center justify-center font-bold">2</div>
                <div>
                  <div className="font-bold text-white">Analyze ATS & Gaps</div>
                  <div className="text-[11px] text-zinc-400">Rule-based 6-tier scoring</div>
                </div>
              </Link>

              <Link to="/app/builder" className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800 border border-zinc-700 hover:border-zinc-500 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-zinc-700 text-zinc-200 flex items-center justify-center font-bold">3</div>
                <div>
                  <div className="font-bold text-white">Bullet Point Enhancer</div>
                  <div className="text-[11px] text-zinc-400">Improve action verbs & metrics</div>
                </div>
              </Link>

              <Link to="/app/jobs" className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800 border border-zinc-700 hover:border-zinc-500 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-zinc-700 text-zinc-200 flex items-center justify-center font-bold">4</div>
                <div>
                  <div className="font-bold text-white">Discover & Apply</div>
                  <div className="text-[11px] text-zinc-400">Instahyre, Naukri, & Internshala</div>
                </div>
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
