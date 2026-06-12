"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '../components/Header';
import { Hero } from '../components/Hero';
import { ProjectGrid } from '../components/ProjectGrid';
import { ProjectSubmit } from '../components/ProjectSubmit';
import { BuilderProfile } from '../components/BuilderProfile';
import { AdminDashboard } from '../components/AdminDashboard';
import { Footer } from '../components/Footer';
import { BuildersList } from '../components/BuildersList';

import { Project, SystemStats, Builder } from '../types';
import { getProjects, getUpvotedProjects, getSystemStats, addProject, isAdminLoggedIn, logoutAdmin, toggleUpvote, incrementViews, saveBuilderProfile } from '../utils/storage';

export default function Home() {
  const router = useRouter();
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
    const fetchInitialState = async () => {
      try {
        const projs = await getProjects();
        setProjects(projs);
        setUpvotedIds(getUpvotedProjects());
        const systemStats = await getSystemStats();
        setStats(systemStats);
      } catch (err) {
        console.error('Failed to load initial showcase data:', err);
      }
    };
    fetchInitialState();
    setIsAdmin(isAdminLoggedIn());

    // 3. Fetch verified builder session from server (OAuth cookie)
    fetch('/api/auth/session')
      .then((r) => r.json())
      .then(async (data) => {
        if (data.builder) {
          setCurrentBuilder(data.builder);
          await saveBuilderProfile(data.builder);
        } else {
          setCurrentBuilder(null);
        }
      })
      .catch(() => setCurrentBuilder(null));

    // 4. Handle OAuth/secret redirects and refresh state
    const urlParams = new URLSearchParams(window.location.search);
    const viewParam = urlParams.get('view');
    if (viewParam) {
      setCurrentView(viewParam);
      // Clean up oauth redirect params but keep view in the URL
      const cleanUrl = new URL(window.location.href);
      cleanUrl.search = `?view=${viewParam}`;
      window.history.replaceState({}, '', cleanUrl.pathname + cleanUrl.search);
    } else {
      setCurrentView('explore');
    }

    // 5. Add popstate listener for back/forward navigation
    const handlePopState = () => {
      const currentUrlParams = new URLSearchParams(window.location.search);
      const view = currentUrlParams.get('view') || 'explore';
      setCurrentView(view);
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Sync theme updates to HTML root attribute
  const handleToggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('dac_theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  // Re-fetch project arrays and metrics from storage
  const refreshProjectData = async () => {
    try {
      const projs = await getProjects();
      setProjects(projs);
      setUpvotedIds(getUpvotedProjects());
      const systemStats = await getSystemStats();
      setStats(systemStats);
    } catch (err) {
      console.error('Failed to refresh project data:', err);
    }
    // Re-sync builder from server session
    fetch('/api/auth/session')
      .then((r) => r.json())
      .then((data) => setCurrentBuilder(data.builder || null))
      .catch(() => setCurrentBuilder(null));
  };

  const refreshAdminStatus = async () => {
    setIsAdmin(isAdminLoggedIn());
    try {
      const systemStats = await getSystemStats();
      setStats(systemStats);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdminLogout = () => {
    logoutAdmin();
    setIsAdmin(false);
    handleNavigate('explore');
  };

  const handleProjectSubmit = async (newProjectData: Omit<Project, 'id' | 'upvotes' | 'createdAt' | 'isFeatured' | 'isApproved'>) => {
    if (currentBuilder) {
      await saveBuilderProfile(currentBuilder);
    }
    await addProject(newProjectData);
    await refreshProjectData();
  };

  // Handles upvotes click directly in the grid
  const handleUpvoteProject = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleUpvote(projectId);
    await refreshProjectData();
  };

  // Navigation controller with page resetting and URL tracking
  const handleNavigate = async (view: string) => {
    setCurrentView(view);
    // Smooth scroll to top when changing views
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Update the URL to reflect the current view
    const url = new URL(window.location.href);
    if (view === 'explore') {
      url.searchParams.delete('view');
    } else {
      url.searchParams.set('view', view);
    }
    window.history.pushState({ view }, '', url.pathname + url.search);
    
    // Sync state in case admin or upvote changed
    await refreshProjectData();
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
            onSelectProject={(id) => router.push(`/project/${id}`)}
            onUpvoteProject={handleUpvoteProject}
            upvotedIds={upvotedIds}
          />
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
            onSelectProject={(id) => router.push(`/project/${id}`)}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboard
            onRefreshProjectList={refreshProjectData}
            stats={stats}
            onLogoutAdmin={handleAdminLogout}
            onRefreshStats={refreshAdminStatus}
          />
        )}

        {currentView === 'builders' && (
          <BuildersList projects={projects} />
        )}
      </main>

      {/* Footer bar */}
      <Footer />
    </div>
  );
}
