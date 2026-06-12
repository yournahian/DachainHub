import React, { useEffect } from 'react';
import { Sun, Moon, Terminal, ShieldAlert } from 'lucide-react';
import { SystemStats } from '../types';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
  stats: SystemStats;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  isAdmin: boolean;
  onLogoutAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  stats,
  theme,
  onToggleTheme,
  isAdmin,
  onLogoutAdmin,
}) => {
  return (
    <header className="header-wrapper">
      <div className="header-inner">
        {/* Brand/Logo */}
        <div className="brand" style={{ cursor: 'pointer' }} onClick={() => onNavigate('explore')}>
          {/* DAC Custom SVG Logo Icon */}
          <svg className="brand-logo" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#aa3011" />
            <path d="M2 17L12 22L22 17M2 12L12 17L22 12" stroke="#28426d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="brand-text-wrapper">
            <h1 className="brand-text">DAC_CHAIN</h1>
            <div className="brand-badge">SHOWCASE</div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="nav-links">
          <span 
            className={`nav-item ${currentView === 'explore' || currentView.startsWith('project_') ? 'active' : ''}`}
            onClick={() => onNavigate('explore')}
          >
            EXPLORE
          </span>
          <span 
            className={`nav-item ${currentView === 'submit' ? 'active' : ''}`}
            onClick={() => onNavigate('submit')}
          >
            SUBMIT_DAPP
          </span>
          <span 
            className={`nav-item ${currentView === 'builder' ? 'active' : ''}`}
            onClick={() => onNavigate('builder')}
          >
            BUILDER_WORKSPACE
          </span>
          <span 
            className={`nav-item ${currentView === 'admin' ? 'active' : ''}`}
            onClick={() => onNavigate('admin')}
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            {isAdmin && <span style={{ color: 'var(--color-primary)' }}>●</span>}
            ADMIN_TERMINAL
          </span>
        </nav>

        {/* Stats and Action Buttons */}
        <div className="nav-actions">
          {/* Live Node Dashboard in Header */}
          <div className="header-stats-panel" style={{ display: typeof window !== 'undefined' && window.innerWidth > 768 ? 'flex' : 'none' }}>
            <div className="stat-header-item">
              <span className="stat-header-label">PROJECTS</span>
              <span className="stat-header-value">{stats.totalProjects}</span>
            </div>
          </div>

          {/* Theme Switcher Button */}
          <button 
            className="icon-btn" 
            onClick={onToggleTheme} 
            title={theme === 'light' ? "Switch to Dark Mode" : "Switch to Light Mode"}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {/* Admin Logout Helper */}
          {isAdmin && (
            <button 
              className="btn-primary" 
              style={{ padding: '6px 12px', fontSize: '10px', backgroundColor: 'var(--color-accent)' }}
              onClick={onLogoutAdmin}
            >
              LOGOUT_ADMIN
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
