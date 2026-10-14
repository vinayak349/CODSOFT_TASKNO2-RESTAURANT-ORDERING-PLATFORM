import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { AnalyticsService } from '@/services/analytics.service';

export async function GET() {
  try {
    await requireRole(['ADMIN']);
    const stats = await AnalyticsService.getDashboardStats();
    return NextResponse.json({ success: true, stats });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Access denied' },
      { status: 403 }
    );
  }
}
