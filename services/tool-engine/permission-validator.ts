import { ToolDefinition, ToolExecutionContext, PermissionValidationResult } from '@/packages/types/src';
import { db } from '@/lib/db/store';

export class PermissionValidatorService {
  /**
   * Comprehensive validation covering Workspace, Project, Role, Ownership, and Tool Permission.
   */
  public validate(
    tool: ToolDefinition,
    context: Partial<ToolExecutionContext>
  ): PermissionValidationResult {
    const errors: string[] = [];
    const missingPermissions: string[] = [];

    // 1. Workspace Validation
    let workspaceValid = true;
    if (!context.workspaceId || context.workspaceId.trim() === '') {
      workspaceValid = false;
      errors.push('Workspace ID is missing or invalid.');
    } else {
      const ws = db.getWorkspace(context.workspaceId);
      if (!ws) {
        workspaceValid = false;
        errors.push(`Workspace '${context.workspaceId}' not found or inactive.`);
      }
    }

    // 2. Project Validation
    let projectValid = true;
    if (context.projectId) {
      const proj = db.getCodeProject(context.projectId);
      if (!proj) {
        projectValid = false;
        errors.push(`Code Project '${context.projectId}' not found.`);
      }
    }

    // 3. Role Validation
    let roleValid = true;
    const role = context.userRole || 'MEMBER';
    if (role === 'GUEST') {
      if (tool.dangerLevel !== 'Safe') {
        roleValid = false;
        errors.push(`Guest users can only execute Safe level tools.`);
      }
    } else if (role === 'VIEWER') {
      if (tool.dangerLevel !== 'Safe') {
        roleValid = false;
        errors.push(`Viewer role cannot execute non-safe tool '${tool.name}'.`);
      }
    }

    // 4. Ownership Validation
    let ownershipValid = true;
    if (!context.userId || context.userId.trim() === '') {
      ownershipValid = false;
      errors.push('User ID missing from execution context.');
    }

    // 5. Tool Permission Validation
    let toolPermissionValid = true;
    const requiredPerms = tool.requiredPermissions || [];
    const userPerms = new Set(context.permissions || ['fs:read', 'code:execute', 'tool:read']);

    for (const reqPerm of requiredPerms) {
      if (!userPerms.has(reqPerm) && role !== 'ADMIN' && role !== 'CEO') {
        missingPermissions.push(reqPerm);
      }
    }

    if (missingPermissions.length > 0) {
      toolPermissionValid = false;
      errors.push(`Missing required tool permissions: ${missingPermissions.join(', ')}.`);
    }

    const isValid = workspaceValid && projectValid && roleValid && ownershipValid && toolPermissionValid;

    return {
      valid: isValid,
      workspaceValid,
      projectValid,
      roleValid,
      ownershipValid,
      toolPermissionValid,
      missingPermissions,
      errors
    };
  }
}

export const permissionValidatorService = new PermissionValidatorService();
