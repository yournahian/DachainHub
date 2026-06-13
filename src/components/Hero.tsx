import React, { useState, useEffect } from 'react';
import { Terminal, Cpu, ShieldAlert, Sparkles } from 'lucide-react';

interface HeroProps {
  onNavigate: (view: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  
  // Simulated Ecosystem Process Logging
  useEffect(() => {
    const logPool = [
      "NEW_BUILDER_NODE_ONBOARDING // HANDLE: @AlistairV...",
      "BUILDER_PROFILE_SYNCED // SOCIALS: OK",
      "INITIATING_DAPP_UPLOAD // NAME: Q-Chat Secure...",
      "VERIFYING_POST_QUANTUM_CRYPTO_STATUS... OK",
      "SMART_CONTRACT_VERIFIED // ADDR: 0x9a8f...4e12",
      "UPLOADING_COVER_IMAGE_TO_BLOB // SIZE: 2.1MB // SUCCESS",
      "SUBMISSION_MODERATOR_APPROVAL_PENDING // ID: 1409",
      "PROJECT_UPLOADED_TO_REGISTRY // LEDGER: RECORDED",
      "UPVOTE_REGISTERED_ON_CHAIN // HEIGHT: #1411",
      "BUILDER_PASSING_MODERATION_STAGE... SUCCESS",
    ];

    setTerminalLogs([
      "INITIALIZING_BUILDER_ONBOARDING_NODE...",
      "SYNCING_REGISTRY_CATALOG... SUCCESS",
      "LISTENING_FOR_PROJECT_UPLOADS..."
    ]);

    const interval = setInterval(() => {
      const randomLog = logPool[Math.floor(Math.random() * logPool.length)];
      const timestamp = new Date().toLocaleTimeString();
      setTerminalLogs(prev => {
        const next = [...prev, `[${timestamp}] ${randomLog}`];
        if (next.length > 5) {
          next.shift();
        }
        return next;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="hero-section">
      {/* Left side text info */}
      <div className="hero-left">
        <span className="hero-subtitle">
          <Sparkles size={11} style={{ marginRight: '4px', verticalAlign: 'middle', display: 'inline' }} />
          DAC_QUANTUM_BLOCKCHAIN
        </span>
        <h2 className="hero-title">
          DACHAINHUB<br />
          <span>Ecosystem Registry</span>
        </h2>
        <p className="hero-description">
          Welcome to the tactical coordination hub for the next generation of decentralized applications. Explore post-quantum secure projects, audit developer configurations, and upload your applications directly to the DAC Chain community showcase.
        </p>
        <div className="hero-buttons">
          <button className="btn-primary" onClick={() => onNavigate('submit')}>
            <Terminal size={14} /> SUBMIT_YOUR_PROJECT
          </button>
          <button className="btn-secondary" onClick={() => {
            const el = document.getElementById('showcase-dashboard');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}>
            EXPLORE_REGISTRY
          </button>
        </div>
      </div>

      {/* Right side animated terminal console */}
      <div className="hero-right">
        <div className="terminal-console">
          <div className="terminal-header">
            <span className="terminal-title">PROCESS_MONITOR</span>
            <div className="terminal-dot"></div>
          </div>
          <div className="terminal-content">
            {terminalLogs.map((log, idx) => (
              <div key={idx} className="terminal-line">
                <span className="terminal-green">&gt;</span>{' '}
                {log.includes('SUCCESS') || log.includes('OK') ? (
                  <span>
                    {log.split('SUCCESS')[0].split('OK')[0]}
                    <span className="terminal-green">{log.includes('SUCCESS') ? 'SUCCESS' : 'OK'}</span>
                    {log.split('SUCCESS')[1] || log.split('OK')[1]}
                  </span>
                ) : log.includes('ERR') || log.includes('ALERT') ? (
                  <span className="terminal-accent">{log}</span>
                ) : (
                  <span>{log}</span>
                )}
              </div>
            ))}
          </div>
          <div className="coord-overlay">
            <span>COORD: 45.1092° N, 122.6801° W</span>
            <span>PING: 14ms // GEN-5</span>
          </div>
        </div>
      </div>
    </section>
  );
};
