// Server-side GitHub configuration
// This file is safe to commit — it does NOT contain secrets

export const GITHUB_CONFIG = {
  owner: 'gamer-frog',
  repo: 'moba-sage',
  branch: 'main',
  notesPath: 'data/community-notes.json',
} as const;

// The actual token comes from environment variable GITHUB_TOKEN
// Set it in:
// - Vercel: Project Settings > Environment Variables
// - Local: .env.local (not committed)
// - .env.example shows the required variables
