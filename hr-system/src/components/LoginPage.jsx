import React, { useState } from "react";
import { api } from "../api";

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api("/auth/login", { method: "POST", body: { username, password } });
      localStorage.setItem("token", data.token);
      onLogin(data.user);
    } catch (err) {
      setError("فشل تسجيل الدخول");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow w-full max-w-sm space-y-4">
        <h1 className="text-xl font-bold text-center">تسجيل الدخول</h1>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <div className="space-y-1">
          <label className="text-sm">اسم المستخدم أو الإيميل</label>
          <input className="w-full border rounded p-2" value={username} onChange={(e)=>setUsername(e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-sm">كلمة المرور</label>
          <input type="password" className="w-full border rounded p-2" value={password} onChange={(e)=>setPassword(e.target.value)} />
        </div>
        <button type="submit" disabled={loading} className="w-full rounded bg-black text-white p-2">
          {loading ? "جارٍ الدخول..." : "دخول"}
        </button>
      </form>
    </div>
  );
}