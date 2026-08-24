import { NextRequest, NextResponse } from 'next/server';
import { firebaseProjectManagerService } from '@/services/firebase/project-manager';
import { firebaseAuthPlannerService } from '@/services/firebase/auth-planner';
import { firestorePlannerService } from '@/services/firebase/firestore-planner';
import { firebaseStoragePlannerService } from '@/services/firebase/storage-planner';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId') || 'proj_enterprise_01';

    const projectSummary = firebaseProjectManagerService.getProjectSummary(projectId);
    const authReport = firebaseAuthPlannerService.getAuthReadinessReport(projectId);
    const firestorePlan = firestorePlannerService.getFirestorePlan(projectId);
    const storagePlan = firebaseStoragePlannerService.getStoragePlan(projectId);

    return NextResponse.json({
      success: true,
      data: {
        projectSummary,
        authReport,
        firestorePlan,
        storagePlan
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch Firebase planning data' },
      { status: 500 }
    );
  }
}
