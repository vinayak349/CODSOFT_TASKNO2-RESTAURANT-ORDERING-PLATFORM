import { NextResponse } from 'next/server';
import { requireAuth, getCurrentUser } from '@/lib/auth';
import { ReservationService } from '@/services/reservation.service';

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const reservation = await ReservationService.getReservationById(params.id);

    if (!reservation) {
      return NextResponse.json(
        { success: false, message: 'Reservation not found' },
        { status: 404 }
      );
    }

    const user = await getCurrentUser();
    if (user && user.role === 'CUSTOMER' && reservation.customerId && reservation.customerId !== user.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, reservation });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch reservation' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const params = await props.params;
    const body = await request.json();

    if (body.tableId && user.role === 'ADMIN') {
      const updated = await ReservationService.confirmReservation(params.id, body.tableId);
      return NextResponse.json({ success: true, reservation: updated, message: 'Reservation confirmed' });
    }

    if (body.status) {
      const updated = await ReservationService.updateStatus(params.id, body.status, user.role, user.id);
      return NextResponse.json({ success: true, reservation: updated, message: `Reservation marked as ${body.status}` });
    }

    return NextResponse.json({ success: false, message: 'No valid action provided' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update reservation' },
      { status: 400 }
    );
  }
}
