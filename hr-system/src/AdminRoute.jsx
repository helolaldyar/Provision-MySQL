import React from "react";
import { Navigate } from "react-router-dom";

export default function AdminRoute({ user, children }) {
  if (!user) return <Navigate to="/login" replace />;
  const role = user.role || user?.user?.role;
  if (!["admin","hr_manager"].includes(role)) return <Navigate to="/" replace />;
  return children;
}