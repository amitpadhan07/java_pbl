import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { ReportService } from '@/lib/services/services';

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    const month = request.nextUrl.searchParams.get('month');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const reportService = new ReportService();
    const userObjectId = new ObjectId(userId);

    if (month) {
      const reportMonth = new Date(month);
      const report = await reportService.generateMonthlyReport(
        userObjectId,
        reportMonth
      );

      return NextResponse.json(
        {
          success: true,
          report: report.toJSON(),
        },
        { status: 200 }
      );
    }

    const reports = await reportService.getUserMonthlyReports(userObjectId);

    return NextResponse.json(
      {
        success: true,
        reports: reports.map(r => r.toJSON()),
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch reports' },
      { status: 400 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, month } = body;

    if (!userId || !month) {
      return NextResponse.json(
        { error: 'userId and month are required' },
        { status: 400 }
      );
    }

    const reportService = new ReportService();
    const report = await reportService.generateMonthlyReport(
      new ObjectId(userId),
      new Date(month)
    );

    return NextResponse.json(
      {
        success: true,
        report: report.toJSON(),
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Report generation failed' },
      { status: 400 }
    );
  }
}
