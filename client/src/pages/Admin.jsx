import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import AdminLogin from "../components/AdminLogin";
import { useAdminData } from "../context/AdminDataContext";
import api from "../api";

function Admin() {
  const { services, finishings, coreMaterials, accessories, stylings, rooms, loading, bootstrapData, fetchData } = useAdminData();
  const [activeTab, setActiveTab] = useState("rooms");
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");

  useEffect(() => {
    // Session persistence removed as per security request
  }, []);

  // Shared upload logic using canvas compression to base64
  const [isUploading, setIsUploading] = useState(false);
  const handleImageUpload = (e, setUrlCallback) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsUploading(true);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Resize down to max 600px width/height to save DB space
        const MAX_DIM = 600;
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > MAX_DIM) {
            height *= MAX_DIM / width;
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width *= MAX_DIM / height;
            height = MAX_DIM;
          }
        }
        
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        
        // Export to highly compressed JPEG base64
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        setUrlCallback(dataUrl);
        setIsUploading(false);
      };
      
      img.onerror = () => {
        alert("Invalid image file.");
        setIsUploading(false);
      };
      
      img.src = event.target.result;
    };
    
    reader.onerror = () => {
      alert("Error reading file.");
      setIsUploading(false);
    };
    
    reader.readAsDataURL(file);
  };

  // Local state for object items
  const [newObjName, setNewObjName] = useState("");
  const [newObjPrice, setNewObjPrice] = useState("");
  const [newObjImage, setNewObjImage] = useState("");

  // Rooms/Modules
  const [newRoomId, setNewRoomId] = useState("");
  const [newRoomTitle, setNewRoomTitle] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [newModuleName, setNewModuleName] = useState("");

  // Designs
  const [newDesignName, setNewDesignName] = useState("");
  const [newDesignImage, setNewDesignImage] = useState("");

  if (!isAdminLoggedIn) {
    return <AdminLogin onLoginSuccess={(pwd) => {
      setAdminPassword(pwd);
      setIsAdminLoggedIn(true);
    }} />;
  }

  // Access denied removed or simplified as it now depends on AdminLogin

  if (loading) {
    return (
      <Layout>
        <div className="flex-1 flex justify-center items-center font-semibold text-gray-500 text-lg">Loading Admin Data...</div>
      </Layout>
    );
  }

  const isDbEmpty = (!services || services.length === 0) && (!rooms || Object.keys(rooms).length === 0);

  const needsUpgrade = rooms && Object.values(rooms).some(r => {
    if (!r.modules) return false;
    const firstMod = Object.values(r.modules)[0];
    return typeof firstMod === 'string';
  });

  // --- OBJECTS HANDLERS (Finishings, Core Materials, Services, Accessories) ---
  const handleAddObjectItem = async (type, currentArray) => {
    if (!newObjName.trim() || newObjPrice === "") return;
    
    // Some types use images (services, accessories), others don't (coreMaterials, finishings)
    let newItem = { name: newObjName.trim(), price: Number(newObjPrice) };
    if (type === "services" || type === "accessories" || type === "stylings") {
      newItem.image = newObjImage;
    }

    const updatedArray = [...(currentArray || []), newItem];
    await api.put(`/admin/${type}`, { data: updatedArray }, {
      headers: { 'X-Admin-Password': adminPassword }
    });
    await fetchData();
    
    setNewObjName("");
    setNewObjPrice("");
    setNewObjImage("");
  };

  const handleEditObjectItem = async (type, currentArray, index, currentObj) => {
    const newName = prompt(`Edit Name:`, currentObj.name);
    if (newName === null) return;
    const newPrice = prompt(`Edit Price:`, currentObj.price);
    if (newPrice === null) return;

    let newImage = currentObj.image;
    if (type === "services" || type === "accessories" || type === "stylings") {
      const askImage = prompt(`Provide new Image URL or leave as is to keep old image:`, currentObj.image || "");
      if (askImage !== null) {
        newImage = askImage;
      }
    }

    if (newName.trim() !== "" && !isNaN(Number(newPrice))) {
      const updatedArray = [...currentArray];
      updatedArray[index] = { name: newName.trim(), price: Number(newPrice) };
      if (type === "services" || type === "accessories" || type === "stylings") {
        updatedArray[index].image = newImage;
      }
      await api.put(`/admin/${type}`, { data: updatedArray }, {
      headers: { 'X-Admin-Password': adminPassword }
    });
      await fetchData();
    }
  };

  const handleDeleteObjectItem = async (type, currentArray, index) => {
    if(!confirm("Are you sure you want to delete this item?")) return;
    const updatedArray = currentArray.filter((_, i) => i !== index);
    await api.put(`/admin/${type}`, { data: updatedArray }, {
      headers: { 'X-Admin-Password': adminPassword }
    });
    await fetchData();
  };


  // --- ROOMS HANDLERS ---
  const handleAddRoom = async () => {
    if (!newRoomId.trim() || !newRoomTitle.trim()) return;
    const updatedRooms = { 
      ...rooms, 
      [newRoomId.trim()]: { id: newRoomId.trim(), title: newRoomTitle.trim(), modules: {} } 
    };
    await api.put(`/admin/rooms`, { data: updatedRooms }, { headers: { 'X-Admin-Password': adminPassword } });
    await fetchData();
    setNewRoomId("");
    setNewRoomTitle("");
  };

  const handleDeleteRoom = async (roomId) => {
    if(!confirm(`Delete room '${roomId}' entirely?`)) return;
    const updatedRooms = { ...rooms };
    delete updatedRooms[roomId];
    await api.put(`/admin/rooms`, { data: updatedRooms }, { headers: { 'X-Admin-Password': adminPassword } });
    await fetchData();
    if (selectedRoomId === roomId) {
      setSelectedRoomId(null);
      setSelectedModuleId(null);
    }
  };

  const handleEditRoomTitle = async (roomId, currentTitle) => {
    const newTitle = prompt("Enter new title for room:", currentTitle);
    if (newTitle && newTitle.trim() !== "") {
      const updatedRooms = { ...rooms };
      updatedRooms[roomId].title = newTitle.trim();
      await api.put(`/admin/rooms`, { data: updatedRooms }, { headers: { 'X-Admin-Password': adminPassword } });
      await fetchData();
    }
  };

  // --- MODULES HANDLERS ---
  const handleAddModule = async () => {
    if (!selectedRoomId || !newModuleName.trim()) return;
    const modId = "mod_" + Date.now();
    const currentModules = rooms[selectedRoomId].modules || {};
    const updatedModules = {
      ...currentModules,
      [modId]: { id: modId, name: newModuleName.trim(), designs: [] }
    };
    const updatedRooms = { ...rooms };
    updatedRooms[selectedRoomId].modules = updatedModules;
    await api.put(`/admin/rooms`, { data: updatedRooms }, { headers: { 'X-Admin-Password': adminPassword } });
    await fetchData();
    setNewModuleName("");
  };

  const handleEditModule = async (roomId, modId, currentName) => {
    const newName = prompt("Edit Module Category Name:", currentName);
    if (newName && newName.trim() !== "") {
      const updatedRooms = { ...rooms };
      updatedRooms[roomId].modules[modId].name = newName.trim();
      await api.put(`/admin/rooms`, { data: updatedRooms }, { headers: { 'X-Admin-Password': adminPassword } });
      await fetchData();
    }
  };

  const handleDeleteModule = async (roomId, modId) => {
    if(!confirm("Delete this entire module and its designs?")) return;
    const currentModules = { ...(rooms[roomId].modules || {}) };
    delete currentModules[modId];
    const updatedRooms = { ...rooms };
    updatedRooms[roomId].modules = currentModules;
    await api.put(`/admin/rooms`, { data: updatedRooms }, { headers: { 'X-Admin-Password': adminPassword } });
    await fetchData();
    if (selectedModuleId === modId) setSelectedModuleId(null);
  };

  // --- DESIGNS HANDLERS ---
  const handleAddDesign = async () => {
    if (!selectedRoomId || !selectedModuleId) return;
    if (!newDesignName.trim()) {
      alert("Please fill in a design name.");
      return;
    }

    const currentDesigns = rooms[selectedRoomId].modules[selectedModuleId].designs || [];
    const newId = currentDesigns.length > 0 ? Math.max(...currentDesigns.map(d => d.id || 0)) + 1 : 1;
    
    const newDesign = { 
      id: newId, 
      name: newDesignName.trim(), 
      image: newDesignImage.trim()
    };
    
    const updatedDesigns = [...currentDesigns, newDesign];
    const updatedRooms = { ...rooms };
    updatedRooms[selectedRoomId].modules[selectedModuleId].designs = updatedDesigns;
    await api.put(`/admin/rooms`, { data: updatedRooms }, { headers: { 'X-Admin-Password': adminPassword } });
    await fetchData();
    
    setNewDesignName("");
    setNewDesignImage("");
  };

  const handleEditDesign = async (index, currentObj) => {
    if (!selectedRoomId || !selectedModuleId) return;
    
    const newName = prompt("Edit Design Name:", currentObj.name);
    if (newName === null) return;
    const newImg = prompt("Image URL (optional):", currentObj.image || "");
    if (newImg === null) return;

    if (newName.trim() !== "") {
      const updatedDesigns = [...(rooms[selectedRoomId].modules[selectedModuleId].designs || [])];
      updatedDesigns[index] = { 
        ...currentObj, 
        name: newName.trim(), 
        image: newImg.trim() 
      };
      const updatedRooms = { ...rooms };
      updatedRooms[selectedRoomId].modules[selectedModuleId].designs = updatedDesigns;
      await api.put(`/admin/rooms`, { data: updatedRooms }, { headers: { 'X-Admin-Password': adminPassword } });
      await fetchData();
    }
  };

  const handleDeleteDesign = async (index) => {
    if (!selectedRoomId || !selectedModuleId) return;
    if(!confirm("Delete this design from the module?")) return;
    const currentDesigns = rooms[selectedRoomId].modules[selectedModuleId].designs || [];
    const updatedDesigns = currentDesigns.filter((_, i) => i !== index);
    const updatedRooms = { ...rooms };
    updatedRooms[selectedRoomId].modules[selectedModuleId].designs = updatedDesigns;
    await api.put(`/admin/rooms`, { data: updatedRooms }, { headers: { 'X-Admin-Password': adminPassword } });
    await fetchData();
  };


  return (
    <Layout>
      <div className="max-w-[1400px] mx-auto w-full flex-1">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Admin Panel</h2>
          <div className="flex gap-3">
            {needsUpgrade && (
              <button onClick={() => { if(confirm('Upgrade Database to new Dimensional format?')) bootstrapData(); }} className="bg-white border border-orange-300 text-orange-700 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-orange-50 shadow-sm transition">
                Upgrade Legacy DB
              </button>
            )}
            {isDbEmpty && (
              <button onClick={bootstrapData} className="bg-gray-900 text-white px-5 py-2 rounded-lg font-semibold text-sm hover:bg-gray-800 shadow-sm transition">
                Bootstrap DB Data
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-gray-200 overflow-x-auto">
          {["rooms", "coreMaterials", "services", "accessories", "stylings"].map(tab => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setSelectedRoomId(null);
                setSelectedModuleId(null);
              }}
              className={`px-4 py-2.5 font-semibold text-sm transition-colors capitalize border-b-2 -mb-px ${
                activeTab === tab 
                  ? "text-gray-900 border-gray-900" 
                  : "text-gray-500 border-transparent hover:text-gray-800"
              }`}
            >
               {tab === "coreMaterials" ? "Materials" : tab === "stylings" ? "Stylings" : tab}
            </button>
          ))}
        </div>

        {/* Render Active Tab Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-[600px] flex flex-col">
          
          {/* ROOMS HIERARCHY TAB */}
          {activeTab === "rooms" && (
            <div className="flex flex-col lg:flex-row gap-6 h-full flex-1">
              {/* 1. LEVEL 1: ROOMS */}
              <div className="lg:w-1/4 border-b lg:border-b-0 lg:border-r border-gray-200 lg:pr-6 flex flex-col">
                <h3 className="font-bold text-base mb-4 text-gray-900 uppercase tracking-widest text-[11px]">1. Rooms</h3>
                
                <div className="flex flex-col gap-2 mb-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <input value={newRoomId} onChange={(e) => setNewRoomId(e.target.value)} placeholder="ID (e.g. living-room)" className="border border-gray-300 p-2 rounded-lg outline-none focus:ring-1 focus:ring-gray-900 text-sm bg-white" />
                  <input value={newRoomTitle} onChange={(e) => setNewRoomTitle(e.target.value)} placeholder="Title (e.g. Living Room)" className="border border-gray-300 p-2 rounded-lg outline-none focus:ring-1 focus:ring-gray-900 text-sm bg-white" />
                  <button onClick={handleAddRoom} className="bg-gray-900 text-white font-semibold py-1.5 rounded-lg hover:bg-gray-800 transition-colors text-sm">Add Room</button>
                </div>

                <div className="space-y-1.5 overflow-y-auto custom-scrollbar flex-1">
                  {Object.values(rooms || {}).filter(r => r !== null).map((room, idx) => {
                    const isLegacy = typeof room === 'string';
                    const roomId = isLegacy ? `legacy_${idx}` : room.id;
                    const roomTitle = isLegacy ? room : room.title;

                    return (
                      <div 
                        key={roomId || idx} 
                        onClick={() => { if(!isLegacy) { setSelectedRoomId(roomId); setSelectedModuleId(null); } }} 
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedRoomId === roomId 
                            ? "bg-gray-900 border-gray-900" 
                            : "hover:bg-gray-50 border-gray-200"
                        } ${isLegacy ? "opacity-70" : ""}`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className={`font-semibold text-sm ${selectedRoomId === roomId ? "text-white" : "text-gray-900"}`}>{roomTitle}</p>
                            <p className={`text-[10px] font-mono mt-0.5 ${selectedRoomId === roomId ? "text-gray-300" : "text-gray-500"}`}>{isLegacy ? "Legacy Format" : roomId}</p>
                          </div>
                          <div className="flex flex-col gap-1 items-end">
                            <button onClick={(e) => { e.stopPropagation(); if(!isLegacy) handleEditRoomTitle(roomId, roomTitle); }} className={`text-[11px] font-semibold ${selectedRoomId === roomId ? "text-gray-300 hover:text-white" : "text-gray-500 hover:text-gray-900"} ${isLegacy ? "invisible" : ""}`}>Edit</button>
                            <button onClick={(e) => { e.stopPropagation(); handleDeleteRoom(roomId); }} className={`text-[11px] font-semibold ${selectedRoomId === roomId ? "text-red-300 hover:text-red-200" : "text-red-500 hover:text-red-700"}`}>Del</button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {(!rooms || Object.keys(rooms).length === 0) && <p className="text-gray-400 text-sm text-center py-4">No rooms added.</p>}
                </div>
              </div>

              {/* 2. LEVEL 2: MODULES */}
              <div className="lg:w-1/4 border-b lg:border-b-0 lg:border-r border-gray-200 lg:pr-6 flex flex-col">
                <h3 className="font-bold text-[11px] mb-4 text-gray-900 uppercase tracking-widest">2. Modules</h3>
                
                {selectedRoomId ? (
                  <>
                    <div className="flex flex-col gap-2 mb-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">In: {rooms[selectedRoomId]?.title}</p>
                      <input value={newModuleName} onChange={(e) => setNewModuleName(e.target.value)} placeholder="Module (e.g. Wardrobes)" className="border border-gray-300 p-2 rounded-lg outline-none focus:ring-1 focus:ring-gray-900 text-sm bg-white" />
                      <button onClick={handleAddModule} className="bg-gray-900 text-white font-semibold py-1.5 rounded-lg hover:bg-gray-800 transition-colors text-sm">Add Module Category</button>
                    </div>

                    <div className="space-y-1.5 overflow-y-auto custom-scrollbar flex-1">
                      {Object.values(rooms[selectedRoomId]?.modules || {}).filter(m => m !== null).map((mod, idx) => (
                        <div 
                          key={mod.id || idx} 
                          onClick={() => setSelectedModuleId(mod.id)} 
                          className={`p-3 border rounded-lg cursor-pointer transition-colors flex justify-between items-center ${
                            selectedModuleId === mod.id 
                              ? "bg-gray-900 border-gray-900" 
                              : "hover:bg-gray-50 border-gray-200"
                          }`}
                        >
                          <span className={`text-sm font-semibold ${selectedModuleId === mod.id ? "text-white" : "text-gray-800"}`}>{mod.name}</span>
                          <div className="flex gap-2">
                            <button onClick={(e) => { e.stopPropagation(); handleEditModule(selectedRoomId, mod.id, mod.name); }} className={`text-[11px] px-1.5 py-0.5 rounded font-semibold ${selectedModuleId === mod.id ? "bg-white/20 text-white hover:bg-white/30" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>Edit</button>
                            <button onClick={(e) => { e.stopPropagation(); handleDeleteModule(selectedRoomId, mod.id); }} className={`text-[11px] px-1.5 py-0.5 rounded font-semibold ${selectedModuleId === mod.id ? "bg-red-500/30 text-red-200 hover:bg-red-500/50" : "bg-red-50 text-red-700 hover:bg-red-100"}`}>Del</button>
                          </div>
                        </div>
                      ))}
                      {(!rooms[selectedRoomId]?.modules || Object.keys(rooms[selectedRoomId].modules).length === 0) && <p className="text-gray-400 text-sm text-center py-4">No modules in this room.</p>}
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-400 text-sm text-center border border-dashed border-gray-300 rounded-xl p-4">
                    Select a room from the left to view modules
                  </div>
                )}
              </div>

              {/* 3. LEVEL 3: DESIGNS & PRICING */}
              <div className="lg:w-2/4 flex flex-col">
                <h3 className="font-bold text-[11px] mb-4 text-gray-900 uppercase tracking-widest">3. Designs & Pricing</h3>
                
                {selectedModuleId ? (
                  <>
                    <div className="flex flex-col gap-3 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                        In: {rooms[selectedRoomId]?.title} &gt; {rooms[selectedRoomId]?.modules[selectedModuleId]?.name}
                      </p>
                      
                      <div className="flex gap-3 items-center">
                        <input value={newDesignName} onChange={(e) => setNewDesignName(e.target.value)} placeholder="Design Name (e.g. Hinged Sliding)" className="border border-gray-300 p-2 rounded-lg outline-none focus:ring-1 focus:ring-gray-900 text-sm flex-1 bg-white" />
                        <div className="border border-gray-300 bg-white p-2 rounded-lg flex-1 flex items-center shrink-0">
                          <label className="text-[10px] text-gray-500 font-bold uppercase mr-2 shrink-0 tracking-wider">Image:</label>
                          <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setNewDesignImage)} className="text-xs w-full cursor-pointer" />
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-1">
                        <p className="text-xs text-gray-500 font-semibold">
                          {isUploading ? <span className="text-gray-700 animate-pulse">Uploading image...</span> : newDesignImage ? "✅ Image ready" : "No image selected"}
                        </p>
                        <button disabled={isUploading} onClick={handleAddDesign} className={`bg-gray-900 text-white font-semibold px-5 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm h-[38px] shadow-sm ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>Add Design</button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 overflow-y-auto custom-scrollbar pr-2 flex-1 content-start">
                      {(rooms[selectedRoomId]?.modules[selectedModuleId]?.designs || []).filter(d => d !== null).map((design, index) => (
                        <div key={design.id || index} className="p-4 border border-gray-200 rounded-xl hover:border-gray-400 transition-colors bg-white group flex flex-col h-full">
                          
                          <div className="flex gap-4">
                            {design.image ? (
                              <div className="h-16 w-16 min-w-[64px] rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                                <img src={design.image} alt={design.name} className="w-full h-full object-cover" />
                              </div>
                            ) : (
                              <div className="h-16 w-16 min-w-[64px] bg-gray-50 border border-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-400 shrink-0">
                                <span className="text-[10px] font-bold uppercase">No Img</span>
                              </div>
                            )}
                            
                            <div className="flex-1 min-w-0">
                               <p className="font-semibold text-gray-900 text-sm leading-tight truncate" title={design.name}>{design.name}</p>
                            </div>
                          </div>
                          
                          <div className="mt-3 flex gap-2 justify-end border-t border-gray-100 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEditDesign(index, design)} className="bg-gray-100 text-gray-700 text-[11px] px-3 py-1 rounded-md font-semibold hover:bg-gray-200 transition-colors">Edit</button>
                            <button onClick={() => handleDeleteDesign(index)} className="bg-red-50 text-red-600 border border-red-100 text-[11px] px-3 py-1 rounded-md font-semibold hover:bg-red-100 transition-colors">Delete</button>
                          </div>
                        </div>
                      ))}
                      {(!rooms[selectedRoomId]?.modules[selectedModuleId]?.designs || rooms[selectedRoomId].modules[selectedModuleId].designs.length === 0) && (
                        <p className="text-gray-400 text-sm text-center py-8 col-span-full">No designs added to this module.</p>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-400 text-sm text-center border border-dashed border-gray-300 rounded-xl p-4">
                    Select a module from Step 2
                  </div>
                )}
              </div>
            </div>
          )}

          {/* OBJECT TABS */}
          {activeTab !== "rooms" && (() => {
            const currentArray = activeTab === "coreMaterials" ? coreMaterials 
              : activeTab === "finishings" ? finishings 
              : activeTab === "services" ? services 
              : activeTab === "stylings" ? stylings
              : accessories;

            const hasImageUpload = activeTab === "services" || activeTab === "accessories" || activeTab === "stylings";
            const tabTitle = activeTab === "coreMaterials" ? "Materials" : activeTab === "stylings" ? "Stylings" : activeTab.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

            return (
              <div className="max-w-4xl mx-auto w-full">
                <h3 className="font-bold text-base text-gray-900 mb-5">
                  Manage {tabTitle}
                </h3>
                
                <div className="flex flex-col sm:flex-row gap-3 mb-8 bg-gray-50 p-4 border border-gray-200 rounded-xl items-end">
                  <div className="flex-1 w-full">
                    <label className="text-[11px] text-gray-500 font-bold mb-1.5 block uppercase tracking-widest">Name</label>
                    <input value={newObjName} onChange={(e) => setNewObjName(e.target.value)} placeholder={`e.g. ${tabTitle} Item`} className="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:ring-1 focus:ring-gray-900 bg-white text-sm" />
                  </div>
                  <div className="w-full sm:w-36 shrink-0">
                    <label className="text-[11px] text-gray-500 font-bold mb-1.5 block uppercase tracking-widest">{(activeTab === 'stylings' || activeTab === 'accessories') ? 'Rate (₹)' : 'Rate (₹/sqft)'}</label>
                    <input type="number" value={newObjPrice} onChange={(e) => setNewObjPrice(e.target.value)} placeholder="0" className="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:ring-1 focus:ring-gray-900 bg-white text-sm" />
                  </div>
                  
                  {hasImageUpload && (
                    <div className="flex-1 w-full">
                      <label className="text-[11px] text-gray-500 font-bold mb-1.5 block uppercase tracking-widest">
                        Upload Image {isUploading ? <span className="text-gray-700 animate-pulse">(Uploading...)</span> : newObjImage ? "(✅ Ready)" : ""}
                      </label>
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setNewObjImage)} className="w-full border border-gray-300 bg-white p-1.5 rounded-lg text-sm cursor-pointer" />
                    </div>
                  )}

                  <button disabled={isUploading} onClick={() => handleAddObjectItem(activeTab, currentArray)} className={`w-full sm:w-auto bg-gray-900 text-white px-6 py-2.5 font-semibold rounded-lg hover:bg-gray-800 transition-colors shadow-sm text-sm ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>Add</button>
                </div>

                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {(currentArray || []).filter(i => i !== null).map((item, index) => {
                    const isLegacyString = typeof item === 'string';
                    const itemName = isLegacyString ? item : item.name;
                    const itemPrice = isLegacyString ? 0 : item.price;
                    const itemImage = !isLegacyString && item.image ? item.image : null;

                    return (
                      <div key={index} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border border-gray-200 bg-white rounded-xl hover:border-gray-300 transition-colors gap-4">
                        
                        <div className="flex gap-4 items-center w-full sm:w-auto">
                          {hasImageUpload && (
                            <div className="h-14 w-14 rounded-xl bg-gray-50 overflow-hidden shrink-0 border border-gray-200 flex items-center justify-center">
                              {itemImage ? (
                                <img src={itemImage} alt={itemName} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-[9px] text-gray-400 font-bold uppercase">No Img</span>
                              )}
                            </div>
                          )}
                          <div>
                            <span className="font-semibold text-gray-900 text-base block">{itemName}</span>
                            {isLegacyString && <span className="text-[10px] text-orange-600 font-bold bg-orange-50 border border-orange-200 px-2 py-0.5 rounded inline-block mt-1">Legacy Format</span>}
                          </div>
                        </div>
                        
                        <div className="flex gap-4 items-center w-full sm:w-auto justify-between sm:justify-end">
                          <span className="font-mono text-gray-700 bg-gray-100 border border-gray-200 px-4 py-1.5 rounded-lg font-semibold text-sm">{(activeTab === 'stylings' || activeTab === 'accessories') ? `₹${itemPrice} flat` : `₹${itemPrice}/sqft`}</span>
                          <div className="flex gap-2">
                            <button onClick={() => handleEditObjectItem(activeTab, currentArray, index, item)} className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md font-semibold hover:bg-gray-200 transition-colors">Edit</button>
                            <button onClick={() => handleDeleteObjectItem(activeTab, currentArray, index)} className="text-xs bg-red-50 text-red-600 border border-red-100 px-3 py-1.5 rounded-md font-semibold hover:bg-red-100 transition-colors">Remove</button>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                  {(currentArray || []).length === 0 && (
                    <div className="text-center text-gray-400 py-10 border border-dashed border-gray-300 rounded-xl text-sm">No items found for {tabTitle}.</div>
                  )}
                </div>
              </div>
            );
          })()}

        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html:`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}}/>
    </Layout>
  );
}

export default Admin;
