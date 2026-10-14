import React from 'react';
import Link from 'next/link';
import { UtensilsCrossed, Award, Sparkles, Heart, Users, Clock, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Hero Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-orange-600 uppercase tracking-widest block">
          Our Heritage & Passion
        </span>
        <h1 className="text-4xl sm:text-5xl font-serif font-bold text-stone-900 leading-tight">
          Crafting Unforgettable Flavors Since 2012
        </h1>
        <p className="text-stone-600 text-base leading-relaxed">
          At DineDesk, we believe dining is not merely sustenance, but an intimate ritual of connection, heritage recipes, and heartwarming hospitality.
        </p>
      </div>

      {/* Story Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 relative rounded-3xl overflow-hidden shadow-xl border border-stone-200">
          <img
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80"
            alt="DineDesk Bistro Ambiance"
            className="w-full h-[450px] object-cover"
          />
        </div>

        <div className="lg:col-span-6 space-y-6">
          <span className="text-xs font-bold text-orange-600 uppercase tracking-widest block">
            The Philosophy
          </span>
          <h2 className="text-3xl font-serif font-bold text-stone-900">
            Slow Embers, Ancient Secrets, Zero Shortcuts.
          </h2>
          <p className="text-stone-600 text-sm leading-relaxed">
            Our culinary team blends royal Mughal and Awadhi slow-cooking dum techniques with contemporary bistro presentation. Each batch of our Dal Makhani Royale is slow-simmered for 24 continuous hours over charcoal embers, unlocking deep velvety richness without unnecessary heavy creams.
          </p>
          <p className="text-stone-600 text-sm leading-relaxed">
            We mill our garam masalas in small stone batches every morning, pressing whole organic cardamoms, mace, cinnamon quills, and Kashmiri chilies to preserve volatile aromatic oils.
          </p>

          <div className="pt-2">
            <Link
              href="/menu"
              className="inline-flex items-center space-x-2 px-6 py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs rounded-xl transition shadow-md shadow-orange-600/20"
            >
              <span>Explore Our Menu</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
        <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm space-y-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 mx-auto flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-bold text-lg text-stone-900">
            Artisanal Mastery
          </h3>
          <p className="text-stone-500 text-xs leading-relaxed">
            Over three decades of collective royal court kitchen experience under our executive chefs.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm space-y-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 mx-auto flex items-center justify-center">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-bold text-lg text-stone-900">
            Wholesome Integrity
          </h3>
          <p className="text-stone-500 text-xs leading-relaxed">
            Direct farmer partnerships for single-origin whole spices, cold-pressed mustard oil, and pesticide-free produce.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm space-y-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 mx-auto flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-bold text-lg text-stone-900">
            Digital Hospitality
          </h3>
          <p className="text-stone-500 text-xs leading-relaxed">
            From smart table allocations to live order tracking, technology elevates your dining peace of mind.
          </p>
        </div>
      </div>
    </div>
  );
}
