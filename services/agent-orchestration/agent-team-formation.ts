import {
  AgentTeam,
  AgentTeamMember,
  AgentTeamFormationRequest,
  AgentTeamFormationResult,
  AgentRole,
  WorkflowPlannedStep,
} from '@/packages/types/src';
import { agentAssignmentResolver } from './agent-assignment-resolver';
import { usageControlEngine } from '@/services/workspace/usage-control-engine';
import { agentCapabilityManagerService } from './agent-capability-manager';

export class AgentTeamFormationService {
  private activeTeams: Map<string, AgentTeam> = new Map();

  /**
   * Automatically forms an optimized agent team for a given workflow requirement.
   */
  public async formTeamForWorkflow(
    request: AgentTeamFormationRequest
  ): Promise<AgentTeamFormationResult> {
    const { workspaceId, workflowId, name, steps = [], userId } = request;
    const teamId = `team_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // 1. Identify distinct roles and capabilities needed from steps
    const roleStepMap: Map<AgentRole, { steps: string[]; capabilities: string[] }> = new Map();

    // Default executive hierarchy roles
    roleStepMap.set('CEO_AGENT', { steps: [], capabilities: ['STRATEGIC_PLANNING', 'EXECUTIVE_DECISION'] });
    roleStepMap.set('PLANNER_AGENT', { steps: [], capabilities: ['TASK_DECOMPOSITION', 'DAG_GENERATION'] });

    for (const step of steps) {
      const rawStep = step as unknown as Record<string, unknown>;
      const role = (step.agentRole || (rawStep.role as string) || (rawStep.assignedAgentRole as string) || 'CODING_AGENT') as AgentRole;
      if (!roleStepMap.has(role)) {
        roleStepMap.set(role, { steps: [], capabilities: [] });
      }
      const entry = roleStepMap.get(role)!;
      if (step.id) {
        entry.steps.push(step.id);
      }
      if (step.requiredCapabilities) {
        step.requiredCapabilities.forEach((c) => {
          if (!entry.capabilities.includes(c)) entry.capabilities.push(c);
        });
      }
    }

    // Always include verification & diagnostics support
    if (!roleStepMap.has('TESTING_AGENT')) {
      roleStepMap.set('TESTING_AGENT', { steps: [], capabilities: ['TEST_EXECUTION'] });
    }
    if (!roleStepMap.has('DEBUG_AGENT')) {
      roleStepMap.set('DEBUG_AGENT', { steps: [], capabilities: ['ERROR_DIAGNOSIS', 'PATCH_GENERATION'] });
    }

    // 2. Validate Team-level Quotas
    const totalAgentsNeeded = roleStepMap.size;
    const quotaCheck = usageControlEngine.validateQuota(workspaceId, 'AGENTS', totalAgentsNeeded);
    if (!quotaCheck.allowed) {
      return {
        team: {
          teamId,
          workspaceId,
          workflowId,
          name: name || 'Dynamic Project Team',
          members: [],
          hierarchy: [],
          parallelBranches: [],
          status: 'CANCELLED',
          quotaApproved: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        success: false,
        memberCount: 0,
        parallelBranchesCount: 0,
        error: `QUOTA_BLOCKED: Workspace '${workspaceId}' exceeded agent quota limit (${Math.max(0, quotaCheck.limit - quotaCheck.currentUsage)} remaining, ${totalAgentsNeeded} requested).`,
      };
    }

    // 3. Resolve each agent role uniquely (preventing duplicates unless required)
    const members: AgentTeamMember[] = [];
    const assignedAgentIds = new Set<string>();

    for (const [role, data] of Array.from(roleStepMap.entries())) {
      const assignment = await agentAssignmentResolver.resolveAgent({
        role,
        requiredCapabilities: data.capabilities,
        workspaceId,
        userId,
      });

      // Prevent duplicate IDs within a team by adjusting unique suffix if needed
      let agentId = assignment.agentId;
      if (assignedAgentIds.has(agentId)) {
        agentId = `${agentId}_${role.toLowerCase()}`;
      }
      assignedAgentIds.add(agentId);

      // Register capability map for this agent
      data.capabilities.forEach((cap) => {
        agentCapabilityManagerService.registerCapability(workspaceId, {
          agentId,
          capabilityName: cap,
          proficiencyScore: 0.95,
          supportedToolIds: [],
        });
      });

      members.push({
        agentId,
        role,
        assignedSteps: data.steps,
        dependencies: this.getRoleDependencies(role),
        capabilities: Array.from(new Set([...assignment.matchedCapabilities, ...data.capabilities])),
        status: 'ASSIGNED',
      });
    }

    // 4. Construct Team Hierarchy
    const hierarchy: Array<{ parentRole: AgentRole; childRoles: AgentRole[] }> = [
      { parentRole: 'CEO_AGENT', childRoles: ['PLANNER_AGENT'] },
      {
        parentRole: 'PLANNER_AGENT',
        childRoles: ['CODING_AGENT', 'DATABASE_AGENT', 'INTEGRATION_AGENT'].filter((r) =>
          roleStepMap.has(r as AgentRole)
        ) as AgentRole[],
      },
      {
        parentRole: 'CODING_AGENT',
        childRoles: ['TESTING_AGENT'].filter((r) => roleStepMap.has(r as AgentRole)) as AgentRole[],
      },
      {
        parentRole: 'TESTING_AGENT',
        childRoles: ['DEBUG_AGENT', 'DEPLOYMENT_AGENT'].filter((r) =>
          roleStepMap.has(r as AgentRole)
        ) as AgentRole[],
      },
    ];

    // 5. Detect Parallel Branches (e.g. Frontend/Backend, Database/API steps)
    const parallelBranches: string[][] = this.extractParallelBranches(steps);

    const team: AgentTeam = {
      teamId,
      workspaceId,
      workflowId,
      name: name || `Project Alpha Team (${members.length} Agents)`,
      members,
      hierarchy,
      parallelBranches,
      status: 'ACTIVE',
      quotaApproved: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.activeTeams.set(teamId, team);

    return {
      team,
      success: true,
      memberCount: members.length,
      parallelBranchesCount: parallelBranches.length,
    };
  }

  private getRoleDependencies(role: AgentRole): string[] {
    switch (role) {
      case 'PLANNER_AGENT':
        return ['CEO_AGENT'];
      case 'CODING_AGENT':
      case 'DATABASE_AGENT':
      case 'INTEGRATION_AGENT':
        return ['PLANNER_AGENT'];
      case 'TESTING_AGENT':
        return ['CODING_AGENT', 'DATABASE_AGENT'];
      case 'DEBUG_AGENT':
        return ['TESTING_AGENT'];
      case 'DEPLOYMENT_AGENT':
        return ['TESTING_AGENT'];
      default:
        return [];
    }
  }

  private extractParallelBranches(steps: WorkflowPlannedStep[]): string[][] {
    const branches: string[][] = [];
    const stepDepMap = new Map<string, string[]>();

    steps.forEach((s) => stepDepMap.set(s.id, s.dependencies || []));

    // Find steps with identical dependency sets that can run simultaneously
    const depGroups = new Map<string, string[]>();
    steps.forEach((s) => {
      const key = (s.dependencies || []).sort().join(',');
      if (!depGroups.has(key)) depGroups.set(key, []);
      depGroups.get(key)!.push(s.id);
    });

    for (const [, group] of Array.from(depGroups.entries())) {
      if (group.length > 1) {
        branches.push(group);
      }
    }

    return branches;
  }

  public getTeam(teamId: string): AgentTeam | null {
    return this.activeTeams.get(teamId) || null;
  }

  public listTeams(workspaceId?: string): AgentTeam[] {
    const all = Array.from(this.activeTeams.values());
    if (workspaceId) {
      return all.filter((t) => t.workspaceId === workspaceId);
    }
    return all;
  }

  public cancelTeam(teamId: string): boolean {
    const team = this.activeTeams.get(teamId);
    if (!team) return false;
    team.status = 'CANCELLED';
    team.members.forEach((m) => (m.status = 'CANCELLED'));
    team.updatedAt = new Date().toISOString();
    return true;
  }
}

export const agentTeamFormationService = new AgentTeamFormationService();
