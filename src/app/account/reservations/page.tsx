'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CalendarDays,
  Clock,
  Users,
  ChevronRight,
  Loader2,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ReservationRecord } from '@/lib/db-store';

export default function CustomerReservationsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [reservations, setReservations] = useState<ReservationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const loadReservations = async () => {
    try {
      const res = await fetch('/api/reservations');
      const data = await res.json();
      if (data.success) {
        setReservations(data.reservations || []);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      loadReservations();
    }
  }, [user, authLoading, router]);

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this reservation?')) return;
    try {
      setCancellingId(id);
      const res = await fetch(`/api/reservations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });
      const data = await res.json();
      if (data.success) {
        loadReservations();
      } else {
        alert(data.message || 'Failed to cancel reservation');
      }
    } catch {
      alert('Error cancelling reservation');
    } finally {
      setCancellingId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 className="w-8 h-8 text-orange-600 animate-spin mx-auto" />
        <p className="text-sm text-stone-500">Retrieving your table reservations...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-xs font-medium text-stone-500">
        <Link href="/account" className="hover:text-stone-900 transition">
          Account
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-stone-900 font-semibold">Reservations</span>
      </div>

      <div className="flex items-center justify-between pb-6 border-b border-stone-200">
        <div>
          <h1 className="text-3xl font-serif font-bold text-stone-900">
            My Table Reservations
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Review your upcoming bookings or make adjustments.
          </p>
        </div>
        <Link
          href="/reservations"
          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs rounded-xl transition shadow-sm"
        >
          Book New Table
        </Link>
      </div>

      {reservations.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-stone-100 text-stone-400 mx-auto flex items-center justify-center">
            <CalendarDays className="w-8 h-8" />
          </div>
          <h3 className="font-serif font-bold text-lg text-stone-900">
            No Bookings Found
          </h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            Ready to dine with us? Reserve a table in our Main Dining, Balcony Deck, or Garden Patio.
          </p>
          <Link
            href="/reservations"
            className="inline-block px-5 py-2.5 bg-stone-900 text-white font-semibold text-xs rounded-xl hover:bg-orange-600 transition"
          >
            Reserve a Table
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reservations.map((res) => (
            <div
              key={res.id}
              className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                <div className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-serif font-bold text-lg text-stone-900">
                      {res.reservationDate}
                    </h3>
                    <StatusBadge status={res.status} type="reservation" />
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-stone-500">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-orange-600" />
                      <span>{res.startTime} to {res.endTime}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Users className="w-3.5 h-3.5 text-orange-600" />
                      <span>{res.partySize} Guests</span>
                    </span>
                  </div>
                </div>

                {['PENDING', 'CONFIRMED'].includes(res.status) && (
                  <button
                    onClick={() => handleCancel(res.id)}
                    disabled={cancellingId === res.id}
                    className="px-3 py-1.5 border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-semibold rounded-lg transition"
                  >
                    {cancellingId === res.id ? 'Cancelling...' : 'Cancel Booking'}
                  </button>
                )}
              </div>

              {res.specialRequests && (
                <div className="text-xs text-stone-600 bg-stone-50 p-3 rounded-xl">
                  <strong>Special Requests:</strong> &quot;{res.specialRequests}&quot;
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
