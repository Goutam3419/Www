import { runWorkflowEngineTestSuite } from '../lib/workflows/workflow-engine-tests';
import { runSecurityTestSuite } from '../lib/auth/security-tests';
import { runUniversalToolRegistryTestSuite } from '../lib/tools/tool-registry-tests';
import { runExperienceLearningTestSuite } from '../lib/workflows/experience-learning-tests';
import { runMultiAgentIntelligenceTestSuite } from '../lib/workflows/multi-agent-intelligence-tests';
import { runAutonomousReliabilityTestSuite } from '../lib/workflows/autonomous-reliability-tests';

async function main() {
  console.log('=== RUNNING WORKFLOW ENGINE TESTS ===');
  const wfResults = await runWorkflowEngineTestSuite();
  console.log(`Workflow Tests: ${wfResults.passedCount}/${wfResults.totalCount} PASSED`);
  for (const r of wfResults.results) {
    console.log(` [${r.passed ? 'PASS' : 'FAIL'}] #${r.id} ${r.title}: ${r.details}`);
  }

  console.log('\n=== RUNNING SECURITY TESTS ===');
  const secResults = await runSecurityTestSuite();
  console.log(`Security Tests: ${secResults.passedCount}/${secResults.total} PASSED`);
  for (const r of secResults.results) {
    console.log(` [${r.passed ? 'PASS' : 'FAIL'}] #${r.id} ${r.title}: ${r.details}`);
  }

  console.log('\n=== RUNNING UNIVERSAL TOOL REGISTRY TESTS ===');
  const toolResults = await runUniversalToolRegistryTestSuite();
  console.log(`Tool Registry Tests: ${toolResults.passedCount}/${toolResults.totalCount} PASSED`);
  for (const r of toolResults.results) {
    console.log(` [${r.passed ? 'PASS' : 'FAIL'}] #${r.id} ${r.title}: ${r.details}`);
  }

  console.log('\n=== RUNNING PHASE 14.3.3 EXPERIENCE & LEARNING ENGINE TESTS ===');
  const expResults = await runExperienceLearningTestSuite();
  console.log(`Experience Engine Tests: ${expResults.passedCount}/${expResults.totalCount} PASSED`);
  for (const r of expResults.results) {
    console.log(` [${r.passed ? 'PASS' : 'FAIL'}] #${r.id} ${r.title}: ${r.details}`);
  }

  console.log('\n=== RUNNING PHASE 14.3.4 MULTI-AGENT INTELLIGENCE & DECISION OPTIMIZATION TESTS ===');
  const intelResults = await runMultiAgentIntelligenceTestSuite();
  console.log(`Intelligence & Decision Tests: ${intelResults.passedCount}/${intelResults.totalCount} PASSED`);
  for (const r of intelResults.results) {
    console.log(` [${r.passed ? 'PASS' : 'FAIL'}] #${r.id} [${r.category}] ${r.title}: ${r.details}`);
  }

  console.log('\n=== RUNNING PHASE 14.3.5 AUTONOMOUS RELIABILITY, RECOVERY & OBSERVABILITY TESTS ===');
  const relResults = await runAutonomousReliabilityTestSuite();
  console.log(`Reliability & Recovery Tests: ${relResults.passedCount}/${relResults.totalCount} PASSED`);
  for (const r of relResults.results) {
    console.log(` [${r.passed ? 'PASS' : 'FAIL'}] #${r.id} [${r.category}] ${r.title}: ${r.details}`);
  }
}

main().catch(console.error);


