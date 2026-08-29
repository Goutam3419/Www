import { NextRequest, NextResponse } from 'next/server';
import { resourceAccessGuard } from '@/services/workspace/resource-access-guard';
import { WorkspacePermissionKey } from '@/packages/types/src';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      workspaceId,
      userId,
      resourceType,
      resourceId,
      resourceWorkspaceId,
      requiredPermission
    } = body;

    if (!workspaceId || !userId || !resourceType || !resourceId || !resourceWorkspaceId || !requiredPermission) {
      return NextResponse.json(
        { success: false, error: 'Missing required guard parameters (workspaceId, userId, resourceType, resourceId, resourceWorkspaceId, requiredPermission)' },
        { status: 400 }
      );
    }

    const guardResult = resourceAccessGuard.guardAccess({
      workspaceId,
      userId,
      resourceType,
      resourceId,
      resourceWorkspaceId,
      requiredPermission: requiredPermission as WorkspacePermissionKey
    });

    if (!guardResult.granted) {
      return NextResponse.json(
        {
          success: false,
          granted: false,
          error: guardResult.denialReason,
          data: { guardResult }
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      granted: true,
      data: { guardResult }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Access Guard evaluation failed' },
      { status: 500 }
    );
  }
}
