import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProjectType from "./pages/ProjectType";
import ProjectDetails from "./pages/ProjectDetails";
import ProjectView from "./pages/ProjectView";
import RoomSelection from "./pages/RoomSelection";
import RoomConfigurator from "./pages/RoomConfigurator";
import Ongoing from "./pages/Ongoing";
import Completed from "./pages/Completed";
import Admin from "./pages/Admin";
import ProtectedRoute from "./components/ProtectedRoute";
import { AdminDataProvider } from "./context/AdminDataContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AdminDataProvider>
        <Routes>

          {/* Main Pages */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

          {/* Admin Page */}
          <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />

          {/* Project Creation Flow */}
          <Route path="/project-type" element={<ProtectedRoute><ProjectType /></ProtectedRoute>} />
          <Route path="/project-details" element={<ProtectedRoute><ProjectDetails /></ProtectedRoute>} />
          <Route path="/rooms" element={<ProtectedRoute><RoomSelection /></ProtectedRoute>} />
          <Route path="/configure/:roomType" element={<ProtectedRoute><RoomConfigurator /></ProtectedRoute>} />

          {/* Project Lists */}
          <Route path="/ongoing" element={<ProtectedRoute><Ongoing /></ProtectedRoute>} />
          <Route path="/completed" element={<ProtectedRoute><Completed /></ProtectedRoute>} />

          {/* Project Details / View Dashboard */}
          <Route path="/project/:id" element={<ProtectedRoute><ProjectView /></ProtectedRoute>} />

        </Routes>
      </AdminDataProvider>
    </BrowserRouter>
  </StrictMode>
);