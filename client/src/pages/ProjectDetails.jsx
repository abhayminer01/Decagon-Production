import { useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../api";
import Layout from "../components/Layout";

function ProjectDetails() {

  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [property, setProperty] = useState("");
  const [sqft, setSqft] = useState("");
  const [config, setConfig] = useState("");
  const [location, setLocation] = useState("");
  const [file, setFile] = useState(null);

  async function proceed() {

    if (!name || !property || !sqft || !config || !location) {
      alert("Please fill all fields");
      return;
    }

    if (!localStorage.getItem("token")) {
      alert("You must be logged in to create a project.");
      return;
    }

    try {
      const res = await api.post("/projects", {
        name,
        property,
        sqft,
        config,
        location,
        status: "ongoing",
        total: 0
      });

      const projectId = res.data._id;

      navigate("/rooms", {
        state: { projectId }
      });
    } catch (error) {
      console.error(error);
      alert("Error creating project");
    }
  }

  return (
    <Layout>
      {/* Form */}
      <div className="flex flex-1 justify-center items-center p-8 animate-fade-in w-full">

        <div className="bg-white p-10 border border-gray-200 w-full max-w-2xl rounded-2xl shadow-sm">

          <div className="mb-8 border-b border-gray-100 pb-5">
            <h3 className="font-bold text-2xl text-gray-900 tracking-tight">
              Project Details
            </h3>
            <p className="text-gray-500 font-medium mt-1 text-sm">Enter client and property details below to initialize the drafting environment.</p>
          </div>

          <div className="space-y-5">
            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-2">
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Project Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Residence"
                  className="bg-white border border-gray-300 p-3 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none w-full text-gray-900 text-sm transition-colors shadow-sm"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Property Format</label>
                <input
                  type="text"
                  placeholder="e.g. 3BHK Villa"
                  className="bg-white border border-gray-300 p-3 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none w-full text-gray-900 text-sm transition-colors shadow-sm"
                  value={property}
                  onChange={(e) => setProperty(e.target.value)}
                />
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-2">
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Total Built-Up Area (Sqft)</label>
                <input
                  type="number"
                  placeholder="2500"
                  className="bg-white border border-gray-300 p-3 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none w-full text-gray-900 text-sm transition-colors shadow-sm"
                  value={sqft}
                  onChange={(e) => setSqft(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Design Config</label>
                <input
                  type="text"
                  placeholder="Premium Focus"
                  className="bg-white border border-gray-300 p-3 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none w-full text-gray-900 text-sm transition-colors shadow-sm"
                  value={config}
                  onChange={(e) => setConfig(e.target.value)}
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Site Location</label>
              <input
                type="text"
                placeholder="Sector 5, XYZ City"
                className="bg-white border border-gray-300 p-3 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none w-full text-gray-900 text-sm transition-colors shadow-sm"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            {/* File Upload */}
            <div className="bg-gray-50 border border-gray-200 border-dashed p-4 rounded-xl mt-2">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Attach Floorplan Drawing (Optional)</label>
              <input
                type="file"
                className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300 transition-colors cursor-pointer"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </div>
          </div>

          {/* Button */}
          <div className="mt-8 flex justify-end items-center gap-3 pt-5 border-t border-gray-100">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-500 font-semibold px-5 py-2.5 hover:text-gray-900 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={proceed}
              className="bg-gray-900 text-white font-semibold px-6 py-2.5 rounded-lg shadow-sm hover:bg-gray-800 transition-colors text-sm"
            >
              Create Project
            </button>
          </div>

        </div>

      </div>
    </Layout>
  );
}

export default ProjectDetails;