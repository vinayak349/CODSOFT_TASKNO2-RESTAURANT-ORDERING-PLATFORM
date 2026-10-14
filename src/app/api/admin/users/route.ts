import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { UserService } from '@/services/user.service';

export async function GET() {
  try {
    await requireRole(['ADMIN']);
    const users = await UserService.getAllUsers();
    return NextResponse.json({ success: true, users });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Access denied' },
      { status: 403 }
    );
  }
}
