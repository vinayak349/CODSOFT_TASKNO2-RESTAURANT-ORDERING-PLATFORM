import { NextResponse } from 'next/server';
import { MenuService } from '@/services/menu.service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;
    const dietary = searchParams.get('dietary') || undefined;
    const sortBy = (searchParams.get('sort') as any) || undefined;
    const onlyAvailable = searchParams.get('available') === 'true';

    const items = await MenuService.getMenuItems({
      categorySlug,
      search,
      dietary,
      sortBy,
      onlyAvailable,
    });

    return NextResponse.json({ success: true, count: items.length, items });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch menu' },
      { status: 500 }
    );
  }
}
