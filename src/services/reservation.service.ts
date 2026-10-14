import { prisma, isDatabaseReachable } from '@/lib/prisma';
import {
  store,
  ReservationRecord,
  RestaurantTableRecord,
  ReservationStatus,
  Role,
} from '@/lib/db-store';

export interface CreateReservationInput {
  customerId?: string | null;
  guestName: string;
  guestPhone: string;
  guestEmail?: string | null;
  reservationDate: string; // "YYYY-MM-DD"
  startTime: string; // "HH:MM" e.g. "19:00"
  partySize: number;
  specialRequests?: string | null;
  tableId?: string | null;
}

export class ReservationService {
  // Convert "HH:MM" string to minutes from midnight
  static timeToMinutes(timeStr: string): number {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  }

  // Convert minutes from midnight back to "HH:MM"
  static minutesToTime(mins: number): string {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  // Check if two time intervals overlap: [startA, endA) and [startB, endB)
  static doTimesOverlap(startA: string, endA: string, startB: string, endB: string): boolean {
    const sA = this.timeToMinutes(startA);
    const eA = this.timeToMinutes(endA);
    const sB = this.timeToMinutes(startB);
    const eB = this.timeToMinutes(endB);

    return Math.max(sA, sB) < Math.min(eA, eB);
  }

  // Tables
  static async getTables(onlyActive = true): Promise<RestaurantTableRecord[]> {
    if (await isDatabaseReachable()) {
      try {
        const dbTables = await prisma.restaurantTable.findMany({
          where: onlyActive ? { isActive: true } : undefined,
          orderBy: { tableNumber: 'asc' },
        });
        if (dbTables.length > 0) {
          return dbTables.map((t) => ({
            id: t.id,
            tableNumber: t.tableNumber,
            capacity: t.capacity,
            isActive: t.isActive,
            section: t.section,
            createdAt: t.createdAt,
            updatedAt: t.updatedAt,
          }));
        }
      } catch {
        // Fallback
      }
    }

    let tables = [...store.tables];
    if (onlyActive) tables = tables.filter((t) => t.isActive);
    return tables.sort((a, b) => a.tableNumber.localeCompare(b.tableNumber));
  }

  static async getTableById(id: string): Promise<RestaurantTableRecord | null> {
    if (await isDatabaseReachable()) {
      try {
        const t = await prisma.restaurantTable.findUnique({ where: { id } });
        if (t) return t;
      } catch {
        // Fallback
      }
    }
    const mem = store.tables.find((t) => t.id === id);
    return mem ?? null;
  }

  // Check table availability for a specific date and time slot
  static async isTableAvailable(
    tableId: string,
    reservationDate: string,
    startTime: string,
    endTime: string,
    excludeReservationId?: string
  ): Promise<boolean> {
    const existing = await this.getReservations({
      reservationDate,
      tableId,
      status: 'CONFIRMED',
    });

    for (const res of existing) {
      if (excludeReservationId && res.id === excludeReservationId) continue;
      if (this.doTimesOverlap(startTime, endTime, res.startTime, res.endTime)) {
        return false; // Confirmed booking overlaps!
      }
    }
    return true;
  }

  // Find a suitable available table for date, time, and party size
  static async findAvailableTable(
    reservationDate: string,
    startTime: string,
    endTime: string,
    partySize: number
  ): Promise<RestaurantTableRecord | null> {
    const activeTables = await this.getTables(true);
    // Filter by capacity >= partySize, sorted by smallest fitting capacity first
    const eligible = activeTables
      .filter((t) => t.capacity >= partySize)
      .sort((a, b) => a.capacity - b.capacity);

    for (const table of eligible) {
      const available = await this.isTableAvailable(table.id, reservationDate, startTime, endTime);
      if (available) return table;
    }

    return null;
  }

  // Submit Reservation
  static async createReservation(input: CreateReservationInput): Promise<ReservationRecord> {
    if (input.partySize < 1 || input.partySize > 20) {
      throw new Error('Party size must be between 1 and 20 guests.');
    }

    // Operating hours check (11:00 to 23:00)
    const startMins = this.timeToMinutes(input.startTime);
    const openMins = this.timeToMinutes('11:00');
    const closeMins = this.timeToMinutes('23:00');
    const duration = 90; // 90 mins standard seating
    const endMins = startMins + duration;

    if (startMins < openMins || endMins > closeMins) {
      throw new Error('Reservations are only accepted between 11:00 AM and 11:00 PM.');
    }

    const endTime = this.minutesToTime(endMins);

    // If a specific table was requested, check availability
    let assignedTableId: string | null = null;
    let initialStatus: ReservationStatus = 'PENDING';

    if (input.tableId) {
      const table = await this.getTableById(input.tableId);
      if (!table || !table.isActive) {
        throw new Error('Selected table is not currently active or found.');
      }
      if (table.capacity < input.partySize) {
        throw new Error(`Table ${table.tableNumber} (capacity: ${table.capacity}) is too small for ${input.partySize} guests.`);
      }
      const available = await this.isTableAvailable(table.id, input.reservationDate, input.startTime, endTime);
      if (!available) {
        throw new Error(`Table ${table.tableNumber} is already booked for this time slot.`);
      }
      assignedTableId = table.id;
      initialStatus = 'CONFIRMED';
    } else {
      // Auto-assign table if available
      const autoTable = await this.findAvailableTable(input.reservationDate, input.startTime, endTime, input.partySize);
      if (autoTable) {
        assignedTableId = autoTable.id;
        initialStatus = 'CONFIRMED';
      }
    }

    const now = new Date();

    if (await isDatabaseReachable()) {
      try {
        const created = await prisma.reservation.create({
          data: {
            customerId: input.customerId || null,
            guestName: input.guestName.trim(),
            guestPhone: input.guestPhone.trim(),
            guestEmail: input.guestEmail?.trim() || null,
            reservationDate: new Date(input.reservationDate),
            startTime: input.startTime,
            endTime,
            partySize: input.partySize,
            tableId: assignedTableId,
            status: initialStatus,
            specialRequests: input.specialRequests?.trim() || null,
          },
        });

        return {
          id: created.id,
          customerId: created.customerId,
          guestName: created.guestName,
          guestPhone: created.guestPhone,
          guestEmail: created.guestEmail,
          reservationDate: input.reservationDate,
          startTime: created.startTime,
          endTime: created.endTime,
          partySize: created.partySize,
          tableId: created.tableId,
          status: created.status,
          specialRequests: created.specialRequests,
          createdAt: created.createdAt,
          updatedAt: created.updatedAt,
        };
      } catch {
        // Fallback
      }
    }

    const resId = `res-${Date.now()}`;
    const newReservation: ReservationRecord = {
      id: resId,
      customerId: input.customerId || null,
      guestName: input.guestName.trim(),
      guestPhone: input.guestPhone.trim(),
      guestEmail: input.guestEmail?.trim() || null,
      reservationDate: input.reservationDate,
      startTime: input.startTime,
      endTime,
      partySize: input.partySize,
      tableId: assignedTableId,
      status: initialStatus,
      specialRequests: input.specialRequests?.trim() || null,
      createdAt: now,
      updatedAt: now,
    };

    store.reservations.unshift(newReservation);
    return newReservation;
  }

  // Get Reservations with Filtering
  static async getReservations(filter: {
    customerId?: string;
    reservationDate?: string;
    tableId?: string;
    status?: ReservationStatus;
  } = {}): Promise<ReservationRecord[]> {
    if (await isDatabaseReachable()) {
      try {
        const where: any = {};
        if (filter.customerId) where.customerId = filter.customerId;
        if (filter.tableId) where.tableId = filter.tableId;
        if (filter.status) where.status = filter.status;
        if (filter.reservationDate) {
          where.reservationDate = new Date(filter.reservationDate);
        }

        const list = await prisma.reservation.findMany({
          where,
          orderBy: [{ reservationDate: 'asc' }, { startTime: 'asc' }],
        });

        if (list.length > 0) {
          return list.map((r) => ({
            id: r.id,
            customerId: r.customerId,
            guestName: r.guestName,
            guestPhone: r.guestPhone,
            guestEmail: r.guestEmail,
            reservationDate: r.reservationDate.toISOString().split('T')[0],
            startTime: r.startTime,
            endTime: r.endTime,
            partySize: r.partySize,
            tableId: r.tableId,
            status: r.status,
            specialRequests: r.specialRequests,
            createdAt: r.createdAt,
            updatedAt: r.updatedAt,
          }));
        }
      } catch {
        // Fallback
      }
    }

    let results = [...store.reservations];
    if (filter.customerId) results = results.filter((r) => r.customerId === filter.customerId);
    if (filter.tableId) results = results.filter((r) => r.tableId === filter.tableId);
    if (filter.status) results = results.filter((r) => r.status === filter.status);
    if (filter.reservationDate) results = results.filter((r) => r.reservationDate === filter.reservationDate);

    return results;
  }

  static async getReservationById(id: string): Promise<ReservationRecord | null> {
    if (await isDatabaseReachable()) {
      try {
        const r = await prisma.reservation.findUnique({ where: { id } });
        if (r) {
          return {
            id: r.id,
            customerId: r.customerId,
            guestName: r.guestName,
            guestPhone: r.guestPhone,
            guestEmail: r.guestEmail,
            reservationDate: r.reservationDate.toISOString().split('T')[0],
            startTime: r.startTime,
            endTime: r.endTime,
            partySize: r.partySize,
            tableId: r.tableId,
            status: r.status,
            specialRequests: r.specialRequests,
            createdAt: r.createdAt,
            updatedAt: r.updatedAt,
          };
        }
      } catch {
        // Fallback
      }
    }
    const mem = store.reservations.find((r) => r.id === id);
    return mem ?? null;
  }

  // Confirm reservation with table assignment and overlap verification
  static async confirmReservation(reservationId: string, tableId: string): Promise<ReservationRecord> {
    const res = await this.getReservationById(reservationId);
    if (!res) throw new Error('Reservation not found');

    const table = await this.getTableById(tableId);
    if (!table) throw new Error('Selected table not found');

    if (table.capacity < res.partySize) {
      throw new Error(`Table ${table.tableNumber} (capacity ${table.capacity}) is smaller than party size (${res.partySize}).`);
    }

    // Overlap prevention
    const available = await this.isTableAvailable(tableId, res.reservationDate, res.startTime, res.endTime, res.id);
    if (!available) {
      throw new Error(`Double-booking prevented: Table ${table.tableNumber} is already confirmed for another booking during this time.`);
    }

    if (await isDatabaseReachable()) {
      try {
        const updated = await prisma.reservation.update({
          where: { id: reservationId },
          data: { tableId, status: 'CONFIRMED' },
        });
        return {
          ...updated,
          reservationDate: updated.reservationDate.toISOString().split('T')[0],
        };
      } catch {
        // Fallback
      }
    }

    const mem = store.reservations.find((r) => r.id === reservationId);
    if (mem) {
      mem.tableId = tableId;
      mem.status = 'CONFIRMED';
      mem.updatedAt = new Date();
      return mem;
    }

    throw new Error('Failed to confirm reservation');
  }

  // Update status (REJECTED, CANCELLED, COMPLETED, NO_SHOW)
  static async updateStatus(
    reservationId: string,
    newStatus: ReservationStatus,
    userRole: Role,
    userId?: string
  ): Promise<ReservationRecord> {
    const res = await this.getReservationById(reservationId);
    if (!res) throw new Error('Reservation not found');

    if (userRole === 'CUSTOMER') {
      if (res.customerId && res.customerId !== userId) {
        throw new Error('You cannot cancel another customer\'s reservation.');
      }
      if (newStatus !== 'CANCELLED') {
        throw new Error('Customers can only cancel their reservations.');
      }
    }

    if (await isDatabaseReachable()) {
      try {
        const updated = await prisma.reservation.update({
          where: { id: reservationId },
          data: { status: newStatus },
        });
        return {
          ...updated,
          reservationDate: updated.reservationDate.toISOString().split('T')[0],
        };
      } catch {
        // Fallback
      }
    }

    const mem = store.reservations.find((r) => r.id === reservationId);
    if (mem) {
      mem.status = newStatus;
      mem.updatedAt = new Date();
      return mem;
    }

    throw new Error('Failed to update reservation');
  }

  // Create Table (Admin)
  static async createTable(data: { tableNumber: string; capacity: number; section?: string }): Promise<RestaurantTableRecord> {
    const now = new Date();
    if (await isDatabaseReachable()) {
      try {
        const created = await prisma.restaurantTable.create({
          data: {
            tableNumber: data.tableNumber.trim().toUpperCase(),
            capacity: data.capacity,
            section: data.section?.trim() || 'Main Dining',
            isActive: true,
          },
        });
        return created;
      } catch {
        // Fallback
      }
    }

    const newTable: RestaurantTableRecord = {
      id: `tbl-${Date.now()}`,
      tableNumber: data.tableNumber.trim().toUpperCase(),
      capacity: data.capacity,
      section: data.section?.trim() || 'Main Dining',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    store.tables.push(newTable);
    return newTable;
  }
}
