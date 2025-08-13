import React, { useEffect, useState } from 'react';
import NavBar from './NavBar';
import { api } from '../api';

export default function AttendancePage({ user, onLogout }) {
  const [rows, setRows] = useState([]);
  const load = async ()=> setRows((await api('/attendance/')).attendance||[]);
  useEffect(()=>{ load(); }, []);
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar user={user} onLogout={onLogout} />
      <main className="max-w-6xl mx-auto p-4 space-y-4">
        <h2 className="text-lg font-bold">الحضور (اليوم)</h2>
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr><th className="p-2">#</th><th className="p-2">الموظف</th><th className="p-2">التاريخ</th><th className="p-2">دخول</th><th className="p-2">خروج</th><th className="p-2">الحالة</th><th className="p-2">ملاحظات</th></tr></thead>
            <tbody>{rows.map(r=>(<tr key={r.id} className="border-t">
              <td className="p-2">{r.id}</td><td className="p-2">{r.full_name}</td><td className="p-2">{r.day_date}</td>
              <td className="p-2">{r.check_in||"-"}</td><td className="p-2">{r.check_out||"-"}</td><td className="p-2">{r.status}</td><td className="p-2">{r.notes||"-"}</td>
            </tr>))}</tbody>
          </table>
        </div>
      </main>
    </div>
  );
}