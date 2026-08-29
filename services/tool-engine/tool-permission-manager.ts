import { ToolDefinition, UserRole } from '@/packages/types/src';

export class ToolPermissionManagerService {
  public checkPermission(
    tool: ToolDefinition,
    userRole: UserRole
  ): { allowed: boolean; reason?: string } {
    if (userRole === 'CEO' || userRole === 'ADMIN') {
      return { allowed: true };
    }

    if (userRole === 'ENGINEER' || userRole === 'DEVELOPER' || userRole === 'MEMBER') {
      if (tool.dangerLevel === 'Critical') {
        return {
          allowed: false,
          reason: `Role '${userRole}' cannot execute 'Critical' risk tool '${tool.name}'. Executive approval required.`
        };
      }
      return { allowed: true };
    }

    if (userRole === 'VIEWER') {
      if (tool.dangerLevel !== 'Safe') {
        return {
          allowed: false,
          reason: `Role 'VIEWER' can only execute 'Safe' tools.`
        };
      }
      return { allowed: true };
    }

    return { allowed: false, reason: 'Invalid or unknown user role.' };
  }
}

export const toolPermissionManagerService = new ToolPermissionManagerService();
