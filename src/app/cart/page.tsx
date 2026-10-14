'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  UtensilsCrossed,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, itemCount, subtotal, taxAmount, totalAmount } =
    useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 bg-stone-100 rounded-3xl mx-auto flex items-center justify-center text-stone-400">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-serif font-bold text-stone-900">
          Your Cart is Empty
        </h1>
        <p className="text-stone-500 text-sm max-w-md mx-auto leading-relaxed">
          Looks like you haven&apos;t added any delicacies to your cart yet. Explore our handcrafted tandoori grills, rich curries, and artisanal biryanis.
        </p>
        <div>
          <Link
            href="/menu"
            className="inline-flex items-center space-x-2 px-6 py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm rounded-xl transition shadow-md shadow-orange-600/20"
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Explore Digital Menu</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-200 gap-4">
        <div>
          <span className="text-xs font-bold text-orange-600 uppercase tracking-widest block">
            Order Review
          </span>
          <h1 className="text-3xl font-serif font-bold text-stone-900">
            Shopping Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </h1>
        </div>
        <button
          onClick={() => clearCart()}
          className="text-xs font-semibold text-stone-500 hover:text-rose-600 transition flex items-center space-x-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Entire Cart</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Cart Item List */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col sm:flex-row items-center gap-4 sm:gap-6 justify-between"
            >
              {/* Thumbnail & Title */}
              <div className="flex items-center space-x-4 w-full sm:w-auto">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-20 h-20 rounded-xl object-cover bg-stone-100 shrink-0"
                />
                <div>
                  <Link href={`/menu/${item.slug}`}>
                    <h3 className="font-serif font-bold text-base text-stone-900 hover:text-orange-600 transition line-clamp-1">
                      {item.name}
                    </h3>
                  </Link>
                  <span className="text-xs text-stone-400 block mt-0.5">
                    ₹{item.price.toFixed(2)} each
                  </span>
                  {item.preparationTime && (
                    <div className="flex items-center space-x-1 text-[11px] text-stone-500 mt-1">
                      <Clock className="w-3 h-3 text-orange-500" />
                      <span>{item.preparationTime} mins prep</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Quantity Controls & Line Total */}
              <div className="flex items-center justify-between sm:justify-end space-x-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                <div className="flex items-center border border-stone-200 rounded-xl bg-stone-50 overflow-hidden">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-xs font-bold font-mono text-stone-900">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-right min-w-[80px]">
                  <span className="text-sm font-bold font-mono text-stone-900 block">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={() => removeItem(item.id)}
                  className="p-2 text-stone-400 hover:text-rose-600 transition rounded-lg hover:bg-rose-50"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          <div className="pt-2">
            <Link
              href="/menu"
              className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center space-x-1"
            >
              <span>+ Add more dishes from menu</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-4">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6 sticky top-28">
            <h3 className="font-serif font-bold text-lg text-stone-900 pb-4 border-b border-stone-100">
              Order Summary
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-stone-600">
                <span>Items Subtotal</span>
                <span className="font-mono font-medium text-stone-900">
                  ₹{subtotal.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-stone-600">
                <span>GST Tax (5%)</span>
                <span className="font-mono font-medium text-stone-900">
                  ₹{taxAmount.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-stone-600">
                <span>Fulfillment Fee</span>
                <span className="text-xs text-stone-500 italic">
                  Calculated at checkout
                </span>
              </div>

              <div className="pt-4 border-t border-stone-200 flex justify-between items-baseline">
                <span className="font-serif font-bold text-base text-stone-900">
                  Estimated Total
                </span>
                <span className="text-2xl font-bold font-mono text-stone-900">
                  ₹{totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/checkout"
                className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-orange-600/30 flex items-center justify-center space-x-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="flex items-center space-x-2 text-xs text-stone-400 pt-2 justify-center">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Prices verified securely by restaurant server</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
