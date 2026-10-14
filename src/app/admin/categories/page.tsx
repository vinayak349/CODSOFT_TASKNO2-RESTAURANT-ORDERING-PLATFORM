'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Tags, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { AdminNav } from '@/components/layout/AdminNav';
import { CategoryRecord } from '@/lib/db-store';

export default function AdminCategoriesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // New Category State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const loadCategories = async () => {
    try {
      const res = await fetch('/api/menu/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch {
      // Ignore
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
      loadCategories();
    }
  }, [user, authLoading, router]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setSaving(true);
      const generatedSlug = slug.trim() || name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');

      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          slug: generatedSlug,
          description: description.trim() || null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setName('');
        setSlug('');
        setDescription('');
        await loadCategories();
      } else {
        alert(data.message || 'Error creating category');
      }
    } catch {
      alert('Network error');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 className="w-8 h-8 text-orange-600 animate-spin mx-auto" />
        <p className="text-sm text-stone-500">Loading categories...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="pb-4 border-b border-stone-200">
          <h1 className="text-3xl font-serif font-bold text-stone-900">
            Category Management
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Organize dishes into structured culinary groupings for easy menu navigation.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Categories List */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-4">
            <h2 className="font-serif font-bold text-lg text-stone-900 pb-3 border-b border-stone-100">
              Active Categories ({categories.length})
            </h2>

            <div className="space-y-3">
              {categories.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold font-serif text-sm text-stone-900 block">
                      {c.name}
                    </span>
                    <span className="text-xs text-stone-500 block">
                      Slug: <code className="text-orange-600 bg-orange-50 px-1 py-0.5 rounded">{c.slug}</code>
                    </span>
                    {c.description && (
                      <p className="text-[11px] text-stone-400 mt-1">{c.description}</p>
                    )}
                  </div>
                  <span className="text-xs font-mono font-bold text-stone-400">
                    Order #{c.sortOrder}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Add Category Form */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-4">
            <h2 className="font-serif font-bold text-lg text-stone-900 pb-3 border-b border-stone-100">
              Add New Category
            </h2>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Category Title *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!slug) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                  }}
                  placeholder="e.g. Clay Oven Grills"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">URL Slug</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. clay-oven-grills"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-mono text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Description (optional)</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short explanation for customer navigation"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 disabled:bg-stone-300 text-white font-bold rounded-xl transition flex items-center justify-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>{saving ? 'Creating Category...' : 'Create Category'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
