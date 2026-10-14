'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChefHat,
  Clock,
  RefreshCw,
  Flame,
  CheckCircle2,
  UtensilsCrossed,
  ShoppingBag,
  Truck,
  AlertCircle,
  Eye,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { OrderRecord, OrderStatus } from '@/lib/db-store';

export default function KitchenDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadOrders = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user || (user.role !== 'KITCHEN' && user.role !== 'ADMIN')) {
        router.push('/login');
        return;
      }
      loadOrders();

      // Poll every 6 seconds for kitchen orders
      const interval = setInterval(() => loadOrders(), 6000);
      return () => clearInterval(interval);
    }
  }, [user, authLoading, router]);

  const handleStatusUpdate = async (orderId: string, nextStatus: OrderStatus) => {
    try {
      setUpdatingId(orderId);
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        await loadOrders();
      } else {
        alert(data.message || 'Failed to update order status');
      }
    } catch {
      alert('Error communicating with kitchen API');
    } finally {
      setUpdatingId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 className="w-8 h-8 text-orange-600 animate-spin mx-auto" />
        <p className="text-sm text-stone-500">Loading Kitchen Display System (KDS)...</p>
      </div>
    );
  }

  // Filter queues
  const newOrders = orders.filter((o) => o.status === 'PLACED');
  const preparingOrders = orders.filter((o) => ['CONFIRMED', 'PREPARING'].includes(o.status));
  const readyOrders = orders.filter((o) => o.status === 'READY');
  const completedOrders = orders.filter((o) => o.status === 'COMPLETED').slice(0, 5);

  const getElapsedMins = (createdAt: Date | string) => {
    const diffMs = Date.now() - new Date(createdAt).getTime();
    return Math.floor(diffMs / 60000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* KDS Header */}
      <div className="bg-stone-900 text-white p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-stone-950 font-bold">
            <ChefHat className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-serif font-bold">
                Kitchen Display System (KDS)
              </h1>
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold uppercase tracking-wider animate-pulse">
                Live Queue
              </span>
            </div>
            <p className="text-stone-400 text-xs mt-0.5">
              Active Orders: {newOrders.length + preparingOrders.length + readyOrders.length} • Staff: {user?.name}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-end">
          <button
            onClick={() => loadOrders(true)}
            disabled={refreshing}
            className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-xl transition flex items-center space-x-1.5 border border-stone-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh KDS</span>
          </button>
        </div>
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: New / Placed Orders */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3.5 bg-amber-50 rounded-2xl border border-amber-200/80">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <h2 className="font-bold text-sm text-amber-950 uppercase tracking-wide">
                New Placed ({newOrders.length})
              </h2>
            </div>
            <span className="text-xs font-mono font-bold text-amber-800">Queue</span>
          </div>

          <div className="space-y-4">
            {newOrders.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-stone-200 text-stone-400 text-xs">
                No pending incoming orders.
              </div>
            ) : (
              newOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white p-5 rounded-2xl border-2 border-amber-300 shadow-sm space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono font-bold text-base text-stone-900 block">
                        #{ord.orderNumber}
                      </span>
                      <div className="flex items-center space-x-2 text-xs text-stone-500 mt-0.5">
                        <span className="font-semibold text-stone-700">{ord.fulfillmentType}</span>
                        {ord.tableNumber && <span>• Table: <strong>{ord.tableNumber}</strong></span>}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 text-xs font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                      <Clock className="w-3 h-3" />
                      <span>{getElapsedMins(ord.createdAt)}m ago</span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="space-y-1.5 text-xs text-stone-800 bg-stone-50 p-3 rounded-xl border border-stone-100">
                    {ord.items.map((it) => (
                      <div key={it.id} className="flex justify-between font-medium">
                        <span>{it.quantity}x {it.itemNameSnapshot}</span>
                      </div>
                    ))}
                  </div>

                  {ord.notes && (
                    <div className="p-2.5 rounded-lg bg-orange-50 border border-orange-200 text-xs text-orange-900">
                      <strong>Note:</strong> &quot;{ord.notes}&quot;
                    </div>
                  )}

                  {/* Action */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatusUpdate(ord.id, 'PREPARING')}
                      disabled={updatingId === ord.id}
                      className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center space-x-1"
                    >
                      <Flame className="w-3.5 h-3.5" />
                      <span>Accept & Start Cooking</span>
                    </button>
                    <Link
                      href={`/kitchen/orders/${ord.orderNumber}`}
                      className="p-2.5 border border-stone-200 rounded-xl hover:bg-stone-50"
                      title="View ticket"
                    >
                      <Eye className="w-4 h-4 text-stone-500" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 2: In Preparation */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3.5 bg-orange-50 rounded-2xl border border-orange-200/80">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-orange-600 animate-ping" />
              <h2 className="font-bold text-sm text-orange-950 uppercase tracking-wide">
                In Preparation ({preparingOrders.length})
              </h2>
            </div>
            <span className="text-xs font-mono font-bold text-orange-800">Cooking</span>
          </div>

          <div className="space-y-4">
            {preparingOrders.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-stone-200 text-stone-400 text-xs">
                No orders currently in the tandoor or wok.
              </div>
            ) : (
              preparingOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white p-5 rounded-2xl border-2 border-orange-300 shadow-sm space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono font-bold text-base text-stone-900 block">
                        #{ord.orderNumber}
                      </span>
                      <div className="flex items-center space-x-2 text-xs text-stone-500 mt-0.5">
                        <span className="font-semibold text-stone-700">{ord.fulfillmentType}</span>
                        {ord.tableNumber && <span>• Table: <strong>{ord.tableNumber}</strong></span>}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 text-xs font-mono text-orange-700 bg-orange-50 px-2 py-0.5 rounded animate-pulse">
                      <Clock className="w-3 h-3" />
                      <span>{getElapsedMins(ord.createdAt)}m cooking</span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="space-y-1.5 text-xs text-stone-800 bg-stone-50 p-3 rounded-xl border border-stone-100">
                    {ord.items.map((it) => (
                      <div key={it.id} className="flex justify-between font-medium">
                        <span>{it.quantity}x {it.itemNameSnapshot}</span>
                      </div>
                    ))}
                  </div>

                  {ord.notes && (
                    <div className="p-2.5 rounded-lg bg-orange-50 border border-orange-200 text-xs text-orange-900">
                      <strong>Note:</strong> &quot;{ord.notes}&quot;
                    </div>
                  )}

                  {/* Action */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatusUpdate(ord.id, 'READY')}
                      disabled={updatingId === ord.id}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center space-x-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Ready for Service</span>
                    </button>
                    <Link
                      href={`/kitchen/orders/${ord.orderNumber}`}
                      className="p-2.5 border border-stone-200 rounded-xl hover:bg-stone-50"
                      title="View ticket"
                    >
                      <Eye className="w-4 h-4 text-stone-500" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 3: Ready for Pickup / Serving */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200/80">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-emerald-600" />
              <h2 className="font-bold text-sm text-emerald-950 uppercase tracking-wide">
                Ready to Serve ({readyOrders.length})
              </h2>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-800">Pass</span>
          </div>

          <div className="space-y-4">
            {readyOrders.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-stone-200 text-stone-400 text-xs">
                No orders waiting on the pass.
              </div>
            ) : (
              readyOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white p-5 rounded-2xl border-2 border-emerald-400 shadow-sm space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono font-bold text-base text-stone-900 block">
                        #{ord.orderNumber}
                      </span>
                      <div className="flex items-center space-x-2 text-xs text-stone-500 mt-0.5">
                        <span className="font-semibold text-stone-700">{ord.fulfillmentType}</span>
                        {ord.tableNumber && <span>• Table: <strong>{ord.tableNumber}</strong></span>}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      Ready on Pass
                    </span>
                  </div>

                  {/* Items */}
                  <div className="space-y-1 text-xs text-stone-700 bg-stone-50 p-2.5 rounded-xl">
                    {ord.items.map((it) => (
                      <div key={it.id} className="flex justify-between">
                        <span>{it.quantity}x {it.itemNameSnapshot}</span>
                      </div>
                    ))}
                  </div>

                  {/* Complete Button */}
                  <button
                    onClick={() => handleStatusUpdate(ord.id, 'COMPLETED')}
                    disabled={updatingId === ord.id}
                    className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl transition flex items-center justify-center space-x-1"
                  >
                    <span>Fulfill / Mark Completed</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
