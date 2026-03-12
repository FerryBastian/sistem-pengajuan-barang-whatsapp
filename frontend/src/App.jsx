import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function Home() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center" style={{ background: "#EBF6FA" }}>
      <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Barlow:wght@300;400;500;600&display=swap" rel="stylesheet" />

      <div className="text-center max-w-2xl mx-auto px-4">

        {/* ── Hero Logo ── */}
        <div className="mb-8">

          {/* Icon — Logo D Dtech */}
          <div className="flex justify-center mb-5">
            <img
              src="/dtech.png"
              alt="Dtech Logo"
              style={{ width: 80, height: 80, objectFit: "contain" }}
            />
          </div>

          {/* Wordmark — font default senada "Welcome Back" di Login */}
          <div style={{ display: "flex", justifyContent: "center", alignItems: "baseline", marginBottom: 4, gap: 0 }}>
            <span style={{ fontFamily: "sans-serif", fontSize: 36, fontWeight: 800, color: "#111", letterSpacing: -0.5, textTransform: "uppercase" }}>SUBMIS</span>
            <span style={{ fontFamily: "sans-serif", fontSize: 36, fontWeight: 800, color: "#00B4D8", letterSpacing: -0.5, textTransform: "uppercase" }}>S</span>
            <span style={{ fontFamily: "sans-serif", fontSize: 36, fontWeight: 800, color: "#111", letterSpacing: -0.5, textTransform: "uppercase" }}>ION AP</span>
            <span style={{ fontFamily: "sans-serif", fontSize: 36, fontWeight: 800, color: "#00B4D8", letterSpacing: -0.5, textTransform: "uppercase" }}>P</span>
          </div>

          <p className="text-lg text-gray-500 leading-relaxed">
            Manage your submissions with ease. Submit, track, and review entries all in one place.
          </p>
        </div>

        {/* ── Feature Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            {
              label: "Easy Submission",
              desc: "Submit your entries quickly with our intuitive form",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="#00B4D8">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              ),
            },
            {
              label: "Track Status",
              desc: "Monitor the status of your submissions in real-time",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="#00B4D8">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
            },
            {
              label: "Admin Review",
              desc: "Admins can efficiently review and manage all submissions",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="#00B4D8">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              ),
            },
          ].map((f) => (
            <div key={f.label}
              className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              style={{ border: "1px solid rgba(0,180,216,0.2)" }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto"
                style={{ background: "rgba(0,180,216,0.08)" }}>
                {f.icon}
              </div>
              <h3 className="font-semibold mb-2"
                style={{ fontFamily: "'Oswald', sans-serif", fontSize: 15, letterSpacing: 0.8, textTransform: "uppercase", color: "#0D3040" }}>
                {f.label}
              </h3>
              <p className="text-gray-500 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* ── CTA ── */}
        <div className="rounded-2xl p-8"
          style={{
            background: "linear-gradient(135deg, #0077A8 0%, #0096C7 50%, #0077A8 100%)",
            border: "1px solid rgba(0,180,216,0.4)",
            boxShadow: "0 8px 32px rgba(0,150,199,0.3)",
          }}>
          <h2 className="text-2xl font-bold mb-2 text-white" style={{letterSpacing: 1.5 }}>
            Get Started Today
          </h2>
          <div style={{ width: 36, height: 2, background: "#00B4D8", margin: "0 auto 12px" }} />
          <p className="mb-6" style={{ color: "rgba(200,234,245,0.75)", fontSize: 14, fontFamily: "'Barlow', sans-serif" }}>
            Login atau daftar untuk mulai menggunakan aplikasi
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <a href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl transition-all hover:-translate-y-0.5"
              style={{ background: "#00B4D8", color: "#000", fontFamily: "'Oswald', sans-serif", fontSize: 15, fontWeight: 600, letterSpacing: 1.5, boxShadow: "0 4px 14px rgba(0,180,216,0.35)" }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Login
            </a>
            <a href="/register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl transition-all hover:-translate-y-0.5"
              style={{ background: "transparent", border: "1.5px solid rgba(0,180,216,0.6)", color: "#00B4D8", fontFamily: "'Oswald', sans-serif", fontSize: 15, fontWeight: 600, letterSpacing: 1.5 }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Daftar
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/user" element={<ProtectedRoute role="user"><UserDashboard /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
            </Routes>
          </Layout>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;