'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { deploymentPlannerService } from '@/services/vercel/deployment-planner';
import { vercelEnvironmentManagerService } from '@/services/vercel/environment-manager';
import { vercelProjectConfigAnalyzerService } from '@/services/vercel/config-analyzer';
import { vercelReadinessReporterService } from '@/services/vercel/readiness-reporter';
import { deploymentPipelineManagerService } from '@/services/vercel/pipeline-manager';
import { buildValidationEngineService } from '@/services/vercel/build-validator';
import { deploymentRiskAnalyzerService } from '@/services/vercel/risk-analyzer';
import { rollbackPlannerService } from '@/services/vercel/rollback-planner';
import { deploymentHistoryManagerService } from '@/services/vercel/history-manager';
import { deploymentLogManagerService } from '@/services/vercel/log-manager';
import { deploymentMonitoringEngineService } from '@/services/vercel/monitoring-engine';
import { deploymentInsightsDashboardService } from '@/services/vercel/insights-dashboard';
import { deploymentApprovalManagerService } from '@/services/vercel/approval-manager';
import { deploymentPolicyEngineService } from '@/services/vercel/policy-engine';
import { deploymentRecoveryPlannerService } from '@/services/vercel/recovery-planner';
import { deploymentExecutiveDashboardService } from '@/services/vercel/executive-dashboard';

import {
  Rocket,
  Sliders,
  Settings2,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileCode,
  Layers,
  Workflow,
  CheckSquare,
  ShieldAlert,
  RotateCcw,
  History,
  Terminal,
  Activity,
  BarChart3,
  Filter,
  UserCheck,
  FileText,
  LifeBuoy,
  Briefcase
} from 'lucide-react';


interface VercelWorkspacePanelProps {
  projectId?: string;
  projectName?: string;
}

export const VercelWorkspacePanel: React.FC<VercelWorkspacePanelProps> = ({
  projectId = 'prj_ai_ceo_app',
  projectName = 'ai-ceo-platform'
}) => {
  const [activeTab, setActiveTab] = useState<
    | 'planner'
    | 'env'
    | 'config'
    | 'report'
    | 'pipeline'
    | 'build'
    | 'risk'
    | 'rollback'
    | 'history'
    | 'logs'
    | 'monitoring'
    | 'insights'
    | 'approval'
    | 'policy'
    | 'recovery'
    | 'executive'
  >('planner');

  const [logLevelFilter, setLogLevelFilter] = useState<string>('ALL');
  const [logSourceFilter, setLogSourceFilter] = useState<string>('ALL');

  // Load Architectural States
  const deploymentPlan = deploymentPlannerService.getLatestPlan(projectId) ||
    deploymentPlannerService.planDeployment({ projectId, projectName });

  const envConfig = vercelEnvironmentManagerService.getLatestEnvironmentConfig(projectId) ||
    vercelEnvironmentManagerService.analyzeEnvironment(projectId);

  const configAnalysis = vercelProjectConfigAnalyzerService.getLatestAnalysis(projectId) ||
    vercelProjectConfigAnalyzerService.analyzeProjectConfig(projectId);

  const readinessReport = vercelReadinessReporterService.getLatestReadinessReport(projectId) ||
    vercelReadinessReporterService.generateReadinessReport(projectId);

  // Prompt 6.2 Architectural States
  const pipelinePlan = deploymentPipelineManagerService.getLatestPipelinePlan(projectId) ||
    deploymentPipelineManagerService.planPipeline(projectId);

  const buildValidation = buildValidationEngineService.getLatestValidationReport(projectId) ||
    buildValidationEngineService.validateBuild(projectId);

  const riskAnalysis = deploymentRiskAnalyzerService.getLatestRiskAnalysis(projectId) ||
    deploymentRiskAnalyzerService.analyzeRisk(projectId);

  const rollbackPlan = rollbackPlannerService.getLatestRollbackPlan(projectId) ||
    rollbackPlannerService.planRollback(projectId);

  // Prompt 6.3 Architectural States
  const deploymentHistory = deploymentHistoryManagerService.getDeploymentHistory(projectId);
  const deploymentLogs = deploymentLogManagerService.getDeploymentLogs(
    projectId,
    logLevelFilter,
    logSourceFilter
  );
  const monitoringMetrics = deploymentMonitoringEngineService.getMonitoringMetrics(projectId);
  const deploymentInsights = deploymentInsightsDashboardService.getDeploymentInsights(projectId);

  // Prompt 6.4 Architectural States
  const approvalRecord = deploymentApprovalManagerService.getApprovalRecord(projectId);
  const policyCompliance = deploymentPolicyEngineService.evaluatePolicies(projectId);
  const recoveryPlan = deploymentRecoveryPlannerService.getRecoveryPlan(projectId);
  const executiveDashboard = deploymentExecutiveDashboardService.getExecutiveDashboard(projectId);


  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-4 text-xs font-sans">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <Rocket className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-zinc-100 text-sm">Vercel Deployment Architecture</span>
          <Badge variant="outline" className="text-[10px] font-mono text-cyan-400 border-cyan-800/80">
            Read-Only Planning Engine
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="text-zinc-400">Readiness Score:</span>
          <Badge variant="success" className="font-mono">
            {readinessReport.readinessScore} / 100
          </Badge>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2 border-b border-zinc-800/80 pb-2 overflow-x-auto text-[11px] scrollbar-thin">
        <button
          onClick={() => setActiveTab('planner')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'planner' ? 'bg-zinc-800 text-zinc-100 font-medium' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Rocket className="w-3.5 h-3.5 text-cyan-400" /> Deployment Planner
        </button>
        <button
          onClick={() => setActiveTab('env')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'env' ? 'bg-zinc-800 text-zinc-100 font-medium' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-amber-400" /> Environment Manager
        </button>
        <button
          onClick={() => setActiveTab('config')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'config' ? 'bg-zinc-800 text-zinc-100 font-medium' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Settings2 className="w-3.5 h-3.5 text-purple-400" /> Config Analyzer
        </button>
        <button
          onClick={() => setActiveTab('report')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'report' ? 'bg-zinc-800 text-zinc-100 font-medium' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Readiness Report
        </button>
        <button
          onClick={() => setActiveTab('pipeline')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'pipeline' ? 'bg-zinc-800 text-zinc-100 font-medium' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Workflow className="w-3.5 h-3.5 text-indigo-400" /> Deployment Pipeline
        </button>
        <button
          onClick={() => setActiveTab('build')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'build' ? 'bg-zinc-800 text-zinc-100 font-medium' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5 text-teal-400" /> Build Validation
        </button>
        <button
          onClick={() => setActiveTab('risk')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'risk' ? 'bg-zinc-800 text-zinc-100 font-medium' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> Risk Analyzer
        </button>
        <button
          onClick={() => setActiveTab('rollback')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'rollback' ? 'bg-zinc-800 text-zinc-100 font-medium' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5 text-amber-400" /> Rollback Planner
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'history' ? 'bg-zinc-800 text-zinc-100 font-medium' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <History className="w-3.5 h-3.5 text-blue-400" /> Deployment History
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'logs' ? 'bg-zinc-800 text-zinc-100 font-medium' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Terminal className="w-3.5 h-3.5 text-emerald-400" /> Log Manager
        </button>
        <button
          onClick={() => setActiveTab('monitoring')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'monitoring' ? 'bg-zinc-800 text-zinc-100 font-medium' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-rose-400" /> Monitoring Engine
        </button>
        <button
          onClick={() => setActiveTab('insights')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'insights' ? 'bg-zinc-800 text-zinc-100 font-medium' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5 text-purple-400" /> Deployment Insights
        </button>
        <button
          onClick={() => setActiveTab('approval')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'approval' ? 'bg-zinc-800 text-zinc-100 font-medium' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5 text-teal-400" /> Approval Manager
        </button>
        <button
          onClick={() => setActiveTab('policy')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'policy' ? 'bg-zinc-800 text-zinc-100 font-medium' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-blue-400" /> Policy Engine
        </button>
        <button
          onClick={() => setActiveTab('recovery')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'recovery' ? 'bg-zinc-800 text-zinc-100 font-medium' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <LifeBuoy className="w-3.5 h-3.5 text-amber-400" /> Recovery Planner
        </button>
        <button
          onClick={() => setActiveTab('executive')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'executive' ? 'bg-zinc-800 text-zinc-100 font-medium' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5 text-yellow-400" /> Executive Dashboard
        </button>

      </div>

      {/* Tab 1: Deployment Planner */}
      {activeTab === 'planner' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/80">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200">Deployment Target: <span className="font-mono text-cyan-300">{deploymentPlan.targetEnvironment}</span></span>
            <Badge variant="success">Status: VALIDATED</Badge>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800 space-y-1">
              <div className="text-zinc-400">Framework: <span className="text-zinc-200 font-mono">{deploymentPlan.buildStrategy.framework}</span></div>
              <div className="text-zinc-400">Build Command: <span className="text-emerald-400 font-mono">{deploymentPlan.buildStrategy.buildCommand}</span></div>
            </div>
            <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800 space-y-1">
              <div className="text-zinc-400">Output Dir: <span className="text-amber-300 font-mono">{deploymentPlan.buildStrategy.outputDirectory}</span></div>
              <div className="text-zinc-400">Node Version: <span className="text-purple-300 font-mono">{deploymentPlan.buildStrategy.nodeVersion}</span></div>
            </div>
          </div>

          <div className="space-y-1">
            <span className="font-semibold text-zinc-300 text-[11px]">Deployment Validation Checks</span>
            <div className="space-y-1 bg-zinc-950 p-2 rounded-lg border border-zinc-800/80 text-[10px]">
              {deploymentPlan.validation.checks.map((chk, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-zinc-300">{chk.name}: <span className="text-zinc-500">{chk.message}</span></span>
                  <Badge variant={chk.status === 'PASS' ? 'success' : 'outline'}>
                    {chk.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[10px] text-zinc-400 bg-zinc-950/80 p-2 rounded-lg border border-zinc-800/60">
            <span className="font-semibold text-zinc-300">Deployment Summary:</span> {deploymentPlan.summary}
          </div>
        </div>
      )}

      {/* Tab 2: Environment Manager */}
      {activeTab === 'env' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200">Environment Variables Status</span>
            <Badge variant={envConfig.validationStatus === 'VALID' ? 'success' : 'outline'}>
              {envConfig.validationStatus}
            </Badge>
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {envConfig.variables.map((v, i) => (
              <div key={i} className="bg-zinc-950 p-2 rounded-lg border border-zinc-800/80 flex items-center justify-between font-mono text-[10px]">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-200 font-semibold">{v.key}</span>
                  <span className="text-zinc-500 text-[9px]">[{v.group}]</span>
                </div>
                <div className="flex items-center gap-2">
                  {v.isRequired && <span className="text-amber-400 text-[9px]">REQUIRED</span>}
                  {v.isConfigured ? (
                    <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> SET</span>
                  ) : (
                    <span className="text-rose-400 flex items-center gap-1"><XCircle className="w-3 h-3" /> MISSING</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {envConfig.missingVariables.length > 0 && (
            <div className="bg-rose-950/40 border border-rose-800/60 p-2 rounded-lg text-[10px] text-rose-300 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>Missing Required Variables: {envConfig.missingVariables.join(', ')}</span>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Config Analyzer */}
      {activeTab === 'config' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200">Next.js & Build Configuration Analysis</span>
            <Badge variant="success">Readiness: PASSED</Badge>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1">
              <div className="font-semibold text-purple-300 flex items-center gap-1">
                <FileCode className="w-3 h-3" /> Next.js Configuration
              </div>
              <div className="text-zinc-400">Config File Present: <span className="text-emerald-400">YES</span></div>
              <div className="text-zinc-400">Image Optimization: <span className="text-emerald-400 font-mono">ENABLED</span></div>
              <div className="text-zinc-500 text-[9px]">Features: {configAnalysis.nextConfig.experimentalFeatures.join(', ')}</div>
            </div>

            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1">
              <div className="font-semibold text-cyan-300 flex items-center gap-1">
                <Layers className="w-3 h-3" /> Rendering & Pages Output
              </div>
              <div className="text-zinc-400">Output Bundle: <span className="text-zinc-200 font-mono">{configAnalysis.outputConfig.outputType}</span></div>
              <div className="text-zinc-400">Static Pages: <span className="text-emerald-400 font-mono">{configAnalysis.outputConfig.staticPagesCount}</span></div>
              <div className="text-zinc-400">Dynamic Routes: <span className="text-amber-400 font-mono">{configAnalysis.outputConfig.dynamicPagesCount}</span></div>
            </div>
          </div>

          <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800/80 text-[10px] space-y-1">
            <span className="font-semibold text-zinc-300">Build Scripts:</span>
            <div className="font-mono text-zinc-400 text-[9px]">
              install: <span className="text-zinc-300">{configAnalysis.buildConfig.installCommand}</span> | build: <span className="text-zinc-300">{configAnalysis.buildConfig.buildCommand}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Deployment Readiness Report */}
      {activeTab === 'report' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200">Deployment Readiness Assessment</span>
            <Badge variant="success" className="text-sm font-mono">{readinessReport.readinessScore} / 100</Badge>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800">
              <span className="text-zinc-400">Build Readiness:</span> <span className="font-mono text-emerald-400">{readinessReport.buildReadiness}</span>
            </div>
            <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800">
              <span className="text-zinc-400">Risk Level:</span> <span className="font-mono text-emerald-400">{readinessReport.riskLevel}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="font-semibold text-zinc-300 text-[11px]">Architectural Recommendations</span>
            <ul className="list-disc list-inside text-[10px] text-zinc-400 space-y-1 bg-zinc-950 p-2 rounded-lg border border-zinc-800/80">
              {readinessReport.recommendations.map((rec, rIdx) => (
                <li key={rIdx}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Tab 5: Deployment Pipeline (Prompt 6.2) */}
      {activeTab === 'pipeline' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs">Pipeline Execution Stages</span>
            <Badge variant="success">Pipeline Status: {pipelinePlan.status}</Badge>
          </div>

          <div className="space-y-2">
            {pipelinePlan.stages.map((stg, i) => (
              <div key={i} className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800/80 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-indigo-300 flex items-center gap-1.5 text-[11px]">
                    <Workflow className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Stage: {stg.stageName}</span>
                  </div>
                  <Badge variant={stg.status === 'PASSED' ? 'success' : stg.status === 'SKIPPED' ? 'outline' : 'info'}>
                    {stg.status} ({stg.durationMs}ms)
                  </Badge>
                </div>
                <div className="text-[10px] text-zinc-400">{stg.details}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: Build Validation (Prompt 6.2) */}
      {activeTab === 'build' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs">Build Validation Checks</span>
            <Badge variant={buildValidation.buildReadiness ? 'success' : 'outline'}>
              Build Readiness: {buildValidation.buildReadiness ? 'PASSED' : 'FAILED'}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800 space-y-1">
              <span className="font-semibold text-emerald-400">TypeScript Check</span>
              <div className="text-zinc-400">{buildValidation.typeScriptValidation.details}</div>
            </div>
            <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800 space-y-1">
              <span className="font-semibold text-teal-400">ESLint Verification</span>
              <div className="text-zinc-400">{buildValidation.eslintValidation.details}</div>
            </div>
          </div>

          <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800 space-y-1 text-[10px]">
            <span className="font-semibold text-zinc-300">Next.js & Dependency Validation</span>
            <div className="text-zinc-400">
              Next.js Validation: {buildValidation.nextjsValidation.valid ? <span className="text-emerald-400">PASSED</span> : <span className="text-rose-400">FAILED</span>} | Missing Dependencies: {buildValidation.dependencyValidation.missingPackages.length}
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: Risk Analyzer (Prompt 6.2) */}
      {activeTab === 'risk' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs">Deployment Risk Assessment</span>
            <Badge variant="success" className="font-mono">
              Risk Score: {riskAnalysis.deploymentRiskScore} / 100
            </Badge>
          </div>

          <div className="grid grid-cols-4 gap-1 text-[10px] text-center font-mono">
            <div className="bg-zinc-950 p-1.5 rounded-lg border border-zinc-800">
              <div className="text-zinc-500">Config Risk</div>
              <div className="text-emerald-400 font-semibold">{riskAnalysis.configurationRisk}</div>
            </div>
            <div className="bg-zinc-950 p-1.5 rounded-lg border border-zinc-800">
              <div className="text-zinc-500">Env Risk</div>
              <div className="text-emerald-400 font-semibold">{riskAnalysis.environmentRisk}</div>
            </div>
            <div className="bg-zinc-950 p-1.5 rounded-lg border border-zinc-800">
              <div className="text-zinc-500">Dependency</div>
              <div className="text-emerald-400 font-semibold">{riskAnalysis.dependencyRisk}</div>
            </div>
            <div className="bg-zinc-950 p-1.5 rounded-lg border border-zinc-800">
              <div className="text-zinc-500">Build Risk</div>
              <div className="text-emerald-400 font-semibold">{riskAnalysis.buildRisk}</div>
            </div>
          </div>

          <div className="space-y-1">
            <span className="font-semibold text-zinc-300 text-[11px]">Risk Factors Analyzed</span>
            <div className="space-y-1 bg-zinc-950 p-2 rounded-lg border border-zinc-800/80 text-[10px]">
              {riskAnalysis.riskFactors.map((rf, i) => (
                <div key={i} className="text-zinc-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>{rf}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 8: Rollback Planner (Prompt 6.2) */}
      {activeTab === 'rollback' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs">Rollback Plan & Version Tracking</span>
            <Badge variant="success">Rollback Readiness: {rollbackPlan.rollbackReadiness}</Badge>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800">
              <span className="text-zinc-400">Current Active Target:</span> <span className="font-mono text-emerald-400 font-semibold">{rollbackPlan.currentVersion}</span>
            </div>
            <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800">
              <span className="text-zinc-400">Previous Verified Target:</span> <span className="font-mono text-amber-400 font-semibold">{rollbackPlan.previousVersion}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="font-semibold text-zinc-300 text-[11px]">Rollback Validation Checks</span>
            <div className="space-y-1 bg-zinc-950 p-2 rounded-lg border border-zinc-800/80 text-[10px]">
              {rollbackPlan.rollbackValidation.checks.map((chk, i) => (
                <div key={i} className="text-zinc-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>{chk}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[10px] text-zinc-400 bg-zinc-950/80 p-2 rounded-lg border border-zinc-800/60 space-y-0.5">
            <div className="font-semibold text-zinc-300">Recovery Strategy:</div>
            <div>{rollbackPlan.recoveryStrategy}</div>
          </div>
        </div>
      )}

      {/* Tab 9: Deployment History (Prompt 6.3) */}
      {activeTab === 'history' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <History className="w-4 h-4 text-blue-400" />
              Deployment & Version History
            </span>
            <Badge variant="info">Total Executed: {deploymentHistory.length}</Badge>
          </div>

          <div className="space-y-2">
            {deploymentHistory.map((item) => (
              <div key={item.id} className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-semibold text-blue-300 text-xs">{item.version}</span>
                    <span className="text-zinc-500 text-[10px]">({item.commitHash})</span>
                    <Badge variant="outline" className="text-[9px] font-mono text-zinc-400">
                      {item.branch}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={item.status === 'SUCCESS' ? 'success' : item.status === 'FAILED' ? 'outline' : 'info'}>
                      {item.status}
                    </Badge>
                    <span className="text-zinc-500 text-[9px] font-mono">{(item.durationMs / 1000).toFixed(1)}s</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-zinc-400 border-t border-zinc-900 pt-1.5">
                  <div>
                    Environment: <span className="text-cyan-300 font-mono">{item.environment}</span> | Framework: <span className="text-purple-300 font-mono">{item.metadata.framework}</span>
                  </div>
                  <div className="text-zinc-500 font-mono">{new Date(item.createdAt).toLocaleString()}</div>
                </div>

                {/* Timeline */}
                <div className="flex items-center gap-1 text-[9px] font-mono pt-1">
                  <span className="text-zinc-500">Timeline:</span>
                  {item.timeline.map((st, sIdx) => (
                    <span key={sIdx} className="bg-zinc-900 px-1.5 py-0.5 rounded text-zinc-300 flex items-center gap-1">
                      {st.step}: <span className={st.status === 'SUCCESS' ? 'text-emerald-400' : 'text-rose-400'}>{st.status}</span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 10: Log Manager (Prompt 6.3) */}
      {activeTab === 'logs' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-emerald-400" />
              Deployment Log Manager
            </span>
            <div className="flex items-center gap-2 text-[10px]">
              <div className="flex items-center gap-1 bg-zinc-950 px-2 py-1 rounded border border-zinc-800">
                <Filter className="w-3 h-3 text-zinc-400" />
                <span className="text-zinc-400">Level:</span>
                <select
                  value={logLevelFilter}
                  onChange={(e) => setLogLevelFilter(e.target.value)}
                  className="bg-transparent text-zinc-200 font-mono focus:outline-none cursor-pointer"
                >
                  <option value="ALL" className="bg-zinc-900">ALL</option>
                  <option value="INFO" className="bg-zinc-900">INFO</option>
                  <option value="BUILD" className="bg-zinc-900">BUILD</option>
                  <option value="VALIDATION" className="bg-zinc-900">VALIDATION</option>
                  <option value="DEPLOY" className="bg-zinc-900">DEPLOY</option>
                  <option value="WARN" className="bg-zinc-900">WARN</option>
                  <option value="ERROR" className="bg-zinc-900">ERROR</option>
                </select>
              </div>

              <div className="flex items-center gap-1 bg-zinc-950 px-2 py-1 rounded border border-zinc-800">
                <span className="text-zinc-400">Source:</span>
                <select
                  value={logSourceFilter}
                  onChange={(e) => setLogSourceFilter(e.target.value)}
                  className="bg-transparent text-zinc-200 font-mono focus:outline-none cursor-pointer"
                >
                  <option value="ALL" className="bg-zinc-900">ALL</option>
                  <option value="BUILD" className="bg-zinc-900">BUILD</option>
                  <option value="VALIDATION" className="bg-zinc-900">VALIDATION</option>
                  <option value="DEPLOYMENT" className="bg-zinc-900">DEPLOYMENT</option>
                  <option value="RUNTIME" className="bg-zinc-900">RUNTIME</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800 font-mono text-[10px] space-y-1.5 max-h-60 overflow-y-auto scrollbar-thin">
            {deploymentLogs.length === 0 ? (
              <div className="text-zinc-500 py-4 text-center">No logs match the selected filter criteria.</div>
            ) : (
              deploymentLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-2 border-b border-zinc-900/60 pb-1 hover:bg-zinc-900/40 px-1 rounded">
                  <span className="text-zinc-600 shrink-0 text-[9px]">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  <Badge
                    variant={
                      log.level === 'ERROR'
                        ? 'outline'
                        : log.level === 'WARN'
                        ? 'outline'
                        : log.level === 'BUILD'
                        ? 'info'
                        : 'success'
                    }
                    className="text-[9px] py-0 px-1 font-mono"
                  >
                    {log.level}
                  </Badge>
                  <span className="text-zinc-500 text-[9px]">[{log.source}]</span>
                  <span
                    className={`break-all ${
                      log.level === 'ERROR'
                        ? 'text-rose-400 font-semibold'
                        : log.level === 'WARN'
                        ? 'text-amber-300'
                        : 'text-zinc-300'
                    }`}
                  >
                    {log.message}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 11: Deployment Monitoring (Prompt 6.3) */}
      {activeTab === 'monitoring' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-rose-400" />
              Live Deployment Monitoring Engine
            </span>
            <Badge variant="success">Live Status: {monitoringMetrics.liveStatus}</Badge>
          </div>

          <div className="grid grid-cols-4 gap-2 text-[10px]">
            <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800 space-y-0.5">
              <div className="text-zinc-400">Health Score</div>
              <div className="text-emerald-400 font-bold font-mono text-sm">{monitoringMetrics.healthScore} / 100</div>
            </div>
            <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800 space-y-0.5">
              <div className="text-zinc-400">Avg Build Time</div>
              <div className="text-cyan-300 font-bold font-mono text-sm">{(monitoringMetrics.avgBuildDurationMs / 1000).toFixed(1)}s</div>
            </div>
            <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800 space-y-0.5">
              <div className="text-zinc-400">Success Rate</div>
              <div className="text-emerald-400 font-bold font-mono text-sm">{monitoringMetrics.successRatePct}%</div>
            </div>
            <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800 space-y-0.5">
              <div className="text-zinc-400">Failure Rate</div>
              <div className="text-rose-400 font-bold font-mono text-sm">{monitoringMetrics.failureRatePct}%</div>
            </div>
          </div>

          <div className="space-y-1">
            <span className="font-semibold text-zinc-300 text-[11px]">Historical Deployment Analytics</span>
            <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800 space-y-1 text-[10px]">
              <div className="grid grid-cols-5 text-zinc-500 font-mono border-b border-zinc-900 pb-1 text-[9px]">
                <span>Date</span>
                <span>Deployments</span>
                <span>Avg Duration</span>
                <span>Passed</span>
                <span>Failed</span>
              </div>
              {monitoringMetrics.analytics.map((an, aIdx) => (
                <div key={aIdx} className="grid grid-cols-5 font-mono text-zinc-300">
                  <span className="text-zinc-400">{an.date}</span>
                  <span>{an.deploymentsCount}</span>
                  <span className="text-cyan-300">{(an.avgDurationMs / 1000).toFixed(1)}s</span>
                  <span className="text-emerald-400">{an.successCount}</span>
                  <span className={an.failureCount > 0 ? 'text-rose-400 font-semibold' : 'text-zinc-500'}>{an.failureCount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 12: Deployment Insights Dashboard (Prompt 6.3) */}
      {activeTab === 'insights' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-purple-400" />
              Deployment Insights Dashboard
            </span>
            <Badge variant="success" className="font-mono">
              Overall Score: {deploymentInsights.overallHealthScore} / 100
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-2 text-[10px]">
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1">
              <div className="text-zinc-400">Total Executed</div>
              <div className="text-purple-300 font-bold font-mono text-base">{deploymentInsights.totalDeploymentsCount}</div>
            </div>
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1">
              <div className="text-zinc-400">Successful Builds</div>
              <div className="text-emerald-400 font-bold font-mono text-base">{deploymentInsights.successCount}</div>
            </div>
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1">
              <div className="text-zinc-400">Average Build Time</div>
              <div className="text-cyan-300 font-bold font-mono text-base">{deploymentInsights.avgBuildTimeSec}s</div>
            </div>
          </div>

          <div className="space-y-1">
            <span className="font-semibold text-zinc-300 text-[11px]">Deployment Quality Trend</span>
            <div className="flex items-center gap-1 bg-zinc-950 p-2 rounded-lg border border-zinc-800 overflow-x-auto text-[10px] font-mono">
              {deploymentInsights.deploymentTrend.map((tr, tIdx) => (
                <div key={tIdx} className="bg-zinc-900 p-1.5 rounded flex-1 text-center min-w-[55px]">
                  <div className="text-zinc-500 text-[9px]">{tr.date}</div>
                  <div className="text-emerald-400 font-bold text-[11px]">{tr.score}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <span className="font-semibold text-zinc-300 text-[11px]">Recent Deployment Overview</span>
            <div className="space-y-1 bg-zinc-950 p-2 rounded-lg border border-zinc-800/80 text-[10px]">
              {deploymentInsights.recentDeployments.slice(0, 2).map((rd) => (
                <div key={rd.id} className="flex items-center justify-between font-mono text-zinc-300 border-b border-zinc-900 pb-1">
                  <div>
                    <span className="text-blue-300 font-semibold">{rd.version}</span>
                    <span className="text-zinc-500 text-[9px] ml-2">({rd.commitHash})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-400 text-[9px]">{rd.environment}</span>
                    <Badge variant={rd.status === 'SUCCESS' ? 'success' : 'outline'}>{rd.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 13: Deployment Approval (Prompt 6.4) */}
      {activeTab === 'approval' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-teal-400" />
              Deployment Approval Manager
            </span>
            <Badge variant={approvalRecord.status === 'APPROVED' ? 'success' : 'outline'}>
              Status: {approvalRecord.status}
            </Badge>
          </div>

          <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 space-y-2 text-[11px]">
            <div className="flex items-center justify-between text-zinc-300">
              <div>
                <span className="text-zinc-400">Target Deployment ID: </span>
                <span className="font-mono text-teal-300">{approvalRecord.deploymentId}</span>
              </div>
              <div>
                <span className="text-zinc-400">Environment: </span>
                <span className="font-mono text-cyan-300">{approvalRecord.targetEnvironment}</span>
              </div>
            </div>

            <div className="border-t border-zinc-900 pt-2 space-y-1">
              <div className="text-zinc-400">Assigned Reviewer & Auditor:</div>
              <div className="text-zinc-200 font-medium font-mono">{approvalRecord.reviewer}</div>
            </div>

            <div className="border-t border-zinc-900 pt-2 space-y-1">
              <div className="text-zinc-400">Reviewer Decision Comments:</div>
              <div className="text-zinc-300 bg-zinc-900/80 p-2 rounded border border-zinc-800/80 italic text-[10px]">
                &quot;{approvalRecord.comments}&quot;
              </div>
            </div>

            <div className="text-right text-[9px] text-zinc-500 font-mono">
              Decision Recorded At: {new Date(approvalRecord.decisionAt).toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* Tab 14: Policy Engine (Prompt 6.4) */}
      {activeTab === 'policy' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-400" />
              Deployment Policy Compliance Engine
            </span>
            <Badge variant="success" className="font-mono">
              Compliance: {policyCompliance.complianceScore}%
            </Badge>
          </div>

          <div className="space-y-2 text-[10px]">
            <div className="space-y-1">
              <span className="font-semibold text-zinc-300">Production Policies</span>
              <div className="space-y-1">
                {policyCompliance.productionPolicies.map((pol, pIdx) => (
                  <div key={pIdx} className="bg-zinc-950 p-2 rounded-lg border border-zinc-800 flex items-center justify-between">
                    <div>
                      <div className="text-zinc-200 font-medium">{pol.name}</div>
                      <div className="text-zinc-500 text-[9px]">{pol.description}</div>
                    </div>
                    <Badge variant={pol.compliant ? 'success' : 'outline'}>{pol.compliant ? 'COMPLIANT' : 'NON-COMPLIANT'}</Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <span className="font-semibold text-zinc-300">Preview Policies & Environment Rules</span>
              <div className="space-y-1">
                {policyCompliance.previewPolicies.concat(policyCompliance.environmentRules).map((pol, rIdx) => (
                  <div key={rIdx} className="bg-zinc-950 p-2 rounded-lg border border-zinc-800 flex items-center justify-between">
                    <div>
                      <div className="text-zinc-200 font-medium">{pol.name}</div>
                      <div className="text-zinc-500 text-[9px]">{pol.description}</div>
                    </div>
                    <Badge variant={pol.compliant ? 'success' : 'outline'}>{pol.compliant ? 'COMPLIANT' : 'NON-COMPLIANT'}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 15: Recovery Planner (Prompt 6.4) */}
      {activeTab === 'recovery' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <LifeBuoy className="w-4 h-4 text-amber-400" />
              Deployment Recovery Planner & Strategy
            </span>
            <Badge variant="success" className="font-mono">
              Readiness: {recoveryPlan.recoveryReadinessScore} / 100
            </Badge>
          </div>

          <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-2 text-[10px]">
            <div>
              <span className="text-zinc-400">Incident Recovery Strategy: </span>
              <span className="text-amber-300 font-medium">{recoveryPlan.incidentSummary}</span>
            </div>

            <div className="border-t border-zinc-900 pt-2 space-y-1">
              <span className="font-semibold text-zinc-300">Automated Recovery Sequence</span>
              <div className="space-y-1">
                {recoveryPlan.failureRecoverySteps.map((step, sIdx) => (
                  <div key={sIdx} className="flex items-center gap-2 text-zinc-300 font-mono">
                    <span className="text-amber-400">{sIdx + 1}.</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-zinc-900 pt-2 flex items-center justify-between">
              <div>
                Target Rollback Version: <span className="text-blue-300 font-bold font-mono">{recoveryPlan.rollbackTargetVersion}</span>
              </div>
              <div className="flex items-center gap-1 font-mono text-[9px]">
                {recoveryPlan.recoveryTimeline.map((tl, tIdx) => (
                  <span key={tIdx} className="bg-zinc-900 px-1.5 py-0.5 rounded text-zinc-400">
                    {tl.step} ({tl.estDurationSec}s)
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 16: Executive Dashboard (Prompt 6.4) */}
      {activeTab === 'executive' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-yellow-400" />
              Vercel Deployment Executive Dashboard
            </span>
            <Badge variant="success">Status: {executiveDashboard.overallDeploymentStatus}</Badge>
          </div>

          <div className="grid grid-cols-4 gap-2 text-[10px]">
            {executiveDashboard.kpis.map((kpi, kIdx) => (
              <div key={kIdx} className="bg-zinc-950 p-2 rounded-lg border border-zinc-800 space-y-0.5">
                <div className="text-zinc-400 text-[9px]">{kpi.metricName}</div>
                <div className="text-yellow-300 font-bold font-mono text-sm">{kpi.value}</div>
                <div className="text-emerald-400 text-[8px] font-mono">{kpi.trend}</div>
              </div>
            ))}
          </div>

          <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1 text-[10px]">
            <span className="font-semibold text-zinc-300">Executive Briefing & Architectural Summary</span>
            <p className="text-zinc-400 leading-relaxed text-[10px]">
              {executiveDashboard.executiveSummary}
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
