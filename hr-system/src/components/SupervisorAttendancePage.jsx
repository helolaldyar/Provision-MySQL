import React, { useEffect, useState } from "react";
import NavBar from "./NavBar";
import { api } from "../api";

const statuses = [
  { value: "present", label: "حاضر" },
  { value: "late", label: "متأخر" },
  { value: "absent", label: "غائب" },
  { value: "leave", label: "إجازة" },
];

export default function SupervisorAttendancePage({ user, onLogout }) {
  const [date, setDate] = useState(()=> new Date().toISOString().slice(0,10));
  const [rows, setRows] = useState([]);
  const canEdit = ["admin","hr_manager","supervisor"].includes(user?.role);

  const load = async () => {
    const data = await api(`/attendance/my-team?date=${encodeURIComponent(date)}`);
    setRows((data.team||[]).map(r => ({
      employee_id: r.employee_id,
      employee_code: r.employee_code,
      full_name: r.full_name,
      check_in: r.check_in || "",
      check_out: r.check_out || "",
      status: r.status || "present",
      notes: r.notes || ""
    })));
  };

  const save = async () => {
    await api("/attendance/bulk_upsert", { method:"POST", body:{ date, items: rows.map(({employee_id, check_in, check_out, status, notes}) => ({ employee_id, check_in, check_out, status, notes })) } });
    await load();
    alert("تم الحفظ");
  };

  useEffect(()=>{ load(); }, [date]);

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar user={user} onLogout={onLogout} />
      <main className="max-w-6xl mx-auto p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">تحضير المشرف</h2>
          <input type="date" className="border rounded p-2" value={date} onChange={(e)=>setDate(e.target.value)} />
        </div>

        {!canEdit && <div className="text-sm text-red-600">لا تملك صلاحية التعديل.</div>}

        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="p-2">#</th>
                <th className="p-2">الرقم</th>
                <th className="p-2">الاسم</th>
                <th className="p-2">دخول</th>
                <th className="p-2">خروج</th>
                <th className="p-2">الحالة</th>
                <th className="p-2">ملاحظات</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx)=>(
                <tr key={r.employee_id} className="border-t">
                  <td className="p-2">{idx+1}</td>
                  <td className="p-2">{r.employee_code}</td>
                  <td className="p-2">{r.full_name}</td>
                  <td className="p-2"><input disabled={!canEdit} className="border rounded p-1 w-24" value={r.check_in} onChange={e=>{const v=e.target.value; setRows(s=>s.map(x=>x.employee_id===r.employee_id?{...x, check_in:v}:x));}} placeholder="HH:MM" /></td>
                  <td className="p-2"><input disabled={!canEdit} className="border rounded p-1 w-24" value={r.check_out} onChange={e=>{const v=e.target.value; setRows(s=>s.map(x=>x.employee_id===r.employee_id?{...x, check_out:v}:x));}} placeholder="HH:MM" /></td>
                  <td className="p-2">
                    <select disabled={!canEdit} className="border rounded p-1" value={r.status} onChange={e=>{const v=e.target.value; setRows(s=>s.map(x=>x.employee_id===r.employee_id?{...x, status:v}:x));}}>
                      {statuses.map(s=>(<option key={s.value} value={s.value}>{s.label}</option>))}
                    </select>
                  </td>
                  <td className="p-2"><input disabled={!canEdit} className="border rounded p-1 w-48" value={r.notes} onChange={e=>{const v=e.target.value; setRows(s=>s.map(x=>x.employee_id===r.employee_id?{...x, notes:v}:x));}} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <button disabled={!canEdit} onClick={save} className="px-4 py-2 rounded bg-black text-white">حفظ التحضير</button>
        </div>
      </main>
    </div>
  );
}