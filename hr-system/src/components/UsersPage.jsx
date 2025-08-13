import React, { useEffect, useState } from "react";
import NavBar from "./NavBar";
import { api } from "../api";

export default function UsersPage({ user, onLogout }) {
  const [rows, setRows] = useState([]);
  const [newRole, setNewRole] = useState({});
  const isAdmin = user?.role === "admin";
  const load = async ()=> setRows((await api("/users/")).users||[]);
  const changeRole = async (id)=>{ await api(`/users/${id}/role`, { method:"PUT", body:{ role: newRole[id] } }); load(); };
  const reset = async (id)=>{ const p = prompt("كلمة مرور جديدة (6+ أحرف)"); if(!p) return; await api(`/users/${id}/reset_password`, { method:"PUT", body:{ new_password: p } }); alert("تمت إعادة التعيين"); };
  useEffect(()=>{ load(); }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar user={user} onLogout={onLogout} />
      <main className="max-w-6xl mx-auto p-4 space-y-4">
        <h2 className="text-lg font-bold">المستخدمون</h2>
        {!isAdmin && <div className="text-sm text-red-600">يتطلب صلاحية المدير.</div>}
        {isAdmin && (
          <div className="bg-white rounded-xl shadow overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr><th className="p-2">#</th><th className="p-2">المستخدم</th><th className="p-2">الإيميل</th><th className="p-2">الدور</th><th className="p-2">تغيير الدور</th><th className="p-2">إعادة كلمة المرور</th></tr></thead>
              <tbody>{rows.map(r=>(<tr key={r.id} className="border-t">
                <td className="p-2">{r.id}</td><td className="p-2">{r.username}</td><td className="p-2">{r.email}</td><td className="p-2">{r.role}</td>
                <td className="p-2">
                  <select className="border rounded p-1" value={newRole[r.id] || r.role} onChange={e=>setNewRole({ ...newRole, [r.id]: e.target.value })}>
                    <option value="employee">employee</option>
                    <option value="hr_manager">hr_manager</option>
                    <option value="admin">admin</option>
                  </select>
                  <button className="ml-2 px-3 py-1 rounded bg-black text-white" onClick={()=>changeRole(r.id)}>تحديث</button>
                </td>
                <td className="p-2"><button className="px-3 py-1 rounded border" onClick={()=>reset(r.id)}>إعادة تعيين</button></td>
              </tr>))}</tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}