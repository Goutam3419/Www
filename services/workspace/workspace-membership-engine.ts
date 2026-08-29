import { WorkspaceMember, WorkspaceRole, WorkspaceMemberStatus } from '@/packages/types/src';
import { dbStore } from '@/lib/db/store';
import { workspaceManager } from './workspace-manager';

export class WorkspaceMembershipEngine {
  public getMembers(workspaceId: string): WorkspaceMember[] {
    const members = dbStore.getWorkspaceMembers(workspaceId);
    if (members.length === 0) {
      // Return default owner if list empty
      const ws = workspaceManager.getWorkspace(workspaceId);
      const ownerMember: WorkspaceMember = {
        id: `mem_owner_${workspaceId}`,
        workspaceId,
        userId: ws.ownerUserId,
        email: ws.ownerEmail,
        name: 'Goutam (AI CEO Owner)',
        role: 'OWNER',
        status: 'ACTIVE',
        joinedAt: ws.createdAt
      };
      dbStore.addWorkspaceMember(workspaceId, ownerMember);
      return [ownerMember];
    }
    return members;
  }

  public registerMember(
    workspaceId: string,
    email: string,
    name: string,
    role: WorkspaceRole = 'MEMBER',
    invitedBy: string = 'usr_ceo_001'
  ): WorkspaceMember {
    const ws = workspaceManager.getWorkspace(workspaceId);
    const existingMembers = this.getMembers(workspaceId);

    if (existingMembers.length >= ws.settings.maxMembers) {
      throw new Error(`Workspace capacity limit reached (${ws.settings.maxMembers} max members).`);
    }

    const userId = `usr_${email.split('@')[0].replace(/[^a-z0-9]/gi, '_')}`;
    const newMember = dbStore.addWorkspaceMember(workspaceId, {
      userId,
      email,
      name,
      role,
      status: 'ACTIVE',
      invitedBy
    });

    return newMember;
  }

  public updateMemberRole(workspaceId: string, memberId: string, newRole: WorkspaceRole): WorkspaceMember {
    const updated = dbStore.updateWorkspaceMemberRole(workspaceId, memberId, newRole);
    if (!updated) {
      throw new Error(`Member with ID ${memberId} not found in workspace ${workspaceId}.`);
    }
    return updated;
  }

  public removeMember(workspaceId: string, memberId: string): boolean {
    const members = this.getMembers(workspaceId);
    const target = members.find(m => m.id === memberId || m.userId === memberId);
    if (target?.role === 'OWNER') {
      throw new Error('Cannot remove the workspace OWNER member.');
    }
    return dbStore.removeWorkspaceMember(workspaceId, memberId);
  }

  public validateMembership(workspaceId: string, userId: string): { isValid: boolean; role?: WorkspaceRole; member?: WorkspaceMember } {
    const members = this.getMembers(workspaceId);
    const member = members.find(m => m.userId === userId || m.email === userId);
    if (!member || member.status !== 'ACTIVE') {
      return { isValid: false };
    }
    return { isValid: true, role: member.role, member };
  }
}

export const workspaceMembershipEngine = new WorkspaceMembershipEngine();
