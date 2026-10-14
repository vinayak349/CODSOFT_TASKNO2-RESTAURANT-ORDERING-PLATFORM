import React from 'react';
import Link from 'next/link';
import { UtensilsCrossed, MapPin, Phone, Mail, Clock, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand Info */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <span className="text-2xl font-serif font-bold text-white tracking-tight">
                Dine<span className="text-orange-500">Desk</span>
              </span>
            </div>
            <p className="text-sm text-stone-400 leading-relaxed mb-6">
              A symphony of authentic heritage culinary traditions and contemporary dining technology. Crafted for extraordinary dining experiences.
            </p>
            <div className="text-xs text-stone-500">
              © 2026 DineDesk Bistro & Bar. All rights reserved.
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/menu" className="hover:text-orange-400 transition">
                  Explore Digital Menu
                </Link>
              </li>
              <li>
                <Link href="/reservations" className="hover:text-orange-400 transition">
                  Book a Table
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-orange-400 transition">
                  Our Culinary Story
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-orange-400 transition">
                  Contact & Directions
                </Link>
              </li>
              <li>
                <Link href="/account/orders" className="hover:text-orange-400 transition">
                  Track Your Order
                </Link>
              </li>
            </ul>
          </div>

          {/* Operating Hours */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-orange-500" />
              <span>Dining Hours</span>
            </h4>
            <div className="space-y-2 text-sm text-stone-400">
              <div className="flex justify-between border-b border-stone-800 pb-1.5">
                <span>Monday - Friday</span>
                <span className="text-white font-medium">11:00 AM - 11:00 PM</span>
              </div>
              <div className="flex justify-between border-b border-stone-800 pb-1.5">
                <span>Saturday - Sunday</span>
                <span className="text-white font-medium">11:00 AM - Midnight</span>
              </div>
              <p className="text-xs text-stone-500 pt-2">
                Kitchen closes 45 minutes prior to closing time.
              </p>
            </div>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Visit Us
            </h4>
            <ul className="space-y-3 text-sm text-stone-400">
              <li className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-orange-500 mt-1 shrink-0" />
                <span>42 Gourmet Avenue, Indiranagar, Bengaluru, Karnataka 560038</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-orange-500 shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-orange-500 shrink-0" />
                <span>concierge@dinedesk.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-stone-800 text-center text-xs text-stone-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>Handcrafted for culinary enthusiasts with precision and passion.</p>
          <div className="flex items-center space-x-4">
            <Link href="/privacy" className="hover:text-stone-300">Privacy Policy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-stone-300">Terms of Service</Link>
            <span>•</span>
            <Link href="/login" className="hover:text-stone-300">Staff Portal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
