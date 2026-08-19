import './globals.css';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { ThemeProvider } from '@/components/ThemeProvider';
import type { Metadata, Viewport } from 'next';

export const viewport: Viewport = {
  themeColor: '#0B0E14',
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
    <html lang="en" suppressHydrationWarning>
      <body className="bg-slate-50 dark:bg-[#0B0E14] text-slate-900 dark:text-white min-h-screen flex flex-col justify-between selection:bg-[#FF6B4A] selection:text-white overflow-x-hidden transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <Navbar />

          <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-24 lg:pt-28 pb-8 overflow-x-hidden">
            {children}
          </main>

          <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#080A0F] pt-12 pb-8 px-4 sm:px-6 mt-16 transition-colors duration-300">
            <div className="max-w-6xl mx-auto space-y-10">
              <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                <div className="space-y-4 max-w-xs">
                  <Image 
                    src="/logo1.png" 
                    alt="Global Sales Elite Logo" 
                    width={140} 
                    height={35} 
                    className="w-auto h-auto object-contain"
                  />
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Empowering the next generation of sales professionals with transparent, high-yield network marketing infrastructure.
                  </p>
                </div>

                <div className="flex gap-16 text-xs">
                  <div className="space-y-3">
                    <h4 className="font-bold text-slate-900 dark:text-white tracking-wide">Platform</h4>
                    <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                      <li><Link href="/" className="hover:text-[#FF6B4A] transition">How it works</Link></li>
                      <li><Link href="/" className="hover:text-[#FF6B4A] transition">Compensation Plan</Link></li>
                      <li><Link href="/" className="hover:text-[#FF6B4A] transition">Matrix Mechanics</Link></li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-bold text-slate-900 dark:text-white tracking-wide">Company</h4>
                    <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                      <li><Link href="/" className="hover:text-[#FF6B4A] transition">About</Link></li>
                      <li><Link href="/" className="hover:text-[#FF6B4A] transition">Terms</Link></li>
                      <li><Link href="/" className="hover:text-[#FF6B4A] transition">Privacy</Link></li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-900/80 pt-6 text-center text-xs text-slate-500">
                © {new Date().getFullYear()} Global Sales Elite. All rights reserved.
              </div>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}