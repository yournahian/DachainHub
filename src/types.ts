export interface Project {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: 'DeFi' | 'NFT' | 'GameFi' | 'Infrastructure' | 'Tooling' | 'Social' | 'RWA';
  status: 'Live' | 'Beta' | 'Testnet' | 'Concept';
  logoUrl: string;
  bannerColor: string;
  website: string;
  github: string;
  twitter: string;
  docs: string;
  team: string[];
  techStack: string[];
  tags: string[];
  securityDetails: {
    auditStatus: string;
    auditorName?: string;
    securityLevel: 'High' | 'Standard' | 'Experimental';
    pqcSafe: boolean;
  };
  views: number;
  githubStars: number;
  tokenTicker?: string;
  contractAddress?: string;
  upvotes: number;
  createdAt: string;
  builderId: string;
  isFeatured: boolean;
  isApproved: boolean;
  coverImageUrl?: string;
  coverImagePositionY?: number;
  logoScale?: number;
}

export interface Comment {
  id: string;
  projectId: string;
  author: string;
  text: string;
  rating: number;
  timestamp: string;
}

export interface Builder {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string;
  bio: string;
  xHandle?: string;
  discordUsername?: string;
  email?: string;
  githubUsername?: string;
  passphrase?: string;
}

export interface SystemStats {
  totalProjects: number;
  totalUpvotes: number;
  activeBuilders: number;
}
