'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Loader2,
  Lock,
} from 'lucide-react';

function MockPaymentGatewayContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const sessionId = searchParams.get('session') || '';
  const orderId = searchParams.get('orderId') || '';
  const amount = searchParams.get('amount') || '0.00';

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleProcessPayment = async (status: 'PAID' | 'FAILED') => {
    try {
      setProcessing(true);
      setError(null);

      const providerReference = `TEST_PAY_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

      const res = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          providerReference,
          status,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        if (status === 'FAILED') {
          router.push(`/account/orders/${orderId}?payment=failed`);
          return;
        }
        throw new Error(data.message || 'Payment processing failed');
      }

      router.push(`/account/orders/${orderId}?payment=success`);
    } catch (err: any) {
      setError(err.message || 'Payment transaction failed.');
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-16 px-4">
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden">
        {/* Gateway Header */}
        <div className="bg-stone-900 text-white p-6 text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-orange-600 mx-auto flex items-center justify-center text-white">
            <Lock className="w-5 h-5" />
          </div>
          <span className="text-xs uppercase tracking-widest text-orange-400 font-bold block">
            DineDesk Secure Test Gateway
          </span>
          <h2 className="text-xl font-serif font-bold">
            Simulated Payment Authorization
          </h2>
        </div>

        {/* Amount & Reference Details */}
        <div className="p-6 space-y-6">
          <div className="bg-stone-50 rounded-2xl p-4 border border-stone-100 text-center space-y-1">
            <span className="text-xs text-stone-500 font-medium">Transaction Amount</span>
            <div className="text-3xl font-bold font-mono text-stone-900">
              ₹{Number(amount).toFixed(2)}
            </div>
            <span className="text-[11px] text-stone-400 font-mono block">
              Session: {sessionId}
            </span>
          </div>

          <div className="text-xs text-stone-500 space-y-1">
            <div className="flex justify-between">
              <span>Mode</span>
              <span className="font-semibold text-stone-700">Sandbox Test Provider</span>
            </div>
            <div className="flex justify-between">
              <span>Security</span>
              <span className="font-semibold text-emerald-700 flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>HMAC Signed</span>
              </span>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">
              {error}
            </div>
          )}

          {/* Action Simulation Buttons */}
          <div className="space-y-3 pt-2">
            <button
              onClick={() => handleProcessPayment('PAID')}
              disabled={processing}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition flex items-center justify-center space-x-2 shadow-md shadow-emerald-600/20"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authorizing...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simulate Successful Payment</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleProcessPayment('FAILED')}
              disabled={processing}
              className="w-full py-3.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs uppercase tracking-wider transition flex items-center justify-center space-x-2"
            >
              <XCircle className="w-4 h-4" />
              <span>Simulate Payment Failure</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MockPaymentGatewayPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-orange-600 animate-spin mx-auto" />
          <p className="text-sm text-stone-500">Connecting to secure payment gateway...</p>
        </div>
      }
    >
      <MockPaymentGatewayContent />
    </Suspense>
  );
}
