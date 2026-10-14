'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Shield, RefreshCw, Loader2, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { AdminNav } from '@/components/layout/AdminNav';
import { SafeUser } from '@/services/user.service';
import { Role } from '@/lib/db-store';

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [users, setUsers] = useState<SafeUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
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
      loadUsers();
    }
  }, [user, authLoading, router]);

  const handleRoleChange = async (userId: string, newRole: Role) => {
    try {
      setUpdatingId(userId);
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (data.success) {
        await loadUsers();
      } else {
        alert(data.message || 'Cannot update role');
      }
    } catch {
      alert('Error changing user role');
    } finally {
      setUpdatingId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 className="w-8 h-8 text-orange-600 animate-spin mx-auto" />
        <p className="text-sm text-stone-500">Loading user accounts...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
          <div>
            <h1 className="text-3xl font-serif font-bold text-stone-900">
              User & Role Management
            </h1>
            <p className="text-stone-500 text-xs sm:text-sm mt-1">
              Assign staff credentials, Kitchen KDS access, and administrative privileges safely.
            </p>
          </div>

          <button
            onClick={() => loadUsers()}
            className="p-2 border border-stone-200 rounded-xl hover:bg-stone-50 text-stone-600"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs text-stone-600">
            <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider font-semibold border-b border-stone-200">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Current Role</th>
                <th className="py-3 px-4">Role Assignment</th>
                <th className="py-3 px-4 text-right">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-stone-50 transition">
                  <td className="py-3 px-4 font-bold text-stone-900">
                    {u.name} {user?.id === u.id && <span className="text-orange-600 font-normal">(You)</span>}
                  </td>
                  <td className="py-3 px-4 font-mono text-stone-600">{u.email}</td>
                  <td className="py-3 px-4">{u.phone || '—'}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        u.role === 'ADMIN'
                          ? 'bg-stone-900 text-white border-stone-900'
                          : u.role === 'KITCHEN'
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-stone-100 text-stone-700 border-stone-200'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={u.role}
                      disabled={updatingId === u.id || user?.id === u.id}
                      onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                      className="px-2 py-1 bg-stone-50 border border-stone-200 rounded-lg text-xs font-semibold"
                    >
                      <option value="CUSTOMER">Customer</option>
                      <option value="KITCHEN">Kitchen Staff</option>
                      <option value="ADMIN">Administrator</option>
                    </select>
                  </td>
                  <td className="py-3 px-4 text-right text-stone-400">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
