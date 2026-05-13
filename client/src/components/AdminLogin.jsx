import { useState } from "react";
import Navbar from "./Navbar";

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex flex-col font-sans text-gray-800">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-gray-900 mb-2">Admin Access</h2>
            <p className="text-sm text-gray-500 font-medium">Please enter your credentials to continue</p>
          </div>
          
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase ml-1 block mb-1">Username</label>
              <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                className="w-full border border-gray-300 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                placeholder="admin"
              />
            </div>
            
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase ml-1 block mb-1">Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full border border-gray-300 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                placeholder="••••••••"
              />
            </div>
            
            {error && <p className="text-red-500 text-sm font-bold text-center mt-2">{error}</p>}
            
            <button 
              type="submit" 
              className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl mt-4 hover:bg-blue-700 transition shadow-lg"
            >
              Secure Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
