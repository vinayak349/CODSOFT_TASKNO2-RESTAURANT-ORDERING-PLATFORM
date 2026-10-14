import { describe, it, expect, beforeEach } from 'vitest';
import { OrderService } from '@/services/order.service';
import { ReservationService } from '@/services/reservation.service';
import { registerSchema, loginSchema } from '@/lib/validation/auth.schema';
import { store } from '@/lib/db-store';

describe('DineDesk Unit Tests: Pricing, Calculations & State Transitions', () => {
  it('correctly calculates subtotal, 5% GST tax, and delivery fee', async () => {
    // Paneer Tikka Angaare (₹345) and Dal Makhani Royale (₹395)
    const items = [
      { menuItemId: 'item-1', quantity: 2 }, // 2 * 345 = 690
      { menuItemId: 'item-4', quantity: 1 }, // 1 * 395 = 395
    ];
    // Subtotal: 690 + 395 = 1085.00
    // Tax: 1085 * 0.05 = 54.25
    // Delivery: ₹40.00
    // Total: 1085 + 54.25 + 40 = 1179.25

    const deliveryTotals = await OrderService.calculateOrderTotals(items, 'DELIVERY');
    expect(deliveryTotals.subtotal).toBe(1085.0);
    expect(deliveryTotals.taxAmount).toBe(54.25);
    expect(deliveryTotals.deliveryFee).toBe(40.0);
    expect(deliveryTotals.totalAmount).toBe(1179.25);

    // Dine-In totals (delivery fee should be 0)
    const dineInTotals = await OrderService.calculateOrderTotals(items, 'DINE_IN');
    expect(dineInTotals.deliveryFee).toBe(0.0);
    expect(dineInTotals.totalAmount).toBe(1139.25);
  });

  it('rejects order with zero or negative quantity', async () => {
    const invalidItems = [{ menuItemId: 'item-1', quantity: 0 }];
    await expect(OrderService.calculateOrderTotals(invalidItems, 'DINE_IN')).rejects.toThrow(
      'Quantity must be greater than zero.'
    );
  });

  it('rejects order containing non-existent or unavailable menu items', async () => {
    const nonExistent = [{ menuItemId: 'item-9999-not-found', quantity: 1 }];
    await expect(OrderService.calculateOrderTotals(nonExistent, 'DINE_IN')).rejects.toThrow(
      'not found'
    );
  });

  it('generates consistent unique order numbers matching format DD-YYYYMMDD-XXXX', () => {
    const orderNum = OrderService.generateOrderNumber();
    expect(orderNum).toMatch(/^DD-\d{8}-\d{4}$/);
  });

  it('enforces server-side order lifecycle state transitions', async () => {
    // Kitchen staff can advance PLACED -> PREPARING -> READY
    const mockOrder = await OrderService.createOrder({
      customerName: 'Test Diner',
      customerPhone: '+91 99999 88888',
      fulfillmentType: 'DINE_IN',
      tableNumber: 'T-01',
      paymentMethod: 'CASH',
      items: [{ menuItemId: 'item-1', quantity: 1 }],
    });

    expect(mockOrder.status).toBe('PLACED');

    // Kitchen moves to PREPARING
    const preparingOrder = await OrderService.updateOrderStatus(mockOrder.id, 'PREPARING', 'KITCHEN');
    expect(preparingOrder.status).toBe('PREPARING');

    // Customer CANNOT mark order as READY
    await expect(
      OrderService.updateOrderStatus(mockOrder.id, 'READY', 'CUSTOMER')
    ).rejects.toThrow('Customers cannot advance order kitchen preparation statuses.');

    // Kitchen moves to READY
    const readyOrder = await OrderService.updateOrderStatus(mockOrder.id, 'READY', 'KITCHEN');
    expect(readyOrder.status).toBe('READY');

    // Kitchen / Admin fulfills to COMPLETED
    const completedOrder = await OrderService.updateOrderStatus(mockOrder.id, 'COMPLETED', 'KITCHEN');
    expect(completedOrder.status).toBe('COMPLETED');

    // Once in terminal state COMPLETED, cannot casually return to PREPARING
    await expect(
      OrderService.updateOrderStatus(mockOrder.id, 'PREPARING', 'KITCHEN')
    ).rejects.toThrow('Cannot transition order from terminal state');
  });

  it('prevents customer cancellation once food preparation has started', async () => {
    const cookingOrder = await OrderService.createOrder({
      customerName: 'Test Diner 2',
      customerPhone: '+91 99999 88888',
      fulfillmentType: 'DINE_IN',
      tableNumber: 'T-02',
      paymentMethod: 'CASH',
      items: [{ menuItemId: 'item-1', quantity: 1 }],
    });

    // Advance to PREPARING
    await OrderService.updateOrderStatus(cookingOrder.id, 'PREPARING', 'KITCHEN');

    // Customer attempts to cancel while cooking
    await expect(
      OrderService.updateOrderStatus(cookingOrder.id, 'CANCELLED', 'CUSTOMER')
    ).rejects.toThrow('You can only cancel an order before the kitchen has started preparing it.');
  });
});

describe('DineDesk Unit Tests: Reservation Conflict & Overlap Prevention Engine', () => {
  it('accurately detects overlapping time slots for the same table', () => {
    // 19:00 to 20:30 overlaps with 19:30 to 21:00
    const overlap1 = ReservationService.doTimesOverlap('19:00', '20:30', '19:30', '21:00');
    expect(overlap1).toBe(true);

    // 19:00 to 20:30 overlaps with 18:30 to 19:30
    const overlap2 = ReservationService.doTimesOverlap('19:00', '20:30', '18:30', '19:30');
    expect(overlap2).toBe(true);

    // 18:00 to 19:30 does NOT overlap with 19:30 to 21:00 (adjacent consecutive slots)
    const nonOverlap = ReservationService.doTimesOverlap('18:00', '19:30', '19:30', '21:00');
    expect(nonOverlap).toBe(false);

    // Disjoint non-overlapping slots
    const disjoint = ReservationService.doTimesOverlap('12:00', '13:30', '19:00', '20:30');
    expect(disjoint).toBe(false);
  });

  it('prevents double-booking two conflicting confirmed reservations on the same table', async () => {
    const date = '2026-11-20';
    const time = '20:00';

    // 1. First booking on Table tbl-1 (T-01, 2 guests)
    const res1 = await ReservationService.createReservation({
      guestName: 'First Guest',
      guestPhone: '+91 91111 22222',
      reservationDate: date,
      startTime: time,
      partySize: 2,
      tableId: 'tbl-1',
    });
    expect(res1.status).toBe('CONFIRMED');

    // 2. Second booking attempting the same table at the same time
    await expect(
      ReservationService.createReservation({
        guestName: 'Conflicting Guest',
        guestPhone: '+91 92222 33333',
        reservationDate: date,
        startTime: time,
        partySize: 2,
        tableId: 'tbl-1',
      })
    ).rejects.toThrow('is already booked for this time slot');
  });

  it('rejects reservation outside restaurant operating hours (11:00 to 23:00)', async () => {
    // 08:00 AM is before opening
    await expect(
      ReservationService.createReservation({
        guestName: 'Early Guest',
        guestPhone: '+91 93333 44444',
        reservationDate: '2026-11-20',
        startTime: '08:00',
        partySize: 2,
      })
    ).rejects.toThrow('Reservations are only accepted between 11:00 AM and 11:00 PM.');

    // 22:30 PM with 90 min seating extends past 23:00 closing
    await expect(
      ReservationService.createReservation({
        guestName: 'Late Guest',
        guestPhone: '+91 93333 44444',
        reservationDate: '2026-11-20',
        startTime: '22:30',
        partySize: 2,
      })
    ).rejects.toThrow('Reservations are only accepted between 11:00 AM and 11:00 PM.');
  });
});

describe('DineDesk Unit Tests: Input Validation & Schemas', () => {
  it('validates customer registration schema correctly', () => {
    const valid = registerSchema.safeParse({
      name: 'Priya Nair',
      email: 'priya@example.com',
      password: 'password123',
      phone: '+91 98765 43210',
    });
    expect(valid.success).toBe(true);

    const invalidEmail = registerSchema.safeParse({
      name: 'Priya Nair',
      email: 'invalid-email-string',
      password: 'password123',
    });
    expect(invalidEmail.success).toBe(false);

    const shortPassword = registerSchema.safeParse({
      name: 'Priya Nair',
      email: 'priya@example.com',
      password: '123',
    });
    expect(shortPassword.success).toBe(false);
  });

  it('validates login schema correctly', () => {
    const valid = loginSchema.safeParse({
      email: 'admin@dinedesk.com',
      password: 'Admin@12345',
    });
    expect(valid.success).toBe(true);

    const empty = loginSchema.safeParse({
      email: '',
      password: '',
    });
    expect(empty.success).toBe(false);
  });
});
