'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  IndianRupee,
  ShoppingBag,
  CalendarDays,
  UtensilsCrossed,
  TrendingUp,
  Clock,
  ArrowRight,
  ShieldAlert,
  Loader2,
  Users,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { AdminNav } from '@/components/layout/AdminNav';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DashboardStats } from '@/services/analytics.service';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'ADMIN') {
        router.push('/login');
        return;
      }

      async function loadStats() {
        try {
          const res = await fetch('/api/admin/stats');
          const data = await res.json();
          if (data.success) {
            setStats(data.stats);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
      loadStats();
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 className="w-8 h-8 text-orange-600 animate-spin mx-auto" />
        <p className="text-sm text-stone-500">Loading restaurant analytics...</p>
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') return null;

  return (
    <div className="space-y-8 pb-16">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Welcome Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
          <div>
            <span className="text-xs font-bold text-orange-600 uppercase tracking-widest block">
              Management Portal
            </span>
            <h1 className="text-3xl font-serif font-bold text-stone-900">
              Operations & Analytics
            </h1>
          </div>
          <div className="text-xs text-stone-500">
            Welcome back, <strong>{user.name}</strong> • Timezone: <strong>Asia/Kolkata</strong>
          </div>
        </div>

        {/* KPI Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Revenue */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Total Revenue
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <IndianRupee className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold font-mono text-stone-900">
              ₹{stats?.totalRevenue.toFixed(2) || '0.00'}
            </div>
            <span className="text-[11px] text-stone-400 block">
              Across all settled orders
            </span>
          </div>

          {/* Today's Sales */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Today&apos;s Revenue
              </span>
              <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold font-mono text-stone-900">
              ₹{stats?.todayRevenue.toFixed(2) || '0.00'}
            </div>
            <span className="text-[11px] text-stone-400 block">
              Recorded since midnight
            </span>
          </div>

          {/* Active Orders */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Active Orders
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold font-mono text-stone-900">
              {stats?.activeOrdersCount || 0}
            </div>
            <span className="text-[11px] text-stone-400 block">
              Currently in kitchen/delivery queue
            </span>
          </div>

          {/* Table Bookings */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Pending Bookings
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <CalendarDays className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold font-mono text-stone-900">
              {stats?.pendingReservationsCount || 0}
            </div>
            <span className="text-[11px] text-stone-400 block">
              Awaiting table assignment
            </span>
          </div>
        </div>

        {/* Middle Section: Top Dishes & Quick Shortcuts */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Top Selling Dishes */}
          <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h2 className="font-serif font-bold text-lg text-stone-900">
                Top Selling Menu Items
              </h2>
              <Link
                href="/admin/menu"
                className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center space-x-1"
              >
                <span>Manage Menu</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {(!stats?.topSellingItems || stats.topSellingItems.length === 0) ? (
              <p className="text-xs text-stone-400 py-6 text-center">
                Item volume tallies will appear once orders are placed.
              </p>
            ) : (
              <div className="space-y-3">
                {stats.topSellingItems.map((item, idx) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-100 text-xs"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="w-5 h-5 rounded-full bg-stone-200 text-stone-700 font-bold flex items-center justify-center text-[10px]">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-stone-900">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-stone-900">{item.count} orders</span>
                      <span className="text-stone-400 block font-mono">₹{item.revenue.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Management Shortcuts */}
          <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
            <h2 className="font-serif font-bold text-lg text-stone-900 pb-3 border-b border-stone-100">
              Operational Hub
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/admin/menu"
                className="p-4 rounded-2xl bg-stone-50 hover:bg-orange-50 border border-stone-200/80 hover:border-orange-300 transition text-left space-y-1 group"
              >
                <UtensilsCrossed className="w-5 h-5 text-orange-600 mb-2" />
                <span className="font-bold text-xs text-stone-900 group-hover:text-orange-600 block">
                  Add / Edit Dishes
                </span>
                <span className="text-[11px] text-stone-500 block">
                  {stats?.totalMenuItems} active items
                </span>
              </Link>

              <Link
                href="/admin/reservations"
                className="p-4 rounded-2xl bg-stone-50 hover:bg-orange-50 border border-stone-200/80 hover:border-orange-300 transition text-left space-y-1 group"
              >
                <CalendarDays className="w-5 h-5 text-orange-600 mb-2" />
                <span className="font-bold text-xs text-stone-900 group-hover:text-orange-600 block">
                  Table Reservations
                </span>
                <span className="text-[11px] text-stone-500 block">
                  Review & Assign
                </span>
              </Link>

              <Link
                href="/admin/tables"
                className="p-4 rounded-2xl bg-stone-50 hover:bg-orange-50 border border-stone-200/80 hover:border-orange-300 transition text-left space-y-1 group"
              >
                <Clock className="w-5 h-5 text-orange-600 mb-2" />
                <span className="font-bold text-xs text-stone-900 group-hover:text-orange-600 block">
                  Restaurant Tables
                </span>
                <span className="text-[11px] text-stone-500 block">
                  {stats?.totalTables} tables configured
                </span>
              </Link>

              <Link
                href="/admin/users"
                className="p-4 rounded-2xl bg-stone-50 hover:bg-orange-50 border border-stone-200/80 hover:border-orange-300 transition text-left space-y-1 group"
              >
                <Users className="w-5 h-5 text-orange-600 mb-2" />
                <span className="font-bold text-xs text-stone-900 group-hover:text-orange-600 block">
                  Staff & Roles
                </span>
                <span className="text-[11px] text-stone-500 block">
                  Permissions & Users
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Orders Overview */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <h2 className="font-serif font-bold text-lg text-stone-900">
              Recent System Orders
            </h2>
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center space-x-1"
            >
              <span>View All Orders</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-600">
              <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider font-semibold border-b border-stone-200">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Fulfillment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {stats?.recentOrders.map((ord: any) => (
                  <tr key={ord.id} className="hover:bg-stone-50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-stone-900">
                      <Link href={`/account/orders/${ord.orderNumber}`} className="hover:text-orange-600">
                        {ord.orderNumber}
                      </Link>
                    </td>
                    <td className="py-3 px-4">{ord.customerName}</td>
                    <td className="py-3 px-4">
                      {ord.fulfillmentType} {ord.tableNumber && `(${ord.tableNumber})`}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={ord.status} />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={ord.paymentStatus} type="payment" />
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-stone-900">
                      ₹{ord.totalAmount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
