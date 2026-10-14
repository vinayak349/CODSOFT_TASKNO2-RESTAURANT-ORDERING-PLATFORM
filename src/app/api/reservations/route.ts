import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { ReservationService, CreateReservationInput } from '@/services/reservation.service';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const body: CreateReservationInput = await request.json();

    if (!body.guestName || !body.guestPhone || !body.reservationDate || !body.startTime || !body.partySize) {
      return NextResponse.json(
        { success: false, message: 'Please provide guest name, phone, date, time, and party size.' },
        { status: 400 }
      );
    }

    const reservation = await ReservationService.createReservation({
      ...body,
      customerId: user ? user.id : body.customerId,
    });

    return NextResponse.json(
      { success: true, reservation, message: 'Table reservation submitted successfully' },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to submit reservation' },
      { status: 400 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || undefined;
    const status = (searchParams.get('status') as any) || undefined;

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    if (user.role === 'CUSTOMER') {
      const reservations = await ReservationService.getReservations({
        customerId: user.id,
        reservationDate: date,
        status,
      });
      return NextResponse.json({ success: true, reservations });
    }

    // Admin / Staff
    const reservations = await ReservationService.getReservations({
      reservationDate: date,
      status,
    });
    return NextResponse.json({ success: true, reservations });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch reservations' },
      { status: 500 }
    );
  }
}
