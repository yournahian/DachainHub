import React, { useState, useEffect } from 'react';
import { User, Github, Twitter, Mail, Code, RefreshCw } from 'lucide-react';
import { Builder, Project } from '../types';
import { getAllBuilders } from '../utils/storage';

interface BuildersListProps {
  projects: Project[];
}

export const BuildersList: React.FC<BuildersListProps> = ({ projects }) => {
  const [builders, setBuilders] = useState<Builder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBuilders = async () => {
      setLoading(true);
      try {
        const list = await getAllBuilders();
        setBuilders(list);
      } catch (err) {
        console.error('Failed to load builders:', err);
      } finally {
        setLoading(false);
      }
    };
    loadBuilders();
  }, []);

  const getBuilderProjectCount = (builderId: string) => {
    return projects.filter(
      (p) => p.builderId === builderId || (builderId === 'dev_1' && p.builderId === 'dev_1')
    ).length;
  };

  if (loading) {
    return (
      <div className="terminal-console" style={{ textAlign: 'center', padding: '40px 20px', marginTop: '20px' }}>
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
          RETRIVING_Ecosystem_BUILDERS_LEDGER...
        </p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: '20px' }}>
      <h2 style={{ marginBottom: '24px', fontSize: '28px', color: 'var(--text-primary)' }}>
        VERIFIED_ECOSYSTEM_BUILDERS
      </h2>
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '30px', maxWidth: '600px', lineHeight: '1.6' }}>
        Meet the developers and cryptographers building on the DAC Chain ecosystem. Every handle is verified cryptographically via X OAuth to guarantee authentic identities.
      </p>

      {builders.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          {builders.map((builder) => {
            const projectCount = getBuilderProjectCount(builder.id);
            return (
              <div 
                key={builder.id} 
                className="project-card"
                style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}
              >
                {/* Header: Avatar and Name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    border: '1px solid var(--color-primary)',
                    backgroundColor: 'var(--bg-container-high)',
                    padding: '2px',
                    overflow: 'hidden'
                  }}>
                    <img 
                      src={builder.avatarUrl || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${builder.handle}`} 
                      alt={builder.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${builder.name}`;
                      }}
                    />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', margin: 0, color: 'var(--text-primary)' }}>{builder.name}</h3>
                    <span style={{ 
                      fontSize: '11px', 
                      fontFamily: 'var(--font-mono)', 
                      color: 'var(--color-primary)',
                      display: 'block',
                      marginTop: '2px'
                    }}>
                      {builder.handle}
                    </span>
                  </div>
                </div>

                {/* Bio */}
                <p style={{ 
                  fontSize: '13px', 
                  color: 'var(--text-secondary)', 
                  lineHeight: '1.5',
                  margin: 0,
                  flexGrow: 1,
                  minHeight: '40px'
                }}>
                  {builder.bio || 'Verified Builder on the DAC Chain Ecosystem.'}
                </p>

                {/* Stats */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  borderTop: '1px dashed var(--border-color)',
                  borderBottom: '1px dashed var(--border-color)',
                  padding: '8px 0',
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)'
                }}>
                  <span style={{ color: 'var(--text-muted)' }}>PROJECTS_SUBMITTED</span>
                  <span style={{ color: 'var(--color-primary)', fontWeight: 'bold', fontSize: '14px' }}>
                    {projectCount}
                  </span>
                </div>

                {/* Actions: Social Networks */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                  {builder.handle && (
                    <a 
                      href={`https://x.com/${builder.handle.replace(/^@/, '')}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="icon-btn" 
                      style={{ width: '32px', height: '32px' }}
                      title="Follow on X"
                    >
                      <Twitter size={14} />
                    </a>
                  )}
                  {builder.githubUsername && (
                    <a 
                      href={`https://github.com/${builder.githubUsername.replace(/^@/, '')}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="icon-btn" 
                      style={{ width: '32px', height: '32px' }}
                      title="GitHub Profile"
                    >
                      <Github size={14} />
                    </a>
                  )}
                  {builder.email && (
                    <a 
                      href={`mailto:${builder.email}`} 
                      className="icon-btn" 
                      style={{ width: '32px', height: '32px' }}
                      title="Email Contact"
                    >
                      <Mail size={14} />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="terminal-console" style={{ padding: '30px', textAlign: 'center' }}>
          <User size={24} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
          <h4>NO_BUILDERS_REGISTERED_YET</h4>
        </div>
      )}
    </div>
  );
};
