import { useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../api";
import Navbar from "../components/Navbar";

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
    <div className="min-h-screen bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-gray-50 flex flex-col font-sans text-gray-800 relative isolation-auto">
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-br from-blue-100/50 via-purple-50/20 to-transparent -z-10"></div>

      {/* ✅ COMMON NAVBAR */}
      <Navbar />

      {/* Form */}
      <div className="flex flex-1 justify-center items-center p-8 animate-fade-in">

        <div className="bg-white/70 backdrop-blur-xl p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white w-full max-w-2xl rounded-3xl">

          <div className="mb-8">
            <h3 className="font-black text-3xl text-gray-900 tracking-tight drop-shadow-sm">
              Project Details
            </h3>
            <p className="text-gray-500 font-medium mt-1">Enter client and property details below</p>
          </div>

          <div className="space-y-6">
            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2 ml-1">Project Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Residence"
                  className="bg-white/60 border border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none w-full font-bold text-gray-800 transition-shadow"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2 ml-1">Property Format</label>
                <input
                  type="text"
                  placeholder="e.g. 3BHK Villa"
                  className="bg-white/60 border border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none w-full font-bold text-gray-800 transition-shadow"
                  value={property}
                  onChange={(e) => setProperty(e.target.value)}
                />
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2 ml-1">Total Built-Up Area (Sqft)</label>
                <input
                  type="number"
                  placeholder="2500"
                  className="bg-white/60 border border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none w-full font-bold text-gray-800 transition-shadow"
                  value={sqft}
                  onChange={(e) => setSqft(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2 ml-1">Design Config</label>
                <input
                  type="text"
                  placeholder="Premium Focus"
                  className="bg-white/60 border border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none w-full font-bold text-gray-800 transition-shadow"
                  value={config}
                  onChange={(e) => setConfig(e.target.value)}
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2 ml-1">Site Location</label>
              <input
                type="text"
                placeholder="Sector 5, XYZ City"
                className="bg-white/60 border border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none w-full font-bold text-gray-800 transition-shadow"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            {/* File Upload */}
            <div className="bg-gray-50/50 border border-gray-200/60 p-5 rounded-2xl">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-3 ml-1">Attach Floorplan Drawing (Optional)</label>
              <input
                type="file"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </div>
          </div>

          {/* Button */}
          <div className="mt-10 flex justify-end items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-500 font-bold px-6 py-4 hover:text-gray-800 transition"
            >
              Back
            </button>
            <button
              onClick={proceed}
              className="bg-gray-900/90 backdrop-blur-md text-white font-bold px-10 py-4 rounded-xl shadow-lg hover:shadow-xl hover:bg-black hover:-translate-y-0.5 transition-all duration-300"
            >
              Create Project & Proceed
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}

export default ProjectDetails;