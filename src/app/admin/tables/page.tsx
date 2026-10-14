'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Armchair, Users, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { AdminNav } from '@/components/layout/AdminNav';
import { RestaurantTableRecord } from '@/lib/db-store';

export default function AdminTablesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [tables, setTables] = useState<RestaurantTableRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // New Table State
  const [tableNumber, setTableNumber] = useState('');
  const [capacity, setCapacity] = useState('4');
  const [section, setSection] = useState('Main Dining');
  const [saving, setSaving] = useState(false);

  const loadTables = async () => {
    try {
      const res = await fetch('/api/reservations/tables');
      const data = await res.json();
      if (data.success) {
        setTables(data.tables || []);
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
      loadTables();
    }
  }, [user, authLoading, router]);

  const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableNumber.trim()) return;

    try {
      setSaving(true);
      const res = await fetch('/api/reservations/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableNumber: tableNumber.trim(),
          capacity: Number(capacity),
          section,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTableNumber('');
        await loadTables();
      } else {
        alert(data.message || 'Error creating table');
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
        <p className="text-sm text-stone-500">Loading tables...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="pb-4 border-b border-stone-200">
          <h1 className="text-3xl font-serif font-bold text-stone-900">
            Table & Seating Management
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Configure restaurant table layout, seating capacity, and dining zones.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Tables List */}
          <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
            <h2 className="font-serif font-bold text-lg text-stone-900 pb-3 border-b border-stone-100">
              Configured Tables ({tables.length})
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tables.map((tbl) => (
                <div
                  key={tbl.id}
                  className="p-5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <span className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 font-mono font-bold flex items-center justify-center text-sm shadow-xs">
                      {tbl.tableNumber}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Active
                    </span>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-stone-900 block">
                      {tbl.section || 'Main Dining'}
                    </span>
                    <span className="text-xs text-stone-500 flex items-center space-x-1 mt-0.5">
                      <Users className="w-3.5 h-3.5 text-stone-400" />
                      <span>Capacity: {tbl.capacity} Guests</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Table Form */}
          <div className="lg:col-span-4 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-4">
            <h2 className="font-serif font-bold text-lg text-stone-900 pb-3 border-b border-stone-100">
              Add New Table
            </h2>

            <form onSubmit={handleCreateTable} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Table Number / ID *
                </label>
                <input
                  type="text"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="e.g. T-09 or VIP-02"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-mono uppercase"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Seating Capacity (Guests) *
                </label>
                <select
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                >
                  {[2, 4, 6, 8, 10, 12].map((n) => (
                    <option key={n} value={n}>
                      {n} Guests
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Section / Ambience Area *
                </label>
                <select
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                >
                  <option value="Main Dining">Main Dining</option>
                  <option value="Garden Patio">Garden Patio</option>
                  <option value="Balcony Deck">Balcony Deck</option>
                  <option value="VIP Private Salon">VIP Private Salon</option>
                  <option value="Bar High-Tops">Bar High-Tops</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 disabled:bg-stone-300 text-white font-bold rounded-xl transition flex items-center justify-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>{saving ? 'Adding Table...' : 'Save Table'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
