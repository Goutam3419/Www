'use client';

import React, { useState } from 'react';
import { multiAgentOrchestrationService } from '@/services/agent-orchestration/multi-agent-orchestration-service';
import { agentTaskPlannerService } from '@/services/agent-orchestration/agent-task-planner';
import { agentDelegationEngineService } from '@/services/agent-orchestration/agent-delegation-engine';
import { agentCoordinationEngineService } from '@/services/agent-orchestration/agent-coordination-engine';
import { agentExecutionCoordinatorService } from '@/services/agent-orchestration/agent-execution-coordinator';
import { agentApprovalManagerService } from '@/services/agent-orchestration/agent-approval-manager';
import { agentHandoffManagerService } from '@/services/agent-orchestration/agent-handoff-manager';
import { orchestrationGovernanceService } from '@/services/agent-orchestration/orchestration-governance';
import { conflictResolutionService } from '@/services/agent-orchestration/conflict-resolution';
import { orchestrationAnalyticsService } from '@/services/agent-orchestration/orchestration-analytics';
import { executiveDashboardService } from '@/services/agent-orchestration/executive-dashboard';
import { Badge } from '@/components/ui/Badge';
import {
  Users,
  CheckCircle2,
  Activity,
  ListTodo,
  UserCheck,
  GitMerge,
  ArrowRight,
  ShieldCheck,
  Zap,
  PlayCircle,
  FileCheck,
  ArrowRightLeft,
  ShieldAlert,
  BarChart3,
  Scale,
  Bot,
  Wrench,
  LayoutDashboard
} from 'lucide-react';

interface AgentOrchestrationPanelProps {
  workspaceId?: string;
}

export const AgentOrchestrationPanel: React.FC<AgentOrchestrationPanelProps> = ({
  workspaceId = 'ws_enterprise_01'
}) => {
  const [activeTab, setActiveTab] = useState<
    | 'dashboard'
    | 'registry'
    | 'capabilities'
    | 'planner'
    | 'delegation'
    | 'coordination'
    | 'execution'
    | 'approval'
    | 'handoff'
    | 'governance'
    | 'conflicts'
    | 'analytics'
  >('dashboard');

  const masterReport = multiAgentOrchestrationService.getMasterReport(workspaceId);
  const taskPlannerReport = agentTaskPlannerService.getTaskPlannerReport(workspaceId);
  const delegationReport = agentDelegationEngineService.getDelegationReport(workspaceId);
  const coordinationPlan = agentCoordinationEngineService.getCoordinationPlan(workspaceId);

  const executionReport = agentExecutionCoordinatorService.getExecutionReport(workspaceId);
  const approvalReport = agentApprovalManagerService.getApprovalReport(workspaceId);
  const handoffReport = agentHandoffManagerService.getHandoffReport(workspaceId);

  const governanceReport = orchestrationGovernanceService.getGovernanceReport(workspaceId);
  const conflictReport = conflictResolutionService.getConflictReport(workspaceId);
  const analyticsReport = orchestrationAnalyticsService.getAnalyticsReport(workspaceId);
  const executiveDashboard = executiveDashboardService.getExecutiveDashboardReport(workspaceId);

  const { registryReport, capabilityReport } = masterReport;

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-4 text-zinc-100">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-purple-950/50 border border-purple-500/30 rounded-lg text-purple-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-semibold text-sm text-zinc-100">
              Multi-Agent Orchestration Engine
            </h2>
            <p className="text-[11px] text-zinc-400">
              Prompt 10.1–10.4 Unified Orchestration Workspace
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-[10px] text-purple-300 border-purple-500/30">
            {registryReport.registeredAgentsCount} Agents Registered
          </Badge>
          <Badge variant="outline" className="font-mono text-[10px] text-emerald-300 border-emerald-500/30">
            {executiveDashboard.overallExecutionSuccessRate}% Success Rate
          </Badge>
          <Badge variant="success" className="font-mono text-[10px]">
            {executiveDashboard.overallOrchestrationHealth}
          </Badge>
        </div>
      </div>

      {/* Tabs Navigation (Prompt 10.4 Unified Workspace Navigation) */}
      <div className="flex items-center gap-1 bg-zinc-900/80 p-1 rounded-lg border border-zinc-800 text-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'dashboard'
              ? 'bg-purple-950/50 text-purple-300 font-medium border border-purple-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5 text-purple-400" /> Dashboard
        </button>
        <button
          onClick={() => setActiveTab('registry')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'registry'
              ? 'bg-purple-950/50 text-purple-300 font-medium border border-purple-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Bot className="w-3.5 h-3.5 text-blue-400" /> Agent Registry
        </button>
        <button
          onClick={() => setActiveTab('capabilities')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'capabilities'
              ? 'bg-purple-950/50 text-purple-300 font-medium border border-purple-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Wrench className="w-3.5 h-3.5 text-cyan-400" /> Capabilities
        </button>
        <button
          onClick={() => setActiveTab('planner')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'planner'
              ? 'bg-purple-950/50 text-purple-300 font-medium border border-purple-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <ListTodo className="w-3.5 h-3.5 text-indigo-400" /> Task Planner
        </button>
        <button
          onClick={() => setActiveTab('delegation')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'delegation'
              ? 'bg-purple-950/50 text-purple-300 font-medium border border-purple-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5 text-blue-400" /> Delegation
        </button>
        <button
          onClick={() => setActiveTab('coordination')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'coordination'
              ? 'bg-purple-950/50 text-purple-300 font-medium border border-purple-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <GitMerge className="w-3.5 h-3.5 text-emerald-400" /> Coordination
        </button>
        <button
          onClick={() => setActiveTab('execution')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'execution'
              ? 'bg-purple-950/50 text-purple-300 font-medium border border-purple-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <PlayCircle className="w-3.5 h-3.5 text-purple-400" /> Execution
        </button>
        <button
          onClick={() => setActiveTab('approval')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'approval'
              ? 'bg-purple-950/50 text-purple-300 font-medium border border-purple-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5 text-blue-400" /> Approvals
        </button>
        <button
          onClick={() => setActiveTab('handoff')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'handoff'
              ? 'bg-purple-950/50 text-purple-300 font-medium border border-purple-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-400" /> Handoffs
        </button>
        <button
          onClick={() => setActiveTab('governance')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'governance'
              ? 'bg-purple-950/50 text-purple-300 font-medium border border-purple-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> Governance
        </button>
        <button
          onClick={() => setActiveTab('conflicts')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'conflicts'
              ? 'bg-purple-950/50 text-purple-300 font-medium border border-purple-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Scale className="w-3.5 h-3.5 text-rose-400" /> Conflicts
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'analytics'
              ? 'bg-purple-950/50 text-purple-300 font-medium border border-purple-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5 text-cyan-400" /> Analytics
        </button>
      </div>

      {/* Tab 1: Executive Dashboard */}
      {activeTab === 'dashboard' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <LayoutDashboard className="w-4 h-4 text-purple-400" />
              Multi-Agent Executive Dashboard Summary
            </span>
            <Badge variant="success" className="font-mono text-[9px]">
              Health: {executiveDashboard.overallOrchestrationHealth}
            </Badge>
          </div>

          <div className="grid grid-cols-4 gap-2 text-[10px]">
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
              <div className="text-zinc-400 text-[9px]">Active Agents</div>
              <div className="text-purple-400 font-mono font-bold text-sm pt-0.5">
                {executiveDashboard.activeAgentsCount} Agents
              </div>
            </div>
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
              <div className="text-zinc-400 text-[9px]">Active Tasks</div>
              <div className="text-blue-400 font-mono font-bold text-sm pt-0.5">
                {executiveDashboard.activeTasksCount} Tasks
              </div>
            </div>
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
              <div className="text-zinc-400 text-[9px]">Approval Status</div>
              <div className="text-emerald-400 font-mono font-bold text-sm pt-0.5">
                {executiveDashboard.approvalStatusSummary.approved} Approved / {executiveDashboard.approvalStatusSummary.pending} Pending
              </div>
            </div>
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
              <div className="text-zinc-400 text-[9px]">Success Rate</div>
              <div className="text-cyan-400 font-mono font-bold text-sm pt-0.5">
                {executiveDashboard.overallExecutionSuccessRate}% Rate
              </div>
            </div>
          </div>

          <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 space-y-1 text-[10px]">
            <span className="font-semibold text-purple-300 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-purple-400" />
              Executive Overview
            </span>
            <p className="text-zinc-300 text-[9.5px] leading-relaxed">
              {executiveDashboard.executiveSummaryText}
            </p>
          </div>

          <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 space-y-1.5 text-[10px]">
            <span className="font-semibold text-zinc-200">Top Performing Agents:</span>
            <div className="grid grid-cols-2 gap-2 pt-1">
              {executiveDashboard.topPerformingAgents.map((ag, idx) => (
                <div key={idx} className="bg-zinc-900/60 p-2 rounded border border-zinc-800/40 flex items-center justify-between">
                  <span className="text-zinc-200 font-mono text-[9px]">{ag.agentName}</span>
                  <Badge variant="outline" className="text-emerald-300 border-emerald-500/30 text-[8px] font-mono">
                    {ag.scorePercentage}% Score
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Agent Registry */}
      {activeTab === 'registry' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-blue-400" />
              Registered Multi-Agent Roster & Profiles
            </span>
            <Badge variant="outline" className="text-blue-300 border-blue-500/30 font-mono text-[9px]">
              {registryReport.registeredAgentsCount} Registered Agents
            </Badge>
          </div>

          <div className="space-y-2 text-[10px]">
            {registryReport.agents.map(ag => (
              <div key={ag.agentId} className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-100 text-[11.5px]">{ag.name}</span>
                    <span className="text-zinc-500 font-mono text-[9px]">({ag.agentId})</span>
                  </div>
                  <Badge variant="success" className="text-[8px] font-mono">
                    {ag.status}
                  </Badge>
                </div>
                <div className="text-zinc-400 text-[9px] bg-zinc-900/60 p-1.5 rounded border border-zinc-800/40">
                  Category: <span className="text-purple-300 font-mono font-semibold">{ag.category}</span> | Version: <span className="text-zinc-200 font-mono">{ag.version}</span>
                </div>
                <div className="flex items-center gap-2 text-[8.5px] text-zinc-400">
                  <span>Description: <strong className="text-zinc-200">{ag.metadata.description}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Agent Capabilities */}
      {activeTab === 'capabilities' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <Wrench className="w-4 h-4 text-cyan-400" />
              Agent Capability Matrix & Contract Verification
            </span>
            <Badge variant="outline" className="text-cyan-300 border-cyan-500/30 font-mono text-[9px]">
              Pass Rate: {(capabilityReport.validationPassRate * 100).toFixed(0)}%
            </Badge>
          </div>

          <div className="space-y-2 text-[10px]">
            {capabilityReport.capabilities.map((cap, idx) => (
              <div key={idx} className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-zinc-100 text-[10.5px]">{cap.agentName}</span>
                  <Badge variant="success" className="text-[8px] font-mono">
                    VALIDATED
                  </Badge>
                </div>
                <div className="text-zinc-400 text-[8.5px] font-mono">
                  Supported Tasks: <span className="text-cyan-300">{cap.supportedTasks.join(', ')}</span>
                </div>
                <div className="text-zinc-400 text-[8.5px] font-mono">
                  Supported Tools: <span className="text-purple-300">{cap.supportedTools.join(', ')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Task Planner */}
      {activeTab === 'planner' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <ListTodo className="w-4 h-4 text-indigo-400" />
              Agent Task Planner & Decomposition
            </span>
            <Badge variant="outline" className="text-indigo-300 border-indigo-500/30 font-mono text-[9px]">
              {taskPlannerReport.completedTasks} / {taskPlannerReport.totalTasks} Tasks
            </Badge>
          </div>

          <div className="space-y-2 text-[10px]">
            {taskPlannerReport.tasks.map(task => (
              <div key={task.taskId} className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-purple-400" />
                    <span className="font-semibold text-zinc-100 text-[11px]">{task.title}</span>
                  </div>
                  <Badge variant={task.status === 'COMPLETED' ? 'success' : 'outline'} className="text-[8px] font-mono">
                    {task.status}
                  </Badge>
                </div>
                <p className="text-zinc-400 text-[9px] bg-zinc-900/60 p-1.5 rounded border border-zinc-800/40">
                  {task.description}
                </p>
                <div className="space-y-1 bg-zinc-900/40 p-1.5 rounded border border-zinc-800/30 text-[8.5px]">
                  {task.subtasks.map(sub => (
                    <div key={sub.id} className="flex items-center gap-1.5 text-zinc-300">
                      <CheckCircle2 className={`w-3 h-3 ${sub.completed ? 'text-emerald-400' : 'text-zinc-600'}`} />
                      <span className={sub.completed ? 'line-through text-zinc-500' : ''}>{sub.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Delegation */}
      {activeTab === 'delegation' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-blue-400" />
              Agent Delegation & Capability Matching Engine
            </span>
            <Badge variant="outline" className="text-blue-300 border-blue-500/30 font-mono text-[9px]">
              {delegationReport.totalDelegations} Delegations
            </Badge>
          </div>

          <div className="space-y-2 text-[10px]">
            {delegationReport.records.map(del => (
              <div key={del.delegationId} className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-zinc-100 text-[11px]">{del.taskTitle}</span>
                  <Badge variant="success" className="text-[8px] font-mono">
                    {del.validationStatus}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[9px] text-zinc-400 bg-zinc-900/60 p-1.5 rounded border border-zinc-800/40 font-mono">
                  <div>Assigned: <span className="text-blue-300 font-semibold">{del.assignedAgentName}</span></div>
                  <div>Match Score: <span className="text-emerald-400 font-bold">{(del.capabilityMatchScore * 100).toFixed(0)}%</span></div>
                  <div>Rule: <span className="text-purple-300">{del.delegationRuleApplied}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: Coordination */}
      {activeTab === 'coordination' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <GitMerge className="w-4 h-4 text-emerald-400" />
              Multi-Agent Coordination & Shared Context
            </span>
            <Badge variant="success" className="font-mono text-[9px]">
              Status: {coordinationPlan.coordinationStatus}
            </Badge>
          </div>

          <div className="space-y-1.5 bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 text-[10px]">
            <div className="font-semibold text-emerald-300 flex items-center gap-1 text-[10.5px]">
              <ArrowRight className="w-3.5 h-3.5 text-emerald-400" /> Sequential Execution Pipeline
            </div>
            <div className="space-y-1 pt-1">
              {coordinationPlan.executionOrder.map(step => (
                <div key={step.step} className="flex items-center justify-between bg-zinc-900/60 p-1.5 rounded border border-zinc-800/40 text-[9px] font-mono">
                  <span>Step #{step.step}: <strong className="text-zinc-200">{step.taskTitle}</strong> ({step.agentName})</span>
                  <span className="text-zinc-400">Depends on: {step.dependencies.length ? step.dependencies.join(', ') : 'None'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: Execution */}
      {activeTab === 'execution' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <PlayCircle className="w-4 h-4 text-purple-400" />
              Agent Execution Stages & Progress Tracking
            </span>
            <Badge variant="outline" className="text-purple-300 border-purple-500/30 font-mono text-[9px]">
              Progress: {executionReport.completionPercentage}%
            </Badge>
          </div>

          <div className="space-y-2 text-[10px]">
            {executionReport.stages.map(stage => (
              <div key={stage.stageId} className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-purple-400 font-bold text-[10px]">#{stage.order}</span>
                    <span className="font-semibold text-zinc-100 text-[11px]">{stage.stageName}</span>
                  </div>
                  <Badge variant={stage.status === 'COMPLETED' ? 'success' : 'outline'} className="text-[8px] font-mono">
                    {stage.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[9px] text-zinc-400 bg-zinc-900/60 p-1.5 rounded border border-zinc-800/40 font-mono">
                  <div>Assigned Agent: <span className="text-purple-300 font-semibold">{stage.assignedAgentName}</span></div>
                  <div>Tasks: <span className="text-zinc-200">{stage.taskIds.join(', ')}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 8: Approvals */}
      {activeTab === 'approval' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-blue-400" />
              Agent Approval Manager & Human Approval Gates
            </span>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-emerald-300 border-emerald-500/30 font-mono text-[9px]">
                {approvalReport.approvedCount} Approved
              </Badge>
              <Badge variant="outline" className="text-amber-300 border-amber-500/30 font-mono text-[9px]">
                {approvalReport.pendingCount} Pending Gate
              </Badge>
            </div>
          </div>

          <div className="space-y-2 text-[10px]">
            {approvalReport.requests.map(req => (
              <div key={req.requestId} className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                    <span className="font-semibold text-zinc-100 text-[11px]">{req.taskTitle}</span>
                  </div>
                  <Badge variant={req.approvalState === 'APPROVED' ? 'success' : 'outline'} className="text-[8px] font-mono">
                    {req.approvalState}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[9px] text-zinc-400 bg-zinc-900/60 p-1.5 rounded border border-zinc-800/40 font-mono">
                  <div>Requesting Agent: <span className="text-zinc-200">{req.requestingAgentName}</span></div>
                  <div>Approver Role: <span className="text-blue-300 font-semibold">{req.approverRole}</span></div>
                  <div>Rules Applied: <span className="text-purple-300">{req.approvalRulesApplied.join(', ')}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 9: Handoffs */}
      {activeTab === 'handoff' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
              Agent Context & Task Handoff Records
            </span>
            <Badge variant="outline" className="text-emerald-300 border-emerald-500/30 font-mono text-[9px]">
              {handoffReport.totalHandoffs} Handoffs
            </Badge>
          </div>

          <div className="space-y-2 text-[10px]">
            {handoffReport.records.map(hnd => (
              <div key={hnd.handoffId} className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-zinc-100 text-[11px]">{hnd.taskTitle}</span>
                  <Badge variant="success" className="text-[8px] font-mono">VALIDATED</Badge>
                </div>
                <div className="flex items-center justify-between bg-zinc-900/60 p-1.5 rounded border border-zinc-800/40 text-[9px] font-mono">
                  <span className="text-purple-300">{hnd.fromAgentName}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-blue-300">{hnd.toAgentName}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 10: Governance (Prompt 10.4) */}
      {activeTab === 'governance' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Orchestration Governance Engine & Policy Enforcement
            </span>
            <Badge variant="success" className="font-mono text-[9px]">
              Status: {governanceReport.overallGovernanceStatus}
            </Badge>
          </div>

          <div className="space-y-2 text-[10px]">
            {governanceReport.policies.map(pol => (
              <div key={pol.policyId} className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-zinc-100 text-[11px]">{pol.policyName}</span>
                  <Badge
                    variant="outline"
                    className={`text-[8px] font-mono ${
                      pol.riskLevel === 'CRITICAL' ? 'text-rose-400 border-rose-500/30' : 'text-amber-300 border-amber-500/30'
                    }`}
                  >
                    Risk: {pol.riskLevel}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[9px] text-zinc-400 bg-zinc-900/60 p-1.5 rounded border border-zinc-800/40 font-mono">
                  <div>Category: <span className="text-purple-300 font-semibold">{pol.agentCategory}</span></div>
                  <div>Approval Required: <span className="text-blue-300 font-semibold">{pol.requiresApproval ? 'YES' : 'NO'}</span></div>
                </div>
                <div className="text-[8.5px] text-zinc-400 font-mono">
                  Allowed Actions: <span className="text-zinc-200">{pol.allowedActions.join(', ')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 11: Conflicts (Prompt 10.4) */}
      {activeTab === 'conflicts' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-rose-400" />
              Agent Conflict Resolution & Lock Arbitration History
            </span>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-emerald-300 border-emerald-500/30 font-mono text-[9px]">
                {conflictReport.resolvedConflictsCount} Resolved
              </Badge>
              <Badge variant="outline" className="text-zinc-400 border-zinc-700 font-mono text-[9px]">
                {conflictReport.openConflictsCount} Open
              </Badge>
            </div>
          </div>

          <div className="space-y-2 text-[10px]">
            {conflictReport.conflicts.map(cnf => (
              <div key={cnf.conflictId} className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-zinc-100 text-[11px]">Type: {cnf.conflictType} Conflict ({cnf.conflictId})</span>
                  <Badge variant="success" className="text-[8px] font-mono">{cnf.status}</Badge>
                </div>
                <p className="text-zinc-300 text-[9px] bg-zinc-900/60 p-1.5 rounded border border-zinc-800/40">
                  {cnf.description}
                </p>
                <div className="text-[8.5px] text-emerald-300 font-mono">
                  Strategy Applied: {cnf.resolutionStrategy}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 12: Analytics (Prompt 10.4) */}
      {activeTab === 'analytics' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              Orchestration Analytics & Execution Performance Trends
            </span>
            <Badge variant="outline" className="text-cyan-300 border-cyan-500/30 font-mono text-[9px]">
              {analyticsReport.taskCompletionStats.completed} Tasks Completed
            </Badge>
          </div>

          <div className="grid grid-cols-4 gap-2 text-[10px]">
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
              <div className="text-zinc-400 text-[9px]">Total Delegations</div>
              <div className="text-purple-400 font-mono font-bold text-sm pt-0.5">
                {analyticsReport.delegationStats.totalDelegated}
              </div>
            </div>
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
              <div className="text-zinc-400 text-[9px]">Auto Approvals</div>
              <div className="text-emerald-400 font-mono font-bold text-sm pt-0.5">
                {analyticsReport.approvalStats.autoApproved}
              </div>
            </div>
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
              <div className="text-zinc-400 text-[9px]">Validated Handoffs</div>
              <div className="text-blue-400 font-mono font-bold text-sm pt-0.5">
                {analyticsReport.handoffStats.validatedHandoffs}
              </div>
            </div>
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
              <div className="text-zinc-400 text-[9px]">Total Failures</div>
              <div className="text-emerald-400 font-mono font-bold text-sm pt-0.5">
                {analyticsReport.failureStats.totalFailures} Failures
              </div>
            </div>
          </div>

          <div className="space-y-1.5 bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 text-[10px]">
            <span className="font-semibold text-zinc-200">Agent Performance Metrics:</span>
            <div className="space-y-1 pt-1">
              {analyticsReport.agentPerformance.map(metric => (
                <div key={metric.agentId} className="flex items-center justify-between bg-zinc-900/60 p-2 rounded border border-zinc-800/40 text-[9px] font-mono">
                  <span className="text-purple-300 font-semibold">{metric.agentName}</span>
                  <div className="flex items-center gap-3 text-zinc-400">
                    <span>Tasks: <strong className="text-zinc-100">{metric.tasksCompleted}</strong></span>
                    <span>Success: <strong className="text-emerald-400">{metric.successRatePercentage}%</strong></span>
                    <span>Avg Time: <strong className="text-cyan-300">{metric.avgExecutionTimeMinutes}m</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
