'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: 'How do I get paid?',
      a: 'Commissions are credited to your account instantly when a sale is approved by an admin. You can request direct payouts to your registered local bank account.',
    },
    {
      q: 'What happens if I reach Level 2?',
      a: 'You earn an additional 3% commission automatically on all direct sales completed by agents in your Level 1 downline network.',
    },
    {
      q: 'How does the referral spillover work?',
      a: 'Our dual-leg structure automatically places additional recruits under your active downline team members, helping your entire network grow faster.',
    },
  ];

  return (
    <div className="space-y-24">

      {/* HERO SECTION */}
      <section className="py-4">
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left Column: Headline & Action Buttons */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-[#121620] border border-slate-800 px-4 py-1.5 rounded-full text-xs font-semibold text-[#FF6B4A] uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#FF6B4A] animate-pulse"></span>
              Become An Elite Today
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
              Redefine <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-300 to-slate-500">
                Upscale
              </span> <br />
              <span className="text-[#FF6B4A]">Mastery</span>
            </h1>

            <p className="text-slate-400 text-sm sm:text-base max-w-lg leading-relaxed">
              Join the Global Sales Elite platform. Earn multi-tier commissions in Naira (₦), and track your global downline sales in real-time.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <Link
                href="/signup"
                className="bg-[#FF6B4A] hover:bg-[#e05638] text-white font-bold px-8 py-4 rounded-2xl text-sm transition shadow-xl shadow-[#FF6B4A]/25 flex items-center justify-center gap-2"
              >
                JOIN THE NETWORK &rarr;
              </Link>

              <Link
                href="/login"
                className="bg-[#121620] hover:bg-slate-800 text-slate-300 hover:text-white font-semibold px-8 py-4 rounded-2xl text-sm border border-slate-800/80 text-center transition"
              >
                SIGN IN
              </Link>
            </div>
          </div>

          {/* Right Column: Visual Showcase Cards */}
          <div className="space-y-6">
            {/* Sleek Modern Corporate Image Card */}
            <div className="relative rounded-3xl overflow-hidden border border-slate-800/80 shadow-2xl bg-[#121620] group h-64 sm:h-72">
              <img
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80"
                alt="Global Corporate Leadership"
                className="w-full h-full object-cover object-center opacity-70 group-hover:scale-105 transition duration-700 ease-out"
              />
              {/* Dark Gradient Overlay for sleek feel */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-[#0B0E14]/40 to-transparent"></div>
              
              <div className="absolute bottom-5 left-5 right-5 bg-[#121620]/90 backdrop-blur-md p-4 rounded-2xl border border-slate-800/80 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                  <span className="text-[#FF6B4A]">🛡️</span> ELITE LEADERSHIP
                </div>
                <p className="text-[11px] text-slate-400">Mastering the global sales landscape with precision.</p>
              </div>
            </div>

            {/* Live Referral Network Preview Graphic */}
            <div className="bg-[#121620]/90 backdrop-blur-md p-6 rounded-3xl border border-slate-800/80 shadow-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  NETWORK INTELLIGENCE
                </div>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded font-mono font-bold">
                  LIVE
                </span>
              </div>

              {/* Graphic Diagram */}
              <div className="py-2 flex flex-col items-center justify-center space-y-3">
                <div className="px-5 py-1.5 bg-[#0B0E14] border border-slate-700 rounded-xl font-bold text-xs text-slate-200 shadow-md">
                  YOU (Agent)
                </div>

                <div className="w-px h-5 bg-gradient-to-b from-slate-700 to-[#FF6B4A]"></div>

                <div className="grid grid-cols-2 gap-4 w-full max-w-xs text-center">
                  <div className="p-2 bg-[#0B0E14] border border-slate-800 rounded-xl text-xs font-semibold text-slate-400">
                    L1 Referral
                  </div>
                  <div className="p-2 bg-[#0B0E14] border border-[#FF6B4A]/50 rounded-xl text-xs font-semibold text-[#FF6B4A] relative">
                    <span className="absolute -top-2 -right-1 bg-[#FF6B4A] text-[8px] font-bold px-1 py-0.2 rounded text-white uppercase">New</span>
                    L2 Referral
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 1: Engineered for Growth */}
      <section className="space-y-12 text-center pt-8 border-t border-slate-900">
        <div className="space-y-4 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            Engineered for Growth
          </h2>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed">
            Our system is designed to reward active builders while ensuring sustainable payouts through advanced matrix mechanics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {/* Card 1 */}
          <div className="bg-[#121620]/80 p-8 rounded-3xl border border-slate-800/80 shadow-2xl space-y-4">
            <div className="w-12 h-12 bg-[#FF6B4A]/10 rounded-2xl border border-[#FF6B4A]/30 flex items-center justify-center text-[#FF6B4A]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white">2-Leg Spillover Matrix</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every node has exactly two spots. Additional recruits automatically "spill over" to the next available spot in your downline, helping your team grow faster.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-[#121620]/80 p-8 rounded-3xl border border-slate-800/80 shadow-2xl space-y-4">
            <div className="w-12 h-12 bg-[#FF6B4A]/10 rounded-2xl border border-[#FF6B4A]/30 flex items-center justify-center text-[#FF6B4A]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white">Tiered Commissions</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Earn 15% on direct referrals, and 3% on second level. A robust compensation plan built for massive scaling.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-[#121620]/80 p-8 rounded-3xl border border-slate-800/80 shadow-2xl space-y-4">
            <div className="w-12 h-12 bg-[#FF6B4A]/10 rounded-2xl border border-[#FF6B4A]/30 flex items-center justify-center text-[#FF6B4A]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white">Instant Payout Approvals</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Direct integration with local banks allows for rapid commission clearance. Track pending approvals directly from your dashboard.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 2: Unrivaled Compensation Plan */}
      <section className="space-y-12 text-center pt-8 border-t border-slate-900">
        <div className="space-y-4 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            Unrivaled Compensation Plan
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            We built our payouts to maximize earning potential for both direct effort and team building.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          {/* Plan 1 */}
          <div className="bg-[#121620]/80 p-8 rounded-3xl border border-slate-800/80 shadow-2xl flex flex-col justify-between space-y-6">
            <div className="space-y-2">
              <span className="text-4xl font-black text-[#FF6B4A]">15%</span>
              <h3 className="text-base font-bold text-white">Direct Referral</h3>
              <p className="text-xs text-slate-400 leading-relaxed pt-2">
                Earn 15% immediately for anyone who signs up directly using your link.
              </p>
            </div>
          </div>

          {/* Plan 2 */}
          <div className="bg-[#121620]/80 p-8 rounded-3xl border border-slate-800/80 shadow-2xl flex flex-col justify-between space-y-6">
            <div className="space-y-2">
              <span className="text-4xl font-black text-white">3%</span>
              <h3 className="text-base font-bold text-white">Indirect Level 2</h3>
              <p className="text-xs text-slate-400 leading-relaxed pt-2">
                Earn 3% for the direct referrals made by your Level 1 network.
              </p>
            </div>
          </div>

          {/* Plan 3 */}
          <div className="bg-[#121620]/80 p-8 rounded-3xl border border-slate-800/80 shadow-2xl flex flex-col justify-between space-y-6 relative overflow-hidden">
            <div className="absolute top-3 right-3 text-amber-400 text-xs">👑</div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white pt-2">Grow a Power Team</h3>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block">(Everyone)</span>
              <p className="text-xs text-slate-400 leading-relaxed pt-2">
                Stand a chance to grow, learn, and maximize your potential as a profitable Realtor. Cheers Global Elite!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Success Stories & FAQ */}
      <section className="space-y-16 pt-8 border-t border-slate-900">
        {/* Testimonials */}
        <div className="space-y-12 text-center">
          <div className="space-y-3 max-w-xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-black text-white">Success Stories</h2>
            <p className="text-slate-400 text-xs leading-relaxed">
              Hear from top earners who are already scaling their network in our global matrix.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {/* Story 1 */}
            <div className="bg-[#121620]/80 p-8 rounded-3xl border border-slate-800/80 shadow-2xl space-y-6">
              <div className="text-amber-400 text-sm">★★★★★</div>
              <p className="text-xs text-slate-300 italic leading-relaxed">
                "The 15% direct commission and immediate withdrawals changed the game for my agency. The visual network tree makes it so easy to see where spillover is happening."
              </p>
              <div className="flex items-center gap-3 pt-2">
                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center text-xs font-bold text-white">
                  SO
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Sarah O.</h4>
                  <p className="text-[10px] text-slate-500">Executive Director</p>
                </div>
              </div>
            </div>

            {/* Story 2 */}
            <div className="bg-[#121620]/80 p-8 rounded-3xl border border-slate-800/80 shadow-2xl space-y-6">
              <div className="text-amber-400 text-sm">★★★★★</div>
              <p className="text-xs text-slate-300 italic leading-relaxed">
                "I've built teams in three different systems before, but GSE's dual-leg matrix ensures my team actually benefits from my over-recruiting. Highly recommended."
              </p>
              <div className="flex items-center gap-3 pt-2">
                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center text-xs font-bold text-white">
                  DK
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">David K.</h4>
                  <p className="text-[10px] text-slate-500">Diamond Rank Earner</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="space-y-8 max-w-3xl mx-auto pt-8">
          <h2 className="text-3xl font-black text-white text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-[#121620]/80 border border-slate-800/80 rounded-2xl overflow-hidden transition">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 text-left flex justify-between items-center text-sm font-bold text-white hover:text-[#FF6B4A] transition"
                >
                  <span>{faq.q}</span>
                  <span className="text-slate-400 text-xs">{openFaq === idx ? '▲' : '▼'}</span>
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs text-slate-400 leading-relaxed border-t border-slate-800/40 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}