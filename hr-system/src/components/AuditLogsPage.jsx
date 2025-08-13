import React, { useEffect, useState } from "react";
import NavBar from "./NavBar";
import { api } from "../api";

export default function AuditLogsPage({ user, onLogout }) {
  const [rows, setRows] = useState([]);
  const isAdmin = ["admin","hr_manager"].includes(user?.role);
  const load = async ()=> setRows((await api("/audit/")).logs||[]);
  useEffect(()=>{ load(); }, []);
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar user={user} onLogout={onLogout} />
      <main className="max-w-6xl mx-auto p-4 space-y-4">
        <h2 className="text-lg font-bold">سجل التدقيق</h2>
        {!isAdmin && <div className="text-sm text-red-600">يتطلب صلاحية HR/مدير.</div>}
        {isAdmin && (
          <div className="bg-white rounded-xl shadow overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr><th className="p-2">#</th><th className="p-2">المستخدم</th><th className="p-2">الإجراء</th><th className="p-2">الكيان</th><th className="p-2">المعرف</th><th className="p-2">تفاصيل</th><th className="p-2">الوقت</th></tr></thead>
              <tbody>{rows.map(r=>(<tr key={r.id} className="border-t">
                <td className="p-2">{r.id}</td><td className="p-2">{r.user_id}</td><td className="p-2">{r.action}</td><td className="p-2">{r.entity}</td><td className="p-2">{r.entity_id||"-"}</td><td className="p-2">{r.details||"-"}</td><td className="p-2">{r.created_at}</td>
              </tr>))}</tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}