import React, { useEffect, useState } from 'react';
import NavBar from './NavBar';
import { api } from '../api';

export default function EmployeesPage({ user, onLogout }) {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState('');
  const [form, setForm] = useState({ employee_code:'', full_name:'', email:'', phone:'', department:'', job_title:'', hire_date:'', basic_salary:0 });

  const load = async ()=>{
    const data = await api(`/employees/?q=${encodeURIComponent(q)}`);
    setRows(data.employees||[]);
  };
  const add = async (e)=>{
    e.preventDefault();
    await api('/employees/', { method:'POST', body: form });
    setForm({ employee_code:'', full_name:'', email:'', phone:'', department:'', job_title:'', hire_date:'', basic_salary:0 });
    load();
  };

  useEffect(()=>{ load(); }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar user={user} onLogout={onLogout} />
      <main className="max-w-6xl mx-auto p-4 space-y-4">
        <h2 className="text-lg font-bold">الموظفون</h2>
        <div className="bg-white rounded-xl shadow p-4 flex gap-2">
          <input className="border rounded p-2 flex-1" placeholder="بحث بالاسم/الرقم" value={q} onChange={e=>setQ(e.target.value)} />
          <button className="px-4 py-2 bg-black text-white rounded" onClick={load}>بحث</button>
        </div>
        <form onSubmit={add} className="bg-white rounded-xl shadow p-4 grid md:grid-cols-3 gap-2">
          <input className="border rounded p-2" placeholder="رقم الموظف" value={form.employee_code} onChange={e=>setForm({...form, employee_code:e.target.value})} />
          <input className="border rounded p-2" placeholder="الاسم الكامل" value={form.full_name} onChange={e=>setForm({...form, full_name:e.target.value})} />
          <input className="border rounded p-2" placeholder="الإيميل" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} />
          <input className="border rounded p-2" placeholder="الهاتف" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} />
          <input className="border rounded p-2" placeholder="القسم" value={form.department} onChange={e=>setForm({...form, department:e.target.value})} />
          <input className="border rounded p-2" placeholder="المسمى" value={form.job_title} onChange={e=>setForm({...form, job_title:e.target.value})} />
          <input className="border rounded p-2" placeholder="تاريخ التوظيف" value={form.hire_date} onChange={e=>setForm({...form, hire_date:e.target.value})} />
          <input className="border rounded p-2" placeholder="الراتب الأساسي" value={form.basic_salary} onChange={e=>setForm({...form, basic_salary:e.target.value})} />
          <button className="px-4 py-2 bg-black text-white rounded">إضافة موظف</button>
        </form>
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr><th className="p-2">#</th><th className="p-2">الرقم</th><th className="p-2">الاسم</th><th className="p-2">الإيميل</th><th className="p-2">القسم</th><th className="p-2">المسمى</th><th className="p-2">الحالة</th><th className="p-2">الراتب</th></tr></thead>
            <tbody>{rows.map(r=>(<tr key={r.id} className="border-t">
              <td className="p-2">{r.id}</td><td className="p-2">{r.employee_code}</td><td className="p-2">{r.full_name}</td>
              <td className="p-2">{r.email||"-"}</td><td className="p-2">{r.department||"-"}</td><td className="p-2">{r.job_title||"-"}</td>
              <td className="p-2">{r.status}</td><td className="p-2">{r.basic_salary}</td>
            </tr>))}</tbody>
          </table>
        </div>
      </main>
    </div>
  );
}