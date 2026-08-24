import { NextRequest, NextResponse } from 'next/server';
import { workspaceMembershipEngine } from '@/services/workspace/workspace-membership-engine';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId') || 'ws_enterprise_01';

    const members = workspaceMembershipEngine.getMembers(workspaceId);

    return NextResponse.json({
      success: true,
      data: { members }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch members' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { workspaceId, email, name, role = 'MEMBER', invitedBy = 'usr_ceo_001' } = body;

    const newMember = workspaceMembershipEngine.registerMember(workspaceId, email, name, role, invitedBy);

    return NextResponse.json({
      success: true,
      data: { member: newMember }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to invite member' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { workspaceId, memberId, role } = body;

    const updated = workspaceMembershipEngine.updateMemberRole(workspaceId, memberId, role);

    return NextResponse.json({
      success: true,
      data: { member: updated }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to update member role' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId') || 'ws_enterprise_01';
    const memberId = searchParams.get('memberId');

    if (!memberId) {
      return NextResponse.json({ success: false, error: 'memberId is required' }, { status: 400 });
    }

    const removed = workspaceMembershipEngine.removeMember(workspaceId, memberId);

    return NextResponse.json({
      success: removed,
      data: { removed }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to remove member' },
      { status: 500 }
    );
  }
}
