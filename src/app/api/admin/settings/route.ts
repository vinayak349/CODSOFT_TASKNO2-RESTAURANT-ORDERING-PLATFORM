import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { AnalyticsService } from '@/services/analytics.service';

export async function GET() {
  try {
    const settings = await AnalyticsService.getSettings();
    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    await requireRole(['ADMIN']);
    const body = await request.json();
    const updated = await AnalyticsService.updateSettings(body);
    return NextResponse.json({ success: true, settings: updated, message: 'Settings updated' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Access denied' },
      { status: 403 }
    );
  }
}
