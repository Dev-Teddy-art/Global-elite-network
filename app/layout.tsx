import './globals.css';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import type { Metadata, Viewport } from 'next';

export const viewport: Viewport = {
  themeColor: '#0B0E14',
  colorScheme: 'dark',
};

export const metadata: Metadata = {
  title: 'Global Sales Elite | Maximize Your Earnings',
  description: 'Multi-Tier Sales & Commission Platform',
  icons: {
    icon: 'favicon.ico/icon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark bg-[#0B0E14]">
      <body className="bg-[#0B0E14] text-white min-h-screen flex flex-col justify-between selection:bg-[#E05244] selection:text-white">
        {/* Navigation Bar */}
        <Navbar />

        {/* Main Page Content */}
        <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-8">{children}</main>

        {/* Global Brand Footer */}
        <footer className="border-t border-slate-900 bg-[#080A0F] pt-12 pb-8 px-6 mt-16">
          <div className="max-w-6xl mx-auto space-y-10">
            
            {/* Top Footer Section */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-8">
              
              {/* Brand Info & Tagline */}
              <div className="space-y-4 max-w-xs">
                <Image 
                  src="/logo1.png" 
                  alt="Global Sales Elite Logo" 
                  width={140} 
                  height={35} 
                  className="w-auto h-auto object-contain"
                />
                <p className="text-xs text-slate-400 leading-relaxed">
                  Empowering the next generation of sales professionals with transparent, high-yield network marketing infrastructure.
                </p>
              </div>

              {/* Navigation Columns */}
              <div className="flex gap-16 text-xs">
                {/* Platform Links */}
                <div className="space-y-3">
                  <h4 className="font-bold text-white tracking-wide">Platform</h4>
                  <ul className="space-y-2 text-slate-400">
                    <li><Link href="/" className="hover:text-white transition">How it works</Link></li>
                    <li><Link href="/" className="hover:text-white transition">Compensation Plan</Link></li>
                    <li><Link href="/" className="hover:text-white transition">Matrix Mechanics</Link></li>
                  </ul>
                </div>

                {/* Company Links */}
                <div className="space-y-3">
                  <h4 className="font-bold text-white tracking-wide">Company</h4>
                  <ul className="space-y-2 text-slate-400">
                    <li><Link href="/" className="hover:text-white transition">About</Link></li>
                    <li><Link href="/" className="hover:text-white transition">Terms</Link></li>
                    <li><Link href="/" className="hover:text-white transition">Privacy</Link></li>
                  </ul>
                </div>
              </div>

            </div>

            {/* Bottom Copyright Bar */}
            <div className="border-t border-slate-900/80 pt-6 text-center text-xs text-slate-500">
              © {new Date().getFullYear()} Global Sales Elite. All rights reserved.
            </div>

          </div>
        </footer>
      </body>
    </html>
  );
}