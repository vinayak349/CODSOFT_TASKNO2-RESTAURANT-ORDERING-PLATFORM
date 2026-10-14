import crypto from 'crypto';
import { OrderService } from '@/services/order.service';
import { PaymentStatus, PaymentProvider } from '@/lib/db-store';

export interface PaymentSessionResult {
  sessionId: string;
  orderId: string;
  orderNumber: string;
  amount: number;
  currency: string;
  provider: PaymentProvider;
  clientSecret?: string;
  mockGatewayUrl?: string;
}

export class PaymentService {
  // Generate secure test payment signature
  static generateSignature(orderId: string, paymentRef: string, secret: string): string {
    return crypto
      .createHmac('sha256', secret)
      .update(`${orderId}|${paymentRef}`)
      .digest('hex');
  }

  // Create payment session
  static async createPaymentSession(
    orderId: string,
    provider: PaymentProvider = 'TEST_ONLINE'
  ): Promise<PaymentSessionResult> {
    const order = await OrderService.getOrderById(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} does not exist`);
    }

    if (provider === 'CASH') {
      await OrderService.updatePaymentStatus(order.id, 'PENDING');
      return {
        sessionId: `cash_session_${order.id}`,
        orderId: order.id,
        orderNumber: order.orderNumber,
        amount: order.totalAmount,
        currency: 'INR',
        provider: 'CASH',
      };
    }

    // TEST_ONLINE Mock/Sandbox Payment Provider
    const sessionId = `test_pay_sess_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    return {
      sessionId,
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: order.totalAmount,
      currency: 'INR',
      provider: 'TEST_ONLINE',
      clientSecret: `mock_secret_${sessionId}`,
      mockGatewayUrl: `/checkout/payment-mock?session=${sessionId}&orderId=${order.id}&amount=${order.totalAmount}`,
    };
  }

  // Verify and complete payment
  static async verifyAndProcessPayment(data: {
    orderId: string;
    providerReference: string;
    status: 'PAID' | 'FAILED';
  }) {
    const order = await OrderService.getOrderById(data.orderId);
    if (!order) throw new Error('Order not found for payment verification');

    const paymentStatus: PaymentStatus = data.status === 'PAID' ? 'PAID' : 'FAILED';
    const updated = await OrderService.updatePaymentStatus(
      order.id,
      paymentStatus,
      data.providerReference
    );

    return {
      success: data.status === 'PAID',
      order: updated,
      providerReference: data.providerReference,
    };
  }
}
