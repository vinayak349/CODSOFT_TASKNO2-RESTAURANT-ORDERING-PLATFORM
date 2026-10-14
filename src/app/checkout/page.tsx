'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CreditCard,
  Banknote,
  Utensils,
  ShoppingBag,
  Truck,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Lock,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { FulfillmentType, PaymentProvider } from '@/lib/db-store';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();

  // Form Fields
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentType>('DINE_IN');
  const [tableNumber, setTableNumber] = useState('T-01');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentProvider>('TEST_ONLINE');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState('');

  // Generate unique idempotency key on mount
  useEffect(() => {
    setIdempotencyKey(`idemp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);
  }, []);

  // Autofill user details if user signs in
  useEffect(() => {
    if (user) {
      if (!customerName) setCustomerName(user.name);
      if (!customerPhone && user.phone) setCustomerPhone(user.phone);
      if (!customerEmail) setCustomerEmail(user.email);
    }
  }, [user]);

  // Financial calculations
  const taxAmount = Number((subtotal * 0.05).toFixed(2));
  const deliveryFee = fulfillmentType === 'DELIVERY' ? 40 : 0;
  const finalTotal = Number((subtotal + taxAmount + deliveryFee).toFixed(2));

  // Redirect if cart is empty
  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center space-y-4">
        <h2 className="text-2xl font-serif font-bold text-stone-900">
          Your cart is empty
        </h2>
        <p className="text-xs text-stone-500">
          Please add items from the menu before proceeding to checkout.
        </p>
        <Link
          href="/menu"
          className="inline-block px-5 py-2.5 bg-orange-600 text-white text-xs font-semibold rounded-xl"
        >
          Browse Menu
        </Link>
      </div>
    );
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validations
    if (!customerName.trim() || !customerPhone.trim()) {
      setError('Please provide customer name and contact phone number.');
      return;
    }

    if (fulfillmentType === 'DELIVERY' && !deliveryAddress.trim()) {
      setError('Please provide complete delivery street address.');
      return;
    }

    if (fulfillmentType === 'DINE_IN' && !tableNumber.trim()) {
      setError('Please select or specify your table number.');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || null,
        fulfillmentType,
        tableNumber: fulfillmentType === 'DINE_IN' ? tableNumber.trim() : null,
        deliveryAddress: fulfillmentType === 'DELIVERY' ? deliveryAddress.trim() : null,
        notes: notes.trim() || null,
        paymentMethod,
        idempotencyKey,
        items: items.map((i) => ({
          menuItemId: i.id,
          quantity: i.quantity,
        })),
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to place order.');
      }

      const order = data.order;
      clearCart();

      // If test online payment, route to mock payment gateway
      if (paymentMethod === 'TEST_ONLINE') {
        const payRes = await fetch('/api/payments/create-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: order.id, provider: 'TEST_ONLINE' }),
        });
        const payData = await payRes.json();
        if (payData.success && payData.session.mockGatewayUrl) {
          router.push(payData.session.mockGatewayUrl);
          return;
        }
      }

      // Cash or direct confirmation
      router.push(`/account/orders/${order.orderNumber}`);
    } catch (err: any) {
      setError(err.message || 'An error occurred while submitting your order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-3xl mb-8">
        <span className="text-xs font-bold text-orange-600 uppercase tracking-widest block">
          Final Step
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900">
          Order Checkout
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          Review your details, select dining preference, and confirm payment.
        </p>
      </div>

      {error && (
        <div className="mb-8 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Checkout Notice</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Form Fields */}
        <div className="lg:col-span-7 space-y-8">
          {/* 1. Fulfillment Type */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-stone-200 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-lg text-stone-900">
              1. Fulfillment Type
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setFulfillmentType('DINE_IN')}
                className={`p-4 rounded-2xl border text-center transition flex flex-col items-center space-y-2 ${
                  fulfillmentType === 'DINE_IN'
                    ? 'border-orange-600 bg-orange-50/60 text-orange-950 font-bold'
                    : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                }`}
              >
                <Utensils className="w-5 h-5 text-orange-600" />
                <span className="text-xs">Dine-In</span>
              </button>

              <button
                type="button"
                onClick={() => setFulfillmentType('PICKUP')}
                className={`p-4 rounded-2xl border text-center transition flex flex-col items-center space-y-2 ${
                  fulfillmentType === 'PICKUP'
                    ? 'border-orange-600 bg-orange-50/60 text-orange-950 font-bold'
                    : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                }`}
              >
                <ShoppingBag className="w-5 h-5 text-orange-600" />
                <span className="text-xs">Takeaway / Pickup</span>
              </button>

              <button
                type="button"
                onClick={() => setFulfillmentType('DELIVERY')}
                className={`p-4 rounded-2xl border text-center transition flex flex-col items-center space-y-2 ${
                  fulfillmentType === 'DELIVERY'
                    ? 'border-orange-600 bg-orange-50/60 text-orange-950 font-bold'
                    : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                }`}
              >
                <Truck className="w-5 h-5 text-orange-600" />
                <span className="text-xs">Home Delivery (+₹40)</span>
              </button>
            </div>

            {/* Conditional fields based on fulfillment */}
            {fulfillmentType === 'DINE_IN' && (
              <div className="pt-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Select Your Table / Booth
                </label>
                <select
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                >
                  <option value="T-01">Table T-01 (Main Dining - 2 Seats)</option>
                  <option value="T-02">Table T-02 (Main Dining - 2 Seats)</option>
                  <option value="T-03">Table T-03 (Main Dining - 4 Seats)</option>
                  <option value="T-04">Table T-04 (Main Dining - 4 Seats)</option>
                  <option value="T-05">Table T-05 (Garden Patio - 6 Seats)</option>
                  <option value="T-06">Table T-06 (Garden Patio - 6 Seats)</option>
                  <option value="BAL-01">Balcony Deck Table BAL-01 (4 Seats)</option>
                  <option value="VIP-01">VIP Private Salon VIP-01 (8 Seats)</option>
                </select>
              </div>
            )}

            {fulfillmentType === 'DELIVERY' && (
              <div className="pt-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Delivery Street Address & Landmark
                </label>
                <textarea
                  rows={3}
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Apartment/Villa No., Street, Landmark, Pin Code"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  required
                />
              </div>
            )}
          </div>

          {/* 2. Customer Contact */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-stone-200 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-lg text-stone-900">
              2. Contact Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Aarav Patel"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+91 98765 11223"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Email Address (for invoice & tracking updates)
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="aarav@example.com"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Special Kitchen Instructions / Food Allergies
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Extra spicy, no garlic in dal, cut naan into 4 pieces"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          {/* 3. Payment Method */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-stone-200 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-lg text-stone-900">
              3. Payment Selection
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label
                className={`p-4 rounded-2xl border cursor-pointer transition flex items-center space-x-3.5 ${
                  paymentMethod === 'TEST_ONLINE'
                    ? 'border-orange-600 bg-orange-50/60 font-semibold'
                    : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="TEST_ONLINE"
                  checked={paymentMethod === 'TEST_ONLINE'}
                  onChange={() => setPaymentMethod('TEST_ONLINE')}
                  className="text-orange-600 focus:ring-orange-500"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-bold text-stone-900">Online Payment Gateway</span>
                  </div>
                  <span className="text-[11px] text-stone-500 block mt-0.5">
                    UPI, Credit/Debit Card, Netbanking (Sandbox Mode)
                  </span>
                </div>
              </label>

              <label
                className={`p-4 rounded-2xl border cursor-pointer transition flex items-center space-x-3.5 ${
                  paymentMethod === 'CASH'
                    ? 'border-orange-600 bg-orange-50/60 font-semibold'
                    : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="CASH"
                  checked={paymentMethod === 'CASH'}
                  onChange={() => setPaymentMethod('CASH')}
                  className="text-orange-600 focus:ring-orange-500"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <Banknote className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-bold text-stone-900">Cash / Pay at Counter</span>
                  </div>
                  <span className="text-[11px] text-stone-500 block mt-0.5">
                    Pay at restaurant or on delivery arrival
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Review & Submit */}
        <div className="lg:col-span-5">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6 sticky top-28">
            <h3 className="font-serif font-bold text-lg text-stone-900 pb-4 border-b border-stone-100">
              Review Items ({items.length})
            </h3>

            {/* Compact Item list */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map((i) => (
                <div key={i.id} className="flex justify-between items-center text-xs">
                  <div className="space-x-1.5 flex-1 pr-2 truncate">
                    <span className="font-bold font-mono text-stone-900">{i.quantity}x</span>
                    <span className="text-stone-700 truncate">{i.name}</span>
                  </div>
                  <span className="font-mono font-medium text-stone-900">
                    ₹{(i.price * i.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div className="pt-4 border-t border-stone-100 space-y-2.5 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono font-medium text-stone-900">
                  ₹{subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>GST Tax (5%)</span>
                <span className="font-mono font-medium text-stone-900">
                  ₹{taxAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span className="font-mono font-medium text-stone-900">
                  ₹{deliveryFee.toFixed(2)}
                </span>
              </div>

              <div className="pt-4 border-t border-stone-200 flex justify-between items-baseline text-sm">
                <span className="font-serif font-bold text-base text-stone-900">
                  Total Payable
                </span>
                <span className="text-2xl font-bold font-mono text-stone-900">
                  ₹{finalTotal.toFixed(2)}
                </span>
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
                  <span>Verifying & Placing Order...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>
                    Place Order • ₹{finalTotal.toFixed(2)}
                  </span>
                </>
              )}
            </button>

            <div className="flex items-center space-x-2 text-[11px] text-stone-400 justify-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Idempotent submission prevents accidental double-charging</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
