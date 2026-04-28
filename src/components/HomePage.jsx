import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  Brain,
  CheckCircle,
  ClipboardList,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();
  const [interviewCode, setInterviewCode] = useState('');
  const [dashboardCode, setDashboardCode] = useState('');

  const handleCandidateStart = (e) => {
    e.preventDefault();
    if (interviewCode.trim()) {
      navigate(`/interview/${interviewCode.toUpperCase()}`);
    }
  };

  const handleDashboardAccess = (e) => {
    e.preventDefault();
    if (dashboardCode.trim()) {
      navigate(`/dashboard/${dashboardCode.toUpperCase()}`);
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,#dbeafe,transparent_34%),linear-gradient(135deg,#f8fafc_0%,#eef2ff_48%,#ecfeff_100%)] px-4 py-8 dark:bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.24),transparent_34%),linear-gradient(135deg,#020617_0%,#0f172a_56%,#111827_100%)]">
      <div className="mx-auto max-w-7xl">
        <header className="mb-12 flex items-center justify-between pr-14">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/25">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-950 dark:text-white">SmartHire</p>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                Assessment Suite
              </p>
            </div>
          </div>
        </header>

        <section className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/70 px-3 py-1.5 text-sm font-semibold text-blue-700 shadow-sm backdrop-blur dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-200">
              <ShieldCheck className="h-4 w-4" />
              Candidate-ready assessments with live scoring
            </div>
            <h1 className="text-4xl font-black leading-tight text-slate-950 sm:text-5xl lg:text-6xl dark:text-white">
              Create polished assessments and review results in one place.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              Build MCQ and long-answer rounds, share a secure code with candidates, and track responses from a focused dashboard.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                { icon: Brain, label: 'AI question generation' },
                { icon: BarChart3, label: 'Weighted scoring' },
                { icon: ShieldCheck, label: 'Timed assessment flow' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 rounded-lg border border-white/70 bg-white/75 p-3 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200"
                  >
                    <Icon className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                    <span>{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-xl border border-white/80 bg-white/85 p-6 shadow-2xl shadow-blue-950/10 backdrop-blur dark:border-slate-700 dark:bg-slate-900/85 dark:shadow-black/30">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-200">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-950 dark:text-white">Candidate Access</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Start with an assessment code</p>
                </div>
              </div>
              <form onSubmit={handleCandidateStart} className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Assessment Code
                </label>
                <input
                  type="text"
                  value={interviewCode}
                  onChange={(e) => setInterviewCode(e.target.value)}
                  placeholder="e.g., ABC123"
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 font-mono text-lg uppercase tracking-widest text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-950"
                  required
                />
                <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700">
                  Start Assessment
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <button
                onClick={() => navigate('/create-questions')}
                className="group rounded-xl border border-white/80 bg-white/80 p-5 text-left shadow-lg backdrop-blur transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-700 dark:bg-slate-900/80"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">
                  <ClipboardList className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-950 dark:text-white">Create Assessment</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Add MCQ and long-answer questions with difficulty-based timing.
                </p>
                <div className="mt-4 flex items-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-300">
                  Build now <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </div>
              </button>

              <div className="rounded-xl border border-white/80 bg-white/80 p-5 shadow-lg backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-100">
                  <LayoutDashboard className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-950 dark:text-white">Results Dashboard</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Use your dashboard code to review submissions.
                </p>
                <form onSubmit={handleDashboardAccess} className="mt-4 flex gap-2">
                  <input
                    type="text"
                    value={dashboardCode}
                    onChange={(e) => setDashboardCode(e.target.value)}
                    placeholder="Code"
                    className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono uppercase text-slate-900 outline-none focus:border-slate-500 focus:ring-4 focus:ring-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-slate-800"
                  />
                  <button className="rounded-lg bg-blue-600 px-4 py-2 font-bold text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200">
                    Open
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
