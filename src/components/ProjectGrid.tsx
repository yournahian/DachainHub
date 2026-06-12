import React, { useState, useMemo } from 'react';
import { Search, Compass, AlertCircle } from 'lucide-react';
import { Project } from '../types';
import { ProjectCard } from './ProjectCard';

interface ProjectGridProps {
  projects: Project[];
  onSelectProject: (id: string) => void;
  onUpvoteProject: (id: string, e: React.MouseEvent) => void;
  upvotedIds: string[];
}

type CategoryFilter = 'All' | 'DeFi' | 'NFT' | 'GameFi' | 'Infrastructure' | 'Tooling' | 'Social' | 'RWA' | 'Other';
type StatusFilter = 'All' | 'Live' | 'Beta' | 'Testnet' | 'Concept';
type SortOption = 'trending' | 'latest' | 'alpha';

export const ProjectGrid: React.FC<ProjectGridProps> = ({
  projects,
  onSelectProject,
  onUpvoteProject,
  upvotedIds,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('All');
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('All');
  const [sortBy, setSortBy] = useState<SortOption>('trending');

  // Filter & Sort Logic
  const processedProjects = useMemo(() => {
    // Only show approved projects in main showcase (unapproved shown in admin)
    const baseProjects = projects.filter((p) => p.isApproved);

    let filtered = baseProjects.filter((project) => {
      // 1. Search Query filter
      const matchesSearch = 
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase());

      // 2. Category filter
      // Mapping categories safely: 'Other' matches any category not in standard categories
      const standardCategories = ['DeFi', 'NFT', 'GameFi', 'Infrastructure', 'Tooling', 'Social', 'RWA'];
      const matchesCategory = 
        selectedCategory === 'All' || 
        (selectedCategory === 'Other' && !standardCategories.includes(project.category)) ||
        project.category === selectedCategory;

      // 3. Status filter
      const matchesStatus = selectedStatus === 'All' || project.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });

    // Sort projects: Pin featured projects to the top, then sort by selected option
    filtered.sort((a, b) => {
      // Pin Featured first
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;

      // Secondary sorting
      if (sortBy === 'trending') {
        return b.upvotes - a.upvotes;
      } else if (sortBy === 'latest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else {
        return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [projects, searchQuery, selectedCategory, selectedStatus, sortBy]);

  const categories: CategoryFilter[] = ['All', 'DeFi', 'NFT', 'GameFi', 'Infrastructure', 'Tooling', 'Social', 'RWA', 'Other'];
  const statuses: StatusFilter[] = ['All', 'Live', 'Beta', 'Testnet', 'Concept'];

  return (
    <div id="showcase-dashboard" className="dashboard-wrapper">
      {/* Search and Filters Panel */}
      <div className="dashboard-controls">
        <div className="search-filter-row">
          {/* Text Search */}
          <div className="search-input-wrapper">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              className="search-input"
              placeholder="Search registry (e.g. quantum-safe, dex, monitoring)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Status Dropdown */}
          <select
            className="select-control"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as StatusFilter)}
          >
            <option value="All">All Statuses</option>
            {statuses.slice(1).map((s) => (
              <option key={s} value={s}>
                {s === 'Live' ? 'Mainnet Live' : s}
              </option>
            ))}
          </select>

          {/* Sort Dropdown */}
          <select
            className="select-control"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
          >
            <option value="trending">Trending (Most Upvotes)</option>
            <option value="latest">Latest Submissions</option>
            <option value="alpha">Alphabetical (A-Z)</option>
          </select>
        </div>

        {/* Category Tabs Row */}
        <div className="categories-container">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`category-tab ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat === 'All' ? 'ALL_CATEGORIES' : cat.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Results */}
      {processedProjects.length > 0 ? (
        <div className="projects-grid">
          {processedProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onSelect={onSelectProject}
              onUpvote={onUpvoteProject}
              hasUpvoted={upvotedIds.includes(project.id)}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="terminal-console" style={{ minHeight: '180px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
          <AlertCircle size={32} style={{ color: 'var(--color-primary)', marginBottom: '12px' }} />
          <h3 style={{ fontFamily: 'var(--font-header)', marginBottom: '6px' }}>NO_PROJECTS_FOUND</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '400px' }}>
            No registered DAC dApps match your search filters. Try clearing keywords or selecting "ALL_CATEGORIES".
          </p>
        </div>
      )}
    </div>
  );
};
