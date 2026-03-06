import axios from "axios";

// Base URL API mengikuti prefix Laravel: /api/v1
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    "X-Requested-With": "XMLHttpRequest",
  },
});

const BACKEND_APP_URL = import.meta.env.VITE_BACKEND_APP_URL || "http://localhost:8000";

export async function getCsrfCookie() {
  await axios.get(`${BACKEND_APP_URL}/sanctum/csrf-cookie`, {
    withCredentials: true,
  });
}

// Load token dari localStorage saat app pertama kali dibuka
const savedToken = localStorage.getItem("auth_token");
if (savedToken) {
  API.defaults.headers.common.Authorization = `Bearer ${savedToken}`;
}

// Interceptor response untuk logging error
API.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response) {
      console.error("API Error:", {
        status: error.response.status,
        url: error.config?.url,
        data: error.response.data,
      });
    } else {
      console.error("API Network/Error:", error.message);
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  // Registrasi user baru
  async register({ name, email, password, password_confirmation }) {
    await getCsrfCookie();
    const res = await API.post("/register", { name, email, password, password_confirmation });
    if (res?.data?.token) {
      API.defaults.headers.common.Authorization = `Bearer ${res.data.token}`;
      localStorage.setItem("auth_token", res.data.token);
    }
    return res;
  },

  // Email/password login — token dikirim sebagai boolean di body, bukan query string
  async login({ email, password, tokenMode = false, device_name = "react-app" }) {
    await getCsrfCookie();
    const body = tokenMode
      ? { email, password, token: true, device_name }
      : { email, password };
    const res = await API.post("/login", body);
    if (tokenMode && res?.data?.token) {
      API.defaults.headers.common.Authorization = `Bearer ${res.data.token}`;
      localStorage.setItem("auth_token", res.data.token);
    }
    return res;
  },

  // Google OAuth login
  async loginWithGoogle({ id_token, device_name = "react-app" }) {
    await getCsrfCookie();
    const res = await API.post("/oauth/google", { id_token, device_name });
    if (res?.data?.token) {
      API.defaults.headers.common.Authorization = `Bearer ${res.data.token}`;
      localStorage.setItem("auth_token", res.data.token);
    }
    return res;
  },

  me() {
    return API.get("/me");
  },

  logout() {
    localStorage.removeItem("auth_token");
    delete API.defaults.headers.common.Authorization;
    return API.post("/logout");
  },
};

export const submissionsApi = {
  submit(payload) {
    return API.post("/submit", payload);
  },
  mySubmissions() {
    return API.get("/my-submissions");
  },
};

export const adminApi = {
  getDashboard() {
    return API.get("/admin/dashboard");
  },
  getSubmissions() {
    return API.get("/admin/submissions");
  },
  updateSubmissionStatus(id, status) {
    return API.patch(`/admin/submissions/${id}/status`, { status });
  },
};

export const userApi = {
  getDashboard() {
    return API.get("/user/dashboard");
  },
};

export const miscApi = {
  health() {
    return API.get("/health");
  },
};

export default API;