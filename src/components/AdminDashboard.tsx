import React, { useState, useEffect } from 'react';
import { Shield, Lock, Layout, Star, Database, CheckCircle, RefreshCw, Download, Trash, Award, ExternalLink } from 'lucide-react';
import { Project, Comment, SystemStats } from '../types';
import { parseMarkdown } from '../utils/markdown';
import { isAdminLoggedIn, loginAdmin, logoutAdmin, getProjects, saveProjects, getComments, saveComments, getSystemStats, resetStorageToDefaults, deleteProject, deleteComment } from '../utils/storage';

interface AdminDashboardProps {
  onRefreshProjectList: () => void;
  stats: SystemStats;
  onLogoutAdmin: () => void;
  onRefreshStats: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onRefreshProjectList,
  stats,
  onLogoutAdmin,
  onRefreshStats,
}) => {
  const [authorized, setAuthorized] = useState(false);
  const [passphrase, setPassphrase] = useState('');
  const [loginError, setLoginError] = useState(false);
  
  // Dashboard lists
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [allComments, setAllComments] = useState<Comment[]>([]);
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);

  // Load admin details
  useEffect(() => {
    const auth = isAdminLoggedIn();
    setAuthorized(auth);
    if (auth) {
      loadAdminData();
    }
  }, []);

  const loadAdminData = async () => {
    try {
      const projs = await getProjects();
      setAllProjects(projs);
      const comms = await getComments();
      setAllComments(comms);
      onRefreshStats();
    } catch (err) {
      console.error('Failed to load admin data:', err);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = loginAdmin(passphrase);
    if (success) {
      setAuthorized(true);
      setLoginError(false);
      await loadAdminData();
      onRefreshProjectList();
    } else {
      setLoginError(true);
    }
    setPassphrase('');
  };

  const handleAdminLogout = () => {
    logoutAdmin();
    setAuthorized(false);
    onLogoutAdmin();
  };

  const handleApproveProject = async (projectId: string) => {
    const projects = await getProjects();
    const index = projects.findIndex(p => p.id === projectId);
    if (index !== -1) {
      projects[index].isApproved = true;
      await saveProjects(projects);
      await loadAdminData();
      onRefreshProjectList();
    }
  };

  const handleToggleFeatured = async (projectId: string) => {
    const projects = await getProjects();
    const index = projects.findIndex(p => p.id === projectId);
    if (index !== -1) {
      projects[index].isFeatured = !projects[index].isFeatured;
      await saveProjects(projects);
      await loadAdminData();
      onRefreshProjectList();
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (window.confirm("ARE_YOU_SURE? PERMANENT_DELETION_OF_PROJECT_AND_COMMENTS.")) {
      await deleteProject(projectId);
      await loadAdminData();
      onRefreshProjectList();
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (window.confirm("REMOVE_COMMENT_PERMANENTLY?")) {
      await deleteComment(commentId);
      await loadAdminData();
    }
  };

  const handleResetData = async () => {
    if (window.confirm("RESET_TO_DEFAULTS? THIS_ERASES_ALL_SUBMISSIONS_AND_REBUILDS_MOCK_DATA.")) {
      await resetStorageToDefaults();
      await loadAdminData();
      onRefreshProjectList();
    }
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify({ projects: allProjects, comments: allComments }, null, 2);
    navigator.clipboard.writeText(dataStr);
    alert("DATABASE_JSON_COPIED_TO_CLIPBOARD!");
  };

  if (!authorized) {
    /* Admin Login Prompt */
    return (
      <div className="login-panel">
        <h3 style={{ marginBottom: '16px', fontSize: '18px', color: 'var(--text-primary)', fontFamily: 'var(--font-header)' }}>
          ADMIN_MODERATION_GATE
        </h3>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.5' }}>
          Restricted access terminal. Please verify authentication credentials to unlock auditing controls.
          <br /><strong style={{ color: 'var(--color-primary)' }}>PASSPHRASE HINT: admin123</strong>
        </p>
        
        <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">ENTER_SECURE_PASSPHRASE</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••••••"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              required
            />
          </div>

          {loginError && (
            <div style={{ color: 'var(--color-red)', fontSize: '12px', fontWeight: 'bold' }}>
              ⚠ ERROR_INVALID_PASSPHRASE_ACCESS_DENIED
            </div>
          )}

          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            DECRYPT_ADMIN_KEYS
          </button>
        </form>
      </div>
    );
  }

  // Count unmoderated items
  const pendingProjects = allProjects.filter(p => !p.isApproved).length;

  return (
    <div className="admin-dashboard-container">
      <div className="flex-between">
        <h2 style={{ fontSize: '28px', color: 'var(--text-primary)' }}>
          ADMIN_MODERATION_TERMINAL
        </h2>
        <button className="btn-secondary" onClick={handleAdminLogout} style={{ fontSize: '12px' }}>
          <Lock size={12} /> LOCK_TERMINAL
        </button>
      </div>

      {/* Admin Statistics Row */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <span className="admin-stat-label">TOTAL_DAPPS</span>
          <span className="admin-stat-value">{allProjects.length}</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-label">PENDING_APPROVAL</span>
          <span className="admin-stat-value" style={{ color: pendingProjects > 0 ? 'var(--color-primary)' : 'var(--color-green)' }}>
            {pendingProjects}
          </span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-label">COMMENTS_MODERATED</span>
          <span className="admin-stat-value">{allComments.length}</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-label">AGGREGATE_UPVOTES</span>
          <span className="admin-stat-value">{stats.totalUpvotes}</span>
        </div>
      </div>

      {/* Database utilities row */}
      <div className="admin-action-row">
        <div>
          <h4 style={{ fontFamily: 'var(--font-header)', fontSize: '14px', color: 'var(--text-primary)' }}>DATABASE_UTILITIES</h4>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Manage internal JSON storage and default setup records.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-secondary" onClick={handleExportData} style={{ fontSize: '11px', padding: '8px 14px' }}>
            <Download size={12} /> EXPORT_STATE
          </button>
          <button className="btn-primary" onClick={handleResetData} style={{ fontSize: '11px', padding: '8px 14px', backgroundColor: 'var(--color-primary)' }}>
            <RefreshCw size={12} /> RESET_TO_DEFAULTS
          </button>
        </div>
      </div>

      {/* Projects Moderation Section */}
      <div>
        <h3 className="detail-pane-title">
          <Layout size={16} /> APP_REGISTRY_MODERATION
        </h3>
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>PROJECT_NAME</th>
                <th>CATEGORY</th>
                <th>SUBMITTER_ID</th>
                <th>STAGE</th>
                <th>UPVOTES</th>
                <th>FEATURED</th>
                <th>STATUS</th>
                <th>ACTION_NODES</th>
              </tr>
            </thead>
            <tbody>
              {allProjects.map((project) => (
                <React.Fragment key={project.id}>
                  <tr 
                    style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
                    onClick={() => setExpandedProjectId(expandedProjectId === project.id ? null : project.id)}
                    className={expandedProjectId === project.id ? 'active-row' : ''}
                    onMouseEnter={(e) => {
                      if (expandedProjectId !== project.id) {
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (expandedProjectId !== project.id) {
                        e.currentTarget.style.backgroundColor = '';
                      }
                    }}
                  >
                    <td style={{ fontWeight: 'bold', color: expandedProjectId === project.id ? 'var(--color-primary)' : 'var(--text-primary)' }}>{project.name}</td>
                    <td>{project.category}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>{project.builderId}</td>
                    <td>{project.status}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>▲ {project.upvotes}</td>
                    <td style={{ color: project.isFeatured ? 'var(--color-accent)' : 'var(--text-muted)' }}>
                      {project.isFeatured ? '★ YES' : '☆ NO'}
                    </td>
                    <td>
                      <span className={`status-badge ${project.isApproved ? 'approved' : 'pending'}`}>
                        {project.isApproved ? 'APPROVED' : 'PENDING'}
                      </span>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="admin-btns-cell">
                        {!project.isApproved && (
                          <button 
                            className="admin-btn-action approve"
                            onClick={() => handleApproveProject(project.id)}
                          >
                            APPROVE
                          </button>
                        )}
                        <button 
                          className={`admin-btn-action featured ${project.isFeatured ? 'active' : ''}`}
                          onClick={() => handleToggleFeatured(project.id)}
                        >
                          FEATURE
                        </button>
                        <button 
                          className="admin-btn-action delete"
                          onClick={() => handleDeleteProject(project.id)}
                        >
                          DELETE
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedProjectId === project.id && (
                    <tr>
                      <td colSpan={8} style={{ padding: '20px', backgroundColor: 'rgba(255, 255, 255, 0.015)', borderTop: 'none', borderBottom: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '24px', textAlign: 'left' }}>
                          {/* Column 1: Details & Previews */}
                          <div>
                            <div style={{ marginBottom: '16px' }}>
                              <span style={{ fontSize: '10px', color: 'var(--color-primary)', fontWeight: 'bold', display: 'block', marginBottom: '6px', fontFamily: 'var(--font-mono)' }}>DAPP_VISUAL_ALIGNMENT_PREVIEW</span>
                              
                              <div style={{ border: '1px solid var(--border-color)', borderRadius: '4px', overflow: 'hidden', position: 'relative', height: '110px' }}>
                                <div 
                                  style={project.coverImageUrl ? { 
                                    backgroundImage: `linear-gradient(to bottom, rgba(27, 29, 17, 0.1), rgba(27, 29, 17, 0.6)), url(${project.coverImageUrl})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: `center ${project.coverImagePositionY !== undefined ? project.coverImagePositionY : 50}%`,
                                    height: '100%',
                                    width: '100%'
                                  } : {
                                    background: project.bannerColor || 'linear-gradient(135deg, #aa3011, #28426d)',
                                    height: '100%',
                                    width: '100%'
                                  }}
                                >
                                  <div style={{ position: 'absolute', bottom: '8px', left: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: '36px', height: '36px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-container)', padding: '2px', overflow: 'hidden' }}>
                                      <img 
                                        src={project.logoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${project.name}`} 
                                        alt="Logo" 
                                        style={{ 
                                          width: '100%', 
                                          height: '100%', 
                                          objectFit: 'contain', 
                                          transform: `scale(${(project.logoScale !== undefined ? project.logoScale : 100) / 100})` 
                                        }} 
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${project.name}`;
                                        }}
                                      />
                                    </div>
                                    <div style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                                      <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '13px' }}>{project.name}</div>
                                      <div style={{ color: 'var(--text-secondary)', fontSize: '10px' }}>{project.tagline}</div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div style={{ display: 'flex', gap: '16px', fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginTop: '6px' }}>
                                <span>Logo Scale: {project.logoScale !== undefined ? project.logoScale : 100}%</span>
                                <span>Cover Y: {project.coverImagePositionY !== undefined ? project.coverImagePositionY : 50}%</span>
                              </div>
                            </div>

                            <table className="specs-table" style={{ fontSize: '11px', width: '100%' }}>
                              <tbody>
                                <tr>
                                  <td className="spec-label" style={{ padding: '4px 8px' }}>PROJECT_ID</td>
                                  <td className="spec-value spec-value-mono" style={{ padding: '4px 8px' }}>{project.id}</td>
                                </tr>
                                <tr>
                                  <td className="spec-label" style={{ padding: '4px 8px' }}>SUBMITTER_ID</td>
                                  <td className="spec-value spec-value-mono" style={{ padding: '4px 8px' }}>{project.builderId}</td>
                                </tr>
                                <tr>
                                  <td className="spec-label" style={{ padding: '4px 8px' }}>TOKEN_TICKER</td>
                                  <td className="spec-value" style={{ padding: '4px 8px' }}>{project.tokenTicker || 'NONE'}</td>
                                </tr>
                                <tr>
                                  <td className="spec-label" style={{ padding: '4px 8px' }}>SMART_CONTRACT</td>
                                  <td className="spec-value spec-value-mono" style={{ padding: '4px 8px', fontSize: '10px', wordBreak: 'break-all' }}>{project.contractAddress || 'NONE'}</td>
                                </tr>
                                <tr>
                                  <td className="spec-label" style={{ padding: '4px 8px' }}>TEAM_MEMBERS</td>
                                  <td className="spec-value" style={{ padding: '4px 8px' }}>{project.team && project.team.length > 0 ? project.team.join(', ') : 'None listed'}</td>
                                </tr>
                                <tr>
                                  <td className="spec-label" style={{ padding: '4px 8px' }}>TECH_STACK</td>
                                  <td className="spec-value" style={{ padding: '4px 8px' }}>{project.techStack && project.techStack.length > 0 ? project.techStack.join(', ') : 'None'}</td>
                                </tr>
                                <tr>
                                  <td className="spec-label" style={{ padding: '4px 8px' }}>TAGS</td>
                                  <td className="spec-value" style={{ padding: '4px 8px' }}>{project.tags && project.tags.length > 0 ? project.tags.map(t => '#' + t).join(' ') : 'None'}</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>

                          {/* Column 2: Specs & Markdown Description */}
                          <div>
                            <div style={{ marginBottom: '16px' }}>
                              <span style={{ fontSize: '10px', color: 'var(--color-primary)', fontWeight: 'bold', display: 'block', marginBottom: '6px', fontFamily: 'var(--font-mono)' }}>TECHNICAL_SPECIFICATION_MEMO</span>
                              <div style={{ 
                                border: '1px solid var(--border-color)', 
                                padding: '12px', 
                                maxHeight: '180px', 
                                overflowY: 'auto', 
                                backgroundColor: 'rgba(0,0,0,0.2)',
                                fontSize: '11px',
                                lineHeight: '1.4'
                              }}>
                                <div className="markdown-render-body">
                                  {parseMarkdown(project.description)}
                                </div>
                              </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                              <div>
                                <span style={{ fontSize: '10px', color: 'var(--color-primary)', fontWeight: 'bold', display: 'block', marginBottom: '6px', fontFamily: 'var(--font-mono)' }}>SECURITY_&_AUDIT_LEDGER</span>
                                <table className="specs-table" style={{ fontSize: '11px', width: '100%' }}>
                                  <tbody>
                                    <tr>
                                      <td className="spec-label" style={{ padding: '4px 8px' }}>AUDIT STATUS</td>
                                      <td className="spec-value" style={{ padding: '4px 8px' }}>{project.securityDetails.auditStatus}</td>
                                    </tr>
                                    <tr>
                                      <td className="spec-label" style={{ padding: '4px 8px' }}>AUDITOR</td>
                                      <td className="spec-value" style={{ padding: '4px 8px' }}>{project.securityDetails.auditorName || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                      <td className="spec-label" style={{ padding: '4px 8px' }}>CLEARANCE</td>
                                      <td className="spec-value" style={{ padding: '4px 8px' }}>{project.securityDetails.securityLevel}</td>
                                    </tr>
                                    <tr>
                                      <td className="spec-label" style={{ padding: '4px 8px' }}>PQC SAFE</td>
                                      <td className="spec-value" style={{ padding: '4px 8px', color: project.securityDetails.pqcSafe ? 'var(--color-green)' : 'var(--color-primary)' }}>
                                        {project.securityDetails.pqcSafe ? 'YES' : 'NO'}
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>

                              <div>
                                <span style={{ fontSize: '10px', color: 'var(--color-primary)', fontWeight: 'bold', display: 'block', marginBottom: '6px', fontFamily: 'var(--font-mono)' }}>COMMUNICATION_GATEWAYS</span>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px' }}>
                                  {project.website ? (
                                    <a href={project.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                      🌐 LIVE_WEBSITE <ExternalLink size={10} />
                                    </a>
                                  ) : <span style={{ color: 'var(--text-muted)' }}>🌐 website: none</span>}
                                  {project.github ? (
                                    <a href={project.github} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                      📁 GITHUB_REPO <ExternalLink size={10} />
                                    </a>
                                  ) : <span style={{ color: 'var(--text-muted)' }}>📁 github: none</span>}
                                  {project.twitter ? (
                                    <a href={project.twitter} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                      𝕏 TWITTER_STREAM <ExternalLink size={10} />
                                    </a>
                                  ) : <span style={{ color: 'var(--text-muted)' }}>𝕏 twitter: none</span>}
                                  {project.docs ? (
                                    <a href={project.docs} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                      📖 DOCUMENTATION <ExternalLink size={10} />
                                    </a>
                                  ) : <span style={{ color: 'var(--text-muted)' }}>📖 docs: none</span>}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comments Moderation Section */}
      <div>
        <h3 className="detail-pane-title">
          <Star size={16} /> REVIEWS_MODERATION
        </h3>
        {allComments.length > 0 ? (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>DAPP_ID</th>
                  <th>AUTHOR</th>
                  <th>FEEDBACK</th>
                  <th>SCORE</th>
                  <th>TIMESTAMP</th>
                  <th>MODERATION</th>
                </tr>
              </thead>
              <tbody>
                {allComments.map((comment) => (
                  <tr key={comment.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>{comment.projectId}</td>
                    <td style={{ fontWeight: 'bold' }}>{comment.author}</td>
                    <td style={{ maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {comment.text}
                    </td>
                    <td style={{ color: 'var(--color-yellow)', fontWeight: 'bold' }}>{'★'.repeat(comment.rating)}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                      {new Date(comment.timestamp).toLocaleString()}
                    </td>
                    <td>
                      <button 
                        className="admin-btn-action delete"
                        onClick={() => handleDeleteComment(comment.id)}
                      >
                        DELETE
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="terminal-console" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            NO_VISITOR_COMMENTS_LOGGED_IN_DATABASE
          </div>
        )}
      </div>
    </div>
  );
};
