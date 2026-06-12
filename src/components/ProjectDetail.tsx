import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowUp, Globe, Github, Twitter, BookOpen, User, Star, Shield, Clipboard, ClipboardCheck, Trash2, Eye, ThumbsUp } from 'lucide-react';
import { Project, Comment, Builder } from '../types';
import { parseMarkdown } from '../utils/markdown';
import { getCommentsForProject, addComment, getUpvotedProjects, toggleUpvote } from '../utils/storage';

interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
  onRefreshProjectList: () => void;
  isAdmin: boolean;
  onDeleteComment: (commentId: string) => void;
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({
  project,
  onBack,
  onRefreshProjectList,
  isAdmin,
  onDeleteComment,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [authorName, setAuthorName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [rating, setRating] = useState(5);
  const [copied, setCopied] = useState(false);
  const [upvotes, setUpvotes] = useState(project.upvotes);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [projectBuilder, setProjectBuilder] = useState<Builder | null>(null);

  // Load comments, upvote status, and builder details
  useEffect(() => {
    setComments(getCommentsForProject(project.id));
    const upvotedList = getUpvotedProjects();
    setHasUpvoted(upvotedList.includes(project.id));

    if (typeof window !== 'undefined') {
      const registeredBuildersStr = localStorage.getItem('dac_registered_builders');
      if (registeredBuildersStr) {
        try {
          const builders = JSON.parse(registeredBuildersStr) as Builder[];
          const found = builders.find(b => b.id === project.builderId);
          if (found) {
            setProjectBuilder(found);
          } else {
            setProjectBuilder(null);
          }
        } catch {
          setProjectBuilder(null);
        }
      }
    }
  }, [project.id, project.builderId]);

  const handleCopyContract = () => {
    if (project.contractAddress) {
      navigator.clipboard.writeText(project.contractAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleUpvoteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const result = toggleUpvote(project.id);
    if (result.success) {
      setUpvotes(result.upvotes);
      setHasUpvoted(result.upvoted);
      onRefreshProjectList();
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    addComment(project.id, authorName.trim(), commentText.trim(), rating);
    
    // Refresh comments list
    setComments(getCommentsForProject(project.id));
    
    // Clear form
    setAuthorName('');
    setCommentText('');
    setRating(5);
  };

  const handleCommentDeleteClick = (commentId: string) => {
    onDeleteComment(commentId);
    setComments(prev => prev.filter(c => c.id !== commentId));
  };

  const renderStars = (count: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star 
          key={i} 
          size={14} 
          className={i <= count ? "star-filled" : "star-empty"}
          fill={i <= count ? "var(--color-yellow)" : "none"} 
        />
      );
    }
    return stars;
  };

  return (
    <div className="detail-view-container">
      {/* Back button */}
      <span className="back-link" onClick={onBack}>
        <ArrowLeft size={16} /> BACK_TO_REGISTRY
      </span>

      {/* Hero Banner Area */}
      <div className="project-detail-hero">
        <div 
          className="detail-banner"
          style={project.coverImageUrl ? { 
            backgroundImage: `linear-gradient(to bottom, rgba(27, 29, 17, 0.1), rgba(27, 29, 17, 0.5)), url(${project.coverImageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: `center ${project.coverImagePositionY !== undefined ? project.coverImagePositionY : 50}%`,
          } : {
            background: project.bannerColor || 'linear-gradient(135deg, #aa3011, #28426d)',
          }}
        ></div>
        
        <div className="detail-header-panel">
          <div className="detail-header-left">
            <div className="detail-logo-container" style={{ overflow: 'hidden' }}>
              <img 
                src={project.logoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${project.name}`} 
                alt={`${project.name} Logo`} 
                className="detail-logo"
                style={{
                  transform: `scale(${(project.logoScale !== undefined ? project.logoScale : 100) / 100})`,
                  transition: 'transform 0.1s ease-out'
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${project.name}`;
                }}
              />
            </div>
            
            <div className="detail-title-info">
              <h2 className="detail-title">{project.name}</h2>
              <p className="detail-tagline">{project.tagline}</p>
              
              {/* Project Statistics Bar */}
              <div style={{ display: 'flex', gap: '16px', marginTop: '12px', flexWrap: 'wrap' }}>
                <span style={{ color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                  <Eye size={12} /> {project.views || 0} VIEWS
                </span>
                <span style={{ color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                  <ThumbsUp size={12} /> {upvotes} LIKES
                </span>
                {project.githubStars !== undefined && (
                  <span style={{ color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                    <Star size={12} fill="var(--text-secondary)" /> {project.githubStars} GH_STARS
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="detail-header-actions">
            {/* Upvote Button */}
            <button 
              className={`upvotes-counter ${hasUpvoted ? 'voted' : ''}`}
              onClick={handleUpvoteClick}
              style={{ fontSize: '15px', padding: '8px 16px', gap: '10px' }}
            >
              <ArrowUp size={18} strokeWidth={hasUpvoted ? 3 : 2} />
              <span>{upvotes} UPVOTES</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid split */}
      <div className="detail-grid">
        {/* Left Side: Markdown features description and Comments */}
        <div className="detail-main-content">
          {/* Markdown description */}
          <div className="detail-pane">
            <h3 className="detail-pane-title">
              <BookOpen size={16} /> PROJECT_SPECIFICATION_MEMO
            </h3>
            <div className="markdown-render-body">
              {parseMarkdown(project.description)}
            </div>
          </div>

          {/* Comments and Ratings pane */}
          <div className="detail-pane">
            <h3 className="detail-pane-title">
              <Star size={16} /> VISITOR_AUDITS_AND_FEEDBACK ({comments.length})
            </h3>
            
            <div className="comments-container">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className="comment-card">
                    <div className="comment-header">
                      <span className="comment-author">{comment.author}</span>
                      <span className="comment-date">
                        {new Date(comment.timestamp).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="comment-stars">
                      {renderStars(comment.rating)}
                    </div>
                    <p className="comment-text">{comment.text}</p>
                    
                    {/* Admin Delete Action */}
                    {isAdmin && (
                      <button 
                        className="comment-moderator-delete"
                        onClick={() => handleCommentDeleteClick(comment.id)}
                      >
                        <Trash2 size={10} style={{ display: 'inline', marginRight: '4px' }} />
                        DELETE_SPAN
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '13px' }}>
                  NO_AUDITS_SUBMITTED // BE THE FIRST TO LEAVE FEEDBACK BELOW
                </div>
              )}

              {/* Add Comment Form */}
              <form className="comment-form" onSubmit={handleCommentSubmit}>
                <h4 style={{ fontFamily: 'var(--font-header)', fontSize: '13px', color: 'var(--text-primary)', marginBottom: '8px' }}>
                  SUBMIT_NEW_AUDIT_REPORT
                </h4>
                
                <div className="form-row-double">
                  <div className="form-group">
                    <label className="form-label">AUDITOR_HANDLE</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. SolidityChef"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">RATING_SCORE</label>
                    <div className="rating-selector">
                      {[1, 2, 3, 4, 5].map((starIdx) => (
                        <button
                          key={starIdx}
                          type="button"
                          className={`star-rating-btn ${starIdx <= rating ? 'active' : ''}`}
                          onClick={() => setRating(starIdx)}
                        >
                          ★
                        </button>
                      ))}
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '6px', fontFamily: 'var(--font-mono)' }}>
                        {rating} / 5 STARS
                      </span>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">AUDIT_REPORT_SUMMARY</label>
                  <textarea 
                    className="form-textarea" 
                    placeholder="Provide technical evaluation, code observations, or general user feedback..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    required
                  ></textarea>
                </div>

                <button type="submit" className="btn-primary" style={{ width: 'fit-content' }}>
                  SUBMIT_REPORT
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Right Side: Specifications and Team Metadata */}
        <div className="detail-sidebar">
          <div className="preview-sticky-panel">
            {/* Specs Pane */}
            <div className="detail-pane">
              <h3 className="detail-pane-title">
                <BookOpen size={16} /> PROJECT_DETAILS
              </h3>
              <table className="specs-table">
                <tbody>
                  <tr>
                    <td className="spec-label">REGISTRY_STATUS</td>
                    <td className="spec-value">
                      <span className={`status-badge approved`} style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}>
                        {project.isFeatured ? 'FEATURED_NODES' : 'ACTIVE_REGISTRY'}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="spec-label">APP_CATEGORY</td>
                    <td className="spec-value">{project.category}</td>
                  </tr>
                  <tr>
                    <td className="spec-label">DEVELOPMENT_STAGE</td>
                    <td className="spec-value">{project.status}</td>
                  </tr>
                  {project.tokenTicker && (
                    <tr>
                      <td className="spec-label">TOKEN_TICKER</td>
                      <td className="spec-value" style={{ fontWeight: 'bold', color: 'var(--color-accent)' }}>
                        {project.tokenTicker}
                      </td>
                    </tr>
                  )}
                  {project.contractAddress && (
                    <tr>
                      <td className="spec-label" style={{ verticalAlign: 'middle' }}>SMART_CONTRACT</td>
                      <td className="spec-value">
                        <div className="spec-value-mono">
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100px' }}>
                            {project.contractAddress}
                          </span>
                          <button 
                            type="button" 
                            className="copy-btn"
                            onClick={handleCopyContract}
                          >
                            {copied ? <span style={{ color: 'var(--color-green)' }}>COPIED</span> : 'COPY'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td className="spec-label">SUBMITTED_DATE</td>
                    <td className="spec-value">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                </tbody>
              </table>

              {project.techStack && project.techStack.length > 0 && (
                <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                  <h4 style={{ fontFamily: 'var(--font-header)', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                    TECH_STACK
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {project.techStack.map((tech) => (
                      <span key={tech} style={{ fontSize: '10px', padding: '3px 8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-container)', color: 'var(--text-secondary)' }}>
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {project.tags && project.tags.length > 0 && (
                <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                  <h4 style={{ fontFamily: 'var(--font-header)', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                    TAGS
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {project.tags.map((tag) => (
                      <span key={tag} style={{ fontSize: '10px', padding: '3px 8px', border: '1px solid var(--color-primary)', backgroundColor: 'rgba(170, 48, 17, 0.05)', color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Security & Verification Pane */}
            <div className="detail-pane">
              <h3 className="detail-pane-title">
                <Shield size={16} /> SECURITY_&_VERIFICATION
              </h3>
              <table className="specs-table">
                <tbody>
                  <tr>
                    <td className="spec-label">AUDIT_STATUS</td>
                    <td className="spec-value">
                      <span className={`status-badge ${project.securityDetails?.auditStatus?.toLowerCase().includes('completed') ? 'approved' : 'pending'}`}>
                        {project.securityDetails?.auditStatus || 'UNVERIFIED'}
                      </span>
                    </td>
                  </tr>
                  {project.securityDetails?.auditorName && (
                    <tr>
                      <td className="spec-label">AUDITED_BY</td>
                      <td className="spec-value" style={{ fontWeight: 'bold' }}>
                        {project.securityDetails.auditorName}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td className="spec-label">CLEARANCE_LEVEL</td>
                    <td className="spec-value" style={{ 
                      color: project.securityDetails?.securityLevel === 'High' ? 'var(--color-green)' :
                             project.securityDetails?.securityLevel === 'Standard' ? 'var(--color-accent)' : 'var(--color-primary)',
                      fontWeight: 'bold'
                    }}>
                      {project.securityDetails?.securityLevel || 'Standard'}
                    </td>
                  </tr>
                  <tr>
                    <td className="spec-label">PQC_SECURITY</td>
                    <td className="spec-value">
                      <span style={{ 
                        color: project.securityDetails?.pqcSafe ? 'var(--color-green)' : 'var(--text-muted)',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        {project.securityDetails?.pqcSafe ? '● QUANTUM_SAFE' : '○ CLASSICAL'}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="spec-label">VERIFIED</td>
                    <td className="spec-value">
                      <span style={{ 
                        color: project.isApproved ? 'var(--color-green)' : 'var(--color-primary)',
                        fontWeight: 'bold'
                      }}>
                        {project.isApproved ? 'YES' : 'NO'}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="spec-label">HTTPS_ENABLED</td>
                    <td className="spec-value">
                      <span style={{ 
                        color: (project.website && project.website.startsWith('https://')) ? 'var(--color-green)' : 'var(--text-muted)',
                        fontWeight: 'bold'
                      }}>
                        {project.website && project.website.startsWith('https://') ? 'YES' : 'NO'}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Project Statistics Pane */}
            <div className="detail-pane">
              <h3 className="detail-pane-title">
                <ThumbsUp size={16} /> PROJECT_STATISTICS
              </h3>
              <table className="specs-table">
                <tbody>
                  <tr>
                    <td className="spec-label">VIEWS</td>
                    <td className="spec-value" style={{ fontFamily: 'var(--font-mono)' }}>
                      {project.views || 0}
                    </td>
                  </tr>
                  <tr>
                    <td className="spec-label">LIKES</td>
                    <td className="spec-value" style={{ fontFamily: 'var(--font-mono)' }}>
                      {upvotes}
                    </td>
                  </tr>
                  {project.githubStars !== undefined && (
                    <tr>
                      <td className="spec-label">GITHUB_STARS</td>
                      <td className="spec-value" style={{ fontFamily: 'var(--font-mono)' }}>
                        {project.githubStars} ★
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Quick links pane */}
            <div className="detail-pane">
              <h3 className="detail-pane-title">SYSTEM_LINKS</h3>
              <div className="links-list">
                {project.website && (
                  <a href={project.website} target="_blank" rel="noopener noreferrer" className="link-item">
                    <span>LIVE_DAPP_GATEWAY</span> <Globe size={14} />
                  </a>
                )}
                {project.github && (
                  <a href={project.github} target="_blank" rel="noopener noreferrer" className="link-item">
                    <span>GITHUB_REPOSITORY</span> <Github size={14} />
                  </a>
                )}
                {project.twitter && (
                  <a href={project.twitter} target="_blank" rel="noopener noreferrer" className="link-item">
                    <span>X_SOCIAL_STREAM</span> <Twitter size={14} />
                  </a>
                )}
                {project.docs && (
                  <a href={project.docs} target="_blank" rel="noopener noreferrer" className="link-item">
                    <span>DOCUMENTATION_NODE</span> <BookOpen size={14} />
                  </a>
                )}
              </div>
            </div>

            {/* Builder Profile Pane */}
            <div className="detail-pane">
              <h3 className="detail-pane-title">
                <User size={16} /> BUILDER_PROFILE
              </h3>
              
              {projectBuilder ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div className="member-avatar" style={{ width: '64px', height: '64px', border: '1px solid var(--color-primary)', borderRadius: '6px', overflow: 'hidden' }}>
                      <img 
                        src={projectBuilder.avatarUrl} 
                        alt={projectBuilder.name} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                        {projectBuilder.name}
                      </h4>
                      <p style={{ fontSize: '12px', color: 'var(--color-primary)', fontFamily: 'var(--font-mono)', margin: '4px 0 0 0' }}>
                        {projectBuilder.handle}
                      </p>
                    </div>
                  </div>

                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                    {projectBuilder.bio || 'Verified Builder on the DAC Chain Ecosystem.'}
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '4px' }}>
                    {/* Follow on X */}
                    {projectBuilder.handle && (
                      <a 
                        href={`https://x.com/${projectBuilder.handle.replace(/^@/, '')}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="btn-secondary" 
                        style={{ 
                          fontSize: '11px', 
                          padding: '6px 12px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '6px',
                          textDecoration: 'none',
                          backgroundColor: '#000000',
                          color: '#ffffff',
                          borderColor: '#2f3336'
                        }}
                      >
                        <svg style={{ width: '12px', height: '12px', fill: 'currentColor' }} viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                        FOLLOW ON X
                      </a>
                    )}

                    {/* GitHub */}
                    {projectBuilder.githubUsername && (
                      <a 
                        href={`https://github.com/${projectBuilder.githubUsername.replace(/^@/, '')}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="btn-secondary" 
                        style={{ 
                          fontSize: '11px', 
                          padding: '6px 12px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '6px',
                          textDecoration: 'none'
                        }}
                      >
                        <Github size={12} />
                        GITHUB
                      </a>
                    )}

                    {/* Email */}
                    {projectBuilder.email && (
                      <a 
                        href={`mailto:${projectBuilder.email}`} 
                        className="btn-secondary" 
                        style={{ 
                          fontSize: '11px', 
                          padding: '6px 12px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '6px',
                          textDecoration: 'none'
                        }}
                      >
                        <span style={{ fontSize: '12px' }}>✉</span>
                        EMAIL
                      </a>
                    )}

                    {/* Discord */}
                    {projectBuilder.discordUsername && (
                      <span 
                        className="btn-secondary" 
                        style={{ 
                          fontSize: '11px', 
                          padding: '6px 12px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '6px',
                          cursor: 'default',
                          borderColor: '#5865F2',
                          color: '#5865F2'
                        }}
                        title={`Discord Username: ${projectBuilder.discordUsername}`}
                      >
                        <span style={{ fontSize: '12px' }}>⬡</span>
                        DISCORD: {projectBuilder.discordUsername}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="team-list">
                  {project.team && project.team.length > 0 ? (
                    project.team.map((member, idx) => (
                      <div key={idx} className="team-member">
                        <div className="member-avatar">
                          <img 
                            src={`https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${member}`} 
                            alt={member} 
                            style={{ width: '100%', height: '100%' }}
                          />
                        </div>
                        <span className="member-name">{member}</span>
                      </div>
                    ))
                  ) : (
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Anonymous Builder</span>
                  )}
                </div>
              )}

              {/* Collaborators List (rendered if we have a main builder and team list has other names) */}
              {projectBuilder && project.team && project.team.length > 0 && (
                <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
                  <h4 style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase' }}>
                    COLLABORATORS
                  </h4>
                  <div className="team-list">
                    {project.team.map((member, idx) => (
                      <div key={idx} className="team-member">
                        <div className="member-avatar">
                          <img 
                            src={`https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${member}`} 
                            alt={member} 
                            style={{ width: '100%', height: '100%' }}
                          />
                        </div>
                        <span className="member-name">{member}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
