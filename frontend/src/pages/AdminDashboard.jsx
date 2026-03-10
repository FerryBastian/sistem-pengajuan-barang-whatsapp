import { useEffect, useState } from "react";
import { adminApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";

// ── Komponen ini HARUS di luar AdminDashboard agar focus input tidak hilang ──
function CrudForm({ title, form, setForm, onSubmit, editing, onCancelEdit, loading: formLoading }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
      <h4 className="text-base font-bold text-gray-800 mb-4">
        {editing ? `✏️ Edit ${title}` : `➕ Tambah ${title} Baru`}
      </h4>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Nama <span className="text-red-500">*</span></label>
            <input
              type="text" value={form.name} required
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={`Nama ${title}...`}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Deskripsi</label>
            <input
              type="text" value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Deskripsi singkat (opsional)..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id={`active-${title}`} checked={form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            className="w-4 h-4 accent-indigo-600 cursor-pointer"
          />
          <label htmlFor={`active-${title}`} className="text-sm font-medium text-gray-700 cursor-pointer">Aktif</label>
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={formLoading}
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all">
            {formLoading ? "Menyimpan..." : editing ? "Update" : "Simpan"}
          </button>
          {editing && (
            <button type="button" onClick={onCancelEdit}
              className="px-6 py-2.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-200 transition-all">
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
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {items.length === 0 ? (
        <div className="p-12 text-center text-gray-400">Belum ada data</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Nama</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Deskripsi</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${item.deleted_at ? "opacity-60" : ""}`}>
                  <td className="px-4 py-3">
                    <p className="text-sm font-semibold text-gray-800">{item.name}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-500">{item.description || "-"}</p>
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
                            className="px-3 py-1.5 text-xs font-semibold bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-all">
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

  // Submissions state
  const [data, setData] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  // Workshop state
  const [workshops, setWorkshops] = useState([]);
  const [workshopForm, setWorkshopForm] = useState({ name: "", description: "", is_active: true });
  const [editingWorkshop, setEditingWorkshop] = useState(null);
  const [workshopLoading, setWorkshopLoading] = useState(false);

  // Division state
  const [divisions, setDivisions] = useState([]);
  const [divisionForm, setDivisionForm] = useState({ name: "", description: "", is_active: true });
  const [editingDivision, setEditingDivision] = useState(null);
  const [divisionLoading, setDivisionLoading] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_APP_URL || "http://localhost:8000";

  // ── Fetch all data ──────────────────────────────────────────
  const fetchSubmissions = () => {
    setLoading(true);
    Promise.all([adminApi.getDashboard(), adminApi.getSubmissions()])
      .then(([dashRes, subRes]) => {
        setDashboardData(dashRes.data);
        setData(subRes.data);
      })
      .catch(console.log)
      .finally(() => setLoading(false));
  };

  const fetchWorkshops = () => {
    API.get("/admin/workshops").then((res) => setWorkshops(res.data)).catch(console.log);
  };

  const fetchDivisions = () => {
    API.get("/admin/divisions").then((res) => setDivisions(res.data)).catch(console.log);
  };

  useEffect(() => {
    fetchSubmissions();
    fetchWorkshops();
    fetchDivisions();
  }, []);

  // ── Submissions ─────────────────────────────────────────────
  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await adminApi.updateSubmissionStatus(id, newStatus);
      setData((prev) => prev.map((item) => item.id === id ? { ...item, status: newStatus } : item));
      if (selectedItem?.id === id) setSelectedItem((prev) => ({ ...prev, status: newStatus }));
      adminApi.getDashboard().then((res) => setDashboardData(res.data));
    } catch (err) { console.log(err); }
    finally { setUpdatingId(null); }
  };

  // ── Workshop CRUD ───────────────────────────────────────────
  const handleWorkshopSubmit = async (e) => {
    e.preventDefault();
    setWorkshopLoading(true);
    try {
      if (editingWorkshop) {
        await API.put(`/admin/workshops/${editingWorkshop.id}`, workshopForm);
      } else {
        await API.post("/admin/workshops", workshopForm);
      }
      setWorkshopForm({ name: "", description: "", is_active: true });
      setEditingWorkshop(null);
      fetchWorkshops();
    } catch (err) {
      alert(err?.response?.data?.message || "Gagal menyimpan workshop");
    } finally { setWorkshopLoading(false); }
  };

  const handleWorkshopDelete = async (id) => {
    if (!confirm("Hapus workshop ini?")) return;
    try {
      await API.delete(`/admin/workshops/${id}`);
      fetchWorkshops();
    } catch (err) { console.log(err); }
  };

  const handleWorkshopRestore = async (id) => {
    try {
      await API.patch(`/admin/workshops/${id}/restore`);
      fetchWorkshops();
    } catch (err) { console.log(err); }
  };

  const startEditWorkshop = (w) => {
    setEditingWorkshop(w);
    setWorkshopForm({ name: w.name, description: w.description || "", is_active: w.is_active });
  };

  // ── Division CRUD ───────────────────────────────────────────
  const handleDivisionSubmit = async (e) => {
    e.preventDefault();
    setDivisionLoading(true);
    try {
      if (editingDivision) {
        await API.put(`/admin/divisions/${editingDivision.id}`, divisionForm);
      } else {
        await API.post("/admin/divisions", divisionForm);
      }
      setDivisionForm({ name: "", description: "", is_active: true });
      setEditingDivision(null);
      fetchDivisions();
    } catch (err) {
      alert(err?.response?.data?.message || "Gagal menyimpan divisi");
    } finally { setDivisionLoading(false); }
  };

  const handleDivisionDelete = async (id) => {
    if (!confirm("Hapus divisi ini?")) return;
    try {
      await API.delete(`/admin/divisions/${id}`);
      fetchDivisions();
    } catch (err) { console.log(err); }
  };

  const handleDivisionRestore = async (id) => {
    try {
      await API.patch(`/admin/divisions/${id}/restore`);
      fetchDivisions();
    } catch (err) { console.log(err); }
  };

  const startEditDivision = (d) => {
    setEditingDivision(d);
    setDivisionForm({ name: d.name, description: d.description || "", is_active: d.is_active });
  };

  // ── Badge helpers ───────────────────────────────────────────
  const getStatusBadge = (status) => {
    const cfg = {
      pending:  { bg: "bg-yellow-100", text: "text-yellow-800", label: "Pending" },
      approved: { bg: "bg-green-100",  text: "text-green-800",  label: "Approved" },
      rejected: { bg: "bg-red-100",    text: "text-red-800",    label: "Rejected" },
      review:   { bg: "bg-blue-100",   text: "text-blue-800",   label: "In Review" },
    };
    const c = cfg[status?.toLowerCase()] || cfg.pending;
    return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>{c.label}</span>;
  };

  const getUrgencyBadge = (urgency) => {
    const cfg = {
      standart:  { bg: "bg-gray-100",   text: "text-gray-600",   label: "🟢 Standart" },
      urgent:    { bg: "bg-orange-100", text: "text-orange-700", label: "🟠 Urgent" },
      emergency: { bg: "bg-red-100",    text: "text-red-700",    label: "🔴 Emergency" },
    };
    const c = cfg[urgency?.toLowerCase()] || cfg.standart;
    return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>{c.label}</span>;
  };

  return (
    <div className="space-y-8">

      {/* Modal Detail Submission */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
          onClick={() => setSelectedItem(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-lg">📦</div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{selectedItem.title}</h3>
                  <p className="text-xs text-gray-400">ID Pengajuan #{selectedItem.id}</p>
                </div>
              </div>
              <button onClick={() => setSelectedItem(null)} className="text-gray-400 hover:text-gray-600 text-2xl font-light">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex gap-2 flex-wrap">
                {getStatusBadge(selectedItem.status)}
                {getUrgencyBadge(selectedItem.urgency)}
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                  const waNumber = isPhone && value !== "-"
                    ? value.replace(/^0/, "62").replace(/[^0-9]/g, "")
                    : null;
                  return (
                    <div key={label} className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 font-medium mb-1">{label}</p>
                      {waNumber ? (
                        <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noreferrer"
                          className="text-sm font-semibold text-green-600 hover:text-green-700 hover:underline flex items-center gap-1">
                          <span>💬</span> {value}
                        </a>
                      ) : isEmail && value ? (
                        <a href={`https://mail.google.com/mail/?view=cm&to=${value}`} target="_blank" rel="noreferrer"
                          className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:underline flex items-center gap-1">
                          <span>✉️</span> {value}
                        </a>
                      ) : (
                        <p className="text-sm text-gray-800 font-semibold">{value}</p>
                      )}
                    </div>
                  );
                })}
              </div>
              {selectedItem.kegunaan && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 font-medium mb-1">Kegunaan</p>
                  <p className="text-sm text-gray-800">{selectedItem.kegunaan}</p>
                </div>
              )}
              {selectedItem.spesifikasi && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 font-medium mb-1">Spesifikasi</p>
                  <p className="text-sm text-gray-800">{selectedItem.spesifikasi}</p>
                </div>
              )}
              {selectedItem.content && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 font-medium mb-1">Keterangan Tambahan</p>
                  <p className="text-sm text-gray-800">{selectedItem.content}</p>
                </div>
              )}
              {selectedItem.referensi_link && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 font-medium mb-1">Referensi Link</p>
                  <a href={selectedItem.referensi_link} target="_blank" rel="noreferrer"
                    className="text-sm text-indigo-600 hover:underline break-all">{selectedItem.referensi_link}</a>
                </div>
              )}
              {selectedItem.referensi_gambar && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 font-medium mb-2">Referensi Gambar</p>
                  {selectedItem.referensi_gambar.match(/\.(jpg|jpeg|png)$/i) ? (
                    <img src={`${backendUrl}/storage/${selectedItem.referensi_gambar}`} alt="Referensi"
                      className="max-w-full rounded-lg border border-gray-200" />
                  ) : (
                    <a href={`${backendUrl}/storage/${selectedItem.referensi_gambar}`} target="_blank" rel="noreferrer"
                      className="text-sm text-indigo-600 hover:underline">📄 Lihat File</a>
                  )}
                </div>
              )}
              <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                <p className="text-xs text-indigo-600 font-semibold mb-2">Update Status Pengajuan</p>
                <div className="flex gap-2 flex-wrap">
                  {["pending", "review", "approved", "rejected"].map((s) => (
                    <button key={s} onClick={() => handleStatusChange(selectedItem.id, s)}
                      disabled={updatingId === selectedItem.id || selectedItem.status === s}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all capitalize
                        ${selectedItem.status === s ? "bg-indigo-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-indigo-400 hover:text-indigo-600"}
                        disabled:opacity-50 disabled:cursor-not-allowed`}>
                      {s === "review" ? "In Review" : s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Admin Dashboard</h2>
            <p className="text-indigo-100">Welcome back, <span className="font-semibold">{dashboardData?.admin?.name || user?.name || "Admin"}</span>!</p>
          </div>
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total Users",       value: dashboardData?.stats?.total_users,       bg: "bg-blue-100",   icon: "text-blue-600",   iconPath: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
          { label: "Total Submissions", value: dashboardData?.stats?.total_submissions, bg: "bg-purple-100", icon: "text-purple-600", iconPath: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
          { label: "Pending",           value: dashboardData?.stats?.pending_count,     bg: "bg-yellow-100", icon: "text-yellow-600", iconPath: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
          { label: "Approved",          value: dashboardData?.stats?.approved_count,    bg: "bg-green-100",  icon: "text-green-600",  iconPath: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
          { label: "Rejected",          value: dashboardData?.stats?.rejected_count,    bg: "bg-red-100",    icon: "text-red-600",    iconPath: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs font-medium">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{stat.value ?? 0}</p>
              </div>
              <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
                <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 ${stat.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.iconPath} />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 bg-white rounded-2xl p-2 shadow-sm border border-gray-100 w-fit">
        {[
          { id: "submissions", icon: "📋", label: `Pengajuan (${data.length})` },
          { id: "workshops",   icon: "🏭", label: `Workshop (${workshops.filter(w => !w.deleted_at).length})` },
          { id: "divisions",   icon: "🏢", label: `Divisi (${divisions.filter(d => !d.deleted_at).length})` },
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all
              ${activeTab === tab.id
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ── TAB: SUBMISSIONS ── */}
      {activeTab === "submissions" && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800">Semua Pengajuan</h3>
            </div>
            <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">{data.length} total</span>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <svg className="animate-spin h-10 w-10 text-indigo-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-gray-500 mt-4">Loading submissions...</p>
            </div>
          ) : data.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500 text-lg">Belum ada pengajuan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {["Pengaju", "Nama Barang", "Jumlah", "Workshop", "Divisi", "PIC", "Status", "Urgensi", "Tanggal", "Aksi"].map((h) => (
                      <th key={h} className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => setSelectedItem(item)}>
                      <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-semibold">{item.user?.name?.charAt(0).toUpperCase() || "U"}</span>
                          </div>
                          <div>
                            <p className="text-gray-800 text-sm font-medium">{item.user?.name || "Unknown"}</p>
                            <p className="text-gray-400 text-xs">{item.user?.email}</p>
                            {item.nomor_telepon && <p className="text-gray-400 text-xs">📞 {item.nomor_telepon}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-gray-800 text-sm">{item.title}</p>
                        {item.spesifikasi && <p className="text-gray-400 text-xs truncate max-w-[150px]">{item.spesifikasi}</p>}
                      </td>
                      <td className="px-4 py-4"><p className="text-gray-700 text-sm font-medium">{item.quantity} {item.unit}</p></td>
                      <td className="px-4 py-4"><p className="text-gray-600 text-sm">{item.workshop?.name || "-"}</p></td>
                      <td className="px-4 py-4"><p className="text-gray-600 text-sm">{item.division?.name || "-"}</p></td>
                      <td className="px-4 py-4"><p className="text-gray-600 text-sm">{item.pic || "-"}</p></td>
                      <td className="px-4 py-4">{getStatusBadge(item.status)}</td>
                      <td className="px-4 py-4">{getUrgencyBadge(item.urgency)}</td>
                      <td className="px-4 py-4">
                        <p className="text-gray-500 text-sm whitespace-nowrap">
                          {new Date(item.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </td>
                      <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                        {updatingId === item.id ? (
                          <svg className="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <select value={item.status} onChange={(e) => handleStatusChange(item.id, e.target.value)}
                            className="text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer bg-white">
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
          <CrudForm
            title="Workshop"
            form={workshopForm}
            setForm={setWorkshopForm}
            onSubmit={handleWorkshopSubmit}
            editing={editingWorkshop}
            onCancelEdit={() => { setEditingWorkshop(null); setWorkshopForm({ name: "", description: "", is_active: true }); }}
            loading={workshopLoading}
          />
          <CrudTable
            items={workshops}
            onEdit={startEditWorkshop}
            onDelete={handleWorkshopDelete}
            onRestore={handleWorkshopRestore}
          />
        </div>
      )}

      {/* ── TAB: DIVISIONS ── */}
      {activeTab === "divisions" && (
        <div>
          <CrudForm
            title="Divisi"
            form={divisionForm}
            setForm={setDivisionForm}
            onSubmit={handleDivisionSubmit}
            editing={editingDivision}
            onCancelEdit={() => { setEditingDivision(null); setDivisionForm({ name: "", description: "", is_active: true }); }}
            loading={divisionLoading}
          />
          <CrudTable
            items={divisions}
            onEdit={startEditDivision}
            onDelete={handleDivisionDelete}
            onRestore={handleDivisionRestore}
          />
        </div>
      )}

    </div>
  );
}