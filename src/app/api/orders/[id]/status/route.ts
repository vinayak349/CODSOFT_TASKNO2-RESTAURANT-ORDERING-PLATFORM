import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { OrderService } from '@/services/order.service';

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const params = await props.params;
    const body = await request.json();

    if (!body.status) {
      return NextResponse.json(
        { success: false, message: 'Status field is required' },
        { status: 400 }
      );
    }

    const updatedOrder = await OrderService.updateOrderStatus(
      params.id,
      body.status,
      user.role
    );

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: `Order status updated to ${body.status}`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update order status' },
      { status: 400 }
    );
  }
}
