import { useState } from "react";
import Layout from "./Layout";

function AdminLogin({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === "admin" && password === "admin123") {
      onLoginSuccess(password);
    } else {
      setError("Invalid credentials. Please try again.");
    }
  };

  return (
    <Layout>
      <div className="flex-1 flex items-center justify-center p-4 min-h-[70vh]">
        <div className="bg-white p-8 rounded-2xl shadow-sm w-full max-w-md border border-gray-200">
          <div className="mb-8">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Admin Access</p>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Sign in to Admin Panel</h2>
            <p className="text-sm text-gray-500">Enter your credentials to continue</p>
          </div>
          
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block mb-1.5">Username</label>
              <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                className="w-full bg-gray-50 border border-gray-300 p-2.5 rounded-lg outline-none focus:ring-1 focus:ring-gray-900 focus:bg-white font-medium text-gray-900 transition-colors"
                placeholder="admin"
              />
            </div>
            
            <div>
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block mb-1.5">Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full bg-gray-50 border border-gray-300 p-2.5 rounded-lg outline-none focus:ring-1 focus:ring-gray-900 focus:bg-white font-medium text-gray-900 transition-colors"
                placeholder="••••••••"
              />
            </div>
            
            {error && (
              <p className="text-red-600 text-sm font-semibold text-center bg-red-50 border border-red-100 px-4 py-2 rounded-lg">{error}</p>
            )}
            
            <button 
              type="submit" 
              className="w-full bg-gray-900 text-white font-semibold py-3 rounded-lg mt-2 hover:bg-gray-800 transition-colors shadow-sm"
            >
              Secure Login
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}

export default AdminLogin;
