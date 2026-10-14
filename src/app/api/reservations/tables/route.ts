import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { ReservationService } from '@/services/reservation.service';

export async function GET() {
  try {
    const tables = await ReservationService.getTables(false);
    return NextResponse.json({ success: true, tables });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch tables' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireRole(['ADMIN']);
    const body = await request.json();

    if (!body.tableNumber || !body.capacity) {
      return NextResponse.json(
        { success: false, message: 'Table number and capacity are required' },
        { status: 400 }
      );
    }

    const table = await ReservationService.createTable({
      tableNumber: body.tableNumber,
      capacity: Number(body.capacity),
      section: body.section,
    });

    return NextResponse.json({ success: true, table }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to create table' },
      { status: 400 }
    );
  }
}
