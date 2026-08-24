import { WorkspaceRole, WorkspacePermissionKey, RBACRoleDefinition } from '@/packages/types/src';

export const ROLE_HIERARCHY_RANKS: Record<WorkspaceRole, number> = {
  OWNER: 100,
  ADMIN: 80,
  MANAGER: 60,
  MEMBER: 40,
  VIEWER: 20
};

export const ROLE_DEFINITIONS: Record<WorkspaceRole, RBACRoleDefinition> = {
  OWNER: {
    role: 'OWNER',
    rank: 100,
    description: 'Full workspace authority, administrative settings, billing, member management, and security governance.',
    defaultPermissions: [
      'workspace:manage',
      'workspace:view',
      'member:invite',
      'member:manage',
      'member:remove',
      'project:create',
      'project:read',
      'project:update',
      'project:delete',
      'agent:manage',
      'agent:execute',
      'task:create',
      'task:execute',
      'task:approve',
      'chat:read',
      'chat:write',
      'memory:read',
      'memory:write',
      'knowledge:read',
      'knowledge:manage',
      'integration:manage',
      'tool:execute',
      'code:generate',
      'code:refactor',
      'deployment:trigger',
      'deployment:manage',
      'logs:read',
      'settings:manage'
    ]
  },
  ADMIN: {
    role: 'ADMIN',
    rank: 80,
    inheritsFrom: 'MANAGER',
    description: 'Administrative workspace scope, member management, orchestration trigger, code generation, and deployment permissions.',
    defaultPermissions: [
      'workspace:view',
      'member:invite',
      'member:manage',
      'project:create',
      'project:read',
      'project:update',
      'project:delete',
      'agent:manage',
      'agent:execute',
      'task:create',
      'task:execute',
      'task:approve',
      'chat:read',
      'chat:write',
      'memory:read',
      'memory:write',
      'knowledge:read',
      'knowledge:manage',
      'integration:manage',
      'tool:execute',
      'code:generate',
      'code:refactor',
      'deployment:trigger',
      'deployment:manage',
      'logs:read',
      'settings:manage'
    ]
  },
  MANAGER: {
    role: 'MANAGER',
    rank: 60,
    inheritsFrom: 'MEMBER',
    description: 'Operational team management, task approval gates, agent orchestration, and memory/knowledge curation.',
    defaultPermissions: [
      'workspace:view',
      'member:invite',
      'project:create',
      'project:read',
      'project:update',
      'agent:manage',
      'agent:execute',
      'task:create',
      'task:execute',
      'task:approve',
      'chat:read',
      'chat:write',
      'memory:read',
      'memory:write',
      'knowledge:read',
      'knowledge:manage',
      'tool:execute',
      'code:generate',
      'code:refactor',
      'logs:read'
    ]
  },
  MEMBER: {
    role: 'MEMBER',
    rank: 40,
    inheritsFrom: 'VIEWER',
    description: 'Standard software development, agent task execution, code generation, chat, and memory reading.',
    defaultPermissions: [
      'workspace:view',
      'project:read',
      'agent:execute',
      'task:create',
      'task:execute',
      'chat:read',
      'chat:write',
      'memory:read',
      'knowledge:read',
      'tool:execute',
      'code:generate',
      'logs:read'
    ]
  },
  VIEWER: {
    role: 'VIEWER',
    rank: 20,
    description: 'Read-only access to workspace analytics, project overview, chat history, and execution logs.',
    defaultPermissions: [
      'workspace:view',
      'project:read',
      'chat:read',
      'memory:read',
      'knowledge:read',
      'logs:read'
    ]
  }
};

export class WorkspaceRBACEngine {
  public getRoleDefinition(role: WorkspaceRole): RBACRoleDefinition {
    return ROLE_DEFINITIONS[role] || ROLE_DEFINITIONS.VIEWER;
  }

  public getRolePermissions(role: WorkspaceRole): WorkspacePermissionKey[] {
    const def = this.getRoleDefinition(role);
    const perms = new Set<WorkspacePermissionKey>(def.defaultPermissions);

    // Support role inheritance
    if (def.inheritsFrom) {
      const parentPerms = this.getRolePermissions(def.inheritsFrom);
      parentPerms.forEach(p => perms.add(p));
    }

    return Array.from(perms);
  }

  public hasPermission(role: WorkspaceRole, permission: WorkspacePermissionKey): boolean {
    const rolePerms = this.getRolePermissions(role);
    return rolePerms.includes(permission);
  }

  public compareRoles(roleA: WorkspaceRole, roleB: WorkspaceRole): number {
    return (ROLE_HIERARCHY_RANKS[roleA] || 0) - (ROLE_HIERARCHY_RANKS[roleB] || 0);
  }

  public validateRoleAssignment(assignerRole: WorkspaceRole, targetRoleToAssign: WorkspaceRole): boolean {
    // OWNER can assign any role including OWNER and ADMIN
    if (assignerRole === 'OWNER') return true;

    // Others cannot assign roles equal to or higher than their own rank
    const assignerRank = ROLE_HIERARCHY_RANKS[assignerRole] || 0;
    const targetRank = ROLE_HIERARCHY_RANKS[targetRoleToAssign] || 0;

    return assignerRank > targetRank;
  }
}

export const workspaceRBACEngine = new WorkspaceRBACEngine();
