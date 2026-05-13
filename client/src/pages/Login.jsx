import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function login(e) {
    if (e) e.preventDefault();

    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userId", user.id);
      localStorage.setItem("username", user.username);
      localStorage.setItem("email", user.email);

      if (user.isAdmin) {
        localStorage.setItem("isAdmin", "true");
      }
      navigate("/dashboard");
    } catch (error) {
      if (error.response && error.response.data) {
        alert(error.response.data.error);
      } else {
        alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f8f6] font-sans text-gray-800">
      {/* Minimal top bar */}
      <div className="border-b border-gray-200 bg-white px-8 py-4 flex items-center">
        <span className="font-bold text-gray-900 text-lg tracking-tight">Decagon</span>
      </div>

      {/* Login Section */}
      <div className="flex flex-1 justify-center items-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
          <div className="mb-8">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Welcome back</p>
            <h2 className="text-2xl font-bold text-gray-900">Sign in to your account</h2>
          </div>

          <form onSubmit={login} className="space-y-5">
            <div>
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block mb-1.5">Email Address</label>
              <input
                type="text"
                required
                placeholder="you@example.com"
                className="w-full bg-gray-50 px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-gray-900 focus:bg-white transition-colors font-medium text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block mb-1.5">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="w-full bg-gray-50 px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-gray-900 focus:bg-white transition-colors font-medium text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 rounded-lg shadow-sm text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-500">Don't have an account? </span>
            <Link to="/register" className="font-semibold text-gray-900 hover:underline transition-colors">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}