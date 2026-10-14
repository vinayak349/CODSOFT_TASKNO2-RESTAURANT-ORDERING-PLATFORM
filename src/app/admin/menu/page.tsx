'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Loader2,
  Search,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { AdminNav } from '@/components/layout/AdminNav';
import { MenuItemRecord, CategoryRecord } from '@/lib/db-store';

export default function AdminMenuPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [items, setItems] = useState<MenuItemRecord[]>([]);
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Item State
  const [newItemName, setNewItemName] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemImage, setNewItemImage] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('');
  const [newItemDiet, setNewItemDiet] = useState('Veg');
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      const [itemRes, catRes] = await Promise.all([
        fetch('/api/menu'),
        fetch('/api/menu/categories'),
      ]);
      const itemData = await itemRes.json();
      const catData = await catRes.json();

      if (itemData.success) setItems(itemData.items);
      if (catData.success) {
        setCategories(catData.categories);
        if (catData.categories.length > 0) {
          setNewItemCategory(catData.categories[0].id);
        }
      }
    } catch (err) {
      console.error(err);
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
      loadData();
    }
  }, [user, authLoading, router]);

  const handleToggleAvailability = async (item: MenuItemRecord) => {
    try {
      const res = await fetch(`/api/admin/menu/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: !item.isAvailable }),
      });
      if (res.ok) {
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, isAvailable: !i.isAvailable } : i))
        );
      }
    } catch {
      alert('Failed to update availability');
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;
    try {
      const res = await fetch(`/api/admin/menu/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== id));
      }
    } catch {
      alert('Failed to delete item');
    }
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || !newItemPrice || !newItemCategory) return;

    try {
      setSaving(true);
      const res = await fetch('/api/admin/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newItemName,
          description: newItemDesc,
          price: Number(newItemPrice),
          imageUrl: newItemImage || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
          categoryId: newItemCategory,
          dietaryLabels: JSON.stringify([newItemDiet]),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setNewItemName('');
        setNewItemDesc('');
        setNewItemPrice('');
        setNewItemImage('');
        await loadData();
      } else {
        alert(data.message || 'Error creating menu item');
      }
    } catch {
      alert('Network error while saving item');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 className="w-8 h-8 text-orange-600 animate-spin mx-auto" />
        <p className="text-sm text-stone-500">Loading menu manager...</p>
      </div>
    );
  }

  const filteredItems = items.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-16">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
          <div>
            <h1 className="text-3xl font-serif font-bold text-stone-900">
              Menu Item Management
            </h1>
            <p className="text-stone-500 text-xs sm:text-sm mt-1">
              Add new creations, adjust prices, and toggle live availability.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs rounded-xl transition flex items-center space-x-1.5 shadow-md shadow-orange-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Menu Item</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search menu items..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          />
        </div>

        {/* Items Table */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs text-stone-600">
            <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider font-semibold border-b border-stone-200">
              <tr>
                <th className="py-3 px-4">Item</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Availability</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-stone-50 transition">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover shrink-0"
                      />
                      <div>
                        <span className="font-bold text-stone-900 block font-serif text-sm">
                          {item.name}
                        </span>
                        <span className="text-[11px] text-stone-400 line-clamp-1 max-w-md">
                          {item.description}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-stone-900">
                    ₹{item.price.toFixed(2)}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleToggleAvailability(item)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition ${
                        item.isAvailable
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                      }`}
                    >
                      {item.isAvailable ? 'Available' : 'Unavailable (Sold Out)'}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 transition"
                      title="Delete item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-stone-100">
              <h3 className="font-serif font-bold text-lg text-stone-900">
                Create New Menu Item
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Dish Name *</label>
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="e.g. Tandoori Lamb Chops"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Description *</label>
                <textarea
                  rows={2}
                  value={newItemDesc}
                  onChange={(e) => setNewItemDesc(e.target.value)}
                  placeholder="Ingredients and culinary notes"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Price (₹ INR) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                    placeholder="395.00"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Category *</label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Image URL</label>
                <input
                  type="url"
                  value={newItemImage}
                  onChange={(e) => setNewItemImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Dietary Tag</label>
                <select
                  value={newItemDiet}
                  onChange={(e) => setNewItemDiet(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                >
                  <option value="Veg">Vegetarian (Veg)</option>
                  <option value="Non-Veg">Non-Vegetarian (Non-Veg)</option>
                  <option value="Vegan">Vegan</option>
                  <option value="Chef Special">Chef Special</option>
                </select>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition"
                >
                  {saving ? 'Creating Item...' : 'Save & Publish Item'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-3 border border-stone-200 text-stone-700 rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
