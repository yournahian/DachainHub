'use client';

import React, { useState, useEffect } from 'react';
import { LogOut, Code, Trash, Edit, Plus, ExternalLink, RefreshCw, AlertTriangle } from 'lucide-react';
import { Project, Builder } from '../types';
import { getProjects, deleteProject, updateProject, saveBuilderProfile } from '../utils/storage';

interface BuilderProfileProps {
  onNavigate: (view: string) => void;
  onRefreshProjectList: () => void;
  onSelectProject: (id: string) => void;
}

export const BuilderProfile: React.FC<BuilderProfileProps> = ({
  onNavigate,
  onRefreshProjectList,
  onSelectProject,
}) => {
  const [builder, setBuilder] = useState<Builder | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const [oauthNotConfigured, setOauthNotConfigured] = useState(false);

  // Profile setup states
  const [discordStep, setDiscordStep] = useState(false);
  const [discordInput, setDiscordInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [githubInput, setGithubInput] = useState('');
  const [discordSaving, setDiscordSaving] = useState(false);

  const [editLogoUrl, setEditLogoUrl] = useState('');
  const [editLogoUploading, setEditLogoUploading] = useState(false);
  const [editLogoUploadError, setEditLogoUploadError] = useState('');

  const handleEditLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_SIZE = 4.5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setEditLogoUploadError('File size exceeds the 4.5 MB limit. Please select a smaller image.');
      e.target.value = ''; // Reset input
      return;
    }

    setEditLogoUploading(true);
    setEditLogoUploadError('');

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Upload failed');
      }

      const data = await res.json();
      if (data?.url) {
        setEditLogoUrl(data.url);
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (err: any) {
      setEditLogoUploadError(err.message || 'Failed to upload logo.');
      console.error(err);
    } finally {
      setEditLogoUploading(false);
    }
  };

  const [editImageUploading, setEditImageUploading] = useState(false);
  const [editUploadError, setEditUploadError] = useState('');

  const handleEditLocalUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_SIZE = 4.5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setEditUploadError('File size exceeds the 4.5 MB limit. Please select a smaller image.');
      e.target.value = ''; // Reset input
      return;
    }

    setEditImageUploading(true);
    setEditUploadError('');

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Upload failed');
      }

      const data = await res.json();
      if (data?.url) {
        setEditCoverImageUrl(data.url);
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (err: any) {
      setEditUploadError(err.message || 'Failed to upload image to local server.');
      console.error(err);
    } finally {
      setEditImageUploading(false);
    }
  };

  const syncBuilderToLocalStorage = (b: Builder) => {
    if (typeof window === 'undefined') return;
    const key = 'dac_registered_builders';
    const data = localStorage.getItem(key);
    let builders: Builder[] = [];
    if (data) {
      try {
        builders = JSON.parse(data);
      } catch {
        builders = [];
      }
    }
    const index = builders.findIndex((existing) => existing.id === b.id);
    if (index !== -1) {
      builders[index] = { ...builders[index], ...b };
    } else {
      builders.push(b);
    }
    localStorage.setItem(key, JSON.stringify(builders));
  };

  // Builder projects list
  const [myProjects, setMyProjects] = useState<Project[]>([]);

  // Editing state
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editTagline, setEditTagline] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState<Project['status']>('Testnet');
  const [editWebsite, setEditWebsite] = useState('');
  const [editGithub, setEditGithub] = useState('');
  const [editTechStack, setEditTechStack] = useState('');
  const [editTags, setEditTags] = useState('');
  const [editCoverImageUrl, setEditCoverImageUrl] = useState('');
  const [editAuditStatus, setEditAuditStatus] = useState('');
  const [editAuditorName, setEditAuditorName] = useState('');
  const [editSecurityLevel, setEditSecurityLevel] = useState<Project['securityDetails']['securityLevel']>('Standard');
  const [editPqcSafe, setEditPqcSafe] = useState(true);
  const [editCoverImagePositionY, setEditCoverImagePositionY] = useState(50);
  const [editLogoScale, setEditLogoScale] = useState(100);

  // Load session from server on mount + on URL params (OAuth return)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authSuccess = params.get('auth_success');
    const authErrParam = params.get('auth_error');

    if (authErrParam) {
      setAuthError(decodeURIComponent(authErrParam));
      // Clean the URL
      window.history.replaceState({}, '', '/');
    }

    if (authSuccess) {
      // Clean the URL
      window.history.replaceState({}, '', '/');
    }

    fetchSession();
  }, []);

  const fetchSession = async () => {
    setSessionLoading(true);
    try {
      const res = await fetch('/api/auth/session');
      const data = await res.json();
      if (data.builder) {
        const b = data.builder as Builder;
        setBuilder(b);
        syncBuilderToLocalStorage(b);
        await saveBuilderProfile(b);
        await loadMyProjects(b.id);
        
        if (b.discordUsername) setDiscordInput(b.discordUsername);
        if (b.email) setEmailInput(b.email);
        if (b.githubUsername) setGithubInput(b.githubUsername);
        
        // Prompt for profile details if not linked yet
        if (!b.discordUsername && !b.email && !b.githubUsername) {
          setDiscordStep(true);
        }
      } else {
        setBuilder(null);
      }
    } catch {
      setBuilder(null);
    } finally {
      setSessionLoading(false);
    }
  };

  const loadMyProjects = async (builderId: string) => {
    const all = await getProjects();
    const filtered = all.filter(
      (p) =>
        p.builderId === builderId ||
        p.builderId === 'dev_current' ||
        (builderId === 'dev_1' && p.builderId === 'dev_1')
    );
    setMyProjects(filtered);
  };

  // Redirect to the real Twitter OAuth flow
  const handleSignInWithTwitter = async () => {
    setAuthError('');
    // Test if the API route is configured first
    try {
      const testRes = await fetch('/api/auth/twitter', { method: 'GET', redirect: 'manual' });
      // If status is 503 (not configured), show the error message instead of redirecting
      if (testRes.status === 503 || testRes.status === 0) {
        const data = await testRes.json().catch(() => ({}));
        if (data?.error) {
          setOauthNotConfigured(true);
          setAuthError(data.instructions || data.error);
          return;
        }
      }
    } catch {
      // If fetch failed with redirect (expected), proceed to redirect
    }

    // Trigger the real redirect to Twitter
    window.location.href = '/api/auth/twitter';
  };

  const handleSaveProfile = async () => {
    setDiscordSaving(true);
    try {
      const res = await fetch('/api/auth/discord', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          discordUsername: discordInput.trim(),
          email: emailInput.trim(),
          githubUsername: githubInput.trim(),
        }),
      });
      const data = await res.json();
      if (data.success && data.builder) {
        const b = data.builder as Builder;
        setBuilder(b);
        syncBuilderToLocalStorage(b);
        await saveBuilderProfile(b);
        setDiscordStep(false);
      }
    } catch {
      // silently fail
    } finally {
      setDiscordSaving(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setBuilder(null);
    setMyProjects([]);
    setDiscordStep(false);
    setDiscordInput('');
    setAuthError('');
    setOauthNotConfigured(false);
    onRefreshProjectList();
  };

  const handleEditClick = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProject(project);
    setEditTagline(project.tagline);
    setEditDescription(project.description);
    setEditStatus(project.status);
    setEditWebsite(project.website || '');
    setEditGithub(project.github || '');
    setEditTechStack(project.techStack?.join(', ') || '');
    setEditTags(project.tags?.join(', ') || '');
    setEditCoverImageUrl(project.coverImageUrl || '');
    setEditLogoUrl(project.logoUrl || '');
    setEditAuditStatus(project.securityDetails?.auditStatus || 'Audit Completed');
    setEditAuditorName(project.securityDetails?.auditorName || '');
    setEditSecurityLevel(project.securityDetails?.securityLevel || 'Standard');
    setEditPqcSafe(project.securityDetails?.pqcSafe ?? true);
    setEditCoverImagePositionY(project.coverImagePositionY !== undefined ? project.coverImagePositionY : 50);
    setEditLogoScale(project.logoScale !== undefined ? project.logoScale : 100);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    const updated: Project = {
      ...editingProject,
      tagline: editTagline,
      description: editDescription,
      status: editStatus,
      website: editWebsite,
      github: editGithub,
      techStack: editTechStack ? editTechStack.split(',').map((t) => t.trim()).filter(Boolean) : [],
      tags: editTags ? editTags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      coverImageUrl: editCoverImageUrl || undefined,
      logoUrl: editLogoUrl,
      coverImagePositionY: editCoverImagePositionY,
      logoScale: editLogoScale,
      securityDetails: {
        auditStatus: editAuditStatus || 'Self Audited',
        auditorName: editAuditorName || undefined,
        securityLevel: editSecurityLevel,
        pqcSafe: editPqcSafe,
      },
    };

    await updateProject(updated);
    onRefreshProjectList();
    if (builder) await loadMyProjects(builder.id);
    setEditingProject(null);
  };

  const handleDeleteClick = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('ARE_YOU_SURE? THIS_RECORD_WILL_BE_ERASED_FROM_THE_LEDGER.')) {
      await deleteProject(projectId);
      onRefreshProjectList();
      if (builder) await loadMyProjects(builder.id);
    }
  };

  const totalVotesEarned = myProjects.reduce((sum, p) => sum + p.upvotes, 0);

  // ─── Loading Spinner ───────────────────────────────────────────────────────
  if (sessionLoading) {
    return (
      <div className="login-panel" style={{ textAlign: 'center', padding: '40px 20px' }}>
        <RefreshCw
          size={24}
          style={{
            color: 'var(--color-primary)',
            marginBottom: '12px',
            animation: 'spin 1s linear infinite',
          }}
        />
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
          VERIFYING SESSION NODE...
        </p>
      </div>
    );
  }

  // ─── Complete Builder Profile Step (after X OAuth) ────────────────────────
  if (builder && discordStep) {
    return (
      <div className="login-panel">
        {/* Builder identity confirmed banner */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            background: 'rgba(34,197,94,0.08)',
            border: '1px solid rgba(34,197,94,0.3)',
            borderRadius: '6px',
            marginBottom: '20px',
          }}
        >
          <img
            src={builder.avatarUrl}
            alt="X profile"
            style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{builder.name}</div>
            <div style={{ fontSize: '11px', color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}>
              ✓ Verified via X — {builder.handle}
            </div>
          </div>
        </div>

        <h3 style={{ marginBottom: '8px', fontSize: '16px', color: 'var(--text-primary)', fontFamily: 'var(--font-header)' }}>
          COMPLETE BUILDER PROFILE (OPTIONAL)
        </h3>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.6' }}>
          Add your details so the DAC community and other developers can connect with you. You can skip this and add them later.
        </p>

        <div className="form-group">
          <label className="form-label">DISCORD USERNAME</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. dac_builder"
            value={discordInput}
            onChange={(e) => setDiscordInput(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">EMAIL ADDRESS</label>
          <input
            type="email"
            className="form-input"
            placeholder="e.g. builder@dachain.tech"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">GITHUB USERNAME</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. dac-developer"
            value={githubInput}
            onChange={(e) => setGithubInput(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
          <button
            type="button"
            className="btn-primary"
            style={{ flexGrow: 1, justifyContent: 'center' }}
            onClick={handleSaveProfile}
            disabled={discordSaving}
          >
            {discordSaving ? 'SAVING...' : 'SAVE_PROFILE'}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setDiscordStep(false)}
          >
            SKIP
          </button>
        </div>
      </div>
    );
  }

  // ─── Login Gate ────────────────────────────────────────────────────────────
  if (!builder) {
    return (
      <div className="login-panel">
        <h3
          style={{
            marginBottom: '8px',
            fontSize: '18px',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-header)',
          }}
        >
          BUILDER_WORKSPACE_GATE
        </h3>
        <p
          style={{
            fontSize: '12px',
            color: 'var(--text-secondary)',
            marginBottom: '28px',
            lineHeight: '1.6',
          }}
        >
          Sign in with your Twitter/X account to verify your identity. We fetch your real name and profile picture directly from X — no fake handles.
        </p>

        {/* Auth Error Alert */}
        {authError && (
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.4)',
              borderRadius: '6px',
              marginBottom: '20px',
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start',
            }}
          >
            <AlertTriangle size={16} style={{ color: 'var(--color-red)', flexShrink: 0, marginTop: '1px' }} />
            <div>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--color-red)',
                  fontFamily: 'var(--font-mono)',
                  marginBottom: '4px',
                }}
              >
                AUTH_ERROR
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{authError}</div>
              {oauthNotConfigured && (
                <a
                  href="https://developer.twitter.com/en/portal/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    marginTop: '8px',
                    fontSize: '11px',
                    color: 'var(--color-primary)',
                    textDecoration: 'none',
                  }}
                >
                  Open Twitter Developer Portal <ExternalLink size={10} />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Sign In with Twitter/X Button */}
        <button
          type="button"
          onClick={handleSignInWithTwitter}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            padding: '14px 20px',
            backgroundColor: '#000000',
            color: '#ffffff',
            border: '1px solid #2f3336',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 700,
            fontFamily: 'var(--font-header)',
            letterSpacing: '0.05em',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            marginBottom: '16px',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1d1d1d';
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.4)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#000000';
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
          }}
        >
          {/* X Logo */}
          <svg style={{ width: '18px', height: '18px', fill: 'currentColor', flexShrink: 0 }} viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          SIGN IN WITH X (TWITTER)
        </button>

        {/* Security notice */}
        <div
          style={{
            padding: '10px 14px',
            background: 'rgba(var(--color-primary-rgb, 91,200,171), 0.06)',
            border: '1px solid rgba(var(--color-primary-rgb, 91,200,171), 0.2)',
            borderRadius: '6px',
            fontSize: '11px',
            color: 'var(--text-muted)',
            lineHeight: '1.6',
            textAlign: 'center',
            marginBottom: '20px'
          }}
        >
          🔒 You will be redirected to <strong>x.com</strong> to authorize. We never see your password. Only your public profile (name, handle, avatar) is read.
        </div>

        {/* Development Mode Bypass */}
        <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '16px' }}>
          <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', display: 'block', marginBottom: '8px', textAlign: 'center' }}>
            DEVELOPMENT_MODE_BYPASS
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn-secondary"
              style={{ flexGrow: 1, fontSize: '11px', padding: '8px 12px', justifyContent: 'center' }}
              onClick={async () => {
                const mockRes = await fetch('/api/auth/mock-login', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ builderId: 'dev_1' }),
                });
                const data = await mockRes.json();
                if (data.builder) {
                  await fetchSession();
                }
              }}
            >
              MOCK_LOGIN (ALISTAIR)
            </button>
            <button
              type="button"
              className="btn-secondary"
              style={{ flexGrow: 1, fontSize: '11px', padding: '8px 12px', justifyContent: 'center' }}
              onClick={async () => {
                const mockRes = await fetch('/api/auth/mock-login', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ builderId: 'dev_2' }),
                });
                const data = await mockRes.json();
                if (data.builder) {
                  await fetchSession();
                }
              }}
            >
              MOCK_LOGIN (ELENA)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Builder Dashboard ─────────────────────────────────────────────────────
  return (
    <div className="builder-hub-panel">
      {/* Builder Profile Dashboard Banner */}
      <div className="builder-header">
        <div className="builder-profile-info">
          <div className="builder-avatar">
            <img src={builder.avatarUrl} alt="Builder Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div className="builder-text-details">
            <h3>{builder.name}</h3>
            <p style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '11px' }}>
              <span style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <svg style={{ width: '11px', height: '11px', fill: 'currentColor' }} viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                {builder.handle}
                <span style={{ color: 'rgba(34,197,94,0.9)', fontSize: '9px', fontWeight: 700 }}>✓ VERIFIED</span>
              </span>
              {builder.discordUsername && (
                <span style={{ color: 'var(--text-muted)' }}>
                  <span style={{ color: '#5865F2' }}>⬡ </span>Discord: {builder.discordUsername}
                </span>
              )}
              {builder.email && (
                <span style={{ color: 'var(--text-muted)' }}>
                  <span style={{ color: 'var(--color-primary)' }}>✉ </span>Email: {builder.email}
                </span>
              )}
              {builder.githubUsername && (
                <span style={{ color: 'var(--text-muted)' }}>
                  <span style={{ color: '#ffffff' }}>🗎 </span>GitHub: @{builder.githubUsername}
                </span>
              )}
              {(!builder.discordUsername || !builder.email || !builder.githubUsername) ? (
                <button
                  onClick={() => setDiscordStep(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-primary)',
                    fontSize: '10px',
                    cursor: 'pointer',
                    padding: 0,
                    textAlign: 'left',
                    fontFamily: 'var(--font-mono)',
                    marginTop: '4px',
                  }}
                >
                  + Add Discord, Email, or GitHub
                </button>
              ) : (
                <button
                  onClick={() => setDiscordStep(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    fontSize: '10px',
                    cursor: 'pointer',
                    padding: 0,
                    textAlign: 'left',
                    fontFamily: 'var(--font-mono)',
                    marginTop: '4px',
                  }}
                >
                  ⚙ Edit Profile Details
                </button>
              )}
            </p>
          </div>
        </div>

        {/* Builder Statistics Dashboard */}
        <div style={{ display: 'flex', gap: '24px' }}>
          <div className="stat-header-item">
            <span className="stat-header-label">DEPLOYED_APPS</span>
            <span className="stat-header-value" style={{ fontSize: '20px' }}>
              {myProjects.length}
            </span>
          </div>
          <div className="stat-header-item">
            <span className="stat-header-label">AGGREGATE_UPVOTES</span>
            <span className="stat-header-value" style={{ fontSize: '20px' }}>
              {totalVotesEarned}
            </span>
          </div>
        </div>

        <button className="btn-secondary" onClick={handleLogout} style={{ padding: '8px 16px', fontSize: '11px' }}>
          <LogOut size={12} /> DISCONNECT
        </button>
      </div>

      {/* Main Workspace split */}
      {editingProject ? (
        /* Project Editing Pane */
        <form className="form-panel" onSubmit={handleEditSubmit} style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
          <div className="form-section-title">EDITING: {editingProject.name.toUpperCase()}</div>

          <div className="form-group">
            <label className="form-label">TAGLINE / SHORT SLOGAN</label>
            <input
              type="text"
              className="form-input"
              value={editTagline}
              onChange={(e) => setEditTagline(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">STATUS</label>
            <select
              className="select-control"
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value as Project['status'])}
              style={{ width: '100%', height: '40px', padding: '0 10px' }}
            >
              <option value="Live">Mainnet Live</option>
              <option value="Beta">Beta Testing</option>
              <option value="Testnet">Testnet Active</option>
              <option value="Concept">Concept / Idea</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">WEBSITE GATEWAY</label>
            <input type="text" className="form-input" value={editWebsite} onChange={(e) => setEditWebsite(e.target.value)} />
          </div>

          <div className="form-row-double">
            <div className="form-group">
              <label className="form-label">GITHUB CODEBASE</label>
              <input type="text" className="form-input" value={editGithub} onChange={(e) => setEditGithub(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">PROJECT_LOGO (ICON)</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. /uploads/logo.png or external URL"
                  value={editLogoUrl}
                  onChange={(e) => setEditLogoUrl(e.target.value)}
                  style={{ flexGrow: 1 }}
                />
                <input
                  type="file"
                  accept="image/*"
                  id="edit-logo-uploader"
                  style={{ display: 'none' }}
                  onChange={handleEditLogoUpload}
                />
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => document.getElementById('edit-logo-uploader')?.click()}
                  disabled={editLogoUploading}
                  style={{ padding: '0 12px', fontSize: '11px', whiteSpace: 'nowrap' }}
                >
                  {editLogoUploading ? 'UPLOADING...' : 'UPLOAD ICON'}
                </button>
              </div>
              {editLogoUploadError && <span style={{ color: 'var(--color-red)', fontSize: '10px', marginTop: '4px', display: 'block' }}>{editLogoUploadError}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">PROJECT_THUMBNAIL (COVER IMAGE)</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="form-input"
                value={editCoverImageUrl}
                onChange={(e) => setEditCoverImageUrl(e.target.value)}
                style={{ flexGrow: 1 }}
              />
              <input
                type="file"
                accept="image/*"
                id="edit-img-uploader"
                style={{ display: 'none' }}
                onChange={handleEditLocalUpload}
              />
              <button
                type="button"
                className="btn-secondary"
                onClick={() => document.getElementById('edit-img-uploader')?.click()}
                disabled={editImageUploading}
                style={{ padding: '0 12px', fontSize: '11px', whiteSpace: 'nowrap' }}
              >
                {editImageUploading ? 'UPLOADING...' : 'UPLOAD IMAGE'}
              </button>
            </div>
            {editUploadError && <span style={{ color: 'var(--color-red)', fontSize: '10px', marginTop: '4px', display: 'block' }}>{editUploadError}</span>}
          </div>

          <div className="form-row-double" style={{ marginTop: '4px', marginBottom: '16px' }}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>LOGO_ZOOM_SCALE ({editLogoScale}%)</span>
                <button type="button" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '10px', cursor: 'pointer', padding: 0, fontFamily: 'var(--font-mono)' }} onClick={() => setEditLogoScale(100)}>RESET</button>
              </label>
              <input 
                type="range" 
                min="50" 
                max="150" 
                value={editLogoScale} 
                onChange={(e) => setEditLogoScale(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--color-primary)', cursor: 'pointer', height: '38px' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>COVER_POSITION_Y ({editCoverImagePositionY}%)</span>
                <button type="button" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '10px', cursor: 'pointer', padding: 0, fontFamily: 'var(--font-mono)' }} onClick={() => setEditCoverImagePositionY(50)}>RESET</button>
              </label>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={editCoverImagePositionY} 
                onChange={(e) => setEditCoverImagePositionY(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--color-primary)', cursor: 'pointer', height: '38px' }}
              />
            </div>
          </div>

          <div className="form-row-double">
            <div className="form-group">
              <label className="form-label">TECH_STACK (COMMA-SEPARATED)</label>
              <input type="text" className="form-input" value={editTechStack} onChange={(e) => setEditTechStack(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">TAGS (COMMA-SEPARATED)</label>
              <input type="text" className="form-input" value={editTags} onChange={(e) => setEditTags(e.target.value)} />
            </div>
          </div>

          <div className="form-section-title">SECURITY_&_AUDIT</div>

          <div className="form-row-double">
            <div className="form-group">
              <label className="form-label">AUDIT_STATUS</label>
              <input type="text" className="form-input" value={editAuditStatus} onChange={(e) => setEditAuditStatus(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">AUDITOR_NAME</label>
              <input type="text" className="form-input" value={editAuditorName} onChange={(e) => setEditAuditorName(e.target.value)} />
            </div>
          </div>

          <div className="form-row-double">
            <div className="form-group">
              <label className="form-label">SECURITY_CLEARANCE_LEVEL</label>
              <select
                className="select-control"
                value={editSecurityLevel}
                onChange={(e) => setEditSecurityLevel(e.target.value as Project['securityDetails']['securityLevel'])}
                style={{ width: '100%', height: '40px', padding: '0 10px' }}
              >
                <option value="High">High Security</option>
                <option value="Standard">Standard Security</option>
                <option value="Experimental">Experimental</option>
              </select>
            </div>
            <div className="form-group" style={{ justifyContent: 'center' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '16px' }}>
                <input
                  type="checkbox"
                  checked={editPqcSafe}
                  onChange={(e) => setEditPqcSafe(e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--color-primary)' }}
                />
                <span>POST-QUANTUM CRYPTO ACTIVE</span>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">TECHNICAL DESCRIPTION (MARKDOWN)</label>
            <textarea
              className="form-textarea"
              style={{ minHeight: '120px' }}
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
            <button type="submit" className="btn-primary">
              SAVE_MEMO_CHANGES
            </button>
            <button type="button" className="btn-secondary" onClick={() => setEditingProject(null)}>
              CANCEL
            </button>
          </div>
        </form>
      ) : (
        /* Builder Projects List Dashboard */
        <div>
          <div className="flex-between" style={{ marginBottom: '20px' }}>
            <h3 style={{ fontFamily: 'var(--font-header)', color: 'var(--text-primary)', fontSize: '18px' }}>
              PROJECTS_REGISTRY_UNDER_YOUR_CONTROL
            </h3>
            <button className="btn-primary" onClick={() => onNavigate('submit')}>
              <Plus size={14} /> NEW_DAPP
            </button>
          </div>

          {myProjects.length > 0 ? (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>DAPP_NAME</th>
                    <th>CATEGORY</th>
                    <th>STAGE</th>
                    <th>UPVOTES</th>
                    <th>STATUS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {myProjects.map((project) => (
                    <tr key={project.id} onClick={() => onSelectProject(project.id)} style={{ cursor: 'pointer' }}>
                      <td style={{ fontWeight: 'bold' }}>{project.name}</td>
                      <td>{project.category}</td>
                      <td>{project.status}</td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>▲ {project.upvotes}</td>
                      <td>
                        <span className={`status-badge ${project.isApproved ? 'approved' : 'pending'}`}>
                          {project.isApproved ? 'APPROVED' : 'AWAITING_MODERATION'}
                        </span>
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className="admin-btns-cell">
                          <button
                            className="admin-btn-action featured active"
                            onClick={(e) => handleEditClick(project, e)}
                            title="Edit Project Details"
                          >
                            <Edit size={10} style={{ display: 'inline', marginRight: '4px' }} /> EDIT
                          </button>
                          <button
                            className="admin-btn-action delete"
                            onClick={(e) => handleDeleteClick(project.id, e)}
                            title="Erase from Ledger"
                          >
                            <Trash size={10} style={{ display: 'inline', marginRight: '4px' }} /> ERASE
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="terminal-console" style={{ padding: '30px', textAlign: 'center' }}>
              <Code size={24} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
              <h4>NO_PROJECTS_REGISTERED</h4>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                You have not registered any dApps with this builder profile yet. Click &quot;NEW_DAPP&quot; to submit one.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
