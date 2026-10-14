import { prisma, isDatabaseReachable } from '@/lib/prisma';
import { store, RestaurantSettingsRecord } from '@/lib/db-store';
import { OrderService } from '@/services/order.service';
import { ReservationService } from '@/services/reservation.service';
import { MenuService } from '@/services/menu.service';

export interface DashboardStats {
  totalRevenue: number;
  todayRevenue: number;
  totalOrders: number;
  activeOrdersCount: number;
  pendingReservationsCount: number;
  todayReservationsCount: number;
  totalMenuItems: number;
  totalTables: number;
  recentOrders: any[];
  topSellingItems: { name: string; count: number; revenue: number }[];
}

export class AnalyticsService {
  static async getDashboardStats(): Promise<DashboardStats> {
    const orders = await OrderService.getOrders();
    const reservations = await ReservationService.getReservations();
    const menuItems = await MenuService.getMenuItems();
    const tables = await ReservationService.getTables(false);

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    let totalRevenue = 0;
    let todayRevenue = 0;
    let activeOrdersCount = 0;

    const itemSalesMap = new Map<string, { name: string; count: number; revenue: number }>();

    for (const order of orders) {
      if (order.paymentStatus === 'PAID') {
        totalRevenue += order.totalAmount;

        const orderDateStr = new Date(order.createdAt).toISOString().split('T')[0];
        if (orderDateStr === todayStr) {
          todayRevenue += order.totalAmount;
        }
      }

      if (['PLACED', 'CONFIRMED', 'PREPARING', 'READY'].includes(order.status)) {
        activeOrdersCount++;
      }

      // Tally items
      for (const item of order.items) {
        const existing = itemSalesMap.get(item.itemNameSnapshot) || {
          name: item.itemNameSnapshot,
          count: 0,
          revenue: 0,
        };
        existing.count += item.quantity;
        existing.revenue += item.lineTotal;
        itemSalesMap.set(item.itemNameSnapshot, existing);
      }
    }

    const pendingReservationsCount = reservations.filter((r) => r.status === 'PENDING').length;
    const todayReservationsCount = reservations.filter((r) => r.reservationDate === todayStr).length;

    const topSellingItems = Array.from(itemSalesMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalRevenue: Number(totalRevenue.toFixed(2)),
      todayRevenue: Number(todayRevenue.toFixed(2)),
      totalOrders: orders.length,
      activeOrdersCount,
      pendingReservationsCount,
      todayReservationsCount,
      totalMenuItems: menuItems.length,
      totalTables: tables.length,
      recentOrders: orders.slice(0, 8),
      topSellingItems,
    };
  }

  static async getSettings(): Promise<RestaurantSettingsRecord> {
    if (await isDatabaseReachable()) {
      try {
        const s = await prisma.restaurantSettings.findUnique({
          where: { id: 'singleton' },
        });
        if (s) {
          return {
            id: s.id,
            restaurantName: s.restaurantName,
            tagline: s.tagline,
            address: s.address,
            phone: s.phone,
            email: s.email,
            currency: s.currency,
            currencySymbol: s.currencySymbol,
            timezone: s.timezone,
            openingTime: s.openingTime,
            closingTime: s.closingTime,
            reservationDurationMins: s.reservationDurationMins,
            taxRatePercent: Number(s.taxRatePercent),
            deliveryFeeAmount: Number(s.deliveryFeeAmount),
            createdAt: s.createdAt,
            updatedAt: s.updatedAt,
          };
        }
      } catch {
        // Fallback
      }
    }
    return store.settings;
  }

  static async updateSettings(data: Partial<RestaurantSettingsRecord>): Promise<RestaurantSettingsRecord> {
    if (await isDatabaseReachable()) {
      try {
        const updated = await prisma.restaurantSettings.upsert({
          where: { id: 'singleton' },
          create: {
            id: 'singleton',
            restaurantName: data.restaurantName || store.settings.restaurantName,
            tagline: data.tagline || store.settings.tagline,
            address: data.address || store.settings.address,
            phone: data.phone || store.settings.phone,
            email: data.email || store.settings.email,
            currency: data.currency || store.settings.currency,
            currencySymbol: data.currencySymbol || store.settings.currencySymbol,
            timezone: data.timezone || store.settings.timezone,
            openingTime: data.openingTime || store.settings.openingTime,
            closingTime: data.closingTime || store.settings.closingTime,
            reservationDurationMins: data.reservationDurationMins || store.settings.reservationDurationMins,
            taxRatePercent: data.taxRatePercent || store.settings.taxRatePercent,
            deliveryFeeAmount: data.deliveryFeeAmount || store.settings.deliveryFeeAmount,
          },
          update: {
            ...data,
            updatedAt: new Date(),
          },
        });
        return {
          ...updated,
          taxRatePercent: Number(updated.taxRatePercent),
          deliveryFeeAmount: Number(updated.deliveryFeeAmount),
        };
      } catch {
        // Fallback
      }
    }

    Object.assign(store.settings, data, { updatedAt: new Date() });
    return store.settings;
  }
}
