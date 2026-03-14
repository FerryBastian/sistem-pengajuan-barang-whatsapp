import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function SidebarLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const adminNav = [
    { path: "/admin",              icon: "📊", label: "Dashboard" },
    { path: "/admin/submissions",  icon: "📋", label: "Pengajuan" },
    { path: "/admin/workshops",    icon: "🏭", label: "Workshop" },
    { path: "/admin/divisions",    icon: "🏢", label: "Divisi" },
    { path: "/admin/users",        icon: "👥", label: "User Management" },
  ];

  const userNav = [
    { path: "/user",         icon: "📦", label: "Ajukan Barang" },
    { path: "/user/riwayat", icon: "📋", label: "Riwayat Pengajuan" },
  ];

  const navItems = user?.role === "admin" ? adminNav : userNav;
  const dashboardPath = user?.role === "admin" ? "/admin" : "/user";
  const isActive = (path) => location.pathname === path;

  const handleLogout = () => { setShowLogoutModal(false); logout(); };

  const SidebarContent = ({ mobile = false }) => (
    <div style={{
      display: "flex", flexDirection: "column", height: "100%",
      background: "linear-gradient(180deg, #001a2e 0%, #003f5c 60%, #0077A8 100%)",
    }}>
      {/* Logo */}
      <div style={{
        padding: collapsed && !mobile ? "20px 12px" : "20px 20px",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        display: "flex", alignItems: "center",
        justifyContent: collapsed && !mobile ? "center" : "space-between",
        minHeight: 72,
      }}>
        {(!collapsed || mobile) && (
          <Link to={dashboardPath} style={{ textDecoration: "none" }}>
            <img src="/dtech-logo.png" alt="Dtech" style={{ height: 32, objectFit: "contain" }} />
          </Link>
        )}
        {collapsed && !mobile && (
          <img src="/dtech.png" alt="D" style={{ height: 28, width: 28, objectFit: "contain" }} />
        )}
        {!mobile && (
          <button onClick={() => setCollapsed(!collapsed)} style={{
            background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 8,
            width: 28, height: 28, cursor: "pointer", color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0,
          }}>{collapsed ? "→" : "←"}</button>
        )}
        {mobile && (
          <button onClick={() => setMobileOpen(false)} style={{
            background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 8,
            width: 28, height: 28, cursor: "pointer", color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
          }}>×</button>
        )}
      </div>

      {/* User Info */}
      <div style={{
        padding: collapsed && !mobile ? "16px 12px" : "16px 20px",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        display: "flex", alignItems: "center", gap: 12,
        justifyContent: collapsed && !mobile ? "center" : "flex-start",
      }}>
        {user?.avatar ? (
          <img src={user.avatar} alt={user.name} referrerPolicy="no-referrer"
            style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(0,180,216,0.6)", flexShrink: 0 }} />
        ) : (
          <div style={{
            width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
            background: "linear-gradient(135deg, #00B4D8, #0096C7)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 15, fontWeight: 700, color: "#fff", border: "2px solid rgba(0,180,216,0.6)",
          }}>{user?.name?.charAt(0).toUpperCase()}</div>
        )}
        {(!collapsed || mobile) && (
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user?.name}
            </p>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
              background: user?.role === "admin" ? "rgba(124,58,237,0.4)" : "rgba(0,180,216,0.3)",
              color: user?.role === "admin" ? "#C4B5FD" : "#BAE6FD",
              textTransform: "uppercase", letterSpacing: 0.5,
            }}>{user?.role}</span>
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
        {navItems.map((item) => (
          <Link key={item.path} to={item.path}
            onClick={() => mobile && setMobileOpen(false)}
            style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: collapsed && !mobile ? "12px" : "11px 14px",
              borderRadius: 12, marginBottom: 4, textDecoration: "none",
              justifyContent: collapsed && !mobile ? "center" : "flex-start",
              background: isActive(item.path)
                ? "linear-gradient(135deg, rgba(0,180,216,0.3), rgba(0,150,199,0.2))"
                : "transparent",
              border: isActive(item.path) ? "1px solid rgba(0,180,216,0.4)" : "1px solid transparent",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => { if (!isActive(item.path)) e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
            onMouseLeave={e => { if (!isActive(item.path)) e.currentTarget.style.background = "transparent"; }}
          >
            <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
            {(!collapsed || mobile) && (
              <span style={{
                fontSize: 13, fontWeight: isActive(item.path) ? 600 : 500,
                color: isActive(item.path) ? "#fff" : "rgba(255,255,255,0.7)",
                whiteSpace: "nowrap",
              }}>{item.label}</span>
            )}
            {isActive(item.path) && (!collapsed || mobile) && (
              <div style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: "#00B4D8", flexShrink: 0 }} />
            )}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding: "12px 10px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <button onClick={() => setShowLogoutModal(true)} style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: collapsed && !mobile ? "12px" : "11px 14px",
          borderRadius: 12, width: "100%", border: "1px solid transparent",
          background: "transparent", cursor: "pointer", transition: "all 0.2s",
          justifyContent: collapsed && !mobile ? "center" : "flex-start",
        }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.15)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          <span style={{ fontSize: 18, flexShrink: 0 }}>🚪</span>
          {(!collapsed || mobile) && (
            <span style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,200,200,0.8)" }}>Logout</span>
          )}
        </button>
      </div>
    </div>
  );

  const currentLabel = navItems.find(n => isActive(n.path))?.label || "Dashboard";

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#EBF6FA", fontFamily: "'Barlow', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Barlow:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.3s ease forwards; }
        @keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        .slide-in { animation: slideIn 0.25s ease forwards; }
        @keyframes backdropIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalIn { from { opacity: 0; transform: scale(0.92) translateY(12px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .lm-backdrop { animation: backdropIn 0.2s ease forwards; }
        .lm-modal { animation: modalIn 0.25s ease forwards; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #d0eef7; border-radius: 4px; }
        ::-webkit-scrollbar-thumb { background: #0096C7; border-radius: 4px; }
        @media (min-width: 768px) { .desktop-sidebar { display: block !important; } .mobile-header { display: none !important; } }
        @media (max-width: 767px) { .top-bar { margin-top: 56px !important; } }
      `}</style>

      {/* Desktop Sidebar */}
      <div className="desktop-sidebar" style={{
        width: collapsed ? 68 : 240, flexShrink: 0,
        transition: "width 0.25s ease",
        position: "sticky", top: 0, height: "100vh",
        display: "none",
      }}>
        <SidebarContent />
      </div>

      {/* Mobile Header */}
      <div className="mobile-header" style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "linear-gradient(90deg, #001a2e, #0077A8)",
        height: 56, display: "flex", alignItems: "center",
        padding: "0 16px", gap: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
      }}>
        <button onClick={() => setMobileOpen(true)} style={{
          background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 8,
          width: 36, height: 36, cursor: "pointer", color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
        }}>☰</button>
        <img src="/dtech-logo.png" alt="Dtech" style={{ height: 28, objectFit: "contain" }} />
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <>
          <div className="lm-backdrop" onClick={() => setMobileOpen(false)} style={{
            position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(2px)",
          }} />
          <div className="slide-in" style={{ position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 201, width: 260 }}>
            <SidebarContent mobile />
          </div>
        </>
      )}

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Top Bar */}
        <div className="top-bar" style={{
          background: "#fff", borderBottom: "1px solid #d4eef8",
          padding: "0 24px", height: 64,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          boxShadow: "0 2px 8px rgba(0,150,199,0.06)",
          position: "sticky", top: 0, zIndex: 50,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, color: "#9CA3AF" }}>{user?.role === "admin" ? "Admin" : "User"}</span>
            <span style={{ color: "#cce6f0" }}>/</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#0D3040" }}>{currentLabel}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: "#EBF6FA", color: "#0077A8", border: "1px solid #cce6f0" }}>
              {new Date().toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" })}
            </div>
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} referrerPolicy="no-referrer"
                style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover", border: "2px solid #cce6f0" }} />
            ) : (
              <div style={{
                width: 34, height: 34, borderRadius: "50%",
                background: "linear-gradient(135deg, #00B4D8, #0096C7)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 700, color: "#fff", border: "2px solid #cce6f0",
              }}>{user?.name?.charAt(0).toUpperCase()}</div>
            )}
          </div>
        </div>

        {/* Page Content */}
        <div style={{ flex: 1, padding: "28px 24px", overflowY: "auto" }}>
          {children}
        </div>
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="lm-backdrop" onClick={() => setShowLogoutModal(false)} style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(15,10,40,0.45)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
        }}>
          <div className="lm-modal" onClick={e => e.stopPropagation()} style={{
            background: "#fff", borderRadius: 20, padding: "36px 32px",
            width: "100%", maxWidth: 400, textAlign: "center",
            boxShadow: "0 24px 64px rgba(0,119,168,0.2)", border: "1px solid #cce6f0",
          }}>
            <div style={{ width: 68, height: 68, borderRadius: "50%", margin: "0 auto 20px", background: "linear-gradient(135deg, #FFF1F2, #FFE4E6)", border: "2px solid #FECDD3", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30 }}>🚪</div>
            <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700, color: "#0D3040" }}>Konfirmasi Logout</h3>
            <p style={{ margin: "0 0 28px", fontSize: 13, color: "#9CA3AF", lineHeight: 1.6 }}>Apakah kamu yakin ingin keluar dari akun ini?</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowLogoutModal(false)} style={{ flex: 1, padding: "13px", background: "#f5fbfd", border: "2px solid #cce6f0", borderRadius: 12, fontSize: 14, fontWeight: 600, color: "#6B7280", cursor: "pointer" }}>Batal</button>
              <button onClick={handleLogout} style={{ flex: 1, padding: "13px", background: "linear-gradient(135deg, #EF4444, #DC2626)", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700, color: "#fff", cursor: "pointer", boxShadow: "0 4px 14px rgba(239,68,68,0.35)" }}>Ya, Logout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}