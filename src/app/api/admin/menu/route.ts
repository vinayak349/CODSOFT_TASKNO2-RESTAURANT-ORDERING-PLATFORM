import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { MenuService } from '@/services/menu.service';

export async function POST(request: Request) {
  try {
    await requireRole(['ADMIN']);
    const body = await request.json();

    if (!body.name || !body.price || !body.categoryId) {
      return NextResponse.json(
        { success: false, message: 'Name, price, and category are required' },
        { status: 400 }
      );
    }

    const item = await MenuService.createMenuItem({
      name: body.name,
      description: body.description || '',
      price: Number(body.price),
      imageUrl: body.imageUrl || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
      isAvailable: body.isAvailable ?? true,
      preparationTime: body.preparationTime ? Number(body.preparationTime) : 15,
      dietaryLabels: body.dietaryLabels || JSON.stringify(['Veg']),
      categoryId: body.categoryId,
    });

    return NextResponse.json({ success: true, item, message: 'Menu item created' }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Access denied' },
      { status: 403 }
    );
  }
}
