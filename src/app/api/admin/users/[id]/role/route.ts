import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { UserService } from '@/services/user.service';

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(['ADMIN']);
    const params = await props.params;
    const body = await request.json();

    if (!body.role || !['CUSTOMER', 'KITCHEN', 'ADMIN'].includes(body.role)) {
      return NextResponse.json(
        { success: false, message: 'Valid role is required (CUSTOMER, KITCHEN, ADMIN)' },
        { status: 400 }
      );
    }

    const updated = await UserService.updateUserRole(params.id, body.role);
    if (!updated) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: updated, message: 'User role updated' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Access denied' },
      { status: 403 }
    );
  }
}
