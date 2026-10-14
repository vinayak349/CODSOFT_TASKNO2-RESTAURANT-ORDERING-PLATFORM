import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { OrderService, CreateOrderInput } from '@/services/order.service';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const body: CreateOrderInput = await request.json();

    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Shopping cart cannot be empty.' },
        { status: 400 }
      );
    }

    if (!body.customerName || !body.customerPhone) {
      return NextResponse.json(
        { success: false, message: 'Customer name and phone number are required.' },
        { status: 400 }
      );
    }

    // Attach authenticated user ID if logged in
    const orderData: CreateOrderInput = {
      ...body,
      customerId: user ? user.id : body.customerId,
    };

    const order = await OrderService.createOrder(orderData);

    return NextResponse.json(
      { success: true, order, message: 'Order created successfully' },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to create order' },
      { status: 400 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const status = (searchParams.get('status') as any) || undefined;

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required to view orders' },
        { status: 401 }
      );
    }

    // If role is CUSTOMER, only return their own orders
    if (user.role === 'CUSTOMER') {
      const orders = await OrderService.getOrders({ customerId: user.id, status });
      return NextResponse.json({ success: true, orders });
    }

    // Staff / Admin can view all orders
    const orders = await OrderService.getOrders({ status });
    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
