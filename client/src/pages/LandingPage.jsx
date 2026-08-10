import React from 'react';
import { Link } from 'react-router-dom';
import { 
  SearchCode, 
  Sliders, 
  Briefcase, 
  ArrowRight
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="space-y-24 py-12 max-w-6xl mx-auto">
      {/* Hero Section */}
      <section className="px-4 sm:px-6 lg:px-8 text-center space-y-8 pt-4">
        <h1 className="text-4xl sm:text-6xl font-extrabold font-heading text-white tracking-tight leading-tight max-w-4xl mx-auto">
          Build a Better Resume. <br />
          <span className="text-zinc-100">Find & Land Better Jobs.</span>
        </h1>

        <p className="text-lg text-zinc-400 max-w-2xl mx-auto font-normal">
          Analyze ATS match, pinpoint missing skills, enhance bullet points, discover job opportunities, and track applications.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link to="/register" className="btn-primary text-sm px-8 py-3">
            Analyze My Resume
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
          <Link to="/login" className="btn-secondary text-sm px-8 py-3">
            Explore Job Search
          </Link>
        </div>

        {/* Live ATS Workflow Preview Box */}
        <div className="max-w-5xl mx-auto pt-12">
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl relative overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              
              <div className="bg-zinc-800 p-5 rounded-xl border border-zinc-700 space-y-3">
                <div className="w-9 h-9 rounded-xl bg-zinc-700 text-zinc-200 flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <h3 className="font-heading font-bold text-base text-white">Explainable ATS Score</h3>
                <p className="text-xs text-zinc-400">
                  Calculates 35% Skill, 25% Keyword, 15% Experience, and 10% Education match with transparent breakdown.
                </p>
              </div>

              <div className="bg-zinc-800 p-5 rounded-xl border border-zinc-700 space-y-3">
                <div className="w-9 h-9 rounded-xl bg-zinc-700 text-zinc-200 flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <h3 className="font-heading font-bold text-base text-white">Skill Gap Detection</h3>
                <p className="text-xs text-zinc-400">
                  Instantly flags missing skills without fabricating false experience.
                </p>
              </div>

              <div className="bg-zinc-800 p-5 rounded-xl border border-zinc-700 space-y-3">
                <div className="w-9 h-9 rounded-xl bg-zinc-700 text-zinc-200 flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <h3 className="font-heading font-bold text-base text-white">Multi-Source Job Match</h3>
                <p className="text-xs text-zinc-400">
                  Discovers active opportunities from Instahyre, Naukri, & Internshala sorted by candidate match %.
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-extrabold font-heading text-white">
            The Complete Career Platform
          </h2>
          <p className="text-sm text-zinc-400 max-w-xl mx-auto">
            Everything candidate developers and professionals need to transition from resume upload to job application.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-panel p-6 rounded-2xl space-y-3 border border-zinc-800 bg-zinc-900">
            <SearchCode className="w-7 h-7 text-zinc-300" />
            <h3 className="font-heading font-bold text-lg text-white">Rule-Based ATS Engine</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Transparent, measurable scoring math across distinct evaluation dimensions.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl space-y-3 border border-zinc-800 bg-zinc-900">
            <Sliders className="w-7 h-7 text-zinc-300" />
            <h3 className="font-heading font-bold text-lg text-white">Bullet Enhancer & Optimizer</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Rewrite weak bullets into recruiter-friendly, impact-focused, and technical statements with action verbs.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl space-y-3 border border-zinc-800 bg-zinc-900">
            <Briefcase className="w-7 h-7 text-zinc-300" />
            <h3 className="font-heading font-bold text-lg text-white">Job Discovery & Direct Apply</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Aggregate listings from top job portals and apply directly through authentic employer links.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="px-4 text-center">
        <div className="glass-panel p-10 rounded-2xl border border-zinc-800 bg-zinc-900 space-y-6">
          <h2 className="text-3xl font-extrabold font-heading text-white">Ready to Optimize Your Career Search?</h2>
          <p className="text-sm text-zinc-400 max-w-lg mx-auto">
            Upload your resume now to get your instant explainable ATS score, skill gap breakdown, and matching job listings.
          </p>
          <Link to="/register" className="btn-primary text-sm px-8 py-3">
            Create Free Account
          </Link>
        </div>
      </section>
    </div>
  );
}
