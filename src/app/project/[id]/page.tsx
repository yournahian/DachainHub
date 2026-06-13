'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Header } from '../../../components/Header';
import { ProjectDetail } from '../../../components/ProjectDetail';
import { Footer } from '../../../components/Footer';
import { Project, SystemStats, Builder } from '../../../types';
import {
  getProjects,
  getSystemStats,
  isAdminLoggedIn,
  logoutAdmin,
  incrementViews,
  saveBuilderProfile,
} from '../../../utils/storage';

export default function ProjectPage() {
  const router = useRouter();
  const params = useParams();
  const idParam = params?.id as string;
  const id = idParam ? idParam.split('-')[0] : '';

  const [mounted, setMounted] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState<SystemStats>({ totalProjects: 0, totalUpvotes: 0, activeBuilders: 0 });
  const [currentBuilder, setCurrentBuilder] = useState<Builder | null>(null);

  // Dynamic SEO & OpenGraph metadata update
  useEffect(() => {
    if (project) {
      document.title = `${project.name} | DachainHub`;
      
      // Update meta description
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', project.tagline || project.description.slice(0, 150));
      
      // Update OpenGraph Title
      let ogTitle = document.querySelector('meta[property="og:title"]');
      if (!ogTitle) {
        ogTitle = document.createElement('meta');
        ogTitle.setAttribute('property', 'og:title');
        document.head.appendChild(ogTitle);
      }
      ogTitle.setAttribute('content', `${project.name} - Quantum-Secure dApp`);

      // Update OpenGraph Description
      let ogDesc = document.querySelector('meta[property="og:description"]');
      if (!ogDesc) {
        ogDesc = document.createElement('meta');
        ogDesc.setAttribute('property', 'og:description');
        document.head.appendChild(ogDesc);
      }
      ogDesc.setAttribute('content', project.tagline);

      // Update OpenGraph Image
      let ogImage = document.querySelector('meta[property="og:image"]');
      if (!ogImage) {
        ogImage = document.createElement('meta');
        ogImage.setAttribute('property', 'og:image');
        document.head.appendChild(ogImage);
      }
      ogImage.setAttribute('content', project.coverImageUrl || project.logoUrl || '/brand/Lookup-DarkMode.svg');
    }
  }, [project]);

  useEffect(() => {
    setMounted(true);

    // 1. Theme
    const savedTheme = localStorage.getItem('dac_theme') as 'light' | 'dark';
    const initialTheme = savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);

    // 2. Admin state
    setIsAdmin(isAdminLoggedIn());

    // 3. Load project + stats
    const loadData = async () => {
      try {
        const [projects, systemStats] = await Promise.all([getProjects(), getSystemStats()]);
        setStats(systemStats);
        const found = projects.find((p) => p.id === id);
        if (found) {
          setProject(found);
          await incrementViews(id);
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error('[ProjectPage] Failed to load project:', err);
        setNotFound(true);
      }
    };
    loadData();

    // 4. Builder session
    fetch('/api/auth/session')
      .then((r) => r.json())
      .then(async (data) => {
        if (data.builder) {
          setCurrentBuilder(data.builder);
          await saveBuilderProfile(data.builder);
        }
      })
      .catch(() => {});
  }, [id]);

  const handleToggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('dac_theme', next);
    document.documentElement.setAttribute('data-theme', next);
  };

  const handleAdminLogout = () => {
    logoutAdmin();
    setIsAdmin(false);
  };

  const refreshProjectData = async () => {
    try {
      const projects = await getProjects();
      const found = projects.find((p) => p.id === id);
      if (found) setProject(found);
      const systemStats = await getSystemStats();
      setStats(systemStats);
    } catch {}
  };

  // Loading splash
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
            <div className="loading-line">&gt; LOADING PROJECT CONTRACT... <span className="status-ok">OK</span></div>
            <div className="loading-line">&gt; VERIFYING RECORD... <span className="status-orange">WAIT</span></div>
          </div>
        </div>
      </div>
    );
  }

  // Project not found
  if (notFound) {
    return (
      <div className="app-container">
        <div className="app-grid-overlay"></div>
        <Header
          currentView="explore"
          onNavigate={(view) => router.push(view === 'explore' ? '/' : `/?view=${view}`)}
          stats={stats}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          isAdmin={isAdmin}
          onLogoutAdmin={handleAdminLogout}
        />
        <main>
          <div className="terminal-console" style={{ textAlign: 'center', marginTop: '80px', padding: '40px' }}>
            <span className="terminal-accent">[ERR] PROJECT_ADDRESS_NOT_FOUND</span>
            <p style={{ marginTop: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              The contract record was purged or does not exist on this chain.
            </p>
            <button className="btn-primary" style={{ marginTop: '20px' }} onClick={() => router.push('/')}>
              RETURN_HOME
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="app-container">
      <div className="app-grid-overlay"></div>
      <Header
        currentView="explore"
        onNavigate={(view) => router.push(view === 'explore' ? '/' : `/?view=${view}`)}
        stats={stats}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        isAdmin={isAdmin}
        onLogoutAdmin={handleAdminLogout}
      />
      <main>
        <ProjectDetail
          project={project}
          onBack={() => router.back()}
          onRefreshProjectList={refreshProjectData}
          isAdmin={isAdmin}
          onDeleteComment={async () => {
            const s = await getSystemStats();
            setStats(s);
          }}
        />
      </main>
      <Footer />
    </div>
  );
}
