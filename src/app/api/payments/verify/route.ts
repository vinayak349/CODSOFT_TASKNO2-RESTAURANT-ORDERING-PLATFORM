import { NextResponse } from 'next/server';
import { PaymentService } from '@/services/payment.service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.orderId || !body.providerReference || !body.status) {
      return NextResponse.json(
        { success: false, message: 'Missing payment verification parameters' },
        { status: 400 }
      );
    }

    const result = await PaymentService.verifyAndProcessPayment({
      orderId: body.orderId,
      providerReference: body.providerReference,
      status: body.status,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Payment verification failed' },
      { status: 400 }
    );
  }
}
