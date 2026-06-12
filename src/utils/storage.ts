import { Project, Comment, Builder, SystemStats } from '../types';
import { INITIAL_PROJECTS, INITIAL_COMMENTS } from '../data/initialProjects';

// Key Constants
const PROJECTS_KEY = 'dac_projects';
const COMMENTS_KEY = 'dac_comments';
const UPVOTED_KEY = 'dac_upvoted_projects';
const BUILDER_KEY = 'dac_current_builder';
const ADMIN_KEY = 'dac_is_admin';

const REGISTERED_BUILDERS_KEY = 'dac_registered_builders';

// Seed default builders if empty
export const getRegisteredBuilders = (): (Builder & { passphrase?: string })[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(REGISTERED_BUILDERS_KEY);
  if (!data) {
    const defaults = [
      {
        id: 'dev_1',
        name: 'Alistair Vance',
        handle: '@alistair_v',
        avatarUrl: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=alistair_v',
        bio: 'DAC core AMM engineer.',
        xHandle: '@alistair_v',
        discordUsername: 'alistair_v',
        passphrase: 'password123'
      },
      {
        id: 'dev_2',
        name: 'Elena Rostova',
        handle: '@elena_r',
        avatarUrl: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=elena_r',
        bio: 'Post-quantum cryptography research lead.',
        xHandle: '@elena_r',
        discordUsername: 'elena_r',
        passphrase: 'password123'
      }
    ];
    localStorage.setItem(REGISTERED_BUILDERS_KEY, JSON.stringify(defaults));
    return defaults;
  }
  return JSON.parse(data);
};

// Initialize localStorage with default values if empty
export const initializeStorage = (): void => {
  if (!localStorage.getItem(PROJECTS_KEY)) {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(INITIAL_PROJECTS));
  }
  if (!localStorage.getItem(COMMENTS_KEY)) {
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(INITIAL_COMMENTS));
  }
  if (!localStorage.getItem(REGISTERED_BUILDERS_KEY)) {
    getRegisteredBuilders();
  }
};

// Reset Storage to Defaults
export const resetStorageToDefaults = (): void => {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(INITIAL_PROJECTS));
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(INITIAL_COMMENTS));
  localStorage.removeItem(REGISTERED_BUILDERS_KEY);
  localStorage.removeItem(UPVOTED_KEY);
  localStorage.removeItem(BUILDER_KEY);
  getRegisteredBuilders(); // re-seed defaults
};

export const getProjects = (): Project[] => {
  initializeStorage();
  const data = localStorage.getItem(PROJECTS_KEY);
  if (!data) return [];
  
  let projects: Project[] = JSON.parse(data);
  let modified = false;
  
  projects = projects.map((p) => {
    const defaultProj = INITIAL_PROJECTS.find((dp) => dp.id === p.id);
    if (defaultProj) {
      let updated = false;
      const merged = { ...p };
      if (!merged.techStack || merged.techStack.length === 0) {
        merged.techStack = defaultProj.techStack || [];
        updated = true;
      }
      if (!merged.tags || merged.tags.length === 0) {
        merged.tags = defaultProj.tags || [];
        updated = true;
      }
      if (!merged.coverImageUrl && defaultProj.coverImageUrl) {
        merged.coverImageUrl = defaultProj.coverImageUrl;
        updated = true;
      }
      if (updated) {
        modified = true;
        return merged;
      }
    }
    return p;
  });

  if (modified) {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  }

  return projects;
};

export const saveProjects = (projects: Project[]): void => {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
};

export const addProject = (project: Omit<Project, 'id' | 'upvotes' | 'createdAt' | 'isFeatured' | 'isApproved'>): Project => {
  const projects = getProjects();
  const newProject: Project = {
    ...project,
    id: 'proj_' + Math.random().toString(36).substr(2, 9),
    upvotes: 0,
    createdAt: new Date().toISOString(),
    isFeatured: false,
    isApproved: false, // Moderated by default (Admin can approve)
  };
  projects.push(newProject);
  saveProjects(projects);
  return newProject;
};

export const updateProject = (project: Project): void => {
  const projects = getProjects();
  const index = projects.findIndex((p) => p.id === project.id);
  if (index !== -1) {
    projects[index] = project;
    saveProjects(projects);
  }
};

export const incrementViews = (projectId: string): void => {
  const projects = getProjects();
  const index = projects.findIndex((p) => p.id === projectId);
  if (index !== -1) {
    projects[index].views = (projects[index].views || 0) + 1;
    saveProjects(projects);
  }
};

export const deleteProject = (projectId: string): void => {
  const projects = getProjects();
  const updatedProjects = projects.filter((p) => p.id !== projectId);
  saveProjects(updatedProjects);

  // Clean up related comments
  const comments = getComments();
  const updatedComments = comments.filter((c) => c.projectId !== projectId);
  saveComments(updatedComments);
};

// Comments API
export const getComments = (): Comment[] => {
  initializeStorage();
  const data = localStorage.getItem(COMMENTS_KEY);
  return data ? JSON.parse(data) : [];
};

export const getCommentsForProject = (projectId: string): Comment[] => {
  return getComments().filter((c) => c.projectId === projectId);
};

export const saveComments = (comments: Comment[]): void => {
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
};

export const addComment = (projectId: string, author: string, text: string, rating: number): Comment => {
  const comments = getComments();
  const newComment: Comment = {
    id: 'comm_' + Math.random().toString(36).substr(2, 9),
    projectId,
    author: author || 'Anonymous Builder',
    text,
    rating,
    timestamp: new Date().toISOString(),
  };
  comments.push(newComment);
  saveComments(comments);
  return newComment;
};

export const deleteComment = (commentId: string): void => {
  const comments = getComments();
  const updatedComments = comments.filter((c) => c.id !== commentId);
  saveComments(updatedComments);
};

// Upvote Tracker API
export const getUpvotedProjects = (): string[] => {
  const data = localStorage.getItem(UPVOTED_KEY);
  return data ? JSON.parse(data) : [];
};

export const toggleUpvote = (projectId: string): { success: boolean; upvotes: number; upvoted: boolean } => {
  const projects = getProjects();
  const upvoted = getUpvotedProjects();
  const projectIndex = projects.findIndex((p) => p.id === projectId);
  
  if (projectIndex === -1) return { success: false, upvotes: 0, upvoted: false };

  const isUpvoted = upvoted.includes(projectId);
  let newUpvotes = projects[projectIndex].upvotes;
  let newUpvotedList = [...upvoted];

  if (isUpvoted) {
    // Remove upvote
    newUpvotes = Math.max(0, newUpvotes - 1);
    newUpvotedList = newUpvotedList.filter((id) => id !== projectId);
  } else {
    // Add upvote
    newUpvotes += 1;
    newUpvotedList.push(projectId);
  }

  projects[projectIndex].upvotes = newUpvotes;
  saveProjects(projects);
  localStorage.setItem(UPVOTED_KEY, JSON.stringify(newUpvotedList));

  return { success: true, upvotes: newUpvotes, upvoted: !isUpvoted };
};

// Builder Authentication Simulation API
export const getCurrentBuilder = (): Builder | null => {
  const data = localStorage.getItem(BUILDER_KEY);
  return data ? JSON.parse(data) : null;
};

export const checkBuilderExists = (xHandle: string): boolean => {
  const cleanX = xHandle.trim().startsWith('@') ? xHandle.trim() : `@${xHandle.trim()}`;
  const builders = getRegisteredBuilders();
  return builders.some((b) => b.handle.toLowerCase() === cleanX.toLowerCase());
};

export const verifyBuilderPassphrase = (xHandle: string, passphraseToVerify: string): boolean => {
  const cleanX = xHandle.trim().startsWith('@') ? xHandle.trim() : `@${xHandle.trim()}`;
  const builders = getRegisteredBuilders();
  const found = builders.find((b) => b.handle.toLowerCase() === cleanX.toLowerCase());
  if (!found) return false;
  return found.passphrase === passphraseToVerify;
};

export const registerBuilder = (xHandle: string, discordUsername: string, passphraseForNewNode: string): Builder => {
  const cleanX = xHandle.trim().startsWith('@') ? xHandle.trim() : `@${xHandle.trim()}`;
  const cleanDiscord = discordUsername.trim();
  
  const handleName = cleanX.replace(/^@/, '');
  const derivedName = handleName
    .split(/[_\-\.]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ') || 'Developer';

  const newBuilder: Builder = {
    id: 'dev_' + Math.random().toString(36).substr(2, 9),
    name: derivedName,
    handle: cleanX,
    avatarUrl: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${cleanX.replace(/^@/, '')}`,
    bio: 'DAC ecosystem engineer building decentralized interfaces.',
    xHandle: cleanX,
    discordUsername: cleanDiscord,
  };

  const builders = getRegisteredBuilders();
  builders.push({ ...newBuilder, passphrase: passphraseForNewNode });
  localStorage.setItem(REGISTERED_BUILDERS_KEY, JSON.stringify(builders));
  
  // Set current session
  localStorage.setItem(BUILDER_KEY, JSON.stringify(newBuilder));
  return newBuilder;
};

export const loginBuilder = (xHandle: string, discordUsername: string): Builder => {
  const cleanX = xHandle.trim().startsWith('@') ? xHandle.trim() : `@${xHandle.trim()}`;
  const builders = getRegisteredBuilders();
  
  // Find if builder exists in registry
  const existing = builders.find((b) => b.handle.toLowerCase() === cleanX.toLowerCase());
  
  if (existing) {
    // Strip passphrase before setting session
    const { passphrase, ...builderSession } = existing;
    localStorage.setItem(BUILDER_KEY, JSON.stringify(builderSession));
    return builderSession as Builder;
  }
  
  // Fallback registration (if validation bypassed)
  return registerBuilder(xHandle, discordUsername, 'password123');
};

export const logoutBuilder = (): void => {
  localStorage.removeItem(BUILDER_KEY);
};

// Admin Session API
export const isAdminLoggedIn = (): boolean => {
  return localStorage.getItem(ADMIN_KEY) === 'true';
};

export const loginAdmin = (passphrase: string): boolean => {
  // Mock Admin password: "admin" or "admin123"
  if (passphrase === 'admin123' || passphrase === 'admin') {
    localStorage.setItem(ADMIN_KEY, 'true');
    return true;
  }
  return false;
};

export const logoutAdmin = (): void => {
  localStorage.removeItem(ADMIN_KEY);
};

// Statistics API
export const getSystemStats = (): SystemStats => {
  const projects = getProjects();
  const totalUpvotes = projects.reduce((sum, p) => sum + p.upvotes, 0);
  
  // Calculate unique builder counts (builderId)
  const uniqueBuilders = new Set(projects.map((p) => p.builderId)).size;

  return {
    totalProjects: projects.length,
    totalUpvotes,
    activeBuilders: Math.max(uniqueBuilders, 4), // Fallback min count
  };
};
