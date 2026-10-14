'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  CheckCircle2,
  Clock,
  ChevronRight,
  Loader2,
  AlertCircle,
  XCircle,
  RefreshCw,
  Utensils,
  ChefHat,
  PackageCheck,
  ShieldCheck,
  MapPin,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { OrderRecord, OrderStatus } from '@/lib/db-store';

export default function OrderTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchOrder = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      const res = await fetch(`/api/orders/${id}`);
      const data = await res.json();
      if (data.success && data.order) {
        setOrder(data.order);
      } else {
        setError(data.message || 'Order could not be found.');
      }
    } catch {
      setError('Failed to fetch order status.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    // Live Polling every 5 seconds for status updates
    const interval = setInterval(() => {
      fetchOrder();
    }, 5000);
    return () => clearInterval(interval);
  }, [id]);

  const handleCancelOrder = async () => {
    if (!order) return;
    if (!confirm('Are you sure you want to cancel this order?')) return;

    try {
      setCancelling(true);
      const res = await fetch(`/api/orders/${order.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });
      const data = await res.json();
      if (data.success) {
        setOrder(data.order);
      } else {
        alert(data.message || 'Cannot cancel order.');
      }
    } catch {
      alert('Error cancelling order.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 className="w-8 h-8 text-orange-600 animate-spin mx-auto" />
        <p className="text-sm text-stone-500">Connecting to restaurant order tracker...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-4 px-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-stone-900">
          Order Not Found
        </h2>
        <p className="text-xs text-stone-500">{error || 'Please check your order reference number.'}</p>
        <Link
          href="/account/orders"
          className="inline-block px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-xl"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  // Stepper calculations
  const steps: { key: OrderStatus; label: string; desc: string }[] = [
    { key: 'PLACED', label: 'Order Received', desc: 'Sent to kitchen queue' },
    { key: 'CONFIRMED', label: 'Confirmed', desc: 'Chef reviewing ingredients' },
    { key: 'PREPARING', label: 'Cooking & Grilling', desc: 'Active in the tandoor' },
    { key: 'READY', label: 'Food Ready', desc: 'Ready for table or pickup' },
    { key: 'COMPLETED', label: 'Fulfilled', desc: 'Enjoy your meal!' },
  ];

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING_PAYMENT':
        return 0;
      case 'PLACED':
        return 0;
      case 'CONFIRMED':
        return 1;
      case 'PREPARING':
        return 2;
      case 'READY':
        return 3;
      case 'COMPLETED':
        return 4;
      default:
        return -1;
    }
  };

  const currentStepIdx = getStepIndex(order.status);
  const isTerminal = ['CANCELLED', 'REJECTED', 'PAYMENT_FAILED'].includes(order.status);
  const canCancel = ['PLACED', 'PENDING_PAYMENT'].includes(order.status);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="flex items-center space-x-2 text-xs text-stone-500 mb-1">
            <Link href="/account/orders" className="hover:text-stone-900">
              Orders
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span>Tracking</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 flex items-center space-x-3">
            <span>Order #{order.orderNumber}</span>
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => fetchOrder(true)}
            disabled={refreshing}
            className="p-2 border border-stone-200 hover:bg-stone-50 rounded-xl text-stone-600 text-xs flex items-center space-x-1 transition"
            title="Refresh order status"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <StatusBadge status={order.status} />
        </div>
      </div>

      {/* Live Stepper Card */}
      {!isTerminal ? (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-orange-600 uppercase tracking-widest">
              Live Progress Monitor
            </span>
            <span className="text-xs text-stone-400 flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
              <span>Auto-refreshing live</span>
            </span>
          </div>

          <div className="relative pt-4 pb-2">
            {/* Progress bar line */}
            <div className="hidden sm:block absolute top-1/2 left-6 right-6 h-1 bg-stone-100 -translate-y-1/2 -z-0">
              <div
                className="h-full bg-orange-600 transition-all duration-700"
                style={{
                  width: `${(Math.max(0, currentStepIdx) / (steps.length - 1)) * 100}%`,
                }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative z-10">
              {steps.map((st, idx) => {
                const isPassed = currentStepIdx >= idx;
                const isCurrent = currentStepIdx === idx;

                return (
                  <div
                    key={st.key}
                    className="flex sm:flex-col items-center sm:text-center space-x-3 sm:space-x-0 sm:space-y-2"
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${
                        isPassed
                          ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                          : 'bg-stone-100 text-stone-400 border border-stone-200'
                      } ${isCurrent ? 'ring-4 ring-orange-500/20 animate-pulse' : ''}`}
                    >
                      {idx + 1}
                    </div>
                    <div>
                      <span
                        className={`text-xs font-bold block ${
                          isPassed ? 'text-stone-900' : 'text-stone-400'
                        }`}
                      >
                        {st.label}
                      </span>
                      <span className="text-[11px] text-stone-400 hidden sm:block">
                        {st.desc}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 text-center space-y-2">
          <XCircle className="w-8 h-8 text-rose-600 mx-auto" />
          <h3 className="font-serif font-bold text-rose-900">
            Order Status: {order.status}
          </h3>
          <p className="text-xs text-rose-700">
            This order has been terminated or rejected.
          </p>
        </div>
      )}

      {/* Order Details & Summary Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Items */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
          <h3 className="font-serif font-bold text-lg text-stone-900 pb-3 border-b border-stone-100">
            Items Ordered
          </h3>

          <div className="space-y-4">
            {order.items.map((it) => (
              <div key={it.id} className="flex justify-between items-center text-sm">
                <div className="space-y-0.5">
                  <span className="font-semibold text-stone-900">
                    {it.quantity}x {it.itemNameSnapshot}
                  </span>
                  <span className="text-xs text-stone-400 block">
                    ₹{it.unitPriceSnapshot.toFixed(2)} each
                  </span>
                </div>
                <span className="font-mono font-bold text-stone-900">
                  ₹{it.lineTotal.toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {order.notes && (
            <div className="pt-4 border-t border-stone-100 bg-stone-50 p-4 rounded-xl text-xs space-y-1">
              <span className="font-semibold text-stone-700 block">Special Instructions:</span>
              <p className="text-stone-600 italic">&quot;{order.notes}&quot;</p>
            </div>
          )}

          {canCancel && (
            <div className="pt-4 border-t border-stone-100 flex justify-between items-center">
              <span className="text-xs text-stone-500">Need to change your mind?</span>
              <button
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="px-4 py-2 border border-rose-300 hover:bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl transition"
              >
                {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Fulfillment & Billing */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4 text-xs text-stone-600">
            <h4 className="font-serif font-bold text-sm text-stone-900 pb-2 border-b border-stone-100">
              Fulfillment & Customer Info
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Fulfillment Type:</span>
                <strong className="text-stone-900">{order.fulfillmentType}</strong>
              </div>
              {order.tableNumber && (
                <div className="flex justify-between">
                  <span>Dining Table:</span>
                  <strong className="text-stone-900">{order.tableNumber}</strong>
                </div>
              )}
              {order.deliveryAddress && (
                <div className="flex justify-between">
                  <span>Delivery Address:</span>
                  <span className="text-right max-w-[180px] font-medium text-stone-900">
                    {order.deliveryAddress}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Guest Name:</span>
                <span className="text-stone-900">{order.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span>Phone:</span>
                <span className="text-stone-900">{order.customerPhone}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-3 text-xs text-stone-600">
            <h4 className="font-serif font-bold text-sm text-stone-900 pb-2 border-b border-stone-100">
              Payment Summary
            </h4>
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-mono text-stone-900">₹{order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST Tax (5%):</span>
              <span className="font-mono text-stone-900">₹{order.taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee:</span>
              <span className="font-mono text-stone-900">₹{order.deliveryFee.toFixed(2)}</span>
            </div>
            <div className="pt-2 border-t border-stone-200 flex justify-between items-baseline text-sm">
              <span className="font-bold text-stone-900">Total Paid/Due:</span>
              <span className="text-xl font-bold font-mono text-stone-900">
                ₹{order.totalAmount.toFixed(2)}
              </span>
            </div>
            <div className="pt-2 flex justify-between items-center text-xs">
              <span>Payment Status:</span>
              <StatusBadge status={order.paymentStatus} type="payment" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
