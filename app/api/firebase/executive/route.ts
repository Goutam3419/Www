import { NextRequest, NextResponse } from 'next/server';
import { firebaseConfigurationManagerService } from '@/services/firebase/configuration-manager';
import { firebaseBackupRecoveryPlannerService } from '@/services/firebase/backup-recovery-planner';
import { firebaseComplianceEngineService } from '@/services/firebase/compliance-engine';
import { firebaseExecutiveDashboardService } from '@/services/firebase/executive-dashboard';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId') || 'proj_enterprise_01';

    const configReport = firebaseConfigurationManagerService.getConfigurationReport(projectId);
    const backupPlan = firebaseBackupRecoveryPlannerService.getBackupRecoveryPlan(projectId);
    const complianceReport = firebaseComplianceEngineService.getComplianceReport(projectId);
    const executiveDashboard = firebaseExecutiveDashboardService.getExecutiveDashboard(projectId);

    return NextResponse.json({
      success: true,
      data: {
        configReport,
        backupPlan,
        complianceReport,
        executiveDashboard
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch Firebase executive data' },
      { status: 500 }
    );
  }
}
