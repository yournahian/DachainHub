# DachainHub

An ecosystem directory, verified builder workspace, and moderation dashboard for next-generation decentralized applications built on the **DAC Quantum Blockchain**. Built with Next.js 14, Supabase, Vercel Blob, and modern Vanilla CSS.

🔗 **Live Deployment:** [https://dachainhub.vercel.app/](https://dachainhub.vercel.app/)

---

## 🚀 Key Features

### 1. Explore Dashboard
* **Dynamic Search & Filtering:** Filter dApps by Registry Category (DeFi, NFT, GameFi, Infrastructure, Tooling, Social, RWA, or custom categories) and Development Status (Live, Beta, Testnet, Concept).
* **Trending & Sorting:** Upvote projects to increase their visibility. Sort by Trending (Upvotes count), Latest submissions, or Alphabetical listing.
* **SEO-Friendly Slugs:** URLs are slugified dynamically (e.g., `/project/[id]-[slug]`) to support crawl indexing while maintaining backward compatibility for numeric IDs.

### 2. Builder Workspace
* **X (Twitter) OAuth Login:** Authenticate builder profiles securely via Twitter API v2.
* **Development Mock Login:** Sandbox bypass options are included to immediately log in as predefined developers (`Alistair` or `Elena`) for local testing.
* **Rich Developer profiles:** Link Discord username, Email address, and GitHub handles.
* **dApp Management:** Submit new dApps and manage existing listings. Includes visual alignment sliders (logo scale, cover vertical positioning) with a real-time card and page preview renderer.

### 3. Admin Moderation Terminal
* **Moderation Gate:** Secures auditing controls behind an environment-configured passphrase.
* **Status Updates:** Approve/deny project entries. Approved projects immediately join the main Explore grid; unapproved projects stay visible in the Builder Workspace as "Awaiting Moderation".
* **Comment Control:** Remove user comments and reviews.
* **Database Utilities:** Reset the remote tables to default mock datasets, or export the entire projects/comments tables as a JSON backup to your clipboard.

### 4. Technical Architecture
* **Hybrid Storage Engine:** Utilizes a real-time Supabase Postgres backend when configuration keys are present, and seamlessly falls back to local storage syncing for offline development.
* **Vercel Blob Storage:** Handles direct icon and cover image uploads, restricting payloads to Hobby-tier limits (4.5 MB max size) with client and server-side size checks.
* **Post-Quantum Cryptography Badges:** Displays lattice-based cryptographic security levels, smart contract addresses, and security audit status.

---

## 🛠️ Tech Stack
* **Framework:** Next.js 14 (App Router)
* **Backend Database:** Supabase (PostgreSQL client integration)
* **File Uploader:** Vercel Blob Storage
* **Icons:** Lucide React
* **Styling:** Vanilla CSS design system (fully mobile-responsive)
* **Language:** TypeScript

---

## 💻 Local Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yournahian/DachainHub.git
   cd DachainHub
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory and configure the following variables:
   ```env
   # Twitter / X OAuth 2.0 Credentials
   X_CLIENT_ID=your_twitter_client_id
   X_CLIENT_SECRET=your_twitter_client_secret

   # Base URL for the OAuth callback redirect
   NEXT_PUBLIC_APP_URL=http://localhost:3000

   # Session secret for cookies (32-character string)
   SESSION_SECRET=your_random_cookie_signing_secret

   # Supabase Credentials (auto-seeded on first run)
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

   # Admin Panel Passphrase
   NEXT_PUBLIC_ADMIN_PASSWORD=your_moderator_passphrase

   # Vercel Blob Read/Write Token (for cloud uploads)
   BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 🗄️ Database Tables Schema
To use a custom Supabase database, ensure you create the following tables (refer to standard `initialProjects.ts` structures):

### 1. `builders`
* `id` (Text, Primary Key)
* `name` (Text)
* `handle` (Text)
* `avatarUrl` (Text)
* `bio` (Text)
* `xHandle` (Text, Optional)
* `discordUsername` (Text, Optional)
* `email` (Text, Optional)
* `githubUsername` (Text, Optional)

### 2. `projects`
* `id` (Text, Primary Key)
* `name` (Text)
* `tagline` (Text)
* `description` (Text)
* `category` (Text)
* `status` (Text)
* `logoUrl` (Text)
* `coverImageUrl` (Text, Optional)
* `coverImagePositionY` (Int4, Default: 50)
* `logoScale` (Int4, Default: 100)
* `bannerColor` (Text)
* `upvotes` (Int4, Default: 0)
* `views` (Int4, Default: 0)
* `team` (Text Array)
* `techStack` (Text Array)
* `tags` (Text Array)
* `isFeatured` (Boolean, Default: false)
* `isApproved` (Boolean, Default: false)
* `createdAt` (Timestampz)
* `builderId` (Text, Foreign Key -> `builders.id`)
* `securityDetails` (JSONB)

### 3. `comments`
* `id` (Text, Primary Key)
* `projectId` (Text, Foreign Key -> `projects.id`)
* `author` (Text)
* `text` (Text)
* `rating` (Int4)
* `timestamp` (Timestampz)

*Note: Database auto-seeding is built into the codebase and will run automatically on the first page load if the tables are active and empty.*
