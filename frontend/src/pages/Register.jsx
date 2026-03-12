import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (password !== passwordConfirmation) {
      setError("Password dan konfirmasi password tidak cocok.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const user = await register(name, email, password, passwordConfirmation);
      navigate(user.role === "admin" ? "/admin" : "/user", { replace: true });
    } catch (e) {
      const errors = e?.response?.data?.errors;
      if (errors) {
        const firstError = Object.values(errors)[0][0];
        setError(firstError);
      } else {
        setError(e?.response?.data?.message || "Registrasi gagal");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleRegister();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8"
      style={{ background: "#EBF6FA" }}>

      <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md transform transition-all hover:scale-[1.02]">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
            style={{ background: "#0096C7", boxShadow: "0 6px 20px rgba(0,150,199,0.35)" }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: "#0D3040" }}>Buat Akun</h1>
          <p style={{ color: "#5a8a9f", fontSize: 14 }}>Daftarkan diri untuk mulai mengajukan barang</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="space-y-5">

          {/* Nama */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#0D3040" }}>Nama Lengkap</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="#0096C7">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input
                type="text" placeholder="Nama lengkap kamu"
                value={name} onChange={(e) => setName(e.target.value)} onKeyDown={handleKeyDown}
                className="w-full pl-10 pr-4 py-3 rounded-xl outline-none transition-all duration-200 text-gray-700 placeholder-gray-400"
                style={{ border: "1.5px solid #cce6f0", background: "#f5fbfd" }}
                onFocus={e => e.target.style.borderColor = "#0096C7"}
                onBlur={e => e.target.style.borderColor = "#cce6f0"}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#0D3040" }}>Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="#0096C7">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
              <input
                type="email" placeholder="you@example.com"
                value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={handleKeyDown}
                className="w-full pl-10 pr-4 py-3 rounded-xl outline-none transition-all duration-200 text-gray-700 placeholder-gray-400"
                style={{ border: "1.5px solid #cce6f0", background: "#f5fbfd" }}
                onFocus={e => e.target.style.borderColor = "#0096C7"}
                onBlur={e => e.target.style.borderColor = "#cce6f0"}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#0D3040" }}>Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="#0096C7">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                type="password" placeholder="Minimal 8 karakter"
                value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={handleKeyDown}
                className="w-full pl-10 pr-4 py-3 rounded-xl outline-none transition-all duration-200 text-gray-700 placeholder-gray-400"
                style={{ border: "1.5px solid #cce6f0", background: "#f5fbfd" }}
                onFocus={e => e.target.style.borderColor = "#0096C7"}
                onBlur={e => e.target.style.borderColor = "#cce6f0"}
              />
            </div>
          </div>

          {/* Konfirmasi Password */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#0D3040" }}>Konfirmasi Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="#0096C7">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                type="password" placeholder="Ulangi password"
                value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} onKeyDown={handleKeyDown}
                className="w-full pl-10 pr-4 py-3 rounded-xl outline-none transition-all duration-200 text-gray-700 placeholder-gray-400"
                style={{ border: "1.5px solid #cce6f0", background: "#f5fbfd" }}
                onFocus={e => e.target.style.borderColor = "#0096C7"}
                onBlur={e => e.target.style.borderColor = "#cce6f0"}
              />
            </div>
          </div>

          {/* Button */}
          <button
            onClick={handleRegister}
            disabled={loading || !name || !email || !password || !passwordConfirmation}
            className="w-full text-white py-3 px-6 rounded-xl transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{
              background: loading || !name || !email || !password || !passwordConfirmation ? "#b0d4e3" : "#0096C7",
              boxShadow: loading || !name || !email || !password || !passwordConfirmation ? "none" : "0 4px 16px rgba(0,150,199,0.4)",
              fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase",
            }}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Mendaftarkan...</span>
              </>
            ) : (
              <span>Daftar Sekarang</span>
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Sudah punya akun?{" "}
            <Link to="/login" className="font-semibold hover:underline" style={{ color: "#0096C7" }}>
              Login di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;