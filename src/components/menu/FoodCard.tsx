'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Check, Clock, Sparkles } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { MenuItemRecord } from '@/lib/db-store';

interface FoodCardProps {
  item: MenuItemRecord;
}

export const FoodCard: React.FC<FoodCardProps> = ({ item }) => {
  const { addItem, items } = useCart();
  const existingInCart = items.find((i) => i.id === item.id);

  let dietaryTags: string[] = [];
  try {
    if (item.dietaryLabels) {
      dietaryTags = JSON.parse(item.dietaryLabels);
    }
  } catch {
    if (item.dietaryLabels) {
      dietaryTags = item.dietaryLabels.split(',').map((s) => s.trim());
    }
  }

  const isVeg = dietaryTags.includes('Veg');
  const isChefSpecial = dietaryTags.includes('Chef Special');

  return (
    <div className="group relative bg-white rounded-2xl border border-stone-200/80 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden">
      {/* Food Image */}
      <div className="relative w-full h-52 bg-stone-100 overflow-hidden">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Dietary and Chef Special Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center">
          {/* Veg/Non-Veg Icon */}
          <span
            className={`w-5 h-5 rounded-md border flex items-center justify-center bg-white shadow-sm ${
              isVeg ? 'border-emerald-600' : 'border-rose-600'
            }`}
            title={isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isVeg ? 'bg-emerald-600' : 'bg-rose-600'
              }`}
            />
          </span>

          {isChefSpecial && (
            <span className="px-2 py-0.5 rounded-md bg-amber-500 text-stone-900 text-[11px] font-bold tracking-wide flex items-center space-x-1 shadow-sm">
              <Sparkles className="w-3 h-3" />
              <span>Chef Special</span>
            </span>
          )}
        </div>

        {/* Preparation Time */}
        {item.preparationTime && (
          <div className="absolute bottom-3 left-3 px-2 py-1 rounded-md bg-stone-900/80 backdrop-blur-sm text-white text-xs font-medium flex items-center space-x-1">
            <Clock className="w-3 h-3 text-orange-400" />
            <span>{item.preparationTime} mins</span>
          </div>
        )}

        {/* Availability Overlay */}
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center">
            <span className="px-3 py-1.5 bg-rose-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow">
              Sold Out Today
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <Link href={`/menu/${item.slug}`} className="block">
            <h3 className="font-serif font-bold text-lg text-stone-900 group-hover:text-orange-600 transition line-clamp-1">
              {item.name}
            </h3>
          </Link>
          <p className="text-stone-500 text-xs sm:text-sm mt-1.5 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Price & Action */}
        <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-400 block font-medium">Price</span>
            <span className="text-lg font-bold text-stone-900 font-mono">
              ₹{item.price.toFixed(2)}
            </span>
          </div>

          {item.isAvailable ? (
            <button
              onClick={() =>
                addItem({
                  id: item.id,
                  name: item.name,
                  slug: item.slug,
                  price: item.price,
                  imageUrl: item.imageUrl,
                  preparationTime: item.preparationTime,
                  dietaryLabels: item.dietaryLabels,
                })
              }
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
                existingInCart
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-stone-900 text-white hover:bg-orange-600'
              }`}
            >
              {existingInCart ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Added ({existingInCart.quantity})</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to Order</span>
                </>
              )}
            </button>
          ) : (
            <span className="text-xs font-medium text-stone-400 italic">
              Unavailable
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
