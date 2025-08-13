import React, { useEffect, useState } from 'react';
import NavBar from './NavBar';
import { api } from '../api';

export default function Dashboard({ user, onLogout }) {
  const [stats, setStats] = useState(null);
  useEffect(()=>{ api('/dashboard/stats').then(setStats).catch(()=>{}); }, []);
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar user={user} onLogout={onLogout} />
      <main className="max-w-6xl mx-auto p-4 grid gap-4 md:grid-cols-3">
        <section className="col-span-3">
          <h2 className="text-lg font-bold mb-2">لوحة التحكم</h2>
          <p className="text-sm text-gray-600">نظرة عامة على النظام.</p>
        </section>
        <div className="bg-white rounded-xl shadow p-4">
          <div className="text-sm text-gray-500">إجمالي الموظفين</div>
          <div className="text-2xl font-bold">{stats?.employees ?? '-'}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <div className="text-sm text-gray-500">الحضور اليوم</div>
          <div className="text-2xl font-bold">{stats?.present_today ?? '-'}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <div className="text-sm text-gray-500">طلبات الإجازة المعلقة</div>
          <div className="text-2xl font-bold">{stats?.pending_leaves ?? '-'}</div>
        </div>
      </main>
    </div>
  );
}