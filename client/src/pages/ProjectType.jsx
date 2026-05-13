import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

function ProjectType() {

  const navigate = useNavigate();

  return (
    <Layout>
      <div className="flex flex-col flex-1 items-center justify-center animate-fade-in p-8 w-full max-w-7xl mx-auto">
        
        <div className="text-center mb-12">
           <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-3">Project Type</h1>
           <p className="text-gray-500 font-medium text-base max-w-md mx-auto">Select the primary scope format for your new configuration.</p>
        </div>

        <div className="flex flex-col md:flex-row items-stretch justify-center gap-6 max-w-4xl w-full">

          {/* Left Box (Hero Type) */}
          <div className="bg-white border border-gray-200 flex-1 p-10 flex flex-col items-center justify-center rounded-xl relative overflow-hidden group">
            <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
               <svg className="w-8 h-8 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Interior Scope</h2>
            <p className="text-gray-500 mt-2 text-center text-sm font-medium">Full interior quoting pipeline</p>
          </div>

          {/* Right Buttons */}
          <div className="flex flex-col gap-4 justify-center flex-1">

            <button
              onClick={() => navigate("/project-details")}
              className="bg-white border border-gray-200 hover:border-gray-900 px-8 py-8 rounded-xl text-left transition-colors duration-200 group relative overflow-hidden flex justify-between items-center"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Residential</h3>
                <p className="text-gray-500 font-medium text-sm">Homes, Villas & Apartments</p>
              </div>
              <div className="text-gray-300 group-hover:text-gray-900 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
              </div>
            </button>

            <button
              onClick={() => navigate("/project-details")}
              className="bg-white border border-gray-200 hover:border-gray-900 px-8 py-8 rounded-xl text-left transition-colors duration-200 group relative overflow-hidden flex justify-between items-center"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Commercial</h3>
                <p className="text-gray-500 font-medium text-sm">Offices, Retail & Corporate</p>
              </div>
              <div className="text-gray-300 group-hover:text-gray-900 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
              </div>
            </button>

          </div>

        </div>

      </div>
    </Layout>
  );
}

export default ProjectType;