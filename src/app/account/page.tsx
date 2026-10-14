'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  ShoppingBag,
  CalendarDays,
  Clock,
  ArrowRight,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Phone,
  Mail,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { OrderRecord, ReservationRecord } from '@/lib/db-store';

export default function AccountOverviewPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();

  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [reservations, setReservations] = useState<ReservationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      async function loadUserData() {
        try {
          const [orderRes, resRes] = await Promise.all([
            fetch('/api/orders'),
            fetch('/api/reservations'),
          ]);
          const orderData = await orderRes.json();
          const resData = await resRes.json();

          if (orderData.success) setOrders(orderData.orders || []);
          if (resData.success) setReservations(resData.reservations || []);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
      loadUserData();
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 className="w-8 h-8 text-orange-600 animate-spin mx-auto" />
        <p className="text-sm text-stone-500">Loading your profile details...</p>
      </div>
    );
  }

  if (!user) return null;

  const recentOrders = orders.slice(0, 3);
  const upcomingReservations = reservations.slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Profile Header */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-stone-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center space-x-5">
          <div className="w-16 h-16 rounded-2xl bg-orange-600 text-white flex items-center justify-center font-serif text-2xl font-bold shadow-md shadow-orange-600/20">
            {user.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-serif font-bold text-stone-900">
                {user.name}
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-700 border border-stone-200">
                {user.role}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500 mt-1">
              <span className="flex items-center space-x-1">
                <Mail className="w-3.5 h-3.5 text-stone-400" />
                <span>{user.email}</span>
              </span>
              {user.phone && (
                <span className="flex items-center space-x-1">
                  <Phone className="w-3.5 h-3.5 text-stone-400" />
                  <span>{user.phone}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={() => logout()}
          className="px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition flex items-center space-x-1.5"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <div className="flex items-center space-x-2.5">
              <ShoppingBag className="w-5 h-5 text-orange-600" />
              <h2 className="font-serif font-bold text-lg text-stone-900">
                Recent Orders
              </h2>
            </div>
            <Link
              href="/account/orders"
              className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center space-x-1"
            >
              <span>View All ({orders.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <p className="text-xs text-stone-500">You haven&apos;t placed any orders yet.</p>
              <Link
                href="/menu"
                className="inline-block px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-xl hover:bg-orange-600 transition"
              >
                Order from Menu
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((ord) => (
                <Link
                  key={ord.id}
                  href={`/account/orders/${ord.orderNumber}`}
                  className="block p-4 rounded-2xl bg-stone-50 hover:bg-stone-100/80 border border-stone-200/80 transition"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-mono font-bold text-sm text-stone-900 block">
                        {ord.orderNumber}
                      </span>
                      <span className="text-[11px] text-stone-500">
                        {new Date(ord.createdAt).toLocaleDateString()} • {ord.fulfillmentType}
                      </span>
                    </div>
                    <StatusBadge status={ord.status} />
                  </div>
                  <div className="flex justify-between items-center text-xs text-stone-600 pt-2 border-t border-stone-200/50">
                    <span>{ord.items.length} item(s)</span>
                    <span className="font-mono font-bold text-stone-900">
                      ₹{ord.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Reservations */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <div className="flex items-center space-x-2.5">
              <CalendarDays className="w-5 h-5 text-orange-600" />
              <h2 className="font-serif font-bold text-lg text-stone-900">
                Table Reservations
              </h2>
            </div>
            <Link
              href="/account/reservations"
              className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center space-x-1"
            >
              <span>View All ({reservations.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {upcomingReservations.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <p className="text-xs text-stone-500">No active table reservations found.</p>
              <Link
                href="/reservations"
                className="inline-block px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-xl hover:bg-orange-600 transition"
              >
                Reserve a Table
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingReservations.map((res) => (
                <div
                  key={res.id}
                  className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-sm text-stone-900 block">
                        {res.reservationDate} at {res.startTime}
                      </span>
                      <span className="text-[11px] text-stone-500">
                        Party of {res.partySize} Guests
                      </span>
                    </div>
                    <StatusBadge status={res.status} type="reservation" />
                  </div>
                  {res.specialRequests && (
                    <p className="text-xs text-stone-500 italic pt-1">
                      &quot;{res.specialRequests}&quot;
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
