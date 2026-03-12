import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const googleBtnRef = useRef(null);

  const handleGoogleLogin = async (response) => {
    if (!response.credential) {
      setError("Google login failed. Please try again.");
      return;
    }
    setGoogleLoading(true);
    setError("");
    try {
      const user = await loginWithGoogle(response.credential);
      navigate(user.role === "admin" ? "/admin" : "/user", { replace: true });
    } catch (e) {
      setError(e?.response?.data?.message || "Google login gagal");
    } finally {
      setGoogleLoading(false);
    }
  };

  useEffect(() => {
    const initGoogle = () => {
      if (window.google && googleBtnRef.current) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleGoogleLogin,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Render tombol Google resmi di dalam ref
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          width: googleBtnRef.current.offsetWidth,
          text: "continue_with",
          logo_alignment: "left",
        });
      }
    };

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initGoogle;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const user = await login(email, password);
      navigate(user.role === "admin" ? "/admin" : "/user", { replace: true });
    } catch (e) {
      setError(e?.response?.data?.message || "Login gagal");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: "#0D3040" }}>Welcome Back</h1>
          <p className="text-gray-500">Sign in to your account</p>
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

        {/* Google Login Button — rendered by Google SDK */}
        <div className="w-full mb-4 flex justify-center">
          <div ref={googleBtnRef} className="w-full"></div>
        </div>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">or continue with email</span>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-5">
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

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#0D3040" }}>Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="#0096C7">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                type="password" placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={handleKeyDown}
                className="w-full pl-10 pr-4 py-3 rounded-xl outline-none transition-all duration-200 text-gray-700 placeholder-gray-400"
                style={{ border: "1.5px solid #cce6f0", background: "#f5fbfd" }}
                onFocus={e => e.target.style.borderColor = "#0096C7"}
                onBlur={e => e.target.style.borderColor = "#cce6f0"}
              />
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading || !email || !password}
            className="w-full text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{
              background: loading || !email || !password ? "#b0d4e3" : "#0096C7",
              boxShadow: loading || !email || !password ? "none" : "0 4px 16px rgba(0,150,199,0.4)",
            }}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span>Sign In</span>
              </>
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-gray-500">
            Belum punya akun?{" "}
            <Link to="/register" className="font-semibold hover:underline" style={{ color: "#0096C7" }}>
              Daftar di sini
            </Link>
          </p>
          <p className="text-xs text-gray-400">Secure login for authorized users only</p>
        </div>
      </div>
    </div>
  );
}

export default Login;