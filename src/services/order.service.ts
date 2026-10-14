import { prisma, isDatabaseReachable } from '@/lib/prisma';
import {
  store,
  OrderRecord,
  OrderItemRecord,
  PaymentRecord,
  OrderStatus,
  PaymentStatus,
  FulfillmentType,
  PaymentProvider,
  Role,
} from '@/lib/db-store';
import { MenuService } from '@/services/menu.service';

export interface CheckoutItemInput {
  menuItemId: string;
  quantity: number;
}

export interface CreateOrderInput {
  customerId?: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  fulfillmentType: FulfillmentType;
  deliveryAddress?: string | null;
  tableNumber?: string | null;
  notes?: string | null;
  paymentMethod: PaymentProvider;
  idempotencyKey?: string | null;
  items: CheckoutItemInput[];
}

export class OrderService {
  // Order Number Generator
  static generateOrderNumber(): string {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `DD-${dateStr}-${rand}`;
  }

  // Calculate taxes, fees, and server-side pricing
  static async calculateOrderTotals(
    items: CheckoutItemInput[],
    fulfillmentType: FulfillmentType
  ) {
    if (!items || items.length === 0) {
      throw new Error('Shopping cart cannot be empty.');
    }

    let subtotal = 0;
    const verifiedItems: {
      menuItemId: string;
      itemNameSnapshot: string;
      unitPriceSnapshot: number;
      quantity: number;
      lineTotal: number;
    }[] = [];

    for (const itemInput of items) {
      if (!itemInput.quantity || itemInput.quantity <= 0) {
        throw new Error('Quantity must be greater than zero.');
      }

      const menuItem = await MenuService.getItemById(itemInput.menuItemId);
      if (!menuItem) {
        throw new Error(`Menu item with ID "${itemInput.menuItemId}" was not found.`);
      }

      if (!menuItem.isAvailable) {
        throw new Error(`"${menuItem.name}" is currently unavailable and cannot be ordered.`);
      }

      const unitPrice = menuItem.price;
      const lineTotal = Number((unitPrice * itemInput.quantity).toFixed(2));
      subtotal += lineTotal;

      verifiedItems.push({
        menuItemId: menuItem.id,
        itemNameSnapshot: menuItem.name,
        unitPriceSnapshot: unitPrice,
        quantity: itemInput.quantity,
        lineTotal,
      });
    }

    subtotal = Number(subtotal.toFixed(2));
    const taxRate = 0.05; // 5% GST
    const taxAmount = Number((subtotal * taxRate).toFixed(2));
    const deliveryFee = fulfillmentType === 'DELIVERY' ? 40 : 0;
    const discountAmount = 0;
    const totalAmount = Number((subtotal + taxAmount + deliveryFee - discountAmount).toFixed(2));

    return {
      subtotal,
      taxAmount,
      deliveryFee,
      discountAmount,
      totalAmount,
      verifiedItems,
    };
  }

  // Create Order with Idempotency Protection
  static async createOrder(input: CreateOrderInput): Promise<OrderRecord> {
    // 1. Idempotency Check
    if (input.idempotencyKey) {
      const existing = await this.findByIdempotencyKey(input.idempotencyKey);
      if (existing) {
        return existing;
      }
    }

    // 2. Fulfillment validations
    if (input.fulfillmentType === 'DELIVERY' && (!input.deliveryAddress || input.deliveryAddress.trim() === '')) {
      throw new Error('Delivery address is required for home delivery orders.');
    }
    if (input.fulfillmentType === 'DINE_IN' && (!input.tableNumber || input.tableNumber.trim() === '')) {
      throw new Error('Table number or section selection is required for dine-in orders.');
    }

    // 3. Recalculate totals on server
    const { subtotal, taxAmount, deliveryFee, discountAmount, totalAmount, verifiedItems } =
      await this.calculateOrderTotals(input.items, input.fulfillmentType);

    const initialStatus: OrderStatus =
      input.paymentMethod === 'TEST_ONLINE' ? 'PENDING_PAYMENT' : 'PLACED';
    const initialPaymentStatus: PaymentStatus = 'PENDING';

    const orderNumber = this.generateOrderNumber();
    const now = new Date();

    if (await isDatabaseReachable()) {
      try {
        const createdOrder = await prisma.order.create({
          data: {
            orderNumber,
            customerId: input.customerId || null,
            customerName: input.customerName.trim(),
            customerPhone: input.customerPhone.trim(),
            customerEmail: input.customerEmail?.trim() || null,
            fulfillmentType: input.fulfillmentType,
            deliveryAddress: input.deliveryAddress?.trim() || null,
            tableNumber: input.tableNumber?.trim() || null,
            notes: input.notes?.trim() || null,
            status: initialStatus,
            paymentStatus: initialPaymentStatus,
            subtotal,
            taxAmount,
            deliveryFee,
            discountAmount,
            totalAmount,
            idempotencyKey: input.idempotencyKey || null,
            items: {
              create: verifiedItems.map((vi) => ({
                menuItemId: vi.menuItemId,
                itemNameSnapshot: vi.itemNameSnapshot,
                unitPriceSnapshot: vi.unitPriceSnapshot,
                quantity: vi.quantity,
                lineTotal: vi.lineTotal,
              })),
            },
            payments: {
              create: {
                provider: input.paymentMethod,
                providerReference:
                  input.paymentMethod === 'TEST_ONLINE'
                    ? `PAY-INIT-${Date.now()}`
                    : `CASH-ORD-${orderNumber}`,
                amount: totalAmount,
                currency: 'INR',
                status: 'PENDING',
                notes:
                  input.paymentMethod === 'TEST_ONLINE'
                    ? 'Payment session initiated'
                    : 'Pay at counter or on delivery',
              },
            },
          },
          include: {
            items: true,
            payments: true,
          },
        });

        return {
          id: createdOrder.id,
          orderNumber: createdOrder.orderNumber,
          customerId: createdOrder.customerId,
          customerName: createdOrder.customerName,
          customerPhone: createdOrder.customerPhone,
          customerEmail: createdOrder.customerEmail,
          fulfillmentType: createdOrder.fulfillmentType,
          deliveryAddress: createdOrder.deliveryAddress,
          tableNumber: createdOrder.tableNumber,
          notes: createdOrder.notes,
          status: createdOrder.status,
          paymentStatus: createdOrder.paymentStatus,
          subtotal: Number(createdOrder.subtotal),
          taxAmount: Number(createdOrder.taxAmount),
          deliveryFee: Number(createdOrder.deliveryFee),
          discountAmount: Number(createdOrder.discountAmount),
          totalAmount: Number(createdOrder.totalAmount),
          idempotencyKey: createdOrder.idempotencyKey,
          items: createdOrder.items.map((i) => ({
            id: i.id,
            orderId: i.orderId,
            menuItemId: i.menuItemId,
            itemNameSnapshot: i.itemNameSnapshot,
            unitPriceSnapshot: Number(i.unitPriceSnapshot),
            quantity: i.quantity,
            lineTotal: Number(i.lineTotal),
            createdAt: i.createdAt,
          })),
          payments: createdOrder.payments.map((p) => ({
            id: p.id,
            orderId: p.orderId,
            provider: p.provider,
            providerReference: p.providerReference,
            amount: Number(p.amount),
            currency: p.currency,
            status: p.status,
            notes: p.notes,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
          })),
          createdAt: createdOrder.createdAt,
          updatedAt: createdOrder.updatedAt,
        };
      } catch {
        // Fallback in-memory
      }
    }

    const orderId = `ord-${Date.now()}`;
    const orderItems: OrderItemRecord[] = verifiedItems.map((vi, index) => ({
      id: `item-snap-${orderId}-${index + 1}`,
      orderId,
      menuItemId: vi.menuItemId,
      itemNameSnapshot: vi.itemNameSnapshot,
      unitPriceSnapshot: vi.unitPriceSnapshot,
      quantity: vi.quantity,
      lineTotal: vi.lineTotal,
      createdAt: now,
    }));

    const payments: PaymentRecord[] = [
      {
        id: `pay-${orderId}`,
        orderId,
        provider: input.paymentMethod,
        providerReference:
          input.paymentMethod === 'TEST_ONLINE'
            ? `PAY-INIT-${Date.now()}`
            : `CASH-ORD-${orderNumber}`,
        amount: totalAmount,
        currency: 'INR',
        status: 'PENDING',
        notes:
          input.paymentMethod === 'TEST_ONLINE'
            ? 'Payment session initiated'
            : 'Pay at counter or on delivery',
        createdAt: now,
        updatedAt: now,
      },
    ];

    const newOrder: OrderRecord = {
      id: orderId,
      orderNumber,
      customerId: input.customerId || null,
      customerName: input.customerName.trim(),
      customerPhone: input.customerPhone.trim(),
      customerEmail: input.customerEmail?.trim() || null,
      fulfillmentType: input.fulfillmentType,
      deliveryAddress: input.deliveryAddress?.trim() || null,
      tableNumber: input.tableNumber?.trim() || null,
      notes: input.notes?.trim() || null,
      status: initialStatus,
      paymentStatus: initialPaymentStatus,
      subtotal,
      taxAmount,
      deliveryFee,
      discountAmount,
      totalAmount,
      idempotencyKey: input.idempotencyKey || null,
      items: orderItems,
      payments,
      createdAt: now,
      updatedAt: now,
    };

    store.orders.unshift(newOrder);
    return newOrder;
  }

  static async findByIdempotencyKey(key: string): Promise<OrderRecord | null> {
    if (await isDatabaseReachable()) {
      try {
        const order = await prisma.order.findUnique({
          where: { idempotencyKey: key },
          include: { items: true, payments: true },
        });
        if (order) {
          return {
            id: order.id,
            orderNumber: order.orderNumber,
            customerId: order.customerId,
            customerName: order.customerName,
            customerPhone: order.customerPhone,
            customerEmail: order.customerEmail,
            fulfillmentType: order.fulfillmentType,
            deliveryAddress: order.deliveryAddress,
            tableNumber: order.tableNumber,
            notes: order.notes,
            status: order.status,
            paymentStatus: order.paymentStatus,
            subtotal: Number(order.subtotal),
            taxAmount: Number(order.taxAmount),
            deliveryFee: Number(order.deliveryFee),
            discountAmount: Number(order.discountAmount),
            totalAmount: Number(order.totalAmount),
            idempotencyKey: order.idempotencyKey,
            items: order.items.map((i) => ({
              id: i.id,
              orderId: i.orderId,
              menuItemId: i.menuItemId,
              itemNameSnapshot: i.itemNameSnapshot,
              unitPriceSnapshot: Number(i.unitPriceSnapshot),
              quantity: i.quantity,
              lineTotal: Number(i.lineTotal),
              createdAt: i.createdAt,
            })),
            payments: order.payments.map((p) => ({
              id: p.id,
              orderId: p.orderId,
              provider: p.provider,
              providerReference: p.providerReference,
              amount: Number(p.amount),
              currency: p.currency,
              status: p.status,
              notes: p.notes,
              createdAt: p.createdAt,
              updatedAt: p.updatedAt,
            })),
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
          };
        }
      } catch {
        // Fallback
      }
    }

    const memOrder = store.orders.find((o) => o.idempotencyKey === key);
    return memOrder ?? null;
  }

  static async getOrderById(id: string): Promise<OrderRecord | null> {
    if (await isDatabaseReachable()) {
      try {
        const order = await prisma.order.findFirst({
          where: { OR: [{ id }, { orderNumber: id }] },
          include: { items: true, payments: true },
        });
        if (order) {
          return {
            id: order.id,
            orderNumber: order.orderNumber,
            customerId: order.customerId,
            customerName: order.customerName,
            customerPhone: order.customerPhone,
            customerEmail: order.customerEmail,
            fulfillmentType: order.fulfillmentType,
            deliveryAddress: order.deliveryAddress,
            tableNumber: order.tableNumber,
            notes: order.notes,
            status: order.status,
            paymentStatus: order.paymentStatus,
            subtotal: Number(order.subtotal),
            taxAmount: Number(order.taxAmount),
            deliveryFee: Number(order.deliveryFee),
            discountAmount: Number(order.discountAmount),
            totalAmount: Number(order.totalAmount),
            idempotencyKey: order.idempotencyKey,
            items: order.items.map((i) => ({
              id: i.id,
              orderId: i.orderId,
              menuItemId: i.menuItemId,
              itemNameSnapshot: i.itemNameSnapshot,
              unitPriceSnapshot: Number(i.unitPriceSnapshot),
              quantity: i.quantity,
              lineTotal: Number(i.lineTotal),
              createdAt: i.createdAt,
            })),
            payments: order.payments.map((p) => ({
              id: p.id,
              orderId: p.orderId,
              provider: p.provider,
              providerReference: p.providerReference,
              amount: Number(p.amount),
              currency: p.currency,
              status: p.status,
              notes: p.notes,
              createdAt: p.createdAt,
              updatedAt: p.updatedAt,
            })),
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
          };
        }
      } catch {
        // Fallback
      }
    }

    const mem = store.orders.find((o) => o.id === id || o.orderNumber === id);
    return mem ?? null;
  }

  static async getOrders(filter: { customerId?: string; status?: OrderStatus } = {}): Promise<OrderRecord[]> {
    if (await isDatabaseReachable()) {
      try {
        const where: any = {};
        if (filter.customerId) where.customerId = filter.customerId;
        if (filter.status) where.status = filter.status;

        const orders = await prisma.order.findMany({
          where,
          include: { items: true, payments: true },
          orderBy: { createdAt: 'desc' },
        });

        if (orders.length > 0) {
          return orders.map((order) => ({
            id: order.id,
            orderNumber: order.orderNumber,
            customerId: order.customerId,
            customerName: order.customerName,
            customerPhone: order.customerPhone,
            customerEmail: order.customerEmail,
            fulfillmentType: order.fulfillmentType,
            deliveryAddress: order.deliveryAddress,
            tableNumber: order.tableNumber,
            notes: order.notes,
            status: order.status,
            paymentStatus: order.paymentStatus,
            subtotal: Number(order.subtotal),
            taxAmount: Number(order.taxAmount),
            deliveryFee: Number(order.deliveryFee),
            discountAmount: Number(order.discountAmount),
            totalAmount: Number(order.totalAmount),
            idempotencyKey: order.idempotencyKey,
            items: order.items.map((i) => ({
              id: i.id,
              orderId: i.orderId,
              menuItemId: i.menuItemId,
              itemNameSnapshot: i.itemNameSnapshot,
              unitPriceSnapshot: Number(i.unitPriceSnapshot),
              quantity: i.quantity,
              lineTotal: Number(i.lineTotal),
              createdAt: i.createdAt,
            })),
            payments: order.payments.map((p) => ({
              id: p.id,
              orderId: p.orderId,
              provider: p.provider,
              providerReference: p.providerReference,
              amount: Number(p.amount),
              currency: p.currency,
              status: p.status,
              notes: p.notes,
              createdAt: p.createdAt,
              updatedAt: p.updatedAt,
            })),
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
          }));
        }
      } catch {
        // Fallback
      }
    }

    let results = [...store.orders];
    if (filter.customerId) {
      results = results.filter((o) => o.customerId === filter.customerId);
    }
    if (filter.status) {
      results = results.filter((o) => o.status === filter.status);
    }
    return results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // State Transition Engine with Role Checking
  static async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    userRole: Role
  ): Promise<OrderRecord> {
    const order = await this.getOrderById(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    const current = order.status;

    // Rules Matrix
    // 1. Terminal states cannot be casually changed
    if (current === 'COMPLETED' || current === 'CANCELLED' || current === 'REFUNDED') {
      throw new Error(`Cannot transition order from terminal state "${current}" to "${newStatus}"`);
    }

    // 2. Customer cancellation permissions
    if (userRole === 'CUSTOMER') {
      if (newStatus === 'CANCELLED') {
        if (current !== 'PLACED' && current !== 'PENDING_PAYMENT') {
          throw new Error('You can only cancel an order before the kitchen has started preparing it.');
        }
      } else {
        throw new Error('Customers cannot advance order kitchen preparation statuses.');
      }
    }

    // 3. Kitchen staff permissions
    if (userRole === 'KITCHEN') {
      const allowedNext: Record<OrderStatus, OrderStatus[]> = {
        PENDING_PAYMENT: [], // Kitchen cannot bypass payment
        PLACED: ['CONFIRMED', 'PREPARING', 'REJECTED'],
        CONFIRMED: ['PREPARING', 'REJECTED'],
        PREPARING: ['READY'],
        READY: ['COMPLETED'],
        COMPLETED: [],
        CANCELLED: [],
        PAYMENT_FAILED: [],
        REJECTED: [],
        REFUNDED: [],
      };

      if (!allowedNext[current]?.includes(newStatus)) {
        throw new Error(
          `Invalid kitchen status transition from "${current}" to "${newStatus}". Allowed: [${allowedNext[current]?.join(', ') || 'none'}]`
        );
      }
    }

    // Update in DB
    const now = new Date();
    if (await isDatabaseReachable()) {
      try {
        const updated = await prisma.order.update({
          where: { id: order.id },
          data: { status: newStatus },
          include: { items: true, payments: true },
        });
        return {
          id: updated.id,
          orderNumber: updated.orderNumber,
          customerId: updated.customerId,
          customerName: updated.customerName,
          customerPhone: updated.customerPhone,
          customerEmail: updated.customerEmail,
          fulfillmentType: updated.fulfillmentType,
          deliveryAddress: updated.deliveryAddress,
          tableNumber: updated.tableNumber,
          notes: updated.notes,
          status: updated.status,
          paymentStatus: updated.paymentStatus,
          subtotal: Number(updated.subtotal),
          taxAmount: Number(updated.taxAmount),
          deliveryFee: Number(updated.deliveryFee),
          discountAmount: Number(updated.discountAmount),
          totalAmount: Number(updated.totalAmount),
          idempotencyKey: updated.idempotencyKey,
          items: updated.items.map((i) => ({
            id: i.id,
            orderId: i.orderId,
            menuItemId: i.menuItemId,
            itemNameSnapshot: i.itemNameSnapshot,
            unitPriceSnapshot: Number(i.unitPriceSnapshot),
            quantity: i.quantity,
            lineTotal: Number(i.lineTotal),
            createdAt: i.createdAt,
          })),
          payments: updated.payments.map((p) => ({
            id: p.id,
            orderId: p.orderId,
            provider: p.provider,
            providerReference: p.providerReference,
            amount: Number(p.amount),
            currency: p.currency,
            status: p.status,
            notes: p.notes,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
          })),
          createdAt: updated.createdAt,
          updatedAt: updated.updatedAt,
        };
      } catch {
        // Fallback
      }
    }

    const mem = store.orders.find((o) => o.id === order.id);
    if (mem) {
      mem.status = newStatus;
      mem.updatedAt = now;
      return mem;
    }

    throw new Error('Failed to update order status');
  }

  // Update payment status (e.g. after successful test payment or cash confirmation)
  static async updatePaymentStatus(
    orderId: string,
    paymentStatus: PaymentStatus,
    providerRef?: string
  ): Promise<OrderRecord> {
    const order = await this.getOrderById(orderId);
    if (!order) throw new Error('Order not found');

    const nextOrderStatus: OrderStatus =
      paymentStatus === 'PAID' && order.status === 'PENDING_PAYMENT' ? 'PLACED' : order.status;

    if (await isDatabaseReachable()) {
      try {
        const updated = await prisma.order.update({
          where: { id: order.id },
          data: {
            paymentStatus,
            status: nextOrderStatus,
            payments: {
              updateMany: {
                where: { orderId: order.id },
                data: {
                  status: paymentStatus,
                  providerReference: providerRef || undefined,
                },
              },
            },
          },
          include: { items: true, payments: true },
        });
        return {
          ...updated,
          subtotal: Number(updated.subtotal),
          taxAmount: Number(updated.taxAmount),
          deliveryFee: Number(updated.deliveryFee),
          discountAmount: Number(updated.discountAmount),
          totalAmount: Number(updated.totalAmount),
          items: updated.items.map((i) => ({ ...i, unitPriceSnapshot: Number(i.unitPriceSnapshot), lineTotal: Number(i.lineTotal) })),
          payments: updated.payments.map((p) => ({ ...p, amount: Number(p.amount) })),
        };
      } catch {
        // Fallback
      }
    }

    const mem = store.orders.find((o) => o.id === order.id);
    if (mem) {
      mem.paymentStatus = paymentStatus;
      mem.status = nextOrderStatus;
      if (mem.payments.length > 0) {
        mem.payments[0].status = paymentStatus;
        if (providerRef) mem.payments[0].providerReference = providerRef;
      }
      mem.updatedAt = new Date();
      return mem;
    }

    throw new Error('Failed to update payment status');
  }
}
