import { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

function Completed() {
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get('/projects');
        const list = res.data.filter(p => p.status === "completed");
        setProjects(list.map(p => ({ ...p, id: p._id })));
      } catch (error) {
        console.error("Error fetching projects", error);
      }
    };
    fetchProjects();
  }, []);

  const deleteProject = async (e, projectId) => {
    e.stopPropagation();
    if(window.confirm("Are you sure you want to permanently delete this completed project? This action cannot be undone.")) {
      try {
        await api.delete(`/projects/${projectId}`);
        setProjects(projects.filter(p => p.id !== projectId));
      } catch (error) {
        console.error("Error deleting project", error);
        alert("Failed to delete project");
      }
    }
  };

  return (
    <Layout>
      <div className="p-6 md:p-10 max-w-[1400px] mx-auto w-full flex-1 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Completed Projects</h1>
        </div>

        {projects.length === 0 ? (
          <div className="bg-white border border-gray-200 p-12 rounded-xl shadow-sm flex flex-col items-center justify-center text-gray-500 text-center">
             <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-6">
               <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
             </div>
             <p className="text-lg font-semibold text-gray-900">No completed projects yet</p>
             <p className="text-sm mt-2 max-w-sm text-gray-500">Projects marked as completed will appear here for archival and future reference.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {projects.map((project) => (
              <div
                key={project._id}
                onClick={() => navigate(`/project/${project._id}`)}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-gray-900 transition-colors cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">{project.name || project.roomName || "Untitled Project"}</h2>
                  <p className="text-xs font-semibold tracking-wider text-gray-500 uppercase mb-4">{project.property || "Unknown Property"}</p>
                  
                  <div className="flex gap-2 mb-4">
                    <span className="text-[10px] bg-green-50 text-green-700 border border-green-200 font-bold tracking-wider px-2 py-1 rounded uppercase">Completed</span>
                    <span className="text-[10px] bg-gray-50 border border-gray-200 text-gray-600 font-semibold px-2 py-1 rounded">{project.sqft} sqft</span>
                  </div>
                  
                  <div className="text-gray-900 font-bold mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100 flex flex-col gap-1">
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Final Cost</span>
                    <span className="text-xl tracking-tight">₹ {project.total || 0}</span>
                  </div>
                  
                  <div className="text-[11px] text-gray-400 font-semibold tracking-wider uppercase">
                    Started: {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                   <button
                     onClick={(e) => deleteProject(e, project._id)}
                     className="bg-white text-red-600 hover:bg-red-50 border border-red-200 font-semibold px-3 py-1.5 rounded-md transition-colors shadow-sm text-[11px] uppercase tracking-wider"
                   >
                     Clear Record
                   </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Completed;