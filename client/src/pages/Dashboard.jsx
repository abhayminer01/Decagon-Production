import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api";

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const now = new Date();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get('/projects');
        setProjects(res.data);
      } catch (error) {
        console.error("Error fetching projects", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const ongoing = projects.filter(p => p.status === "ongoing");
  const completed = projects.filter(p => p.status === "completed");
  const totalValue = projects.reduce((s, p) => s + (p.total || 0), 0);

  const recent = [...projects]
    .sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0))
    .slice(0, 8);

  const displayName = localStorage.getItem("username") || "User";
  const email = localStorage.getItem("email") || "";

  const navLinks = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "New Project", path: "/project-type" },
    { label: "Ongoing", path: "/ongoing" },
    { label: "Completed", path: "/completed" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#f8f8f6] flex font-sans" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── SIDEBAR ── */}
      <aside className="w-56 bg-[#1a1a1a] flex flex-col fixed top-0 left-0 h-screen z-40">
        {/* Brand */}
        <div className="px-6 py-6 border-b border-white/[0.07]">
          <button onClick={() => navigate("/dashboard")} className="text-white font-black text-lg tracking-[0.15em]">
            DECAGON
          </button>
          <p className="text-white/30 text-[10px] font-medium mt-0.5 tracking-wide">Interior Management</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-0.5">
          <p className="text-white/20 text-[9px] font-bold uppercase tracking-widest px-3 py-2 mt-1">Navigation</p>
          {navLinks.map(({ label, path }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                isActive(path)
                  ? "bg-white/10 text-white font-semibold"
                  : "text-white/45 hover:text-white/70 hover:bg-white/[0.05] font-medium"
              }`}
            >
              {label}
            </button>
          ))}

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
      <div className="flex-1 ml-56 flex flex-col">

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
          <button
            onClick={() => navigate("/project-type")}
            className="bg-gray-900 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            New project
          </button>
        </header>

        {/* Body */}
        <main className="flex-1 px-10 py-8 space-y-10">

          {/* STATS */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-gray-200 border border-gray-200 rounded-xl overflow-hidden">
            {[
              { label: "Total projects", value: loading ? "—" : projects.length, foot: "All time" },
              { label: "Ongoing", value: loading ? "—" : ongoing.length, foot: "Active drafts" },
              { label: "Completed", value: loading ? "—" : completed.length, foot: "Closed" },
              { label: "Portfolio value", value: loading ? "—" : `₹${(totalValue / 100000).toFixed(1)}L`, foot: "Cumulative" },
            ].map((s, i) => (
              <div key={i} className="bg-[#f8f8f6] px-6 py-5">
                <p className="text-[11px] text-gray-400 font-medium mb-3">{s.label}</p>
                <p className="text-3xl font-bold text-gray-900 tracking-tight">{s.value}</p>
                <p className="text-[11px] text-gray-400 mt-1">{s.foot}</p>
              </div>
            ))}
          </section>

          {/* QUICK ACTIONS */}
          <section>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Quick actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Start new project", desc: "Create a new interior estimate", path: "/project-type" },
                { label: "View ongoing", desc: "Track active projects", path: "/ongoing" },
                { label: "Completed work", desc: "Browse finished projects", path: "/completed" },
                { label: "Admin panel", desc: "Manage modules and rates", path: "/admin" },
              ].map(({ label, desc, path }) => (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className="bg-white border border-gray-200 rounded-xl p-4 text-left hover:border-gray-400 hover:shadow-sm transition-all group"
                >
                  <p className="text-sm font-semibold text-gray-800 mb-1 group-hover:text-gray-900">{label}</p>
                  <p className="text-[11px] text-gray-400 leading-snug">{desc}</p>
                </button>
              ))}
            </div>
          </section>

          {/* RECENT PROJECTS */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Recent activity</h2>
              <button onClick={() => navigate("/ongoing")} className="text-xs text-gray-500 hover:text-gray-800 transition-colors font-medium">
                See all →
              </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              {loading ? (
                <div className="px-6 py-10 text-sm text-gray-400 text-center">Loading...</div>
              ) : recent.length === 0 ? (
                <div className="px-6 py-14 flex flex-col items-center text-center gap-3">
                  <p className="text-sm font-semibold text-gray-600">No projects yet</p>
                  <p className="text-xs text-gray-400 max-w-xs">Create your first project to start managing interior configurations and generating cost estimates.</p>
                  <button onClick={() => navigate("/project-type")} className="mt-2 text-xs font-semibold text-white bg-gray-900 px-4 py-2 rounded-lg hover:bg-gray-700 transition">
                    Create project →
                  </button>
                </div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="px-6 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Property</th>
                      <th className="px-6 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Area</th>
                      <th className="px-6 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider text-right">Value</th>
                      <th className="px-6 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((p, i) => (
                      <tr
                        key={p._id}
                        onClick={() => navigate(`/project/${p._id}`)}
                        className={`cursor-pointer hover:bg-gray-50 transition-colors ${i !== recent.length - 1 ? "border-b border-gray-50" : ""}`}
                      >
                        <td className="px-6 py-3.5">
                          <div>
                            <p className="font-semibold text-gray-800">{p.name || "Untitled"}</p>
                            <p className="text-[10px] text-gray-400 font-mono mt-0.5 truncate max-w-[140px]">{p._id}</p>
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-gray-500 hidden md:table-cell capitalize">
                          {p.property || "—"}
                        </td>
                        <td className="px-6 py-3.5 text-gray-500 hidden lg:table-cell">
                          {p.sqft ? `${p.sqft} sqft` : "—"}
                        </td>
                        <td className="px-6 py-3.5">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide
                            ${p.status === "completed"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {p.status === "completed" ? "Completed" : "Ongoing"}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-right font-semibold text-gray-900">
                          ₹{(p.total || 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-3.5 text-right hidden sm:table-cell">
                          <span className="text-xs text-gray-300 group-hover:text-gray-500">→</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>

        </main>

        <footer className="px-10 py-4 border-t border-gray-200 text-[11px] text-gray-400 flex justify-between">
          <span>Decagon &copy; {now.getFullYear()}</span>
          <span>Interior Design Management Platform</span>
        </footer>
      </div>

    </div>
  );
}

export default Dashboard;