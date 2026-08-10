import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { BarChart3, TrendingUp, Award, Target, SearchCode } from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.get('/analytics/dashboard');
      if (res.success) {
        setMetrics(res.metrics);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const scoreData = metrics?.scoreTrend || [];
  const skillData = metrics?.topMissingSkills || [];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-zinc-800 bg-zinc-900">
        <h1 className="text-2xl font-extrabold font-heading text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-zinc-300" />
          Real Career & ATS Analytics
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Track real resume score progression, common missing skills frequency, and application conversion ratios.
        </p>
      </div>

      {/* Top 4 High-Level Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-zinc-800 bg-zinc-900 space-y-1">
          <div className="flex items-center gap-2 text-zinc-400 text-xs font-semibold">
            <TrendingUp className="w-4 h-4 text-zinc-400" />
            Avg ATS Score
          </div>
          <div className="text-3xl font-extrabold font-heading text-zinc-100">
            {metrics?.avgAtsScore ? `${metrics.avgAtsScore}%` : 'N/A'}
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-zinc-800 bg-zinc-900 space-y-1">
          <div className="flex items-center gap-2 text-zinc-400 text-xs font-semibold">
            <Target className="w-4 h-4 text-zinc-400" />
            Interview Conversion
          </div>
          <div className="text-3xl font-extrabold font-heading text-zinc-100">
            {metrics?.interviewConversion || '0%'}
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-zinc-800 bg-zinc-900 space-y-1">
          <div className="flex items-center gap-2 text-zinc-400 text-xs font-semibold">
            <Award className="w-4 h-4 text-zinc-400" />
            Resumes Stored
          </div>
          <div className="text-3xl font-extrabold font-heading text-zinc-100">
            {metrics?.totalResumes || 0}
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-zinc-800 bg-zinc-900 space-y-1">
          <div className="flex items-center gap-2 text-zinc-400 text-xs font-semibold">
            <BarChart3 className="w-4 h-4 text-zinc-400" />
            Applications Tracked
          </div>
          <div className="text-3xl font-extrabold font-heading text-zinc-100">
            {metrics?.totalApplications || 0}
          </div>
        </div>
      </div>

      {/* Recharts Data Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Chart 1: Score Progress Over Time */}
        <div className="glass-panel p-6 rounded-2xl border border-zinc-800 bg-zinc-900 space-y-4">
          <h3 className="font-heading font-bold text-lg text-white">ATS Score Progress Over Time</h3>
          
          {scoreData.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-zinc-800 rounded-xl border border-zinc-700 space-y-3">
              <SearchCode className="w-8 h-8 text-zinc-400" />
              <p className="text-xs text-zinc-400">No ATS analysis history recorded yet.</p>
              <Link to="/app/ats-analysis" className="btn-primary text-xs py-2 px-4">
                Run ATS Match Analysis
              </Link>
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={scoreData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                  <XAxis dataKey="date" stroke="#a1a1aa" fontSize={11} />
                  <YAxis domain={[0, 100]} stroke="#a1a1aa" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#262626', borderColor: '#404040', borderRadius: '12px', color: '#fff' }} />
                  <Line type="monotone" dataKey="score" stroke="#e4e4e7" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Chart 2: Most Common Missing Skills Frequency */}
        <div className="glass-panel p-6 rounded-2xl border border-zinc-800 bg-zinc-900 space-y-4">
          <h3 className="font-heading font-bold text-lg text-white">Top Missing Skills Breakdown</h3>
          
          {skillData.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-zinc-800 rounded-xl border border-zinc-700 space-y-3">
              <BarChart3 className="w-8 h-8 text-zinc-400" />
              <p className="text-xs text-zinc-400">No skill gaps detected yet.</p>
              <Link to="/app/ats-analysis" className="btn-secondary text-xs py-2 px-4">
                Check Target Job Gaps
              </Link>
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                  <XAxis dataKey="skill" stroke="#a1a1aa" fontSize={11} />
                  <YAxis stroke="#a1a1aa" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#262626', borderColor: '#404040', borderRadius: '12px', color: '#fff' }} />
                  <Bar dataKey="count" fill="#d4d4d8" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
