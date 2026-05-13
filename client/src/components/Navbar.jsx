import { useNavigate, useLocation } from "react-router-dom";

function Navbar() {

  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex justify-between items-center px-6 md:px-12 py-3 bg-white shadow-md sticky top-6 z-50 rounded-full mx-auto w-[98%] max-w-7xl mt-6 border border-gray-100">

      {/* LEFT - COMPANY NAME */}
      <h1
        className="text-2xl font-black cursor-pointer tracking-wider text-gray-900"
        onClick={() => navigate("/dashboard")}
      >
        DECAGON
      </h1>

      {/* RIGHT MENU - EQUALLY SPACED BUTTONS */}
      <div className="flex justify-end gap-4 md:gap-10 text-sm font-semibold">

        <button
          onClick={() => navigate("/dashboard")}
          className={`px-5 py-2.5 rounded-full transition-all duration-200 ${
            isActive("/dashboard")
              ? "bg-gray-100 text-blue-700 shadow-sm"
              : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
          }`}
        >
          Dashboard
        </button>

        <button
          onClick={() => navigate("/admin")}
          className={`px-5 py-2.5 rounded-full transition-all duration-200 ${
            isActive("/admin")
              ? "bg-gray-100 text-blue-700 shadow-sm"
              : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
          }`}
        >
          Admin Panel
        </button>

        <button
          onClick={() => {
            localStorage.clear();
            navigate("/login");
          }}
          className="px-5 py-2.5 rounded-full text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200"
        >
          Logout
        </button>

      </div>

    </div>

  );
}

export default Navbar;