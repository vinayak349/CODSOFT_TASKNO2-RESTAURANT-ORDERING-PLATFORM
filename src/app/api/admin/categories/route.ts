import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { MenuService } from '@/services/menu.service';

export async function POST(request: Request) {
  try {
    await requireRole(['ADMIN']);
    const body = await request.json();

    if (!body.name || !body.slug) {
      return NextResponse.json(
        { success: false, message: 'Category name and slug are required' },
        { status: 400 }
      );
    }

    const cat = await MenuService.createCategory(body);
    return NextResponse.json({ success: true, category: cat, message: 'Category created' }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Access denied' },
      { status: 403 }
    );
  }
}
