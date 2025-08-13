import React, { useState } from "react";
import NavBar from "./NavBar";
import { api } from "../api";

export default function ProfilePage({ user, onLogout }) {
  const [current_password, setCurrent] = useState("");
  const [new_password, setNew] = useState("");
  const [msg, setMsg] = useState("");

  const change = async (e)=>{
    e.preventDefault();
    setMsg("");
    try {
      await api("/auth/change_password", { method:"POST", body:{ current_password, new_password } });
      setMsg("تم تغيير كلمة المرور بنجاح");
      setCurrent(""); setNew("");
    } catch {
      setMsg("تعذر تغيير كلمة المرور");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar user={user} onLogout={onLogout} />
      <main className="max-w-3xl mx-auto p-4 space-y-4">
        <h2 className="text-lg font-bold">حسابي</h2>
        <div className="bg-white rounded-xl shadow p-4">
          <div className="text-sm text-gray-600 mb-2">المستخدم: {user?.username}</div>
          <form onSubmit={change} className="space-y-3">
            <div>
              <label className="text-sm">كلمة المرور الحالية</label>
              <input type="password" className="w-full border rounded p-2" value={current_password} onChange={e=>setCurrent(e.target.value)} />
            </div>
            <div>
              <label className="text-sm">كلمة المرور الجديدة</label>
              <input type="password" className="w-full border rounded p-2" value={new_password} onChange={e=>setNew(e.target.value)} />
            </div>
            <button className="px-4 py-2 bg-black text-white rounded">حفظ</button>
          </form>
          {msg && <div className="mt-3 text-sm">{msg}</div>}
        </div>
      </main>
    </div>
  );
}