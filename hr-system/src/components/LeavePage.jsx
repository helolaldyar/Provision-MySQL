import React, { useEffect, useState } from 'react';
import NavBar from './NavBar';
import { api } from '../api';

export default function LeavePage({ user, onLogout }) {
  const [rows, setRows] = useState([]);
  const load = async ()=> setRows((await api('/leaves/')).leaves||[]);
  useEffect(()=>{ load(); }, []);
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar user={user} onLogout={onLogout} />
      <main className="max-w-6xl mx-auto p-4 space-y-4">
        <h2 className="text-lg font-bold">طلبات الإجازة</h2>
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr><th className="p-2">#</th><th className="p-2">الموظف</th><th className="p-2">النوع</th><th className="p-2">من</th><th className="p-2">إلى</th><th className="p-2">الحالة</th><th className="p-2">سبب</th></tr></thead>
            <tbody>{rows.map(r=>(<tr key={r.id} className="border-t">
              <td className="p-2">{r.id}</td><td className="p-2">{r.full_name}</td><td className="p-2">{r.leave_type}</td>
              <td className="p-2">{r.start_date}</td><td className="p-2">{r.end_date}</td><td className="p-2">{r.status}</td><td className="p-2">{r.reason||"-"}</td>
            </tr>))}</tbody>
          </table>
        </div>
      </main>
    </div>
  );
}