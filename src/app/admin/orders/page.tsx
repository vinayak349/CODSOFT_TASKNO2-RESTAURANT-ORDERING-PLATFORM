'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, RefreshCw, Eye, Loader2, Filter } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { AdminNav } from '@/components/layout/AdminNav';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { OrderRecord, OrderStatus } from '@/lib/db-store';

export default function AdminOrdersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadOrders = async () => {
    try {
      const url = statusFilter === 'all' ? '/api/orders' : `/api/orders?status=${statusFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
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
      loadOrders();
    }
  }, [user, authLoading, router, statusFilter]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      setUpdatingId(orderId);
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        await loadOrders();
      } else {
        alert(data.message || 'Cannot update status');
      }
    } catch {
      alert('Error updating order');
    } finally {
      setUpdatingId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 className="w-8 h-8 text-orange-600 animate-spin mx-auto" />
        <p className="text-sm text-stone-500">Loading order records...</p>
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
              Orders Management
            </h1>
            <p className="text-stone-500 text-xs sm:text-sm mt-1">
              Inspect order line items, check payment verification, and supervise kitchen fulfillment.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-stone-700"
            >
              <option value="all">All Statuses</option>
              <option value="PLACED">Placed</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PREPARING">Preparing</option>
              <option value="READY">Ready</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <button
              onClick={() => loadOrders()}
              className="p-2 border border-stone-200 rounded-xl hover:bg-stone-50 text-stone-600"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs text-stone-600">
            <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider font-semibold border-b border-stone-200">
              <tr>
                <th className="py-3 px-4">Order Number</th>
                <th className="py-3 px-4">Guest</th>
                <th className="py-3 px-4">Fulfillment</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Current Status</th>
                <th className="py-3 px-4">Change Status</th>
                <th className="py-3 px-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-stone-50 transition">
                  <td className="py-3 px-4 font-mono font-bold text-stone-900">
                    <Link href={`/account/orders/${ord.orderNumber}`} className="hover:text-orange-600">
                      {ord.orderNumber}
                    </Link>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-stone-900 block">{ord.customerName}</span>
                    <span className="text-[11px] text-stone-400">{ord.customerPhone}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-stone-800">{ord.fulfillmentType}</span>
                    {ord.tableNumber && <span className="block text-stone-500">Table: {ord.tableNumber}</span>}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-stone-800">
                      {ord.items.map((i) => `${i.quantity}x ${i.itemNameSnapshot}`).join(', ')}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={ord.status} />
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={ord.status}
                      disabled={updatingId === ord.id || ['COMPLETED', 'CANCELLED', 'REFUNDED'].includes(ord.status)}
                      onChange={(e) => handleStatusChange(ord.id, e.target.value as OrderStatus)}
                      className="px-2 py-1 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                    >
                      <option value="PLACED">Placed</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="PREPARING">Preparing</option>
                      <option value="READY">Ready</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
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
  );
}
