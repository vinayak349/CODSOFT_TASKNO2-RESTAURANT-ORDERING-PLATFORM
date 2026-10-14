'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  UtensilsCrossed,
  ShoppingBag,
  User,
  CalendarCheck,
  ChefHat,
  LayoutDashboard,
  LogOut,
  Menu as MenuIcon,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

export const Navbar = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Digital Menu', href: '/menu' },
    { label: 'Reservations', href: '/reservations' },
    { label: 'About Us', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-11 h-11 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-md shadow-orange-600/20 group-hover:bg-orange-700 transition">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-serif font-bold tracking-tight text-stone-900 block leading-tight">
                Dine<span className="text-orange-600">Desk</span>
              </span>
              <span className="text-[10px] tracking-widest uppercase font-semibold text-stone-500 block">
                Artisanal Dining & Table
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                  isActive(link.href)
                    ? 'text-orange-700 bg-orange-50 font-semibold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Action Area */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Cart Link */}
            <Link
              href="/cart"
              className="relative p-2.5 rounded-xl border border-stone-200 hover:border-orange-300 text-stone-700 hover:text-orange-600 hover:bg-orange-50/50 transition flex items-center"
              aria-label="View shopping cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-orange-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Role Dashboards & User Profile */}
            {user ? (
              <div className="flex items-center space-x-2">
                {user.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    className="flex items-center space-x-1.5 px-3 py-2 bg-stone-900 text-white rounded-lg text-xs font-semibold hover:bg-stone-800 transition shadow-sm"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-orange-400" />
                    <span>Admin Panel</span>
                  </Link>
                )}

                {user.role === 'KITCHEN' && (
                  <Link
                    href="/kitchen"
                    className="flex items-center space-x-1.5 px-3 py-2 bg-amber-600 text-white rounded-lg text-xs font-semibold hover:bg-amber-700 transition shadow-sm"
                  >
                    <ChefHat className="w-3.5 h-3.5" />
                    <span>Kitchen KDS</span>
                  </Link>
                )}

                <Link
                  href="/account"
                  className="flex items-center space-x-1.5 px-3 py-2 border border-stone-200 rounded-lg text-xs font-semibold text-stone-700 hover:bg-stone-100 transition"
                >
                  <User className="w-3.5 h-3.5 text-stone-500" />
                  <span>{user.name.split(' ')[0]}</span>
                </Link>

                <button
                  onClick={() => logout()}
                  title="Log out"
                  className="p-2 text-stone-400 hover:text-rose-600 transition rounded-lg hover:bg-rose-50"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-semibold text-stone-700 hover:text-stone-900 transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition shadow-sm shadow-orange-600/20"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-2">
            <Link
              href="/cart"
              className="relative p-2 rounded-lg border border-stone-200 text-stone-700"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-md text-base font-medium ${
                  isActive(link.href)
                    ? 'text-orange-600 bg-orange-50 font-semibold'
                    : 'text-stone-700 hover:bg-stone-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="pt-3 border-t border-stone-100 flex flex-col space-y-2">
            {user ? (
              <>
                <div className="px-3 py-1 text-xs text-stone-500 font-semibold uppercase tracking-wider">
                  Signed in as {user.name} ({user.role})
                </div>
                {user.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 bg-stone-900 text-white rounded-lg text-sm font-semibold"
                  >
                    <LayoutDashboard className="w-4 h-4 text-orange-400" />
                    <span>Admin Dashboard</span>
                  </Link>
                )}
                {user.role === 'KITCHEN' && (
                  <Link
                    href="/kitchen"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold"
                  >
                    <ChefHat className="w-4 h-4" />
                    <span>Kitchen Dashboard</span>
                  </Link>
                )}
                <Link
                  href="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 border border-stone-200 rounded-lg text-sm font-semibold text-stone-700"
                >
                  <User className="w-4 h-4 text-stone-400" />
                  <span>My Account</span>
                </Link>
                <Link
                  href="/account/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 text-stone-600 text-sm"
                >
                  <ShoppingBag className="w-4 h-4 text-stone-400" />
                  <span>My Orders</span>
                </Link>
                <Link
                  href="/account/reservations"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 text-stone-600 text-sm"
                >
                  <CalendarCheck className="w-4 h-4 text-stone-400" />
                  <span>My Reservations</span>
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="flex items-center space-x-2 px-3 py-2 text-rose-600 text-sm font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2.5 text-center text-sm font-semibold border border-stone-300 rounded-lg text-stone-800"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2.5 text-center text-sm font-semibold bg-orange-600 text-white rounded-lg"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
