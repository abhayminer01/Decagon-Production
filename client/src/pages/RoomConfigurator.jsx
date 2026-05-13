import { useState, useEffect } from "react";
import api from "../api";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import { useAdminData } from "../context/AdminDataContext";

function RoomConfigurator() {
  const navigate = useNavigate();
  const location = useLocation();
  const { roomType } = useParams();
  
  const projectId = location.state?.projectId;

  const { services, finishings, coreMaterials, accessories, stylings, rooms, loading } = useAdminData();

  // Navigation states
  const [activeSidebarTab, setActiveSidebarTab] = useState("modules"); // 'modules', 'services', 'finishers'
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  
  // Search states
  const [searchMod, setSearchMod] = useState("");
  const [searchSvc, setSearchSvc] = useState("");
  const [searchSty, setSearchSty] = useState("");

  // Selection states
  // Tiered pricing removed in favor of single price
  
  // Drafting items
  const [items, setItems] = useState([]);

  // Unique Identifier for this exact Room Instance
  const [roomId] = useState(location.state?.roomId || `room_${Date.now()}`);

  // Room Name Override (Mutable Label)
  const [roomName, setRoomName] = useState("");

  // Dimensions Modal State
  const [designToSize, setDesignToSize] = useState(null); // { type: 'module'|'service', data: obj }
  const [editingIndex, setEditingIndex] = useState(null);

  const [dimWidth, setDimWidth] = useState("");
  const [dimHeight, setDimHeight] = useState("");
  const [selectedCore, setSelectedCore] = useState("");
  const [selectedFinish, setSelectedFinish] = useState("");
  const [selectedAccessory, setSelectedAccessory] = useState("");

  useEffect(() => {
    if (!loading && rooms && rooms[roomType]) {
      const mods = Object.values(rooms[roomType].modules || {});
      if(mods.length > 0 && !selectedModuleId) {
        setSelectedModuleId(mods[0].id);
      }
    }
  }, [loading, rooms, roomType, selectedModuleId]);

  useEffect(() => {
    const fetchExistingItems = async () => {
      if (projectId && roomId) {
        try {
          const res = await api.get(`/projects/${projectId}`);
          const data = res.data;
          const roomData = data.rooms && data.rooms[roomId];
          if (roomData) {
            if (roomData.items) setItems(roomData.items);
            if (roomData.name) setRoomName(roomData.name);
          } else {
            if (rooms && rooms[roomType]) {
              setRoomName(rooms[roomType].title.replace(" Setup", ""));
            }
          }
        } catch (error) {
          console.error("Error fetching project room", error);
        }
      }
    };
    if (!loading) fetchExistingItems();
  }, [projectId, roomId, loading, rooms, roomType]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex flex-col font-sans text-gray-800">
        <Navbar />
        <div className="flex-1 flex justify-center items-center font-bold text-xl text-gray-500">Loading Configuration...</div>
      </div>
    );
  }

  const roomSchema = rooms && rooms[roomType] ? rooms[roomType] : { title: "Unknown Room", modules: {} };
  const modulesArray = Object.values(roomSchema.modules || {});

  // Search filtered arrays
  const filteredModules = modulesArray.filter(m => m.name.toLowerCase().includes(searchMod.toLowerCase()));
  const filteredServices = (services || []).filter(s => {
    const n = s.name || s;
    return typeof n === 'string' && n.toLowerCase().includes(searchSvc.toLowerCase());
  });
  const filteredStylings = (stylings || []).filter(s => {
    const n = s.name || s;
    return typeof n === 'string' && n.toLowerCase().includes(searchSty.toLowerCase());
  });

  const handleEditItem = (index) => {
    const item = items[index];
    if (!item.raw) {
      alert("This is a legacy item and cannot be edited structurally. Please remove and re-add it.");
      return;
    }
    setEditingIndex(index);
    setDesignToSize(item.raw.configItem);
    setDimWidth(item.raw.width || "");
    setDimHeight(item.raw.height || "");
    setSelectedCore(item.raw.selectedCore || "");
    setSelectedFinish(item.raw.selectedFinish || "");
    setSelectedAccessory(item.raw.selectedAccessory || "");
    setSelectedAccessory(item.raw.selectedAccessory || "");
  };

  const handleDimensionSubmit = () => {
    if (designToSize.type !== 'styling') {
      if (!dimWidth || !dimHeight) {
        alert("Please enter both width and height.");
        return;
      }
    }
    
    const width = Number(dimWidth);
    const height = Number(dimHeight);
    const area = width * height;
    
    let basePrice = 0;
    let coreText = "";
    let accText = "";
    let corePrice = 0;
    let accPrice = 0;
    let coreRate = 0;

    if (designToSize.type === 'module') {
      const coreObj = (coreMaterials || []).find(c => (c.name || c) === selectedCore);
      const accObj = (accessories || []).find(a => (a.name || a) === selectedAccessory);

      coreRate = coreObj && typeof coreObj === 'object' ? coreObj.price : 0;
      const accFlatPrice = accObj && typeof accObj === 'object' ? accObj.price : 0;

      // Price = width * height * material price
      corePrice = area * coreRate;
      accPrice = accFlatPrice;
      basePrice = corePrice;

      coreText = selectedCore ? `Material: ${selectedCore}` : "No material selected";
      accText = selectedAccessory ? ` | Acc: ${selectedAccessory}` : "";

    } else if (designToSize.type === 'service') {
      const serviceRate = designToSize.data.price || 0;
      basePrice = area * serviceRate;
      coreText = `@ ₹${serviceRate}/sqft`;
    } else if (designToSize.type === 'styling') {
      basePrice = designToSize.data.price || 0;
      coreText = `Flat Rate`;
    }

    const finalPrice = basePrice + accPrice;

    const rawData = { width, height, selectedCore, selectedAccessory, configItem: designToSize };

    const newItem = {
      category: designToSize.type === 'module' ? ("Module - " + roomSchema.modules[selectedModuleId].name) : designToSize.type === 'styling' ? "Styling" : "Service",
      name: designToSize.data.name,
      details: designToSize.type === 'styling' ? "Flat Add-on" : `${width}W x ${height}H ft (${area} sqft) | ${coreText}${accText}`,
      tier: "-",
      price: finalPrice,
      raw: rawData
    };

    if (editingIndex !== null) {
      const updated = [...items];
      updated[editingIndex] = newItem;
      setItems(updated);
    } else {
      setItems([...items, newItem]);
    }

    setDesignToSize(null);
    setEditingIndex(null);
    setDimWidth("");
    setDimHeight("");
    setSelectedCore("");
    setSelectedFinish("");
    setSelectedAccessory("");
  };

  const addFinishing = (finishingName) => {
    const newItem = {
      category: "Finishing Scope",
      name: finishingName,
      details: "Global Scope Selection",
      tier: "-",
      price: 0,
      raw: null
    };
    setItems([...items, newItem]);
  };

  const deleteItem = (index) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
  };

  const total = items.reduce((sum, item) => sum + item.price, 0);

  async function saveProject() {
    if (!projectId) {
      alert("Error: No Project ID tracked. Please start from the beginning.");
      return;
    }
    if (!roomName) {
      alert("Please enter a label for this room (e.g., Master Bedroom)");
      return;
    }
    if (items.length === 0) {
      alert("Add items first");
      return;
    }

    try {
      const res = await api.get(`/projects/${projectId}`);
      const projData = res.data;
      
      const currentProjectTotal = projData?.total || 0;
      const previousRoomTotal = projData?.rooms?.[roomId]?.total || 0;
      
      const newProjectTotal = currentProjectTotal - previousRoomTotal + total;

      const updatedRooms = { ...projData.rooms };
      updatedRooms[roomId] = {
        id: roomId,
        name: roomName,
        type: roomType,
        items: items,
        total: total,
        updatedAt: Date.now()
      };

      await api.put(`/projects/${projectId}`, {
        rooms: updatedRooms,
        total: newProjectTotal > 0 ? newProjectTotal : 0
      });
      
      alert(`${roomName} components have been saved successfully!`);
      navigate(`/project/${projectId}`);
      
    } catch (error) {
      console.error(error);
      alert("Error saving room.");
    }
  }

  // Dimension Modal Pre-calculations
  const curArea = Number(dimWidth) * Number(dimHeight);
  let previewRate = 0;
  if (designToSize?.type === 'module') {
    // Rate comes from the selected material
    const previewCoreObj = (coreMaterials || []).find(c => (c.name || c) === selectedCore);
    previewRate = previewCoreObj && typeof previewCoreObj === 'object' ? previewCoreObj.price : 0;
  } else if (designToSize?.type === 'service') {
    previewRate = designToSize.data.price || 0;
  }
  const previewBasePrice = designToSize?.type === 'styling' ? (designToSize.data.price || 0) : (curArea * previewRate);
  // Accessory flat price for preview
  const previewAccObj = (accessories || []).find(a => (a.name || a) === selectedAccessory);
  const previewAccPrice = previewAccObj && typeof previewAccObj === 'object' ? previewAccObj.price : 0;
  const previewTotalPrice = previewBasePrice + previewAccPrice;

  return (
    <Layout>
      <div className="flex flex-col lg:flex-row gap-6 max-w-[1400px] mx-auto w-full">
        
        {/* SIDEBAR NAVIGATION */}
        <div className="bg-white border border-gray-200 p-6 w-full lg:w-80 rounded-xl flex flex-col h-auto lg:h-[700px] shadow-sm">
          <h3 className="mb-4 font-bold text-xl text-gray-900 border-b border-gray-100 pb-4">{roomSchema.title}</h3>

          <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg shrink-0">
            <button 
               onClick={() => setActiveSidebarTab("modules")} 
               className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${activeSidebarTab === "modules" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >Modules</button>
            <button 
               onClick={() => setActiveSidebarTab("services")} 
               className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${activeSidebarTab === "services" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >Services</button>
            <button 
               onClick={() => setActiveSidebarTab("stylings")} 
               className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${activeSidebarTab === "stylings" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >Stylings</button>
          </div>

          {/* MODULES LIST */}
          {activeSidebarTab === "modules" && (
            <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2 flex flex-col">
              <input type="text" placeholder="Search modules..." value={searchMod} onChange={(e) => setSearchMod(e.target.value)} className="w-full border border-gray-200 p-2.5 mb-3 rounded-lg outline-none text-sm bg-gray-50 focus:bg-white focus:border-gray-400 transition-colors shadow-sm" />
              <div className="flex-1 overflow-y-auto space-y-1">
                {filteredModules.map(mod => (
                  <div 
                    key={mod.id} 
                    onClick={() => setSelectedModuleId(mod.id)} 
                    className={`p-3 rounded-lg cursor-pointer text-sm transition-colors border ${selectedModuleId === mod.id ? "bg-gray-900 border-gray-900 text-white" : "bg-white border-transparent text-gray-700 hover:bg-gray-50"}`}
                  >
                    <div className="font-semibold">{mod.name}</div>
                    <div className={`text-[10px] mt-0.5 ${selectedModuleId === mod.id ? "text-gray-300" : "text-gray-400"} ${(mod.designs || []).length === 0 ? "text-red-400" : ""}`}>
                      {(mod.designs || []).length} Options
                    </div>
                  </div>
                ))}
                {filteredModules.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No modules found.</p>}
              </div>
            </div>
          )}

          {/* SERVICES LIST */}
          {activeSidebarTab === "services" && (
             <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2 flex flex-col">
               <input type="text" placeholder="Search services..." value={searchSvc} onChange={(e) => setSearchSvc(e.target.value)} className="w-full border border-gray-200 p-2.5 mb-3 rounded-lg outline-none text-sm bg-gray-50 focus:bg-white focus:border-gray-400 transition-colors shadow-sm" />
               <div className="flex-1 overflow-y-auto space-y-1">
                 {filteredServices.map((item, i) => {
                   const sName = item.name || item;
                   return (
                     <div key={i} onClick={() => setDesignToSize({ type: 'service', data: item })} className={`p-3 rounded-lg cursor-pointer text-sm font-semibold transition-colors border bg-white border-transparent text-gray-700 hover:bg-gray-50 flex justify-between items-center group`}>
                       <span>{sName}</span>
                       <span className="text-gray-900 bg-white border border-gray-200 shadow-sm p-1 px-2 rounded-md font-bold opacity-0 group-hover:opacity-100 transition-opacity text-[10px]">Add Size</span>
                     </div>
                   )
                 })}
                 {filteredServices.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No services found.</p>}
               </div>
             </div>
          )}

          {/* STYLINGS LIST */}
          {activeSidebarTab === "stylings" && (
             <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2 flex flex-col">
               <input type="text" placeholder="Search stylings..." value={searchSty} onChange={(e) => setSearchSty(e.target.value)} className="w-full border border-gray-200 p-2.5 mb-3 rounded-lg outline-none text-sm bg-gray-50 focus:bg-white focus:border-gray-400 transition-colors shadow-sm" />
               <div className="flex-1 overflow-y-auto space-y-1">
                 {filteredStylings.map((item, i) => {
                   const sName = item.name || item;
                   return (
                     <div key={i} onClick={() => setDesignToSize({ type: 'styling', data: item })} className="p-3 rounded-lg cursor-pointer text-sm font-semibold transition-colors border bg-white border-transparent text-gray-700 hover:bg-gray-50 flex items-center gap-3 group">
                       {item.image ? (
                         <div className="h-10 w-10 rounded-lg overflow-hidden border border-gray-200 shrink-0 shadow-sm">
                           <img src={item.image} alt={sName} className="w-full h-full object-cover" />
                         </div>
                       ) : (
                         <div className="h-10 w-10 rounded-lg bg-gray-100 border border-gray-200 shrink-0 flex items-center justify-center">
                           <span className="text-[8px] text-gray-400 font-bold">IMG</span>
                         </div>
                       )}
                       <span className="flex-1">{sName}</span>
                       <span className="text-gray-900 bg-white border border-gray-200 shadow-sm p-1 px-2 rounded-md font-bold opacity-0 group-hover:opacity-100 transition-opacity text-[10px]">Add Size</span>
                     </div>
                   );
                 })}
                 {filteredStylings.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No stylings found.</p>}
               </div>
             </div>
          )}
        </div>

        {/* BUILDER VIEW PANEL */}
        <div className="bg-white border border-gray-200 p-6 md:p-8 flex-1 rounded-xl h-auto lg:h-[700px] flex flex-col shadow-sm">
          
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
            <div>
               <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Room Label</p>
               <input
                 className="bg-gray-50 border border-gray-200 p-2 min-w-[200px] sm:min-w-[300px] rounded-lg focus:ring-1 focus:ring-gray-900 focus:bg-white outline-none font-semibold text-gray-900 transition-colors"
                 value={roomName}
                 onChange={(e) => setRoomName(e.target.value)}
               />
            </div>
            
            <div className="text-right">
               <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Current Draft Total</p>
               <p className="text-2xl font-bold text-gray-900">₹{total.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            
            {activeSidebarTab === "modules" && selectedModuleId && roomSchema.modules[selectedModuleId] && (
              <div className="animate-fade-in block h-full flex flex-col">
                <h3 className="mb-4 font-bold text-xl text-gray-900">{roomSchema.modules[selectedModuleId].name}</h3>
                
                <div className="grid grid-cols-2 xl:grid-cols-3 gap-5 flex-1 content-start">
                  {(roomSchema.modules[selectedModuleId].designs || []).filter(Boolean).map((design) => {
                    return (
                      <div key={design.id} onClick={() => setDesignToSize({ type: 'module', data: design })} className="border border-gray-200 p-3 text-center cursor-pointer rounded-xl hover:border-gray-900 transition-colors group flex flex-col bg-white">
                        {design.image ? (
                          <div className="h-32 w-full rounded-lg mb-3 bg-gray-50 overflow-hidden border border-gray-100">
                            <img src={design.image} alt={design.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          </div>
                        ) : (
                          <div className="h-32 w-full bg-gray-50 mb-3 rounded-lg flex items-center justify-center border border-gray-100">
                            <span className="text-[10px] font-bold text-gray-400 uppercase">No Image</span>
                          </div>
                        )}
                        <p className="font-semibold text-gray-900 text-sm leading-tight flex items-center justify-center">{design.name}</p>
                      </div>
                    );
                  })}
                  {(roomSchema.modules[selectedModuleId].designs || []).length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-16 border border-dashed border-gray-300 rounded-xl bg-gray-50">
                      <p className="text-gray-500 font-semibold text-sm mb-1">No Designs Configured</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeSidebarTab === "services" && (
              <div className="h-full flex items-center justify-center text-gray-400 font-medium border-2 border-dashed border-gray-100 rounded-xl px-10 text-center">
                Select a service from the left sidebar to add its dimensions and push it to the draft.
              </div>
            )}

            {activeSidebarTab === "stylings" && (
              <div className="h-full flex items-center justify-center text-gray-400 font-medium border-2 border-dashed border-gray-100 rounded-xl px-10 text-center">
                Select a styling from the left sidebar to add its dimensions and push it to the draft.
              </div>
            )}

          </div>
        </div>
      </div>

      {/* GENERIC DIMENSIONAL INPUT MODAL */}
      {designToSize && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl animate-fade-in border border-gray-200 w-full max-w-4xl flex overflow-hidden" style={{maxHeight: '90vh'}}>

            {/* LEFT: FORM */}
            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar flex flex-col">
              <h3 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">
                {designToSize.data.name}
                {editingIndex !== null && <span className="ml-2 text-[10px] bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded align-middle tracking-wider">EDITING</span>}
              </h3>

              {designToSize.type !== 'styling' && (
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Width / Length (ft)</label>
                    <input type="number" className="border border-gray-300 p-2.5 rounded-lg w-full text-center outline-none focus:ring-1 focus:ring-gray-900 font-semibold text-gray-900 transition-colors shadow-sm" placeholder="0" value={dimWidth} onChange={(e) => setDimWidth(e.target.value)} />
                  </div>
                  <div className="flex items-center justify-center pt-6 text-gray-300 font-bold">×</div>
                  <div className="flex-1">
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Height (ft)</label>
                    <input type="number" className="border border-gray-300 p-2.5 rounded-lg w-full text-center outline-none focus:ring-1 focus:ring-gray-900 font-semibold text-gray-900 transition-colors shadow-sm" placeholder="0" value={dimHeight} onChange={(e) => setDimHeight(e.target.value)} />
                  </div>
                </div>
              )}

              {/* EXTRAS ONLY FOR MODULES */}
              {designToSize.type === 'module' && (
                <div className="grid grid-cols-1 gap-4 mb-6">
                  {(coreMaterials && coreMaterials.length > 0) && (
                    <div>
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block mb-1.5">Materials (Opt.)</label>
                      <select
                        className="border border-gray-300 p-2.5 rounded-lg w-full outline-none focus:ring-1 focus:ring-gray-900 bg-white font-medium text-gray-900 text-sm shadow-sm transition-colors"
                        value={selectedCore}
                        onChange={(e) => setSelectedCore(e.target.value)}
                      >
                        <option value="">-- Original / None --</option>
                        {coreMaterials.map((c, idx) => {
                          const cName = typeof c === 'string' ? c : c.name;
                          return <option key={idx} value={cName}>{cName}</option>;
                        })}
                      </select>
                    </div>
                  )}
                  {(accessories && accessories.length > 0) && (
                    <div>
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block mb-1.5">Accessories (Opt.)</label>
                      <select
                        className="border border-gray-300 p-2.5 rounded-lg w-full outline-none focus:ring-1 focus:ring-gray-900 bg-white font-medium text-gray-900 text-sm shadow-sm transition-colors"
                        value={selectedAccessory}
                        onChange={(e) => setSelectedAccessory(e.target.value)}
                      >
                        <option value="">-- No Add-on Accessories --</option>
                        {accessories.map((acc, idx) => (
                          <option key={idx} value={acc.name}>{acc.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* PRICE PREVIEW */}
              <div className="mt-auto">
                {((dimWidth && dimHeight) || designToSize.type === 'styling') ? (
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-4">
                    {designToSize.type !== 'styling' && (
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest">Area</p>
                        <p className="text-sm text-gray-900 font-semibold">{curArea} sqft</p>
                      </div>
                    )}
                    {previewAccPrice > 0 && (
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest">Accessory (flat)</p>
                        <p className="text-sm text-gray-900 font-semibold">+₹{previewAccPrice.toLocaleString()}</p>
                      </div>
                    )}
                    <div className="border-t border-gray-200 mt-3 pt-3 text-center">
                      <p className="text-2xl font-bold text-gray-900">₹{previewTotalPrice.toLocaleString()}</p>
                      {designToSize.type === 'module' && !selectedCore && (
                        <p className="text-xs text-orange-500 font-medium mt-1">Choose a material to calculate price</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-[60px] bg-gray-50 border border-gray-200 border-dashed rounded-xl mb-4 flex items-center justify-center text-sm text-gray-400 font-medium">
                    Enter dimensions to preview price
                  </div>
                )}
                <div className="flex gap-3">
                  <button onClick={() => { setDesignToSize(null); setEditingIndex(null); setSelectedCore(""); setSelectedFinish(""); setSelectedAccessory(""); }} className="flex-1 bg-white border border-gray-300 text-gray-700 font-semibold py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-sm">Cancel</button>
                  <button onClick={handleDimensionSubmit} className="flex-1 bg-gray-900 text-white font-semibold py-2.5 rounded-lg hover:bg-gray-800 transition-colors shadow-sm text-sm">
                    {editingIndex !== null ? 'Save Changes' : designToSize.type === 'styling' ? 'Add Accessory' : 'Add to Draft'}
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT: IMAGE PANEL — full height */}
            <div className="w-1/2 shrink-0 relative hidden sm:block bg-gray-50 border-l border-gray-200">
              {designToSize.data.image ? (
                <img src={designToSize.data.image} alt={designToSize.data.name} className="absolute inset-0 w-full h-full object-contain p-8" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <p className="text-[10px] font-bold uppercase tracking-widest">No Image</p>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-5">
                <p className="text-white font-black text-xl leading-tight">{designToSize.data.name}</p>
                <p className="text-white/60 text-xs mt-0.5 uppercase tracking-wide">{designToSize.type === 'module' ? 'Module Design' : designToSize.type === 'styling' ? 'Styling' : 'Service'}</p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* DRAFT COMPONENTS TABLE */}
      {items.length > 0 && (
        <div className="px-10 mt-10 max-w-[1400px] mx-auto pb-20 animate-fade-in">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <h3 className="bg-white border-b border-gray-200 px-8 py-5 font-bold text-lg text-gray-900 flex justify-between items-center">
              <span>Final Draft Components</span>
              <span className="text-gray-500 text-xs font-semibold bg-gray-100 px-3 py-1 rounded-md">{items.length} Items</span>
            </h3>
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs uppercase text-gray-500 border-b border-gray-100 bg-gray-50/50">
                    <th className="px-4 py-4 w-16">Image</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Item Name</th>
                    <th className="px-6 py-4">Specs / Dimensions</th>
                    <th className="px-6 py-4 text-right">Value (₹)</th>
                    <th className="px-6 py-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm font-medium text-gray-700 bg-white">
                  {items.map((item, i) => {
                    const itemImage = item.raw?.configItem?.data?.image || null;
                    return (
                    <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                      {/* THUMBNAIL */}
                      <td className="px-4 py-3">
                        {itemImage ? (
                          <div className="h-12 w-12 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                            <img src={itemImage} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="h-12 w-12 rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-center">
                            <span className="text-[9px] text-gray-300 font-bold uppercase text-center leading-tight">No{"\n"}Img</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs tracking-wider uppercase font-semibold min-w-[120px]">{item.category}</td>
                      <td className="px-6 py-4 text-gray-900 font-semibold min-w-[150px]">{item.name}</td>
                      <td className="px-6 py-4 font-mono text-[11px] text-gray-500 bg-gray-50 rounded break-words max-w-[300px]">
                         {item.details}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap text-base font-bold text-gray-900">₹{item.price.toLocaleString()}</td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <div className="flex gap-2 justify-center">
                          {item.raw && (
                             <button onClick={() => handleEditItem(i)} className="text-gray-600 hover:text-gray-900 hover:bg-gray-200 border border-gray-200 bg-gray-50 px-3 py-1.5 rounded-lg text-[10px] font-bold transition uppercase tracking-wider">Edit</button>
                          )}
                          <button onClick={() => deleteItem(i)} className="text-red-500 hover:text-red-700 hover:bg-red-100 border border-red-200 bg-red-50 px-3 py-1.5 rounded-lg text-[10px] font-bold transition uppercase tracking-wider">Remove</button>
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center mt-8 px-2 gap-6 sm:gap-2">
            <button onClick={() => navigate("/rooms", { state: { projectId } })} className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold px-6 py-3 rounded-lg transition-colors w-full sm:w-auto shadow-sm">
              Cancel & Return
            </button>
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 w-full sm:w-auto">
              <div className="text-center sm:text-right">
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total Value</p>
                <h2 className="text-3xl font-bold text-gray-900">₹{total.toLocaleString()}</h2>
              </div>
              <button onClick={saveProject} className="bg-gray-900 text-white font-semibold px-8 py-4 rounded-lg shadow-sm hover:bg-gray-800 transition-colors w-full sm:w-auto">
                Save Draft
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global generic CSS injections */}
      <style dangerouslySetInnerHTML={{__html:`
        .animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(15px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}}/>
    </Layout>
  );
}

export default RoomConfigurator;
