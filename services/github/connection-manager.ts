import {
  GitHubConnection,
  GitHubConnectionStatus,
  GitHubAccount
} from '@/packages/types/src';
import { db } from '@/lib/db/store';

export interface ConnectGitHubInput {
  userId: string;
  workspaceId?: string;
  account: GitHubAccount;
  oauthSessionId?: string;
}

export class GitHubConnectionManagerService {
  /**
   * Initialize or connect a user's GitHub account architecture
   */
  public connect(input: ConnectGitHubInput): GitHubConnection {
    const existing = db.getGitHubConnection(input.userId);

    const connection: GitHubConnection = {
      id: existing ? existing.id : `gh_conn_${Date.now()}`,
      userId: input.userId,
      workspaceId: input.workspaceId || existing?.workspaceId,
      status: 'CONNECTED',
      account: input.account,
      oauthSessionId: input.oauthSessionId || existing?.oauthSessionId,
      lastValidatedAt: new Date().toISOString(),
      createdAt: existing ? existing.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return db.saveGitHubConnection(connection);
  }

  /**
   * Disconnect user's GitHub integration
   */
  public disconnect(userId: string): GitHubConnection | undefined {
    const connection = db.getGitHubConnection(userId);
    if (!connection) return undefined;

    connection.status = 'DISCONNECTED';
    connection.updatedAt = new Date().toISOString();

    return db.saveGitHubConnection(connection);
  }

  /**
   * Reconnect GitHub integration
   */
  public reconnect(userId: string, oauthSessionId?: string): GitHubConnection | undefined {
    const connection = db.getGitHubConnection(userId);
    if (!connection) return undefined;

    connection.status = 'CONNECTED';
    if (oauthSessionId) {
      connection.oauthSessionId = oauthSessionId;
    }
    connection.lastValidatedAt = new Date().toISOString();
    connection.updatedAt = new Date().toISOString();

    return db.saveGitHubConnection(connection);
  }

  /**
   * Get GitHub connection status for user
   */
  public getConnectionStatus(userId: string): {
    status: GitHubConnectionStatus;
    connection?: GitHubConnection;
    isConnected: boolean;
  } {
    const connection = db.getGitHubConnection(userId);
    if (!connection) {
      return { status: 'DISCONNECTED', isConnected: false };
    }

    return {
      status: connection.status,
      connection,
      isConnected: connection.status === 'CONNECTED'
    };
  }

  /**
   * Validate token structural architecture (dry-run check)
   */
  public validateToken(token: string): { valid: boolean; reason?: string } {
    if (!token || token.trim() === '') {
      return { valid: false, reason: 'Token is empty or missing.' };
    }
    if (!token.startsWith('ghp_') && !token.startsWith('gho_') && !token.startsWith('github_pat_')) {
      return { valid: false, reason: 'Token does not match expected GitHub token prefix (ghp_, gho_, github_pat_).' };
    }
    return { valid: true };
  }
}

export const gitHubConnectionManagerService = new GitHubConnectionManagerService();
