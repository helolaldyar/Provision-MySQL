import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import Dashboard from "./components/Dashboard";
import EmployeesPage from "./components/EmployeesPage";
import AttendancePage from "./components/AttendancePage";
import LeavePage from "./components/LeavePage";
import PayrollPage from "./components/PayrollPage";
import DepartmentsPage from "./components/DepartmentsPage";
import JobTitlesPage from "./components/JobTitlesPage";
import LeaveTypesPage from "./components/LeaveTypesPage";
import ShiftsPage from "./components/ShiftsPage";
import AnnouncementsPage from "./components/AnnouncementsPage";
import LeaveApprovalsPage from "./components/LeaveApprovalsPage";
import NotificationsPage from "./components/NotificationsPage";
import UsersPage from "./components/UsersPage";
import QRPage from "./components/QRPage";
import AuditLogsPage from "./components/AuditLogsPage";
import SupervisorAttendancePage from "./components/SupervisorAttendancePage";
import DocumentsPage from "./components/DocumentsPage";
import ProfilePage from "./components/ProfilePage";
import AdminRoute from "./AdminRoute";
import { api } from "./api";
import "./App.css";

function PrivateRoute({ user, children }) {
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(()=>{
    const token = localStorage.getItem("token");
    if (token) {
      api("/auth/profile").then((d)=>setUser(d.user)).catch(()=>localStorage.removeItem("token"));
    }
  },[]);

  const logout = ()=>{ localStorage.removeItem("token"); setUser(null); };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage onLogin={setUser} />} />
        <Route path="/" element={<PrivateRoute user={user}><Dashboard user={user} onLogout={logout} /></PrivateRoute>} />
        <Route path="/employees" element={<PrivateRoute user={user}><EmployeesPage user={user} onLogout={logout} /></PrivateRoute>} />
        <Route path="/attendance" element={<PrivateRoute user={user}><AttendancePage user={user} onLogout={logout} /></PrivateRoute>} />
        <Route path="/leaves" element={<PrivateRoute user={user}><LeavePage user={user} onLogout={logout} /></PrivateRoute>} />
        <Route path="/payroll" element={<PrivateRoute user={user}><PayrollPage user={user} onLogout={logout} /></PrivateRoute>} />
        <Route path="/departments" element={<PrivateRoute user={user}><DepartmentsPage user={user} onLogout={logout} /></PrivateRoute>} />
        <Route path="/job-titles" element={<PrivateRoute user={user}><JobTitlesPage user={user} onLogout={logout} /></PrivateRoute>} />
        <Route path="/leave-types" element={<PrivateRoute user={user}><LeaveTypesPage user={user} onLogout={logout} /></PrivateRoute>} />
        <Route path="/shifts" element={<PrivateRoute user={user}><ShiftsPage user={user} onLogout={logout} /></PrivateRoute>} />
        <Route path="/documents" element={<PrivateRoute user={user}><DocumentsPage user={user} onLogout={logout} /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute user={user}><ProfilePage user={user} onLogout={logout} /></PrivateRoute>} />
        <Route path="/announcements" element={<PrivateRoute user={user}><AnnouncementsPage user={user} onLogout={logout} /></PrivateRoute>} />
        <Route path="/approvals" element={<PrivateRoute user={user}><LeaveApprovalsPage user={user} onLogout={logout} /></PrivateRoute>} />
        <Route path="/notifications" element={<PrivateRoute user={user}><NotificationsPage user={user} onLogout={logout} /></PrivateRoute>} />
              <Route path="/users" element={<PrivateRoute user={user}><UsersPage user={user} onLogout={logout} /></PrivateRoute>} />
        <Route path="/qr" element={<PrivateRoute user={user}><QRPage user={user} onLogout={logout} /></PrivateRoute>} />
        <Route path="/audit" element={<PrivateRoute user={user}><AuditLogsPage user={user} onLogout={logout} /></PrivateRoute>} />
              <Route path="/supervisor-attendance" element={<PrivateRoute user={user}><SupervisorAttendancePage user={user} onLogout={logout} /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}