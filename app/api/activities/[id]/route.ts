import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { ActivityService } from '@/lib/services/services';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const activityService = new ActivityService();
    const success = await activityService.deleteActivity(new ObjectId(params.id));

    if (!success) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }

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
  { params }: { params: { id: string } }
) {
  try {
    const activityService = new ActivityService();
    const activity = await activityService.getActivityById(new ObjectId(params.id));

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
