import { GitHubOAuthSession } from '@/packages/types/src';
import { db } from '@/lib/db/store';

export interface CreateOAuthSessionInput {
  userId: string;
  accessToken: string;
  refreshToken?: string;
  expiresInSeconds?: number;
  scopes?: string[];
  tokenType?: string;
}

export class OAuthSessionManagerService {
  /**
   * Creates and stores a GitHub OAuth Session
   */
  public createSession(input: CreateOAuthSessionInput): GitHubOAuthSession {
    const sessionId = `gh_sess_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const expiresAt = input.expiresInSeconds
      ? new Date(Date.now() + input.expiresInSeconds * 1000).toISOString()
      : undefined;

    const session: GitHubOAuthSession = {
      id: sessionId,
      userId: input.userId,
      accessToken: input.accessToken,
      refreshToken: input.refreshToken,
      expiresAt,
      scopes: input.scopes || ['repo', 'read:user', 'user:email'],
      tokenType: input.tokenType || 'bearer',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return db.saveGitHubOAuthSession(session);
  }

  /**
   * Retrieves an OAuth session by ID
   */
  public getSession(sessionId: string): GitHubOAuthSession | undefined {
    return db.getGitHubOAuthSession(sessionId);
  }

  /**
   * Refreshes OAuth session tokens & expiration state
   */
  public refreshSession(
    sessionId: string,
    newAccessToken: string,
    newRefreshToken?: string,
    expiresInSeconds?: number
  ): GitHubOAuthSession | undefined {
    const session = db.getGitHubOAuthSession(sessionId);
    if (!session) return undefined;

    session.accessToken = newAccessToken;
    if (newRefreshToken) {
      session.refreshToken = newRefreshToken;
    }
    if (expiresInSeconds) {
      session.expiresAt = new Date(Date.now() + expiresInSeconds * 1000).toISOString();
    }
    session.updatedAt = new Date().toISOString();

    return db.saveGitHubOAuthSession(session);
  }

  /**
   * Checks if an OAuth session is expired
   */
  public isExpired(session: GitHubOAuthSession): boolean {
    if (!session.expiresAt) return false;
    return new Date(session.expiresAt).getTime() <= Date.now();
  }

  /**
   * Validates whether the session contains all required GitHub OAuth scopes
   */
  public validateScopes(
    session: GitHubOAuthSession,
    requiredScopes: string[]
  ): { valid: boolean; missingScopes: string[] } {
    const currentScopes = new Set(session.scopes);
    const missingScopes: string[] = [];

    for (const req of requiredScopes) {
      if (!currentScopes.has(req)) {
        missingScopes.push(req);
      }
    }

    return {
      valid: missingScopes.length === 0,
      missingScopes
    };
  }
}

export const oAuthSessionManagerService = new OAuthSessionManagerService();
