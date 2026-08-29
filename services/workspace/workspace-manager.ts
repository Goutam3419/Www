import { WorkspaceProfile, WorkspaceSettings, WorkspaceStatus } from '@/packages/types/src';
import { dbStore } from '@/lib/db/store';

export class WorkspaceManager {
  public getWorkspace(workspaceId: string): WorkspaceProfile {
    let ws = dbStore.getWorkspaceProfile(workspaceId);
    if (!ws) {
      ws = {
        id: workspaceId,
        name: workspaceId === 'ws_startup_02' ? 'NextGen FinTech Accelerator Workspace' : 'Global AI Enterprise Platform',
        slug: workspaceId.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        description: 'Multi-Tenant Enterprise Isolation Container',
        status: 'ACTIVE',
        ownerUserId: 'usr_ceo_001',
        ownerEmail: 'ceo@aistudio.io',
        settings: {
          allowMemberInvite: true,
          maxMembers: 50,
          defaultRole: 'MEMBER',
          defaultProjectDomain: 'enterprise.aistudio.internal',
          enforcementMode: 'STRICT'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      dbStore.saveWorkspaceProfile(ws);
    }
    return ws;
  }

  public getAllWorkspaces(): WorkspaceProfile[] {
    return dbStore.getAllWorkspaceProfiles();
  }

  public createWorkspace(
    name: string,
    description: string,
    ownerUserId: string = 'usr_ceo_001',
    ownerEmail: string = 'ceo@aistudio.io',
    settings?: Partial<WorkspaceSettings>
  ): WorkspaceProfile {
    const id = `ws_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const newWs: WorkspaceProfile = {
      id,
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      description,
      status: 'ACTIVE',
      ownerUserId,
      ownerEmail,
      settings: {
        allowMemberInvite: settings?.allowMemberInvite ?? true,
        maxMembers: settings?.maxMembers ?? 25,
        defaultRole: settings?.defaultRole ?? 'MEMBER',
        defaultProjectDomain: settings?.defaultProjectDomain ?? `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.aistudio.io`,
        enforcementMode: settings?.enforcementMode ?? 'STRICT'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    dbStore.saveWorkspaceProfile(newWs);

    // Auto add owner as OWNER role member
    dbStore.addWorkspaceMember(id, {
      userId: ownerUserId,
      email: ownerEmail,
      name: ownerUserId === 'usr_ceo_001' ? 'Goutam (AI CEO Owner)' : 'Workspace Owner',
      role: 'OWNER',
      status: 'ACTIVE'
    });

    return newWs;
  }

  public updateWorkspaceSettings(workspaceId: string, updates: Partial<WorkspaceSettings>): WorkspaceProfile {
    const ws = this.getWorkspace(workspaceId);
    ws.settings = { ...ws.settings, ...updates };
    ws.updatedAt = new Date().toISOString();
    return dbStore.saveWorkspaceProfile(ws);
  }

  public updateWorkspaceStatus(workspaceId: string, status: WorkspaceStatus): WorkspaceProfile {
    const ws = this.getWorkspace(workspaceId);
    ws.status = status;
    ws.updatedAt = new Date().toISOString();
    return dbStore.saveWorkspaceProfile(ws);
  }
}

export const workspaceManager = new WorkspaceManager();
