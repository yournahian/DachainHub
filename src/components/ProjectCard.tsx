import React from 'react';
import { ArrowUp, ArrowRight, ExternalLink } from 'lucide-react';
import { Project } from '../types';

interface ProjectCardProps {
  project: Project;
  onSelect: (id: string) => void;
  onUpvote: (id: string, e: React.MouseEvent) => void;
  hasUpvoted: boolean;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onSelect,
  onUpvote,
  hasUpvoted,
}) => {
  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'live': return 'live';
      case 'beta': return 'beta';
      case 'testnet': return 'testnet';
      case 'concept': return 'concept';
      default: return '';
    }
  };

  return (
    <div 
      className={`project-card ${project.isFeatured ? 'featured-card' : ''}`}
      onClick={() => onSelect(project.id)}
      style={{ cursor: 'pointer' }}
    >
      <div 
        className="card-banner" 
        style={project.coverImageUrl ? { 
          backgroundImage: `linear-gradient(to bottom, rgba(27, 29, 17, 0.1), rgba(27, 29, 17, 0.45)), url(${project.coverImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: `center ${project.coverImagePositionY !== undefined ? project.coverImagePositionY : 50}%`,
        } : {
          background: project.bannerColor || 'linear-gradient(135deg, #aa3011, #28426d)',
        }}
      >
        <div className="card-logo-container" style={{ overflow: 'hidden' }}>
          <img 
            src={project.logoUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=' + project.name} 
            alt={`${project.name} Logo`} 
            className="card-logo"
            style={{
              transform: `scale(${(project.logoScale !== undefined ? project.logoScale : 100) / 100})`,
              transition: 'transform 0.1s ease-out'
            }}
            onError={(e) => {
              // Fallback avatar if unsplash image fails to load
              (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${project.name}`;
            }}
          />
        </div>
      </div>

      <div className="card-body">
        {/* Category & Status tags */}
        <div className="card-header-row">
          <span className="card-category-badge">{project.category}</span>
          <span className={`card-status-dot ${getStatusClass(project.status)}`}>
            {project.status === 'Live' ? 'Mainnet Live' : project.status}
          </span>
        </div>

        {/* Project Name and tagline */}
        <h3 className="card-title">{project.name}</h3>
        <p className="card-tagline">{project.tagline}</p>
      </div>

      {/* Upvotes Counter & Detail Navigation */}
      <div className="card-footer" onClick={(e) => e.stopPropagation()}>
        <button 
          className={`upvotes-counter ${hasUpvoted ? 'voted' : ''}`}
          onClick={(e) => onUpvote(project.id, e)}
          title={hasUpvoted ? "Remove Upvote" : "Upvote Project"}
        >
          <ArrowUp size={14} strokeWidth={hasUpvoted ? 3 : 2} />
          <span>{project.upvotes}</span>
        </button>
        
        <button 
          className="card-link"
          style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
          onClick={() => onSelect(project.id)}
        >
          DETAILS <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};
