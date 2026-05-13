import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import Navbar from "../components/Navbar";

export default function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function register(e) {
    if (e) e.preventDefault();

    if (!email || !username || !password || !confirmPassword) {
      alert("Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/auth/register', { email, username, password });
      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userId", user.id);
      localStorage.setItem("username", user.username);
      localStorage.setItem("email", user.email);
      
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-200 font-sans text-gray-800">
      {/* Top Navbar */}
      <Navbar />

      {/* Register Section */}
      <div className="flex flex-1 justify-center items-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-gray-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900">Create Account</h2>
            <p className="mt-2 text-sm text-gray-600">Sign up to get started</p>
          </div>

          <form onSubmit={register} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                required
                placeholder="johndoe"
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            {/* Buttons */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating account..." : "Register"}
              </button>
            </div>
          </form>

          {/* Validation/Login Link */}
          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">Already have an account? </span>
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
              Sign in instead
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}