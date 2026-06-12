import { Project, Comment, Builder, SystemStats } from '../types';
import { INITIAL_PROJECTS, INITIAL_COMMENTS } from '../data/initialProjects';
import { getSupabaseClient, isSupabaseActive } from './supabaseClient';

// Helper alias — only call inside isSupabaseActive() blocks
const sb = () => getSupabaseClient()!;

// Key Constants
const PROJECTS_KEY = 'dac_projects';
const COMMENTS_KEY = 'dac_comments';
const UPVOTED_KEY = 'dac_upvoted_projects';
const BUILDER_KEY = 'dac_current_builder';
const ADMIN_KEY = 'dac_is_admin';

const REGISTERED_BUILDERS_KEY = 'dac_registered_builders';

// Seed default builders if empty (Local fallback only)
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
        githubUsername: 'alistair-vance',
        email: 'alistair.v@dacblockchain.tech',
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
        githubUsername: 'elena-rostova',
        email: 'elena.r@dacblockchain.tech',
        passphrase: 'password123'
      },
      {
        id: 'dev_3',
        name: 'Renata Cruz',
        handle: '@renata_c',
        avatarUrl: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=renata_c',
        bio: 'Digital artist and quantum NFT minting engine pioneer.',
        xHandle: '@renata_c',
        discordUsername: 'renata_c',
        githubUsername: 'renata-cruz',
        email: 'renata.c@dacblockchain.tech',
        passphrase: 'password123'
      },
      {
        id: 'dev_4',
        name: 'Vikram Patel',
        handle: '@vikram_p',
        avatarUrl: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=vikram_p',
        bio: 'Cross-chain bridge protocol architect.',
        xHandle: '@vikram_p',
        discordUsername: 'vikram_p',
        githubUsername: 'vikram-patel',
        email: 'vikram.p@dacblockchain.tech',
        passphrase: 'password123'
      },
      {
        id: 'dev_5',
        name: 'Alice Sterling',
        handle: '@alice_s',
        avatarUrl: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=alice_s',
        bio: 'DAO consensus engineer and network governance advisor.',
        xHandle: '@alice_s',
        discordUsername: 'alice_s',
        githubUsername: 'alice-sterling',
        email: 'alice.s@dacblockchain.tech',
        passphrase: 'password123'
      }
    ];
    localStorage.setItem(REGISTERED_BUILDERS_KEY, JSON.stringify(defaults));
    return defaults;
  }
  return JSON.parse(data);
};

// LocalStorage Sync Helpers
const getProjectsSync = (): Project[] => {
  if (typeof window === 'undefined') return [];
  initializeStorage();
  const data = localStorage.getItem(PROJECTS_KEY);
  return data ? JSON.parse(data) : [];
};

const saveProjectsSync = (projects: Project[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
};

const getCommentsSync = (): Comment[] => {
  if (typeof window === 'undefined') return [];
  initializeStorage();
  const data = localStorage.getItem(COMMENTS_KEY);
  return data ? JSON.parse(data) : [];
};

const saveCommentsSync = (comments: Comment[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
};

// Initialize localStorage with default values if empty
export const initializeStorage = (): void => {
  if (typeof window === 'undefined') return;
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

// Supabase Auto Seeding
export const seedSupabaseDefaults = async (): Promise<void> => {
  if (!isSupabaseActive()) return;

  try {
    const { count, error } = await sb()
      .from('projects')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('[Supabase] Failed to check projects table count:', error);
      return;
    }

    if (count === 0) {
      console.log('[Supabase] Seeding default builders...');
      const defaultBuilders = getRegisteredBuilders().map(({ passphrase, ...b }) => b);
      const { error: builderErr } = await sb()
        .from('builders')
        .upsert(defaultBuilders);
      if (builderErr) {
        console.error('[Supabase] Builders seeding failed:', builderErr);
      }

      console.log('[Supabase] Seeding default projects...');
      // Omit githubStars since the column does not exist in the Supabase schema
      const sanitizedProjects = INITIAL_PROJECTS.map(({ githubStars, ...p }: any) => p);
      const { error: projectErr } = await sb()
        .from('projects')
        .insert(sanitizedProjects);
      if (projectErr) {
        console.error('[Supabase] Project seeding failed:', projectErr);
      }

      console.log('[Supabase] Seeding default comments...');
      const { error: commentErr } = await sb()
        .from('comments')
        .insert(INITIAL_COMMENTS);
      if (commentErr) {
        console.error('[Supabase] Comment seeding failed:', commentErr);
      }
    }
  } catch (err) {
    console.error('[Supabase] Auto-seeding encountered error:', err);
  }
};

// Reset Storage to Defaults
export const resetStorageToDefaults = async (): Promise<void> => {
  if (isSupabaseActive()) {
    console.log('[Supabase] Clearing database tables...');
    await sb().from('comments').delete().neq('id', '');
    await sb().from('projects').delete().neq('id', '');
    await seedSupabaseDefaults();
    
    localStorage.removeItem(UPVOTED_KEY);
    localStorage.removeItem(BUILDER_KEY);
    return;
  }

  localStorage.setItem(PROJECTS_KEY, JSON.stringify(INITIAL_PROJECTS));
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(INITIAL_COMMENTS));
  localStorage.removeItem(REGISTERED_BUILDERS_KEY);
  localStorage.removeItem(UPVOTED_KEY);
  localStorage.removeItem(BUILDER_KEY);
  getRegisteredBuilders();
};

export const getProjects = async (): Promise<Project[]> => {
  if (isSupabaseActive()) {
    await seedSupabaseDefaults();
    const { data, error } = await sb()
      .from('projects')
      .select('*')
      .order('createdAt', { ascending: false });
    
    if (error) {
      console.error('[Supabase] Error loading projects:', error);
      return [];
    }
    return data || [];
  }

  // LocalStorage Fallback
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

export const saveProjects = async (projects: Project[]): Promise<void> => {
  if (isSupabaseActive()) {
    // Omit githubStars since the column does not exist in the Supabase schema
    const sanitized = projects.map(({ githubStars, ...p }: any) => p);
    const { error } = await sb()
      .from('projects')
      .upsert(sanitized);
    if (error) {
      console.error('[Supabase] Error saving projects:', error);
    }
    return;
  }
  saveProjectsSync(projects);
};

export const addProject = async (
  project: Omit<Project, 'id' | 'upvotes' | 'createdAt' | 'isFeatured' | 'isApproved'>
): Promise<Project> => {
  const newProject: Project = {
    ...project,
    id: 'proj_' + Math.random().toString(36).substr(2, 9),
    upvotes: 0,
    createdAt: new Date().toISOString(),
    isFeatured: false,
    isApproved: false,
  };

  if (isSupabaseActive()) {
    // Omit githubStars since the column does not exist in the Supabase schema
    const { githubStars, ...payload } = newProject as any;
    const { error } = await sb()
      .from('projects')
      .insert(payload);
    if (error) {
      console.error('[Supabase] Error adding project:', error);
      throw new Error(error.message || JSON.stringify(error));
    }
    return newProject;
  }

  const projects = getProjectsSync();
  projects.push(newProject);
  saveProjectsSync(projects);
  return newProject;
};

export const updateProject = async (project: Project): Promise<void> => {
  if (isSupabaseActive()) {
    // Omit githubStars since the column does not exist in the Supabase schema
    const { githubStars, ...payload } = project as any;
    const { error } = await sb()
      .from('projects')
      .update(payload)
      .eq('id', project.id);
    if (error) {
      console.error('[Supabase] Error updating project:', error);
    }
    return;
  }

  const projects = getProjectsSync();
  const index = projects.findIndex((p) => p.id === project.id);
  if (index !== -1) {
    projects[index] = project;
    saveProjectsSync(projects);
  }
};

export const incrementViews = async (projectId: string): Promise<void> => {
  if (isSupabaseActive()) {
    const { data, error: fetchError } = await sb()
      .from('projects')
      .select('views')
      .eq('id', projectId)
      .single();
    if (!fetchError && data) {
      const { error } = await sb()
        .from('projects')
        .update({ views: (data.views || 0) + 1 })
        .eq('id', projectId);
      if (error) {
        console.error('[Supabase] Error updating views:', error);
      }
    }
    return;
  }

  const projects = getProjectsSync();
  const index = projects.findIndex((p) => p.id === projectId);
  if (index !== -1) {
    projects[index].views = (projects[index].views || 0) + 1;
    saveProjectsSync(projects);
  }
};

export const deleteProject = async (projectId: string): Promise<void> => {
  if (isSupabaseActive()) {
    // Delete project row (cascade will clean up comments if configured, but delete explicitly to cover all bases)
    await sb().from('comments').delete().eq('projectId', projectId);
    const { error } = await sb().from('projects').delete().eq('id', projectId);
    if (error) {
      console.error('[Supabase] Error deleting project:', error);
    }
    return;
  }

  const projects = getProjectsSync();
  const updatedProjects = projects.filter((p) => p.id !== projectId);
  saveProjectsSync(updatedProjects);

  const comments = getCommentsSync();
  const updatedComments = comments.filter((c) => c.projectId !== projectId);
  saveCommentsSync(updatedComments);
};

// Comments API
export const getComments = async (): Promise<Comment[]> => {
  if (isSupabaseActive()) {
    const { data, error } = await sb()
      .from('comments')
      .select('*')
      .order('timestamp', { ascending: false });
    if (error) {
      console.error('[Supabase] Error getting comments:', error);
      return [];
    }
    return data || [];
  }

  return getCommentsSync();
};

export const getCommentsForProject = async (projectId: string): Promise<Comment[]> => {
  if (isSupabaseActive()) {
    const { data, error } = await sb()
      .from('comments')
      .select('*')
      .eq('projectId', projectId)
      .order('timestamp', { ascending: true });
    if (error) {
      console.error('[Supabase] Error getting project comments:', error);
      return [];
    }
    return data || [];
  }

  return getCommentsSync().filter((c) => c.projectId === projectId);
};

export const saveComments = async (comments: Comment[]): Promise<void> => {
  if (isSupabaseActive()) {
    const { error } = await sb()
      .from('comments')
      .upsert(comments);
    if (error) {
      console.error('[Supabase] Error saving comments:', error);
    }
    return;
  }
  saveCommentsSync(comments);
};

export const addComment = async (
  projectId: string,
  author: string,
  text: string,
  rating: number
): Promise<Comment> => {
  const newComment: Comment = {
    id: 'comm_' + Math.random().toString(36).substr(2, 9),
    projectId,
    author: author || 'Anonymous Builder',
    text,
    rating,
    timestamp: new Date().toISOString(),
  };

  if (isSupabaseActive()) {
    const { error } = await sb()
      .from('comments')
      .insert(newComment);
    if (error) {
      console.error('[Supabase] Error adding comment:', error);
    }
    return newComment;
  }

  const comments = getCommentsSync();
  comments.push(newComment);
  saveCommentsSync(comments);
  return newComment;
};

export const deleteComment = async (commentId: string): Promise<void> => {
  if (isSupabaseActive()) {
    const { error } = await sb()
      .from('comments')
      .delete()
      .eq('id', commentId);
    if (error) {
      console.error('[Supabase] Error deleting comment:', error);
    }
    return;
  }

  const comments = getCommentsSync();
  const updatedComments = comments.filter((c) => c.id !== commentId);
  saveCommentsSync(updatedComments);
};

// Upvote Tracker API
export const getUpvotedProjects = (): string[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(UPVOTED_KEY);
  return data ? JSON.parse(data) : [];
};

export const toggleUpvote = async (
  projectId: string
): Promise<{ success: boolean; upvotes: number; upvoted: boolean }> => {
  const upvoted = getUpvotedProjects();
  const isUpvoted = upvoted.includes(projectId);
  let newUpvotedList = [...upvoted];

  if (isUpvoted) {
    newUpvotedList = newUpvotedList.filter((id) => id !== projectId);
  } else {
    newUpvotedList.push(projectId);
  }

  if (isSupabaseActive()) {
    const { data, error: fetchError } = await sb()
      .from('projects')
      .select('upvotes')
      .eq('id', projectId)
      .single();
    
    if (fetchError || !data) {
      return { success: false, upvotes: 0, upvoted: false };
    }

    const newUpvotes = Math.max(0, data.upvotes + (isUpvoted ? -1 : 1));
    const { error } = await sb()
      .from('projects')
      .update({ upvotes: newUpvotes })
      .eq('id', projectId);
    
    if (error) {
      console.error('[Supabase] Error updating upvotes:', error);
      return { success: false, upvotes: data.upvotes, upvoted: isUpvoted };
    }

    localStorage.setItem(UPVOTED_KEY, JSON.stringify(newUpvotedList));
    return { success: true, upvotes: newUpvotes, upvoted: !isUpvoted };
  }

  // Fallback
  const projects = getProjectsSync();
  const projectIndex = projects.findIndex((p) => p.id === projectId);
  if (projectIndex === -1) return { success: false, upvotes: 0, upvoted: false };

  const newUpvotes = Math.max(0, projects[projectIndex].upvotes + (isUpvoted ? -1 : 1));
  projects[projectIndex].upvotes = newUpvotes;
  saveProjectsSync(projects);
  localStorage.setItem(UPVOTED_KEY, JSON.stringify(newUpvotedList));

  return { success: true, upvotes: newUpvotes, upvoted: !isUpvoted };
};

// Builder Profiles Persistent API
export const getBuilderById = async (builderId: string): Promise<Builder | null> => {
  if (isSupabaseActive()) {
    const { data, error } = await sb()
      .from('builders')
      .select('*')
      .eq('id', builderId)
      .single();
    if (error) {
      return null;
    }
    return data;
  }

  // Fallback
  const builders = getRegisteredBuilders();
  return builders.find((b) => b.id === builderId) || null;
};

export const getAllBuilders = async (): Promise<Builder[]> => {
  if (isSupabaseActive()) {
    const { data, error } = await sb()
      .from('builders')
      .select('*')
      .order('name', { ascending: true });
    if (error) {
      console.error('[Supabase] Error getting builders:', error);
      return [];
    }
    return data || [];
  }

  // Fallback
  return getRegisteredBuilders().map(({ passphrase, ...b }) => b);
};

export const saveBuilderProfile = async (builder: Builder): Promise<void> => {
  if (isSupabaseActive()) {
    const { error } = await sb()
      .from('builders')
      .upsert(builder);
    if (error) {
      console.error('[Supabase] Error saving builder profile:', error);
      throw new Error(error.message || JSON.stringify(error));
    }
    return;
  }

  // Fallback
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
  const index = builders.findIndex((existing) => existing.id === builder.id);
  if (index !== -1) {
    builders[index] = { ...builders[index], ...builder };
  } else {
    builders.push(builder);
  }
  localStorage.setItem(key, JSON.stringify(builders));
};

// Builder Authentication Simulation API (Local sync remains unchanged)
export const getCurrentBuilder = (): Builder | null => {
  if (typeof window === 'undefined') return null;
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
  localStorage.setItem(BUILDER_KEY, JSON.stringify(newBuilder));
  return newBuilder;
};

export const loginBuilder = (xHandle: string, discordUsername: string): Builder => {
  const cleanX = xHandle.trim().startsWith('@') ? xHandle.trim() : `@${xHandle.trim()}`;
  const builders = getRegisteredBuilders();
  const existing = builders.find((b) => b.handle.toLowerCase() === cleanX.toLowerCase());
  
  if (existing) {
    const { passphrase, ...builderSession } = existing;
    localStorage.setItem(BUILDER_KEY, JSON.stringify(builderSession));
    return builderSession as Builder;
  }
  
  return registerBuilder(xHandle, discordUsername, 'password123');
};

export const logoutBuilder = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(BUILDER_KEY);
};

// Admin Session API
export const isAdminLoggedIn = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(ADMIN_KEY) === 'true';
};

export const loginAdmin = (passphrase: string): boolean => {
  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';
  if (passphrase === adminPassword) {
    localStorage.setItem(ADMIN_KEY, 'true');
    return true;
  }
  return false;
};

export const logoutAdmin = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ADMIN_KEY);
};

// Statistics API
export const getSystemStats = async (): Promise<SystemStats> => {
  if (isSupabaseActive()) {
    const { data: projects, error } = await sb()
      .from('projects')
      .select('upvotes, builderId');
    
    if (error || !projects) {
      console.error('[Supabase] Error loading stats:', error);
      return { totalProjects: 0, totalUpvotes: 0, activeBuilders: 0 };
    }

    const totalProjects = projects.length;
    const totalUpvotes = projects.reduce((sum, p) => sum + p.upvotes, 0);
    const uniqueBuilders = new Set(projects.map((p) => p.builderId)).size;

    return {
      totalProjects,
      totalUpvotes,
      activeBuilders: Math.max(uniqueBuilders, 4),
    };
  }

  // Fallback
  const projects = getProjectsSync();
  const totalUpvotes = projects.reduce((sum, p) => sum + p.upvotes, 0);
  const uniqueBuilders = new Set(projects.map((p) => p.builderId)).size;

  return {
    totalProjects: projects.length,
    totalUpvotes,
    activeBuilders: Math.max(uniqueBuilders, 4),
  };
};
