import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";   // ✅ IMPORT NAVBAR

function ProjectType() {

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-gray-50 flex flex-col font-sans text-gray-800 relative isolation-auto">
      {/* Decorative gradients */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-br from-blue-100/50 via-purple-50/20 to-transparent -z-10"></div>

      {/* ✅ COMMON NAVBAR */}
      <Navbar />

      <div className="flex flex-col flex-1 items-center justify-center animate-fade-in p-8">
        
        <div className="text-center mb-12">
           <h1 className="text-4xl font-black text-gray-900 tracking-tight drop-shadow-sm mb-3">Project Type</h1>
           <p className="text-gray-500 font-medium text-lg max-w-md mx-auto">Select the primary scope format for your new configuration.</p>
        </div>

        <div className="flex flex-col md:flex-row items-stretch justify-center gap-10 max-w-4xl w-full">

          {/* Left Box (Hero Type) */}
          <div className="bg-white/60 backdrop-blur-xl border border-white flex-1 p-10 flex flex-col items-center justify-center rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="h-24 w-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
               <svg className="w-10 h-10 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
            </div>
            <h2 className="text-2xl font-black text-gray-800">Interior Scope</h2>
            <p className="text-gray-500 mt-2 text-center font-medium">Full interior quoting pipeline</p>
          </div>

          {/* Right Buttons */}
          <div className="flex flex-col gap-6 justify-center flex-1">

            <button
              onClick={() => navigate("/project-details")}
              className="bg-white/80 backdrop-blur-md border border-white hover:border-blue-200 px-8 py-8 rounded-3xl shadow-sm hover:shadow-xl hover:bg-white text-left transition-all duration-300 group relative overflow-hidden transform hover:-translate-y-1"
            >
              <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-blue-50/50 to-transparent"></div>
              <h3 className="text-2xl font-black text-gray-900 mb-1 relative z-10">Residential</h3>
              <p className="text-gray-500 font-medium relative z-10 text-sm">Homes, Villas & Apartments</p>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
              </div>
            </button>

            <button
              onClick={() => navigate("/project-details")}
              className="bg-white/80 backdrop-blur-md border border-white hover:border-emerald-200 px-8 py-8 rounded-3xl shadow-sm hover:shadow-xl hover:bg-white text-left transition-all duration-300 group relative overflow-hidden transform hover:-translate-y-1"
            >
              <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-emerald-50/50 to-transparent"></div>
              <h3 className="text-2xl font-black text-gray-900 mb-1 relative z-10">Commercial</h3>
              <p className="text-gray-500 font-medium relative z-10 text-sm">Offices, Retail & Corporate</p>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
              </div>
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default ProjectType;