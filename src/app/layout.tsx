import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DachainHub // Quantum-Proof Ecosystem',
  description: 'Tactical coordination registry for next-generation dApps and infrastructure built on the DAC Quantum Blockchain.',
  openGraph: {
    title: 'DachainHub // Quantum-Proof Ecosystem',
    description: 'Tactical coordination registry for next-generation dApps and infrastructure built on the DAC Quantum Blockchain.',
    url: 'https://dachain.tech',
    siteName: 'DachainHub',
    images: [
      {
        url: '/brand/Lookup-DarkMode.svg',
        width: 1200,
        height: 630,
        alt: 'DAC Chain Brand Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DachainHub // Quantum-Proof Ecosystem',
    description: 'Tactical coordination registry for next-generation dApps and infrastructure built on the DAC Quantum Blockchain.',
    images: ['/brand/Lookup-DarkMode.svg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/brand/favicon.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@300;400;500;600;700&family=Chakra+Petch:wght@400;500;600;700&family=Rajdhani:wght@500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
