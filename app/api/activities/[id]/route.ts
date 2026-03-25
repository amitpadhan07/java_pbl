import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { ActivityService, ReportService } from '@/lib/services/services';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const activityService = new ActivityService();
    const reportService = new ReportService();
    const { id } = await params;
    const activityId = new ObjectId(id);
    const activity = await activityService.getActivityById(activityId);

    if (!activity) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }

    const success = await activityService.deleteActivity(activityId);

    if (!success) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }

    // Recalculate the report for the month that contained the deleted activity.
    await reportService.generateMonthlyReport(
      new ObjectId(activity.userId),
      new Date(activity.createdAt)
    );

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete activity' },
      { status: 400 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const activityService = new ActivityService();
    const { id } = await params;
    const activity = await activityService.getActivityById(new ObjectId(id));

    if (!activity) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        activity,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch activity' },
      { status: 400 }
    );
  }
}
