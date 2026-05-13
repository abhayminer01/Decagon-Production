import { useNavigate, useLocation } from "react-router-dom";

function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const now = new Date();

  const displayName = localStorage.getItem("username") || "User";
  const email = localStorage.getItem("email") || "";

  const navLinks = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "New Project", path: "/project-type" },
    { label: "Ongoing", path: "/ongoing" },
    { label: "Completed", path: "/completed" },
  ];

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-[#f8f8f6] flex font-sans" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* ── SIDEBAR ── */}
      <aside className="w-56 bg-[#1a1a1a] flex flex-col fixed top-0 left-0 h-screen z-40">
        {/* Brand */}
        <div className="px-6 py-6 border-b border-white/[0.07]">
          <button onClick={() => navigate("/dashboard")} className="text-white font-black text-lg tracking-[0.15em] hover:text-white/80 transition">
            DECAGON
          </button>
          <p className="text-white/30 text-[10px] font-medium mt-0.5 tracking-wide">Interior Management</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto custom-scrollbar">
          <p className="text-white/20 text-[9px] font-bold uppercase tracking-widest px-3 py-2 mt-1">Navigation</p>
          {navLinks.map(({ label, path }) => {
            // Dashboard should be exact match so it doesn't highlight when elsewhere
            const active = path === '/dashboard' ? location.pathname === '/dashboard' : isActive(path);
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  active
                    ? "bg-white/10 text-white font-semibold"
                    : "text-white/45 hover:text-white/70 hover:bg-white/[0.05] font-medium"
                }`}
              >
                {label}
              </button>
            )
          })}

          <p className="text-white/20 text-[9px] font-bold uppercase tracking-widest px-3 py-2 mt-4">System</p>
          <button
            onClick={() => navigate("/admin")}
            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
              isActive("/admin")
                ? "bg-white/10 text-white font-semibold"
                : "text-white/45 hover:text-white/70 hover:bg-white/[0.05] font-medium"
            }`}
          >
            Admin Panel
          </button>
        </nav>

        {/* User + Logout */}
        <div className="px-3 pb-5 border-t border-white/[0.07] pt-4 space-y-1">
          <div className="px-3 py-2">
            <p className="text-white/60 text-xs font-semibold truncate">{displayName}</p>
            <p className="text-white/25 text-[10px] truncate">{email}</p>
          </div>
          <button
            onClick={() => { localStorage.clear(); navigate("/login"); }}
            className="w-full text-left px-3 py-2 rounded-md text-sm text-white/35 hover:text-red-400 hover:bg-red-500/5 transition-colors font-medium"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="flex-1 ml-56 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-[#f8f8f6] border-b border-gray-200 px-10 py-4 flex justify-between items-center sticky top-0 z-30">
          <div>
            <h1 className="text-base font-semibold text-gray-900">
              {now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening"},{" "}
              {displayName}
            </h1>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-gray-500 text-sm font-semibold px-4 py-2 hover:text-gray-900 transition-colors"
            >
              Back to Home
            </button>
            <button
              onClick={() => navigate("/project-type")}
              className="bg-gray-900 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors shadow-sm"
            >
              New project
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 px-10 py-8 relative">
          {children}
        </main>

        {/* Footer */}
        <footer className="px-10 py-4 border-t border-gray-200 text-[11px] text-gray-400 flex justify-between bg-[#f8f8f6] mt-auto">
          <span>Decagon &copy; {now.getFullYear()}</span>
          <span>Interior Design Management Platform</span>
        </footer>
      </div>
    </div>
  );
}

export default Layout;
