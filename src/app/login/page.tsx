'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  UtensilsCrossed,
  Lock,
  Mail,
  ArrowRight,
  Loader2,
  AlertCircle,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        // Redirect to intended or home
        router.push('/');
        router.refresh();
      } else {
        setError(result.message || 'Invalid email or password.');
      }
    } catch {
      setError('An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="max-w-md mx-auto py-16 px-4">
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-stone-900 text-white p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-600 mx-auto flex items-center justify-center text-white shadow-md shadow-orange-600/30">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-serif font-bold tracking-tight">
            Sign In to DineDesk
          </h1>
          <p className="text-stone-400 text-xs font-light">
            Access your orders, reservations, or staff operational dashboards.
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. customer@dinedesk.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 disabled:bg-stone-300 text-white font-bold text-sm rounded-xl transition shadow-md shadow-orange-600/30 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="pt-4 border-t border-stone-100 space-y-2.5">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block text-center">
              Quick One-Click Demo Sign-In
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('customer@dinedesk.com', 'Customer@12345')}
                className="p-2 rounded-lg bg-stone-50 hover:bg-stone-100 border border-stone-200 text-center transition"
              >
                <span className="block text-[11px] font-bold text-stone-800">Customer</span>
                <span className="block text-[9px] text-stone-500">Aarav</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('chef@dinedesk.com', 'Kitchen@12345')}
                className="p-2 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-center transition"
              >
                <span className="block text-[11px] font-bold text-amber-900">Kitchen</span>
                <span className="block text-[9px] text-amber-700">Chef Rajesh</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('admin@dinedesk.com', 'Admin@12345')}
                className="p-2 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-800 text-white text-center transition"
              >
                <span className="block text-[11px] font-bold">Admin</span>
                <span className="block text-[9px] text-stone-300">Manager</span>
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-stone-500 pt-2">
            Don&apos;t have an account yet?{' '}
            <Link href="/register" className="font-semibold text-orange-600 hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
