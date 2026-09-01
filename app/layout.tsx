import './globals.css';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { ThemeProvider } from '@/components/ThemeProvider';
import type { Metadata, Viewport } from 'next';

export const viewport: Viewport = {
  themeColor: '#0B0E14',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://globalsaleselite.com'),
  title: {
    default: 'Global Sales Elite | Premier Real Estate Network Marketing Platform',
    template: '%s | Global Sales Elite',
  },
  description:
    'Empowering the next generation of sales professionals with high-ticket real estate commissions, transparent binary matrix rewards, 15% direct earnings, and 3% override payouts.',
  keywords: [
    'Global Sales Elite',
    'Real Estate Affiliate Nigeria',
    'High Ticket Real Estate Sales',
    'Network Marketing Real Estate',
    'Binary Matrix Real Estate',
    'Property Affiliate Commission Lagos',
    'Direct Commission Properties',
    'Real Estate Referral Marketing',
  ],
  authors: [{ name: 'Global Sales Elite Team' }],
  creator: 'Global Sales Elite',
  publisher: 'Global Sales Elite',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: 'favicon.ico/icon.png',
    apple: '/icon.png',
  },
  alternates: {
    canonical: 'https://globalsaleselite.com',
  },
  openGraph: {
    title: 'Global Sales Elite | Premier Real Estate Network Marketing',
    description:
      'Scale your property earnings with Nigeria’s leading high-yield real estate marketing infrastructure. 15% direct commissions and 3% binary overrides.',
    url: 'https://globalsaleselite.com',
    siteName: 'Global Sales Elite',
    locale: 'en_NG',
    type: 'website',
    images: [
      {
        url: 'https://globalsaleselite.com/logo1.png',
        width: 1200,
        height: 630,
        alt: 'Global Sales Elite - Real Estate Network Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Global Sales Elite | Premier Real Estate Network Marketing',
    description:
      'High-yield real estate affiliate infrastructure. Earn direct & downline binary commissions with fast automated admin verification.',
    images: ['https://globalsaleselite.com/logo1.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Global Sales Elite',
    url: 'https://globalsaleselite.com',
    logo: 'https://globalsaleselite.com/logo1.png',
    description:
      'Transparent, high-yield network marketing infrastructure for modern real estate sales professionals.',
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'info@globalsaleselite.com',
      contactType: 'customer support',
      areaServed: 'NG',
      availableLanguage: 'en',
    },
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-slate-50 dark:bg-[#0B0E14] text-slate-900 dark:text-white min-h-screen flex flex-col justify-between selection:bg-[#FF6B4A] selection:text-white overflow-x-hidden transition-colors duration-300">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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