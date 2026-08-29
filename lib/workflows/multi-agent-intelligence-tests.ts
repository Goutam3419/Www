import {
  agentAssignmentResolver,
  decisionOptimizationEngine,
  failurePredictionService,
  agentTeamFormationService,
  agentDecisionReviewService,
  confidenceEngine,
  dynamicWorkflowPlanner,
  agentExperienceManager,
  ceoDecisionMemory,
  toolReliabilityEngine,
} from '@/services/agent-orchestration';
import { workspaceGovernanceEngine } from '@/services/workspace/workspace-governance-engine';
import { WorkflowPlannedStep } from '@/packages/types/src';

export interface MultiAgentIntelligenceTestResult {
  id: number;
  title: string;
  category: string;
  passed: boolean;
  details: string;
}

export async function runMultiAgentIntelligenceTestSuite(): Promise<{
  passedCount: number;
  failedCount: number;
  totalCount: number;
  results: MultiAgentIntelligenceTestResult[];
}> {
  const results: MultiAgentIntelligenceTestResult[] = [];
  const workspaceId = `ws_intel_${Date.now()}`;
  const userId = 'usr_ceo_tester';

  // Seed sample quota via governance engine
  workspaceGovernanceEngine.updatePolicy(workspaceId, {
    enforceStrictBlocking: true,
    limits: {
      TASKS: { resourceType: 'TASKS', description: 'Task limit', limit: 100, warningThresholdPercent: 80, unit: 'tasks' },
      AGENTS: { resourceType: 'AGENTS', description: 'Agent limit', limit: 50, warningThresholdPercent: 80, unit: 'agents' },
      STORAGE_MB: { resourceType: 'STORAGE_MB', description: 'Storage limit', limit: 10240, warningThresholdPercent: 80, unit: 'MB' },
      TOOL_EXECUTIONS: { resourceType: 'TOOL_EXECUTIONS', description: 'Tool executions limit', limit: 100000, warningThresholdPercent: 80, unit: 'calls' },
      CODE_EXECUTIONS: { resourceType: 'CODE_EXECUTIONS', description: 'Code executions limit', limit: 5000, warningThresholdPercent: 80, unit: 'executions' },
    },
  });

  // =========================================================================
  // 1. Intelligent Agent Selection Tests
  // =========================================================================

  // Test 1: Rank multiple candidates for coding task
  try {
    const ranking = await agentAssignmentResolver.rankAgentCandidates({
      role: 'CODING_AGENT',
      requiredCapabilities: ['CODE_GENERATION', 'TYPESCRIPT', 'REACT_COMPONENTS'],
      workspaceId,
      taskSimilarityQuery: 'Generate React components and TypeScript API handlers',
    });

    const passed =
      ranking.candidates.length >= 3 &&
      ranking.selectedAgent !== undefined &&
      ranking.selectedAgent.role === 'CODING_AGENT' &&
      ranking.selectedAgent.score > 0.7 &&
      ranking.selectedAgent.breakdown.capabilityScore > 0;

    results.push({
      id: 1,
      category: 'AGENT_SELECTION',
      title: 'Multi-Factor Agent Candidate Ranking',
      passed,
      details: passed
        ? `Ranked ${ranking.candidates.length} candidates. Top agent: ${ranking.selectedAgent.agentId} (Score: ${ranking.selectedAgent.score})`
        : 'Failed to rank agent candidates correctly',
    });
  } catch (err) {
    results.push({
      id: 1,
      category: 'AGENT_SELECTION',
      title: 'Multi-Factor Agent Candidate Ranking',
      passed: false,
      details: `Exception: ${String(err)}`,
    });
  }

  // Test 2: Select best agent based on experience & capability
  try {
    // Record experience for a specific agent role
    await agentExperienceManager.recordExperience({
      workspaceId,
      agentRole: 'DATABASE_AGENT',
      eventType: 'TOOL_EXECUTION',
      inputSummary: 'Execute complex schema migration',
      actionSummary: 'Applied PostgreSQL migration scripts',
      resultSummary: 'Success with 0 errors',
      success: true,
      confidence: 0.98,
      tags: ['DATABASE', 'MIGRATION'],
    });

    const assignment = await agentAssignmentResolver.resolveAgent({
      role: 'DATABASE_AGENT',
      requiredCapabilities: ['SCHEMA_DESIGN', 'SQL_EXECUTION'],
      workspaceId,
      taskSimilarityQuery: 'Execute complex schema migration',
    });

    const passed =
      assignment.role === 'DATABASE_AGENT' &&
      assignment.confidenceScore >= 0.85 &&
      assignment.workspaceId === workspaceId;

    results.push({
      id: 2,
      category: 'AGENT_SELECTION',
      title: 'Capability and Experience-Guided Agent Resolution',
      passed,
      details: passed
        ? `Assigned ${assignment.agentId} with confidence ${assignment.confidenceScore}`
        : 'Agent assignment did not meet criteria',
    });
  } catch (err) {
    results.push({
      id: 2,
      category: 'AGENT_SELECTION',
      title: 'Capability and Experience-Guided Agent Resolution',
      passed: false,
      details: `Exception: ${String(err)}`,
    });
  }

  // Test 3: Quota enforcement during agent resolution
  try {
    const tightWorkspace = `ws_tight_${Date.now()}`;
    workspaceGovernanceEngine.updatePolicy(tightWorkspace, {
      enforceStrictBlocking: true,
      limits: {
        AGENTS: { limit: 0, warningThresholdPercent: 80, unit: 'agents' },
        TASKS: { limit: 0, warningThresholdPercent: 80, unit: 'tasks' },
        STORAGE_MB: { limit: 0, warningThresholdPercent: 80, unit: 'MB' },
        TOOL_EXECUTIONS: { limit: 0, warningThresholdPercent: 80, unit: 'calls' },
        CODE_EXECUTIONS: { limit: 0, warningThresholdPercent: 80, unit: 'executions' },
      },
    });

    let blocked = false;
    try {
      await agentAssignmentResolver.resolveAgent({
        role: 'CODING_AGENT',
        workspaceId: tightWorkspace,
      });
    } catch {
      blocked = true;
    }

    results.push({
      id: 3,
      category: 'AGENT_SELECTION',
      title: 'Quota Limit Enforcement on Agent Assignment',
      passed: blocked,
      details: blocked ? 'Correctly rejected agent assignment when quota was 0' : 'Failed to block agent on 0 quota',
    });
  } catch (err) {
    results.push({
      id: 3,
      category: 'AGENT_SELECTION',
      title: 'Quota Limit Enforcement on Agent Assignment',
      passed: false,
      details: `Exception: ${String(err)}`,
    });
  }

  // =========================================================================
  // 2. Dynamic Team Formation Tests
  // =========================================================================

  // Test 4: Form multi-agent team from workflow requirements
  const sampleSteps: WorkflowPlannedStep[] = [
    {
      id: 'step_frontend',
      name: 'Build React UI',
      description: 'Create frontend dashboard',
      agentRole: 'CODING_AGENT',
      assignedAgentId: 'agent_coding_01',
      dependencies: [],
      requiredCapabilities: ['REACT_COMPONENTS'],
      approvalRequired: false,
      input: {},
    },
    {
      id: 'step_backend',
      name: 'Implement API Routes',
      description: 'Build backend API',
      agentRole: 'CODING_AGENT',
      assignedAgentId: 'agent_coding_01',
      dependencies: [],
      requiredCapabilities: ['API_INTEGRATION'],
      approvalRequired: false,
      input: {},
    },
    {
      id: 'step_db',
      name: 'Setup Database',
      description: 'Migrate DB schema',
      agentRole: 'DATABASE_AGENT',
      assignedAgentId: 'agent_db_01',
      dependencies: [],
      requiredCapabilities: ['SCHEMA_DESIGN'],
      approvalRequired: false,
      input: {},
    },
    {
      id: 'step_test',
      name: 'Run Unit Tests',
      description: 'Test all endpoints',
      agentRole: 'TESTING_AGENT',
      assignedAgentId: 'agent_test_01',
      dependencies: ['step_frontend', 'step_backend'],
      requiredCapabilities: ['TEST_EXECUTION'],
      approvalRequired: false,
      input: {},
    },
  ];

  try {
    const teamResult = await agentTeamFormationService.formTeamForWorkflow({
      workspaceId,
      workflowId: 'wf_team_test',
      name: 'Dynamic Fullstack Team',
      steps: sampleSteps,
      userId,
    });

    const passed =
      teamResult.success &&
      teamResult.memberCount >= 4 &&
      teamResult.team.status === 'ACTIVE' &&
      teamResult.team.hierarchy.length > 0 &&
      teamResult.parallelBranchesCount >= 1;

    results.push({
      id: 4,
      category: 'TEAM_FORMATION',
      title: 'Dynamic Agent Team Formation & Parallel Branch Detection',
      passed,
      details: passed
        ? `Formed team '${teamResult.team.name}' with ${teamResult.memberCount} members and ${teamResult.parallelBranchesCount} parallel branches`
        : `Failed team formation: ${teamResult.error || 'Unknown error'}`,
    });
  } catch (err) {
    results.push({
      id: 4,
      category: 'TEAM_FORMATION',
      title: 'Dynamic Agent Team Formation & Parallel Branch Detection',
      passed: false,
      details: `Exception: ${String(err)}`,
    });
  }

  // Test 5: Dynamic Team Cancellation
  try {
    const teamResult = await agentTeamFormationService.formTeamForWorkflow({
      workspaceId,
      workflowId: 'wf_cancel_test',
      steps: sampleSteps,
      userId,
    });

    const cancelled = agentTeamFormationService.cancelTeam(teamResult.team.teamId);
    const fetched = agentTeamFormationService.getTeam(teamResult.team.teamId);

    const passed = cancelled && fetched !== null && fetched.status === 'CANCELLED';

    results.push({
      id: 5,
      category: 'TEAM_FORMATION',
      title: 'Dynamic Team Lifecycle and Cancellation',
      passed,
      details: passed ? 'Successfully formed and cancelled team lifecycle' : 'Failed team cancellation',
    });
  } catch (err) {
    results.push({
      id: 5,
      category: 'TEAM_FORMATION',
      title: 'Dynamic Team Lifecycle and Cancellation',
      passed: false,
      details: `Exception: ${String(err)}`,
    });
  }

  // =========================================================================
  // 3. Decision Optimization Engine Tests
  // =========================================================================

  // Test 6: Multi-Strategy Decision Optimization & Comparison
  try {
    const decisionResult = await decisionOptimizationEngine.optimizeDecision(
      {
        workspaceId,
        userId,
        prompt: 'Build SaaS Dashboard with user analytics and billing',
      },
      {
        objective: 'Build SaaS Dashboard',
        projectType: 'SAAS_DASHBOARD',
        features: ['AUTHENTICATION', 'ANALYTICS_CHARTS', 'PAYMENT_GATEWAY'],
        integrations: ['STRIPE'],
        databaseRequirements: { type: 'firestore', isRequired: true },
        authenticationRequirements: { provider: 'firebase', isRequired: true },
        storageRequirements: { provider: 'none', isRequired: false },
        deploymentTarget: { provider: 'vercel', isRequired: true },
        testingRequirements: { unitTests: true, linting: true, typeChecking: true, buildCheck: true },
        securityRequirements: { rbac: true, secretRedaction: true, approvalGates: true },
        userConstraints: [],
      },
      sampleSteps
    );

    const passed =
      decisionResult.strategies.length >= 3 &&
      decisionResult.selectedStrategy !== undefined &&
      decisionResult.selectedStrategy.weightedDecisionScore > 0 &&
      decisionResult.selectionRationale.length > 20 &&
      decisionResult.confidence > 0.5;

    results.push({
      id: 6,
      category: 'DECISION_OPTIMIZATION',
      title: 'Multi-Strategy Comparison and Deterministic Scoring',
      passed,
      details: passed
        ? `Evaluated ${decisionResult.strategies.length} strategies. Winner: '${decisionResult.selectedStrategy.name}' (Score: ${decisionResult.selectedStrategy.weightedDecisionScore})`
        : 'Failed strategy optimization',
    });
  } catch (err) {
    results.push({
      id: 6,
      category: 'DECISION_OPTIMIZATION',
      title: 'Multi-Strategy Comparison and Deterministic Scoring',
      passed: false,
      details: `Exception: ${String(err)}`,
    });
  }

  // =========================================================================
  // 4. Failure Prediction Tests
  // =========================================================================

  // Test 7: Pre-Execution Risk and Failure Prediction
  try {
    // Record past deployment failure
    await agentExperienceManager.recordExperience({
      workspaceId,
      eventType: 'DEBUG_FIX',
      inputSummary: 'Deploy application to Vercel production',
      actionSummary: 'Deploy trigger',
      resultSummary: 'Failed: Missing environment variable NEXT_PUBLIC_API_URL',
      errorCategory: 'DEPLOYMENT_FAILURE',
      resolution: 'Set missing environment variables before deployment trigger',
      success: false,
      confidence: 0.95,
      tags: ['DEPLOYMENT', 'VERCEL', 'ENV_VARS'],
    });

    const predictionReport = await failurePredictionService.predictWorkflowFailures(
      workspaceId,
      [
        {
          id: 'step_dep',
          name: 'Deploy to Vercel',
          toolId: 'tool_vercel_deploy',
          requiredCapabilities: ['DEPLOYMENT'],
          input: {},
        } as WorkflowPlannedStep,
      ]
    );

    const passed =
      predictionReport.stepPredictions.length === 1 &&
      predictionReport.stepPredictions[0].predictedRisk !== 'LOW' &&
      predictionReport.stepPredictions[0].recommendedPreventiveActions.length > 0;

    results.push({
      id: 7,
      category: 'FAILURE_PREDICTION',
      title: 'Pre-Execution Risk & Failure Prediction with Preventive Actions',
      passed,
      details: passed
        ? `Predicted Risk: [${predictionReport.overallRisk}]. Preventive Actions: ${predictionReport.preventiveActionsRequired.join('; ')}`
        : 'Failed to predict failure from historical evidence',
    });
  } catch (err) {
    results.push({
      id: 7,
      category: 'FAILURE_PREDICTION',
      title: 'Pre-Execution Risk & Failure Prediction with Preventive Actions',
      passed: false,
      details: `Exception: ${String(err)}`,
    });
  }

  // Test 8: Unconfigured Provider Health Check
  try {
    const unconfigPred = await failurePredictionService.predictStepFailure({
      workspaceId: `ws_empty_${Date.now()}`,
      stepName: 'Upload assets to Supabase Storage',
      toolId: 'tool_supabase_upload',
    });

    const passed =
      unconfigPred.providerHealthStatus === 'NOT_CONFIGURED' ||
      unconfigPred.possibleFailureReasons.some((r) => r.includes('not configured') || r.includes('credentials missing'));

    results.push({
      id: 8,
      category: 'FAILURE_PREDICTION',
      title: 'Unconfigured Provider Credential Detection',
      passed,
      details: passed
        ? `Detected unconfigured provider with preventive check: ${unconfigPred.possibleFailureReasons[0]}`
        : 'Failed to detect unconfigured provider',
    });
  } catch (err) {
    results.push({
      id: 8,
      category: 'FAILURE_PREDICTION',
      title: 'Unconfigured Provider Credential Detection',
      passed: false,
      details: `Exception: ${String(err)}`,
    });
  }

  // =========================================================================
  // 5. Multi-Agent Review / Debate Tests
  // =========================================================================

  // Test 9: Multi-Agent Debate & CEO Strategic Final Decision
  try {
    const reviewResult = await agentDecisionReviewService.conductDecisionReview({
      workspaceId,
      workflowId: 'wf_debate_01',
      topic: 'Adopt Enterprise High-Reliability Architecture with Full Rollback Gates',
      proposedStrategy: {
        strategyId: 'strat_enterprise',
        strategyType: 'ENTERPRISE_ROBUST',
        name: 'Enterprise High-Reliability Architecture',
        description: 'Multi-layer verification with AST validation and rollback readiness',
        expectedSuccessProbability: 0.98,
        estimatedExecutionTimeMs: 20000,
        estimatedCost: { tokenCost: 20000, toolCalls: 8, agentExecutions: 5, estimatedTimeMs: 20000 },
        riskScore: 0.12,
        reliabilityScore: 0.96,
        previousExperienceScore: 0.92,
        complexityScore: 0.75,
        weightedDecisionScore: 0.94,
        pros: ['High reliability'],
        cons: ['Higher cost'],
        suggestedTools: ['tool_read_file', 'tool_write_file'],
        steps: sampleSteps,
      },
      maxRounds: 3,
    });

    const passed =
      reviewResult.rounds.length >= 2 &&
      reviewResult.ceoDecision.decision !== undefined &&
      reviewResult.ceoDecision.confidence >= 0.70 &&
      reviewResult.ceoDecision.rationale.length > 10;

    results.push({
      id: 9,
      category: 'MULTI_AGENT_DEBATE',
      title: 'Multi-Agent Strategy Review & CEO Final Decision',
      passed,
      details: passed
        ? `Conducted ${reviewResult.rounds.length} debate rounds. CEO Decision: [${reviewResult.ceoDecision.decision}] (Confidence: ${Math.round(reviewResult.ceoDecision.confidence * 100)}%)`
        : 'Failed multi-agent debate review',
    });
  } catch (err) {
    results.push({
      id: 9,
      category: 'MULTI_AGENT_DEBATE',
      title: 'Multi-Agent Strategy Review & CEO Final Decision',
      passed: false,
      details: `Exception: ${String(err)}`,
    });
  }

  // Test 10: Strict Enforced Maximum Debate Depth (No infinite loops)
  try {
    const boundedReview = await agentDecisionReviewService.conductDecisionReview({
      workspaceId,
      topic: 'Boundary Loop Test',
      proposedStrategy: {
        strategyId: 'strat_loop',
        strategyType: 'STANDARD_MODULAR',
        name: 'Standard Pipeline',
        description: 'Test bounding',
        expectedSuccessProbability: 0.90,
        estimatedExecutionTimeMs: 10000,
        estimatedCost: { tokenCost: 5000, toolCalls: 2, agentExecutions: 2, estimatedTimeMs: 10000 },
        riskScore: 0.2,
        reliabilityScore: 0.9,
        previousExperienceScore: 0.8,
        complexityScore: 0.3,
        weightedDecisionScore: 0.85,
        pros: [],
        cons: [],
        suggestedTools: [],
        steps: [],
      },
      maxRounds: 100, // Request excessive rounds
    });

    const passed = boundedReview.rounds.length <= 3;

    results.push({
      id: 10,
      category: 'MULTI_AGENT_DEBATE',
      title: 'Debate Round Depth Bounded (Loop Prevention)',
      passed,
      details: passed
        ? `Enforced strict maximum depth limit (${boundedReview.rounds.length} rounds executed out of 100 requested)`
        : 'Failed to bound debate rounds',
    });
  } catch (err) {
    results.push({
      id: 10,
      category: 'MULTI_AGENT_DEBATE',
      title: 'Debate Round Depth Bounded (Loop Prevention)',
      passed: false,
      details: `Exception: ${String(err)}`,
    });
  }

  // =========================================================================
  // 6. Confidence Engine Tests
  // =========================================================================

  // Test 11: High Confidence on Rich Evidence
  try {
    const highConf = await confidenceEngine.calculateConfidence({
      workspaceId,
      agentId: 'agent_coding_01',
      experienceCount: 8,
      experienceAvgScore: 0.95,
      requirementsCount: 6,
      predictedRisk: 'LOW',
      reviewAgreements: 3,
      totalReviewers: 3,
    });

    const passed =
      highConf.overallConfidence >= 0.85 &&
      highConf.riskLevel === 'LOW' &&
      !highConf.requiresAdditionalReview;

    results.push({
      id: 11,
      category: 'CONFIDENCE_ENGINE',
      title: 'High-Evidence Deterministic Confidence Assessment',
      passed,
      details: passed
        ? `Overall Confidence: ${Math.round(highConf.overallConfidence * 100)}%, Risk: [${highConf.riskLevel}]`
        : 'High confidence test did not meet criteria',
    });
  } catch (err) {
    results.push({
      id: 11,
      category: 'CONFIDENCE_ENGINE',
      title: 'High-Evidence Deterministic Confidence Assessment',
      passed: false,
      details: `Exception: ${String(err)}`,
    });
  }

  // Test 12: Low Confidence Triggers Additional Review
  try {
    const lowConf = await confidenceEngine.calculateConfidence({
      workspaceId,
      experienceCount: 0,
      experienceAvgScore: 0.3,
      requirementsCount: 1,
      hasMissingRequirements: true,
      predictedRisk: 'CRITICAL',
      isHighImpact: true,
    });

    const passed =
      lowConf.overallConfidence < 0.60 &&
      lowConf.requiresAdditionalReview &&
      lowConf.requiresHumanApproval;

    results.push({
      id: 12,
      category: 'CONFIDENCE_ENGINE',
      title: 'Low Confidence Triggers Additional Review & Approval Gates',
      passed,
      details: passed
        ? `Confidence: ${Math.round(lowConf.overallConfidence * 100)}%, Review Required: ${lowConf.requiresAdditionalReview}, Human Gate: ${lowConf.requiresHumanApproval}`
        : 'Low confidence trigger failed',
    });
  } catch (err) {
    results.push({
      id: 12,
      category: 'CONFIDENCE_ENGINE',
      title: 'Low Confidence Triggers Additional Review & Approval Gates',
      passed: false,
      details: `Exception: ${String(err)}`,
    });
  }

  // =========================================================================
  // 7. CEO Decision Memory Tests
  // =========================================================================

  // Test 13: Record and Retrieve Strategic Decisions
  try {
    await ceoDecisionMemory.recordStrategicDecision({
      workspaceId,
      workflowId: 'wf_strat_01',
      decisionType: 'CONTINUE',
      strategicGoal: 'Deploy Serverless Microservices with Firestore',
      rationale: 'Firestore is verified healthy and offers elastic auto-scaling',
      tradeoffs: { cost: 12000, risk: 0.15 },
      confidence: 0.95,
    });

    const retrieved = await ceoDecisionMemory.retrieveStrategicDecisions(
      workspaceId,
      'Deploy Serverless Microservices with Firestore',
      3
    );

    const passed =
      retrieved.length > 0 &&
      retrieved[0].strategicGoal.includes('Serverless Microservices') &&
      retrieved[0].confidence === 0.95;

    results.push({
      id: 13,
      category: 'CEO_DECISION_MEMORY',
      title: 'Strategic Decision Recording and Vector-Driven Retrieval',
      passed,
      details: passed
        ? `Retrieved precedent: '${retrieved[0].strategicGoal}' (Decision: [${retrieved[0].decisionType}])`
        : 'Failed to retrieve strategic decision',
    });
  } catch (err) {
    results.push({
      id: 13,
      category: 'CEO_DECISION_MEMORY',
      title: 'Strategic Decision Recording and Vector-Driven Retrieval',
      passed: false,
      details: `Exception: ${String(err)}`,
    });
  }

  // =========================================================================
  // 8. End-to-End Dynamic Workflow Planner Integration Test
  // =========================================================================

  // Test 14: Complete Dynamic Workflow Planning Pipeline with Phase 14.3.4
  try {
    const plan = await dynamicWorkflowPlanner.planWorkflow({
      workspaceId,
      userId,
      userRole: 'ADMIN',
      prompt: 'Build fullstack Next.js app with Supabase authentication, database schema, and automated unit tests',
    });

    const passed =
      plan.planningStatus === 'SUCCESS' &&
      plan.strategyComparison !== undefined &&
      plan.strategyComparison.strategies.length >= 3 &&
      plan.failurePredictionReport !== undefined &&
      plan.agentTeam !== undefined &&
      plan.agentTeam.members.length >= 3 &&
      plan.confidenceAssessment !== undefined &&
      plan.confidenceAssessment.overallConfidence > 0.7;

    results.push({
      id: 14,
      category: 'END_TO_END_INTEGRATION',
      title: 'End-to-End Intelligent Workflow Planning with Phase 14.3.4 Engines',
      passed,
      details: passed
        ? `Plan generated with strategy '${plan.strategyComparison?.selectedStrategy.name}', team of ${plan.agentTeam?.members.length} agents, overall confidence ${Math.round((plan.confidenceAssessment?.overallConfidence || 0) * 100)}%`
        : `Planning did not complete all Phase 14.3.4 requirements: status=${plan.planningStatus}`,
    });
  } catch (err) {
    results.push({
      id: 14,
      category: 'END_TO_END_INTEGRATION',
      title: 'End-to-End Intelligent Workflow Planning with Phase 14.3.4 Engines',
      passed: false,
      details: `Exception: ${String(err)}`,
    });
  }

  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;

  return {
    passedCount,
    failedCount,
    totalCount: results.length,
    results,
  };
}
