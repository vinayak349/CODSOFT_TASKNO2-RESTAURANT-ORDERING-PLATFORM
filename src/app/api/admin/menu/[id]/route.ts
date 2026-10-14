import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { MenuService } from '@/services/menu.service';

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(['ADMIN']);
    const params = await props.params;
    const body = await request.json();

    const updated = await MenuService.updateMenuItem(params.id, body);
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Menu item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, item: updated, message: 'Menu item updated' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Access denied' },
      { status: 403 }
    );
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(['ADMIN']);
    const params = await props.params;
    const success = await MenuService.deleteMenuItem(params.id);
    return NextResponse.json({ success, message: success ? 'Menu item deleted' : 'Item not found' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Access denied' },
      { status: 403 }
    );
  }
}
