import socket from "../services/socket";
import { useEffect, useState } from "react";
import { adminApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";

function CrudForm({ title, form, setForm, onSubmit, editing, onCancelEdit, loading: formLoading }) {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6"
      style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.06)", border: "1px solid #cce6f0" }}>
      <h4 className="text-base font-bold mb-4" style={{ color: "#0D3040" }}>
        {editing ? `✏️ Edit ${title}` : `➕ Tambah ${title} Baru`}
      </h4>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1" style={{ color: "#0D3040" }}>Nama <span className="text-red-500">*</span></label>
            <input
              type="text" value={form.name} required
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={`Nama ${title}...`}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
              style={{ border: "1.5px solid #cce6f0", background: "#f5fbfd", color: "#0D3040" }}
              onFocus={e => e.target.style.borderColor = "#0096C7"}
              onBlur={e => e.target.style.borderColor = "#cce6f0"}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1" style={{ color: "#0D3040" }}>Deskripsi</label>
            <input
              type="text" value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Deskripsi singkat (opsional)..."
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
              style={{ border: "1.5px solid #cce6f0", background: "#f5fbfd", color: "#0D3040" }}
              onFocus={e => e.target.style.borderColor = "#0096C7"}
              onBlur={e => e.target.style.borderColor = "#cce6f0"}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id={`active-${title}`} checked={form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            className="w-4 h-4 cursor-pointer" style={{ accentColor: "#0096C7" }}
          />
          <label htmlFor={`active-${title}`} className="text-sm font-medium cursor-pointer" style={{ color: "#0D3040" }}>Aktif</label>
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={formLoading}
            className="px-6 py-2.5 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #0077A8, #0096C7)", boxShadow: "0 4px 12px rgba(0,150,199,0.3)" }}>
            {formLoading ? "Menyimpan..." : editing ? "Update" : "Simpan"}
          </button>
          {editing && (
            <button type="button" onClick={onCancelEdit}
              className="px-6 py-2.5 text-sm font-semibold rounded-xl transition-all"
              style={{ background: "#f5fbfd", color: "#0D3040", border: "1.5px solid #cce6f0" }}>
              Batal
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function CrudTable({ items, onEdit, onDelete, onRestore }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden"
      style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.06)", border: "1px solid #cce6f0" }}>
      {items.length === 0 ? (
        <div className="p-12 text-center" style={{ color: "#9CA3AF" }}>Belum ada data</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ background: "#EBF6FA" }}>
              <tr>
                {["Nama", "Deskripsi", "Status", "Aksi"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase" style={{ color: "#0077A8" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className={`transition-colors ${item.deleted_at ? "opacity-60" : ""}`}
                  style={{ borderTop: "1px solid #e8f4fa" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f5fbfd"}
                  onMouseLeave={e => e.currentTarget.style.background = ""}>
                  <td className="px-4 py-3">
                    <p className="text-sm font-semibold" style={{ color: "#0D3040" }}>{item.name}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm" style={{ color: "#6B7280" }}>{item.description || "-"}</p>
                  </td>
                  <td className="px-4 py-3">
                    {item.deleted_at ? (
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">Dihapus</span>
                    ) : item.is_active ? (
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">Aktif</span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">Nonaktif</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {item.deleted_at ? (
                        <button onClick={() => onRestore(item.id)}
                          className="px-3 py-1.5 text-xs font-semibold bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all">
                          Pulihkan
                        </button>
                      ) : (
                        <>
                          <button onClick={() => onEdit(item)}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all"
                            style={{ background: "#e0f3fa", color: "#0077A8" }}
                            onMouseEnter={e => e.target.style.background = "#c5e9f5"}
                            onMouseLeave={e => e.target.style.background = "#e0f3fa"}>
                            Edit
                          </button>
                          <button onClick={() => onDelete(item.id)}
                            className="px-3 py-1.5 text-xs font-semibold bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all">
                            Hapus
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("submissions");

  const [data, setData] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const [showUsersModal, setShowUsersModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const [workshops, setWorkshops] = useState([]);
  const [workshopForm, setWorkshopForm] = useState({ name: "", description: "", is_active: true });
  const [editingWorkshop, setEditingWorkshop] = useState(null);
  const [workshopLoading, setWorkshopLoading] = useState(false);

  const [divisions, setDivisions] = useState([]);
  const [divisionForm, setDivisionForm] = useState({ name: "", description: "", is_active: true });
  const [editingDivision, setEditingDivision] = useState(null);
  const [divisionLoading, setDivisionLoading] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_APP_URL || "http://localhost:8000";

  const fetchSubmissions = () => {
    setLoading(true);
    Promise.all([adminApi.getDashboard(), adminApi.getSubmissions()])
      .then(([dashRes, subRes]) => { setDashboardData(dashRes.data); setData(subRes.data); })
      .catch(console.log)
      .finally(() => setLoading(false));
  };
  const fetchWorkshops = () => API.get("/admin/workshops").then((res) => setWorkshops(res.data)).catch(console.log);
  const fetchDivisions = () => API.get("/admin/divisions").then((res) => setDivisions(res.data)).catch(console.log);
  const fetchUsers = () => {
    setUsersLoading(true);
    API.get("/admin/users").then((res) => setUsers(res.data)).catch(console.log).finally(() => setUsersLoading(false));
  };
  const handleOpenUsers = () => { setShowUsersModal(true); fetchUsers(); };
  const handleFilterByStatus = (status) => {
    setStatusFilter(status); setActiveTab("submissions");
    setTimeout(() => document.getElementById("submissions-table")?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  useEffect(() => { fetchSubmissions(); fetchWorkshops(); fetchDivisions(); }, []);

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await adminApi.updateSubmissionStatus(id, newStatus);
      setData((prev) => prev.map((item) => item.id === id ? { ...item, status: newStatus } : item));
      if (selectedItem?.id === id) setSelectedItem((prev) => ({ ...prev, status: newStatus }));
      adminApi.getDashboard().then((res) => setDashboardData(res.data));
      const updatedItem = data.find((item) => item.id === id);
      socket.emit("notifikasi", { id, title: updatedItem?.title || "Pengajuan", status: newStatus });
    } catch (err) { console.log(err); }
    finally { setUpdatingId(null); }
  };

  const handleWorkshopSubmit = async (e) => {
    e.preventDefault(); setWorkshopLoading(true);
    try {
      editingWorkshop ? await API.put(`/admin/workshops/${editingWorkshop.id}`, workshopForm) : await API.post("/admin/workshops", workshopForm);
      setWorkshopForm({ name: "", description: "", is_active: true }); setEditingWorkshop(null); fetchWorkshops();
    } catch (err) { alert(err?.response?.data?.message || "Gagal menyimpan workshop"); }
    finally { setWorkshopLoading(false); }
  };
  const handleWorkshopDelete = async (id) => { if (!confirm("Hapus workshop ini?")) return; try { await API.delete(`/admin/workshops/${id}`); fetchWorkshops(); } catch (err) { console.log(err); } };
  const handleWorkshopRestore = async (id) => { try { await API.patch(`/admin/workshops/${id}/restore`); fetchWorkshops(); } catch (err) { console.log(err); } };
  const startEditWorkshop = (w) => { setEditingWorkshop(w); setWorkshopForm({ name: w.name, description: w.description || "", is_active: w.is_active }); };

  const handleDivisionSubmit = async (e) => {
    e.preventDefault(); setDivisionLoading(true);
    try {
      editingDivision ? await API.put(`/admin/divisions/${editingDivision.id}`, divisionForm) : await API.post("/admin/divisions", divisionForm);
      setDivisionForm({ name: "", description: "", is_active: true }); setEditingDivision(null); fetchDivisions();
    } catch (err) { alert(err?.response?.data?.message || "Gagal menyimpan divisi"); }
    finally { setDivisionLoading(false); }
  };
  const handleDivisionDelete = async (id) => { if (!confirm("Hapus divisi ini?")) return; try { await API.delete(`/admin/divisions/${id}`); fetchDivisions(); } catch (err) { console.log(err); } };
  const handleDivisionRestore = async (id) => { try { await API.patch(`/admin/divisions/${id}/restore`); fetchDivisions(); } catch (err) { console.log(err); } };
  const startEditDivision = (d) => { setEditingDivision(d); setDivisionForm({ name: d.name, description: d.description || "", is_active: d.is_active }); };

  const getStatusBadge = (status) => {
    const cfg = {
      pending:  { bg: "#FFF8E7", border: "#F59E0B", text: "#B45309", dot: "#F59E0B", label: "Pending" },
      approved: { bg: "#F0FDF4", border: "#22C55E", text: "#15803D", dot: "#22C55E", label: "Approved" },
      rejected: { bg: "#FFF1F2", border: "#F43F5E", text: "#BE123C", dot: "#F43F5E", label: "Rejected" },
      review:   { bg: "#EFF6FF", border: "#3B82F6", text: "#1D4ED8", dot: "#3B82F6", label: "In Review" },
    };
    const c = cfg[status?.toLowerCase()] || cfg.pending;
    return (
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: "4px 10px", borderRadius: 6,
        background: c.bg, color: c.text,
        border: `1px solid ${c.border}`,
        fontSize: 11, fontWeight: 700, whiteSpace: "nowrap",
      }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot, flexShrink: 0, display: "inline-block" }} />
        {c.label}
      </span>
    );
  };

  const getUrgencyBadge = (urgency) => {
    const cfg = {
      standart:  { color: "#22C55E", label: "Standart" },
      urgent:    { color: "#F59E0B", label: "Urgent" },
      emergency: { color: "#EF4444", label: "Emergency" },
    };
    const c = cfg[urgency?.toLowerCase()] || cfg.standart;
    return (
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: "4px 10px", borderRadius: 6,
        background: `${c.color}18`, color: c.color,
        border: `1px solid ${c.color}50`,
        fontSize: 11, fontWeight: 700, whiteSpace: "nowrap",
      }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.color, flexShrink: 0, display: "inline-block" }} />
        {c.label}
      </span>
    );
  };

  const filteredData = data.filter(item => statusFilter === "all" || item.status?.toLowerCase() === statusFilter);

  return (
    <div className="space-y-6 sm:space-y-8" style={{ fontFamily: "'Sora', sans-serif", }}>
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.3s ease forwards; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; }
      `}</style>

      {/* ── Modal Users ── */}
      {showUsersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
          onClick={() => setShowUsersModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            style={{ border: "1px solid #cce6f0" }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6" style={{ borderBottom: "1px solid #e8f4fa" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg"
                  style={{ background: "linear-gradient(135deg, #0077A8, #0096C7)" }}>👥</div>
                <div>
                  <h3 className="text-lg font-bold" style={{ color: "#0D3040" }}>Daftar Users</h3>
                  <p className="text-xs" style={{ color: "#9CA3AF" }}>{users.length} user terdaftar</p>
                </div>
              </div>
              <button onClick={() => setShowUsersModal(false)} className="text-2xl font-light" style={{ color: "#9CA3AF" }}>×</button>
            </div>
            <div className="p-6">
              {usersLoading ? (
                <div className="text-center py-8">
                  <svg className="spin h-8 w-8 mx-auto" style={{ color: "#0096C7" }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="mt-2 text-sm" style={{ color: "#9CA3AF" }}>Memuat data users...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-8" style={{ color: "#9CA3AF" }}>Belum ada user terdaftar</div>
              ) : (
                <div className="space-y-3">
                  {users.map((u) => (
                    <div key={u.id} className="flex items-center gap-4 p-4 rounded-xl transition-colors"
                      style={{ background: "#f5fbfd" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#e0f3fa"}
                      onMouseLeave={e => e.currentTarget.style.background = "#f5fbfd"}>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: "linear-gradient(135deg, #0096C7, #00B4D8)" }}>
                        <span className="text-white text-sm font-bold">{u.name?.charAt(0).toUpperCase()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold" style={{ color: "#0D3040" }}>{u.name}</p>
                        <p className="text-xs" style={{ color: "#9CA3AF" }}>{u.email}</p>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full" style={{ background: "#e0f3fa", color: "#0077A8" }}>{u.role || "user"}</span>
                        <p className="text-xs mt-1" style={{ color: "#9CA3AF" }}>
                          {new Date(u.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Detail Submission ── */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
          onClick={() => setSelectedItem(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            style={{ border: "1px solid #cce6f0" }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6" style={{ borderBottom: "1px solid #e8f4fa" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg"
                  style={{ background: "linear-gradient(135deg, #0077A8, #0096C7)" }}>📦</div>
                <div>
                  <h3 className="text-lg font-bold" style={{ color: "#0D3040" }}>{selectedItem.title}</h3>
                  <p className="text-xs" style={{ color: "#9CA3AF" }}>ID Pengajuan #{selectedItem.id}</p>
                </div>
              </div>
              <button onClick={() => setSelectedItem(null)} className="text-2xl font-light" style={{ color: "#9CA3AF" }}>×</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex gap-2 flex-wrap">
                {getStatusBadge(selectedItem.status)}
                {getUrgencyBadge(selectedItem.urgency)}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Pengaju",     value: selectedItem.user?.name },
                  { label: "Email",       value: selectedItem.user?.email, isEmail: true },
                  { label: "No. Telepon", value: selectedItem.nomor_telepon || "-", isPhone: true },
                  { label: "PIC",         value: selectedItem.pic || "-" },
                  { label: "Workshop",    value: selectedItem.workshop?.name || "-" },
                  { label: "Divisi",      value: selectedItem.division?.name || "-" },
                  { label: "Nama Barang", value: selectedItem.title },
                  { label: "Jumlah",      value: `${selectedItem.quantity} ${selectedItem.unit}` },
                ].map(({ label, value, isPhone, isEmail }) => {
                  const waNumber = isPhone && value !== "-" ? value.replace(/^0/, "62").replace(/[^0-9]/g, "") : null;
                  return (
                    <div key={label} className="rounded-xl p-3" style={{ background: "#f5fbfd", border: "1px solid #e8f4fa" }}>
                      <p className="text-xs font-medium mb-1" style={{ color: "#9CA3AF" }}>{label}</p>
                      {waNumber ? (
                        <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noreferrer"
                          className="text-sm font-semibold text-green-600 hover:underline flex items-center gap-1">
                          <span>💬</span> {value}
                        </a>
                      ) : isEmail && value ? (
                        <a href={`https://mail.google.com/mail/?view=cm&to=${value}`} target="_blank" rel="noreferrer"
                          className="text-sm font-semibold hover:underline flex items-center gap-1" style={{ color: "#0096C7" }}>
                          <span>✉️</span> {value}
                        </a>
                      ) : (
                        <p className="text-sm font-semibold" style={{ color: "#0D3040" }}>{value}</p>
                      )}
                    </div>
                  );
                })}
              </div>
              {selectedItem.kegunaan && (
                <div className="rounded-xl p-3" style={{ background: "#f5fbfd", border: "1px solid #e8f4fa" }}>
                  <p className="text-xs font-medium mb-1" style={{ color: "#9CA3AF" }}>Kegunaan</p>
                  <p className="text-sm" style={{ color: "#0D3040" }}>{selectedItem.kegunaan}</p>
                </div>
              )}
              {selectedItem.spesifikasi && (
                <div className="rounded-xl p-3" style={{ background: "#f5fbfd", border: "1px solid #e8f4fa" }}>
                  <p className="text-xs font-medium mb-1" style={{ color: "#9CA3AF" }}>Spesifikasi</p>
                  <p className="text-sm" style={{ color: "#0D3040" }}>{selectedItem.spesifikasi}</p>
                </div>
              )}
              {selectedItem.content && (
                <div className="rounded-xl p-3" style={{ background: "#f5fbfd", border: "1px solid #e8f4fa" }}>
                  <p className="text-xs font-medium mb-1" style={{ color: "#9CA3AF" }}>Keterangan Tambahan</p>
                  <p className="text-sm" style={{ color: "#0D3040" }}>{selectedItem.content}</p>
                </div>
              )}
              {selectedItem.referensi_link && (
                <div className="rounded-xl p-3" style={{ background: "#f5fbfd", border: "1px solid #e8f4fa" }}>
                  <p className="text-xs font-medium mb-1" style={{ color: "#9CA3AF" }}>Referensi Link</p>
                  <a href={selectedItem.referensi_link} target="_blank" rel="noreferrer"
                    className="text-sm hover:underline break-all" style={{ color: "#0096C7" }}>{selectedItem.referensi_link}</a>
                </div>
              )}
              {selectedItem.referensi_gambar && (
                <div className="rounded-xl p-3" style={{ background: "#f5fbfd", border: "1px solid #e8f4fa" }}>
                  <p className="text-xs font-medium mb-2" style={{ color: "#9CA3AF" }}>Referensi Gambar</p>
                  {selectedItem.referensi_gambar.match(/\.(jpg|jpeg|png)$/i) ? (
                    <img src={`${backendUrl}/storage/${selectedItem.referensi_gambar}`} alt="Referensi"
                      className="max-w-full rounded-lg" style={{ border: "1px solid #cce6f0" }} />
                  ) : (
                    <a href={`${backendUrl}/storage/${selectedItem.referensi_gambar}`} target="_blank" rel="noreferrer"
                      className="text-sm hover:underline" style={{ color: "#0096C7" }}>📄 Lihat File</a>
                  )}
                </div>
              )}
              {/* Update Status */}
              <div className="rounded-xl p-4" style={{ background: "#EBF6FA", border: "1px solid #cce6f0" }}>
                <p className="text-xs font-semibold mb-2" style={{ color: "#0077A8" }}>Update Status Pengajuan</p>
                <div className="flex gap-2 flex-wrap">
                  {["pending", "review", "approved", "rejected"].map((s) => (
                    <button key={s} onClick={() => handleStatusChange(selectedItem.id, s)}
                      disabled={updatingId === selectedItem.id || selectedItem.status === s}
                      className="px-4 py-2 rounded-lg text-xs font-semibold transition-all capitalize disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        background: selectedItem.status === s ? "#0096C7" : "#fff",
                        color: selectedItem.status === s ? "#fff" : "#0D3040",
                        border: selectedItem.status === s ? "none" : "1px solid #cce6f0",
                      }}>
                      {s === "review" ? "In Review" : s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Header Banner ── */}
      <div className="fade-in rounded-2xl p-8 text-white"
        style={{ background: "linear-gradient(135deg, #0077A8 0%, #0096C7 50%, #00B4D8 100%)", boxShadow: "0 16px 48px rgba(0,150,199,0.3)" }}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Admin Dashboard</h2>
            <p style={{ color: "rgba(255,255,255,0.8)" }}>Welcome back, <span className="font-semibold">{dashboardData?.admin?.name || user?.name || "Admin"}</span>!</p>
          </div>
          <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.2)" }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total Users",       value: dashboardData?.stats?.total_users,       bg: "#e0f3fa", iconColor: "#0096C7", iconPath: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z", onClick: handleOpenUsers },
          { label: "Total Submissions", value: dashboardData?.stats?.total_submissions, bg: "#e0f3fa", iconColor: "#0077A8", iconPath: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", onClick: () => handleFilterByStatus("all") },
          { label: "Pending",           value: dashboardData?.stats?.pending_count,     bg: "#FFF8E7", iconColor: "#F59E0B", iconPath: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", onClick: () => handleFilterByStatus("pending") },
          { label: "Approved",          value: dashboardData?.stats?.approved_count,    bg: "#F0FDF4", iconColor: "#22C55E", iconPath: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", onClick: () => handleFilterByStatus("approved") },
          { label: "Rejected",          value: dashboardData?.stats?.rejected_count,    bg: "#FFF1F2", iconColor: "#F43F5E", iconPath: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z", onClick: () => handleFilterByStatus("rejected") },
        ].map((stat) => (
          <div key={stat.label}
            className="bg-white rounded-2xl p-5 cursor-pointer transition-all"
            style={{ border: "1px solid #cce6f0", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
            onClick={stat.onClick}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#0096C7"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,150,199,0.15)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#cce6f0"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.05)"; }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium" style={{ color: "#9CA3AF" }}>{stat.label}</p>
                <p className="text-3xl font-bold mt-1" style={{ color: "#0D3040" }}>{stat.value ?? 0}</p>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: stat.bg }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke={stat.iconColor}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.iconPath} />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Tab Navigation ── */}
      <div className="flex gap-2 bg-white rounded-2xl p-2 w-fit" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #cce6f0" }}>
        {[
          { id: "submissions", icon: "📋", label: `Pengajuan (${data.length})` },
          { id: "workshops",   icon: "🏭", label: `Workshop (${workshops.filter(w => !w.deleted_at).length})` },
          { id: "divisions",   icon: "🏢", label: `Divisi (${divisions.filter(d => !d.deleted_at).length})` },
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: activeTab === tab.id ? "linear-gradient(135deg, #0077A8, #0096C7)" : "transparent",
              color: activeTab === tab.id ? "#fff" : "#9CA3AF",
              boxShadow: activeTab === tab.id ? "0 4px 12px rgba(0,150,199,0.3)" : "none",
            }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ── TAB: SUBMISSIONS ── */}
      {activeTab === "submissions" && (
        <div id="submissions-table" className="bg-white rounded-2xl overflow-hidden"
          style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.06)", border: "1px solid #cce6f0" }}>
          <div className="p-6 flex items-center justify-between" style={{ borderBottom: "1px solid #e8f4fa" }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #0077A8, #0096C7)" }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-bold" style={{ color: "#0D3040" }}>Semua Pengajuan</h3>
            </div>
            <div className="flex items-center gap-2">
              {statusFilter !== "all" && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold capitalize flex items-center gap-1"
                  style={{ background: "#e0f3fa", color: "#0077A8" }}>
                  Filter: {statusFilter}
                  <button onClick={() => setStatusFilter("all")} className="ml-1 font-bold hover:text-red-500">×</button>
                </span>
              )}
              <span className="px-4 py-2 rounded-full text-sm font-medium" style={{ background: "#EBF6FA", color: "#0077A8" }}>
                {filteredData.length} total
              </span>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <svg className="spin h-10 w-10 mx-auto" style={{ color: "#0096C7" }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="mt-4" style={{ color: "#9CA3AF" }}>Loading submissions...</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-lg" style={{ color: "#9CA3AF" }}>Tidak ada pengajuan {statusFilter !== "all" ? `dengan status "${statusFilter}"` : ""}</p>
              {statusFilter !== "all" && (
                <button onClick={() => setStatusFilter("all")} className="mt-4 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: "#e0f3fa", color: "#0077A8" }}>Lihat Semua</button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ background: "#EBF6FA" }}>
                  <tr>
                    {["Pengaju", "Nama Barang", "Jumlah", "Workshop", "Divisi", "PIC", "Status", "Urgensi", "Tanggal", "Aksi"].map((h) => (
                      <th key={h} className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "#0077A8" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item) => (
                    <tr key={item.id} className="cursor-pointer transition-colors" style={{ borderTop: "1px solid #e8f4fa" }}
                      onClick={() => setSelectedItem(item)}
                      onMouseEnter={e => e.currentTarget.style.background = "#f5fbfd"}
                      onMouseLeave={e => e.currentTarget.style.background = ""}>
                      <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: "linear-gradient(135deg, #0096C7, #00B4D8)" }}>
                            <span className="text-white text-xs font-semibold">{item.user?.name?.charAt(0).toUpperCase() || "U"}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium" style={{ color: "#0D3040" }}>{item.user?.name || "Unknown"}</p>
                            <p className="text-xs" style={{ color: "#9CA3AF" }}>{item.user?.email}</p>
                            {item.nomor_telepon && <p className="text-xs" style={{ color: "#9CA3AF" }}>📞 {item.nomor_telepon}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-sm" style={{ color: "#0D3040" }}>{item.title}</p>
                        {item.spesifikasi && <p className="text-xs truncate max-w-[150px]" style={{ color: "#9CA3AF" }}>{item.spesifikasi}</p>}
                      </td>
                      <td className="px-4 py-4"><p className="text-sm font-medium" style={{ color: "#0D3040" }}>{item.quantity} {item.unit}</p></td>
                      <td className="px-4 py-4"><p className="text-sm" style={{ color: "#6B7280" }}>{item.workshop?.name || "-"}</p></td>
                      <td className="px-4 py-4"><p className="text-sm" style={{ color: "#6B7280" }}>{item.division?.name || "-"}</p></td>
                      <td className="px-4 py-4"><p className="text-sm" style={{ color: "#6B7280" }}>{item.pic || "-"}</p></td>
                      <td className="px-4 py-4">{getStatusBadge(item.status)}</td>
                      <td className="px-4 py-4">{getUrgencyBadge(item.urgency)}</td>
                      <td className="px-4 py-4">
                        <p className="text-sm whitespace-nowrap" style={{ color: "#9CA3AF" }}>
                          {new Date(item.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </td>
                      <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                        {updatingId === item.id ? (
                          <svg className="spin h-5 w-5" style={{ color: "#0096C7" }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <select value={item.status} onChange={(e) => handleStatusChange(item.id, e.target.value)}
                            className="text-xs rounded-lg px-2 py-1.5 outline-none cursor-pointer"
                            style={{ border: "1.5px solid #cce6f0", background: "#f5fbfd", color: "#0D3040" }}>
                            <option value="pending">Pending</option>
                            <option value="review">In Review</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: WORKSHOPS ── */}
      {activeTab === "workshops" && (
        <div>
          <CrudForm title="Workshop" form={workshopForm} setForm={setWorkshopForm} onSubmit={handleWorkshopSubmit}
            editing={editingWorkshop} onCancelEdit={() => { setEditingWorkshop(null); setWorkshopForm({ name: "", description: "", is_active: true }); }}
            loading={workshopLoading} />
          <CrudTable items={workshops} onEdit={startEditWorkshop} onDelete={handleWorkshopDelete} onRestore={handleWorkshopRestore} />
        </div>
      )}

      {/* ── TAB: DIVISIONS ── */}
      {activeTab === "divisions" && (
        <div>
          <CrudForm title="Divisi" form={divisionForm} setForm={setDivisionForm} onSubmit={handleDivisionSubmit}
            editing={editingDivision} onCancelEdit={() => { setEditingDivision(null); setDivisionForm({ name: "", description: "", is_active: true }); }}
            loading={divisionLoading} />
          <CrudTable items={divisions} onEdit={startEditDivision} onDelete={handleDivisionDelete} onRestore={handleDivisionRestore} />
        </div>
      )}

    </div>
  );
}