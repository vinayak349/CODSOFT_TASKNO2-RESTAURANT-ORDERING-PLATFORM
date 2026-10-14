'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChefHat,
  ArrowLeft,
  Clock,
  Printer,
  CheckCircle2,
  Flame,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { OrderRecord, OrderStatus } from '@/lib/db-store';

export default function KitchenOrderTicketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const loadOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${id}`);
      const data = await res.json();
      if (data.success && data.order) {
        setOrder(data.order);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user || (user.role !== 'KITCHEN' && user.role !== 'ADMIN')) {
        router.push('/login');
        return;
      }
      loadOrder();
    }
  }, [user, authLoading, router, id]);

  const handleUpdate = async (status: OrderStatus) => {
    if (!order) return;
    try {
      setUpdating(true);
      const res = await fetch(`/api/orders/${order.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        setOrder(data.order);
      } else {
        alert(data.message || 'Status update failed');
      }
    } catch {
      alert('Error updating status');
    } finally {
      setUpdating(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
        <p className="text-sm text-stone-500">Printing kitchen ticket...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-4">
        <h2 className="text-xl font-serif font-bold text-stone-900">Ticket not found</h2>
        <Link href="/kitchen" className="px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-xl">
          Back to Kitchen KDS
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/kitchen"
          className="text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center space-x-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to KDS Board</span>
        </Link>

        <button
          onClick={() => window.print()}
          className="px-3.5 py-1.5 border border-stone-200 hover:bg-stone-50 rounded-xl text-xs font-semibold text-stone-700 flex items-center space-x-1.5 transition"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Physical Ticket</span>
        </button>
      </div>

      {/* Physical Ticket Simulator Card */}
      <div className="bg-white p-8 rounded-3xl border-2 border-stone-300 shadow-md font-mono space-y-6">
        <div className="text-center pb-4 border-b-2 border-dashed border-stone-300 space-y-1">
          <span className="text-xs font-bold uppercase tracking-widest text-stone-500 block">
            DineDesk Kitchen Ticket
          </span>
          <h1 className="text-2xl font-bold text-stone-900">
            #{order.orderNumber}
          </h1>
          <div className="text-xs text-stone-500">
            {new Date(order.createdAt).toLocaleString()}
          </div>
        </div>

        <div className="flex justify-between items-center text-xs pb-4 border-b border-stone-200">
          <div>
            <span>TYPE: <strong>{order.fulfillmentType}</strong></span>
            {order.tableNumber && <span> | TABLE: <strong>{order.tableNumber}</strong></span>}
          </div>
          <StatusBadge status={order.status} />
        </div>

        {/* Item Rows */}
        <div className="space-y-3 py-2 text-sm">
          {order.items.map((it) => (
            <div key={it.id} className="flex justify-between font-bold">
              <span>{it.quantity}x {it.itemNameSnapshot}</span>
              <span>₹{it.lineTotal.toFixed(2)}</span>
            </div>
          ))}
        </div>

        {order.notes && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-sans text-amber-900">
            <strong>SPECIAL INSTRUCTIONS:</strong> {order.notes}
          </div>
        )}

        {/* Action Controls */}
        <div className="pt-6 border-t-2 border-dashed border-stone-300 font-sans flex flex-wrap gap-3">
          {order.status === 'PLACED' && (
            <button
              onClick={() => handleUpdate('PREPARING')}
              disabled={updating}
              className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center space-x-1"
            >
              <Flame className="w-4 h-4" />
              <span>Start Preparing</span>
            </button>
          )}

          {['PLACED', 'CONFIRMED', 'PREPARING'].includes(order.status) && (
            <button
              onClick={() => handleUpdate('READY')}
              disabled={updating}
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center space-x-1"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark Ready</span>
            </button>
          )}

          {order.status === 'READY' && (
            <button
              onClick={() => handleUpdate('COMPLETED')}
              disabled={updating}
              className="flex-1 py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl transition flex items-center justify-center space-x-1"
            >
              <span>Fulfill / Complete</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
