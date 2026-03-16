import { useState, useEffect } from "react";
import { submissionsApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import socket from "../services/socket";

export default function UserRiwayat() {
  const { user }    = useAuth();
  const navigate    = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [successMsg, setSuccessMsg]   = useState("");
  const [openHistory, setOpenHistory] = useState(null);
  const [search, setSearch]           = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    submissionsApi.mySubmissions()
      .then(res => setSubmissions(res.data))
      .catch(console.log)
      .finally(() => setLoading(false));

    if (user?.id) {
      socket.connect();
      socket.on("connect", () => socket.emit("join", user.id));
    }
    socket.on("notifikasi", (data) => {
      submissionsApi.mySubmissions().then(res => setSubmissions(res.data)).catch(console.log);
      setSuccessMsg(`🔔 Status pengajuan "${data.title}" telah diupdate menjadi: ${data.status}`);
    });

    return () => {
      socket.off("connect");
      socket.off("notifikasi");
      socket.disconnect();
    };
  }, [user?.id]);

  const getStatusConfig = (status) => {
    const map = {
      pending:  { bg: "#FFF8E7", border: "#F59E0B", text: "#B45309", label: "Menunggu",  icon: "⏳" },
      approved: { bg: "#F0FDF4", border: "#22C55E", text: "#15803D", label: "Disetujui", icon: "✅" },
      rejected: { bg: "#FFF1F2", border: "#F43F5E", text: "#BE123C", label: "Ditolak",   icon: "❌" },
      review:   { bg: "#EFF6FF", border: "#3B82F6", text: "#1D4ED8", label: "Direview",  icon: "🔍" },
    };
    return map[status?.toLowerCase()] || map.pending;
  };

  const urgencyConfig = {
    standart:  { color: "#22C55E", icon: "🟢", label: "Standart" },
    urgent:    { color: "#F59E0B", icon: "🟠", label: "Urgent" },
    emergency: { color: "#EF4444", icon: "🔴", label: "Emergency" },
  };

  const stats = {
    total:    submissions.length,
    pending:  submissions.filter(s => s.status?.toLowerCase() === "pending").length,
    approved: submissions.filter(s => s.status?.toLowerCase() === "approved").length,
    rejected: submissions.filter(s => s.status?.toLowerCase() === "rejected").length,
  };

  const filtered = submissions
    .filter(s => filterStatus === "all" || s.status?.toLowerCase() === filterStatus)
    .filter(s => !search || s.title?.toLowerCase().includes(search.toLowerCase()));

  const renderStatusHistory = (item) => {
    const history = item.status_history || [];
    const fallback = [{ status: "pending", note: "Pengajuan dikirim", created_at: item.created_at }];
    if (["review","approved","rejected"].includes(item.status?.toLowerCase()))
      fallback.push({ status: "review", note: "Sedang ditinjau oleh admin", created_at: null });
    if (["approved","rejected"].includes(item.status?.toLowerCase()))
      fallback.push({ status: item.status, note: item.status === "approved" ? "Pengajuan disetujui" : "Pengajuan ditolak", admin_note: item.admin_note || null, created_at: item.updated_at });
    const display = history.length > 0 ? history : fallback;

    return (
      <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #d4eef8" }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: "#7ab3c4", margin: "0 0 12px" }}>Riwayat Status</p>
        {display.map((h, idx) => {
          const sc = getStatusConfig(h.status);
          const isLast = idx === display.length - 1;
          return (
            <div key={idx} style={{ display: "flex", gap: 12 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", flexShrink: 0, background: sc.bg, border: `1.5px solid ${sc.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>{sc.icon}</div>
                {!isLast && <div style={{ width: 1.5, flex: 1, background: "#d4eef8", margin: "4px 0", minHeight: 16 }} />}
              </div>
              <div style={{ paddingBottom: isLast ? 4 : 16, flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: sc.text }}>{sc.label}</div>
                {h.note && <div style={{ fontSize: 12, color: "#7ab3c4", marginTop: 2 }}>{h.note}</div>}
                {h.admin_note && (
                  <div style={{ marginTop: 8, padding: "8px 12px", background: sc.bg, border: `1px solid ${sc.border}`, borderRadius: 8, fontSize: 12, color: sc.text }}>
                    💬 Catatan admin: "{h.admin_note}"
                  </div>
                )}
                {h.created_at && (
                  <div style={{ fontSize: 11, color: "#a0c4d4", marginTop: 3 }}>
                    🕐 {new Date(h.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{ fontFamily: "'Barlow', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800&family=Barlow:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`*{box-sizing:border-box}@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}.fade-in{animation:fadeIn 0.3s ease forwards}.card-hover{transition:transform 0.2s ease,box-shadow 0.2s ease}.card-hover:hover{transform:translateY(-2px);box-shadow:0 12px 40px rgba(0,150,199,0.12)!important}.history-btn{transition:all 0.2s}.history-btn:hover{background:#d4eef8!important}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#0096C7;border-radius:4px}`}</style>

      {/* Header */}
      <div className="fade-in" style={{ marginBottom: 24 }}>
        <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, color: "#0D3040" }}>📋 Riwayat Pengajuan</h2>
        <p style={{ margin: 0, fontSize: 13, color: "#7ab3c4" }}>Pantau status semua pengajuan kamu</p>
      </div>

      {/* Success Message */}
      {successMsg && (
        <div className="fade-in" style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 12, padding: "14px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#15803D", flex: 1 }}>{successMsg}</p>
          <button onClick={() => setSuccessMsg("")} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#9CA3AF" }}>×</button>
        </div>
      )}

      {/* Stats */}
      <div className="fade-in" style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { label: "Total",     value: stats.total,    color: "#0096C7", bg: "#e0f3fa", filter: "all" },
          { label: "Menunggu",  value: stats.pending,  color: "#F59E0B", bg: "#FFF8E7", filter: "pending" },
          { label: "Disetujui", value: stats.approved, color: "#22C55E", bg: "#F0FDF4", filter: "approved" },
          { label: "Ditolak",   value: stats.rejected, color: "#EF4444", bg: "#FFF1F2", filter: "rejected" },
        ].map(s => (
          <div key={s.label} onClick={() => setFilterStatus(filterStatus === s.filter ? "all" : s.filter)} style={{
            background: filterStatus === s.filter ? s.bg : "#fff",
            borderRadius: 14, padding: "14px 20px",
            border: `1.5px solid ${filterStatus === s.filter ? s.color : "#cce6f0"}`,
            cursor: "pointer", transition: "all 0.2s", minWidth: 100,
          }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "#6B7280", fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}

        {/* Search */}
        <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>🔍</span>
          <input type="text" placeholder="Cari nama barang..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", height: "100%", padding: "12px 12px 12px 36px", border: "1.5px solid #cce6f0", borderRadius: 14, fontSize: 13, color: "#0D3040", background: "#fff", fontFamily: "'Barlow', sans-serif", outline: "none" }} />
        </div>

        {/* Tombol Ajukan */}
        <button onClick={() => navigate("/user")} style={{
          padding: "12px 20px", borderRadius: 14, fontSize: 13, fontWeight: 700,
          background: "linear-gradient(135deg, #0077A8, #0096C7)", color: "#fff",
          border: "none", cursor: "pointer", whiteSpace: "nowrap",
          boxShadow: "0 4px 12px rgba(0,150,199,0.3)",
        }}>+ Ajukan Barang</button>
      </div>

      {/* List */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "#7ab3c4" }}>Memuat data...</div>
      ) : filtered.length === 0 ? (
        <div style={{ background: "#fff", borderRadius: 20, padding: "60px 32px", textAlign: "center", boxShadow: "0 4px 24px rgba(0,150,199,0.08)" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>📭</div>
          <h3 style={{ color: "#0D3040", fontWeight: 700, margin: "0 0 8px" }}>Belum Ada Pengajuan</h3>
          <p style={{ color: "#7ab3c4", fontSize: 14, margin: "0 0 20px" }}>Kamu belum punya pengajuan {filterStatus !== "all" ? `dengan status "${filterStatus}"` : ""}</p>
          <button onClick={() => navigate("/user")} style={{ padding: "12px 28px", background: "linear-gradient(135deg, #0077A8, #0096C7)", color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>+ Ajukan Barang</button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map((item, i) => {
            const sc = getStatusConfig(item.status);
            const uc = urgencyConfig[item.urgency] || urgencyConfig.standart;
            const isOpen = openHistory === item.id;
            return (
              <div key={item.id} className="card-hover fade-in" style={{
                background: "#fff", borderRadius: 16, padding: "20px 24px",
                boxShadow: "0 2px 12px rgba(0,150,199,0.07)", border: "1px solid #d4eef8",
                animationDelay: `${i * 0.04}s`,
              }}>
                <div style={{ display: "flex", gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: sc.bg, border: `1.5px solid ${sc.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{sc.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0D3040" }}>{item.title}</h4>
                      <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}>● {sc.label}</span>
                      <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: `${uc.color}15`, color: uc.color, border: `1px solid ${uc.color}40` }}>{uc.icon} {uc.label}</span>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px", fontSize: 12, color: "#7ab3c4", marginBottom: 6 }}>
                      {item.quantity && <span>📦 {item.quantity} {item.unit}</span>}
                      {item.workshop?.name && <span>🏭 {item.workshop.name}</span>}
                      {item.division?.name && <span>🏢 {item.division.name}</span>}
                      {item.pic && <span>👤 {item.pic}</span>}
                      <span>🕐 {new Date(item.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    {item.kegunaan && <p style={{ margin: 0, fontSize: 13, color: "#7ab3c4", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.kegunaan}</p>}
                    <button className="history-btn" onClick={() => setOpenHistory(isOpen ? null : item.id)} style={{
                      marginTop: 10, padding: "5px 12px", fontSize: 12, fontWeight: 600,
                      color: "#0096C7", background: "#EBF6FA", border: "1px solid #a0d4e8",
                      borderRadius: 8, cursor: "pointer", fontFamily: "'Barlow', sans-serif",
                    }}>{isOpen ? "Sembunyikan ▴" : "Lihat riwayat ▾"}</button>
                  </div>
                </div>
                {isOpen && renderStatusHistory(item)}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}