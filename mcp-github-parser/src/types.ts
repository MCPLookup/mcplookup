/**
 * GitHub API Types
 */

export interface GitHubRepo {
  name: string;
  fullName: string;
  description: string | null;
  stars: number;
  url: string;
  language: string | null;
}
