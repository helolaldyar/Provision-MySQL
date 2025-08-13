import React, { useState } from "react";
import NavBar from "./NavBar";

export default function QRPage({ user, onLogout }) {
  const [employee_id, setEmployeeId] = useState("");
  const [action, setAction] = useState("checkin");
  const isAdmin = ["admin","hr_manager"].includes(user?.role);
  const src = employee_id ? `/api/attendance/qr?employee_id=${employee_id}&action=${action}` : "";

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar user={user} onLogout={onLogout} />
      <main className="max-w-3xl mx-auto p-4 space-y-4">
        <h2 className="text-lg font-bold">QR الحضور</h2>
        {!isAdmin && <div className="text-sm text-red-600">يتطلب صلاحية HR/مدير.</div>}
        {isAdmin && (
          <div className="bg-white rounded-xl shadow p-4 space-y-3">
            <input className="border rounded p-2 w-full" placeholder="رقم الموظف (ID)" value={employee_id} onChange={e=>setEmployeeId(e.target.value)} />
            <select className="border rounded p-2" value={action} onChange={e=>setAction(e.target.value)}>
              <option value="checkin">تشفير دخول</option>
              <option value="checkout">تشفير خروج</option>
            </select>
            {src && <div className="p-4 border rounded"><img alt="QR" src={src} /></div>}
            <p className="text-xs text-gray-500">يُمسح الكود من جوال الموظف؛ يتم تسجيل الدخول/الخروج تلقائيًا.</p>
          </div>
        )}
      </main>
    </div>
  );
}