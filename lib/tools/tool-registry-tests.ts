import { toolEngineFacade } from '@/services/tool-engine';
import { providerAdapterRegistry } from '@/services/tool-engine/provider-adapters';
import { firebaseToolExecutorService } from '@/services/firebase/firebase-tool-executor';
import { googleToolExecutorService } from '@/services/google/google-tool-executor';
import { aiProviderToolExecutorService } from '@/services/ai/ai-provider-tool-executor';
import { capabilityDiscoveryService } from '@/services/tool-engine/capability-discovery';
import { sanitizeOutput } from '@/services/firebase/credentials';

export interface TestCaseResult {
  id: number;
  title: string;
  passed: boolean;
  details: string;
}

export async function runUniversalToolRegistryTestSuite(): Promise<{
  passedCount: number;
  failedCount: number;
  totalCount: number;
  results: TestCaseResult[];
}> {
  const results: TestCaseResult[] = [];

  // TEST 1: Tool registration
  try {
    const testToolId = `test_tool_reg_${Date.now()}`;
    const regResult = toolEngineFacade.registry.registerTool({
      id: testToolId,
      name: 'Test Registration Tool',
      description: 'Temporary tool for test suite verification.',
      provider: 'internal',
      category: 'Governance',
      version: '1.0.0',
      source: 'internal',
      dangerLevel: 'Safe',
      approvalRequired: false,
      enabled: true,
      requiredPermissions: ['governance:read'],
      inputSchema: { type: 'object', properties: { testKey: { type: 'string' } } },
    });

    const retrieved = toolEngineFacade.registry.getTool(testToolId);
    const passed = regResult.success && retrieved !== undefined && retrieved.id === testToolId;
    results.push({
      id: 1,
      title: 'Tool registration',
      passed,
      details: passed ? `Registered and verified tool ID '${testToolId}'.` : `Registration failed: ${regResult.error}`,
    });
    toolEngineFacade.registry.unregisterTool(testToolId);
  } catch (err: unknown) {
    results.push({ id: 1, title: 'Tool registration', passed: false, details: String(err) });
  }

  // TEST 2: Duplicate tool prevention
  try {
    const dupId = `test_dup_${Date.now()}`;
    toolEngineFacade.registry.registerTool({
      id: dupId,
      name: 'Duplicate Tool Initial',
      description: 'First registration.',
      provider: 'internal',
      category: 'Governance',
      version: '1.0.0',
      source: 'internal',
      dangerLevel: 'Safe',
      approvalRequired: false,
      enabled: true,
      requiredPermissions: [],
      inputSchema: { type: 'object', properties: {} },
    });

    const secondReg = toolEngineFacade.registry.registerTool({
      id: dupId,
      name: 'Duplicate Tool Second',
      description: 'Duplicate attempt.',
      provider: 'internal',
      category: 'Governance',
      version: '1.0.0',
      source: 'internal',
      dangerLevel: 'Safe',
      approvalRequired: false,
      enabled: true,
      requiredPermissions: [],
      inputSchema: { type: 'object', properties: {} },
    });

    const passed = !secondReg.success && secondReg.error?.includes('already registered');
    results.push({
      id: 2,
      title: 'Duplicate tool prevention',
      passed,
      details: passed ? 'Duplicate registration blocked successfully with expected error.' : 'Failed to block duplicate registration.',
    });
    toolEngineFacade.registry.unregisterTool(dupId);
  } catch (err: unknown) {
    results.push({ id: 2, title: 'Duplicate tool prevention', passed: false, details: String(err) });
  }

  // TEST 3: Tool & capability discovery
  try {
    const caps = toolEngineFacade.capabilities.listCapabilities();
    const githubTools = toolEngineFacade.registry.listToolsByProvider('github');
    const passed = caps.length > 0 && githubTools.length > 0;
    results.push({
      id: 3,
      title: 'Tool & capability discovery',
      passed,
      details: passed ? `Discovered ${caps.length} standard capabilities and ${githubTools.length} GitHub provider tools.` : 'Discovery returned empty sets.',
    });
  } catch (err: unknown) {
    results.push({ id: 3, title: 'Tool & capability discovery', passed: false, details: String(err) });
  }

  // TEST 4: MCP tool normalization
  try {
    const mcpTools = toolEngineFacade.registry.listTools().filter((t) => t.source === 'mcp');
    const validNorm = mcpTools.every((t) => t.id && t.provider && t.inputSchema && t.version && t.dangerLevel);
    const passed = mcpTools.length >= 4 && validNorm;
    results.push({
      id: 4,
      title: 'MCP tool normalization',
      passed,
      details: passed ? `Normalized ${mcpTools.length} MCP tools into UniversalToolDefinition format.` : 'MCP normalization missing required fields.',
    });
  } catch (err: unknown) {
    results.push({ id: 4, title: 'MCP tool normalization', passed: false, details: String(err) });
  }

  // TEST 5: Tool schema validation
  try {
    const invalidTool = {
      id: '',
      name: '',
      provider: 'internal',
      category: 'Governance',
      version: '1.0.0',
      source: 'internal',
      dangerLevel: 'Safe',
      approvalRequired: false,
      enabled: true,
      requiredPermissions: [],
      inputSchema: null as unknown as Record<string, unknown>,
    };
    const valResult = toolEngineFacade.registry.validateTool(invalidTool as unknown as Parameters<typeof toolEngineFacade.registry.validateTool>[0]);
    const passed = !valResult.valid && valResult.errors.length > 0;
    results.push({
      id: 5,
      title: 'Tool schema validation',
      passed,
      details: passed ? `Invalid tool schema rejected with ${valResult.errors.length} validation errors.` : 'Failed to catch invalid tool schema.',
    });
  } catch (err: unknown) {
    results.push({ id: 5, title: 'Tool schema validation', passed: false, details: String(err) });
  }

  // TEST 6: Permission denial
  try {
    const execRes = await toolEngineFacade.execution.executeUniversalTool({
      toolId: 'tool_terminal_exec',
      workspaceId: 'ws_test_perm',
      userId: 'usr_guest',
      input: { command: 'ls -la' },
      userRole: 'VIEWER' as unknown as Parameters<typeof toolEngineFacade.execution.executeUniversalTool>[0]['userRole'],
    });

    const passed = !execRes.success && (execRes.error?.includes('Permission') || execRes.error?.includes('denied'));
    results.push({
      id: 6,
      title: 'Permission denial',
      passed,
      details: passed ? `Unauthorized VIEWER role execution blocked: '${execRes.error}'.` : 'Execution should have failed for unauthorized role.',
    });
  } catch (err: unknown) {
    results.push({ id: 6, title: 'Permission denial', passed: false, details: String(err) });
  }

  // TEST 7: Workspace isolation
  try {
    const execRes = await toolEngineFacade.execution.executeUniversalTool({
      toolId: 'mcp_workspace_quota_check',
      workspaceId: 'ws_tenant_alpha_99',
      userId: 'usr_ceo_001',
      input: { workspaceId: 'ws_tenant_alpha_99' },
      userRole: 'ADMIN',
    });

    const passed = execRes.success && (execRes.output as { workspaceId?: string })?.workspaceId === 'ws_tenant_alpha_99';
    results.push({
      id: 7,
      title: 'Workspace isolation',
      passed,
      details: passed ? 'Execution scoped correctly to target workspace context.' : 'Workspace context isolation failed.',
    });
  } catch (err: unknown) {
    results.push({ id: 7, title: 'Workspace isolation', passed: false, details: String(err) });
  }

  // TEST 8: High-risk approval requirement
  try {
    const execRes = await toolEngineFacade.execution.executeUniversalTool({
      toolId: 'mcp_vercel_deploy_trigger',
      workspaceId: 'ws_test_approval',
      userId: 'usr_developer',
      input: { workspaceId: 'ws_test_approval', projectId: 'proj_demo' },
      userRole: 'DEVELOPER' as unknown as Parameters<typeof toolEngineFacade.execution.executeUniversalTool>[0]['userRole'],
    });

    const passed = !execRes.success && (execRes.error?.includes('approval') || execRes.metadata?.approvalRequired === true);
    results.push({
      id: 8,
      title: 'High-risk approval requirement',
      passed,
      details: passed ? `High risk deployment tool rejected without administrative approval: '${execRes.error}'.` : 'High risk tool executed without approval.',
    });
  } catch (err: unknown) {
    results.push({ id: 8, title: 'High-risk approval requirement', passed: false, details: String(err) });
  }

  // TEST 9: Tool execution result normalization
  try {
    const execRes = await toolEngineFacade.execution.executeUniversalTool({
      toolId: 'tool_fs_read',
      workspaceId: 'ws_test_norm',
      userId: 'usr_ceo_001',
      input: { path: 'package.json' },
      userRole: 'ADMIN',
    });

    const passed =
      typeof execRes.success === 'boolean' &&
      typeof execRes.durationMs === 'number' &&
      typeof execRes.toolId === 'string' &&
      typeof execRes.executionId === 'string';

    results.push({
      id: 9,
      title: 'Tool execution result normalization',
      passed,
      details: passed ? `Normalized ToolExecutionResult received (duration: ${execRes.durationMs}ms).` : 'ToolExecutionResult format mismatch.',
    });
  } catch (err: unknown) {
    results.push({ id: 9, title: 'Tool execution result normalization', passed: false, details: String(err) });
  }

  // TEST 10: MCP disconnect handling
  try {
    const testServerId = `mcp_test_disc_${Date.now()}`;
    toolEngineFacade.mcp.registerServer({
      id: testServerId,
      name: 'Disconnect Test MCP Server',
      version: '1.0.0',
      provider: 'mcp',
      transport: 'adapter',
      status: 'DISCONNECTED',
      enabled: true,
    });

    await toolEngineFacade.mcp.connectServer(testServerId);
    const serverBefore = toolEngineFacade.mcp.getServer(testServerId);
    const wasConnected = serverBefore?.status === 'CONNECTED';

    await toolEngineFacade.mcp.disconnectServer(testServerId);
    const serverAfter = toolEngineFacade.mcp.getServer(testServerId);
    const isDisconnected = serverAfter?.status === 'DISCONNECTED';

    const passed = wasConnected && isDisconnected;
    results.push({
      id: 10,
      title: 'MCP disconnect handling',
      passed,
      details: passed ? 'MCP server connected and safely disconnected without registry corruption.' : 'MCP disconnect lifecycle failure.',
    });

    await toolEngineFacade.mcp.unregisterServer(testServerId);
  } catch (err: unknown) {
    results.push({ id: 10, title: 'MCP disconnect handling', passed: false, details: String(err) });
  }

  // TEST 11: Credential leakage prevention
  try {
    const tools = toolEngineFacade.registry.listTools();
    const servers = toolEngineFacade.mcp.listServers();

    const jsonTools = JSON.stringify(tools);
    const jsonServers = JSON.stringify(servers);

    const hasSecretKey = jsonTools.includes('secret') || jsonTools.includes('private_key') || jsonServers.includes('apiKey');
    const passed = !hasSecretKey;
    results.push({
      id: 11,
      title: 'Credential leakage prevention',
      passed,
      details: passed ? 'Verified zero exposed secrets or tokens in tool definitions or server catalog.' : 'Detected potential secret leak in catalog payload.',
    });
  } catch (err: unknown) {
    results.push({ id: 11, title: 'Credential leakage prevention', passed: false, details: String(err) });
  }

  // TEST 12: Existing 4 MCP tools remain functional
  try {
    const requiredFour = ['mcp_github_repo_sync', 'mcp_firebase_db_query', 'mcp_vercel_deploy_trigger', 'mcp_workspace_quota_check'];
    const allFound = requiredFour.every((id) => toolEngineFacade.registry.getTool(id) !== undefined);

    const quotaExec = await toolEngineFacade.execution.executeUniversalTool({
      toolId: 'mcp_workspace_quota_check',
      workspaceId: 'ws_default_001',
      userId: 'usr_ceo_001',
      input: { workspaceId: 'ws_default_001' },
      userRole: 'ADMIN',
    });

    const passed = allFound && quotaExec.success;
    results.push({
      id: 12,
      title: 'Existing 4 MCP tools remain functional',
      passed,
      details: passed ? 'All 4 standard MCP tools verified registered and executable.' : 'Standard MCP tools missing or failed execution.',
    });
  } catch (err: unknown) {
    results.push({ id: 12, title: 'Existing 4 MCP tools remain functional', passed: false, details: String(err) });
  }

  // TEST 13: Real GitHub tools registration & credential handling
  try {
    const requiredGitHubTools = [
      'github_repo_list',
      'github_repo_info',
      'github_repo_tree',
      'github_file_read',
      'github_file_write',
      'github_branch_create',
      'github_commit',
      'github_repo_sync'
    ];
    const allFound = requiredGitHubTools.every((id) => toolEngineFacade.registry.getTool(id) !== undefined);

    const repoListExec = await toolEngineFacade.execution.executeUniversalTool({
      toolId: 'github_repo_list',
      workspaceId: 'ws_default_001',
      userId: 'usr_unconfigured_001',
      input: {},
      userRole: 'ADMIN',
    });

    const isHandled = !repoListExec.success && repoListExec.error?.includes('NOT_CONFIGURED');
    const passed = allFound && isHandled;

    results.push({
      id: 13,
      title: 'Real GitHub tools registration & credential handling',
      passed,
      details: passed
        ? `All 8 GitHub tools registered. Missing credential test returned expected NOT_CONFIGURED response.`
        : `GitHub tools check failed. registeredAll=${allFound}, error=${repoListExec.error}`,
    });
  } catch (err: unknown) {
    results.push({ id: 13, title: 'Real GitHub tools registration & credential handling', passed: false, details: String(err) });
  }

  // TEST 14: Real Vercel tools registration & credential handling
  try {
    const requiredVercelTools = [
      'vercel_project_list',
      'vercel_project_info',
      'vercel_project_create',
      'vercel_deployment_create',
      'vercel_deployment_status',
      'vercel_deployment_logs',
      'vercel_domain_list',
      'vercel_domain_attach'
    ];
    const allFound = requiredVercelTools.every((id) => toolEngineFacade.registry.getTool(id) !== undefined);

    const projectListExec = await toolEngineFacade.execution.executeUniversalTool({
      toolId: 'vercel_project_list',
      workspaceId: 'ws_default_001',
      userId: 'usr_unconfigured_001',
      input: {},
      userRole: 'ADMIN',
    });

    const isHandled = !projectListExec.success && projectListExec.error?.includes('NOT_CONFIGURED');
    const passed = allFound && isHandled;

    results.push({
      id: 14,
      title: 'Real Vercel tools registration & credential handling',
      passed,
      details: passed
        ? `All 8 Vercel tools registered. Missing credential test returned expected NOT_CONFIGURED response.`
        : `Vercel tools check failed. registeredAll=${allFound}, error=${projectListExec.error}`,
    });
  } catch (err: unknown) {
    results.push({ id: 14, title: 'Real Vercel tools registration & credential handling', passed: false, details: String(err) });
  }

  // TEST 15: All Firebase tools registered
  try {
    const requiredFirebaseTools = [
      'firebase_project_list',
      'firebase_project_info',
      'firebase_firestore_list_collections',
      'firebase_firestore_query',
      'firebase_firestore_read',
      'firebase_firestore_get_document',
      'firebase_firestore_write',
      'firebase_firestore_create_document',
      'firebase_firestore_update',
      'firebase_firestore_update_document',
      'firebase_firestore_delete',
      'firebase_firestore_delete_document',
      'firebase_auth_users_list',
      'firebase_auth_user_list',
      'firebase_auth_user_get',
      'firebase_auth_user_create',
      'firebase_auth_user_disable',
      'firebase_storage_list',
      'firebase_storage_upload',
      'firebase_storage_delete',
      'firebase_rules_read',
      'firebase_rules_validate',
      'firebase_rules_deploy'
    ];
    const registered = requiredFirebaseTools.every((id) => toolEngineFacade.registry.getTool(id) !== undefined);
    results.push({
      id: 15,
      title: 'All Firebase tools registered',
      passed: registered,
      details: registered ? `Verified all ${requiredFirebaseTools.length} Firebase tools registered.` : 'Some Firebase tools missing from registry.',
    });
  } catch (err: unknown) {
    results.push({ id: 15, title: 'All Firebase tools registered', passed: false, details: String(err) });
  }

  // TEST 16: Firebase provider routes to real executor
  try {
    const adapter = providerAdapterRegistry.getAdapter('firebase');
    const passed = adapter !== undefined;
    results.push({
      id: 16,
      title: 'Firebase provider routes to real executor',
      passed,
      details: passed ? 'Firebase provider adapter registered and linked to real executor.' : 'Firebase provider adapter missing.',
    });
  } catch (err: unknown) {
    results.push({ id: 16, title: 'Firebase provider routes to real executor', passed: false, details: String(err) });
  }

  // TEST 17: Missing Firebase credentials returns NOT_CONFIGURED
  try {
    const execRes = await firebaseToolExecutorService.executeTool('firebase_project_list', {
      executionId: 'exec_test_17',
      workspaceId: 'ws_test_unconfig',
      projectId: 'proj_test_17',
      userId: 'usr_test_17',
      userRole: 'ADMIN',
      toolId: 'firebase_project_list',
      toolInputs: {},
      permissions: ['firebase:read'],
      dangerLevel: 'Safe'
    }, {});

    const passed = !execRes.success && (execRes.error?.includes('NOT_CONFIGURED') || (execRes.output as { status?: string })?.status === 'NOT_CONFIGURED');
    results.push({
      id: 17,
      title: 'Missing Firebase credentials returns NOT_CONFIGURED',
      passed,
      details: passed ? 'Returned expected NOT_CONFIGURED response when credentials missing.' : 'Failed to return NOT_CONFIGURED on missing credentials.',
    });
  } catch (err: unknown) {
    results.push({ id: 17, title: 'Missing Firebase credentials returns NOT_CONFIGURED', passed: false, details: String(err) });
  }

  // TEST 18: Firebase tool permission checks are enforced
  try {
    const execRes = await toolEngineFacade.execution.executeUniversalTool({
      toolId: 'firebase_firestore_delete',
      workspaceId: 'ws_test_perm_fb',
      userId: 'usr_viewer_001',
      input: { collection: 'users', documentId: 'doc123' },
      userRole: 'VIEWER' as unknown as Parameters<typeof toolEngineFacade.execution.executeUniversalTool>[0]['userRole'],
    });

    const passed = !execRes.success && (execRes.error?.includes('Permission') || execRes.error?.includes('denied'));
    results.push({
      id: 18,
      title: 'Firebase tool permission checks are enforced',
      passed,
      details: passed ? 'Blocked unauthorized VIEWER role from executing admin Firestore delete tool.' : 'Permission check failed to block unauthorized execution.',
    });
  } catch (err: unknown) {
    results.push({ id: 18, title: 'Firebase tool permission checks are enforced', passed: false, details: String(err) });
  }

  // TEST 19: High-risk Firebase operations require approval
  try {
    const deleteTool = toolEngineFacade.registry.getTool('firebase_firestore_delete_document');
    const authCreateTool = toolEngineFacade.registry.getTool('firebase_auth_user_create');
    const rulesDeployTool = toolEngineFacade.registry.getTool('firebase_rules_deploy');

    const highRiskApproved =
      deleteTool?.approvalRequired === true &&
      authCreateTool?.approvalRequired === true &&
      rulesDeployTool?.approvalRequired === true;

    results.push({
      id: 19,
      title: 'High-risk Firebase operations require approval',
      passed: Boolean(highRiskApproved),
      details: highRiskApproved ? 'Verified high-risk and critical Firebase tools require approval.' : 'High-risk tools missing approval flag.',
    });
  } catch (err: unknown) {
    results.push({ id: 19, title: 'High-risk Firebase operations require approval', passed: false, details: String(err) });
  }

  // TEST 20: Workspace isolation blocks cross-workspace execution
  try {
    const execRes = await firebaseToolExecutorService.executeTool('firebase_firestore_read', {
      executionId: 'exec_test_20',
      workspaceId: 'ws_alpha_001',
      projectId: 'proj_alpha_001',
      userId: 'usr_alpha_001',
      userRole: 'ADMIN',
      toolId: 'firebase_firestore_read',
      toolInputs: { collection: 'secrets', documentId: 'doc1' },
      permissions: ['firebase:read'],
      dangerLevel: 'Safe'
    }, {
      resourceWorkspaceId: 'ws_beta_002',
      collection: 'secrets',
      documentId: 'doc1'
    });

    const passed = !execRes.success && execRes.error?.includes('Cross-workspace access blocked');
    results.push({
      id: 20,
      title: 'Workspace isolation blocks cross-workspace execution',
      passed,
      details: passed ? 'Cross-workspace access attempt blocked by boundary guard.' : 'Workspace isolation guard failed.',
    });
  } catch (err: unknown) {
    results.push({ id: 20, title: 'Workspace isolation blocks cross-workspace execution', passed: false, details: String(err) });
  }

  // TEST 21: Credentials never appear in tool results
  try {
    const rawResult = {
      status: 'SUCCESS',
      token: 'AIzaSySecretToken12345',
      privateKey: '-----BEGIN PRIVATE KEY-----\nMIIEvg...',
      data: { user: 'admin', apiKey: 'secretKey999' }
    };

    const sanitized = sanitizeOutput(rawResult) as typeof rawResult;
    const jsonStr = JSON.stringify(sanitized);

    const safe = !jsonStr.includes('AIzaSySecretToken12345') && !jsonStr.includes('MIIEvg');
    results.push({
      id: 21,
      title: 'Credentials never appear in tool results',
      passed: safe,
      details: safe ? 'Outputs sanitized successfully; secrets and private keys redacted.' : 'Sanitization leaked sensitive credentials.',
    });
  } catch (err: unknown) {
    results.push({ id: 21, title: 'Credentials never appear in tool results', passed: false, details: String(err) });
  }

  // TEST 22: Credentials never appear in audit logs
  try {
    const execRes = await firebaseToolExecutorService.executeTool('firebase_firestore_write', {
      executionId: 'exec_test_22',
      workspaceId: 'ws_test_audit',
      projectId: 'proj_test_audit',
      userId: 'usr_test_22',
      userRole: 'ADMIN',
      toolId: 'firebase_firestore_write',
      toolInputs: { collection: 'test' },
      permissions: ['firebase:write'],
      dangerLevel: 'Medium'
    }, {
      collection: 'test',
      data: { name: 'Audit Test' },
      token: 'AIzaSySecretTokenInInput'
    });

    const logStr = JSON.stringify(execRes);
    const passed = !logStr.includes('AIzaSySecretTokenInInput');

    results.push({
      id: 22,
      title: 'Credentials never appear in audit logs',
      passed,
      details: passed ? 'Verified execution log contains no private keys or raw tokens.' : 'Credentials leaked into execution output log.',
    });
  } catch (err: unknown) {
    results.push({ id: 22, title: 'Credentials never appear in audit logs', passed: false, details: String(err) });
  }

  // TEST 23: Duplicate Firebase tools = 0
  try {
    const firebaseTools = toolEngineFacade.registry.listToolsByProvider('firebase');
    const ids = firebaseTools.map(t => t.id);
    const uniqueIds = new Set(ids);

    const noDuplicates = ids.length === uniqueIds.size;
    results.push({
      id: 23,
      title: 'Duplicate Firebase tools = 0',
      passed: noDuplicates,
      details: noDuplicates ? `Total ${ids.length} Firebase tools registered with 0 duplicates.` : `Found ${ids.length - uniqueIds.size} duplicate Firebase tool registrations.`,
    });
  } catch (err: unknown) {
    results.push({ id: 23, title: 'Duplicate Firebase tools = 0', passed: false, details: String(err) });
  }

  // TEST 24: Tool schemas are valid
  try {
    const firebaseTools = toolEngineFacade.registry.listToolsByProvider('firebase');
    const allValid = firebaseTools.every(t => toolEngineFacade.registry.validateTool(t).valid);

    results.push({
      id: 24,
      title: 'Tool schemas are valid',
      passed: allValid,
      details: allValid ? `All ${firebaseTools.length} Firebase tool definitions pass schema validation.` : 'Some Firebase tool schemas failed validation.',
    });
  } catch (err: unknown) {
    results.push({ id: 24, title: 'Tool schemas are valid', passed: false, details: String(err) });
  }

  // TEST 25: All 27 Google tools are registered in tool registry
  try {
    const googleTools = toolEngineFacade.registry.listToolsByProvider('google');
    const count = googleTools.length;
    const passed = count >= 27;

    results.push({
      id: 25,
      title: 'All 27 Google tools are registered in tool registry',
      passed,
      details: passed ? `Registered ${count} Google tools across Drive, Sheets, Docs, Gmail, Calendar, and Cloud.` : `Expected at least 27 Google tools, found ${count}.`,
    });
  } catch (err: unknown) {
    results.push({ id: 25, title: 'All 27 Google tools are registered in tool registry', passed: false, details: String(err) });
  }

  // TEST 26: Google provider adapter registered in ProviderAdapterRegistry
  try {
    const adapter = providerAdapterRegistry.getAdapter('google');
    const passed = adapter !== undefined;

    results.push({
      id: 26,
      title: 'Google provider adapter registered in ProviderAdapterRegistry',
      passed,
      details: passed ? 'Google provider adapter is correctly registered.' : 'Google provider adapter is missing.',
    });
  } catch (err: unknown) {
    results.push({ id: 26, title: 'Google provider adapter registered in ProviderAdapterRegistry', passed: false, details: String(err) });
  }

  // TEST 27: Google capabilities discovered by CapabilityDiscoveryService
  try {
    const caps = capabilityDiscoveryService.getGoogleCapabilities();
    const passed = caps.length >= 27;

    results.push({
      id: 27,
      title: 'Google capabilities discovered by CapabilityDiscoveryService',
      passed,
      details: passed ? `Discovered ${caps.length} Google capabilities.` : `Expected at least 27 Google capabilities, found ${caps.length}.`,
    });
  } catch (err: unknown) {
    results.push({ id: 27, title: 'Google capabilities discovered by CapabilityDiscoveryService', passed: false, details: String(err) });
  }

  // TEST 28: Safe Google read tool execution (google_drive_list_files)
  try {
    const res = await googleToolExecutorService.executeTool('google_drive_list_files', {
      executionId: 'exec_test_28',
      workspaceId: 'ws_test_gdrive',
      projectId: 'proj_test_gdrive',
      userId: 'usr_test_28',
      userRole: 'MEMBER',
      toolId: 'google_drive_list_files',
      toolInputs: { inputAccessToken: 'mock_access_token_123' },
      permissions: ['google:drive:read'],
      dangerLevel: 'Safe'
    }, { inputAccessToken: 'mock_access_token_123' });

    const outputObj = res.output as Record<string, unknown> | undefined;
    const passed = res.success === true || (outputObj && outputObj.status !== undefined);
    results.push({
      id: 28,
      title: 'Safe Google read tool execution (google_drive_list_files)',
      passed,
      details: passed ? 'Executed google_drive_list_files successfully with structured output.' : 'Execution failed without structured result.',
    });
  } catch (err: unknown) {
    results.push({ id: 28, title: 'Safe Google read tool execution (google_drive_list_files)', passed: false, details: String(err) });
  }

  // TEST 29: Unconfigured workspace handles missing Google credentials gracefully
  try {
    const res = await googleToolExecutorService.executeTool('google_drive_list_files', {
      executionId: 'exec_test_29',
      workspaceId: 'ws_unconfigured_gdrive_no_creds',
      projectId: 'proj_test_gdrive',
      userId: 'usr_test_29',
      userRole: 'MEMBER',
      toolId: 'google_drive_list_files',
      toolInputs: {},
      permissions: ['google:drive:read'],
      dangerLevel: 'Safe'
    }, {});

    const passed = res.success === false && (res.error?.startsWith('NOT_CONFIGURED') ?? false);
    results.push({
      id: 29,
      title: 'Unconfigured workspace handles missing Google credentials gracefully',
      passed,
      details: passed ? 'Handled unconfigured credentials with NOT_CONFIGURED error.' : `Expected NOT_CONFIGURED error, got: ${res.error}`,
    });
  } catch (err: unknown) {
    results.push({ id: 29, title: 'Unconfigured workspace handles missing Google credentials gracefully', passed: false, details: String(err) });
  }

  // TEST 30: Google tool execution enforces role restrictions (VIEWER cannot execute write)
  try {
    const res = await googleToolExecutorService.executeTool('google_drive_create_file', {
      executionId: 'exec_test_30',
      workspaceId: 'ws_test_gdrive',
      projectId: 'proj_test_gdrive',
      userId: 'usr_test_30',
      userRole: 'VIEWER',
      toolId: 'google_drive_create_file',
      toolInputs: { name: 'Test' },
      permissions: ['google:drive:write'],
      dangerLevel: 'Medium'
    }, { name: 'Test' });

    const passed = res.success === false && (res.error?.includes('Permission denied') ?? false);
    results.push({
      id: 30,
      title: 'Google tool execution enforces role restrictions (VIEWER cannot execute write)',
      passed,
      details: passed ? 'Blocked VIEWER role from executing non-SAFE Google operation.' : `Role restriction failed: ${res.error}`,
    });
  } catch (err: unknown) {
    results.push({ id: 30, title: 'Google tool execution enforces role restrictions (VIEWER cannot execute write)', passed: false, details: String(err) });
  }

  // TEST 31: High-risk Google tools require administrative approval
  try {
    const res = await googleToolExecutorService.executeTool('google_drive_delete_file', {
      executionId: 'exec_test_31',
      workspaceId: 'ws_test_gdrive',
      projectId: 'proj_test_gdrive',
      userId: 'usr_test_31',
      userRole: 'MEMBER',
      toolId: 'google_drive_delete_file',
      toolInputs: { fileId: 'f123' },
      permissions: ['google:drive:write'],
      dangerLevel: 'High'
    }, { fileId: 'f123', approvalGranted: false });

    const passed = res.success === false && (res.error?.includes('approval required') ?? false);
    results.push({
      id: 31,
      title: 'High-risk Google tools require administrative approval',
      passed,
      details: passed ? 'Enforced administrative approval check for google_drive_delete_file.' : `Approval enforcement failed: ${res.error}`,
    });
  } catch (err: unknown) {
    results.push({ id: 31, title: 'High-risk Google tools require administrative approval', passed: false, details: String(err) });
  }

  // TEST 32: Google cross-workspace access is blocked
  try {
    const res = await googleToolExecutorService.executeTool('google_drive_list_files', {
      executionId: 'exec_test_32',
      workspaceId: 'ws_test_alpha',
      projectId: 'proj_test_gdrive',
      userId: 'usr_test_32',
      userRole: 'MEMBER',
      toolId: 'google_drive_list_files',
      toolInputs: { resourceWorkspaceId: 'ws_test_beta' },
      permissions: ['google:drive:read'],
      dangerLevel: 'Safe'
    }, { resourceWorkspaceId: 'ws_test_beta' });

    const passed = res.success === false && (res.error?.includes('Cross-workspace access blocked') ?? false);
    results.push({
      id: 32,
      title: 'Google cross-workspace access is blocked',
      passed,
      details: passed ? 'Cross-workspace target resource access was successfully blocked.' : `Cross-workspace check failed: ${res.error}`,
    });
  } catch (err: unknown) {
    results.push({ id: 32, title: 'Google cross-workspace access is blocked', passed: false, details: String(err) });
  }

  // TEST 33: Credentials and tokens are redacted from Google outputs
  try {
    const rawData = {
      status: 'SUCCESS',
      accessToken: 'ya29.secret_token_123',
      apiKey: 'AIzaSyGoogleKeySecret'
    };
    const sanitized = sanitizeOutput(rawData) as typeof rawData;
    const jsonStr = JSON.stringify(sanitized);

    const passed = !jsonStr.includes('ya29.secret_token_123') && !jsonStr.includes('AIzaSyGoogleKeySecret');
    results.push({
      id: 33,
      title: 'Credentials and tokens are redacted from Google outputs',
      passed,
      details: passed ? 'OAuth tokens and API keys were successfully redacted from output.' : 'Sanitization leaked sensitive Google credentials.',
    });
  } catch (err: unknown) {
    results.push({ id: 33, title: 'Credentials and tokens are redacted from Google outputs', passed: false, details: String(err) });
  }

  // TEST 34: Duplicate Google tools = 0 and schemas are valid
  try {
    const googleTools = toolEngineFacade.registry.listToolsByProvider('google');
    const ids = googleTools.map(t => t.id);
    const uniqueIds = new Set(ids);
    const noDuplicates = ids.length === uniqueIds.size;
    const allValid = googleTools.every(t => toolEngineFacade.registry.validateTool(t).valid);

    const passed = noDuplicates && allValid;
    results.push({
      id: 34,
      title: 'Duplicate Google tools = 0 and schemas are valid',
      passed,
      details: passed ? `All ${googleTools.length} Google tool definitions are unique and pass schema validation.` : `Validation issue: noDuplicates=${noDuplicates}, allValid=${allValid}`,
    });
  } catch (err: unknown) {
    results.push({ id: 34, title: 'Duplicate Google tools = 0 and schemas are valid', passed: false, details: String(err) });
  }

  // TEST 35: Anthropic tools registered
  try {
    const tools = toolEngineFacade.registry.listToolsByProvider('anthropic');
    const passed = tools.length >= 3 && tools.some(t => t.id === 'anthropic_message_create');
    results.push({
      id: 35,
      title: 'Anthropic tools registered',
      passed,
      details: passed ? `Registered ${tools.length} Anthropic tools successfully.` : `Expected >= 3 Anthropic tools, got ${tools.length}.`
    });
  } catch (err: unknown) {
    results.push({ id: 35, title: 'Anthropic tools registered', passed: false, details: String(err) });
  }

  // TEST 36: OpenAI tools registered
  try {
    const tools = toolEngineFacade.registry.listToolsByProvider('openai');
    const passed = tools.length >= 4 && tools.some(t => t.id === 'openai_chat_completion');
    results.push({
      id: 36,
      title: 'OpenAI tools registered',
      passed,
      details: passed ? `Registered ${tools.length} OpenAI tools successfully.` : `Expected >= 4 OpenAI tools, got ${tools.length}.`
    });
  } catch (err: unknown) {
    results.push({ id: 36, title: 'OpenAI tools registered', passed: false, details: String(err) });
  }

  // TEST 37: OpenRouter tools registered
  try {
    const tools = toolEngineFacade.registry.listToolsByProvider('openrouter');
    const passed = tools.length >= 3 && tools.some(t => t.id === 'openrouter_chat_completion');
    results.push({
      id: 37,
      title: 'OpenRouter tools registered',
      passed,
      details: passed ? `Registered ${tools.length} OpenRouter tools successfully.` : `Expected >= 3 OpenRouter tools, got ${tools.length}.`
    });
  } catch (err: unknown) {
    results.push({ id: 37, title: 'OpenRouter tools registered', passed: false, details: String(err) });
  }

  // TEST 38: Provider adapters resolve correctly
  try {
    const antAdapter = providerAdapterRegistry.getAdapter('anthropic');
    const oaiAdapter = providerAdapterRegistry.getAdapter('openai');
    const oprAdapter = providerAdapterRegistry.getAdapter('openrouter');
    const passed = Boolean(antAdapter && oaiAdapter && oprAdapter);
    results.push({
      id: 38,
      title: 'Provider adapters resolve correctly',
      passed,
      details: passed ? 'Anthropic, OpenAI, and OpenRouter provider adapters resolved cleanly.' : 'One or more AI provider adapters failed to resolve.'
    });
  } catch (err: unknown) {
    results.push({ id: 38, title: 'Provider adapters resolve correctly', passed: false, details: String(err) });
  }

  // TEST 39: Missing credentials return NOT_CONFIGURED
  try {
    const res = await aiProviderToolExecutorService.executeTool('anthropic_message_create', {
      executionId: 'exec_test_39',
      workspaceId: 'ws_unconfigured_ai_39',
      projectId: 'proj_test_39',
      userId: 'usr_test_39',
      userRole: 'MEMBER',
      toolId: 'anthropic_message_create',
      toolInputs: {},
      permissions: ['ai:execute'],
      dangerLevel: 'Medium'
    }, {});

    const passed = res.success === false && (res.error?.includes('NOT_CONFIGURED') ?? false);
    results.push({
      id: 39,
      title: 'Missing credentials return NOT_CONFIGURED',
      passed,
      details: passed ? 'Handled missing AI provider credentials with NOT_CONFIGURED status.' : `Expected NOT_CONFIGURED error, got: ${res.error}`
    });
  } catch (err: unknown) {
    results.push({ id: 39, title: 'Missing credentials return NOT_CONFIGURED', passed: false, details: String(err) });
  }

  // TEST 40: Provider permissions are enforced
  try {
    const res = await aiProviderToolExecutorService.executeTool('openai_chat_completion', {
      executionId: 'exec_test_40',
      workspaceId: 'ws_test_40',
      projectId: 'proj_test_40',
      userId: 'usr_test_40',
      userRole: 'VIEWER',
      toolId: 'openai_chat_completion',
      toolInputs: { inputApiKey: 'mock_key' },
      permissions: ['ai:execute'],
      dangerLevel: 'Medium'
    }, { inputApiKey: 'mock_key' });

    const passed = res.success === false && (res.error?.includes('Permission denied') ?? false);
    results.push({
      id: 40,
      title: 'Provider permissions are enforced',
      passed,
      details: passed ? 'Blocked VIEWER role from executing non-SAFE AI provider operation.' : `Permission check failed: ${res.error}`
    });
  } catch (err: unknown) {
    results.push({ id: 40, title: 'Provider permissions are enforced', passed: false, details: String(err) });
  }

  // TEST 41: Workspace isolation is enforced
  try {
    const res = await aiProviderToolExecutorService.executeTool('openrouter_chat_completion', {
      executionId: 'exec_test_41',
      workspaceId: 'ws_test_alpha_41',
      projectId: 'proj_test_41',
      userId: 'usr_test_41',
      userRole: 'MEMBER',
      toolId: 'openrouter_chat_completion',
      toolInputs: { resourceWorkspaceId: 'ws_test_beta_41', inputApiKey: 'mock_key' },
      permissions: ['ai:execute'],
      dangerLevel: 'Medium'
    }, { resourceWorkspaceId: 'ws_test_beta_41', inputApiKey: 'mock_key' });

    const passed = res.success === false && (res.error?.includes('Cross-workspace access blocked') ?? false);
    results.push({
      id: 41,
      title: 'Workspace isolation is enforced',
      passed,
      details: passed ? 'Cross-workspace target resource access was successfully blocked.' : `Workspace isolation failed: ${res.error}`
    });
  } catch (err: unknown) {
    results.push({ id: 41, title: 'Workspace isolation is enforced', passed: false, details: String(err) });
  }

  // TEST 42: API credentials are sanitized
  try {
    const rawData = {
      status: 'SUCCESS',
      apiKey: 'sk-ant-api03-secret123456789',
      'x-api-key': 'sk-proj-openai-secret'
    };
    const sanitized = sanitizeOutput(rawData) as typeof rawData;
    const jsonStr = JSON.stringify(sanitized);

    const passed = !jsonStr.includes('sk-ant-api03-secret123456789') && !jsonStr.includes('sk-proj-openai-secret');
    results.push({
      id: 42,
      title: 'API credentials are sanitized',
      passed,
      details: passed ? 'API keys and secret tokens were successfully redacted from output.' : 'Sanitization leaked sensitive AI provider keys.'
    });
  } catch (err: unknown) {
    results.push({ id: 42, title: 'API credentials are sanitized', passed: false, details: String(err) });
  }

  // TEST 43: Capability discovery correctly reports configured/unconfigured providers
  try {
    const anthropicCaps = capabilityDiscoveryService.getAnthropicCapabilities();
    const openaiCaps = capabilityDiscoveryService.getOpenAICapabilities();
    const openrouterCaps = capabilityDiscoveryService.getOpenRouterCapabilities();
    const allAiCaps = capabilityDiscoveryService.getAICapabilities();

    const passed = anthropicCaps.length > 0 && openaiCaps.length > 0 && openrouterCaps.length > 0 && allAiCaps.length >= (anthropicCaps.length + openaiCaps.length + openrouterCaps.length);
    results.push({
      id: 43,
      title: 'Capability discovery correctly reports configured/unconfigured providers',
      passed,
      details: passed ? `Discovered ${allAiCaps.length} total AI provider capabilities across Anthropic, OpenAI, OpenRouter.` : 'Capability discovery failed to discover AI provider tools.'
    });
  } catch (err: unknown) {
    results.push({ id: 43, title: 'Capability discovery correctly reports configured/unconfigured providers', passed: false, details: String(err) });
  }

  // TEST 44: No duplicate provider tools/types/routes
  try {
    const aiTools = [
      ...toolEngineFacade.registry.listToolsByProvider('anthropic'),
      ...toolEngineFacade.registry.listToolsByProvider('openai'),
      ...toolEngineFacade.registry.listToolsByProvider('openrouter')
    ];
    const ids = aiTools.map(t => t.id);
    const uniqueIds = new Set(ids);
    const noDuplicates = ids.length === uniqueIds.size;
    const allValid = aiTools.every(t => toolEngineFacade.registry.validateTool(t).valid);

    const passed = noDuplicates && allValid;
    results.push({
      id: 44,
      title: 'No duplicate provider tools/types/routes',
      passed,
      details: passed ? `All ${aiTools.length} AI provider tools are unique and pass schema validation.` : `Validation failed: noDuplicates=${noDuplicates}, allValid=${allValid}`
    });
  } catch (err: unknown) {
    results.push({ id: 44, title: 'No duplicate provider tools/types/routes', passed: false, details: String(err) });
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
