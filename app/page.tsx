'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  // Commission Interactive Matrix Calculator
  const [dealVolume, setDealVolume] = useState(20000000); // ₦20M
  const [downlineAgents, setDownlineAgents] = useState(4); // 4 team closers

  const directCommission = dealVolume * 0.15;
  const downlineCommission = downlineAgents * (dealVolume * 0.03);
  const totalProjected = directCommission + downlineCommission;

  // FAQ State
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const toggleFaq = (idx: number) => setOpenFaq(openFaq === idx ? null : idx);

  const faqs = [
    {
      q: 'How does the 15% direct & 3% downline override work?',
      a: 'Whenever you close a verified real estate deal, you earn 15% direct commission. Whenever an agent in your direct Level 1 downline closes a deal, you earn a 3% team override automatically.',
    },
    {
      q: 'Why is there a ₦5,000 onboarding registration fee?',
      a: 'The one-time ₦5,000 fee grants instant access to verified luxury properties, downline matrix lineage tracking, promotional sales assets, and prioritized GTBank clearance.',
    },
    {
      q: 'What is the 2-Leg Binary Spillover mechanism?',
      a: 'Your frontline is strictly 2 legs (Left & Right). Every additional agent you recruit cascades down into your team’s empty positions, building volume and earnings for your entire network.',
    },
    {
      q: 'How are commissions settled?',
      a: 'Commissions are credited upon transaction clearance and settled directly to your registered Nigerian bank account with zero platform deduction fees.',
    },
  ];

  return (
    <div className="space-y-32 relative">
      
      {/* BACKGROUND SCI-FI GLOW & GRID PATTERN */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:36px_36px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-10"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#FF6B4A]/15 dark:bg-[#FF6B4A]/10 blur-[150px] rounded-full pointer-events-none -z-10"></div>
      <div className="absolute top-[900px] -right-20 w-[450px] h-[450px] bg-emerald-500/10 blur-[160px] rounded-full pointer-events-none -z-10"></div>

      {/* ========================================================= */}
      {/* 1. HERO: DUAL COLUMN NETWORK ARCHITECTURE */}
      {/* ========================================================= */}
      <section className="pt-6 sm:pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Value Prop & CTA */}
          <div className="lg:col-span-7 space-y-7 text-center lg:text-left">
            <div className="inline-flex items-center gap-2.5 bg-slate-900/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-4 py-1.5 rounded-full text-xs font-bold text-slate-800 dark:text-slate-200 shadow-sm backdrop-blur-md">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF6B4A] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF6B4A]"></span>
              </span>
              <span>Nigeria&apos;s High-Yield Realtor Binary Network</span>
            </div>

            <h1 className="text-4xl sm:text-6xl xl:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.05]">
              Redefine. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B4A] via-rose-500 to-amber-500">
                Upscale.
              </span> <br />
              Mastery.
            </h1>

            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Stop selling real estate alone. Join an elite syndication offering <strong className="text-slate-900 dark:text-white font-bold">15% direct commission</strong> plus continuous <strong className="text-emerald-500 font-bold">3% team overrides</strong> through our high-velocity binary spillover matrix.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/signup"
                className="w-full sm:w-auto bg-[#FF6B4A] hover:bg-[#e05638] text-white font-black px-8 py-4 rounded-2xl text-xs uppercase tracking-wider transition duration-300 shadow-xl shadow-[#FF6B4A]/25 flex items-center justify-center gap-2 group"
              >
                Join Network (₦5,000)
                <span className="group-hover:translate-x-1 transition duration-200">&rarr;</span>
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto bg-white/80 dark:bg-[#121620]/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold px-8 py-4 rounded-2xl text-xs uppercase tracking-wider border border-slate-200 dark:border-slate-800 text-center transition backdrop-blur-md"
              >
                Agent Portal
              </Link>
            </div>

            {/* Quick Metrics Strip */}
            <div className="pt-8 border-t border-slate-200 dark:border-slate-800/80 grid grid-cols-3 gap-4">
              <div>
                <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white block">15%</span>
                <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">Direct Closer</span>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-black text-emerald-500 block">3%</span>
                <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">L2 Overrides</span>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-black text-[#FF6B4A] block">Instant</span>
                <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">GTB Payouts</span>
              </div>
            </div>
          </div>

          {/* Right Column: Live Matrix Interactive Terminal */}
          <div className="lg:col-span-5">
            <div className="relative bg-white/90 dark:bg-[#121620]/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl space-y-6">
              
              {/* Header Bar */}
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 ml-2 uppercase">Matrix Engine v2.4</span>
                </div>
                <span className="text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  LIVE SYNC
                </span>
              </div>

              {/* Graphical Binary Tree */}
              <div className="flex flex-col items-center py-2">
                {/* ROOT USER */}
                <div className="bg-slate-50 dark:bg-[#0B0E14] border-2 border-[#FF6B4A] px-5 py-2.5 rounded-2xl text-center shadow-lg w-52 relative">
                  <span className="text-[8px] font-mono font-bold uppercase text-[#FF6B4A] tracking-wider block">YOU (Sponsor)</span>
                  <p className="text-xs font-black text-slate-900 dark:text-white">Active Root Position</p>
                  <span className="absolute -top-2 -right-2 bg-[#FF6B4A] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">15%</span>
                </div>

                <div className="w-0.5 h-6 bg-gradient-to-b from-[#FF6B4A] to-slate-400 dark:to-slate-600"></div>

                {/* HORIZONTAL BAR */}
                <div className="w-4/5 h-0.5 bg-slate-300 dark:bg-slate-700 relative flex justify-between items-center">
                  <div className="w-1.5 h-1.5 bg-[#FF6B4A] rounded-full -top-0.5 absolute left-0"></div>
                  <div className="w-1.5 h-1.5 bg-[#FF6B4A] rounded-full -top-0.5 absolute right-0"></div>
                </div>

                {/* LEVEL 1 LEGS */}
                <div className="w-full grid grid-cols-2 gap-4 pt-3">
                  <div className="bg-slate-50 dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800 p-3 rounded-2xl text-center space-y-1 shadow-sm">
                    <span className="text-[8px] font-bold text-emerald-500 uppercase bg-emerald-500/10 px-1.5 py-0.5 rounded">Left Leg</span>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Direct Agent</p>
                    <p className="text-[10px] font-mono text-emerald-500 font-semibold">+3% Override</p>
                  </div>

                  <div className="bg-slate-50 dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800 p-3 rounded-2xl text-center space-y-1 shadow-sm">
                    <span className="text-[8px] font-bold text-emerald-500 uppercase bg-emerald-500/10 px-1.5 py-0.5 rounded">Right Leg</span>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Direct Agent</p>
                    <p className="text-[10px] font-mono text-emerald-500 font-semibold">+3% Override</p>
                  </div>
                </div>

                <div className="mt-4 w-full bg-slate-100 dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800/80 p-3 rounded-xl flex items-center justify-between text-xs">
                  <span className="text-slate-500">Auto Spillover:</span>
                  <span className="font-mono font-bold text-[#FF6B4A]">ENABLED & ACTIVE</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. BENTO GRID: HIGH IMPACT NETWORK MARKETING ADVANTAGES */}
      {/* ========================================================= */}
      <section className="space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-bold text-[#FF6B4A] uppercase tracking-widest">Syndicate Advantage</span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Engineered For Team Scale
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            A network structure designed so everyone in your organization wins when high-ticket deals close.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: 15% Direct */}
          <div className="bg-white dark:bg-[#121620] border border-slate-200 dark:border-slate-800/90 rounded-3xl p-8 space-y-4 shadow-xl hover:border-[#FF6B4A]/40 transition duration-300 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FF6B4A]/10 text-[#FF6B4A] flex items-center justify-center text-xl font-bold font-mono">
                15%
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Direct Closer Bounty</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Earn 15% upfront commission on every single real estate transaction you close directly through your portal.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] font-mono text-[#FF6B4A] font-bold">
              ₦30,000,000 Sale = ₦4,500,000 Payout
            </div>
          </div>

          {/* Card 2: 3% Override */}
          <div className="bg-white dark:bg-[#121620] border border-slate-200 dark:border-slate-800/90 rounded-3xl p-8 space-y-4 shadow-xl hover:border-emerald-500/40 transition duration-300 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xl font-bold font-mono">
                3%
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Level 2 Team Overrides</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Build a frontline of active agents. Every time they close a deal, 3% overrides hit your account automatically.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] font-mono text-emerald-500 font-bold">
              5 Team Closures = ₦4,500,000 Overrides
            </div>
          </div>

          {/* Card 3: Instant GTBank */}
          <div className="bg-white dark:bg-[#121620] border border-slate-200 dark:border-slate-800/90 rounded-3xl p-8 space-y-4 shadow-xl hover:border-amber-500/40 transition duration-300 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-xl font-bold font-mono">
                GTB
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Direct Nigerian Payouts</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Settlements flow directly into your registered Nigerian bank account upon transaction verification.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] font-mono text-amber-500 font-bold">
              Zero Delays • Zero Reductions
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. INTERACTIVE MATRIX COMMISSION CALCULATOR */}
      {/* ========================================================= */}
      <section className="bg-white/90 dark:bg-[#121620]/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl backdrop-blur-xl space-y-10">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-bold text-[#FF6B4A] uppercase tracking-widest">Earnings Simulator</span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
            Simulate Your Network Cashflow
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Adjust deal volume and team size to calculate monthly cash distributions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Sliders */}
          <div className="lg:col-span-7 space-y-7">
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-slate-800 dark:text-slate-200">
                <span>Average Property Value Closed:</span>
                <span className="font-mono text-[#FF6B4A] text-base">₦{dealVolume.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="5000000"
                max="100000000"
                step="5000000"
                value={dealVolume}
                onChange={(e) => setDealVolume(Number(e.target.value))}
                className="w-full accent-[#FF6B4A] cursor-pointer h-2 bg-slate-200 dark:bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>₦5,000,000</span>
                <span>₦100,000,000</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-slate-800 dark:text-slate-200">
                <span>Active Closers in Your Level 1 Downline:</span>
                <span className="font-mono text-emerald-500 text-base">{downlineAgents} Agents</span>
              </div>
              <input
                type="range"
                min="0"
                max="15"
                step="1"
                value={downlineAgents}
                onChange={(e) => setDownlineAgents(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>0 Closers</span>
                <span>15 Closers</span>
              </div>
            </div>
          </div>

          {/* Result Card */}
          <div className="lg:col-span-5 bg-slate-50 dark:bg-[#0B0E14] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-inner">
            <div className="space-y-2 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">15% Direct Sale:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">₦{directCommission.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">3% Downline Overrides:</span>
                <span className="font-mono font-bold text-emerald-500">₦{downlineCommission.toLocaleString()}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Estimated Total Earnings</span>
              <p className="text-3xl sm:text-4xl font-black text-[#FF6B4A] font-mono mt-1">
                ₦{totalProjected.toLocaleString()}
              </p>
            </div>

            <Link
              href="/signup"
              className="block w-full text-center bg-[#FF6B4A] hover:bg-[#e05638] text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider transition shadow-lg shadow-[#FF6B4A]/25 mt-2"
            >
              Activate Your Agent Account &rarr;
            </Link>
          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. ONBOARDING JOURNEY */}
      {/* ========================================================= */}
      <section className="space-y-12 text-center">
        <div className="space-y-3 max-w-xl mx-auto">
          <span className="text-xs font-bold text-[#FF6B4A] uppercase tracking-widest">Protocol</span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
            4 Steps To Binary Activation
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          
          <div className="bg-white dark:bg-[#121620] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-3 shadow-md">
            <span className="w-8 h-8 rounded-xl bg-[#FF6B4A]/10 text-[#FF6B4A] flex items-center justify-center font-mono font-bold text-sm">
              01
            </span>
            <h4 className="font-black text-sm text-slate-900 dark:text-white">Create Identity</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Enter your credentials and optional sponsor code.
            </p>
          </div>

          <div className="bg-white dark:bg-[#121620] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-3 shadow-md">
            <span className="w-8 h-8 rounded-xl bg-[#FF6B4A]/10 text-[#FF6B4A] flex items-center justify-center font-mono font-bold text-sm">
              02
            </span>
            <h4 className="font-black text-sm text-slate-900 dark:text-white">₦5,000 Settlement</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Transfer to GTB (3005320529) and upload proof in 20 mins.
            </p>
          </div>

          <div className="bg-white dark:bg-[#121620] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-3 shadow-md">
            <span className="w-8 h-8 rounded-xl bg-[#FF6B4A]/10 text-[#FF6B4A] flex items-center justify-center font-mono font-bold text-sm">
              03
            </span>
            <h4 className="font-black text-sm text-slate-900 dark:text-white">Recruit Downline</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Share your sponsor code to expand your Left & Right legs.
            </p>
          </div>

          <div className="bg-white dark:bg-[#121620] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-3 shadow-md">
            <span className="w-8 h-8 rounded-xl bg-[#FF6B4A]/10 text-[#FF6B4A] flex items-center justify-center font-mono font-bold text-sm">
              04
            </span>
            <h4 className="font-black text-sm text-slate-900 dark:text-white">Collect Payouts</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Earn 15% directly and 3% on all sales closed by your downline.
            </p>
          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. FAQ SECTION */}
      {/* ========================================================= */}
      <section className="space-y-8 max-w-3xl mx-auto pt-4">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-[#FF6B4A] uppercase tracking-widest">Questions</span>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">Network FAQ</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white dark:bg-[#121620] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm transition">
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full p-5 text-left flex justify-between items-center text-xs sm:text-sm font-bold text-slate-900 dark:text-white hover:text-[#FF6B4A] dark:hover:text-[#FF6B4A] transition"
              >
                <span>{faq.q}</span>
                <span className="text-slate-400 text-xs">{openFaq === idx ? '▲' : '▼'}</span>
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/40 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}