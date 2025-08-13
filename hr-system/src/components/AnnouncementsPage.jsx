import React, { useEffect, useState } from "react";
import NavBar from "./NavBar";
import { api } from "../api";

export default function AnnouncementsPage({ user, onLogout }) {
  const [rows, setRows] = useState([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const isAdmin = ["admin","hr_manager"].includes(user?.role);

  const load = async ()=> setRows((await api("/announcements/")).announcements||[]);
  const add = async (e)=>{ e.preventDefault(); await api("/announcements/",{method:"POST", body:{title, body}}); setTitle(""); setBody(""); load(); };
  useEffect(()=>{ load(); }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar user={user} onLogout={onLogout} />
      <main className="max-w-6xl mx-auto p-4 space-y-4">
        <h2 className="text-lg font-bold">الإعلانات</h2>
        {isAdmin && (
          <form onSubmit={add} className="bg-white rounded-xl shadow p-4 grid gap-2">
            <input className="border rounded p-2" placeholder="العنوان" value={title} onChange={e=>setTitle(e.target.value)} />
            <textarea className="border rounded p-2" rows="4" placeholder="نص الإعلان" value={body} onChange={e=>setBody(e.target.value)} />
            <button className="px-4 py-2 bg-black text-white rounded">نشر</button>
          </form>
        )}
        <div className="bg-white rounded-xl shadow divide-y">
          {rows.map(r=> (
            <div key={r.id} className="p-4">
              <div className="font-semibold">{r.title}</div>
              <div className="text-sm text-gray-600">{r.publish_at||""}</div>
              <p className="mt-2 whitespace-pre-wrap">{r.body}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}