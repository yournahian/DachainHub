import React, { useState, useMemo } from 'react';
import { Terminal, Plus, Eye, BookOpen } from 'lucide-react';
import { Project } from '../types';
import { parseMarkdown } from '../utils/markdown';

interface ProjectSubmitProps {
  onSubmit: (projectData: Omit<Project, 'id' | 'upvotes' | 'createdAt' | 'isFeatured' | 'isApproved'>) => void;
  onNavigate: (view: string) => void;
  builderId: string;
}

export const ProjectSubmit: React.FC<ProjectSubmitProps> = ({ onSubmit, onNavigate, builderId }) => {
  // Form State
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Project['category']>('DeFi');
  const [status, setStatus] = useState<Project['status']>('Testnet');
  const [logoUrl, setLogoUrl] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [bannerColorIndex, setBannerColorIndex] = useState(0);
  const [website, setWebsite] = useState('');
  const [github, setGithub] = useState('');
  const [twitter, setTwitter] = useState('');
  const [docs, setDocs] = useState('');
  const [teamMembers, setTeamMembers] = useState('');
  const [tokenTicker, setTokenTicker] = useState('');
  const [contractAddress, setContractAddress] = useState('');
  const [techStack, setTechStack] = useState('');
  const [tags, setTags] = useState('');
  const [auditStatus, setAuditStatus] = useState('Audit Completed');
  const [auditorName, setAuditorName] = useState('');
  const [securityLevel, setSecurityLevel] = useState<Project['securityDetails']['securityLevel']>('High');
  const [pqcSafe, setPqcSafe] = useState(true);
  const [coverImagePositionY, setCoverImagePositionY] = useState(50);
  const [logoScale, setLogoScale] = useState(100);


  // UI state
  const [previewTab, setPreviewTab] = useState<'card' | 'page'>('card');
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoUploadError, setLogoUploadError] = useState('');

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoUploading(true);
    setLogoUploadError('');

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Upload failed');
      }

      const data = await res.json();
      if (data?.url) {
        setLogoUrl(data.url);
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (err) {
      setLogoUploadError('Failed to upload logo.');
      console.error(err);
    } finally {
      setLogoUploading(false);
    }
  };

  const handleLocalUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    setUploadError('');

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Upload failed');
      }

      const data = await res.json();
      if (data?.url) {
        setCoverImageUrl(data.url);
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (err) {
      setUploadError('Failed to upload image to local server.');
      console.error(err);
    } finally {
      setImageUploading(false);
    }
  };

  // Predefined gorgeous gradients for banner
  const bannerGradients = [
    'linear-gradient(135deg, #aa3011 0%, #28426d 100%)',
    'linear-gradient(135deg, #28426d 0%, #11120c 100%)',
    'linear-gradient(135deg, #e25836 0%, #ffcc00 100%)',
    'linear-gradient(135deg, #455f8b 0%, #aa3011 100%)',
    'linear-gradient(135deg, #1b1d11 0%, #28426d 100%)',
  ];

  // Live preview project computed object
  const previewProject = useMemo<Omit<Project, 'id' | 'upvotes' | 'createdAt' | 'isFeatured' | 'isApproved'>>(() => {
    return {
      name: name || 'DAC Swap Engine',
      tagline: tagline || 'Next-gen atomic swapper for quantum-resistant dApps.',
      description: description || '### Feature Set\n- Multi-hop liquidity router\n- Zero-knowledge fee claims\n\nSubmit this form to populate details.',
      category,
      status,
      logoUrl: logoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${name || 'DAC'}`,
      bannerColor: bannerGradients[bannerColorIndex],
      website,
      github,
      twitter,
      docs,
      team: teamMembers ? teamMembers.split(',').map(name => name.trim()).filter(Boolean) : ['Ecosystem Builder'],
      techStack: techStack ? techStack.split(',').map(t => t.trim()).filter(Boolean) : ['Solidity', 'Next.js', 'Ethers.js'],
      tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : ['DEX', 'AMM', 'Liquidity'],
      securityDetails: {
        auditStatus: auditStatus || 'Self Audited',
        auditorName: auditorName || undefined,
        securityLevel,
        pqcSafe
      },
      views: 120,
      githubStars: Math.floor(Math.random() * 50) + 10,
      tokenTicker: tokenTicker || undefined,
      contractAddress: contractAddress || undefined,
      builderId: builderId,
      coverImageUrl: coverImageUrl || undefined,
      coverImagePositionY,
      logoScale
    };
  }, [name, tagline, description, category, status, logoUrl, coverImageUrl, bannerColorIndex, website, github, twitter, docs, teamMembers, tokenTicker, contractAddress, techStack, tags, auditStatus, auditorName, securityLevel, pqcSafe, builderId, coverImagePositionY, logoScale]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !tagline.trim() || !description.trim()) return;

    onSubmit(previewProject);
    setSubmissionSuccess(true);
    setTimeout(() => {
      setSubmissionSuccess(false);
      onNavigate('builder'); // Redirect to builder panel
    }, 2000);
  };

  return (
    <div className="detail-view-container">
      <h2 style={{ marginBottom: '24px', fontSize: '28px', color: 'var(--text-primary)' }}>
        SUBMIT_DAPP_TO_REGISTRY
      </h2>

      {submissionSuccess ? (
        <div className="terminal-console" style={{ padding: '40px', textAlign: 'center' }}>
          <span className="terminal-green" style={{ fontSize: '32px' }}>✔ SUCCESS</span>
          <h3 style={{ marginTop: '16px', marginBottom: '8px' }}>DAPP_REGISTRY_RECORDED</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Your submission is complete. It has been logged to the ledger and is awaiting Admin Moderator approval.
          </p>
          <div style={{ margin: '20px auto 0 auto', width: '20px', height: '20px', border: '2px solid var(--color-primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        </div>
      ) : (
        <div className="submit-grid">
          {/* Left Side: Submission form */}
          <form className="form-panel" onSubmit={handleFormSubmit}>
            <div className="form-section-title">CORE_IDENTIFICATION</div>
            
            <div className="form-group">
              <label className="form-label">APPLICATION_NAME *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. DAC Vault Lock"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">TAGLINE / ONE-LINE SLOGAN *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Secure lattice-based HSM simulation locker."
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                required
              />
            </div>

            <div className="form-row-double">
              <div className="form-group">
                <label className="form-label">REGISTRY_CATEGORY *</label>
                <select
                  className="select-control"
                  style={{ width: '100%', height: '40px', padding: '0 10px' }}
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Project['category'])}
                >
                  <option value="DeFi">DeFi</option>
                  <option value="NFT">NFT</option>
                  <option value="GameFi">GameFi</option>
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Tooling">Tooling</option>
                  <option value="Social">Social</option>
                  <option value="RWA">RWA</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">DEVELOPMENT_STATUS *</label>
                <select
                  className="select-control"
                  style={{ width: '100%', height: '40px', padding: '0 10px' }}
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Project['status'])}
                >
                  <option value="Live">Mainnet Live</option>
                  <option value="Beta">Beta Testing</option>
                  <option value="Testnet">Testnet Active</option>
                  <option value="Concept">Concept / Idea</option>
                </select>
              </div>
            </div>

            <div className="form-section-title">VISUALS_&_THEMING</div>

            <div className="form-row-double">
              <div className="form-group">
                <label className="form-label">PROJECT_LOGO (ICON)</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="e.g. /uploads/logo.png or external URL"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    style={{ flexGrow: 1 }}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    id="submit-logo-uploader"
                    style={{ display: 'none' }}
                    onChange={handleLogoUpload}
                  />
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => document.getElementById('submit-logo-uploader')?.click()}
                    disabled={logoUploading}
                    style={{ padding: '0 12px', fontSize: '11px', whiteSpace: 'nowrap' }}
                  >
                    {logoUploading ? 'UPLOADING...' : 'UPLOAD ICON'}
                  </button>
                </div>
                {logoUploadError && <span style={{ color: 'var(--color-red)', fontSize: '10px', marginTop: '4px', display: 'block' }}>{logoUploadError}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">PROJECT_THUMBNAIL (COVER IMAGE)</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="e.g. /uploads/image.png or external URL"
                    value={coverImageUrl}
                    onChange={(e) => setCoverImageUrl(e.target.value)}
                    style={{ flexGrow: 1 }}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    id="submit-img-uploader"
                    style={{ display: 'none' }}
                    onChange={handleLocalUpload}
                  />
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => document.getElementById('submit-img-uploader')?.click()}
                    disabled={imageUploading}
                    style={{ padding: '0 12px', fontSize: '11px', whiteSpace: 'nowrap' }}
                  >
                    {imageUploading ? 'UPLOADING...' : 'UPLOAD IMAGE'}
                  </button>
                </div>
                {uploadError && <span style={{ color: 'var(--color-red)', fontSize: '10px', marginTop: '4px', display: 'block' }}>{uploadError}</span>}
              </div>
            </div>

            <div className="form-row-double" style={{ marginTop: '4px', marginBottom: '16px' }}>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>LOGO_ZOOM_SCALE ({logoScale}%)</span>
                  <button type="button" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '10px', cursor: 'pointer', padding: 0, fontFamily: 'var(--font-mono)' }} onClick={() => setLogoScale(100)}>RESET</button>
                </label>
                <input 
                  type="range" 
                  min="50" 
                  max="150" 
                  value={logoScale} 
                  onChange={(e) => setLogoScale(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--color-primary)', cursor: 'pointer', height: '38px' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>COVER_POSITION_Y ({coverImagePositionY}%)</span>
                  <button type="button" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '10px', cursor: 'pointer', padding: 0, fontFamily: 'var(--font-mono)' }} onClick={() => setCoverImagePositionY(50)}>RESET</button>
                </label>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={coverImagePositionY} 
                  onChange={(e) => setCoverImagePositionY(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--color-primary)', cursor: 'pointer', height: '38px' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">BANNER_THEME_GRADIENT (FALLBACK)</label>
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                {bannerGradients.map((gradient, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setBannerColorIndex(idx)}
                    style={{
                      background: gradient,
                      width: '28px',
                      height: '28px',
                      border: bannerColorIndex === idx ? '2px solid var(--text-primary)' : '1px solid var(--border-color)',
                      cursor: 'pointer',
                      borderRadius: '4px'
                    }}
                    title={`Gradient ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            <div className="form-row-double">
              <div className="form-group">
                <label className="form-label">TOKEN_TICKER (OPTIONAL)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. QLOCK"
                  value={tokenTicker}
                  onChange={(e) => setTokenTicker(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">SMART_CONTRACT_ADDRESS (OPTIONAL)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 0xaa3011..."
                  value={contractAddress}
                  onChange={(e) => setContractAddress(e.target.value)}
                />
              </div>
            </div>

            <div className="form-row-double">
              <div className="form-group">
                <label className="form-label">TECH_STACK (COMMA-SEPARATED)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Solidity, Next.js, Rust"
                  value={techStack}
                  onChange={(e) => setTechStack(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">TAGS (COMMA-SEPARATED)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. DEX, AMM, Post-Quantum"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>
            </div>

            <div className="form-section-title">SECURITY_&_AUDIT_REPORT</div>

            <div className="form-row-double">
              <div className="form-group">
                <label className="form-label">AUDIT_STATUS</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Audit Completed, Under Active Audit"
                  value={auditStatus}
                  onChange={(e) => setAuditStatus(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">AUDITED_BY (AUDITOR NAME)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Securify, Trail of Bits"
                  value={auditorName}
                  onChange={(e) => setAuditorName(e.target.value)}
                />
              </div>
            </div>

            <div className="form-row-double">
              <div className="form-group">
                <label className="form-label">SECURITY_CLEARANCE_LEVEL</label>
                <select
                  className="select-control"
                  style={{ width: '100%', height: '40px', padding: '0 10px' }}
                  value={securityLevel}
                  onChange={(e) => setSecurityLevel(e.target.value as any)}
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
                    checked={pqcSafe}
                    onChange={(e) => setPqcSafe(e.target.checked)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--color-primary)' }}
                  />
                  <span>QUANTUM-PROOF SIGNATURES ACTIVE</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">TECHNICAL_DOC_MARKDOWN *</label>
              <textarea
                className="form-textarea"
                style={{ minHeight: '140px' }}
                placeholder="### Summary&#10;Describe system features, quantum protection models, or audits...&#10;&#10;- Item 1&#10;- Item 2"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              ></textarea>
            </div>

            <div className="form-section-title">COMMUNICATION_CHANNELS</div>

            <div className="form-row-double">
              <div className="form-group">
                <label className="form-label">LIVE_GATEWAY_URL</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://my-dapp.tech"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">GITHUB_REPOSITORY</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://github.com/org/repo"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                />
              </div>
            </div>

            <div className="form-row-double">
              <div className="form-group">
                <label className="form-label">TWITTER_X_STREAM</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://x.com/my_project"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">DOCUMENTATION_PORTAL</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://docs.my-dapp.tech"
                  value={docs}
                  onChange={(e) => setDocs(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">TEAM_MEMBERS (COMMA-SEPARATED NAMES)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Alice V., Bob M."
                value={teamMembers}
                onChange={(e) => setTeamMembers(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: '12px' }}>
              <Plus size={16} /> TRANSMIT_REGISTRY_RECORD
            </button>
          </form>

          {/* Right Side: Sticky live preview panel */}
          <div className="preview-sticky-panel">
            {/* Live preview toggle tab bar */}
            <div className="preview-toggle-bar">
              <button
                type="button"
                className={`preview-toggle-btn ${previewTab === 'card' ? 'active' : ''}`}
                onClick={() => setPreviewTab('card')}
              >
                <Eye size={12} style={{ display: 'inline', marginRight: '4px' }} /> Card Preview
              </button>
              <button
                type="button"
                className={`preview-toggle-btn ${previewTab === 'page' ? 'active' : ''}`}
                onClick={() => setPreviewTab('page')}
              >
                <BookOpen size={12} style={{ display: 'inline', marginRight: '4px' }} /> Detail Page Preview
              </button>
            </div>

            {/* Live visual adjustment sliders */}
            <div style={{
              backgroundColor: 'var(--bg-container)',
              border: '1px solid var(--border-color)',
              padding: '12px',
              marginBottom: '12px',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)'
            }}>
              <div style={{ color: 'var(--color-primary)', fontWeight: 'bold', marginBottom: '8px', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>VISUAL_ALIGNMENT_CONTROLS</span>
                <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>LIVE_SYNC</span>
              </div>
              
              <div style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>COVER_POSITION_Y: {coverImagePositionY}%</span>
                  <button type="button" onClick={() => setCoverImagePositionY(50)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, fontSize: '10px', fontFamily: 'var(--font-mono)' }}>RESET</button>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={coverImagePositionY} 
                  onChange={(e) => setCoverImagePositionY(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--color-primary)', cursor: 'pointer' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>LOGO_ZOOM_SCALE: {logoScale}%</span>
                  <button type="button" onClick={() => setLogoScale(100)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, fontSize: '10px', fontFamily: 'var(--font-mono)' }}>RESET</button>
                </div>
                <input 
                  type="range" 
                  min="50" 
                  max="150" 
                  value={logoScale} 
                  onChange={(e) => setLogoScale(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--color-primary)', cursor: 'pointer' }}
                />
              </div>
            </div>

            {/* Simulated Live Render container */}
            <div className="live-preview-box">
              {previewTab === 'card' ? (
                /* Card Layout Live Preview */
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '350px' }}>
                  <div className="project-card" style={{ width: '100%', maxWidth: '340px' }}>
                    <div 
                      className="card-banner" 
                      style={previewProject.coverImageUrl ? { 
                        backgroundImage: `linear-gradient(to bottom, rgba(27, 29, 17, 0.1), rgba(27, 29, 17, 0.45)), url(${previewProject.coverImageUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: `center ${coverImagePositionY}%`,
                      } : {
                        background: previewProject.bannerColor || 'linear-gradient(135deg, #aa3011, #28426d)',
                      }}
                    >
                      <div className="card-logo-container" style={{ overflow: 'hidden' }}>
                        <img 
                          src={previewProject.logoUrl} 
                          alt="Preview Logo" 
                          className="card-logo"
                          style={{
                            transform: `scale(${logoScale / 100})`,
                            transition: 'transform 0.1s ease-out'
                          }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${previewProject.name}`;
                          }}
                        />
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="card-header-row">
                        <span className="card-category-badge">{previewProject.category}</span>
                        <span className="card-status-dot live">{previewProject.status}</span>
                      </div>
                      <h3 className="card-title">{previewProject.name}</h3>
                      <p className="card-tagline">{previewProject.tagline}</p>
                    </div>
                    <div className="card-footer">
                      <button className="upvotes-counter">
                        <span>▲ 0</span>
                      </button>
                      <span className="card-link" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        LIVE PREVIEW
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Page Layout Live Preview */
                <div style={{ fontSize: '12px', overflowY: 'auto', maxHeight: '550px', paddingRight: '4px' }}>
                  <div 
                    style={previewProject.coverImageUrl ? { 
                      backgroundImage: `linear-gradient(to bottom, rgba(27, 29, 17, 0.1), rgba(27, 29, 17, 0.5)), url(${previewProject.coverImageUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: `center ${coverImagePositionY}%`,
                      height: '75px', 
                      width: '100%', 
                      marginBottom: '10px' 
                    } : {
                      background: previewProject.bannerColor || 'linear-gradient(135deg, #aa3011, #28426d)',
                      height: '75px', 
                      width: '100%', 
                      marginBottom: '10px' 
                    }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <div style={{ width: '40px', height: '40px', border: '1px solid var(--border-color)', padding: '2px', overflow: 'hidden' }}>
                      <img 
                        src={previewProject.logoUrl} 
                        alt="Logo" 
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover',
                          transform: `scale(${logoScale / 100})`,
                          transition: 'transform 0.1s ease-out'
                        }} 
                      />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '16px' }}>{previewProject.name}</h4>
                      <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '11px' }}>{previewProject.tagline}</p>
                    </div>
                  </div>
                  
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginTop: '10px' }}>
                    <h5 style={{ color: 'var(--color-primary)', marginBottom: '8px', fontSize: '11px' }}>MEMO_SPECIFICATION</h5>
                    <div className="markdown-render-body" style={{ fontSize: '11px', lineHeight: '1.4' }}>
                      {parseMarkdown(previewProject.description)}
                    </div>
                  </div>

                  {/* Preview Tech Stack & Tags */}
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginTop: '10px' }}>
                    <h5 style={{ color: 'var(--color-primary)', marginBottom: '6px', fontSize: '11px' }}>TECH_STACK_&_TAGS</h5>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                      {previewProject.techStack.map((tech) => (
                        <span key={tech} style={{ fontSize: '9px', padding: '1px 6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-container)', color: 'var(--text-secondary)' }}>
                          {tech}
                        </span>
                      ))}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {previewProject.tags.map((tag) => (
                        <span key={tag} style={{ fontSize: '9px', padding: '1px 6px', border: '1px solid var(--color-primary)', backgroundColor: 'rgba(170, 48, 17, 0.05)', color: 'var(--color-primary)' }}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Preview Security credentials */}
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginTop: '10px' }}>
                    <h5 style={{ color: 'var(--color-primary)', marginBottom: '6px', fontSize: '11px' }}>SECURITY_AUDIT_REPORT</h5>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                      <div>Status: <span style={{ fontWeight: 'bold', color: 'var(--color-green)' }}>{previewProject.securityDetails.auditStatus}</span></div>
                      {previewProject.securityDetails.auditorName && <div>Auditor: <span style={{ fontWeight: 'bold' }}>{previewProject.securityDetails.auditorName}</span></div>}
                      <div>Level: <span style={{ fontWeight: 'bold' }}>{previewProject.securityDetails.securityLevel}</span></div>
                      <div>PQC Safe: <span style={{ fontWeight: 'bold', color: previewProject.securityDetails.pqcSafe ? 'var(--color-green)' : 'var(--text-muted)' }}>{previewProject.securityDetails.pqcSafe ? 'YES' : 'NO'}</span></div>
                      <div>Verified: <span style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>PENDING</span></div>
                      <div>HTTPS Enabled: <span style={{ fontWeight: 'bold', color: (previewProject.website && previewProject.website.startsWith('https://')) ? 'var(--color-green)' : 'var(--text-muted)' }}>{previewProject.website && previewProject.website.startsWith('https://') ? 'YES' : 'NO'}</span></div>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginTop: '10px' }}>
                    <h5 style={{ color: 'var(--color-primary)', marginBottom: '6px', fontSize: '11px' }}>DEVELOPMENT_TEAM</h5>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                      {previewProject.team.map((t, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontSize: '9px', padding: '2px 4px', background: 'var(--bg-container)' }}>[//]</span>
                          <span>{t}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
