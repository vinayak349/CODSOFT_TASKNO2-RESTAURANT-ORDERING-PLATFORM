import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { OrderService } from '@/services/order.service';

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const order = await OrderService.getOrderById(params.id);

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    const user = await getCurrentUser();

    // Security check: Customer can only view their own order unless they have order ID and placed as guest
    if (user && user.role === 'CUSTOMER' && order.customerId && order.customerId !== user.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized to view this order.' },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch order' },
      { status: 500 }
    );
  }
}
