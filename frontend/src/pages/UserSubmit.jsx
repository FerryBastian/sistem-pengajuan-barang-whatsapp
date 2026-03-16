import { useState, useEffect, useRef } from "react";
import { submissionsApi, userApi } from "../services/api";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function UserSubmit() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [workshopId, setWorkshopId]       = useState("");
  const [divisionId, setDivisionId]       = useState("");
  const [title, setTitle]                 = useState("");
  const [quantity, setQuantity]           = useState("");
  const [unit, setUnit]                   = useState("pcs");
  const [spesifikasi, setSpesifikasi]     = useState("");
  const [kegunaan, setKegunaan]           = useState("");
  const [content, setContent]             = useState("");
  const [urgency, setUrgency]             = useState("standart");
  const [pic, setPic]                     = useState("");
  const [nomorTelepon, setNomorTelepon]   = useState("");
  const [referensiLink, setReferensiLink] = useState("");
  const [referensiGambar, setReferensiGambar] = useState(null);
  const [workshops, setWorkshops]         = useState([]);
  const [divisions, setDivisions]         = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [isSubmitting, setIsSubmitting]   = useState(false);
  const [successMsg, setSuccessMsg]       = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    userApi.getDashboard().then(res => setDashboardData(res.data)).catch(console.log);
    API.get("/workshops").then(res => setWorkshops(res.data)).catch(console.log);
    API.get("/divisions").then(res => setDivisions(res.data)).catch(console.log);
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
      await API.post("/submit", formData, { headers: { "Content-Type": "multipart/form-data" } });
      resetForm();
      setSuccessMsg("✅ Pengajuan berhasil dikirim! Notifikasi WhatsApp telah dikirim ke admin.");
      setTimeout(() => navigate("/user/riwayat"), 1500);
    } catch (err) {
      setSuccessMsg("❌ " + (err?.response?.data?.message || "Gagal mengirim pengajuan"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const urgencyConfig = {
    standart:  { color: "#22C55E", icon: "🟢", label: "Standart",  sub: "± 5 Hari (Marketplace)" },
    urgent:    { color: "#F59E0B", icon: "🟠", label: "Urgent",    sub: "± 3 Hari (Baraka by Wa)" },
    emergency: { color: "#EF4444", icon: "🔴", label: "Emergency", sub: "24 Jam (Lokal/Daytrans)" },
  };

  const inputStyle = (active) => ({
    width: "100%", padding: "12px 14px",
    border: active ? "2px solid #0096C7" : "2px solid #cce6f0",
    borderRadius: 12, fontSize: 14, color: "#0D3040",
    background: "#f5fbfd", transition: "border 0.2s",
  });
  const inputWithIconStyle = (active) => ({ ...inputStyle(active), paddingLeft: 42 });
  const labelStyle = { display: "block", fontSize: 13, fontWeight: 600, color: "#0D3040", marginBottom: 8 };
  const isFormValid = title && kegunaan && quantity && pic;

  return (
    <div style={{ fontFamily: "'Barlow', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800&family=Barlow:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`*{box-sizing:border-box}input,textarea,select{font-family:'Barlow',sans-serif!important}input:focus,textarea:focus,select:focus{outline:none}@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}.fade-in{animation:fadeIn 0.3s ease forwards}@keyframes spin{to{transform:rotate(360deg)}}.spin{animation:spin 0.8s linear infinite}input::placeholder,textarea::placeholder{color:#a0c4d4}select option{color:#0D3040}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#d0eef7;border-radius:4px}::-webkit-scrollbar-thumb{background:#0096C7;border-radius:4px}.submit-btn{transition:all 0.2s ease}.submit-btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 8px 24px rgba(0,150,199,0.35)!important}`}</style>

      {/* Header */}
      {dashboardData && (
        <div className="fade-in" style={{
          background: "linear-gradient(135deg, #0077A8, #0096C7, #00B4D8)",
          borderRadius: 20, padding: "24px 28px", marginBottom: 24,
          boxShadow: "0 16px 48px rgba(0,150,199,0.3)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 48, height: 48, borderRadius: "50%", background: "rgba(255,255,255,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, fontWeight: 700, color: "#fff", border: "2px solid rgba(255,255,255,0.3)",
            }}>
              {(dashboardData?.name || dashboardData?.user?.name || "U")[0].toUpperCase()}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.7)" }}>Selamat datang 👋</p>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#fff", fontFamily: "'Barlow Condensed', sans-serif" }}>
                {dashboardData?.name || dashboardData?.user?.name}
              </h2>
            </div>
          </div>
          <button onClick={() => navigate("/user/riwayat")} style={{
            padding: "10px 18px", borderRadius: 12, fontSize: 13, fontWeight: 600,
            background: "rgba(255,255,255,0.2)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)",
            cursor: "pointer", backdropFilter: "blur(10px)",
          }}>📋 Lihat Riwayat</button>
        </div>
      )}

      {/* Success/Error Message */}
      {successMsg && (
        <div className="fade-in" style={{
          background: successMsg.startsWith("✅") ? "#F0FDF4" : "#FFF1F2",
          border: `1px solid ${successMsg.startsWith("✅") ? "#BBF7D0" : "#FECACA"}`,
          borderRadius: 12, padding: "14px 18px", marginBottom: 20,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: successMsg.startsWith("✅") ? "#15803D" : "#BE123C" }}>{successMsg}</p>
          <button onClick={() => setSuccessMsg("")} style={{ marginLeft: "auto", background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#9CA3AF" }}>×</button>
        </div>
      )}

      {/* Form Card */}
      <div className="fade-in" style={{ background: "#fff", borderRadius: 20, padding: "28px 32px", boxShadow: "0 4px 24px rgba(0,150,199,0.08)", border: "1px solid #d4eef8" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg, #0077A8, #0096C7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>📦</div>
          <div>
            <h3 style={{ margin: 0, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20, fontWeight: 800, color: "#0D3040", letterSpacing: 0.5 }}>Form Pengadaan Barang</h3>
            <p style={{ margin: 0, fontSize: 12, color: "#7ab3c4" }}>Isi semua detail barang yang ingin diajukan</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>

            <div>
              <label style={labelStyle}>Workshop</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}>🏭</span>
                <select value={workshopId} onChange={e => setWorkshopId(e.target.value)} style={{ ...inputWithIconStyle(workshopId), cursor: "pointer" }}>
                  <option value="">-- Pilih Workshop --</option>
                  {workshops.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Divisi</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}>🏢</span>
                <select value={divisionId} onChange={e => setDivisionId(e.target.value)} style={{ ...inputWithIconStyle(divisionId), cursor: "pointer" }}>
                  <option value="">-- Pilih Divisi --</option>
                  {divisions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Nama Barang <span style={{ color: "#EF4444" }}>*</span></label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}>🏷️</span>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Contoh: Laptop Dell Inspiron 15..." required style={inputWithIconStyle(title)}
                  onFocus={e => e.target.style.border = "2px solid #0096C7"} onBlur={e => e.target.style.border = title ? "2px solid #0096C7" : "2px solid #cce6f0"} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Jumlah & Satuan <span style={{ color: "#EF4444" }}>*</span></label>
              <div style={{ display: "flex", gap: 8 }}>
                <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="0" min="1" required style={{ ...inputStyle(quantity), flex: 1 }}
                  onFocus={e => e.target.style.border = "2px solid #0096C7"} onBlur={e => e.target.style.border = quantity ? "2px solid #0096C7" : "2px solid #cce6f0"} />
                <select value={unit} onChange={e => setUnit(e.target.value)} style={{ padding: "12px 10px", border: "2px solid #cce6f0", borderRadius: 12, fontSize: 14, color: "#0D3040", background: "#f5fbfd", cursor: "pointer" }}>
                  {["pcs","unit","box","lusin","rim","kg","liter","set","buah","meter","roll"].map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label style={labelStyle}>PIC (Penanggung Jawab) <span style={{ color: "#EF4444" }}>*</span></label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}>👤</span>
                <input type="text" value={pic} onChange={e => setPic(e.target.value)} placeholder="Nama penanggung jawab" required style={inputWithIconStyle(pic)}
                  onFocus={e => e.target.style.border = "2px solid #0096C7"} onBlur={e => e.target.style.border = pic ? "2px solid #0096C7" : "2px solid #cce6f0"} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Nomor Telepon</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}>📞</span>
                <input type="tel" value={nomorTelepon} onChange={e => setNomorTelepon(e.target.value)} placeholder="08123456789" style={inputWithIconStyle(nomorTelepon)}
                  onFocus={e => e.target.style.border = "2px solid #0096C7"} onBlur={e => e.target.style.border = nomorTelepon ? "2px solid #0096C7" : "2px solid #cce6f0"} />
              </div>
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Spesifikasi</label>
              <textarea value={spesifikasi} onChange={e => setSpesifikasi(e.target.value)} placeholder="Spesifikasi teknis barang..." rows={3} style={{ ...inputStyle(spesifikasi), resize: "none", lineHeight: 1.6 }}
                onFocus={e => e.target.style.border = "2px solid #0096C7"} onBlur={e => e.target.style.border = spesifikasi ? "2px solid #0096C7" : "2px solid #cce6f0"} />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Kegunaan <span style={{ color: "#EF4444" }}>*</span></label>
              <textarea value={kegunaan} onChange={e => setKegunaan(e.target.value)} placeholder="Jelaskan untuk apa barang ini digunakan..." required rows={3} style={{ ...inputStyle(kegunaan), resize: "none", lineHeight: 1.6 }}
                onFocus={e => e.target.style.border = "2px solid #0096C7"} onBlur={e => e.target.style.border = kegunaan ? "2px solid #0096C7" : "2px solid #cce6f0"} />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Keterangan Tambahan</label>
              <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Informasi tambahan..." rows={3} style={{ ...inputStyle(content), resize: "none", lineHeight: 1.6 }}
                onFocus={e => e.target.style.border = "2px solid #0096C7"} onBlur={e => e.target.style.border = content ? "2px solid #0096C7" : "2px solid #cce6f0"} />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Urgensi <span style={{ color: "#EF4444" }}>*</span></label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                {Object.entries(urgencyConfig).map(([val, u]) => (
                  <div key={val} onClick={() => setUrgency(val)} style={{
                    padding: "12px 16px", borderRadius: 12, cursor: "pointer",
                    border: urgency === val ? `2px solid ${u.color}` : "2px solid #cce6f0",
                    background: urgency === val ? `${u.color}15` : "#f5fbfd", transition: "all 0.2s",
                  }}>
                    <div style={{ fontSize: 18, marginBottom: 2 }}>{u.icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: urgency === val ? u.color : "#0D3040" }}>{u.label}</div>
                    <div style={{ fontSize: 11, color: "#7ab3c4" }}>{u.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label style={labelStyle}>Referensi Link</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}>🔗</span>
                <input type="url" value={referensiLink} onChange={e => setReferensiLink(e.target.value)} placeholder="https://tokopedia.com/..." style={inputWithIconStyle(referensiLink)}
                  onFocus={e => e.target.style.border = "2px solid #0096C7"} onBlur={e => e.target.style.border = referensiLink ? "2px solid #0096C7" : "2px solid #cce6f0"} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Referensi Gambar</label>
              <div onClick={() => fileInputRef.current?.click()} style={{
                padding: "12px 14px", border: referensiGambar ? "2px solid #0096C7" : "2px dashed #a0d4e8",
                borderRadius: 12, background: "#f5fbfd", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <span style={{ fontSize: 20 }}>🖼️</span>
                <span style={{ fontSize: 13, color: referensiGambar ? "#0096C7" : "#a0c4d4", fontWeight: referensiGambar ? 600 : 400 }}>
                  {referensiGambar ? referensiGambar.name : "Klik untuk upload (JPG, PNG, PDF — max 10MB)"}
                </span>
                {referensiGambar && (
                  <button type="button" onClick={e => { e.stopPropagation(); setReferensiGambar(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                    style={{ marginLeft: "auto", background: "none", border: "none", color: "#EF4444", cursor: "pointer", fontSize: 18 }}>×</button>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png,.pdf" style={{ display: "none" }} onChange={e => setReferensiGambar(e.target.files[0] || null)} />
            </div>

          </div>

          <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 12, padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>📱</span>
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#15803D" }}>Notifikasi WhatsApp Otomatis</p>
              <p style={{ margin: 0, fontSize: 12, color: "#16A34A" }}>Setelah submit, notifikasi akan otomatis dikirim ke WhatsApp admin</p>
            </div>
          </div>

          <button type="submit" disabled={isSubmitting || !isFormValid} className="submit-btn" style={{
            width: "100%", padding: "15px",
            background: isSubmitting || !isFormValid ? "#b0d4e3" : "linear-gradient(135deg, #0077A8, #0096C7)",
            color: "#fff", border: "none", borderRadius: 14, fontSize: 15, fontWeight: 700,
            cursor: !isFormValid ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 1,
          }}>
            {isSubmitting ? (
              <><svg className="spin" width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeDashoffset="10" /></svg>Memproses...</>
            ) : "📤 Kirim Pengajuan"}
          </button>
        </form>
      </div>
    </div>
  );
}   