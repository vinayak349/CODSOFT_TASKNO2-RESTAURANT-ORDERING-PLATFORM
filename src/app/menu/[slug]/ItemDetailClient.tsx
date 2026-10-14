'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, Minus, ShoppingBag, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { MenuItemRecord } from '@/lib/db-store';

export const ItemDetailClient: React.FC<{ item: MenuItemRecord }> = ({ item }) => {
  const { addItem, items } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const existingInCart = items.find((i) => i.id === item.id);

  const handleAdd = () => {
    if (!item.isAvailable) return;
    addItem(
      {
        id: item.id,
        name: item.name,
        slug: item.slug,
        price: item.price,
        imageUrl: item.imageUrl,
        preparationTime: item.preparationTime,
        dietaryLabels: item.dietaryLabels,
      },
      quantity
    );
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2500);
  };

  return (
    <div className="space-y-6 pt-4 border-t border-stone-100">
      <div className="flex items-baseline justify-between">
        <div>
          <span className="text-xs text-stone-400 block font-medium">Price per portion</span>
          <span className="text-3xl font-bold font-mono text-stone-900">
            ₹{item.price.toFixed(2)}
          </span>
        </div>

        {/* Quantity Controls */}
        {item.isAvailable && (
          <div className="flex items-center border border-stone-200 rounded-xl bg-stone-50 overflow-hidden">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="p-2.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-10 text-center font-bold text-sm font-mono text-stone-900">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="p-2.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {item.isAvailable ? (
        <div className="space-y-3">
          <button
            onClick={handleAdd}
            className={`w-full py-4 rounded-xl font-bold text-sm transition flex items-center justify-center space-x-2 shadow-md ${
              justAdded
                ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                : 'bg-orange-600 hover:bg-orange-700 text-white shadow-orange-600/30'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-5 h-5" />
                <span>Added to Cart!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-5 h-5" />
                <span>
                  Add {quantity} to Order • ₹{(item.price * quantity).toFixed(2)}
                </span>
              </>
            )}
          </button>

          {existingInCart && (
            <div className="flex items-center justify-between text-xs text-stone-500 px-1">
              <span>Currently in cart: {existingInCart.quantity} portion(s)</span>
              <Link href="/cart" className="font-semibold text-orange-600 hover:underline">
                View Cart & Checkout →
              </Link>
            </div>
          )}
        </div>
      ) : (
        <button
          disabled
          className="w-full py-4 rounded-xl bg-stone-200 text-stone-400 font-bold text-sm cursor-not-allowed text-center"
        >
          Temporarily Out of Stock
        </button>
      )}
    </div>
  );
};
