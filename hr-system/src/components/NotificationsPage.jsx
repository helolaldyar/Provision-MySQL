import React, { useEffect, useState } from "react";
import NavBar from "./NavBar";
import { api } from "../api";

export default function NotificationsPage({ user, onLogout }) {
  const [rows, setRows] = useState([]);
  const load = async ()=> setRows((await api("/notifications/")).notifications||[]);
  const mark = async (id)=>{ await api(`/notifications/${id}/read`, { method:"PUT" }); load(); };
  useEffect(()=>{ load(); }, []);
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar user={user} onLogout={onLogout} />
      <main className="max-w-4xl mx-auto p-4 space-y-4">
        <h2 className="text-lg font-bold">التنبيهات</h2>
        <div className="bg-white rounded-xl shadow divide-y">
          {rows.map(n=>(
            <div key={n.id} className="p-4 flex items-center justify-between">
              <div>
                <div className="font-semibold">{n.title}</div>
                <div className="text-sm text-gray-600">{n.created_at||""}</div>
                <div className="text-sm">{n.body}</div>
              </div>
              {!n.read_at ? (
                <button className="px-3 py-1 rounded bg-black text-white" onClick={()=>mark(n.id)}>تعليم كمقروء</button>
              ) : <span className="text-xs text-green-600">مقروء</span>}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}