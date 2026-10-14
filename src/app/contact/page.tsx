'use client';

import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold text-orange-600 uppercase tracking-widest block">
          Get in Touch
        </span>
        <h1 className="text-4xl font-serif font-bold text-stone-900">
          Contact & Directions
        </h1>
        <p className="text-stone-500 text-sm leading-relaxed">
          Questions about catering, private celebrations, or table bookings? Our concierge team is happy to assist.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Contact Info Card */}
        <div className="lg:col-span-5 bg-stone-900 text-white p-8 sm:p-10 rounded-3xl space-y-8">
          <div>
            <span className="text-xs font-bold text-orange-400 uppercase tracking-widest block mb-1">
              Visit The Bistro
            </span>
            <h2 className="text-2xl font-serif font-bold">
              DineDesk Bistro & Bar
            </h2>
          </div>

          <div className="space-y-6 text-sm text-stone-300">
            <div className="flex items-start space-x-3.5">
              <MapPin className="w-5 h-5 text-orange-400 mt-1 shrink-0" />
              <div>
                <strong className="block text-white">Address</strong>
                <span>42 Gourmet Avenue, Indiranagar, Bengaluru, KA 560038</span>
              </div>
            </div>

            <div className="flex items-start space-x-3.5">
              <Phone className="w-5 h-5 text-orange-400 mt-1 shrink-0" />
              <div>
                <strong className="block text-white">Reservations & Order Help</strong>
                <span>+91 98765 43210 / +91 80 4455 6677</span>
              </div>
            </div>

            <div className="flex items-start space-x-3.5">
              <Mail className="w-5 h-5 text-orange-400 mt-1 shrink-0" />
              <div>
                <strong className="block text-white">Email Inquiries</strong>
                <span>concierge@dinedesk.com</span>
              </div>
            </div>

            <div className="flex items-start space-x-3.5">
              <Clock className="w-5 h-5 text-orange-400 mt-1 shrink-0" />
              <div>
                <strong className="block text-white">Hours</strong>
                <span>Mon–Fri: 11:00 AM – 11:00 PM</span>
                <span className="block">Sat–Sun: 11:00 AM – Midnight</span>
              </div>
            </div>
          </div>
        </div>

        {/* Message Inquiry Form */}
        <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-3xl border border-stone-200 shadow-sm space-y-6">
          <h2 className="font-serif font-bold text-xl text-stone-900">
            Send us a Message
          </h2>

          {submitted ? (
            <div className="p-8 text-center bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="font-serif font-bold text-lg text-emerald-950">
                Message Received
              </h3>
              <p className="text-xs text-emerald-800">
                Thank you, {name}! Our hospitality manager will get back to you shortly at {email}.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Your Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Your Email *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="aarav@example.com"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Message / Inquiry *</label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us about your event, dietary needs, or feedback..."
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  required
                />
              </div>

              <button
                type="submit"
                className="px-6 py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition flex items-center space-x-2 shadow-md shadow-orange-600/20"
              >
                <Send className="w-4 h-4" />
                <span>Send Message</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
