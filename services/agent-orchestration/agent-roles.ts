import { AgentRole } from '@/packages/types/src';

export interface AgentRoleDefinition {
  role: AgentRole;
  name: string;
  description: string;
  requiredCapabilities: string[];
  recommendedTools: string[];
  maxConcurrency: number;
}

export interface AgentLifecycleContract {
  state: 'INIT' | 'READY' | 'EXECUTING' | 'COMPLETED' | 'FAILED' | 'DISPOSED';
  agentId: string;
  role: AgentRole;
  currentStepId?: string;
  startedAt?: string;
  updatedAt: string;
}

export const SPECIALIZED_AGENT_ROLES: Record<string, AgentRoleDefinition> = {
  CEO_AGENT: {
    role: 'CEO_AGENT',
    name: 'AI CEO Orchestrator',
    description: 'Executive strategy, goal definition, cross-agent coordination, and final sign-off.',
    requiredCapabilities: ['STRATEGIC_PLANNING', 'CROSS_AGENT_ORCHESTRATION', 'RISK_EVALUATION', 'DECISION_APPROVAL'],
    recommendedTools: ['EXECUTIVE_DASHBOARD', 'GOVERNANCE_CONSOLE'],
    maxConcurrency: 1,
  },
  PLANNER_AGENT: {
    role: 'PLANNER_AGENT',
    name: 'Workflow Planner Agent',
    description: 'Deconstructs user objectives into dependency-aware workflow steps.',
    requiredCapabilities: ['WORKFLOW_PLANNING', 'DEPENDENCY_ANALYSIS', 'RESOURCE_ESTIMATION'],
    recommendedTools: ['PLANNING_ENGINE', 'DEPENDENCY_ANALYZER'],
    maxConcurrency: 2,
  },
  RESEARCH_AGENT: {
    role: 'RESEARCH_AGENT',
    name: 'Research & Intelligence Agent',
    description: 'Conducts market, code, or context research using RAG and search tools.',
    requiredCapabilities: ['CONTEXT_SEARCH', 'RAG_RETRIEVAL', 'DOCUMENT_PARSING'],
    recommendedTools: ['google_drive_search', 'KNOWLEDGE_SEARCH', 'RAG_RETRIEVAL'],
    maxConcurrency: 3,
  },
  DESIGN_AGENT: {
    role: 'DESIGN_AGENT',
    name: 'UI/UX & Architecture Design Agent',
    description: 'Drafts design tokens, component architecture, and API interface specifications.',
    requiredCapabilities: ['SYSTEM_DESIGN', 'COMPONENT_SPEC', 'API_DESIGN'],
    recommendedTools: ['DESIGN_TOKEN_GEN', 'SCHEMA_BUILDER'],
    maxConcurrency: 2,
  },
  CODING_AGENT: {
    role: 'CODING_AGENT',
    name: 'Full-Stack Software Engineering Agent',
    description: 'Generates, edits, and refactors application code and files.',
    requiredCapabilities: ['CODE_GENERATION', 'AST_REFACTORING', 'IMPORT_OPTIMIZATION'],
    recommendedTools: ['tool_fs_read', 'tool_fs_write', 'github_file_write', 'github_commit'],
    maxConcurrency: 5,
  },
  DATABASE_AGENT: {
    role: 'DATABASE_AGENT',
    name: 'Database & Data Model Agent',
    description: 'Manages database schemas, migrations, Firestore security rules, and queries.',
    requiredCapabilities: ['SCHEMA_MIGRATION', 'FIRESTORE_RULES', 'SQL_QUERY_GEN'],
    recommendedTools: ['firebase_firestore_write', 'firebase_rules_deploy'],
    maxConcurrency: 2,
  },
  TESTING_AGENT: {
    role: 'TESTING_AGENT',
    name: 'Quality Assurance & Testing Agent',
    description: 'Executes linters, type checks, build tests, and automated validation suites.',
    requiredCapabilities: ['LINTING', 'TYPE_CHECKING', 'TEST_EXECUTION'],
    recommendedTools: ['tool_terminal_exec', 'LINTER', 'BUILD_SYSTEM'],
    maxConcurrency: 3,
  },
  DEBUG_AGENT: {
    role: 'DEBUG_AGENT',
    name: 'Automated Debug & Self-Healing Agent',
    description: 'Analyzes build failures or execution errors and formulates patch fixes.',
    requiredCapabilities: ['ERROR_DIAGNOSIS', 'PATCH_GENERATION', 'LOG_ANALYSIS'],
    recommendedTools: ['tool_fs_read', 'tool_fs_write', 'LOG_ANALYZER'],
    maxConcurrency: 2,
  },
  DEPLOYMENT_AGENT: {
    role: 'DEPLOYMENT_AGENT',
    name: 'Release & Infrastructure Deployment Agent',
    description: 'Triggers deployments to Vercel/Firebase and monitors live health.',
    requiredCapabilities: ['VERCEL_DEPLOYMENT', 'FIREBASE_DEPLOYMENT', 'DOMAIN_MANAGEMENT'],
    recommendedTools: ['tool_vercel_deploy', 'vercel_deployment_create', 'firebase_rules_deploy'],
    maxConcurrency: 2,
  },
  REVIEW_AGENT: {
    role: 'REVIEW_AGENT',
    name: 'Governance & Code Review Agent',
    description: 'Audits changes for security, compliance, performance, and license compliance.',
    requiredCapabilities: ['SECURITY_AUDIT', 'GOVERNANCE_CHECK', 'LICENSE_COMPLIANCE'],
    recommendedTools: ['AUDIT_LOGGER', 'GOVERNANCE_ENGINE'],
    maxConcurrency: 2,
  },
};

export function getAgentRoleDefinition(role?: AgentRole | string): AgentRoleDefinition {
  const normalizedRole = (role || 'CODING_AGENT') as AgentRole;
  return (
    SPECIALIZED_AGENT_ROLES[normalizedRole] || {
      role: normalizedRole,
      name: `Specialized Agent (${String(normalizedRole)})`,
      description: 'Specialized domain task execution agent.',
      requiredCapabilities: [typeof normalizedRole === 'string' ? normalizedRole.toLowerCase() : 'coding_agent'],
      recommendedTools: [],
      maxConcurrency: 2,
    }
  );
}
