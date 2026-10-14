'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  ArrowRight,
  Clock,
  ChevronRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { OrderRecord } from '@/lib/db-store';

export default function AccountOrdersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      async function loadOrders() {
        try {
          const res = await fetch('/api/orders');
          const data = await res.json();
          if (data.success) {
            setOrders(data.orders || []);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
      loadOrders();
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 className="w-8 h-8 text-orange-600 animate-spin mx-auto" />
        <p className="text-sm text-stone-500">Retrieving your order history...</p>
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
        <span className="text-stone-900 font-semibold">Order History</span>
      </div>

      <div className="flex items-center justify-between pb-6 border-b border-stone-200">
        <div>
          <h1 className="text-3xl font-serif font-bold text-stone-900">
            My Orders
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Track past and active orders, view receipts, and monitor live kitchen statuses.
          </p>
        </div>
        <Link
          href="/menu"
          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs rounded-xl transition shadow-sm"
        >
          New Order
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-stone-100 text-stone-400 mx-auto flex items-center justify-center">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="font-serif font-bold text-lg text-stone-900">
            No Orders Placed Yet
          </h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            When you place an order for dine-in, pickup, or delivery, you can track every step of the preparation here.
          </p>
          <Link
            href="/menu"
            className="inline-block px-5 py-2.5 bg-stone-900 text-white font-semibold text-xs rounded-xl hover:bg-orange-600 transition"
          >
            Explore Menu & Order
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((ord) => (
            <div
              key={ord.id}
              className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4 hover:border-stone-300 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
                <div className="flex items-center space-x-3">
                  <span className="font-mono font-bold text-base text-stone-900">
                    {ord.orderNumber}
                  </span>
                  <StatusBadge status={ord.status} />
                </div>
                <div className="text-xs text-stone-500">
                  {new Date(ord.createdAt).toLocaleDateString()} at{' '}
                  {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {/* Items summary */}
              <div className="space-y-1.5 text-xs text-stone-600">
                {ord.items.map((it) => (
                  <div key={it.id} className="flex justify-between">
                    <span>
                      {it.quantity}x {it.itemNameSnapshot}
                    </span>
                    <span className="font-mono text-stone-900">
                      ₹{it.lineTotal.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-3 border-t border-stone-100 gap-3">
                <div className="text-xs text-stone-500">
                  <span>Type: <strong className="text-stone-800">{ord.fulfillmentType}</strong></span>
                  {ord.tableNumber && <span> • Table: <strong>{ord.tableNumber}</strong></span>}
                </div>

                <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-right">
                    <span className="text-[11px] text-stone-400 block font-medium">Total Amount</span>
                    <span className="font-mono font-bold text-base text-stone-900">
                      ₹{ord.totalAmount.toFixed(2)}
                    </span>
                  </div>
                  <Link
                    href={`/account/orders/${ord.orderNumber}`}
                    className="px-4 py-2 bg-stone-900 hover:bg-orange-600 text-white font-semibold text-xs rounded-xl transition flex items-center space-x-1"
                  >
                    <span>Track Order</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
