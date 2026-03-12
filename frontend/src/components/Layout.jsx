import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleHomeClick = (e) => {
    if (user) {
      e.preventDefault();
      navigate(user.role === "admin" ? "/admin" : "/user", { replace: true });
    }
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    logout();
  };

  return (
    <div className="min-h-screen" style={{ background: "#EBF6FA" }}>
      <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Barlow:wght@400;500&display=swap" rel="stylesheet" />
      <style>{`
        .dtech-nav { background: linear-gradient(90deg, #001a2e 0%, #003f5c 50%, #0077A8 100%) !important; border-bottom: 1px solid rgba(0,150,199,0.4) !important; }
        .dtech-nav a, .dtech-nav button { color: #fff !important; }
        .dtech-nav a:hover { color: #fff !important; background: rgba(255,255,255,0.15) !important; }
        .dtech-nav .nav-active { color: #fff !important; }
        .dtech-logout:hover { color: #FFD0D0 !important; background: rgba(255,100,100,0.15) !important; }
      `}</style>
      {/* Navbar */}
      <nav className="dtech-nav border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo & Brand */}
            <div className="flex items-center">
              <Link to="/" onClick={handleHomeClick} style={{ textDecoration: "none" }}>
                <img
                  src="/dtech-logo.png"
                  alt="Dtech-Engineering"
                  style={{ height: 38, objectFit: "contain" }}
                />
              </Link>
            </div>

            {/* Navigation Links */}
            <div className="flex items-center gap-2">
              {!user && (
                <Link
                  to="/"
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                >
                  Home
                </Link>
              )}

              {user?.role === "admin" && (
                <Link
                  to="/admin"
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors font-medium flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Dashboard
                </Link>
              )}

              {user?.role === "user" && (
                <Link
                  to="/user"
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors font-medium flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  My Dashboard
                </Link>
              )}

              {!user && (
                <Link
                  to="/login"
                  className="ml-2 px-4 py-2 rounded-lg transition-all font-medium flex items-center gap-2"
                  style={{ background: "#00B4D8", color: "#000" }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Login
                </Link>
              )}

              {user && (
                <div className="flex items-center gap-3 ml-2">
                  {/* User Avatar */}
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)" }}>
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      className="w-8 h-8 rounded-full items-center justify-center"
                      style={{ background: "#00B4D8", display: user.avatar ? "none" : "flex" }}
                    >
                      <span className="text-white text-sm font-semibold">
                        {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-medium hidden sm:block" style={{ color: "#fff" }}>
                      {user.name || user.email?.split("@")[0]}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full capitalize" style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}>
                      {user.role}
                    </span>
                  </div>

                  {/* Logout Button */}
                  <button
                    onClick={() => setShowLogoutModal(true)}
                    className="dtech-logout px-4 py-2 rounded-lg transition-colors font-medium flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Modal Konfirmasi Logout */}
      {showLogoutModal && (
        <>
          <style>{`
            @keyframes backdropIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes modalIn { from { opacity: 0; transform: scale(0.92) translateY(12px); } to { opacity: 1; transform: scale(1) translateY(0); } }
            .lm-backdrop { animation: backdropIn 0.2s ease forwards; }
            .lm-modal    { animation: modalIn    0.25s ease forwards; }
            .lm-btn-batal:hover  { background: rgba(0,180,216,0.08) !important; border-color: #00B4D8 !important; color: #00B4D8 !important; }
            .lm-btn-logout:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(239,68,68,0.45) !important; }
          `}</style>

          <div
            className="lm-backdrop"
            onClick={() => setShowLogoutModal(false)}
            style={{
              position: "fixed", inset: 0, zIndex: 1000,
              background: "rgba(15, 10, 40, 0.45)",
              backdropFilter: "blur(4px)",
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: 24,
            }}
          >
            <div
              className="lm-modal"
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "#fff", borderRadius: 20, padding: "36px 32px",
                width: "100%", maxWidth: 400, textAlign: "center",
                boxShadow: "0 24px 64px rgba(0,119,168,0.2)",
                border: "1px solid #cce6f0",
                fontFamily: "'Sora', 'Plus Jakarta Sans', sans-serif",
              }}
            >
              <div style={{
                width: 68, height: 68, borderRadius: "50%",
                margin: "0 auto 20px",
                background: "linear-gradient(135deg, #FFF1F2, #FFE4E6)",
                border: "2px solid #FECDD3",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 30,
              }}>🚪</div>

              <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700, color: "#0D3040" }}>
                Konfirmasi Logout
              </h3>
              <p style={{ margin: "0 0 28px", fontSize: 13, color: "#9CA3AF", lineHeight: 1.6 }}>
                Apakah kamu yakin ingin keluar dari akun ini?
              </p>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  className="lm-btn-batal"
                  onClick={() => setShowLogoutModal(false)}
                  style={{
                    flex: 1, padding: "13px",
                    background: "#f5fbfd",
                    border: "2px solid #cce6f0",
                    borderRadius: 12, fontSize: 14, fontWeight: 600,
                    color: "#6B7280", cursor: "pointer", transition: "all 0.2s",
                  }}
                >
                  Batal
                </button>

                <button
                  className="lm-btn-logout"
                  onClick={handleConfirmLogout}
                  style={{
                    flex: 1, padding: "13px",
                    background: "linear-gradient(135deg, #EF4444, #DC2626)",
                    border: "none", borderRadius: 12,
                    fontSize: 14, fontWeight: 700,
                    color: "#fff", cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(239,68,68,0.35)",
                    transition: "all 0.2s",
                  }}
                >
                  Ya, Logout
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}