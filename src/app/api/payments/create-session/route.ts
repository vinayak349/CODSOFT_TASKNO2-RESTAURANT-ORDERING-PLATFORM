import { NextResponse } from 'next/server';
import { PaymentService } from '@/services/payment.service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.orderId) {
      return NextResponse.json(
        { success: false, message: 'Order ID is required' },
        { status: 400 }
      );
    }

    const session = await PaymentService.createPaymentSession(body.orderId, body.provider);
    return NextResponse.json({ success: true, session });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to create payment session' },
      { status: 400 }
    );
  }
}
