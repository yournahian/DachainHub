import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="footer-wrapper">
      <div className="footer-inner">
        {/* Brand Description */}
        <div className="footer-brand">
          <div className="brand" style={{ marginBottom: '8px' }}>
            <img 
              src="/brand/Lookup-DarkMode.svg" 
              alt="DACHAIN HUB" 
              style={{ height: '48px', width: 'auto', display: 'block' }}
            />
          </div>
          <span className="footer-subtitle">Unbreakable Blockchain, Quantum-Proof</span>
          <p style={{ fontSize: '11px', lineHeight: '1.6', marginTop: '10px', color: 'rgba(251, 251, 231, 0.4)' }}>
            Empowering next-generation builders to construct cryptographic and high-frequency decentralized infrastructure.
          </p>
        </div>

        {/* System Links */}
        <div>
          <h4 className="footer-col-title">SYSTEM_LINKS</h4>
          <div className="footer-links">
            <a href="https://www.dachain.tech/" target="_blank" rel="noopener noreferrer">HOME</a>
            <a href="https://www.dachain.tech/news" target="_blank" rel="noopener noreferrer">NEWS // BLOG</a>
            <a href="https://www.dachain.tech/team" target="_blank" rel="noopener noreferrer">TEAM</a>
            <a href="https://www.dachain.tech/contacts" target="_blank" rel="noopener noreferrer">CONTACTS</a>
          </div>
        </div>

        {/* Protocol Details */}
        <div>
          <h4 className="footer-col-title">PROTOCOL</h4>
          <div className="footer-links">
            <a href="https://docs.dachain.tech/" target="_blank" rel="noopener noreferrer">DOCUMENTATION</a>
            <a href="https://github.com/dacblockchain" target="_blank" rel="noopener noreferrer">SOURCE_CODE</a>
            <a href="https://www.dachain.tech/privacy-policy" target="_blank" rel="noopener noreferrer">PRIVACY_POLICY</a>
            <a href="https://www.dachain.tech/cookies-policy" target="_blank" rel="noopener noreferrer">COOKIES_POLICY</a>
          </div>
        </div>

        {/* Social Nodes */}
        <div>
          <h4 className="footer-col-title">SOCIAL_NODES</h4>
          <div className="footer-links" style={{ marginBottom: '16px' }}>
            <a href="https://x.com/dac_chain" target="_blank" rel="noopener noreferrer">X (TWITTER)</a>
            <a href="https://github.com/dacblockchain" target="_blank" rel="noopener noreferrer">GITHUB</a>
            <a href="https://discord.gg/dacchain" target="_blank" rel="noopener noreferrer">DISCORD</a>
            <a href="https://t.me/dac_chain" target="_blank" rel="noopener noreferrer">TELEGRAM</a>
          </div>
          
          {/* Active Network Status Indicator */}
          <div className="network-status-widget">
            <div className="network-status-dot"></div>
            <span className="network-status-text">SHIELD_STATUS: ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Copyright Bottom row */}
      <div className="footer-bottom">
        <span>© DAC LABS 2024-2026. ALL RIGHTS RESERVED.</span>
        <span>REF: QM-SHOWCASE-V1.0.4 // REGION: GLOBAL_NET</span>
      </div>
    </footer>
  );
};
