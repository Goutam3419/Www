'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { gitHubConnectionManagerService } from '@/services/github/connection-manager';
import { branchManagerService } from '@/services/github/branch-manager';
import { commitPlannerService } from '@/services/github/commit-planner';
import { pullRequestPlannerService } from '@/services/github/pull-request-planner';
import { gitHubActionsPlannerService } from '@/services/github/actions-planner';
import { releasePlannerService } from '@/services/github/release-planner';
import { repositorySecurityAnalyzerService } from '@/services/github/security-analyzer';
import { repositoryExplorerService } from '@/services/github/repository-explorer';
import { gitHubActivityTimelineService } from '@/services/github/activity-timeline';

import {
  GitBranch,
  GitCommit,
  FolderGit2,
  GitPullRequest,
  PlayCircle,
  Tag,
  Lock,
  Compass,
  History,
  AlertTriangle
} from 'lucide-react';

interface GitHubWorkspacePanelProps {
  repoFullName?: string;
  userId?: string;
}

export const GitHubWorkspacePanel: React.FC<GitHubWorkspacePanelProps> = ({
  repoFullName = 'owner/ai-ceo-app',
  userId = 'usr_default_admin'
}) => {
  const [activeTab, setActiveTab] = useState<
    'explorer' | 'commit' | 'branches' | 'timeline' | 'pr' | 'actions' | 'release' | 'security'
  >('explorer');

  // Load read-only architectural states
  const connectionInfo = gitHubConnectionManagerService.getConnectionStatus(userId);
  const branches = branchManagerService.getBranches(repoFullName);

  // Prompt 5.4 Services
  const repoExplorer = repositoryExplorerService.exploreRepository(repoFullName);
  const activityTimeline = gitHubActivityTimelineService.generateActivityTimeline(repoFullName);

  // Sample Commit Planner & Risk Analysis for current files
  const sampleAffectedFiles = [
    '/services/github/repository-explorer.ts',
    '/services/github/activity-timeline.ts',
    '/components/workspace/GitHubWorkspacePanel.tsx',
    '/lib/db/store.ts'
  ];
  const generatedCommitMessage = commitPlannerService.generateCommitMessage(
    sampleAffectedFiles,
    ['GitHub Engine', 'UI Component', 'Database']
  );
  const commitRiskAnalysis = commitPlannerService.analyzeCommitRisk(sampleAffectedFiles, generatedCommitMessage);

  // Sample Branch Operations & Protections
  const sampleBranchOp = branchManagerService.planBranchOperation({
    action: 'CREATE',
    repoFullName,
    branchName: 'feature/prompt-5-4-engine'
  });

  const prPlan = pullRequestPlannerService.getLatestPullRequestPlan(repoFullName) ||
    pullRequestPlannerService.planPullRequest({
      repoFullName,
      sourceBranch: 'feature/github-integration-engine'
    });

  const actionsPlan = gitHubActionsPlannerService.getLatestActionsPlan(repoFullName) ||
    gitHubActionsPlannerService.planWorkflows(repoFullName);

  const releasePlan = releasePlannerService.getLatestReleasePlan(repoFullName) ||
    releasePlannerService.planRelease({ repoFullName });

  const securityAnalysis = repositorySecurityAnalyzerService.getLatestSecurityAnalysis(repoFullName) ||
    repositorySecurityAnalyzerService.analyzeSecurity(repoFullName);

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-4 text-xs font-sans">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <FolderGit2 className="w-4 h-4 text-purple-400" />
          <span className="font-semibold text-zinc-100 text-sm">GitHub Workspace Inspection</span>
          <Badge variant="outline" className="text-[10px] font-mono text-amber-400 border-amber-800/80">
            Read-Only Architecture Mode
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="text-zinc-400">Connection:</span>
          {connectionInfo.isConnected ? (
            <Badge variant="success">CONNECTED</Badge>
          ) : (
            <Badge variant="outline">DISCONNECTED</Badge>
          )}
        </div>
      </div>

      {/* Navigation Sub-tabs */}
      <div className="flex gap-2 border-b border-zinc-800/80 pb-2 overflow-x-auto text-[11px] scrollbar-thin">
        <button
          onClick={() => setActiveTab('explorer')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'explorer' ? 'bg-zinc-800 text-zinc-100 font-medium' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-blue-400" /> Repo Explorer
        </button>
        <button
          onClick={() => setActiveTab('commit')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'commit' ? 'bg-zinc-800 text-zinc-100 font-medium' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <GitCommit className="w-3.5 h-3.5 text-purple-400" /> Commit Planner
        </button>
        <button
          onClick={() => setActiveTab('branches')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'branches' ? 'bg-zinc-800 text-zinc-100 font-medium' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <GitBranch className="w-3.5 h-3.5 text-emerald-400" /> Branch Manager ({branches.length})
        </button>
        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'timeline' ? 'bg-zinc-800 text-zinc-100 font-medium' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <History className="w-3.5 h-3.5 text-cyan-400" /> Activity Timeline
        </button>
        <button
          onClick={() => setActiveTab('pr')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'pr' ? 'bg-zinc-800 text-zinc-100 font-medium' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <GitPullRequest className="w-3.5 h-3.5 text-indigo-400" /> PR Planner
        </button>
        <button
          onClick={() => setActiveTab('actions')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'actions' ? 'bg-zinc-800 text-zinc-100 font-medium' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <PlayCircle className="w-3.5 h-3.5 text-amber-400" /> Actions Workflows
        </button>
        <button
          onClick={() => setActiveTab('release')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'release' ? 'bg-zinc-800 text-zinc-100 font-medium' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Tag className="w-3.5 h-3.5 text-rose-400" /> Release Planner
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'security' ? 'bg-zinc-800 text-zinc-100 font-medium' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Lock className="w-3.5 h-3.5 text-emerald-400" /> Security Report
        </button>
      </div>

      {/* Tab 1: Repository Explorer (Prompt 5.4) */}
      {activeTab === 'explorer' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/80">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-100 text-xs">Repository Information</span>
            <Badge variant="info">Health Score: {repoExplorer.health.score}/100</Badge>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800">
              <span className="text-zinc-400">FullName:</span> <span className="font-mono text-indigo-300">{repoExplorer.repoFullName}</span>
            </div>
            <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800">
              <span className="text-zinc-400">Default Branch:</span> <span className="font-mono text-emerald-400">{repoExplorer.info.defaultBranch}</span>
            </div>
          </div>

          <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800 space-y-1 text-[10px]">
            <div className="font-semibold text-zinc-300">Repository Statistics</div>
            <div className="grid grid-cols-4 gap-1 text-zinc-400 font-mono">
              <div>Commits: <span className="text-zinc-200">{repoExplorer.statistics.totalCommits}</span></div>
              <div>PRs: <span className="text-zinc-200">{repoExplorer.statistics.totalPRs}</span></div>
              <div>Releases: <span className="text-zinc-200">{repoExplorer.statistics.totalReleases}</span></div>
              <div>Contributors: <span className="text-zinc-200">{repoExplorer.statistics.contributorsCount}</span></div>
            </div>
          </div>

          <div className="space-y-1">
            <span className="font-semibold text-zinc-300 text-[11px]">Repository Health Checks</span>
            <div className="space-y-1 bg-zinc-950 p-2 rounded-lg border border-zinc-800/80 text-[10px]">
              {repoExplorer.health.checks.map((chk, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-zinc-300">{chk.name}: <span className="text-zinc-500">{chk.description}</span></span>
                  <Badge variant={chk.status === 'PASS' ? 'success' : 'outline'}>
                    {chk.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[10px] text-zinc-400 bg-zinc-950/80 p-2 rounded-lg border border-zinc-800/60">
            <span className="font-semibold text-zinc-300">Summary:</span> {repoExplorer.summary}
          </div>
        </div>
      )}

      {/* Tab 2: Commit Planner (Prompt 5.4) */}
      {activeTab === 'commit' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-100 text-xs">Conventional Commit Generator & Risk Analysis</span>
            <Badge variant={commitRiskAnalysis.riskLevel === 'HIGH' ? 'outline' : 'success'}>
              Risk: {commitRiskAnalysis.riskLevel}
            </Badge>
          </div>

          <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1.5 font-mono text-[11px]">
            <div className="text-zinc-400 text-[10px]">Generated Commit Message:</div>
            <div className="text-emerald-400 font-semibold">{generatedCommitMessage}</div>
            <div className="text-[10px] text-zinc-500 border-t border-zinc-800/80 pt-1">
              Conventional Validation: {commitRiskAnalysis.isValid ? <span className="text-emerald-400">PASSED</span> : <span className="text-rose-400">FAILED</span>}
            </div>
          </div>

          <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800 space-y-1 text-[10px]">
            <div className="font-semibold text-zinc-300">Changed Files Summary ({sampleAffectedFiles.length} files)</div>
            <ul className="list-disc list-inside text-zinc-400 font-mono space-y-0.5">
              {sampleAffectedFiles.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>

          <div className="space-y-1">
            <span className="font-semibold text-zinc-300 text-[11px]">Commit Risk Factors & Mitigation</span>
            <div className="space-y-1 bg-zinc-950 p-2 rounded-lg border border-zinc-800/80 text-[10px]">
              {commitRiskAnalysis.risks.length === 0 ? (
                <div className="text-emerald-400">No high-risk code alterations detected in planned commit.</div>
              ) : (
                commitRiskAnalysis.risks.map((r, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-amber-300">
                    <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                    <span>{r}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Branch Manager (Prompt 5.4) */}
      {activeTab === 'branches' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-100 text-xs">Branch Creation, Protection & Merge Target Validation</span>
            <Badge variant="info">Configured: {branches.length} Branches</Badge>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {branches.map(b => {
              const prot = branchManagerService.analyzeBranchProtection(b.name);
              return (
                <div
                  key={b.id || b.name}
                  className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800/80 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-zinc-200 flex items-center gap-1.5">
                      <GitBranch className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="font-mono">{b.name}</span>
                    </div>
                    {b.isDefault ? <Badge variant="success">DEFAULT</Badge> : <Badge variant="outline">{b.type}</Badge>}
                  </div>
                  <div className="text-[10px] text-zinc-400 font-mono">
                    Protected: {prot.isProtected ? 'YES' : 'NO'} | Rules: {prot.rules.length} enforcement checks
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800 text-[10px] space-y-1">
            <span className="font-semibold text-zinc-300">Planned Operation: {sampleBranchOp.action} `{sampleBranchOp.branchName}`</span>
            <div className="text-zinc-400">
              Merge Target Validation: {sampleBranchOp.mergeTargetValidation.valid ? <span className="text-emerald-400">VALID</span> : <span className="text-rose-400">INVALID</span>}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: GitHub Activity Timeline (Prompt 5.4) */}
      {activeTab === 'timeline' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-100 text-xs">Activity Timeline & Repository Velocity</span>
            <Badge variant="success">Active Status</Badge>
          </div>

          <div className="space-y-2">
            <div className="font-semibold text-zinc-300 text-[11px]">Recent Commits Timeline</div>
            <div className="space-y-1 bg-zinc-950 p-2 rounded-lg border border-zinc-800/80 text-[10px]">
              {activityTimeline.commitTimeline.map(c => (
                <div key={c.id} className="flex justify-between items-center font-mono">
                  <span className="text-emerald-400">[{c.hash}] <span className="text-zinc-300">{c.message}</span></span>
                  <span className="text-zinc-500 text-[9px]">{c.author}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="font-semibold text-zinc-300 text-[11px]">Pull Requests & Releases Timeline</div>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800">
                <span className="font-semibold text-indigo-300">Merged PRs ({activityTimeline.prTimeline.length})</span>
                {activityTimeline.prTimeline.map(pr => (
                  <div key={pr.id} className="text-zinc-400 truncate mt-1">
                    #{pr.id}: {pr.title}
                  </div>
                ))}
              </div>
              <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800">
                <span className="font-semibold text-rose-300">Releases ({activityTimeline.releaseTimeline.length})</span>
                {activityTimeline.releaseTimeline.map(rel => (
                  <div key={rel.id} className="text-zinc-400 truncate mt-1">
                    {rel.tag}: {rel.name}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800/80 text-[10px] space-y-1">
            <span className="font-semibold text-zinc-300">Activity Insights:</span>
            <ul className="list-disc list-inside text-zinc-400 space-y-0.5">
              {activityTimeline.insights.map((ins, i) => (
                <li key={i}>{ins}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Tab 5: PR Planner */}
      {activeTab === 'pr' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200">Title: <span className="text-indigo-300 font-mono">{prPlan.title}</span></span>
            <Badge variant="success">Readiness: {prPlan.readinessAnalysis.isReady ? 'READY' : 'INCOMPLETE'}</Badge>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800">
              <span className="text-zinc-400">Branches:</span> <span className="font-mono text-emerald-400">{prPlan.sourceBranch}</span> &rarr; <span className="font-mono text-zinc-200">{prPlan.targetBranch}</span>
            </div>
            <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800">
              <span className="text-zinc-400">Merge Strategy:</span> <span className="font-mono text-amber-400">{prPlan.mergeStrategy.toUpperCase()}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="font-semibold text-zinc-300">Review Checklist:</span>
            <div className="space-y-1 bg-zinc-950 p-2 rounded-lg border border-zinc-800/80 text-[10px]">
              {prPlan.reviewChecklist.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-zinc-300">{item.item}</span>
                  <Badge variant={item.completed ? 'success' : 'outline'}>
                    {item.completed ? 'PASSED' : 'PENDING'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Actions Workflows Planner */}
      {activeTab === 'actions' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200">Configured Workflows: ({actionsPlan.workflows.length})</span>
            <Badge variant="info">Risk Level: {actionsPlan.failureRiskDetection.riskLevel}</Badge>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {actionsPlan.workflows.map((wf, idx) => (
              <div key={idx} className="bg-zinc-950 p-2 rounded-lg border border-zinc-800/80 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-amber-300 font-mono">{wf.name}</span>
                  <Badge variant="success">{wf.status}</Badge>
                </div>
                <div className="text-[10px] text-zinc-400">Trigger: <span className="font-mono text-zinc-300">{wf.trigger}</span></div>
                <div className="text-[9px] font-mono text-zinc-500">
                  Steps: {wf.steps.join(' -> ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 7: Release Planner */}
      {activeTab === 'release' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200">Planned Version: <span className="text-rose-400 font-mono">{releasePlan.plannedVersion}</span></span>
            <span className="text-zinc-400 text-[10px]">Current: <span className="font-mono text-zinc-300">{releasePlan.currentVersion}</span></span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {releasePlan.changelog.map((cat, idx) => (
              <div key={idx} className="bg-zinc-950 p-2 rounded-lg border border-zinc-800/80 space-y-1">
                <span className="font-semibold text-indigo-300 text-[11px]">{cat.category}</span>
                <ul className="list-disc list-inside text-[10px] text-zinc-400 space-y-0.5">
                  {cat.entries.map((e, eIdx) => (
                    <li key={eIdx}>{e}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 8: Security Report */}
      {activeTab === 'security' && (
        <div className="space-y-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-semibold text-zinc-200">Security Score:</span>
            <Badge variant="success" className="text-sm font-mono">{securityAnalysis.securityScore} / 100</Badge>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800">
              <span className="text-zinc-400">Visibility:</span> <span className="font-mono text-zinc-200">{securityAnalysis.visibility}</span>
            </div>
            <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800">
              <span className="text-zinc-400">Branch Protection:</span> <span className="font-mono text-emerald-400">{securityAnalysis.branchProtection.enabled ? 'ENABLED' : 'DISABLED'}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="font-semibold text-zinc-300 text-[11px]">Recommendations:</span>
            <ul className="list-disc list-inside text-[10px] text-zinc-400 space-y-1 bg-zinc-950 p-2 rounded-lg border border-zinc-800/80">
              {securityAnalysis.recommendations.map((rec, rIdx) => (
                <li key={rIdx}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
