import { GitHubPermissionValidationResult } from '@/packages/types/src';
import { gitHubConnectionManagerService } from './connection-manager';
import { oAuthSessionManagerService } from './oauth-session-manager';
import { repositoryMetadataService } from './repo-metadata-service';

export interface ValidateGitHubPermissionsInput {
  userId: string;
  repoFullName?: string;
  requiredScopes?: string[];
  requiredPermissionLevel?: 'pull' | 'push' | 'admin';
}

export class GitHubPermissionValidatorService {
  /**
   * Validates GitHub permissions, access, OAuth scopes, and repository access levels.
   */
  public validate(input: ValidateGitHubPermissionsInput): GitHubPermissionValidationResult {
    const errors: string[] = [];
    const missingScopes: string[] = [];

    // 1. Connection check
    const connStatus = gitHubConnectionManagerService.getConnectionStatus(input.userId);
    if (!connStatus.isConnected || !connStatus.connection) {
      errors.push('User is not connected to GitHub.');
      return {
        valid: false,
        hasRepoAccess: false,
        hasAdminPermission: false,
        hasPushPermission: false,
        hasPullPermission: false,
        missingScopes: input.requiredScopes || [],
        errors
      };
    }

    // 2. OAuth Session check
    let hasValidSession = false;
    if (connStatus.connection.oauthSessionId) {
      const session = oAuthSessionManagerService.getSession(connStatus.connection.oauthSessionId);
      if (session) {
        if (oAuthSessionManagerService.isExpired(session)) {
          errors.push('GitHub OAuth session has expired.');
        } else {
          hasValidSession = true;
          // Scope validation
          const reqScopes = input.requiredScopes || ['repo'];
          const scopeCheck = oAuthSessionManagerService.validateScopes(session, reqScopes);
          if (!scopeCheck.valid) {
            missingScopes.push(...scopeCheck.missingScopes);
            errors.push(`Missing required GitHub OAuth scopes: ${scopeCheck.missingScopes.join(', ')}.`);
          }
        }
      } else {
        errors.push('Associated GitHub OAuth session not found.');
      }
    } else {
      errors.push('No OAuth session linked to GitHub connection.');
    }

    // 3. Repo permissions check (if repo specified)
    let hasRepoAccess = true;
    let hasAdmin = true;
    let hasPush = true;
    let hasPull = true;

    if (input.repoFullName) {
      const repoMeta = repositoryMetadataService.getMetadata(input.repoFullName);
      if (repoMeta) {
        hasAdmin = repoMeta.permissions.admin;
        hasPush = repoMeta.permissions.push;
        hasPull = repoMeta.permissions.pull;

        const reqLevel = input.requiredPermissionLevel || 'push';
        if (reqLevel === 'admin' && !hasAdmin) {
          hasRepoAccess = false;
          errors.push(`Admin permission required for repository '${input.repoFullName}'.`);
        } else if (reqLevel === 'push' && !hasPush) {
          hasRepoAccess = false;
          errors.push(`Push permission required for repository '${input.repoFullName}'.`);
        } else if (reqLevel === 'pull' && !hasPull) {
          hasRepoAccess = false;
          errors.push(`Pull permission required for repository '${input.repoFullName}'.`);
        }
      } else {
        // If repo not registered yet in metadata store, flag as unchecked/requires metadata
        hasRepoAccess = true;
      }
    }

    const isValid = connStatus.isConnected && hasValidSession && missingScopes.length === 0 && errors.length === 0;

    return {
      valid: isValid,
      hasRepoAccess,
      hasAdminPermission: hasAdmin,
      hasPushPermission: hasPush,
      hasPullPermission: hasPull,
      missingScopes,
      errors
    };
  }
}

export const gitHubPermissionValidatorService = new GitHubPermissionValidatorService();
