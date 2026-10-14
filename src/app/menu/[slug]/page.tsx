import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Clock,
  ArrowLeft,
  Sparkles,
  ShoppingBag,
  ShieldCheck,
  Utensils,
  ChevronRight,
} from 'lucide-react';
import { MenuService } from '@/services/menu.service';
import { FoodCard } from '@/components/menu/FoodCard';
import { ItemDetailClient } from './ItemDetailClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function MenuItemDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const item = await MenuService.getItemBySlug(slug);

  if (!item) {
    notFound();
  }

  // Fetch related items from the same category
  const allCategoryItems = await MenuService.getMenuItems({
    onlyAvailable: true,
  });
  const relatedItems = allCategoryItems
    .filter((i) => i.categoryId === item.categoryId && i.id !== item.id)
    .slice(0, 3);

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center space-x-2 text-xs font-medium text-stone-500">
        <Link href="/" className="hover:text-stone-900 transition">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/menu" className="hover:text-stone-900 transition">
          Menu
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-stone-900 font-semibold truncate">{item.name}</span>
      </div>

      {/* Main Details Card */}
      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm grid grid-cols-1 lg:grid-cols-12">
        {/* Left Column: Image */}
        <div className="lg:col-span-7 relative h-80 sm:h-96 lg:h-auto bg-stone-100">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4 flex gap-2">
            {dietaryTags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded-lg bg-stone-900/80 backdrop-blur-md text-white text-xs font-semibold shadow"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Right Column: Information & Actions */}
        <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-between space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-orange-600 uppercase tracking-widest">
                Artisanal Specialty
              </span>
              {item.isAvailable ? (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  In Stock & Ready
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                  Sold Out
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 leading-tight">
              {item.name}
            </h1>

            <p className="text-stone-600 text-sm leading-relaxed font-light">
              {item.description}
            </p>

            <div className="flex items-center space-x-6 pt-2 border-t border-stone-100 text-xs text-stone-500">
              {item.preparationTime && (
                <div className="flex items-center space-x-1.5">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <span>Prep time: {item.preparationTime} minutes</span>
                </div>
              )}
              <div className="flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Stone-ground authentic recipe</span>
              </div>
            </div>
          </div>

          {/* Interactive Client Component for Quantity & Add to Cart */}
          <ItemDetailClient item={item} />
        </div>
      </div>

      {/* Related Dishes */}
      {relatedItems.length > 0 && (
        <div className="space-y-6 pt-6 border-t border-stone-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-serif font-bold text-stone-900">
              Recommended Pairings
            </h2>
            <Link
              href="/menu"
              className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center space-x-1"
            >
              <span>Explore Menu</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedItems.map((rel) => (
              <FoodCard key={rel.id} item={rel} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
