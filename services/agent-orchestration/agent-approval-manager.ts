import { AgentApprovalManagerReport, AgentApprovalRequest, AgentApprovalHistoryItem } from '@/packages/types/src';
import { dbStore } from '@/lib/db/store';

export class AgentApprovalManagerService {
  public getApprovalReport(workspaceId: string = 'ws_enterprise_01'): AgentApprovalManagerReport {
    const existing = dbStore.getLatestAgentApprovalManagerReport(workspaceId);
    if (existing) return existing;

    const requests: AgentApprovalRequest[] = [
      {
        requestId: 'appr_req_01',
        taskId: 'task_arch_01',
        taskTitle: 'Architect Enterprise Multi-Agent System Core',
        requestingAgentId: 'agent_ceo_01',
        requestingAgentName: 'Executive AI CEO Agent',
        approverRole: 'HUMAN_EXECUTIVE_BOARD',
        approvalState: 'APPROVED',
        approvalRulesApplied: ['RULE_HUMAN_GATE_CRITICAL_ARCH', 'RULE_CEO_SIGN_OFF'],
        decisionNotes: 'Architecture proposal reviewed and approved for implementation.',
        decisionTimestamp: '2026-08-07T10:10:00.000Z'
      },
      {
        requestId: 'appr_req_02',
        taskId: 'task_code_02',
        taskTitle: 'Execute Code Refactoring & AST Validation',
        requestingAgentId: 'agent_eng_01',
        requestingAgentName: 'Autonomous Software Engineering Agent',
        approverRole: 'LEAD_ARCHITECT_AGENT',
        approvalState: 'APPROVED',
        approvalRulesApplied: ['RULE_AUTOMATED_LINT_VERIFICATION', 'RULE_STRICT_TYPES'],
        decisionNotes: 'AST changes verified clean without breaking exports.',
        decisionTimestamp: '2026-08-07T10:20:00.000Z'
      },
      {
        requestId: 'appr_req_03',
        taskId: 'task_gov_04',
        taskTitle: 'Audit Compliance & Retention Policy Rules',
        requestingAgentId: 'agent_gov_01',
        requestingAgentName: 'Security Governance Agent',
        approverRole: 'CHIEF_COMPLIANCE_OFFICER',
        approvalState: 'PENDING',
        approvalRulesApplied: ['RULE_SOC2_GATE_APPROVAL', 'RULE_PRIVACY_AUDIT'],
        decisionNotes: 'Awaiting human compliance officer signoff.'
      }
    ];

    const history: AgentApprovalHistoryItem[] = [
      {
        timestamp: '2026-08-07T10:05:00.000Z',
        requestId: 'appr_req_01',
        taskId: 'task_arch_01',
        action: 'REQUESTED',
        actorRole: 'agent_ceo_01'
      },
      {
        timestamp: '2026-08-07T10:10:00.000Z',
        requestId: 'appr_req_01',
        taskId: 'task_arch_01',
        action: 'APPROVED',
        actorRole: 'HUMAN_EXECUTIVE_BOARD'
      },
      {
        timestamp: '2026-08-07T10:18:00.000Z',
        requestId: 'appr_req_02',
        taskId: 'task_code_02',
        action: 'REQUESTED',
        actorRole: 'agent_eng_01'
      },
      {
        timestamp: '2026-08-07T10:20:00.000Z',
        requestId: 'appr_req_02',
        taskId: 'task_code_02',
        action: 'APPROVED',
        actorRole: 'LEAD_ARCHITECT_AGENT'
      },
      {
        timestamp: '2026-08-07T10:40:00.000Z',
        requestId: 'appr_req_03',
        taskId: 'task_gov_04',
        action: 'REQUESTED',
        actorRole: 'agent_gov_01'
      }
    ];

    const pendingCount = requests.filter(r => r.approvalState === 'PENDING').length;
    const approvedCount = requests.filter(r => r.approvalState === 'APPROVED').length;
    const rejectedCount = requests.filter(r => r.approvalState === 'REJECTED').length;

    const report: AgentApprovalManagerReport = {
      id: `aamr_${Date.now()}`,
      workspaceId,
      totalRequests: requests.length,
      pendingCount,
      approvedCount,
      rejectedCount,
      requests,
      history,
      generatedAt: new Date().toISOString()
    };

    dbStore.saveAgentApprovalManagerReport(report);
    return report;
  }
}

export const agentApprovalManagerService = new AgentApprovalManagerService();
