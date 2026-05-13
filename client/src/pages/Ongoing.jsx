import { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function Ongoing() {
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get('/projects');
        const list = res.data.filter(p => p.status === "ongoing");
        setProjects(list.map(p => ({ ...p, id: p._id })));
      } catch (error) {
        console.error("Error fetching projects", error);
      }
    };
    fetchProjects();
  }, []);

  const markCompleted = async (e, id) => {
    e.stopPropagation(); // Prevent the card's onClick from triggering
    const confirmComplete = window.confirm("Are you sure you want to mark this project as completed?");
    if (confirmComplete) {
      try {
        await api.put(`/projects/${id}`, { status: "completed" });
        setProjects(projects.filter(p => p.id !== id));
      } catch (error) {
        console.error("Error updating project", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-gray-50 flex flex-col font-sans text-gray-800 relative isolation-auto">
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-br from-amber-100/50 via-orange-50/30 to-transparent -z-10"></div>
      
      <Navbar />

      <div className="p-10 max-w-[1400px] mx-auto w-full flex-1 mt-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0 mb-10">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight drop-shadow-sm">Ongoing Projects</h1>
          <button onClick={() => navigate("/project-type")} className="bg-gray-900/90 backdrop-blur-md text-white font-bold px-6 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-black">
            + New Project
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="bg-white/60 backdrop-blur-xl border border-white/50 p-16 rounded-3xl shadow-xl flex flex-col items-center justify-center text-gray-500 text-center">
             <div className="h-20 w-20 bg-amber-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
               <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
             </div>
             <p className="text-xl font-bold text-gray-700">No active projects found</p>
             <p className="text-sm mt-2 max-w-sm">Create a new project to start managing configurations and generating scopes.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {projects.map((project) => (
              <div
                key={project._id}
                onClick={() => navigate(`/project/${project._id}`)}
                className="bg-white/80 backdrop-blur-lg p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] transition-all duration-300 cursor-pointer flex flex-col justify-between group transform hover:-translate-y-1"
              >
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-1">{project.name || project.roomName || "Untitled Project"}</h2>
                  <p className="text-sm font-medium tracking-wide text-gray-500 uppercase mb-5">{project.property || "Unknown Property"}</p>
                  
                  <div className="flex gap-2 mb-5">
                    <span className="text-xs bg-amber-100 text-amber-800 font-black tracking-wide px-3 py-1 rounded-full uppercase">Iterating</span>
                    <span className="text-xs bg-gray-100 text-gray-600 font-bold px-3 py-1 rounded-full">{project.sqft} sqft</span>
                  </div>
                  
                  <div className="text-gray-900 font-bold mb-4 bg-gray-50/50 p-3 rounded-xl border border-gray-100/50 flex flex-col gap-1">
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Current Draft Total</span>
                    <span className="text-xl tracking-tight">₹ {project.total || 0}</span>
                  </div>
                </div>

                <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between items-center -mb-2">
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                     {new Date(project.createdAt).toLocaleDateString()}
                  </div>
                  <button
                    onClick={(e) => markCompleted(e, project._id)}
                    className="bg-green-50 text-green-700 hover:bg-green-600 hover:text-white border border-green-200 hover:border-green-600 font-bold px-4 py-2 rounded-xl transition-all duration-300 shadow-sm text-sm"
                  >
                    Mark Done
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Ongoing;