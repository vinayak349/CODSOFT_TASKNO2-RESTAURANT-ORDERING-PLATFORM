'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  CalendarDays,
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Loader2,
  Armchair,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { AdminNav } from '@/components/layout/AdminNav';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ReservationRecord, RestaurantTableRecord, ReservationStatus } from '@/lib/db-store';

export default function AdminReservationsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [reservations, setReservations] = useState<ReservationRecord[]>([]);
  const [tables, setTables] = useState<RestaurantTableRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [resRes, tblRes] = await Promise.all([
        fetch('/api/reservations'),
        fetch('/api/reservations/tables'),
      ]);
      const resData = await resRes.json();
      const tblData = await tblRes.json();

      if (resData.success) setReservations(resData.reservations || []);
      if (tblData.success) setTables(tblData.tables || []);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'ADMIN') {
        router.push('/login');
        return;
      }
      loadData();
    }
  }, [user, authLoading, router]);

  const handleConfirmWithTable = async (resId: string, tableId: string) => {
    try {
      setUpdatingId(resId);
      const res = await fetch(`/api/reservations/${resId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableId }),
      });
      const data = await res.json();
      if (data.success) {
        await loadData();
      } else {
        alert(data.message || 'Cannot assign table');
      }
    } catch {
      alert('Error assigning table');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleUpdateStatus = async (resId: string, status: ReservationStatus) => {
    try {
      setUpdatingId(resId);
      const res = await fetch(`/api/reservations/${resId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        await loadData();
      } else {
        alert(data.message || 'Status update failed');
      }
    } catch {
      alert('Error updating status');
    } finally {
      setUpdatingId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 className="w-8 h-8 text-orange-600 animate-spin mx-auto" />
        <p className="text-sm text-stone-500">Loading reservations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
          <div>
            <h1 className="text-3xl font-serif font-bold text-stone-900">
              Table Reservation Management
            </h1>
            <p className="text-stone-500 text-xs sm:text-sm mt-1">
              Review guest bookings, assign dining tables, and enforce double-booking prevention.
            </p>
          </div>

          <button
            onClick={() => loadData()}
            className="p-2 border border-stone-200 rounded-xl hover:bg-stone-50 text-stone-600"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Reservations Table */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs text-stone-600">
            <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider font-semibold border-b border-stone-200">
              <tr>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Guest</th>
                <th className="py-3 px-4">Party Size</th>
                <th className="py-3 px-4">Table Assigned</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {reservations.map((res) => {
                const assignedTable = tables.find((t) => t.id === res.tableId);

                return (
                  <tr key={res.id} className="hover:bg-stone-50 transition">
                    <td className="py-3 px-4">
                      <span className="font-bold text-stone-900 block font-serif">
                        {res.reservationDate}
                      </span>
                      <span className="text-[11px] text-stone-400">
                        {res.startTime} to {res.endTime}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-stone-900 block">{res.guestName}</span>
                      <span className="text-[11px] text-stone-400">{res.guestPhone}</span>
                      {res.specialRequests && (
                        <span className="text-[10px] text-stone-500 block italic max-w-xs truncate">
                          &quot;{res.specialRequests}&quot;
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-bold text-stone-800">
                      {res.partySize} Guests
                    </td>
                    <td className="py-3 px-4">
                      {assignedTable ? (
                        <span className="font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                          {assignedTable.tableNumber} ({assignedTable.section})
                        </span>
                      ) : (
                        <select
                          disabled={updatingId === res.id || res.status === 'CANCELLED'}
                          onChange={(e) => {
                            if (e.target.value) handleConfirmWithTable(res.id, e.target.value);
                          }}
                          defaultValue=""
                          className="px-2 py-1 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                        >
                          <option value="" disabled>Assign Table...</option>
                          {tables
                            .filter((t) => t.capacity >= res.partySize)
                            .map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.tableNumber} ({t.capacity}p - {t.section})
                              </option>
                            ))}
                        </select>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={res.status} type="reservation" />
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5">
                      {res.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleUpdateStatus(res.id, 'COMPLETED')}
                          disabled={updatingId === res.id}
                          className="px-2.5 py-1 bg-stone-900 text-white rounded-lg text-[11px] font-semibold hover:bg-stone-800"
                        >
                          Seated / Done
                        </button>
                      )}

                      {res.status === 'PENDING' && (
                        <button
                          onClick={() => handleUpdateStatus(res.id, 'REJECTED')}
                          disabled={updatingId === res.id}
                          className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-semibold hover:bg-rose-100"
                        >
                          Reject
                        </button>
                      )}

                      {['PENDING', 'CONFIRMED'].includes(res.status) && (
                        <button
                          onClick={() => handleUpdateStatus(res.id, 'CANCELLED')}
                          disabled={updatingId === res.id}
                          className="px-2.5 py-1 text-stone-400 hover:text-rose-600 rounded-lg text-[11px]"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
