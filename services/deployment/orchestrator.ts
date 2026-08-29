/**
 * Deployment Orchestrator Architecture Specification (Vercel, Docker, Firebase, Supabase)
 */

export interface DeploymentConfig {
  projectId: string;
  target: 'VERCEL' | 'DOCKER' | 'FIREBASE' | 'SUPABASE';
  environmentVariables: Record<string, string>;
  buildOptions?: {
    buildCommand?: string;
    outputDir?: string;
  };
}

export interface DeploymentResult {
  deploymentId: string;
  status: 'SUCCESS' | 'FAILED' | 'IN_PROGRESS';
  previewUrl?: string;
  logs: string[];
}

export abstract class DeploymentOrchestratorService {
  abstract deployProject(config: DeploymentConfig): Promise<DeploymentResult>;
  abstract getDeploymentStatus(deploymentId: string): Promise<DeploymentResult>;
}
