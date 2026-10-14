import { NextResponse } from 'next/server';
import { MenuService } from '@/services/menu.service';

export async function GET(
  request: Request,
  props: { params: Promise<{ slug: string }> }
) {
  try {
    const params = await props.params;
    const item = await MenuService.getItemBySlug(params.slug);
    if (!item) {
      return NextResponse.json(
        { success: false, message: 'Menu item not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, item });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch menu item' },
      { status: 500 }
    );
  }
}
