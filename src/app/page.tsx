import React from 'react';
import Link from 'next/link';
import {
  Utensils,
  CalendarDays,
  Sparkles,
  ShieldCheck,
  Clock,
  Award,
  ChevronRight,
  Flame,
  Wine,
  ArrowRight,
  MapPin,
  Phone,
} from 'lucide-react';
import { MenuService } from '@/services/menu.service';
import { FoodCard } from '@/components/menu/FoodCard';

export default async function HomePage() {
  const categories = await MenuService.getCategories();
  const allItems = await MenuService.getMenuItems({ onlyAvailable: true });
  const featuredItems = allItems.slice(0, 4);

  return (
    <div className="space-y-24 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-stone-900 text-white pt-16 pb-24 lg:pt-24 lg:pb-32">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ea580c_1px,transparent_1px)] [background-size:24px_24px]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-orange-950/80 border border-orange-500/30 text-orange-400 text-xs font-semibold tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Culinary Artistry Redefined</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-stone-100 leading-[1.15]">
                Where Timeless Heritage <br className="hidden sm:inline" />
                Meets <span className="text-orange-500 italic">Modern Hospitality.</span>
              </h1>

              <p className="text-stone-300 text-base sm:text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light">
                Indulge in charcoal-charred tandoori skewers, 24-hour slow-cooked gravies, and fragrant Awadhi dum biryanis. Order directly online for pickup or dining, or reserve your table in seconds.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <Link
                  href="/menu"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm transition shadow-lg shadow-orange-600/30 flex items-center justify-center space-x-2"
                >
                  <Utensils className="w-4 h-4" />
                  <span>Explore Digital Menu</span>
                </Link>

                <Link
                  href="/reservations"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-100 font-semibold text-sm border border-stone-700 transition flex items-center justify-center space-x-2"
                >
                  <CalendarDays className="w-4 h-4 text-orange-400" />
                  <span>Reserve a Table</span>
                </Link>
              </div>

              {/* Highlights badge bar */}
              <div className="pt-8 border-t border-stone-800/80 grid grid-cols-3 gap-4 text-center lg:text-left">
                <div>
                  <span className="block text-2xl font-bold font-serif text-white">4.9 / 5</span>
                  <span className="text-xs text-stone-400">Over 3,000+ Diner Reviews</span>
                </div>
                <div>
                  <span className="block text-2xl font-bold font-serif text-white">100%</span>
                  <span className="text-xs text-stone-400">Authentic Stone-Ground Spices</span>
                </div>
                <div>
                  <span className="block text-2xl font-bold font-serif text-white">0% Wait</span>
                  <span className="text-xs text-stone-400">Live Kitchen Tracking</span>
                </div>
              </div>
            </div>

            {/* Hero Food Visual */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-orange-950/50 border border-stone-700">
                  <img
                    src="https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1000&q=80"
                    alt="Dal Makhani Royale and Tandoori specialties"
                    className="w-full h-[460px] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent" />
                  
                  <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-stone-900/90 backdrop-blur-md border border-stone-700 text-white flex items-center justify-between">
                    <div>
                      <span className="text-xs text-orange-400 font-bold uppercase tracking-wider block">Signature Special</span>
                      <h4 className="font-serif font-bold text-base">Dal Makhani Royale (24-Hour)</h4>
                      <p className="text-xs text-stone-400">Slow-simmered over charcoal embers</p>
                    </div>
                    <span className="text-lg font-bold font-mono text-orange-400">₹395</span>
                  </div>
                </div>

                {/* Floating badge */}
                <div className="absolute -top-4 -left-4 bg-white text-stone-900 px-4 py-2 rounded-xl shadow-xl flex items-center space-x-2 border border-stone-100">
                  <Award className="w-4 h-4 text-orange-600" />
                  <span className="text-xs font-bold">Awarded Best Heritage Bistro 2026</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FOOD CATEGORIES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <span className="text-xs font-bold text-orange-600 uppercase tracking-widest block mb-1">
              Curated Offerings
            </span>
            <h2 className="text-3xl font-serif font-bold text-stone-900">
              Browse by Culinary Category
            </h2>
          </div>
          <Link
            href="/menu"
            className="mt-4 md:mt-0 text-sm font-semibold text-orange-600 hover:text-orange-700 flex items-center space-x-1"
          >
            <span>View Full Menu</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/menu?category=${cat.slug}`}
              className="group p-5 rounded-2xl bg-white border border-stone-200/80 hover:border-orange-500 hover:shadow-md transition text-center flex flex-col items-center justify-center space-y-3"
            >
              <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition">
                {cat.slug === 'starters' && <Flame className="w-6 h-6" />}
                {cat.slug === 'mains' && <Utensils className="w-6 h-6" />}
                {cat.slug === 'grills' && <Flame className="w-6 h-6" />}
                {cat.slug === 'breads-biryanis' && <Utensils className="w-6 h-6" />}
                {cat.slug === 'desserts' && <Sparkles className="w-6 h-6" />}
                {cat.slug === 'beverages' && <Wine className="w-6 h-6" />}
              </div>
              <h3 className="font-serif font-semibold text-stone-900 text-sm group-hover:text-orange-600 transition">
                {cat.name}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. FEATURED CHEF SPECIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <span className="text-xs font-bold text-orange-600 uppercase tracking-widest block mb-1">
              Epicurean Masterpieces
            </span>
            <h2 className="text-3xl font-serif font-bold text-stone-900">
              Chef&apos;s Signature Highlights
            </h2>
            <p className="text-sm text-stone-500 mt-1">
              Most requested flavors crafted with centuries-old recipes and pure ingredients.
            </p>
          </div>
          <Link
            href="/menu"
            className="mt-4 md:mt-0 text-sm font-semibold text-orange-600 hover:text-orange-700 flex items-center space-x-1"
          >
            <span>See All ({allItems.length}) Items</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredItems.map((item) => (
            <FoodCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* 4. RESTAURANT BENEFITS & SPECIAL OFFERINGS */}
      <section className="bg-stone-100/70 border-y border-stone-200 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-orange-600 uppercase tracking-widest block mb-1">
              The DineDesk Promise
            </span>
            <h2 className="text-3xl font-serif font-bold text-stone-900">
              Hospitality Rooted in Excellence
            </h2>
            <p className="text-sm text-stone-600 mt-2">
              Every detail of your dining journey has been digitized for zero friction and maximum enjoyment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-stone-200/80 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                <Utensils className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-lg text-stone-900">
                Farm-to-Fork Freshness
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                We source fresh highland spices, cold-pressed oils, and farm-fresh dairy daily. No artificial colors, preservatives, or shortcuts.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-stone-200/80 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-lg text-stone-900">
                Real-Time Kitchen Visibility
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                Follow your order from our clay tandoor oven straight to your table or doorstep with live kitchen status updates and zero guesswork.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-stone-200/80 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-lg text-stone-900">
                Guaranteed Table Reservations
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                Smart conflict-prevention algorithms ensure your reserved table in the Main Dining, Balcony, or Garden Patio is ready the moment you arrive.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. HOW ORDERING WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold text-orange-600 uppercase tracking-widest block mb-1">
            Effortless Journey
          </span>
          <h2 className="text-3xl font-serif font-bold text-stone-900">
            How Ordering Works
          </h2>
          <p className="text-sm text-stone-500 mt-2">
            Enjoy your favorites in four simple, seamless steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 text-center space-y-3">
            <span className="w-8 h-8 rounded-full bg-orange-600 text-white font-bold text-sm inline-flex items-center justify-center mb-2">
              1
            </span>
            <h4 className="font-serif font-bold text-stone-900">Browse Menu</h4>
            <p className="text-xs text-stone-500 leading-relaxed">
              Explore vibrant dishes, filter by dietary requirements, and view transparent INR prices.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200 text-center space-y-3">
            <span className="w-8 h-8 rounded-full bg-orange-600 text-white font-bold text-sm inline-flex items-center justify-center mb-2">
              2
            </span>
            <h4 className="font-serif font-bold text-stone-900">Customize Cart</h4>
            <p className="text-xs text-stone-500 leading-relaxed">
              Select fulfillment (Dine-in, Pickup, Delivery) and add special preparation instructions.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200 text-center space-y-3">
            <span className="w-8 h-8 rounded-full bg-orange-600 text-white font-bold text-sm inline-flex items-center justify-center mb-2">
              3
            </span>
            <h4 className="font-serif font-bold text-stone-900">Secure Checkout</h4>
            <p className="text-xs text-stone-500 leading-relaxed">
              Pay online via secure test gateway or choose Cash on Pickup / Dine-in at the counter.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200 text-center space-y-3">
            <span className="w-8 h-8 rounded-full bg-orange-600 text-white font-bold text-sm inline-flex items-center justify-center mb-2">
              4
            </span>
            <h4 className="font-serif font-bold text-stone-900">Track Progress</h4>
            <p className="text-xs text-stone-500 leading-relaxed">
              Watch live status updates as our kitchen staff accepts, prepares, and fulfills your order.
            </p>
          </div>
        </div>
      </section>

      {/* 6. RESERVATION CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-orange-950 via-stone-900 to-stone-950 rounded-3xl p-8 sm:p-14 text-white relative overflow-hidden shadow-xl">
          <div className="max-w-2xl relative z-10 space-y-6">
            <span className="text-xs font-bold text-orange-400 uppercase tracking-widest block">
              Table Bookings & Private Gatherings
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold leading-tight">
              Reserve Your Table for an Unforgettable Evening.
            </h2>
            <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
              Whether celebrating a milestone anniversary, a corporate luncheon, or an intimate dinner under the stars, our concierge is at your service.
            </p>

            <div className="pt-2">
              <Link
                href="/reservations"
                className="inline-flex items-center space-x-2 px-8 py-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm transition shadow-lg shadow-orange-600/30"
              >
                <span>Book Table Online</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CONTACT & OPERATING HOURS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white p-8 sm:p-12 rounded-3xl border border-stone-200 shadow-sm">
          <div className="space-y-6">
            <span className="text-xs font-bold text-orange-600 uppercase tracking-widest block">
              Locate & Connect
            </span>
            <h3 className="text-2xl font-serif font-bold text-stone-900">
              DineDesk Bistro & Bar
            </h3>
            <p className="text-stone-600 text-sm leading-relaxed">
              Conveniently located in the heart of Indiranagar with dedicated valet parking and tranquil open-air seating.
            </p>

            <div className="space-y-3 pt-2 text-sm text-stone-700">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-orange-600 shrink-0" />
                <span>42 Gourmet Avenue, Indiranagar, Bengaluru, KA 560038</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-orange-600 shrink-0" />
                <span>+91 98765 43210 / +91 80 4455 6677</span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-orange-600 shrink-0" />
                <span>Open Daily: 11:00 AM – 11:00 PM (IST)</span>
              </div>
            </div>
          </div>

          <div className="bg-stone-50 rounded-2xl p-6 border border-stone-200 flex flex-col justify-center space-y-4 text-center sm:text-left">
            <h4 className="font-serif font-bold text-stone-900 text-lg">
              Planning a Special Occasion?
            </h4>
            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
              We offer customized menu pairings, floral decorations, and dedicated service staff for celebrations of 8 guests and more in our VIP Private Salon.
            </p>
            <div className="pt-2">
              <Link
                href="/contact"
                className="inline-block px-5 py-2.5 rounded-xl border border-stone-300 hover:border-orange-600 text-stone-800 hover:text-orange-600 text-xs font-bold transition"
              >
                Inquire with Hospitality Manager
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
