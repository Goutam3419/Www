import { NextRequest, NextResponse } from 'next/server';
import { firestoreCollectionManagerService } from '@/services/firebase/collection-manager';
import { firestoreRulesManagerService } from '@/services/firebase/rules-manager';
import { firebaseAuthManagerService } from '@/services/firebase/auth-manager';
import { firebaseSecurityDashboardService } from '@/services/firebase/security-dashboard';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId') || 'proj_enterprise_01';

    const collectionReport = firestoreCollectionManagerService.getCollectionManagerReport(projectId);
    const rulesReport = firestoreRulesManagerService.getRulesManagerReport(projectId);
    const authManagerReport = firebaseAuthManagerService.getAuthManagerReport(projectId);
    const securityDashboardReport = firebaseSecurityDashboardService.getSecurityDashboard(projectId);

    return NextResponse.json({
      success: true,
      data: {
        collectionReport,
        rulesReport,
        authManagerReport,
        securityDashboardReport
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch Firebase management data' },
      { status: 500 }
    );
  }
}
