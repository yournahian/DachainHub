import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DAC Chain Builder Showcase // Quantum-Proof Ecosystem',
  description: 'Tactical coordination registry for next-generation dApps and infrastructure built on the DAC Quantum Blockchain.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="https://www.dachain.tech/assets/favicon/favicon-32x32.png" />
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
