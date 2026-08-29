import { NextRequest, NextResponse } from 'next/server';
import { firebaseActivityManagerService } from '@/services/firebase/activity-manager';
import { firebaseMonitoringEngineService } from '@/services/firebase/monitoring-engine';
import { firebaseAnalyticsEngineService } from '@/services/firebase/analytics-engine';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId') || 'proj_enterprise_01';

    const activityReport = firebaseActivityManagerService.getActivityReport(projectId);
    const monitoringReport = firebaseMonitoringEngineService.getMonitoringReport(projectId);
    const analyticsReport = firebaseAnalyticsEngineService.getAnalyticsReport(projectId);

    return NextResponse.json({
      success: true,
      data: {
        activityReport,
        monitoringReport,
        analyticsReport
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch Firebase insights data' },
      { status: 500 }
    );
  }
}
