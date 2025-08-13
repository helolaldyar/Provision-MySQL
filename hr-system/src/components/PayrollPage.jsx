import React, { useEffect, useState } from 'react';
import NavBar from './NavBar';
import { api } from '../api';

export default function PayrollPage({ user, onLogout }) {
  const [rows, setRows] = useState([]);
  const load = async ()=> setRows((await api('/payroll/')).payroll||[]);
  useEffect(()=>{ load(); }, []);
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar user={user} onLogout={onLogout} />
      <main className="max-w-6xl mx-auto p-4 space-y-4">
        <h2 className="text-lg font-bold">كشوف الرواتب</h2>
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr><th className="p-2">#</th><th className="p-2">الموظف</th><th className="p-2">شهر</th><th className="p-2">أساسي</th><th className="p-2">بدلات</th><th className="p-2">خصومات</th><th className="p-2">الصافي</th><th className="p-2">ملاحظات</th></tr></thead>
            <tbody>{rows.map(r=>(<tr key={r.id} className="border-t">
              <td className="p-2">{r.id}</td><td className="p-2">{r.full_name}</td><td className="p-2">{r.month}</td>
              <td className="p-2">{r.basic}</td><td className="p-2">{r.allowances}</td><td className="p-2">{r.deductions}</td><td className="p-2">{r.net}</td><td className="p-2">{r.notes||"-"}</td>
            </tr>))}</tbody>
          </table>
        </div>
      </main>
    </div>
  );
}