"use client";

import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Hero } from '../components/Hero';
import { ProjectGrid } from '../components/ProjectGrid';
import { ProjectDetail } from '../components/ProjectDetail';
import { ProjectSubmit } from '../components/ProjectSubmit';
import { BuilderProfile } from '../components/BuilderProfile';
import { AdminDashboard } from '../components/AdminDashboard';
import { Footer } from '../components/Footer';

import { Project, SystemStats, Builder } from '../types';
import { getProjects, getUpvotedProjects, getSystemStats, addProject, isAdminLoggedIn, logoutAdmin, toggleUpvote, incrementViews } from '../utils/storage';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [currentView, setCurrentView] = useState<string>('explore');
  const [projects, setProjects] = useState<Project[]>([]);
  const [upvotedIds, setUpvotedIds] = useState<string[]>([]);
  const [stats, setStats] = useState<SystemStats>({ totalProjects: 0, totalUpvotes: 0, activeBuilders: 0 });
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentBuilder, setCurrentBuilder] = useState<Builder | null>(null);

  // Mount logic to avoid hydration mismatches with LocalStorage
  useEffect(() => {
    setMounted(true);

    // 1. Theme Configuration
    const savedTheme = localStorage.getItem('dac_theme') as 'light' | 'dark';
    const initialTheme = savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);

    // 2. Fetch Initial State
    setProjects(getProjects());
    setUpvotedIds(getUpvotedProjects());
    setStats(getSystemStats());
    setIsAdmin(isAdminLoggedIn());

    // 3. Fetch verified builder session from server (OAuth cookie)
    fetch('/api/auth/session')
      .then((r) => r.json())
      .then((data) => setCurrentBuilder(data.builder || null))
      .catch(() => setCurrentBuilder(null));

    // 4. Handle OAuth return — /builder page redirects here with ?view=builder
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('view') === 'builder') {
      setCurrentView('builder');
      // Clean the URL params without a page reload
      window.history.replaceState({}, '', '/');
    }
  }, []);

  // Sync theme updates to HTML root attribute
  const handleToggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('dac_theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  // Re-fetch project arrays and metrics from storage
  const refreshProjectData = () => {
    setProjects(getProjects());
    setUpvotedIds(getUpvotedProjects());
    setStats(getSystemStats());
    // Re-sync builder from server session
    fetch('/api/auth/session')
      .then((r) => r.json())
      .then((data) => setCurrentBuilder(data.builder || null))
      .catch(() => setCurrentBuilder(null));
  };

  const refreshAdminStatus = () => {
    setIsAdmin(isAdminLoggedIn());
    setStats(getSystemStats());
  };

  const handleAdminLogout = () => {
    logoutAdmin();
    setIsAdmin(false);
    setCurrentView('explore');
  };

  const handleProjectSubmit = (newProjectData: Omit<Project, 'id' | 'upvotes' | 'createdAt' | 'isFeatured' | 'isApproved'>) => {
    addProject(newProjectData);
    refreshProjectData();
  };

  // Handles upvotes click directly in the grid
  const handleUpvoteProject = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleUpvote(projectId);
    refreshProjectData();
  };

  // Navigation controller with page resetting
  const handleNavigate = (view: string) => {
    setCurrentView(view);
    // Smooth scroll to top when changing views
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    if (view.startsWith('project_')) {
      const id = view.split('project_')[1];
      incrementViews(id);
    }
    
    // Sync state in case admin or upvote changed
    refreshProjectData();
    setIsAdmin(isAdminLoggedIn());
  };

  // Renders the splash bootloader while hydration occurs
  if (!mounted) {
    return (
      <div className="loading-screen">
        <div className="loading-grid"></div>
        <div className="loading-content">
          <div className="loading-header">
            <span>DAC_CORE_v1.0.4</span>
            <span style={{ color: '#22c55e' }}>● ACTIVE</span>
          </div>
          <div className="loading-terminal">
            <div className="loading-line">&gt; INIT SHOWCASE SYSTEM... <span className="status-ok">OK</span></div>
            <div className="loading-line">&gt; SYNC QUANTUM LEDGER... <span className="status-ok">OK</span></div>
            <div className="loading-line">&gt; DECRYPTING NET INTERFACE... <span className="status-ok">OK</span></div>
            <div className="loading-line">&gt; READY FOR BOOTSTRAP... <span className="status-orange">SUCCESS</span></div>
          </div>
        </div>
      </div>
    );
  }

  // Resolve detail views
  const isDetailView = currentView.startsWith('project_');
  const activeDetailProjectId = isDetailView ? currentView.split('project_')[1] : null;
  const activeProject = activeDetailProjectId ? projects.find((p) => p.id === activeDetailProjectId) : null;

  return (
    <div className="app-container">
      {/* Background decoration lines */}
      <div className="app-grid-overlay"></div>

      {/* Header bar */}
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        stats={stats}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        isAdmin={isAdmin}
        onLogoutAdmin={handleAdminLogout}
      />

      {/* Main Core Router Switch */}
      <main>
        {/* Hero Banner (Explore Page Exclusive) */}
        {currentView === 'explore' && <Hero onNavigate={handleNavigate} />}

        {currentView === 'explore' && (
          <ProjectGrid
            projects={projects}
            onSelectProject={(id) => handleNavigate(`project_${id}`)}
            onUpvoteProject={handleUpvoteProject}
            upvotedIds={upvotedIds}
          />
        )}

        {isDetailView && activeProject && (
          <ProjectDetail
            project={activeProject}
            onBack={() => handleNavigate('explore')}
            onRefreshProjectList={refreshProjectData}
            isAdmin={isAdmin}
            onDeleteComment={() => setStats(getSystemStats())}
          />
        )}

        {isDetailView && !activeProject && (
          <div className="terminal-console" style={{ textAlign: 'center', marginTop: '40px', padding: '30px' }}>
            <span className="terminal-accent">[ERR] PROJECT_ADDRESS_NOT_FOUND</span>
            <p style={{ marginTop: '8px', fontSize: '13px' }}>The contract record was purged or does not exist.</p>
            <button className="btn-primary" style={{ marginTop: '16px' }} onClick={() => handleNavigate('explore')}>
              RETURN_HOME
            </button>
          </div>
        )}

        {currentView === 'submit' && (
          currentBuilder ? (
            <ProjectSubmit 
              onSubmit={handleProjectSubmit} 
              onNavigate={handleNavigate}
              builderId={currentBuilder.id}
            />
          ) : (
            <div className="login-panel" style={{ maxWidth: '500px', margin: '40px auto 0 auto', textAlign: 'center' }}>
              <h3 style={{ marginBottom: '16px', fontSize: '18px', color: 'var(--text-primary)', fontFamily: 'var(--font-header)' }}>
                AUTHENTICATION_REQUIRED
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.5' }}>
                You must connect your builder node profile before submitting a project to the registry. This ensures all dApps are linked to verified builder handles.
              </p>
              <button className="btn-primary" onClick={() => handleNavigate('builder')} style={{ width: '100%', justifyContent: 'center' }}>
                GO_TO_BUILDER_WORKSPACE
              </button>
            </div>
          )
        )}

        {currentView === 'builder' && (
          <BuilderProfile
            onNavigate={handleNavigate}
            onRefreshProjectList={refreshProjectData}
            onSelectProject={(id) => handleNavigate(`project_${id}`)}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboard
            onRefreshProjectList={refreshProjectData}
            stats={stats}
            onLogoutAdmin={() => setIsAdmin(false)}
            onRefreshStats={refreshAdminStatus}
          />
        )}
      </main>

      {/* Footer bar */}
      <Footer />
    </div>
  );
}
