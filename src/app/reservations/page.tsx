'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CalendarDays,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  MapPin,
  UtensilsCrossed,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { RestaurantTableRecord } from '@/lib/db-store';

export default function ReservationsPage() {
  const { user } = useAuth();

  // Form Fields
  const [guestName, setGuestName] = useState(user?.name || '');
  const [guestPhone, setGuestPhone] = useState(user?.phone || '');
  const [guestEmail, setGuestEmail] = useState(user?.email || '');
  const [reservationDate, setReservationDate] = useState('2026-10-15');
  const [startTime, setStartTime] = useState('19:00');
  const [partySize, setPartySize] = useState(2);
  const [specialRequests, setSpecialRequests] = useState('');
  const [selectedTableId, setSelectedTableId] = useState<string>('');

  const [tables, setTables] = useState<RestaurantTableRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedReservation, setConfirmedReservation] = useState<any | null>(null);

  // Available Time Slots between 11:00 AM and 21:30 PM (restaurant closes 23:00)
  const timeSlots = [
    '11:30', '12:00', '12:30', '13:00', '13:30', '14:00',
    '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'
  ];

  // Fetch available tables
  useEffect(() => {
    async function loadTables() {
      try {
        const res = await fetch('/api/reservations/tables');
        const data = await res.json();
        if (data.success) {
          setTables(data.tables);
        }
      } catch {
        // Ignore
      }
    }
    loadTables();
  }, []);

  useEffect(() => {
    if (user) {
      if (!guestName) setGuestName(user.name);
      if (!guestPhone && user.phone) setGuestPhone(user.phone);
      if (!guestEmail) setGuestEmail(user.email);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        guestName: guestName.trim(),
        guestPhone: guestPhone.trim(),
        guestEmail: guestEmail.trim() || null,
        reservationDate,
        startTime,
        partySize: Number(partySize),
        specialRequests: specialRequests.trim() || null,
        tableId: selectedTableId || null,
      };

      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to submit reservation.');
      }

      setConfirmedReservation(data.reservation);
    } catch (err: any) {
      setError(err.message || 'Failed to complete reservation. Please try another time slot.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold text-orange-600 uppercase tracking-widest block">
          Table Experience
        </span>
        <h1 className="text-4xl font-serif font-bold text-stone-900">
          Reserve a Table
        </h1>
        <p className="text-stone-500 text-sm leading-relaxed">
          Book your private dining table, outdoor patio booth, or family salon with instant server confirmation and double-booking protection.
        </p>
      </div>

      {confirmedReservation ? (
        /* Confirmation State */
        <div className="max-w-2xl mx-auto bg-white p-8 sm:p-12 rounded-3xl border border-stone-200 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest block">
              Reservation Confirmed
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
              We look forward to hosting you, {confirmedReservation.guestName}!
            </h2>
          </div>

          <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
            <div>
              <span className="text-[11px] text-stone-400 block font-medium uppercase">Date</span>
              <span className="text-sm font-bold text-stone-900">{confirmedReservation.reservationDate}</span>
            </div>
            <div>
              <span className="text-[11px] text-stone-400 block font-medium uppercase">Seating Time</span>
              <span className="text-sm font-bold text-stone-900">
                {confirmedReservation.startTime} – {confirmedReservation.endTime}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-stone-400 block font-medium uppercase">Guests</span>
              <span className="text-sm font-bold text-stone-900">{confirmedReservation.partySize} Guests</span>
            </div>
            <div>
              <span className="text-[11px] text-stone-400 block font-medium uppercase">Status</span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {confirmedReservation.status}
              </span>
            </div>
          </div>

          <p className="text-xs text-stone-500">
            A confirmation has been recorded in our reservation log. Please arrive 10 minutes prior to your seating time.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/account/reservations"
              className="w-full sm:w-auto px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs rounded-xl transition"
            >
              View in My Reservations
            </Link>
            <button
              onClick={() => setConfirmedReservation(null)}
              className="w-full sm:w-auto px-6 py-3 border border-stone-200 text-stone-700 font-semibold text-xs rounded-xl hover:bg-stone-50 transition"
            >
              Book Another Table
            </button>
          </div>
        </div>
      ) : (
        /* Reservation Form */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 bg-white p-6 sm:p-10 rounded-3xl border border-stone-200 shadow-sm space-y-8">
            {error && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs sm:text-sm flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Reservation Conflict or Notice</span>
                  <span>{error}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Party & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center space-x-1">
                    <Users className="w-3.5 h-3.5 text-orange-600" />
                    <span>Party Size *</span>
                  </label>
                  <select
                    value={partySize}
                    onChange={(e) => setPartySize(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 16, 20].map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? 'Guest' : 'Guests'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center space-x-1">
                    <CalendarDays className="w-3.5 h-3.5 text-orange-600" />
                    <span>Reservation Date *</span>
                  </label>
                  <input
                    type="date"
                    min="2026-01-01"
                    value={reservationDate}
                    onChange={(e) => setReservationDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-orange-600" />
                    <span>Select Time Slot *</span>
                  </label>
                  <select
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-mono"
                  >
                    {timeSlots.map((time) => (
                      <option key={time} value={time}>
                        {time} (90 mins seating)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Step 2: Preferred Table / Section (Optional) */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center justify-between">
                  <span>Preferred Dining Section / Table (Optional)</span>
                  <span className="text-[11px] text-stone-400 font-normal">
                    Or leave unselected for automated optimal table assignment
                  </span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedTableId('')}
                    className={`p-3 rounded-xl border text-center transition ${
                      selectedTableId === ''
                        ? 'border-orange-600 bg-orange-50 text-orange-950 font-bold'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <span className="block text-xs">Auto Assign</span>
                    <span className="block text-[10px] text-stone-400">Best Available</span>
                  </button>

                  {tables.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTableId(t.id)}
                      className={`p-3 rounded-xl border text-center transition ${
                        selectedTableId === t.id
                          ? 'border-orange-600 bg-orange-50 text-orange-950 font-bold'
                          : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                      }`}
                    >
                      <span className="block text-xs font-bold">{t.tableNumber}</span>
                      <span className="block text-[10px] text-stone-500">
                        {t.section} • {t.capacity}p
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3: Guest Contact Information */}
              <div className="pt-4 border-t border-stone-100 space-y-4">
                <h3 className="font-serif font-bold text-base text-stone-900">
                  Guest Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Guest Name *
                    </label>
                    <input
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="e.g. Aarav Patel"
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Contact Phone *
                    </label>
                    <input
                      type="tel"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      placeholder="+91 98765 11223"
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Email Address (for calendar invite & confirmation)
                    </label>
                    <input
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="aarav@example.com"
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Special Requests / Occasion Details
                    </label>
                    <textarea
                      rows={2}
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      placeholder="e.g. Anniversary dinner, high chair needed, prefer quiet corner table"
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-orange-600 hover:bg-orange-700 disabled:bg-stone-300 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-orange-600/30 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Table Capacity & Booking...</span>
                  </>
                ) : (
                  <>
                    <UtensilsCrossed className="w-4 h-4" />
                    <span>Confirm Table Reservation</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: Reservation Policies & Ambiance */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-stone-900 text-white p-6 sm:p-8 rounded-3xl space-y-6">
              <span className="text-xs font-bold text-orange-400 uppercase tracking-widest block">
                Dining Policy
              </span>
              <h3 className="text-xl font-serif font-bold">
                Reservation Guidelines
              </h3>
              <ul className="space-y-4 text-xs text-stone-300 leading-relaxed">
                <li className="flex items-start space-x-3">
                  <Clock className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                  <span>
                    <strong>Grace Period:</strong> Tables are held for up to 15 minutes past your reserved time before being released.
                  </span>
                </li>
                <li className="flex items-start space-x-3">
                  <Sparkles className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                  <span>
                    <strong>Duration:</strong> Standard dining duration is allocated for 90 minutes to ensure every guest enjoys optimal service.
                  </span>
                </li>
                <li className="flex items-start space-x-3">
                  <Users className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                  <span>
                    <strong>Large Parties:</strong> For celebrations of more than 8 guests, please reach out to our concierge for custom banquet menus.
                  </span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-stone-200 space-y-3 text-xs text-stone-600">
              <h4 className="font-serif font-bold text-sm text-stone-900">
                Need Assistance?
              </h4>
              <p>
                Reach our hospitality desk directly at <strong>+91 98765 43210</strong> for immediate seating or dietary requests.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
