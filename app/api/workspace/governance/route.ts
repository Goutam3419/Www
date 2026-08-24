import { NextRequest, NextResponse } from 'next/server';
import { workspaceGovernanceEngine } from '@/services/workspace/workspace-governance-engine';
import { usageControlEngine } from '@/services/workspace/usage-control-engine';
import { permissionEngine } from '@/services/workspace/permission-engine';
import { workspaceMembershipEngine } from '@/services/workspace/workspace-membership-engine';
import { WorkspaceResourceType } from '@/packages/types/src';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId') || 'ws_enterprise_01';
    const userId = searchParams.get('userId') || 'usr_ceo_001';

    // 1. Membership Validation
    const membership = workspaceMembershipEngine.validateMembership(workspaceId, userId);
    if (!membership.isValid) {
      return NextResponse.json({ success: false, error: `User ${userId} is not a member of workspace ${workspaceId}` }, { status: 403 });
    }

    // 2. Permission Evaluation
    const permResult = permissionEngine.evaluatePermission({
      workspaceId,
      userId,
      permission: 'workspace:view'
    });

    if (!permResult.allowed) {
      return NextResponse.json({ success: false, error: permResult.reason }, { status: 403 });
    }

    const overview = workspaceGovernanceEngine.getGovernanceOverview(workspaceId);

    return NextResponse.json({
      success: true,
      data: { overview }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Governance GET failed' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      action,
      workspaceId,
      userId,
      resourceType,
      delta,
      newLimit,
      warningThresholdPercent,
      actionContext
    } = body;

    if (!workspaceId || !userId) {
      return NextResponse.json({ success: false, error: 'workspaceId and userId are required' }, { status: 400 });
    }

    // 1. Membership & Role Validation
    const membership = workspaceMembershipEngine.validateMembership(workspaceId, userId);
    if (!membership.isValid) {
      return NextResponse.json({ success: false, error: `User ${userId} is not a member of workspace ${workspaceId}` }, { status: 403 });
    }

    if (action === 'CHECK_QUOTA') {
      if (!resourceType) {
        return NextResponse.json({ success: false, error: 'resourceType is required' }, { status: 400 });
      }
      const quotaResult = usageControlEngine.validateQuota(
        workspaceId,
        resourceType as WorkspaceResourceType,
        delta || 1
      );
      return NextResponse.json({ success: true, data: { quotaResult } });
    }

    if (action === 'RECORD_USAGE') {
      if (!resourceType) {
        return NextResponse.json({ success: false, error: 'resourceType is required' }, { status: 400 });
      }

      // Permission check for executing tools / operations
      const permResult = permissionEngine.evaluatePermission({
        workspaceId,
        userId,
        permission: 'tool:execute'
      });

      if (!permResult.allowed) {
        return NextResponse.json({ success: false, error: permResult.reason }, { status: 403 });
      }

      const usageResult = usageControlEngine.recordUsage(
        workspaceId,
        resourceType as WorkspaceResourceType,
        delta || 1,
        userId,
        actionContext || 'API Request Execution'
      );

      if (!usageResult.validation.allowed) {
        return NextResponse.json(
          {
            success: false,
            error: usageResult.validation.reason,
            data: usageResult
          },
          { status: 429 } // Quota exceeded / rate limit status
        );
      }

      return NextResponse.json({ success: true, data: usageResult });
    }

    if (action === 'UPDATE_POLICY_LIMIT') {
      if (!resourceType || typeof newLimit !== 'number') {
        return NextResponse.json({ success: false, error: 'resourceType and numeric newLimit are required' }, { status: 400 });
      }

      // Requires settings:manage or workspace:manage permission
      const permResult = permissionEngine.evaluatePermission({
        workspaceId,
        userId,
        permission: 'settings:manage'
      });

      if (!permResult.allowed) {
        return NextResponse.json({ success: false, error: permResult.reason }, { status: 403 });
      }

      const updatedPolicy = workspaceGovernanceEngine.updateResourceLimit(
        workspaceId,
        resourceType as WorkspaceResourceType,
        newLimit,
        warningThresholdPercent
      );

      return NextResponse.json({ success: true, data: { policy: updatedPolicy } });
    }

    if (action === 'RESET_USAGE') {
      const permResult = permissionEngine.evaluatePermission({
        workspaceId,
        userId,
        permission: 'settings:manage'
      });

      if (!permResult.allowed) {
        return NextResponse.json({ success: false, error: permResult.reason }, { status: 403 });
      }

      usageControlEngine.resetUsage(workspaceId, resourceType as WorkspaceResourceType);
      const overview = workspaceGovernanceEngine.getGovernanceOverview(workspaceId);

      return NextResponse.json({ success: true, data: { overview } });
    }

    return NextResponse.json({ success: false, error: `Invalid action: ${action}` }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Governance POST operation failed' },
      { status: 500 }
    );
  }
}
