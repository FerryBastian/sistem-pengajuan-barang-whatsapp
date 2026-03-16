import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  LineChart, Line, BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from "recharts";

export default function AdminDashboard() {
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading]             = useState(true);

  useEffect(() => {
    adminApi.getDashboard()
      .then(res => setDashboardData(res.data))
      .catch(console.log)
      .finally(() => setLoading(false));
  }, []);

  const stats   = dashboardData?.stats;
  const trend   = dashboardData?.trend   || [];
  const monthly = dashboardData?.monthly || [];

  const statusData = [
    { name: "Pending",  value: stats?.pending_count  || 0, color: "#F59E0B" },
    { name: "Approved", value: stats?.approved_count || 0, color: "#22C55E" },
    { name: "Rejected", value: stats?.rejected_count || 0, color: "#EF4444" },
  ];

  const statCards = [
    { label: "Total Users",     value: stats?.total_users,       color: "#0096C7", bg: "#e0f3fa", icon: "👥", path: "/admin/users" },
    { label: "Total Pengajuan", value: stats?.total_submissions, color: "#0077A8", bg: "#d0eef7", icon: "📋", path: "/admin/submissions" },
    { label: "Pending",         value: stats?.pending_count,     color: "#F59E0B", bg: "#FFF8E7", icon: "⏳", path: "/admin/submissions?status=pending" },
    { label: "Approved",        value: stats?.approved_count,    color: "#22C55E", bg: "#F0FDF4", icon: "✅", path: "/admin/submissions?status=approved" },
    { label: "Rejected",        value: stats?.rejected_count,    color: "#EF4444", bg: "#FFF1F2", icon: "❌", path: "/admin/submissions?status=rejected" },
  ];

  const quickLinks = [
    { label: "Pengajuan",       icon: "📋", path: "/admin/submissions", desc: "Lihat & update status" },
    { label: "Workshop",        icon: "🏭", path: "/admin/workshops",   desc: "Kelola workshop" },
    { label: "Divisi",          icon: "🏢", path: "/admin/divisions",   desc: "Kelola divisi" },
    { label: "User Management", icon: "👥", path: "/admin/users",       desc: "Kelola role user" },
  ];

  return (
    <div style={{ fontFamily: "'Barlow', sans-serif" }}>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}.fade-in{animation:fadeIn 0.3s ease forwards}`}</style>

      {/* Header */}
      <div className="fade-in" style={{
        background: "linear-gradient(135deg, #0077A8, #0096C7, #00B4D8)",
        borderRadius: 20, padding: "28px 32px", marginBottom: 24,
        boxShadow: "0 16px 48px rgba(0,150,199,0.3)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <p style={{ margin: "0 0 4px", fontSize: 13, color: "rgba(255,255,255,0.75)" }}>Selamat datang kembali 👋</p>
          <h2 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 800, color: "#fff" }}>{user?.name || "Admin"}</h2>
          <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
            {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>📊</div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "#9CA3AF" }}>Memuat statistik...</div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="fade-in" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14, marginBottom: 24 }}>
            {statCards.map(card => (
              <div key={card.label} onClick={() => navigate(card.path)} style={{
                background: "#fff", borderRadius: 16, padding: "18px 20px",
                border: "1px solid #cce6f0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                cursor: "pointer", transition: "all 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,150,199,0.15)"; e.currentTarget.style.borderColor = card.color; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.04)"; e.currentTarget.style.borderColor = "#cce6f0"; }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 0.5 }}>{card.label}</p>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: card.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{card.icon}</div>
                </div>
                <p style={{ margin: 0, fontSize: 30, fontWeight: 800, color: card.color }}>{card.value ?? 0}</p>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="fade-in" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 20 }}>
            {/* Line Chart */}
            <div style={{ background: "#fff", padding: 24, borderRadius: 16, border: "1px solid #cce6f0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "#0D3040" }}>📈 Trend Pengajuan 7 Hari Terakhir</h3>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f9ff" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #cce6f0", fontSize: 12 }} />
                  <Line type="monotone" dataKey="value" name="Pengajuan" stroke="#0096C7" strokeWidth={2.5} dot={{ fill: "#0096C7", r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div style={{ background: "#fff", padding: 24, borderRadius: 16, border: "1px solid #cce6f0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "#0D3040" }}>🥧 Status Pengajuan</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={3}>
                    {statusData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #cce6f0", fontSize: 12 }} />
                  <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="fade-in" style={{ background: "#fff", padding: 24, borderRadius: 16, border: "1px solid #cce6f0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", marginBottom: 24 }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "#0D3040" }}>📊 Pengajuan per Bulan ({new Date().getFullYear()})</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f9ff" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #cce6f0", fontSize: 12 }} />
                <Bar dataKey="value" name="Pengajuan" fill="#0096C7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Links */}
          <div className="fade-in">
            <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700, color: "#0D3040" }}>⚡ Menu Cepat</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
              {quickLinks.map(link => (
                <div key={link.path} onClick={() => navigate(link.path)} style={{
                  background: "#fff", borderRadius: 14, padding: "16px 20px",
                  border: "1px solid #cce6f0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                  cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 14,
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = "#0096C7"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,150,199,0.15)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "#cce6f0"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.04)"; }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "#EBF6FA", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{link.icon}</div>
                  <div>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#0D3040" }}>{link.label}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "#9CA3AF" }}>{link.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}