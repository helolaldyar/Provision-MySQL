import React from 'react';
import { Link } from 'react-router-dom';

export default function NavBar({ onLogout, user }) {
  return (
    <header className="w-full border-b bg-white">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-bold text-xl">بوابة الموظفين</span>
          <nav className="hidden md:flex gap-4 text-sm">
            <Link to="/">لوحة التحكم</Link>
            <Link to="/employees">الموظفون</Link>
            <Link to="/attendance">الحضور</Link>
            <Link to="/leaves">الإجازات</Link>
            <Link to="/payroll">الرواتب</Link>
            <Link to="/departments">الأقسام</Link>
            <Link to="/job-titles">المسميات</Link>
            <Link to="/leave-types">أنواع الإجازات</Link>
            <Link to="/shifts">الورديات</Link>
            <Link to="/documents">المستندات</Link>
            <Link to="/announcements">الإعلانات</Link>
            <Link to="/approvals">الاعتمادات</Link>
            <Link to="/notifications">التنبيهات</Link>
            <Link to="/audit">سجل التدقيق</Link>
            <Link to="/supervisor-attendance">تحضير المشرف</Link>
            <Link to="/qr">QR الحضور</Link>
            <Link to="/users">المستخدمون</Link>
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm">
          {user && <><span>مرحبًا، {user?.username || user?.name || 'مستخدم'}</span><Link className="underline" to="/profile">حسابي</Link></>}
          <button onClick={onLogout} className="px-3 py-1.5 rounded bg-black text-white">تسجيل الخروج</button>
        </div>
      </div>
    </header>
  );
}