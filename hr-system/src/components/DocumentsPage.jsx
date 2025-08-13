import React, { useEffect, useState } from "react";
import NavBar from "./NavBar";
import { api } from "../api";

export default function DocumentsPage({ user, onLogout }) {
  const [rows, setRows] = useState([]);
  const [employee_id, setEmployeeId] = useState("");
  const [doc_type, setDocType] = useState("");
  const [file, setFile] = useState(null);
  const isAdmin = ["admin","hr_manager"].includes(user?.role);

  const load = async ()=> setRows((await api("/documents/")).documents||[]);
  useEffect(()=>{ load(); }, []);

  const upload = async (e)=>{
    e.preventDefault();
    const token = localStorage.getItem("token");
    const fd = new FormData();
    fd.append("employee_id", employee_id);
    fd.append("doc_type", doc_type);
    if (file) fd.append("file", file);
    const res = await fetch("/api/documents/upload", {
      method:"POST",
      headers: { Authorization: `Bearer ${token}` },
      body: fd
    });
    if (!res.ok) { alert("فشل الرفع"); return; }
    await res.json(); setEmployeeId(""); setDocType(""); setFile(null); load();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar user={user} onLogout={onLogout} />
      <main className="max-w-6xl mx-auto p-4 space-y-4">
        <h2 className="text-lg font-bold">مستندات الموظفين</h2>

        {isAdmin && (
          <form onSubmit={upload} className="bg-white rounded-xl shadow p-4 grid md:grid-cols-4 gap-2">
            <input className="border rounded p-2" placeholder="رقم الموظف (ID)" value={employee_id} onChange={e=>setEmployeeId(e.target.value)} />
            <input className="border rounded p-2" placeholder="نوع المستند" value={doc_type} onChange={e=>setDocType(e.target.value)} />
            <input type="file" className="border rounded p-2" onChange={e=>setFile(e.target.files?.[0]||null)} />
            <button className="px-4 py-2 bg-black text-white rounded">رفع</button>
          </form>
        )}

        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr><th className="p-2">#</th><th className="p-2">الموظف</th><th className="p-2">النوع</th><th className="p-2">الملف</th><th className="p-2">الحالة</th></tr></thead>
            <tbody>{rows.map(r=>(<tr key={r.id} className="border-t">
              <td className="p-2">{r.id}</td><td className="p-2">{r.full_name}</td><td className="p-2">{r.doc_type}</td>
              <td className="p-2">{r.file_url ? <a href={r.file_url}>تنزيل</a> : "-"}</td><td className="p-2">{r.status}</td>
            </tr>))}</tbody>
          </table>
        </div>
      </main>
    </div>
  );
}