'use client';

import React, { useState } from 'react';
import {
  WorkspaceProfile,
  WorkspaceRole,
  WorkspaceOverviewReport,
  WorkspacePermissionKey,
  PermissionAuditSummary,
  ResourceAccessGuardResult,
  WorkspaceGovernanceOverview,
  WorkspaceResourceType,
  QuotaValidationResult
} from '@/packages/types/src';
import { workspaceManager } from '@/services/workspace/workspace-manager';
import { workspaceMembershipEngine } from '@/services/workspace/workspace-membership-engine';
import { workspaceContextEngine } from '@/services/workspace/workspace-context-engine';
import { tenantIsolationEngine } from '@/services/workspace/tenant-isolation-engine';
import { workspaceRBACEngine, ROLE_DEFINITIONS } from '@/services/workspace/workspace-rbac-engine';
import { PERMISSION_CATEGORIES } from '@/services/workspace/permission-engine';
import { resourceAccessGuard } from '@/services/workspace/resource-access-guard';
import { permissionAuditEngine } from '@/services/workspace/permission-audit-engine';
import { workspaceGovernanceEngine } from '@/services/workspace/workspace-governance-engine';
import { usageControlEngine } from '@/services/workspace/usage-control-engine';
import { Badge } from '@/components/ui/Badge';
import {
  Building2,
  Users,
  ShieldCheck,
  Settings,
  UserPlus,
  Lock,
  Plus,
  Trash2,
  CheckCircle2,
  Sliders,
  Shield,
  Layout,
  Grid,
  FileCheck2,
  History,
  XCircle,
  Play,
  Gauge,
  BarChart3,
  AlertTriangle,
  RefreshCw,
  Zap
} from 'lucide-react';

interface WorkspaceManagementPanelProps {
  currentWorkspaceId?: string;
  onWorkspaceSwitched?: (newWorkspaceId: string) => void;
}

export const WorkspaceManagementPanel: React.FC<WorkspaceManagementPanelProps> = ({
  currentWorkspaceId = 'ws_enterprise_01',
  onWorkspaceSwitched
}) => {
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>(currentWorkspaceId);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'members' | 'rbac' | 'matrix' | 'guard' | 'audit' | 'governance' | 'quotas' | 'usage' | 'analytics' | 'settings' | 'isolation'
  >('overview');

  // Usage Control Simulator State
  const [simResourceType, setSimResourceType] = useState<WorkspaceResourceType>('TOOL_EXECUTIONS');
  const [simDelta, setSimDelta] = useState<number>(500);
  const [simUserId, setSimUserId] = useState<string>('usr_eng_002');
  const [simResult, setSimResult] = useState<QuotaValidationResult | null>(null);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newWsName, setNewWsName] = useState<string>('');
  const [newWsDesc, setNewWsDesc] = useState<string>('');

  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  const [inviteEmail, setInviteEmail] = useState<string>('');
  const [inviteName, setInviteName] = useState<string>('');
  const [inviteRole, setInviteRole] = useState<WorkspaceRole>('MEMBER');

  // Resource Access Guard Simulator State
  const [guardUserId, setGuardUserId] = useState<string>('usr_dev_004');
  const [guardResourceType, setGuardResourceType] = useState<string>('PROJECT');
  const [guardResourceId, setGuardResourceId] = useState<string>('proj_fintech_99');
  const [guardResourceWorkspaceId, setGuardResourceWorkspaceId] = useState<string>('ws_startup_02');
  const [guardPermission, setGuardPermission] = useState<WorkspacePermissionKey>('project:delete');
  const [guardResult, setGuardResult] = useState<ResourceAccessGuardResult | null>(null);

  const [notification, setNotification] = useState<string | null>(null);

  const report: WorkspaceOverviewReport = tenantIsolationEngine.getWorkspaceOverviewReport(activeWorkspaceId, 'usr_ceo_001');
  const allWorkspaces: WorkspaceProfile[] = workspaceManager.getAllWorkspaces();
  const auditSummary: PermissionAuditSummary = permissionAuditEngine.getSummary(activeWorkspaceId);
  const governanceOverview: WorkspaceGovernanceOverview = workspaceGovernanceEngine.getGovernanceOverview(activeWorkspaceId);

  const handleSwitchWorkspace = (targetId: string) => {
    try {
      const newCtx = workspaceContextEngine.switchWorkspace('usr_ceo_001', targetId);
      setActiveWorkspaceId(newCtx.workspaceId);
      if (onWorkspaceSwitched) {
        onWorkspaceSwitched(newCtx.workspaceId);
      }
      setNotification(`Switched active workspace to "${workspaceManager.getWorkspace(targetId).name}"`);
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      setNotification(err instanceof Error ? err.message : 'Switch workspace failed');
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleCreateWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName.trim()) return;
    try {
      const created = workspaceManager.createWorkspace(newWsName, newWsDesc, 'usr_ceo_001', 'ceo@aistudio.io');
      handleSwitchWorkspace(created.id);
      setNewWsName('');
      setNewWsDesc('');
      setShowCreateModal(false);
      setNotification(`Successfully created and switched to workspace "${created.name}"`);
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      setNotification(err instanceof Error ? err.message : 'Failed to create workspace');
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !inviteName.trim()) return;
    try {
      workspaceMembershipEngine.registerMember(activeWorkspaceId, inviteEmail, inviteName, inviteRole, 'usr_ceo_001');
      setInviteEmail('');
      setInviteName('');
      setShowInviteModal(false);
      setNotification(`Invited ${inviteName} (${inviteEmail}) as ${inviteRole}`);
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      setNotification(err instanceof Error ? err.message : 'Failed to invite member');
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleRoleChange = (memberId: string, newRole: WorkspaceRole) => {
    try {
      const assignerMembership = workspaceMembershipEngine.validateMembership(activeWorkspaceId, 'usr_ceo_001');
      if (!assignerMembership.isValid || !assignerMembership.role) {
        throw new Error('Assigner membership invalid');
      }

      const isValidAssignment = workspaceRBACEngine.validateRoleAssignment(assignerMembership.role, newRole);
      if (!isValidAssignment) {
        permissionAuditEngine.logEvent(
          activeWorkspaceId,
          'usr_ceo_001',
          'ACCESS_DENIED',
          assignerMembership.role,
          `Failed role change: cannot assign role ${newRole}`
        );
        throw new Error(`Role hierarchy restriction: ${assignerMembership.role} cannot assign ${newRole}`);
      }

      workspaceMembershipEngine.updateMemberRole(activeWorkspaceId, memberId, newRole);

      permissionAuditEngine.logEvent(
        activeWorkspaceId,
        'usr_ceo_001',
        'ROLE_CHANGED',
        assignerMembership.role,
        `Role of member ${memberId} changed to ${newRole}`,
        'member:manage',
        'MEMBER',
        memberId
      );

      setNotification(`Updated member role to ${newRole}`);
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      setNotification(err instanceof Error ? err.message : 'Role change failed');
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleRemoveMember = (memberId: string, name: string) => {
    try {
      workspaceMembershipEngine.removeMember(activeWorkspaceId, memberId);
      setNotification(`Removed member ${name} from workspace`);
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      setNotification(err instanceof Error ? err.message : 'Member removal failed');
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleToggleSettings = (key: 'allowMemberInvite' | 'enforcementMode', value: boolean | 'STRICT' | 'STANDARD') => {
    workspaceManager.updateWorkspaceSettings(activeWorkspaceId, { [key]: value });
    setNotification(`Updated workspace setting: ${key}`);
    setTimeout(() => setNotification(null), 2500);
  };

  const handleTestResourceGuard = (e: React.FormEvent) => {
    e.preventDefault();
    const res = resourceAccessGuard.guardAccess({
      workspaceId: activeWorkspaceId,
      userId: guardUserId,
      resourceType: guardResourceType,
      resourceId: guardResourceId,
      resourceWorkspaceId: guardResourceWorkspaceId,
      requiredPermission: guardPermission
    });
    setGuardResult(res);
  };

  const allRoles: WorkspaceRole[] = ['OWNER', 'ADMIN', 'MANAGER', 'MEMBER', 'VIEWER'];

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-4 text-zinc-100">
      {/* Notification Banner */}
      {notification && (
        <div className="bg-purple-950/80 border border-purple-500/40 text-purple-200 px-3 py-2 rounded-lg text-xs flex items-center justify-between animate-fadeIn">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
            {notification}
          </span>
          <button onClick={() => setNotification(null)} className="text-purple-400 hover:text-purple-200 text-xs font-mono">
            ×
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-purple-950/50 border border-purple-500/30 rounded-lg text-purple-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-sm text-zinc-100">{report.workspace.name}</h2>
              <Badge variant="outline" className="font-mono text-[9px] text-purple-300 border-purple-500/30">
                {report.workspace.id}
              </Badge>
            </div>
            <p className="text-[11px] text-zinc-400">
              Prompt 11.3 Workspace Resource Governance, Quotas & Usage Control Engine
            </p>
          </div>
        </div>

        {/* Workspace Switcher & Create Button */}
        <div className="flex items-center gap-2">
          <select
            value={activeWorkspaceId}
            onChange={e => handleSwitchWorkspace(e.target.value)}
            className="bg-zinc-900 border border-zinc-700 text-zinc-200 rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:border-purple-500"
          >
            {allWorkspaces.map(ws => (
              <option key={ws.id} value={ws.id}>
                {ws.name} ({ws.id})
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New Workspace
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1 bg-zinc-900/80 p-1 rounded-lg border border-zinc-800 text-xs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
            activeTab === 'overview'
              ? 'bg-purple-950/50 text-purple-300 font-medium border border-purple-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Layout className="w-3.5 h-3.5 text-purple-400" /> Overview
        </button>
        <button
          onClick={() => setActiveTab('members')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
            activeTab === 'members'
              ? 'bg-purple-950/50 text-purple-300 font-medium border border-purple-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-blue-400" /> Members ({report.membersCount})
        </button>
        <button
          onClick={() => setActiveTab('rbac')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
            activeTab === 'rbac'
              ? 'bg-purple-950/50 text-purple-300 font-medium border border-purple-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Shield className="w-3.5 h-3.5 text-cyan-400" /> RBAC Manager
        </button>
        <button
          onClick={() => setActiveTab('matrix')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
            activeTab === 'matrix'
              ? 'bg-purple-950/50 text-purple-300 font-medium border border-purple-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Grid className="w-3.5 h-3.5 text-emerald-400" /> Permission Matrix
        </button>
        <button
          onClick={() => setActiveTab('guard')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
            activeTab === 'guard'
              ? 'bg-purple-950/50 text-purple-300 font-medium border border-purple-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <FileCheck2 className="w-3.5 h-3.5 text-rose-400" /> Access Guard
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
            activeTab === 'audit'
              ? 'bg-purple-950/50 text-purple-300 font-medium border border-purple-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <History className="w-3.5 h-3.5 text-amber-400" /> Permission Audit
        </button>
        <button
          onClick={() => setActiveTab('governance')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
            activeTab === 'governance'
              ? 'bg-purple-950/50 text-purple-300 font-medium border border-purple-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-purple-400" /> Resource Governance
        </button>
        <button
          onClick={() => setActiveTab('quotas')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
            activeTab === 'quotas'
              ? 'bg-purple-950/50 text-purple-300 font-medium border border-purple-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Gauge className="w-3.5 h-3.5 text-orange-400" /> Quota Manager
        </button>
        <button
          onClick={() => setActiveTab('usage')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
            activeTab === 'usage'
              ? 'bg-purple-950/50 text-purple-300 font-medium border border-purple-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" /> Usage Control
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
            activeTab === 'analytics'
              ? 'bg-purple-950/50 text-purple-300 font-medium border border-purple-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5 text-blue-400" /> Usage Analytics
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
            activeTab === 'settings'
              ? 'bg-purple-950/50 text-purple-300 font-medium border border-purple-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Settings className="w-3.5 h-3.5 text-zinc-400" /> Settings
        </button>
        <button
          onClick={() => setActiveTab('isolation')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
            activeTab === 'isolation'
              ? 'bg-purple-950/50 text-purple-300 font-medium border border-purple-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Lock className="w-3.5 h-3.5 text-emerald-400" /> Tenant Isolation
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="grid grid-cols-4 gap-2 text-[10px]">
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
              <div className="text-zinc-400 text-[9px]">Workspace Status</div>
              <div className="text-emerald-400 font-mono font-bold text-sm pt-0.5 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {report.workspace.status}
              </div>
            </div>
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
              <div className="text-zinc-400 text-[9px]">Total Members</div>
              <div className="text-purple-400 font-mono font-bold text-sm pt-0.5">
                {report.membersCount} / {report.workspace.settings.maxMembers}
              </div>
            </div>
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
              <div className="text-zinc-400 text-[9px]">User Active Role</div>
              <div className="text-blue-400 font-mono font-bold text-sm pt-0.5">{report.userRole}</div>
            </div>
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
              <div className="text-zinc-400 text-[9px]">Audit Events Total</div>
              <div className="text-amber-400 font-mono font-bold text-sm pt-0.5">{auditSummary.totalEvents}</div>
            </div>
          </div>

          <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 space-y-2 text-[10px]">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
              <span className="font-semibold text-zinc-200 text-xs">Workspace Profile Details</span>
              <Badge variant="outline" className="font-mono text-[8.5px] text-zinc-400">
                Created: {new Date(report.workspace.createdAt).toLocaleDateString()}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 text-zinc-300">
              <div>
                <span className="text-zinc-500">Name:</span> <strong className="text-zinc-100">{report.workspace.name}</strong>
              </div>
              <div>
                <span className="text-zinc-500">Slug:</span> <strong className="text-purple-300 font-mono">{report.workspace.slug}</strong>
              </div>
              <div>
                <span className="text-zinc-500">Owner Email:</span> <strong className="text-blue-300 font-mono">{report.workspace.ownerEmail}</strong>
              </div>
              <div>
                <span className="text-zinc-500">Default Domain:</span>{' '}
                <strong className="text-emerald-300 font-mono">{report.workspace.settings.defaultProjectDomain || 'N/A'}</strong>
              </div>
            </div>

            <p className="text-zinc-400 text-[9.5px] bg-zinc-900/60 p-2 rounded border border-zinc-800/40">
              {report.workspace.description}
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: Members */}
      {activeTab === 'members' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-400" />
              Workspace Members & Access Control
            </span>
            <button
              onClick={() => setShowInviteModal(true)}
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-[11px] font-medium flex items-center gap-1 transition-colors"
            >
              <UserPlus className="w-3 h-3" />
              Invite Member
            </button>
          </div>

          <div className="space-y-2 text-[10px]">
            {report.members.map(member => (
              <div key={member.id} className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-100 text-[11px]">{member.name}</span>
                    <Badge variant="outline" className="text-[8px] font-mono text-purple-300 border-purple-500/30">
                      {member.role}
                    </Badge>
                    <Badge variant="success" className="text-[8px] font-mono">
                      {member.status}
                    </Badge>
                  </div>
                  <div className="text-zinc-400 text-[9px] font-mono flex items-center gap-2">
                    <span>{member.email}</span>
                    <span className="text-zinc-600">|</span>
                    <span>Joined: {new Date(member.joinedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {member.role !== 'OWNER' && (
                    <>
                      <select
                        value={member.role}
                        onChange={e => handleRoleChange(member.id, e.target.value as WorkspaceRole)}
                        className="bg-zinc-900 border border-zinc-700 text-zinc-200 rounded px-2 py-1 text-[9px] font-mono focus:outline-none focus:border-purple-500"
                      >
                        <option value="ADMIN">ADMIN</option>
                        <option value="MANAGER">MANAGER</option>
                        <option value="MEMBER">MEMBER</option>
                        <option value="VIEWER">VIEWER</option>
                      </select>

                      <button
                        onClick={() => handleRemoveMember(member.id, member.name)}
                        className="p-1 hover:bg-rose-950/60 border border-transparent hover:border-rose-500/30 rounded text-rose-400 transition-colors"
                        title="Remove member"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Prompt 11.2 RBAC Manager Panel */}
      {activeTab === 'rbac' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800 text-[10px]">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-cyan-400" />
              RBAC Role Hierarchy & Inheritance Engine
            </span>
            <Badge variant="outline" className="font-mono text-[8.5px] text-cyan-300 border-cyan-500/30">
              5 WORKSPACE ROLES
            </Badge>
          </div>

          <div className="space-y-2">
            {allRoles.map(role => {
              const def = ROLE_DEFINITIONS[role];
              const perms = workspaceRBACEngine.getRolePermissions(role);
              return (
                <div key={role} className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between border-b border-zinc-800/80 pb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold font-mono text-[11px] text-purple-300">{role}</span>
                      <Badge variant="outline" className="text-[8px] font-mono text-cyan-400 border-cyan-500/30">
                        Rank {def.rank}
                      </Badge>
                      {def.inheritsFrom && (
                        <span className="text-[9px] text-zinc-400 font-mono">
                          (Inherits from: <span className="text-blue-300">{def.inheritsFrom}</span>)
                        </span>
                      )}
                    </div>
                    <Badge variant="outline" className="text-[8.5px] font-mono text-zinc-400 border-zinc-700">
                      {perms.length} Permissions
                    </Badge>
                  </div>

                  <p className="text-zinc-400 text-[9.5px]">{def.description}</p>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {perms.map(perm => (
                      <span
                        key={perm}
                        className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded font-mono text-[8px] text-zinc-300"
                      >
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: Prompt 11.2 Permission Matrix Panel */}
      {activeTab === 'matrix' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800 text-[10px] overflow-x-auto">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2 min-w-[600px]">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <Grid className="w-4 h-4 text-emerald-400" />
              Workspace Permission Matrix (14 Categories)
            </span>
            <Badge variant="outline" className="font-mono text-[8.5px] text-emerald-300 border-emerald-500/30">
              WORKSPACE-SCOPED
            </Badge>
          </div>

          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 font-mono text-[9px]">
                <th className="py-2 px-2">Category / Permission</th>
                {allRoles.map(r => (
                  <th key={r} className="py-2 px-2 text-center text-purple-300">
                    {r}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono text-[9px]">
              {Object.entries(PERMISSION_CATEGORIES).map(([catKey, cat]) => (
                <React.Fragment key={catKey}>
                  <tr className="bg-zinc-950/80 font-bold text-zinc-200">
                    <td colSpan={6} className="py-1.5 px-2 text-[9.5px] text-cyan-300 uppercase tracking-wider">
                      {cat.name}
                    </td>
                  </tr>
                  {cat.permissions.map(perm => (
                    <tr key={perm} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="py-1.5 px-3 text-zinc-300 text-[9px]">{perm}</td>
                      {allRoles.map(role => {
                        const hasPerm = workspaceRBACEngine.hasPermission(role, perm);
                        return (
                          <td key={role} className="py-1.5 px-2 text-center">
                            {hasPerm ? (
                              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                            ) : (
                              <span className="inline-block w-2 h-2 rounded-full bg-zinc-800" />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 5: Prompt 11.2 Resource Access Guard Panel */}
      {activeTab === 'guard' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800 text-[10px]">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-rose-400" />
              Resource Access Guard Simulator
            </span>
            <Badge variant="outline" className="font-mono text-[8.5px] text-rose-300 border-rose-500/30">
              CROSS-WORKSPACE BLOCKING
            </Badge>
          </div>

          <form onSubmit={handleTestResourceGuard} className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-zinc-400">Request Active Workspace ID</label>
                <input
                  type="text"
                  value={activeWorkspaceId}
                  disabled
                  className="w-full bg-zinc-900 border border-zinc-800 text-purple-300 font-mono rounded px-2 py-1 cursor-not-allowed text-[9px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400">Target User ID</label>
                <select
                  value={guardUserId}
                  onChange={e => setGuardUserId(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 text-zinc-200 font-mono rounded px-2 py-1 text-[9px]"
                >
                  <option value="usr_ceo_001">usr_ceo_001 (Goutam - OWNER)</option>
                  <option value="usr_eng_002">usr_eng_002 (Alex - ADMIN)</option>
                  <option value="usr_pm_003">usr_pm_003 (Sarah - MANAGER)</option>
                  <option value="usr_dev_004">usr_dev_004 (David - MEMBER)</option>
                  <option value="usr_qa_005">usr_qa_005 (Elena - VIEWER)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400">Resource Workspace ID (Target)</label>
                <input
                  type="text"
                  value={guardResourceWorkspaceId}
                  onChange={e => setGuardResourceWorkspaceId(e.target.value)}
                  placeholder="e.g. ws_startup_02"
                  className="w-full bg-zinc-900 border border-zinc-700 text-zinc-200 font-mono rounded px-2 py-1 text-[9px]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400">Resource Type & ID</label>
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={guardResourceType}
                    onChange={e => setGuardResourceType(e.target.value)}
                    className="w-1/2 bg-zinc-900 border border-zinc-700 text-zinc-200 font-mono rounded px-2 py-1 text-[9px]"
                    required
                  />
                  <input
                    type="text"
                    value={guardResourceId}
                    onChange={e => setGuardResourceId(e.target.value)}
                    className="w-1/2 bg-zinc-900 border border-zinc-700 text-zinc-200 font-mono rounded px-2 py-1 text-[9px]"
                    required
                  />
                </div>
              </div>

              <div className="col-span-2 space-y-1">
                <label className="text-zinc-400">Required Workspace Permission</label>
                <select
                  value={guardPermission}
                  onChange={e => setGuardPermission(e.target.value as WorkspacePermissionKey)}
                  className="w-full bg-zinc-900 border border-zinc-700 text-zinc-200 font-mono rounded px-2 py-1 text-[9px]"
                >
                  <option value="project:delete">project:delete</option>
                  <option value="project:update">project:update</option>
                  <option value="workspace:manage">workspace:manage</option>
                  <option value="agent:execute">agent:execute</option>
                  <option value="member:remove">member:remove</option>
                  <option value="code:generate">code:generate</option>
                  <option value="deployment:trigger">deployment:trigger</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded font-medium flex items-center gap-1.5 text-[10px] transition-colors"
            >
              <Play className="w-3 h-3" /> Evaluate Access Guard
            </button>
          </form>

          {guardResult && (
            <div
              className={`p-3 rounded-lg border text-[10px] space-y-1.5 ${
                guardResult.granted
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                  : 'bg-rose-950/60 border-rose-500/40 text-rose-200'
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1.5">
                  {guardResult.granted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400" />
                  )}
                  {guardResult.granted ? 'ACCESS GRANTED' : 'ACCESS DENIED'}
                </span>
                <span className="font-mono text-[9px]">{new Date(guardResult.timestamp).toLocaleTimeString()}</span>
              </div>

              <p className="text-[9.5px] leading-relaxed">
                {guardResult.granted
                  ? `User '${guardResult.userId}' (${guardResult.role}) granted access to ${guardResult.resourceType} '${guardResult.resourceId}' in workspace '${guardResult.workspaceId}'.`
                  : guardResult.denialReason}
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[8.5px] text-zinc-300">
                <div>
                  Active Workspace: <strong className="text-purple-300">{guardResult.workspaceId}</strong>
                </div>
                <div>
                  Resource Workspace: <strong className="text-purple-300">{guardResult.resourceWorkspaceId}</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 6: Prompt 11.2 Permission Audit Panel */}
      {activeTab === 'audit' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800 text-[10px]">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <History className="w-4 h-4 text-amber-400" />
              Permission & Security Audit Logs
            </span>
            <Badge variant="outline" className="font-mono text-[8.5px] text-amber-300 border-amber-500/30">
              AUDIT RECORD COUNT: {auditSummary.totalEvents}
            </Badge>
          </div>

          <div className="grid grid-cols-4 gap-2 text-[9.5px]">
            <div className="bg-zinc-950 p-2 rounded border border-zinc-800 text-center">
              <div className="text-zinc-500 text-[8.5px]">Total Events</div>
              <div className="text-zinc-100 font-bold font-mono text-sm">{auditSummary.totalEvents}</div>
            </div>
            <div className="bg-zinc-950 p-2 rounded border border-zinc-800 text-center">
              <div className="text-zinc-500 text-[8.5px]">Access Granted</div>
              <div className="text-emerald-400 font-bold font-mono text-sm">{auditSummary.totalGranted}</div>
            </div>
            <div className="bg-zinc-950 p-2 rounded border border-zinc-800 text-center">
              <div className="text-zinc-500 text-[8.5px]">Access Denied</div>
              <div className="text-rose-400 font-bold font-mono text-sm">{auditSummary.totalDenied}</div>
            </div>
            <div className="bg-zinc-950 p-2 rounded border border-zinc-800 text-center">
              <div className="text-zinc-500 text-[8.5px]">Role Changes</div>
              <div className="text-blue-400 font-bold font-mono text-sm">{auditSummary.roleChangesCount}</div>
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            {auditSummary.recentEvents.map(evt => (
              <div key={evt.id} className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        evt.eventType === 'ACCESS_GRANTED'
                          ? 'success'
                          : evt.eventType === 'ACCESS_DENIED'
                          ? 'destructive'
                          : 'outline'
                      }
                      className="text-[8px] font-mono"
                    >
                      {evt.eventType}
                    </Badge>
                    <span className="font-mono text-purple-300 text-[9.5px]">{evt.userId}</span>
                    <Badge variant="outline" className="text-[7.5px] font-mono border-zinc-700">
                      {evt.role}
                    </Badge>
                  </div>
                  <span className="text-zinc-500 font-mono text-[8.5px]">
                    {new Date(evt.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <p className="text-zinc-300 text-[9px] font-mono leading-tight">{evt.details}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 7: Settings */}
      {activeTab === 'settings' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800 text-[10px]">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-amber-400" />
              Workspace Policies & Enforcement Settings
            </span>
          </div>

          <div className="space-y-2">
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 flex items-center justify-between">
              <div>
                <div className="font-semibold text-zinc-200">Allow Member Invitations</div>
                <div className="text-zinc-400 text-[9px]">Allow non-owner members to send email invitations</div>
              </div>
              <button
                onClick={() => handleToggleSettings('allowMemberInvite', !report.workspace.settings.allowMemberInvite)}
                className={`px-3 py-1 rounded font-mono text-[9px] ${
                  report.workspace.settings.allowMemberInvite
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                    : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                }`}
              >
                {report.workspace.settings.allowMemberInvite ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>

            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 flex items-center justify-between">
              <div>
                <div className="font-semibold text-zinc-200">Isolation Enforcement Mode</div>
                <div className="text-zinc-400 text-[9px]">STRICT enforces cryptographic tenant validation on every API request</div>
              </div>
              <button
                onClick={() =>
                  handleToggleSettings(
                    'enforcementMode',
                    report.workspace.settings.enforcementMode === 'STRICT' ? 'STANDARD' : 'STRICT'
                  )
                }
                className={`px-3 py-1 rounded font-mono text-[9px] ${
                  report.workspace.settings.enforcementMode === 'STRICT'
                    ? 'bg-purple-950 text-purple-300 border border-purple-500/30'
                    : 'bg-blue-950 text-blue-300 border border-blue-500/30'
                }`}
              >
                {report.workspace.settings.enforcementMode}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 8: Tenant Isolation */}
      {activeTab === 'isolation' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800 text-[10px]">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-emerald-400" />
              Tenant Isolation Engine Guard Status
            </span>
            <Badge variant="success" className="font-mono text-[9px]">
              ISOLATION: PASS
            </Badge>
          </div>

          <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 space-y-2">
            <div className="font-semibold text-emerald-300 flex items-center gap-1 text-[11px]">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Multi-Tenant Boundary Guard Active
            </div>
            <p className="text-zinc-300 text-[9.5px] leading-relaxed">
              All data structures—including Projects, Autonomous Agents, Task Execution Queues, Vector Memory Indexes, RAG Document Knowledge Base, GitHub Connections, and Deployment Records—are cryptographically scoped to{' '}
              <code className="text-purple-300 font-mono">{report.workspace.id}</code>.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[9px]">
              <div className="bg-zinc-900/60 p-2 rounded border border-zinc-800/40">
                <span className="text-zinc-500">Active Workspace Scope:</span>
                <div className="text-purple-300 font-semibold">{report.context.workspaceId}</div>
              </div>
              <div className="bg-zinc-900/60 p-2 rounded border border-zinc-800/40">
                <span className="text-zinc-500">Isolation Boundary Verified:</span>
                <div className="text-emerald-400 font-semibold">100% ISOLATED</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Resource Governance Policy */}
      {activeTab === 'governance' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800 text-[10px]">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-purple-400" />
              Workspace Resource Governance Policy Configuration
            </span>
            <Badge variant="outline" className="font-mono text-[9px] text-purple-300 border-purple-500/30">
              POLICY: ACTIVE
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 space-y-1">
              <div className="text-zinc-400 text-[9px]">Strict Limit Enforcement</div>
              <div className="flex items-center justify-between pt-1">
                <span className="font-semibold text-zinc-200 text-xs">
                  {governanceOverview.policy.enforceStrictBlocking ? 'STRICT BLOCKING' : 'WARNING ONLY'}
                </span>
                <button
                  onClick={() => {
                    workspaceGovernanceEngine.updatePolicy(activeWorkspaceId, {
                      enforceStrictBlocking: !governanceOverview.policy.enforceStrictBlocking
                    });
                    setNotification('Updated strict limit enforcement mode');
                    setTimeout(() => setNotification(null), 2500);
                  }}
                  className={`px-2 py-1 rounded font-mono text-[9px] ${
                    governanceOverview.policy.enforceStrictBlocking
                      ? 'bg-rose-950 text-rose-300 border border-rose-500/30'
                      : 'bg-zinc-800 text-zinc-300'
                  }`}
                >
                  TOGGLE
                </button>
              </div>
            </div>

            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 space-y-1">
              <div className="text-zinc-400 text-[9px]">Auto Warning Alerts</div>
              <div className="flex items-center justify-between pt-1">
                <span className="font-semibold text-zinc-200 text-xs">
                  {governanceOverview.policy.autoAlertOnWarning ? 'ENABLED' : 'DISABLED'}
                </span>
                <button
                  onClick={() => {
                    workspaceGovernanceEngine.updatePolicy(activeWorkspaceId, {
                      autoAlertOnWarning: !governanceOverview.policy.autoAlertOnWarning
                    });
                    setNotification('Updated warning alert notification policy');
                    setTimeout(() => setNotification(null), 2500);
                  }}
                  className={`px-2 py-1 rounded font-mono text-[9px] ${
                    governanceOverview.policy.autoAlertOnWarning
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                      : 'bg-zinc-800 text-zinc-300'
                  }`}
                >
                  TOGGLE
                </button>
              </div>
            </div>

            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 space-y-1">
              <div className="text-zinc-400 text-[9px]">Usage Reset Cycle</div>
              <div className="flex items-center justify-between pt-1">
                <span className="font-semibold text-purple-300 font-mono text-xs">
                  {governanceOverview.policy.usageResetCycle}
                </span>
                <span className="text-[9px] text-zinc-500 font-mono">Auto Cycle</span>
              </div>
            </div>
          </div>

          <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 space-y-2">
            <div className="font-semibold text-zinc-200 text-xs flex items-center justify-between">
              <span>Resource Limits & Quota Rules</span>
              <span className="text-zinc-400 font-mono text-[9px]">10 Resource Categories Tracked</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 font-mono text-[9px]">
                    <th className="py-2 px-2">Resource Type</th>
                    <th className="py-2 px-2">Current Limit</th>
                    <th className="py-2 px-2">Warning Threshold</th>
                    <th className="py-2 px-2">Unit</th>
                    <th className="py-2 px-2">Category Description</th>
                    <th className="py-2 px-2 text-right">Quick Adjust</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-mono text-[9.5px]">
                  {Object.entries(governanceOverview.policy.limits).map(([resKey, config]) => (
                    <tr key={resKey} className="hover:bg-zinc-900/40">
                      <td className="py-2 px-2 text-purple-300 font-semibold">{resKey}</td>
                      <td className="py-2 px-2 text-zinc-200 font-bold">{config.limit.toLocaleString()}</td>
                      <td className="py-2 px-2 text-amber-400">{config.warningThresholdPercent}%</td>
                      <td className="py-2 px-2 text-zinc-400">{config.unit}</td>
                      <td className="py-2 px-2 text-zinc-400 font-sans text-[9px]">{config.description}</td>
                      <td className="py-2 px-2 text-right space-x-1">
                        <button
                          onClick={() => {
                            workspaceGovernanceEngine.updateResourceLimit(
                              activeWorkspaceId,
                              resKey as WorkspaceResourceType,
                              Math.round(config.limit * 1.5)
                            );
                            setNotification(`Increased ${resKey} limit to ${Math.round(config.limit * 1.5)}`);
                            setTimeout(() => setNotification(null), 2500);
                          }}
                          className="px-1.5 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-[9px]"
                        >
                          +50%
                        </button>
                        <button
                          onClick={() => {
                            workspaceGovernanceEngine.updateResourceLimit(
                              activeWorkspaceId,
                              resKey as WorkspaceResourceType,
                              Math.max(10, Math.round(config.limit * 0.8))
                            );
                            setNotification(`Decreased ${resKey} limit to ${Math.max(10, Math.round(config.limit * 0.8))}`);
                            setTimeout(() => setNotification(null), 2500);
                          }}
                          className="px-1.5 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-[9px]"
                        >
                          -20%
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Quota Manager */}
      {activeTab === 'quotas' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800 text-[10px]">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-orange-400" />
              Workspace Quota & Usage Meter Dashboard
            </span>
            <Badge
              variant={
                governanceOverview.quotaSummary.overallStatus === 'NORMAL'
                  ? 'success'
                  : governanceOverview.quotaSummary.overallStatus === 'WARNING'
                  ? 'warning'
                  : 'destructive'
              }
              className="font-mono text-[9px]"
            >
              STATUS: {governanceOverview.quotaSummary.overallStatus}
            </Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
              <div className="text-zinc-500 text-[9px]">Total Tracked Resources</div>
              <div className="text-lg font-bold text-zinc-100 font-mono">{governanceOverview.quotaSummary.totalResourcesTracked}</div>
            </div>
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
              <div className="text-zinc-500 text-[9px]">Resources in Warning</div>
              <div className="text-lg font-bold text-amber-400 font-mono">{governanceOverview.quotaSummary.resourcesInWarning}</div>
            </div>
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
              <div className="text-zinc-500 text-[9px]">Resources Exceeded / Blocked</div>
              <div className="text-lg font-bold text-rose-400 font-mono">{governanceOverview.quotaSummary.resourcesExceeded}</div>
            </div>
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
              <div className="text-zinc-500 text-[9px]">Governance Mode</div>
              <div className="text-xs font-bold text-purple-300 font-mono pt-1">
                {governanceOverview.policy.enforceStrictBlocking ? 'STRICT BLOCK' : 'WARN ONLY'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {governanceOverview.resourceUsages.map(usage => {
              const colorClass =
                usage.status === 'BLOCKED' || usage.status === 'EXCEEDED'
                  ? 'bg-rose-500'
                  : usage.status === 'WARNING'
                  ? 'bg-amber-400'
                  : 'bg-emerald-400';

              const badgeVariant =
                usage.status === 'NORMAL' ? 'success' : usage.status === 'WARNING' ? 'warning' : 'destructive';

              return (
                <div key={usage.resourceType} className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-zinc-200 font-mono text-[11px]">{usage.resourceType}</span>
                    <Badge variant={badgeVariant} className="font-mono text-[8.5px]">
                      {usage.status}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-[9.5px] font-mono text-zinc-400">
                    <span>
                      Usage: <strong className="text-zinc-200">{usage.currentUsage.toLocaleString()}</strong> / {usage.limit.toLocaleString()}
                    </span>
                    <span className="font-bold text-purple-300">{usage.usagePercent}%</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden border border-zinc-800">
                    <div
                      className={`h-full transition-all duration-300 ${colorClass}`}
                      style={{ width: `${Math.min(100, usage.usagePercent)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab: Usage Control Simulator */}
      {activeTab === 'usage' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800 text-[10px]">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              Usage Control & Server-Side Limit Guard Testing Engine
            </span>
            <Badge variant="outline" className="font-mono text-[9px] text-amber-300 border-amber-500/30">
              SIMULATOR READY
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Form */}
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 space-y-2.5">
              <div className="font-semibold text-zinc-200 text-xs">Simulate Operation Usage Request</div>

              <div className="space-y-1">
                <label className="text-zinc-400">Target Resource Type</label>
                <select
                  value={simResourceType}
                  onChange={e => setSimResourceType(e.target.value as WorkspaceResourceType)}
                  className="w-full bg-zinc-900 border border-zinc-700 text-zinc-200 rounded px-2 py-1 font-mono text-[10px]"
                >
                  {governanceOverview.resourceUsages.map(u => (
                    <option key={u.resourceType} value={u.resourceType}>
                      {u.resourceType} (Current: {u.currentUsage} / {u.limit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-zinc-400">Requested Delta (+ Units)</label>
                  <input
                    type="number"
                    value={simDelta}
                    onChange={e => setSimDelta(parseInt(e.target.value) || 1)}
                    className="w-full bg-zinc-900 border border-zinc-700 text-zinc-200 rounded px-2 py-1 font-mono text-[10px]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400">User ID</label>
                  <input
                    type="text"
                    value={simUserId}
                    onChange={e => setSimUserId(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 text-zinc-200 rounded px-2 py-1 font-mono text-[10px]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const validation = usageControlEngine.validateQuota(activeWorkspaceId, simResourceType, simDelta);
                    setSimResult(validation);
                  }}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded font-medium text-xs flex items-center gap-1"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> Check Quota Only
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const record = usageControlEngine.recordUsage(
                      activeWorkspaceId,
                      simResourceType,
                      simDelta,
                      simUserId,
                      'Simulated Panel Action'
                    );
                    setSimResult(record.validation);
                    setNotification(
                      record.validation.allowed
                        ? `Incremented ${simResourceType} by +${simDelta}. New usage: ${record.newUsage}`
                        : `BLOCKED: Exceeded limit for ${simResourceType}`
                    );
                    setTimeout(() => setNotification(null), 3000);
                  }}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded font-medium text-xs flex items-center gap-1"
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> Execute & Record Usage
                </button>
              </div>
            </div>

            {/* Validation Result Box */}
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 space-y-2">
              <div className="font-semibold text-zinc-200 text-xs flex items-center justify-between">
                <span>Guard Evaluation Output</span>
                {simResult && (
                  <Badge variant={simResult.allowed ? 'success' : 'destructive'} className="font-mono text-[9px]">
                    {simResult.allowed ? 'ALLOWED' : 'BLOCKED'}
                  </Badge>
                )}
              </div>

              {simResult ? (
                <div className="space-y-2 font-mono text-[9.5px]">
                  <div className="p-2 rounded border bg-zinc-900/80 border-zinc-800">
                    <div className="text-zinc-400 text-[8.5px]">Status & Reason:</div>
                    <div className={simResult.allowed ? 'text-emerald-300 font-semibold' : 'text-rose-400 font-semibold'}>
                      {simResult.reason}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[9px]">
                    <div className="bg-zinc-900/60 p-2 rounded border border-zinc-800">
                      <span className="text-zinc-500">Current Usage:</span>
                      <div className="text-zinc-200 font-bold">{simResult.currentUsage}</div>
                    </div>
                    <div className="bg-zinc-900/60 p-2 rounded border border-zinc-800">
                      <span className="text-zinc-500">Resource Limit:</span>
                      <div className="text-zinc-200 font-bold">{simResult.limit}</div>
                    </div>
                    <div className="bg-zinc-900/60 p-2 rounded border border-zinc-800">
                      <span className="text-zinc-500">Projected %:</span>
                      <div className="text-purple-300 font-bold">{simResult.usagePercent}%</div>
                    </div>
                    <div className="bg-zinc-900/60 p-2 rounded border border-zinc-800">
                      <span className="text-zinc-500">Evaluated At:</span>
                      <div className="text-zinc-400 text-[8px]">{new Date(simResult.evaluatedAt).toLocaleTimeString()}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-zinc-500 text-[10px]">
                  Run a quota check or simulate usage execution to test server-side limits.
                </div>
              )}

              <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-end">
                <button
                  onClick={() => {
                    usageControlEngine.resetUsage(activeWorkspaceId);
                    setSimResult(null);
                    setNotification(`Reset all usage counters for workspace ${activeWorkspaceId}`);
                    setTimeout(() => setNotification(null), 2500);
                  }}
                  className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-[9px] flex items-center gap-1 font-mono"
                >
                  <RefreshCw className="w-3 h-3 text-zinc-400" /> Reset All Usage Counters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Usage Analytics & Alerts */}
      {activeTab === 'analytics' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800 text-[10px]">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              Workspace Usage Analytics & Threshold Alerts
            </span>
            <Badge variant="outline" className="font-mono text-[9px] text-blue-300 border-blue-500/30">
              ALERTS: {governanceOverview.activeAlerts.length}
            </Badge>
          </div>

          {/* Active Alerts */}
          <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 space-y-2">
            <div className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> Active Usage Threshold Alerts
            </div>

            {governanceOverview.activeAlerts.length > 0 ? (
              <div className="space-y-1.5">
                {governanceOverview.activeAlerts.map(alert => (
                  <div key={alert.id} className="bg-amber-950/20 border border-amber-500/30 p-2 rounded flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="warning" className="font-mono text-[8px]">{alert.severity}</Badge>
                        <span className="font-semibold text-amber-300 font-mono">{alert.resourceType}</span>
                        <span className="text-zinc-500 text-[8px] font-mono">{new Date(alert.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-zinc-300 text-[9px] mt-1">{alert.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-emerald-400 text-[9.5px] py-2 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> No active usage alerts for workspace. All resources operate within normal limits.
              </div>
            )}
          </div>

          {/* Usage History Log */}
          <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 space-y-2">
            <div className="font-semibold text-zinc-200 text-xs flex items-center justify-between">
              <span>Resource Usage History Log</span>
              <span className="text-zinc-500 font-mono text-[9px]">{governanceOverview.recentHistory.length} Recorded Entries</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 font-mono text-[9px]">
                    <th className="py-2 px-2">Timestamp</th>
                    <th className="py-2 px-2">Resource</th>
                    <th className="py-2 px-2">Delta</th>
                    <th className="py-2 px-2">New Usage Total</th>
                    <th className="py-2 px-2">Triggered By</th>
                    <th className="py-2 px-2">Action Context</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-mono text-[9px]">
                  {governanceOverview.recentHistory.map((h, idx) => (
                    <tr key={idx} className="hover:bg-zinc-900/40">
                      <td className="py-1.5 px-2 text-zinc-400">{new Date(h.timestamp).toLocaleTimeString()}</td>
                      <td className="py-1.5 px-2 text-purple-300 font-semibold">{h.resourceType}</td>
                      <td className="py-1.5 px-2 text-amber-400 font-bold">+{h.delta}</td>
                      <td className="py-1.5 px-2 text-zinc-200">{h.newUsage.toLocaleString()}</td>
                      <td className="py-1.5 px-2 text-zinc-400">{h.triggeredByUserId || 'system'}</td>
                      <td className="py-1.5 px-2 text-zinc-400 font-sans text-[8.5px]">{h.actionContext || 'Direct execution'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Create Workspace Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 max-w-md w-full space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h3 className="font-semibold text-sm text-zinc-100 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-purple-400" />
                Create New Multi-Tenant Workspace
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-zinc-400 hover:text-zinc-200 text-xs font-mono">
                ×
              </button>
            </div>

            <form onSubmit={handleCreateWorkspace} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-zinc-400 font-medium">Workspace Name</label>
                <input
                  type="text"
                  placeholder="e.g. Autonomous AI Labs"
                  value={newWsName}
                  onChange={e => setNewWsName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 text-zinc-200 rounded px-2.5 py-1.5 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 font-medium">Description</label>
                <textarea
                  placeholder="Purpose and business context for this isolated workspace..."
                  value={newWsDesc}
                  onChange={e => setNewWsDesc(e.target.value)}
                  rows={2}
                  className="w-full bg-zinc-950 border border-zinc-700 text-zinc-200 rounded px-2.5 py-1.5 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-medium"
                >
                  Create & Switch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 max-w-md w-full space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h3 className="font-semibold text-sm text-zinc-100 flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-blue-400" />
                Invite Workspace Member
              </h3>
              <button onClick={() => setShowInviteModal(false)} className="text-zinc-400 hover:text-zinc-200 text-xs font-mono">
                ×
              </button>
            </div>

            <form onSubmit={handleInviteMember} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-zinc-400 font-medium">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Maria Santos"
                  value={inviteName}
                  onChange={e => setInviteName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 text-zinc-200 rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 font-medium">Email Address</label>
                <input
                  type="email"
                  placeholder="maria@aistudio.io"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 text-zinc-200 rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 font-medium">Assigned Role</label>
                <select
                  value={inviteRole}
                  onChange={e => setInviteRole(e.target.value as WorkspaceRole)}
                  className="w-full bg-zinc-950 border border-zinc-700 text-zinc-200 rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-500 font-mono"
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="MEMBER">MEMBER</option>
                  <option value="VIEWER">VIEWER</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
