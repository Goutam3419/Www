import {
  durableCheckpointManager,
  idempotencyManager,
  errorClassificationService,
  circuitBreakerEngine,
  heartbeatMonitor,
  workflowDeadlockDetector,
  workflowRecoveryEngine,
  orchestrationMonitoringService,
  RetryPolicyEngine,
} from '@/services/agent-orchestration';
import { getRepositorySuite } from '@/lib/db/repositories';
import { Workflow, WorkflowStep } from '@/packages/types/src';

export interface AutonomousReliabilityTestResult {
  id: number;
  title: string;
  category: string;
  passed: boolean;
  details: string;
}

export async function runAutonomousReliabilityTestSuite(): Promise<{
  passedCount: number;
  failedCount: number;
  totalCount: number;
  results: AutonomousReliabilityTestResult[];
}> {
  const results: AutonomousReliabilityTestResult[] = [];
  const workspaceId = `ws_rel_${Date.now()}`;
  const userId = 'usr_ceo_tester';
  const repos = getRepositorySuite();

  // =========================================================================
  // 1. Durable Checkpoint & Integrity Tests
  // =========================================================================

  // Test 1: Checkpoint creation & deterministic checksum
  try {
    const cp = await durableCheckpointManager.createCheckpoint({
      workflowId: 'wf_test_001',
      workspaceId,
      executionId: 'exec_test_001',
      transitionEvent: 'WORKFLOW_STARTED',
      status: 'RUNNING',
      stepStates: {
        step_1: { stepId: 'step_1', name: 'Step 1', status: 'COMPLETED', dependencies: [], retryCount: 0 },
        step_2: { stepId: 'step_2', name: 'Step 2', status: 'PENDING', dependencies: ['step_1'], retryCount: 0 },
      },
      variables: { env: 'production', apiKey: 'sk_secret_12345_token' },
      agentOutputs: { step_1: { success: true, count: 42 } },
      toolResults: {},
      artifacts: {},
      pendingApprovals: [],
      activeAgentAssignments: {},
      retryCounters: {},
    });

    const isValid = durableCheckpointManager.validateCheckpointIntegrity(cp);
    const isRedacted = !(cp.variables.apiKey as string).includes('12345');

    const passed = !!cp.id && !!cp.checksum && isValid && isRedacted;
    results.push({
      id: 1,
      category: 'CHECKPOINT_INTEGRITY',
      title: 'Checkpoint Creation, Checksum & Secret Redaction',
      passed,
      details: passed
        ? `Checkpoint ${cp.id} created with valid SHA-256 checksum (${cp.checksum.substring(0, 12)}...) and secrets redacted`
        : `Checkpoint validation failed or secrets exposed`,
    });
  } catch (err: unknown) {
    results.push({
      id: 1,
      category: 'CHECKPOINT_INTEGRITY',
      title: 'Checkpoint Creation, Checksum & Secret Redaction',
      passed: false,
      details: `Exception: ${err instanceof Error ? err.message : String(err)}`,
    });
  }

  // Test 2: Tamper / Corruption Detection
  try {
    const cp = await durableCheckpointManager.createCheckpoint({
      workflowId: 'wf_test_002',
      workspaceId,
      executionId: 'exec_test_002',
      transitionEvent: 'STEP_COMPLETED',
      status: 'RUNNING',
      stepStates: {},
      variables: { count: 10 },
      agentOutputs: {},
      toolResults: {},
      artifacts: {},
      pendingApprovals: [],
      activeAgentAssignments: {},
      retryCounters: {},
    });

    // Tamper with step state without updating checksum
    const tampered = {
      ...cp,
      replanCount: 999, // Modified!
    };

    const isTamperedValid = durableCheckpointManager.validateCheckpointIntegrity(tampered);
    const passed = isTamperedValid === false;

    results.push({
      id: 2,
      category: 'CHECKPOINT_INTEGRITY',
      title: 'Tamper & Checkpoint Corruption Detection',
      passed,
      details: passed
        ? 'Tampered checkpoint correctly identified as invalid via SHA-256 mismatch'
        : 'Tampered checkpoint incorrectly passed integrity check',
    });
  } catch (err: unknown) {
    results.push({
      id: 2,
      category: 'CHECKPOINT_INTEGRITY',
      title: 'Tamper & Checkpoint Corruption Detection',
      passed: false,
      details: `Exception: ${err instanceof Error ? err.message : String(err)}`,
    });
  }

  // Test 3: Workspace Isolation on Checkpoint Queries
  try {
    let isolationBlocked = false;
    try {
      await durableCheckpointManager.getLatestCheckpoint('exec_test_001', 'ws_other_cross_isolated');
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('Workspace isolation violation')) {
        isolationBlocked = true;
      }
    }

    // In-memory returns null if not in workspace or throws if cross-workspace
    const crossCheck = await repos.checkpoints.getLatestByExecution('exec_test_001', 'ws_other_cross_isolated');
    const passed = isolationBlocked || crossCheck === null;

    results.push({
      id: 3,
      category: 'CHECKPOINT_INTEGRITY',
      title: 'Checkpoint Workspace Isolation Enforcement',
      passed,
      details: passed
        ? 'Cross-workspace checkpoint queries strictly isolated'
        : 'Cross-workspace data access permitted',
    });
  } catch (err: unknown) {
    results.push({
      id: 3,
      category: 'CHECKPOINT_INTEGRITY',
      title: 'Checkpoint Workspace Isolation Enforcement',
      passed: false,
      details: `Exception: ${err instanceof Error ? err.message : String(err)}`,
    });
  }

  // =========================================================================
  // 2. Idempotency & Deduplication Tests
  // =========================================================================

  // Test 4: Idempotency reservation and duplicate caching
  try {
    const key = `idemp_key_${Date.now()}`;
    const payload = { action: 'deploy_service', target: 'production', version: 'v2.1.0' };

    // 1st reservation
    const res1 = await idempotencyManager.reserveOperation({
      workspaceId,
      workflowExecutionId: 'exec_idemp_01',
      stepExecutionId: 'step_idemp_01',
      idempotencyKey: key,
      correlationId: 'corr_01',
      operationType: 'GENERIC_TOOL_EXECUTION',
      targetResource: 'deploy_tool',
      requestPayload: payload,
    });

    // Complete operation
    await idempotencyManager.completeOperation(workspaceId, key, { deployUrl: 'https://app.vercel.app', status: 'READY' });

    // 2nd duplicate reservation with same key
    const res2 = await idempotencyManager.reserveOperation({
      workspaceId,
      workflowExecutionId: 'exec_idemp_02',
      stepExecutionId: 'step_idemp_02',
      idempotencyKey: key,
      correlationId: 'corr_02',
      operationType: 'GENERIC_TOOL_EXECUTION',
      targetResource: 'deploy_tool',
      requestPayload: payload,
    });

    const passed =
      res1.isDuplicate === false &&
      res2.isDuplicate === true &&
      res2.record.status === 'COMPLETED' &&
      (res2.record.result as Record<string, unknown> | undefined)?.deployUrl === 'https://app.vercel.app';

    results.push({
      id: 4,
      category: 'IDEMPOTENCY_DEDUPLICATION',
      title: 'Idempotent Side-Effect Reservation & Deduplication',
      passed,
      details: passed
        ? 'Duplicate side-effect prevented; cached result returned'
        : 'Idempotency failed to deduplicate operation',
    });
  } catch (err: unknown) {
    results.push({
      id: 4,
      category: 'IDEMPOTENCY_DEDUPLICATION',
      title: 'Idempotent Side-Effect Reservation & Deduplication',
      passed: false,
      details: `Exception: ${err instanceof Error ? err.message : String(err)}`,
    });
  }

  // =========================================================================
  // 3. Autonomous Error Classification Tests
  // =========================================================================

  // Test 5: Rate limit error classification (429 / Retry-After)
  try {
    const class429 = errorClassificationService.classifyError('Rate limit exceeded: 429 Too Many Requests. Retry-After: 15');
    const passed =
      class429.category === 'RATE_LIMIT' &&
      class429.isRetryable === true &&
      class429.retryAfterSeconds === 15 &&
      class429.suggestedDelayMs === 15000;

    results.push({
      id: 5,
      category: 'ERROR_CLASSIFICATION',
      title: 'HTTP 429 Rate Limit & Retry-After Extraction',
      passed,
      details: passed
        ? `Correctly parsed RATE_LIMIT with Retry-After: 15s and delay 15000ms`
        : `Failed to classify rate limit: ${JSON.stringify(class429)}`,
    });
  } catch (err: unknown) {
    results.push({
      id: 5,
      category: 'ERROR_CLASSIFICATION',
      title: 'HTTP 429 Rate Limit & Retry-After Extraction',
      passed: false,
      details: `Exception: ${err instanceof Error ? err.message : String(err)}`,
    });
  }

  // Test 6: Permanent Authentication & Authorization Errors
  try {
    const authErr = errorClassificationService.classifyError('Error 401: Invalid API Key or credentials missing');
    const permErr = errorClassificationService.classifyError('Error 403: Forbidden - RBAC permission denied');

    const passed =
      authErr.category === 'AUTHENTICATION_ERROR' &&
      authErr.isRetryable === false &&
      authErr.recommendedStrategy === 'REQUEST_CREDENTIALS' &&
      permErr.category === 'AUTHORIZATION_ERROR' &&
      permErr.isRetryable === false &&
      permErr.recommendedStrategy === 'REQUEST_HUMAN_APPROVAL';

    results.push({
      id: 6,
      category: 'ERROR_CLASSIFICATION',
      title: 'Permanent Auth (401) & Permissions (403) Classification',
      passed,
      details: passed
        ? 'Auth/Perm errors marked non-retryable with exact resolution strategies'
        : 'Failed to classify auth/permission errors correctly',
    });
  } catch (err: unknown) {
    results.push({
      id: 6,
      category: 'ERROR_CLASSIFICATION',
      title: 'Permanent Auth (401) & Permissions (403) Classification',
      passed: false,
      details: `Exception: ${err instanceof Error ? err.message : String(err)}`,
    });
  }

  // Test 7: RetryPolicyEngine with Classification & Jitter
  try {
    const step: WorkflowStep = {
      id: 'step_test_eval',
      workflowId: 'wf_test',
      agentId: 'AGENT_TEST',
      name: 'Test Step',
      description: 'Step for testing adaptive retry evaluation',
      status: 'RUNNING',
      dependencies: [],
      input: {},
      requiredCapabilities: [],
      retryPolicy: { maxAttempts: 3, backoff: 'exponential', retryableErrors: ['RATE_LIMIT', 'TIMEOUT'] },
    };

    const evalRetryable = RetryPolicyEngine.evaluateRetry(step, 1, '429 Rate limit exceeded');
    const evalNonRetryable = RetryPolicyEngine.evaluateRetry(step, 1, '401 Unauthorized API key');

    const passed =
      evalRetryable.shouldRetry === true &&
      evalRetryable.backoffMs >= 1000 &&
      evalNonRetryable.shouldRetry === false &&
      evalNonRetryable.isPermanentFailure === true;

    results.push({
      id: 7,
      category: 'ERROR_CLASSIFICATION',
      title: 'Adaptive Retry Policy Evaluation with Jitter',
      passed,
      details: passed
        ? `Rate limit evaluated retryable (delay: ${evalRetryable.backoffMs}ms), 401 blocked permanently`
        : `Retry evaluation mismatch: retryable=${evalRetryable.shouldRetry}, nonRetryable=${evalNonRetryable.shouldRetry}`,
    });
  } catch (err: unknown) {
    results.push({
      id: 7,
      category: 'ERROR_CLASSIFICATION',
      title: 'Adaptive Retry Policy Evaluation with Jitter',
      passed: false,
      details: `Exception: ${err instanceof Error ? err.message : String(err)}`,
    });
  }

  // =========================================================================
  // 4. Adaptive Circuit Breaker Tests
  // =========================================================================

  // Test 8: Circuit Breaker trip on consecutive failures and fast-fail
  try {
    const provider = 'mock_external_provider_01';

    // Initial check: CLOSED & allowed
    const initial = await circuitBreakerEngine.checkCircuit(workspaceId, provider);

    // Record 3 failures (threshold is 3)
    await circuitBreakerEngine.recordFailure(workspaceId, provider, undefined, 50000);
    await circuitBreakerEngine.recordFailure(workspaceId, provider, undefined, 50000);
    const tripped = await circuitBreakerEngine.recordFailure(workspaceId, provider, undefined, 50000);

    // Fast-fail check
    const checkTripped = await circuitBreakerEngine.checkCircuit(workspaceId, provider);

    const passed =
      initial.state === 'CLOSED' &&
      initial.allowed === true &&
      tripped.state === 'OPEN' &&
      checkTripped.allowed === false &&
      checkTripped.state === 'OPEN';

    results.push({
      id: 8,
      category: 'CIRCUIT_BREAKER',
      title: 'Circuit Breaker Tripping on Consecutive Failures & Fast-Fail',
      passed,
      details: passed
        ? `Circuit transitioned to OPEN after 3 failures; subsequent requests fast-failed`
        : `Circuit breaker failed to trip: ${JSON.stringify(checkTripped)}`,
    });
  } catch (err: unknown) {
    results.push({
      id: 8,
      category: 'CIRCUIT_BREAKER',
      title: 'Circuit Breaker Tripping on Consecutive Failures & Fast-Fail',
      passed: false,
      details: `Exception: ${err instanceof Error ? err.message : String(err)}`,
    });
  }

  // Test 9: Circuit Breaker Reset on Success
  try {
    const provider = 'mock_external_provider_02';

    // Record 3 failures to open circuit
    await circuitBreakerEngine.recordFailure(workspaceId, provider);
    await circuitBreakerEngine.recordFailure(workspaceId, provider);
    await circuitBreakerEngine.recordFailure(workspaceId, provider);

    // Record success (e.g. from probe or manual reset)
    const restored = await circuitBreakerEngine.recordSuccess(workspaceId, provider);
    const recheck = await circuitBreakerEngine.checkCircuit(workspaceId, provider);

    const passed = restored.state === 'CLOSED' && recheck.allowed === true && recheck.state === 'CLOSED';

    results.push({
      id: 9,
      category: 'CIRCUIT_BREAKER',
      title: 'Circuit Breaker Recovery & Reset on Success',
      passed,
      details: passed
        ? 'Circuit reset to CLOSED with consecutive failures cleared'
        : 'Circuit failed to reset',
    });
  } catch (err: unknown) {
    results.push({
      id: 9,
      category: 'CIRCUIT_BREAKER',
      title: 'Circuit Breaker Recovery & Reset on Success',
      passed: false,
      details: `Exception: ${err instanceof Error ? err.message : String(err)}`,
    });
  }

  // =========================================================================
  // 5. Heartbeat & Orphan Detection Tests
  // =========================================================================

  // Test 10: Heartbeat emission and orphan detection
  try {
    const execId = `exec_orphan_${Date.now()}`;
    await heartbeatMonitor.emitHeartbeat(workspaceId, 'wf_orphan_01', execId, 'WORKFLOW', 'wf_orphan_01', 'RUNNING');

    // Query with expired cutoff (simulating timeout expiration)
    const orphans = await heartbeatMonitor.detectOrphans(workspaceId, -100);
    const found = orphans.some((o) => o.executionId === execId);

    // Autonomous recovery of orphans
    const report = await heartbeatMonitor.recoverOrphans(workspaceId, -100);

    const passed = found && report.recoveredExecutionsCount >= 1;

    results.push({
      id: 10,
      category: 'HEARTBEAT_OBSERVABILITY',
      title: 'Heartbeat Tracking, Orphan Detection & Recovery Audit',
      passed,
      details: passed
        ? `Detected orphaned execution ${execId} and initiated autonomous recovery log`
        : `Failed to detect or recover orphans (found=${found}, report=${JSON.stringify(report)})`,
    });
  } catch (err: unknown) {
    results.push({
      id: 10,
      category: 'HEARTBEAT_OBSERVABILITY',
      title: 'Heartbeat Tracking, Orphan Detection & Recovery Audit',
      passed: false,
      details: `Exception: ${err instanceof Error ? err.message : String(err)}`,
    });
  }

  // =========================================================================
  // 6. Workflow Deadlock & Cycle Detection Tests
  // =========================================================================

  // Test 11: Cyclic DAG Detection
  try {
    const cyclicPlan = {
      workflowId: 'wf_cyclic_01',
      plannedSteps: [
        { id: 's1', name: 'Step 1', dependencies: ['s3'], assignedAgentId: 'agent_1' },
        { id: 's2', name: 'Step 2', dependencies: ['s1'], assignedAgentId: 'agent_2' },
        { id: 's3', name: 'Step 3', dependencies: ['s2'], assignedAgentId: 'agent_3' },
      ],
      decisions: [],
      planningStatus: 'SUCCESS' as const,
      estimatedDurationMs: 3000,
    };

    const report = workflowDeadlockDetector.detectDeadlock(cyclicPlan, {});
    const passed = report.isDeadlocked === true && report.cycleDetected === true;

    results.push({
      id: 11,
      category: 'DEADLOCK_DETECTION',
      title: 'Cyclic Dependency Detection in Workflow DAG',
      passed,
      details: passed
        ? 'Cyclic dependency (s1 -> s2 -> s3 -> s1) accurately identified as deadlocked'
        : 'Failed to detect circular dependency',
    });
  } catch (err: unknown) {
    results.push({
      id: 11,
      category: 'DEADLOCK_DETECTION',
      title: 'Cyclic Dependency Detection in Workflow DAG',
      passed: false,
      details: `Exception: ${err instanceof Error ? err.message : String(err)}`,
    });
  }

  // Test 12: Unresolved Dependency Blockage Detection
  try {
    const plan = {
      workflowId: 'wf_blocked_01',
      plannedSteps: [
        { id: 'step_root', name: 'Root Step', dependencies: [] },
        { id: 'step_child', name: 'Child Step', dependencies: ['step_root'] },
      ],
      decisions: [],
      planningStatus: 'SUCCESS' as const,
      estimatedDurationMs: 2000,
    };

    // Step root has failed
    const stepStates = {
      step_root: { status: 'FAILED' as const, error: 'Network timeout' },
      step_child: { status: 'PENDING' as const },
    };

    const report = workflowDeadlockDetector.detectDeadlock(plan, stepStates);
    const passed =
      report.isDeadlocked === true &&
      report.cycleDetected === false &&
      report.blockedSteps.includes('step_child') &&
      report.unresolvedDependencies.length === 1;

    results.push({
      id: 12,
      category: 'DEADLOCK_DETECTION',
      title: 'Failed Predecessor Dependency Blockage Detection',
      passed,
      details: passed
        ? `Accurately flagged step_child blocked on failed step_root`
        : `Failed to detect blocked dependency`,
    });
  } catch (err: unknown) {
    results.push({
      id: 12,
      category: 'DEADLOCK_DETECTION',
      title: 'Failed Predecessor Dependency Blockage Detection',
      passed: false,
      details: `Exception: ${err instanceof Error ? err.message : String(err)}`,
    });
  }

  // =========================================================================
  // 7. End-to-End Workflow Resume & Checkpoint Recovery Tests
  // =========================================================================

  // Test 13: End-to-End Recovery from Mid-Workflow Checkpoint
  try {
    const wfId = `wf_recovery_test_${Date.now()}`;
    const execId = `exec_recovery_${Date.now()}`;

    // Create workflow definition in repo
    const testWf: Workflow = {
      id: wfId,
      name: 'Recovery Test Workflow',
      description: 'Testing mid-flight checkpoint recovery',
      workspaceId,
      status: 'RUNNING',
      steps: [
        {
          id: 'step_prep',
          workflowId: wfId,
          name: 'Data Preparation',
          description: 'Prepare data for processing',
          status: 'COMPLETED',
          dependencies: [],
          input: {},
          requiredCapabilities: [],
          agentId: 'DATA_AGENT',
          output: { prepared: true, items: 10 },
        },
        {
          id: 'step_process',
          workflowId: wfId,
          name: 'Data Processing',
          description: 'Process the prepared dataset',
          status: 'PENDING',
          dependencies: ['step_prep'],
          input: {},
          requiredCapabilities: [],
          agentId: 'CODING_AGENT',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await repos.workflows.create(testWf);

    // Save a checkpoint where step_prep is already COMPLETED
    await durableCheckpointManager.createCheckpoint({
      workflowId: wfId,
      workspaceId,
      executionId: execId,
      transitionEvent: 'STEP_COMPLETED',
      stepId: 'step_prep',
      status: 'RUNNING',
      stepStates: {
        step_prep: {
          stepId: 'step_prep',
          name: 'Data Preparation',
          status: 'COMPLETED',
          dependencies: [],
          retryCount: 0,
          output: { prepared: true, items: 10 },
        },
        step_process: {
          stepId: 'step_process',
          name: 'Data Processing',
          status: 'PENDING',
          dependencies: ['step_prep'],
          retryCount: 0,
        },
      },
      variables: { dataset: 'sales_2026' },
      agentOutputs: { step_prep: { prepared: true, items: 10 } },
      toolResults: {},
      artifacts: {},
      pendingApprovals: [],
      activeAgentAssignments: {},
      retryCounters: {},
    });

    // Execute Recovery Engine
    const recoveryResult = await workflowRecoveryEngine.recoverExecution({
      executionId: execId,
      workspaceId,
      userId,
      userRole: 'ADMIN',
    });

    const passed =
      recoveryResult.checkpointLoaded === true &&
      recoveryResult.integrityValid === true &&
      recoveryResult.status === 'COMPLETED' &&
      recoveryResult.alreadyCompletedSteps.includes('step_prep');

    results.push({
      id: 13,
      category: 'AUTONOMOUS_RECOVERY',
      title: 'End-to-End Workflow Resume & Step Skipping from Checkpoint',
      passed,
      details: passed
        ? `Successfully recovered execution '${execId}'; skipped completed step 'step_prep'; completed remaining DAG`
        : `Recovery failed: ${recoveryResult.error || JSON.stringify(recoveryResult)}`,
    });
  } catch (err: unknown) {
    results.push({
      id: 13,
      category: 'AUTONOMOUS_RECOVERY',
      title: 'End-to-End Workflow Resume & Step Skipping from Checkpoint',
      passed: false,
      details: `Exception: ${err instanceof Error ? err.message : String(err)}`,
    });
  }

  // =========================================================================
  // 8. Observability & System Reliability Metrics Tests
  // =========================================================================

  // Test 14: System-wide Reliability Telemetry & Metrics
  try {
    const metrics = await orchestrationMonitoringService.getWorkspaceReliabilityMetrics(workspaceId);
    const passed =
      metrics.workspaceId === workspaceId &&
      typeof metrics.systemReliabilityScore === 'number' &&
      metrics.systemReliabilityScore >= 0 &&
      metrics.systemReliabilityScore <= 1.0 &&
      Array.isArray(metrics.circuitBreakers) &&
      Array.isArray(metrics.recentRecoveryAudits);

    results.push({
      id: 14,
      category: 'OBSERVABILITY_METRICS',
      title: 'Orchestration Reliability & Recovery Telemetry Aggregation',
      passed,
      details: passed
        ? `Calculated workspace reliability score ${metrics.systemReliabilityScore} with ${metrics.recentRecoveryAudits.length} audit events`
        : 'Metrics aggregation failed',
    });
  } catch (err: unknown) {
    results.push({
      id: 14,
      category: 'OBSERVABILITY_METRICS',
      title: 'Orchestration Reliability & Recovery Telemetry Aggregation',
      passed: false,
      details: `Exception: ${err instanceof Error ? err.message : String(err)}`,
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
