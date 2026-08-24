import {
  agentExperienceManager,
  generateDeterministicEmbedding,
  cosineSimilarity,
} from '@/services/agent-orchestration/experience-memory';
import { toolReliabilityEngine } from '@/services/agent-orchestration/tool-reliability-engine';
import { agentPerformanceMemory } from '@/services/agent-orchestration/agent-performance-memory';
import { ceoDecisionMemory } from '@/services/agent-orchestration/ceo-decision-memory';
import { dynamicWorkflowPlanner } from '@/services/agent-orchestration/dynamic-workflow-planner';
import { workflowReplanner } from '@/services/agent-orchestration/workflow-replanner';
import { workflowExecutionEngine } from '@/services/agent-orchestration/workflow-execution-engine';
import { getRepositories } from '@/lib/db/repositories';

export interface ExperienceLearningTestResult {
  id: number;
  title: string;
  passed: boolean;
  details: string;
}

export async function runExperienceLearningTestSuite(): Promise<{
  passedCount: number;
  failedCount: number;
  totalCount: number;
  results: ExperienceLearningTestResult[];
}> {
  const results: ExperienceLearningTestResult[] = [];
  const workspaceA = `ws_learn_${Date.now()}_a`;
  const workspaceB = `ws_learn_${Date.now()}_b`;
  const userId = 'usr_experience_tester';

  // Test 1: Record experience with automatic secret sanitization
  try {
    const record = await agentExperienceManager.recordExperience({
      workspaceId: workspaceA,
      eventType: 'TOOL_EXECUTION',
      inputSummary: 'Invoke tool with secret API_KEY=AIzaSyAABBCCDDEEFFGG1122334455 and Bearer eyJhbGciOi...',
      actionSummary: 'Deploying with token sk-12345678901234567890',
      resultSummary: 'Success',
      success: true,
      confidence: 0.96,
      tags: ['DEPLOYMENT', 'TEST'],
      metadata: {
        apiKey: 'secret_1234567890',
        safeParam: 'public_value',
      },
    });

    const passed =
      record.workspaceId === workspaceA &&
      !record.inputSummary.includes('AIzaSyAABBCCDDEEFFGG1122334455') &&
      record.inputSummary.includes('[REDACTED]') &&
      !record.actionSummary.includes('sk-12345678901234567890') &&
      record.embedding.length === 768 &&
      record.metadata.apiKey === '[REDACTED]' &&
      record.metadata.safeParam === 'public_value';

    results.push({
      id: 1,
      title: 'Experience Recording & Secret Redaction',
      passed,
      details: passed
        ? 'Successfully redacted API keys and tokens before persisting 768-dim experience embedding.'
        : `Secret redaction or embedding verification failed: ${JSON.stringify(record)}`,
    });
  } catch (err: unknown) {
    results.push({ id: 1, title: 'Experience Recording & Secret Redaction', passed: false, details: String(err) });
  }

  // Test 2: Semantic embedding and cosine similarity
  try {
    const vec1 = generateDeterministicEmbedding('Build Next.js React e-commerce application with Stripe checkout');
    const vec2 = generateDeterministicEmbedding('Create Next.js online store with Stripe payment integration');
    const vec3 = generateDeterministicEmbedding('Quantum physics simulation with Python tensor calculations');

    const simRelated = cosineSimilarity(vec1, vec2);
    const simUnrelated = cosineSimilarity(vec1, vec3);

    const passed =
      vec1.length === 768 &&
      vec2.length === 768 &&
      simRelated > 0.6 &&
      simRelated > simUnrelated;

    results.push({
      id: 2,
      title: 'Deterministic Semantic Embeddings & Cosine Similarity',
      passed,
      details: passed
        ? `Related similarity (${simRelated.toFixed(3)}) scored higher than unrelated similarity (${simUnrelated.toFixed(3)}).`
        : `Vector similarity logic failed: related=${simRelated}, unrelated=${simUnrelated}`,
    });
  } catch (err: unknown) {
    results.push({ id: 2, title: 'Deterministic Semantic Embeddings & Cosine Similarity', passed: false, details: String(err) });
  }

  // Test 3: Workspace isolation in experience queries
  try {
    // Record in Workspace A
    await agentExperienceManager.recordExperience({
      workspaceId: workspaceA,
      eventType: 'WORKFLOW_SUCCESS',
      inputSummary: 'Workspace A specific secret operation',
      actionSummary: 'Performed internal alpha pipeline',
      resultSummary: 'Success in A',
      success: true,
    });

    // Query in Workspace B
    const searchInB = await agentExperienceManager.searchExperiences({
      workspaceId: workspaceB,
      query: 'Workspace A specific secret operation',
    });

    const searchInA = await agentExperienceManager.searchExperiences({
      workspaceId: workspaceA,
      query: 'Workspace A specific secret operation',
    });

    const passed = searchInB.length === 0 && searchInA.length > 0;

    results.push({
      id: 3,
      title: 'Workspace Isolation in Experience Memory',
      passed,
      details: passed
        ? `Workspace B returned 0 results while Workspace A returned ${searchInA.length} matches.`
        : `Isolation leak detected: B returned ${searchInB.length} results.`,
    });
  } catch (err: unknown) {
    results.push({ id: 3, title: 'Workspace Isolation in Experience Memory', passed: false, details: String(err) });
  }

  // Test 4: Recommendations Generation
  try {
    await agentExperienceManager.recordExperience({
      workspaceId: workspaceA,
      eventType: 'DEBUG_FIX',
      inputSummary: 'TypeError: Cannot read properties of undefined in user profile',
      actionSummary: 'Added optional chaining and null check in user loader',
      resultSummary: 'Bug resolved, test suite passing',
      success: true,
      errorCategory: 'TYPE_ERROR',
      resolution: 'Add optional chaining in user loader',
      confidence: 0.98,
    });

    await agentExperienceManager.recordExperience({
      workspaceId: workspaceA,
      eventType: 'TOOL_FAILURE',
      inputSummary: 'Vercel deployment failed with bundle limit error',
      actionSummary: 'Attempted standard static build without tree shaking',
      resultSummary: 'Bundle size exceeded 50MB limit',
      success: false,
      errorCategory: 'DEPLOYMENT_BUNDLE_LIMIT',
      confidence: 0.8,
    });

    const recs = await agentExperienceManager.generateRecommendations(
      workspaceA,
      'TypeError in user profile loading',
      { errorCategory: 'TYPE_ERROR' }
    );

    const passed =
      recs.successfulStrategies.length > 0 &&
      recs.recommendedActions.some((a) => a.toLowerCase().includes('optional chaining')) &&
      recs.confidenceScore > 0.7;

    results.push({
      id: 4,
      title: 'Agent Experience Recommendations Engine',
      passed,
      details: passed
        ? `Generated ${recs.recommendedActions.length} actionable recommendations with confidence ${recs.confidenceScore}.`
        : `Recommendations generation failed: ${JSON.stringify(recs)}`,
    });
  } catch (err: unknown) {
    results.push({ id: 4, title: 'Agent Experience Recommendations Engine', passed: false, details: String(err) });
  }

  // Test 5: Tool Reliability Engine - Provider Inference & Execution Tracking
  try {
    const gitTool = await toolReliabilityEngine.recordToolExecution(
      workspaceA,
      'github_repo_create',
      'Create GitHub Repository',
      true,
      120
    );

    const vercelFail = await toolReliabilityEngine.recordToolExecution(
      workspaceA,
      'vercel_deployment_create',
      'Deploy to Vercel',
      false,
      850,
      'RATE_LIMIT'
    );

    const report = await toolReliabilityEngine.getReliabilityReport(workspaceA);

    const passed =
      gitTool.provider === 'GITHUB' &&
      vercelFail.provider === 'VERCEL' &&
      report.providerMetrics.GITHUB.totalCalls >= 1 &&
      report.providerMetrics.VERCEL.totalCalls >= 1 &&
      report.topFailingTools.some((t) => t.toolId === 'vercel_deployment_create');

    results.push({
      id: 5,
      title: 'Tool Reliability Engine Tracking & Report',
      passed,
      details: passed
        ? `Successfully tracked provider metrics across GITHUB and VERCEL (Overall health: ${report.overallHealth}).`
        : `Tool reliability verification failed: ${JSON.stringify(report)}`,
    });
  } catch (err: unknown) {
    results.push({ id: 5, title: 'Tool Reliability Engine Tracking & Report', passed: false, details: String(err) });
  }

  // Test 6: Agent Performance Memory & Scoring
  try {
    const agentId = 'agent_dev_01';
    await agentPerformanceMemory.recordTaskOutcome(workspaceA, agentId, 'FULLSTACK_DEVELOPER_AGENT', true, 450, 1200);
    await agentPerformanceMemory.recordReviewOutcome(workspaceA, agentId, true);
    await agentPerformanceMemory.recordHandoffOutcome(workspaceA, agentId, true);

    const metrics = await agentPerformanceMemory.getAgentPerformance(agentId, workspaceA);
    const score = await agentPerformanceMemory.getAgentScore(agentId, workspaceA);

    const passed =
      metrics !== null &&
      metrics.tasksCompleted === 1 &&
      metrics.tasksFailed === 0 &&
      metrics.reviewApprovalRate === 1.0 &&
      metrics.handoffSuccessRate === 1.0 &&
      score >= 0.9;

    results.push({
      id: 6,
      title: 'Agent Performance Memory & Holistic Scoring',
      passed,
      details: passed
        ? `Agent '${agentId}' achieved reliability score ${score} with 100% review and handoff rates.`
        : `Agent performance verification failed: score=${score}, metrics=${JSON.stringify(metrics)}`,
    });
  } catch (err: unknown) {
    results.push({ id: 6, title: 'Agent Performance Memory & Holistic Scoring', passed: false, details: String(err) });
  }

  // Test 7: CEO Strategic Decision Memory
  try {
    const decision = await ceoDecisionMemory.recordDecision({
      workspaceId: workspaceA,
      decisionId: `dec_test_${Date.now()}`,
      category: 'DATABASE_SELECTION',
      rationale: 'Select Supabase PostgreSQL for relational enterprise requirements',
      selectedOption: 'Supabase PostgreSQL with pgvector',
      outcome: 'Architectural pattern accepted by engineering team',
    });

    const retrieved = await ceoDecisionMemory.retrievePastDecisions(workspaceA, 'DATABASE_SELECTION');

    const passed =
      decision.eventType === 'CEO_DECISION' &&
      retrieved.length > 0 &&
      retrieved.some((d) => d.metadata.category === 'DATABASE_SELECTION');

    results.push({
      id: 7,
      title: 'CEO Strategic Decision Memory & Retrieval',
      passed,
      details: passed
        ? `Successfully stored and retrieved ${retrieved.length} CEO architectural decisions.`
        : `CEO decision memory verification failed: ${JSON.stringify(retrieved)}`,
    });
  } catch (err: unknown) {
    results.push({ id: 7, title: 'CEO Strategic Decision Memory & Retrieval', passed: false, details: String(err) });
  }

  // Test 8: Replanner Experience Memory Integration & Self-Healing
  try {
    const plan = await dynamicWorkflowPlanner.planWorkflow({
      prompt: 'Build SaaS admin panel with analytics',
      workspaceId: workspaceA,
      userId,
      userRole: 'ADMIN',
    });

    const failedStep = plan.workflow.steps[1] || plan.workflow.steps[0] || { id: 'step_1', name: 'Build Step' };
    const replanResult = await workflowReplanner.replanWorkflow({
      workflow: plan.workflow,
      failedStepId: failedStep.id,
      failureReason: 'AssertionError: Expected status 200 but got 500',
      failureCategory: 'TEST_FAILURE',
      workspaceId: workspaceA,
      userId,
    });

    const expFixes = await agentExperienceManager.searchExperiences({
      workspaceId: workspaceA,
      eventType: 'DEBUG_FIX',
    });

    const passed =
      replanResult.success &&
      replanResult.strategyUsed === 'DIAGNOSTIC_SELF_HEAL_AND_RETEST' &&
      expFixes.length > 0;

    results.push({
      id: 8,
      title: 'Self-Healing Workflow Replanning & Experience Logging',
      passed,
      details: passed
        ? `Replanner injected self-healing steps and recorded ${expFixes.length} DEBUG_FIX experiences.`
        : `Replanner self-healing verification failed: ${JSON.stringify(replanResult)}`,
    });
  } catch (err: unknown) {
    results.push({ id: 8, title: 'Self-Healing Workflow Replanning & Experience Logging', passed: false, details: String(err) });
  }

  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.length - passedCount;

  return {
    passedCount,
    failedCount,
    totalCount: results.length,
    results,
  };
}
