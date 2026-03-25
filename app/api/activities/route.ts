import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { ActivityService } from '@/lib/services/services';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, activityType, ...data } = body;

    if (!userId || !activityType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const activityService = new ActivityService();
    const userObjectId = new ObjectId(userId);
    let activity;

    if (activityType === 'TRANSPORT') {
      const { transportMode, distance, notes } = data;
      activity = await activityService.createTransportActivity(
        userObjectId,
        transportMode,
        distance,
        notes
      );
    } else if (activityType === 'ENERGY') {
      const { energyType, consumption, notes } = data;
      activity = await activityService.createEnergyActivity(
        userObjectId,
        energyType,
        consumption,
        notes
      );
    } else if (activityType === 'WASTE') {
      const { wasteType, amount, notes } = data;
      activity = await activityService.createWasteActivity(
        userObjectId,
        wasteType,
        amount,
        notes
      );
    } else {
      return NextResponse.json(
        { error: 'Invalid activity type' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        activity: activity.toJSON(),
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Activity creation failed' },
      { status: 400 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const activityService = new ActivityService();
    const activities = await activityService.getUserActivities(
      new ObjectId(userId)
    );

    return NextResponse.json(
      {
        success: true,
        activities,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch activities' },
      { status: 400 }
    );
  }
}
