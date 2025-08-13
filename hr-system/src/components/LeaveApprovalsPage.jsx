import React, { useEffect, useState } from "react";
import NavBar from "./NavBar";
import { api } from "../api";

export default function LeaveApprovalsPage({ user, onLogout }) {
  const [rows, setRows] = useState([]);
  const isAdmin = ["admin","hr_manager"].includes(user?.role);
  const load = async ()=>{
    const data = await api("/leaves/");
    setRows((data.leaves||[]).filter(r=>r.status==='pending'));
  };
  const act = async (id, action)=>{
    await api(`/leaves/${id}/${action}`, { method:"PUT" });
    load();
  };
  useEffect(()=>{ load(); }, []);
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar user={user} onLogout={onLogout} />
      <main className="max-w-6xl mx-auto p-4 space-y-4">
        <h2 className="text-lg font-bold">اعتماد الإجازات</h2>
        {!isAdmin && <div className="text-sm text-red-600">ليس لديك صلاحية الوصول.</div>}
        {isAdmin && (
          <div className="bg-white rounded-xl shadow overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr><th className="p-2">#</th><th className="p-2">الموظف</th><th className="p-2">النوع</th><th className="p-2">من</th><th className="p-2">إلى</th><th className="p-2">إجراء</th></tr></thead>
              <tbody>{rows.map(r=>(<tr key={r.id} className="border-t">
                <td className="p-2">{r.id}</td><td className="p-2">{r.full_name}</td><td className="p-2">{r.leave_type}</td>
                <td className="p-2">{r.start_date}</td><td className="p-2">{r.end_date}</td>
                <td className="p-2 flex gap-2">
                  <button className="px-3 py-1 rounded bg-green-600 text-white" onClick={()=>act(r.id,"approve")}>موافقة</button>
                  <button className="px-3 py-1 rounded bg-red-600 text-white" onClick={()=>act(r.id,"reject")}>رفض</button>
                </td>
              </tr>))}</tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}