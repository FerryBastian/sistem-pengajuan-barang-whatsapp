import { useState, useEffect, useRef } from "react";
import { submissionsApi, userApi } from "../services/api";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import socket from "../services/socket";

export default function UserDashboard() {
  const { user } = useAuth();
  const [workshopId, setWorkshopId]     = useState("");
  const [divisionId, setDivisionId]     = useState("");
  const [title, setTitle]               = useState("");
  const [quantity, setQuantity]         = useState("");
  const [unit, setUnit]                 = useState("pcs");
  const [spesifikasi, setSpesifikasi]   = useState("");
  const [kegunaan, setKegunaan]         = useState("");
  const [content, setContent]           = useState("");
  const [urgency, setUrgency]           = useState("standart");
  const [pic, setPic]                   = useState("");
  const [nomorTelepon, setNomorTelepon] = useState("");
  const [referensiLink, setReferensiLink] = useState("");
  const [referensiGambar, setReferensiGambar] = useState(null);

  const [workshops, setWorkshops]       = useState([]);
  const [divisions, setDivisions]       = useState([]);
  const [submissions, setSubmissions]   = useState([]);
  const [dashboardData, setDashboardData] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab]       = useState("form");
  const [successMsg, setSuccessMsg]     = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    userApi.getDashboard().then((res) => setDashboardData(res.data)).catch(console.log);
    submissionsApi.mySubmissions().then((res) => setSubmissions(res.data)).catch(console.log);
    API.get("/workshops").then((res) => setWorkshops(res.data)).catch(console.log);
    API.get("/divisions").then((res) => setDivisions(res.data)).catch(console.log);

    socket.connect();
    socket.on("notifikasi", (data) => {
      console.log("Notifikasi masuk:", data);
      submissionsApi.mySubmissions().then((res) => setSubmissions(res.data)).catch(console.log);
      setSuccessMsg(`🔔 Status pengajuan "${data.title}" telah diupdate menjadi: ${data.status}`);
    });

    return () => {
      socket.off("notifikasi");
      socket.disconnect();
    };
  }, []);

  const resetForm = () => {
    setWorkshopId(""); setDivisionId(""); setTitle("");
    setQuantity(""); setUnit("pcs"); setSpesifikasi("");
    setKegunaan(""); setContent(""); setUrgency("standart");
    setPic(""); setNomorTelepon(""); setReferensiLink("");
    setReferensiGambar(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMsg("");

    try {
      const formData = new FormData();
      if (workshopId)      formData.append("workshop_id", workshopId);
      if (divisionId)      formData.append("division_id", divisionId);
      formData.append("title", title);
      formData.append("quantity", parseInt(quantity));
      formData.append("unit", unit);
      if (spesifikasi)     formData.append("spesifikasi", spesifikasi);
      formData.append("kegunaan", kegunaan);
      if (content)         formData.append("content", content);
      formData.append("urgency", urgency);
      formData.append("pic", pic);
      if (nomorTelepon)    formData.append("nomor_telepon", nomorTelepon);
      if (referensiLink)   formData.append("referensi_link", referensiLink);
      if (referensiGambar) formData.append("referensi_gambar", referensiGambar);

      await API.post("/submit", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const res = await submissionsApi.mySubmissions();
      setSubmissions(res.data);
      resetForm();
      setSuccessMsg("Pengajuan berhasil dikirim! Notifikasi WhatsApp telah dikirim ke admin.");
      setActiveTab("list");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Gagal mengirim pengajuan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusConfig = (status) => {
    const map = {
      pending:  { bg: "#FFF8E7", border: "#F59E0B", text: "#B45309", label: "Menunggu" },
      approved: { bg: "#F0FDF4", border: "#22C55E", text: "#15803D", label: "Disetujui" },
      rejected: { bg: "#FFF1F2", border: "#F43F5E", text: "#BE123C", label: "Ditolak" },
      review:   { bg: "#EFF6FF", border: "#3B82F6", text: "#1D4ED8", label: "Direview" },
    };
    return map[status?.toLowerCase()] || map.pending;
  };

  const urgencyConfig = {
    standart:  { color: "#22C55E", icon: "🟢", label: "Standart",  sub: "± 5 Hari (Marketplace)" },
    urgent:    { color: "#F59E0B", icon: "🟠", label: "Urgent",    sub: "± 3 Hari (Baraka by Wa)" },
    emergency: { color: "#EF4444", icon: "🔴", label: "Emergency", sub: "24 Jam (Lokal/Daytrans)" },
  };

  const stats = {
    total:    submissions.length,
    pending:  submissions.filter(s => s.status?.toLowerCase() === "pending").length,
    approved: submissions.filter(s => s.status?.toLowerCase() === "approved").length,
    rejected: submissions.filter(s => s.status?.toLowerCase() === "rejected").length,
  };

  // ── Dtech blue theme styles ──
  const inputStyle = (active) => ({
    width: "100%", padding: "12px 14px",
    border: active ? "2px solid #0096C7" : "2px solid #cce6f0",
    borderRadius: 12, fontSize: 14, color: "#0D3040",
    background: "#f5fbfd", transition: "border 0.2s",
  });

  const inputWithIconStyle = (active) => ({
    ...inputStyle(active), paddingLeft: 42,
  });

  const labelStyle = {
    display: "block", fontSize: 13, fontWeight: 600,
    color: "#0D3040", marginBottom: 8,
  };

  const isFormValid = title && kegunaan && quantity && pic;

  return (<div className="min-h-screen" style={{ fontFamily: "'Barlow', sans-serif", background: "#EBF6FA" }}>
    
      <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Barlow:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; }
        input, textarea, select { font-family: 'Barlow', sans-serif !important; }
        input:focus, textarea:focus, select:focus { outline: none; }
        .card-hover { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .card-hover:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(0,150,199,0.12) !important; }
        .submit-btn { transition: all 0.2s ease; }
        .submit-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(0,150,199,0.35) !important; }
        .submit-btn:active:not(:disabled) { transform: translateY(0); }
        .tab-btn { transition: all 0.2s ease; cursor: pointer; }
        input::placeholder, textarea::placeholder { color: #a0c4d4; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.3s ease forwards; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #d0eef7; border-radius: 4px; }
        ::-webkit-scrollbar-thumb { background: #0096C7; border-radius: 4px; }
        select option { color: #0D3040; }
      `}</style>

      <div className="max-w-5xl mx-auto px-3 sm:px-4 md:px-6 py-5 sm:py-8">

        {/* Header */}
        {dashboardData && (
          <div className="fade-in rounded-2xl p-5 sm:p-7 md:p-8 mb-6 sm:mb-7" style={{
            background: "linear-gradient(135deg, #0077A8 0%, #0096C7 50%, #00B4D8 100%)",
            boxShadow: "0 16px 48px rgba(0,150,199,0.3)",
          }}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex-shrink-0" style={{
                  background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: "2px solid rgba(255,255,255,0.3)", fontSize: 20, fontWeight: 700, color: "#fff"
                }}>
                  {(dashboardData?.name || dashboardData?.user?.name || "U")[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-white/70 text-xs sm:text-sm">Selamat datang kembali 👋</p>
                  <h2 className="text-white text-lg sm:text-xl md:text-2xl font-bold mt-0.5"
                    style={{ fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 0.5 }}>
                    {dashboardData?.name || dashboardData?.user?.name}
                  </h2>
                </div>
              </div>
              <div className="flex gap-2 sm:gap-3 flex-wrap">
                {[
                  { label: "Total",     value: stats.total,    color: "rgba(255,255,255,0.25)" },
                  { label: "Menunggu",  value: stats.pending,  color: "rgba(251,191,36,0.3)" },
                  { label: "Disetujui", value: stats.approved, color: "rgba(34,197,94,0.3)" },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl px-3 sm:px-4 py-2 text-center backdrop-blur" style={{
                    background: s.color, border: "1px solid rgba(255,255,255,0.2)"
                  }}>
                    <div className="text-white text-lg sm:text-xl font-extrabold">{s.value}</div>
                    <div className="text-white/75 text-[10px] sm:text-xs font-medium">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {successMsg && (
          <div className="fade-in rounded-xl p-3 sm:p-4 mb-4 sm:mb-5 flex items-start gap-2 sm:gap-3" style={{
            background: "#F0FDF4", border: "1px solid #BBF7D0"
          }}>
            <span className="text-lg sm:text-xl">✅</span>
            <p className="text-sm font-semibold flex-1" style={{ margin: 0, color: "#15803D" }}>{successMsg}</p>
            <button onClick={() => setSuccessMsg("")} className="text-2xl leading-none" style={{
              background: "none", border: "none", color: "#15803D", cursor: "pointer"
            }}>×</button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-5 sm:mb-6 overflow-x-auto pb-2" style={{
          background: "#fff", borderRadius: 14, padding: 6,
          boxShadow: "0 2px 12px rgba(0,150,199,0.08)", width: "fit-content", minWidth: "100%"
        }}>
          {[
            { id: "form", icon: "📦", label: "Ajukan Barang" },
            { id: "list", icon: "📋", label: `Riwayat (${stats.total})` },
          ].map((tab) => (
            <button key={tab.id} className="tab-btn whitespace-nowrap" onClick={() => setActiveTab(tab.id)} style={{
              padding: "10px 18px", borderRadius: 10, border: "none", fontSize: 13, fontWeight: 600,
              background: activeTab === tab.id
                ? "linear-gradient(135deg, #0077A8, #0096C7)"
                : "transparent",
              color: activeTab === tab.id ? "#fff" : "#9CA3AF",
              boxShadow: activeTab === tab.id ? "0 4px 12px rgba(0,150,199,0.3)" : "none",
            }}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* FORM TAB */}
        {activeTab === "form" && (
          <div className="fade-in bg-white rounded-2xl p-5 sm:p-6 md:p-8" style={{
            boxShadow: "0 4px 24px rgba(0,150,199,0.08)", border: "1px solid #d4eef8"
          }}>
            <div className="flex items-center gap-3 mb-6 sm:mb-7">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex-shrink-0" style={{
                background: "linear-gradient(135deg, #0077A8, #0096C7)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18
              }}>📦</div>
              <div>
                <h3 className="text-base sm:text-lg font-bold m-0" style={{ color: "#0D3040", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20, letterSpacing: 0.5 }}>Form Pengadaan Barang</h3>
                <p className="text-xs sm:text-sm m-0" style={{ color: "#7ab3c4" }}>Isi semua detail barang yang ingin diajukan</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 mb-5">

                {/* Workshop */}
                <div>
                  <label style={labelStyle}>Workshop</label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16 }}>🏭</span>
                    <select value={workshopId} onChange={(e) => setWorkshopId(e.target.value)}
                      style={{ ...inputWithIconStyle(workshopId), cursor: "pointer" }}>
                      <option value="">-- Pilih Workshop --</option>
                      {workshops.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </select>
                  </div>
                </div>

                {/* Divisi */}
                <div>
                  <label style={labelStyle}>Divisi</label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16 }}>🏢</span>
                    <select value={divisionId} onChange={(e) => setDivisionId(e.target.value)}
                      style={{ ...inputWithIconStyle(divisionId), cursor: "pointer" }}>
                      <option value="">-- Pilih Divisi --</option>
                      {divisions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                </div>

                {/* Nama Barang */}
                <div className="md:col-span-2">
                  <label style={labelStyle}>Nama Barang <span style={{ color: "#EF4444" }}>*</span></label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base">🏷️</span>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                      placeholder="Contoh: Laptop Dell Inspiron 15, Kursi Ergonomis..."
                      required style={{ ...inputWithIconStyle(title) }}
                      onFocus={e => e.target.style.border = "2px solid #0096C7"}
                      onBlur={e => e.target.style.border = title ? "2px solid #0096C7" : "2px solid #cce6f0"}
                    />
                  </div>
                </div>

                {/* Jumlah + Satuan */}
                <div>
                  <label style={labelStyle}>Jumlah & Satuan <span style={{ color: "#EF4444" }}>*</span></label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)}
                      placeholder="0" min="1" required
                      style={{ ...inputStyle(quantity), flex: 1 }}
                      onFocus={e => e.target.style.border = "2px solid #0096C7"}
                      onBlur={e => e.target.style.border = quantity ? "2px solid #0096C7" : "2px solid #cce6f0"}
                    />
                    <select value={unit} onChange={(e) => setUnit(e.target.value)}
                      style={{ padding: "12px 10px", border: "2px solid #cce6f0", borderRadius: 12, fontSize: 14, color: "#0D3040", background: "#f5fbfd", cursor: "pointer" }}>
                      {["pcs", "unit", "box", "lusin", "rim", "kg", "liter", "set", "buah", "meter", "roll"].map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* PIC */}
                <div>
                  <label style={labelStyle}>PIC (Penanggung Jawab) <span style={{ color: "#EF4444" }}>*</span></label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16 }}>👤</span>
                    <input type="text" value={pic} onChange={(e) => setPic(e.target.value)}
                      placeholder="Nama penanggung jawab pengajuan" required
                      style={inputWithIconStyle(pic)}
                      onFocus={e => e.target.style.border = "2px solid #0096C7"}
                      onBlur={e => e.target.style.border = pic ? "2px solid #0096C7" : "2px solid #cce6f0"}
                    />
                  </div>
                </div>

                {/* Nomor Telepon */}
                <div>
                  <label style={labelStyle}>Nomor Telepon</label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16 }}>📞</span>
                    <input type="tel" value={nomorTelepon} onChange={(e) => setNomorTelepon(e.target.value)}
                      placeholder="Contoh: 08123456789"
                      style={inputWithIconStyle(nomorTelepon)}
                      onFocus={e => e.target.style.border = "2px solid #0096C7"}
                      onBlur={e => e.target.style.border = nomorTelepon ? "2px solid #0096C7" : "2px solid #cce6f0"}
                    />
                  </div>
                </div>

                {/* Spesifikasi */}
                <div className="md:col-span-2">
                  <label style={labelStyle}>Spesifikasi</label>
                  <textarea value={spesifikasi} onChange={(e) => setSpesifikasi(e.target.value)}
                    placeholder="Jelaskan spesifikasi teknis barang jika ada (ukuran, warna, tipe, merek, dll)..."
                    rows={3} className="w-full resize-none"
                    style={{ ...inputStyle(spesifikasi), lineHeight: 1.6 }}
                    onFocus={e => e.target.style.border = "2px solid #0096C7"}
                    onBlur={e => e.target.style.border = spesifikasi ? "2px solid #0096C7" : "2px solid #cce6f0"}
                  />
                </div>

                {/* Kegunaan */}
                <div className="md:col-span-2">
                  <label style={labelStyle}>Kegunaan <span style={{ color: "#EF4444" }}>*</span></label>
                  <textarea value={kegunaan} onChange={(e) => setKegunaan(e.target.value)}
                    placeholder="Jelaskan untuk apa barang ini digunakan..."
                    required rows={3} className="w-full resize-none"
                    style={{ ...inputStyle(kegunaan), lineHeight: 1.6 }}
                    onFocus={e => e.target.style.border = "2px solid #0096C7"}
                    onBlur={e => e.target.style.border = kegunaan ? "2px solid #0096C7" : "2px solid #cce6f0"}
                  />
                </div>

                {/* Keterangan tambahan */}
                <div className="md:col-span-2">
                  <label style={labelStyle}>Keterangan Tambahan</label>
                  <textarea value={content} onChange={(e) => setContent(e.target.value)}
                    placeholder="Informasi tambahan lainnya jika diperlukan..."
                    rows={3} className="w-full resize-none"
                    style={{ ...inputStyle(content), lineHeight: 1.6 }}
                    onFocus={e => e.target.style.border = "2px solid #0096C7"}
                    onBlur={e => e.target.style.border = content ? "2px solid #0096C7" : "2px solid #cce6f0"}
                  />
                </div>

                {/* Status / Urgensi */}
                <div className="md:col-span-2">
                  <label style={labelStyle}>Status <span style={{ color: "#EF4444" }}>*</span></label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                    {Object.entries(urgencyConfig).map(([val, u]) => (
                      <div key={val} onClick={() => setUrgency(val)} className="cursor-pointer rounded-xl p-3 sm:p-4" style={{
                        border: urgency === val ? `2px solid ${u.color}` : "2px solid #cce6f0",
                        background: urgency === val ? `${u.color}15` : "#f5fbfd",
                        transition: "all 0.2s"
                      }}>
                        <div className="text-base sm:text-lg mb-0.5">{u.icon}</div>
                        <div className="text-xs sm:text-sm font-bold" style={{ color: urgency === val ? u.color : "#0D3040" }}>{u.label}</div>
                        <div className="text-[10px] sm:text-xs" style={{ color: "#7ab3c4" }}>{u.sub}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Referensi Link */}
                <div>
                  <label style={labelStyle}>Referensi Link</label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16 }}>🔗</span>
                    <input type="url" value={referensiLink} onChange={(e) => setReferensiLink(e.target.value)}
                      placeholder="https://tokopedia.com/..."
                      style={inputWithIconStyle(referensiLink)}
                      onFocus={e => e.target.style.border = "2px solid #0096C7"}
                      onBlur={e => e.target.style.border = referensiLink ? "2px solid #0096C7" : "2px solid #cce6f0"}
                    />
                  </div>
                </div>

                {/* Referensi Gambar */}
                <div>
                  <label style={labelStyle}>Referensi Gambar</label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      padding: "12px 14px",
                      border: referensiGambar ? "2px solid #0096C7" : "2px dashed #a0d4e8",
                      borderRadius: 12, background: "#f5fbfd", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 10, transition: "border 0.2s"
                    }}>
                    <span style={{ fontSize: 20 }}>🖼️</span>
                    <span style={{ fontSize: 13, color: referensiGambar ? "#0096C7" : "#a0c4d4", fontWeight: referensiGambar ? 600 : 400 }}>
                      {referensiGambar ? referensiGambar.name : "Klik untuk upload (JPG, PNG, PDF — max 10MB)"}
                    </span>
                    {referensiGambar && (
                      <button type="button" onClick={(e) => { e.stopPropagation(); setReferensiGambar(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                        style={{ marginLeft: "auto", background: "none", border: "none", color: "#EF4444", cursor: "pointer", fontSize: 18 }}>×</button>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png,.pdf" style={{ display: "none" }}
                    onChange={(e) => setReferensiGambar(e.target.files[0] || null)}
                  />
                </div>

              </div>

              {/* WA Notice */}
              <div className="rounded-xl p-3 sm:p-4 mb-4 sm:mb-5 flex items-start gap-2 sm:gap-3" style={{
                background: "#F0FDF4", border: "1px solid #BBF7D0"
              }}>
                <span className="text-lg sm:text-xl">📱</span>
                <div>
                  <p className="text-xs sm:text-sm font-semibold m-0" style={{ color: "#15803D" }}>Notifikasi WhatsApp Otomatis</p>
                  <p className="text-xs m-0" style={{ color: "#16A34A" }}>Setelah submit, notifikasi akan otomatis dikirim ke WhatsApp admin</p>
                </div>
              </div>

              <button type="submit" disabled={isSubmitting || !isFormValid} className="submit-btn w-full py-3 sm:py-4 rounded-xl text-sm sm:text-base font-bold" style={{
                background: isSubmitting || !isFormValid
                  ? "#b0d4e3"
                  : "linear-gradient(135deg, #0077A8, #0096C7)",
                color: isSubmitting || !isFormValid ? "#fff" : "#fff",
                border: "none",
                cursor: !isFormValid ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, letterSpacing: 1,
              }}>
                {isSubmitting ? (
                  <>
                    <svg className="spin" width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeDashoffset="10" />
                    </svg>
                    Memproses...
                  </>
                ) : "📤 Kirim Pengajuan"}
              </button>
            </form>
          </div>
        )}

        {/* LIST TAB */}
        {activeTab === "list" && (
          <div className="fade-in">
            {submissions.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 sm:p-10 md:p-12 text-center" style={{
                boxShadow: "0 4px 24px rgba(0,150,199,0.08)"
              }}>
                <div className="text-5xl sm:text-6xl mb-4">📭</div>
                <h3 className="text-lg font-bold mb-2" style={{ color: "#0D3040" }}>Belum Ada Pengajuan</h3>
                <p className="text-sm mb-5" style={{ color: "#7ab3c4" }}>Buat pengajuan barang pertama Anda</p>
                <button onClick={() => setActiveTab("form")} className="px-6 sm:px-8 py-3 rounded-xl text-sm font-semibold" style={{
                  background: "linear-gradient(135deg, #0077A8, #0096C7)",
                  color: "#fff", border: "none", cursor: "pointer"
                }}>+ Ajukan Barang</button>
              </div>
            ) : (
              <div className="flex flex-col gap-3 sm:gap-4">
                {submissions.map((item, i) => {
                  const sc = getStatusConfig(item.status);
                  const uc = urgencyConfig[item.urgency] || urgencyConfig.standart;
                  return (
                    <div key={item.id} className="card-hover fade-in bg-white rounded-2xl p-4 sm:p-5" style={{
                      boxShadow: "0 2px 12px rgba(0,150,199,0.07)", border: "1px solid #d4eef8",
                      animationDelay: `${i * 0.04}s`
                    }}>
                      <div className="flex gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex-shrink-0" style={{
                          background: "linear-gradient(135deg, #d0eef7, #EBF6FA)",
                          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18
                        }}>📦</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <h4 className="text-sm sm:text-base font-bold m-0 truncate" style={{ color: "#0D3040" }}>{item.title}</h4>
                            <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold" style={{
                              background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`
                            }}>● {sc.label}</span>
                            <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold" style={{
                              background: `${uc.color}15`, color: uc.color, border: `1px solid ${uc.color}40`
                            }}>{uc.icon} {uc.label}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1.5 text-[10px] sm:text-xs" style={{ color: "#7ab3c4" }}>
                            {item.quantity && <span>📦 {item.quantity} {item.unit}</span>}
                            {item.workshop?.name && <span>🏭 {item.workshop.name}</span>}
                            {item.division?.name && <span>🏢 {item.division.name}</span>}
                            {item.pic && <span>👤 {item.pic}</span>}
                            <span style={{ color: "#a0c4d4" }}>
                              🕐 {new Date(item.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          {item.kegunaan && (
                            <p className="text-xs sm:text-sm m-0 truncate" style={{ color: "#7ab3c4", lineHeight: 1.5 }}>{item.kegunaan}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}