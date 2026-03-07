import { useState, useEffect, useRef } from "react";
import { submissionsApi, userApi } from "../services/api";
import API from "../services/api";

export default function UserDashboard() {
  // Form state
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

  // Data state
  const [workshops, setWorkshops]       = useState([]);
  const [divisions, setDivisions]       = useState([]);
  const [submissions, setSubmissions]   = useState([]);
  const [dashboardData, setDashboardData] = useState(null);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab]       = useState("form");
  const [successMsg, setSuccessMsg]     = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    userApi.getDashboard().then((res) => setDashboardData(res.data)).catch(console.log);
    submissionsApi.mySubmissions().then((res) => setSubmissions(res.data)).catch(console.log);

    // Ambil data dropdown workshop & divisi
    API.get("/workshops").then((res) => setWorkshops(res.data)).catch(console.log);
    API.get("/divisions").then((res) => setDivisions(res.data)).catch(console.log);
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

  const inputStyle = (active) => ({
    width: "100%", padding: "12px 14px",
    border: active ? "2px solid #4F46E5" : "2px solid #E9E8FF",
    borderRadius: 12, fontSize: 14, color: "#1E1B4B",
    background: "#FAFAFE", transition: "border 0.2s",
  });

  const inputWithIconStyle = (active) => ({
    ...inputStyle(active), paddingLeft: 42,
  });

  const labelStyle = {
    display: "block", fontSize: 13, fontWeight: 600,
    color: "#374151", marginBottom: 8,
  };

  const isFormValid = title && kegunaan && quantity && pic;

  return (
    <div style={{ fontFamily: "'Sora', 'Plus Jakarta Sans', sans-serif", background: "#F8F7FF", minHeight: "100vh" }}>
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; }
        input, textarea, select { font-family: 'Sora', sans-serif !important; }
        input:focus, textarea:focus, select:focus { outline: none; }
        .card-hover { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .card-hover:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(99,102,241,0.12) !important; }
        .submit-btn { transition: all 0.2s ease; }
        .submit-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(99,102,241,0.35) !important; }
        .submit-btn:active:not(:disabled) { transform: translateY(0); }
        .tab-btn { transition: all 0.2s ease; cursor: pointer; }
        input::placeholder, textarea::placeholder { color: #C4C4C4; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.3s ease forwards; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #F1F0FF; border-radius: 4px; }
        ::-webkit-scrollbar-thumb { background: #C7C5F5; border-radius: 4px; }
        select option { color: #1E1B4B; }
      `}</style>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>

        {/* Header */}
        {dashboardData && (
          <div className="fade-in" style={{
            background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #A855F7 100%)",
            borderRadius: 20, padding: "28px 32px", marginBottom: 28,
            boxShadow: "0 16px 48px rgba(99,102,241,0.3)",
            display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <div style={{
                width: 56, height: 56, borderRadius: "50%",
                background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)",
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "2px solid rgba(255,255,255,0.3)", fontSize: 22, fontWeight: 700, color: "#fff"
              }}>
                {(dashboardData?.name || dashboardData?.user?.name || "U")[0].toUpperCase()}
              </div>
              <div>
                <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, margin: 0 }}>Selamat datang kembali 👋</p>
                <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 700, margin: "2px 0 0" }}>
                  {dashboardData?.name || dashboardData?.user?.name}
                </h2>
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {[
                { label: "Total",     value: stats.total,    color: "rgba(255,255,255,0.25)" },
                { label: "Menunggu",  value: stats.pending,  color: "rgba(251,191,36,0.3)" },
                { label: "Disetujui", value: stats.approved, color: "rgba(34,197,94,0.3)" },
              ].map((s) => (
                <div key={s.label} style={{
                  background: s.color, borderRadius: 12, padding: "10px 18px", textAlign: "center",
                  border: "1px solid rgba(255,255,255,0.2)", backdropFilter: "blur(10px)"
                }}>
                  <div style={{ color: "#fff", fontSize: 22, fontWeight: 800 }}>{s.value}</div>
                  <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 11, fontWeight: 500 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Success Message */}
        {successMsg && (
          <div className="fade-in" style={{
            background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 12,
            padding: "14px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10
          }}>
            <span style={{ fontSize: 20 }}>✅</span>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#15803D" }}>{successMsg}</p>
            <button onClick={() => setSuccessMsg("")} style={{
              marginLeft: "auto", background: "none", border: "none", color: "#15803D", cursor: "pointer", fontSize: 18
            }}>×</button>
          </div>
        )}

        {/* Tab Navigation */}
        <div style={{
          display: "flex", gap: 8, marginBottom: 24,
          background: "#fff", borderRadius: 14, padding: 6,
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)", width: "fit-content"
        }}>
          {[
            { id: "form", icon: "📦", label: "Ajukan Barang" },
            { id: "list", icon: "📋", label: `Riwayat (${stats.total})` },
          ].map((tab) => (
            <button key={tab.id} className="tab-btn" onClick={() => setActiveTab(tab.id)} style={{
              padding: "10px 22px", borderRadius: 10, border: "none", fontSize: 14, fontWeight: 600,
              background: activeTab === tab.id ? "linear-gradient(135deg, #4F46E5, #7C3AED)" : "transparent",
              color: activeTab === tab.id ? "#fff" : "#9CA3AF",
              boxShadow: activeTab === tab.id ? "0 4px 12px rgba(99,102,241,0.3)" : "none",
            }}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* FORM TAB */}
        {activeTab === "form" && (
          <div className="fade-in" style={{
            background: "#fff", borderRadius: 20, padding: "32px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.06)", border: "1px solid #F0EFFE"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20
              }}>📦</div>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#1E1B4B" }}>Form Pengadaan Barang</h3>
                <p style={{ margin: 0, fontSize: 12, color: "#9CA3AF" }}>Isi semua detail barang yang ingin diajukan</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>

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
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Nama Barang <span style={{ color: "#EF4444" }}>*</span></label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16 }}>🏷️</span>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                      placeholder="Contoh: Laptop Dell Inspiron 15, Kursi Ergonomis..."
                      required style={inputWithIconStyle(title)}
                      onFocus={e => e.target.style.border = "2px solid #4F46E5"}
                      onBlur={e => e.target.style.border = title ? "2px solid #4F46E5" : "2px solid #E9E8FF"}
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
                      onFocus={e => e.target.style.border = "2px solid #4F46E5"}
                      onBlur={e => e.target.style.border = quantity ? "2px solid #4F46E5" : "2px solid #E9E8FF"}
                    />
                    <select value={unit} onChange={(e) => setUnit(e.target.value)}
                      style={{ padding: "12px 10px", border: "2px solid #E9E8FF", borderRadius: 12, fontSize: 14, color: "#1E1B4B", background: "#FAFAFE", cursor: "pointer" }}>
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
                      onFocus={e => e.target.style.border = "2px solid #4F46E5"}
                      onBlur={e => e.target.style.border = pic ? "2px solid #4F46E5" : "2px solid #E9E8FF"}
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
                      onFocus={e => e.target.style.border = "2px solid #4F46E5"}
                      onBlur={e => e.target.style.border = nomorTelepon ? "2px solid #4F46E5" : "2px solid #E9E8FF"}
                    />
                  </div>
                </div>

                {/* Spesifikasi */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Spesifikasi</label>
                  <textarea value={spesifikasi} onChange={(e) => setSpesifikasi(e.target.value)}
                    placeholder="Jelaskan spesifikasi teknis barang jika ada (ukuran, warna, tipe, merek, dll)..."
                    rows={3}
                    style={{ ...inputStyle(spesifikasi), resize: "none", lineHeight: 1.6 }}
                    onFocus={e => e.target.style.border = "2px solid #4F46E5"}
                    onBlur={e => e.target.style.border = spesifikasi ? "2px solid #4F46E5" : "2px solid #E9E8FF"}
                  />
                </div>

                {/* Kegunaan */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Kegunaan <span style={{ color: "#EF4444" }}>*</span></label>
                  <textarea value={kegunaan} onChange={(e) => setKegunaan(e.target.value)}
                    placeholder="Jelaskan untuk apa barang ini digunakan..."
                    required rows={3}
                    style={{ ...inputStyle(kegunaan), resize: "none", lineHeight: 1.6 }}
                    onFocus={e => e.target.style.border = "2px solid #4F46E5"}
                    onBlur={e => e.target.style.border = kegunaan ? "2px solid #4F46E5" : "2px solid #E9E8FF"}
                  />
                </div>

                {/* Keterangan tambahan */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Keterangan Tambahan</label>
                  <textarea value={content} onChange={(e) => setContent(e.target.value)}
                    placeholder="Apakah ada dilokal atatu harus online, sertakan nama toko."
                    rows={3}
                    style={{ ...inputStyle(content), resize: "none", lineHeight: 1.6 }}
                    onFocus={e => e.target.style.border = "2px solid #4F46E5"}
                    onBlur={e => e.target.style.border = content ? "2px solid #4F46E5" : "2px solid #E9E8FF"}
                  />
                </div>

                {/* Status / Urgensi */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Status <span style={{ color: "#EF4444" }}>*</span></label>
                  <div style={{ display: "flex", gap: 10 }}>
                    {Object.entries(urgencyConfig).map(([val, u]) => (
                      <div key={val} onClick={() => setUrgency(val)} style={{
                        flex: 1, padding: "12px 16px", borderRadius: 12, cursor: "pointer",
                        border: urgency === val ? `2px solid ${u.color}` : "2px solid #E9E8FF",
                        background: urgency === val ? `${u.color}15` : "#FAFAFE",
                        transition: "all 0.2s"
                      }}>
                        <div style={{ fontSize: 18, marginBottom: 2 }}>{u.icon}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: urgency === val ? u.color : "#374151" }}>{u.label}</div>
                        <div style={{ fontSize: 11, color: "#9CA3AF" }}>{u.sub}</div>
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
                      onFocus={e => e.target.style.border = "2px solid #4F46E5"}
                      onBlur={e => e.target.style.border = referensiLink ? "2px solid #4F46E5" : "2px solid #E9E8FF"}
                    />
                  </div>
                </div>

                {/* Referensi Gambar */}
                <div>
                  <label style={labelStyle}>Referensi Gambar</label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      padding: "12px 14px", border: referensiGambar ? "2px solid #4F46E5" : "2px dashed #C7C5F5",
                      borderRadius: 12, background: "#FAFAFE", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 10, transition: "border 0.2s"
                    }}>
                    <span style={{ fontSize: 20 }}>🖼️</span>
                    <span style={{ fontSize: 13, color: referensiGambar ? "#4F46E5" : "#9CA3AF", fontWeight: referensiGambar ? 600 : 400 }}>
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
              <div style={{
                background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 12,
                padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10
              }}>
                <span style={{ fontSize: 20 }}>📱</span>
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#15803D" }}>Notifikasi WhatsApp Otomatis</p>
                  <p style={{ margin: 0, fontSize: 12, color: "#16A34A" }}>Setelah submit, notifikasi akan otomatis dikirim ke WhatsApp admin</p>
                </div>
              </div>

              <button type="submit" disabled={isSubmitting || !isFormValid} className="submit-btn"
                style={{
                  width: "100%", padding: "15px",
                  background: isSubmitting || !isFormValid ? "#E5E7EB" : "linear-gradient(135deg, #4F46E5, #7C3AED)",
                  color: isSubmitting || !isFormValid ? "#9CA3AF" : "#fff",
                  border: "none", borderRadius: 14, fontSize: 15, fontWeight: 700,
                  cursor: !isFormValid ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10
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
              <div style={{
                background: "#fff", borderRadius: 20, padding: "60px 32px",
                textAlign: "center", boxShadow: "0 4px 24px rgba(0,0,0,0.06)"
              }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>📭</div>
                <h3 style={{ color: "#1E1B4B", fontWeight: 700, fontSize: 18, margin: "0 0 8px" }}>Belum Ada Pengajuan</h3>
                <p style={{ color: "#9CA3AF", fontSize: 14 }}>Buat pengajuan barang pertama Anda</p>
                <button onClick={() => setActiveTab("form")} style={{
                  marginTop: 20, padding: "12px 28px",
                  background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
                  color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer"
                }}>+ Ajukan Barang</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {submissions.map((item, i) => {
                  const sc = getStatusConfig(item.status);
                  const uc = urgencyConfig[item.urgency] || urgencyConfig.standart;
                  return (
                    <div key={item.id} className="card-hover fade-in" style={{
                      background: "#fff", borderRadius: 16, padding: "20px 24px",
                      boxShadow: "0 2px 12px rgba(0,0,0,0.05)", border: "1px solid #F0EFFE",
                      animationDelay: `${i * 0.04}s`
                    }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                        <div style={{
                          width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                          background: "linear-gradient(135deg, #EEF2FF, #F5F3FF)",
                          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22
                        }}>📦</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          {/* Title + badges */}
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                            <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#1E1B4B" }}>{item.title}</h4>
                            <span style={{
                              padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                              background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`
                            }}>● {sc.label}</span>
                            <span style={{
                              padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                              background: `${uc.color}15`, color: uc.color, border: `1px solid ${uc.color}40`
                            }}>{uc.icon} {uc.label}</span>
                          </div>

                          {/* Info row */}
                          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 6 }}>
                            {item.quantity && (
                              <span style={{ fontSize: 12, color: "#6B7280" }}>📦 {item.quantity} {item.unit}</span>
                            )}
                            {item.workshop?.name && (
                              <span style={{ fontSize: 12, color: "#6B7280" }}>🏭 {item.workshop.name}</span>
                            )}
                            {item.division?.name && (
                              <span style={{ fontSize: 12, color: "#6B7280" }}>🏢 {item.division.name}</span>
                            )}
                            {item.pic && (
                              <span style={{ fontSize: 12, color: "#6B7280" }}>👤 {item.pic}</span>
                            )}
                            <span style={{ fontSize: 12, color: "#9CA3AF" }}>
                              🕐 {new Date(item.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>

                          {/* Kegunaan */}
                          {item.kegunaan && (
                            <p style={{
                              margin: 0, fontSize: 13, color: "#6B7280", lineHeight: 1.5,
                              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 500
                            }}>{item.kegunaan}</p>
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