import { NextResponse } from 'next/server';
import { MenuService } from '@/services/menu.service';

export async function GET() {
  try {
    const categories = await MenuService.getCategories();
    return NextResponse.json({ success: true, categories });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
