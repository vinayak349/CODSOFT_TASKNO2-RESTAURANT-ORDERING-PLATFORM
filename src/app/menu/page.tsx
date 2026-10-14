'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  Filter,
  ArrowUpDown,
  Utensils,
  AlertCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { FoodCard } from '@/components/menu/FoodCard';
import { MenuItemRecord, CategoryRecord } from '@/lib/db-store';

function MenuContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [items, setItems] = useState<MenuItemRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [dietaryFilter, setDietaryFilter] = useState<'all' | 'Veg' | 'Non-Veg' | 'Chef Special'>('all');
  const [sortBy, setSortBy] = useState<'recommended' | 'price-asc' | 'price-desc' | 'name-asc'>('recommended');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [catRes, menuRes] = await Promise.all([
          fetch('/api/menu/categories'),
          fetch('/api/menu'),
        ]);

        const catData = await catRes.json();
        const menuData = await menuRes.json();

        if (catData.success) setCategories(catData.categories);
        if (menuData.success) setItems(menuData.items);
      } catch (err) {
        console.error('Failed to load menu data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Update selectedCategory if query param changes
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setSelectedCategory(cat);
  }, [searchParams]);

  // Client-side filtering & sorting for zero-latency instant feedback
  const filteredItems = useMemo(() => {
    let result = [...items];

    // Category filter
    if (selectedCategory !== 'all') {
      const catObj = categories.find((c) => c.slug === selectedCategory);
      if (catObj) {
        result = result.filter((item) => item.categoryId === catObj.id);
      }
    }

    // Search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q)
      );
    }

    // Dietary filter
    if (dietaryFilter !== 'all') {
      result = result.filter((item) => {
        if (!item.dietaryLabels) return false;
        return item.dietaryLabels.includes(dietaryFilter);
      });
    }

    // Sort
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    return result;
  }, [items, categories, selectedCategory, searchQuery, dietaryFilter, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold text-orange-600 uppercase tracking-widest block">
          Digital Dining Experience
        </span>
        <h1 className="text-4xl font-serif font-bold text-stone-900">
          Our Artisanal Menu
        </h1>
        <p className="text-stone-500 text-sm leading-relaxed">
          Crafted with authentic hand-ground spices, clay oven mastery, and the finest seasonal ingredients.
        </p>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-stone-200/80 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search bar */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes, curries, tandoori grills, desserts..."
              className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
            />
          </div>

          {/* Dietary Filter */}
          <div className="md:col-span-3 flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0">
            {(['all', 'Veg', 'Non-Veg', 'Chef Special'] as const).map((diet) => (
              <button
                key={diet}
                onClick={() => setDietaryFilter(diet)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  dietaryFilter === diet
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {diet === 'all' ? 'All Diets' : diet}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="md:col-span-3 relative">
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition cursor-pointer"
            >
              <option value="recommended">Featured / Recommended</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
            </select>
          </div>
        </div>

        {/* Category Pill Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pt-3 border-t border-stone-100 no-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              selectedCategory === 'all'
                ? 'bg-orange-600 text-white shadow-sm shadow-orange-600/30'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            All Items ({items.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedCategory === cat.slug
                  ? 'bg-orange-600 text-white shadow-sm shadow-orange-600/30'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Listing Grid */}
      {loading ? (
        <div className="py-24 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-orange-600 animate-spin mx-auto" />
          <p className="text-sm text-stone-500">Curating menu items...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 mx-auto flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-bold text-lg text-stone-900">
            No Menu Items Found
          </h3>
          <p className="text-xs text-stone-500">
            No dishes match your active search or filter criteria. Try resetting filters to explore all available specialties.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
              setDietaryFilter('all');
            }}
            className="px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-xl hover:bg-orange-600 transition"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <FoodCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-orange-600 animate-spin mx-auto" />
          <p className="text-sm text-stone-500">Loading digital menu...</p>
        </div>
      }
    >
      <MenuContent />
    </Suspense>
  );
}
