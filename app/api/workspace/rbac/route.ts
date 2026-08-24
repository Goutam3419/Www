import { NextRequest, NextResponse } from 'next/server';
import { permissionEngine } from '@/services/workspace/permission-engine';
import { permissionAuditEngine } from '@/services/workspace/permission-audit-engine';
import { workspaceRBACEngine } from '@/services/workspace/workspace-rbac-engine';
import { workspaceMembershipEngine } from '@/services/workspace/workspace-membership-engine';
import { WorkspacePermissionKey, WorkspaceRole } from '@/packages/types/src';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId') || 'ws_enterprise_01';
    const userId = searchParams.get('userId') || 'usr_ceo_001';
    const action = searchParams.get('action');

    if (action === 'AUDIT_SUMMARY') {
      const summary = permissionAuditEngine.getSummary(workspaceId);
      return NextResponse.json({ success: true, data: { summary } });
    }

    if (action === 'ROLE_PERMISSIONS') {
      const role = (searchParams.get('role') as WorkspaceRole) || 'MEMBER';
      const permissions = workspaceRBACEngine.getRolePermissions(role);
      const definition = workspaceRBACEngine.getRoleDefinition(role);
      return NextResponse.json({ success: true, data: { role, definition, permissions } });
    }

    const summary = permissionAuditEngine.getSummary(workspaceId);
    const membership = workspaceMembershipEngine.validateMembership(workspaceId, userId);
    const userRole = membership.role || 'MEMBER';
    const userPermissions = workspaceRBACEngine.getRolePermissions(userRole);

    return NextResponse.json({
      success: true,
      data: {
        workspaceId,
        userId,
        userRole,
        userPermissions,
        auditSummary: summary
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'RBAC operation failed' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, workspaceId, userId, permission, resourceId, resourceWorkspaceId, memberId, newRole, assignerUserId } = body;

    if (!workspaceId || !userId) {
      return NextResponse.json({ success: false, error: 'workspaceId and userId are required' }, { status: 400 });
    }

    if (action === 'EVALUATE_PERMISSION') {
      const result = permissionEngine.evaluatePermission({
        workspaceId,
        userId,
        permission: permission as WorkspacePermissionKey,
        resourceId,
        resourceWorkspaceId
      });
      return NextResponse.json({ success: true, data: { evaluation: result } });
    }

    if (action === 'UPDATE_ROLE') {
      const assignerMembership = workspaceMembershipEngine.validateMembership(workspaceId, assignerUserId || userId);
      if (!assignerMembership.isValid || !assignerMembership.role) {
        return NextResponse.json({ success: false, error: 'Assigner is not an active member' }, { status: 403 });
      }

      const isValidAssignment = workspaceRBACEngine.validateRoleAssignment(assignerMembership.role, newRole as WorkspaceRole);
      if (!isValidAssignment) {
        permissionAuditEngine.logEvent(
          workspaceId,
          assignerUserId || userId,
          'ACCESS_DENIED',
          assignerMembership.role,
          `Failed role change attempt: ${assignerMembership.role} attempted to assign ${newRole} to member ${memberId}.`
        );
        return NextResponse.json(
          { success: false, error: `Role hierarchy violation: ${assignerMembership.role} cannot assign ${newRole} role.` },
          { status: 403 }
        );
      }

      const updatedMember = workspaceMembershipEngine.updateMemberRole(workspaceId, memberId, newRole as WorkspaceRole);

      permissionAuditEngine.logEvent(
        workspaceId,
        assignerUserId || userId,
        'ROLE_CHANGED',
        assignerMembership.role,
        `Role of member ${memberId} changed to ${newRole} by ${assignerMembership.role}.`,
        'member:manage',
        'MEMBER',
        memberId
      );

      return NextResponse.json({ success: true, data: { updatedMember } });
    }

    return NextResponse.json({ success: false, error: `Invalid action: ${action}` }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'RBAC POST request failed' },
      { status: 500 }
    );
  }
}
