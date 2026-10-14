'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Settings, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { AdminNav } from '@/components/layout/AdminNav';
import { RestaurantSettingsRecord } from '@/lib/db-store';

export default function AdminSettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [settings, setSettings] = useState<RestaurantSettingsRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'ADMIN') {
        router.push('/login');
        return;
      }

      async function loadSettings() {
        try {
          const res = await fetch('/api/admin/settings');
          const data = await res.json();
          if (data.success) {
            setSettings(data.settings);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
      loadSettings();
    }
  }, [user, authLoading, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    try {
      setSaving(true);
      setSavedSuccess(false);

      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (data.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      } else {
        alert(data.message || 'Failed to update settings');
      }
    } catch {
      alert('Error updating settings');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 className="w-8 h-8 text-orange-600 animate-spin mx-auto" />
        <p className="text-sm text-stone-500">Loading restaurant settings...</p>
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="space-y-8 pb-16">
      <AdminNav />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="pb-4 border-b border-stone-200">
          <h1 className="text-3xl font-serif font-bold text-stone-900">
            Restaurant Configuration
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Configure contact details, GST taxation, delivery charges, and table reservation durations.
          </p>
        </div>

        {savedSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs sm:text-sm flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Restaurant configuration updated and saved successfully!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="bg-white p-6 sm:p-10 rounded-3xl border border-stone-200 shadow-sm space-y-6 text-xs">
          {/* Section 1: Brand & Contact */}
          <div className="space-y-4">
            <h2 className="font-serif font-bold text-base text-stone-900 pb-2 border-b border-stone-100">
              Establishment Identity & Concierge
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Restaurant Name</label>
                <input
                  type="text"
                  value={settings.restaurantName}
                  onChange={(e) => setSettings({ ...settings, restaurantName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Brand Tagline</label>
                <input
                  type="text"
                  value={settings.tagline}
                  onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-stone-700 mb-1">Physical Address</label>
                <input
                  type="text"
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Direct Phone</label>
                <input
                  type="text"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Concierge Email</label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 2: Operating Hours & Financials */}
          <div className="space-y-4 pt-4 border-t border-stone-100">
            <h2 className="font-serif font-bold text-base text-stone-900 pb-2 border-b border-stone-100">
              Operations & Pricing Parameters
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Opening Time</label>
                <input
                  type="time"
                  value={settings.openingTime}
                  onChange={(e) => setSettings({ ...settings, openingTime: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Closing Time</label>
                <input
                  type="time"
                  value={settings.closingTime}
                  onChange={(e) => setSettings({ ...settings, closingTime: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Seating Duration (Mins)</label>
                <input
                  type="number"
                  value={settings.reservationDurationMins}
                  onChange={(e) => setSettings({ ...settings, reservationDurationMins: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">GST Tax Rate (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.taxRatePercent}
                  onChange={(e) => setSettings({ ...settings, taxRatePercent: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Delivery Charge (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.deliveryFeeAmount}
                  onChange={(e) => setSettings({ ...settings, deliveryFeeAmount: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Operating Timezone</label>
                <input
                  type="text"
                  value={settings.timezone}
                  disabled
                  className="w-full px-3.5 py-2.5 bg-stone-100 border border-stone-200 rounded-xl text-stone-500 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3.5 bg-orange-600 hover:bg-orange-700 disabled:bg-stone-300 text-white font-bold rounded-xl transition flex items-center space-x-2 shadow-md shadow-orange-600/20"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Restaurant Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
