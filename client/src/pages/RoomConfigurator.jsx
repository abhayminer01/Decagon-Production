import { useState, useEffect } from "react";
import api from "../api";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAdminData } from "../context/AdminDataContext";

function RoomConfigurator() {
  const navigate = useNavigate();
  const location = useLocation();
  const { roomType } = useParams();
  
  const projectId = location.state?.projectId;

  const { services, finishings, coreMaterials, accessories, rooms, loading } = useAdminData();

  // Navigation states
  const [activeSidebarTab, setActiveSidebarTab] = useState("modules"); // 'modules', 'services', 'finishers'
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  
  // Search states
  const [searchMod, setSearchMod] = useState("");
  const [searchSvc, setSearchSvc] = useState("");
  const [searchFin, setSearchFin] = useState("");

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
  const filteredFinishings = (finishings || []).filter(f => {
    const n = f.name || f;
    return typeof n === 'string' && n.toLowerCase().includes(searchFin.toLowerCase());
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
    if (!dimWidth || !dimHeight) {
      alert("Please enter both width and height.");
      return;
    }
    
    const width = Number(dimWidth);
    const height = Number(dimHeight);
    const area = width * height;
    
    let rate = 0;
    let tierLabel = "-";
    let basePrice = 0;
    let coreText = "";
    let finishText = "";
    let accText = "";
    let corePrice = 0;
    let finPrice = 0;
    let accPrice = 0;
    
    if (designToSize.type === 'module') {
      rate = designToSize.data.price || designToSize.data.standardRate || 0;
      
      basePrice = area * rate;

      const coreObj = (coreMaterials || []).find(c => (c.name || c) === selectedCore);
      const accObj = (accessories || []).find(a => (a.name || a) === selectedAccessory);

      const coreRate = coreObj && typeof coreObj === 'object' ? coreObj.price : 0;
      const accFlatPrice = accObj && typeof accObj === 'object' ? accObj.price : 0;

      corePrice = area * coreRate;
      accPrice = accFlatPrice; // FLAT PRICE as requested

      coreText = selectedCore ? ` | Core: ${selectedCore} (+₹${corePrice.toLocaleString()})` : "";
      accText = selectedAccessory ? ` | Acc: ${selectedAccessory} (+₹${accPrice.toLocaleString()} flat)` : "";

    } else if (designToSize.type === 'service') {
      rate = designToSize.data.price;
      basePrice = area * rate;
    }

    const finalPrice = basePrice + corePrice + accPrice;

    const rawData = { width, height, selectedCore, selectedAccessory, configItem: designToSize };

    const newItem = {
      category: designToSize.type === 'module' ? ("Module - " + roomSchema.modules[selectedModuleId].name) : "Service",
      name: designToSize.data.name,
      details: `${width}W x ${height}H ft (${area} sqft @ ₹${rate}/sqft base)${coreText}${accText}`,
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
  if(designToSize?.type === 'module') {
     previewRate = designToSize.data.price || designToSize.data.standardRate || 0;
  } else if (designToSize?.type === 'service') {
     previewRate = designToSize.data.price;
  }
  const previewBasePrice = curArea * previewRate;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 font-sans text-gray-800 relative">
      <Navbar />

      <div className="flex flex-col lg:flex-row gap-6 px-4 md:px-10 mt-8 max-w-[1400px] mx-auto">
        
        {/* SIDEBAR NAVIGATION */}
        <div className="bg-white shadow-sm border border-gray-100 p-6 w-full lg:w-80 rounded-xl flex flex-col h-auto lg:h-[700px]">
          <h3 className="mb-4 font-black text-xl text-gray-900 border-b pb-4 leading-tight">{roomSchema.title}</h3>

          <div className="flex gap-2 mb-6 bg-gray-100 p-1.5 rounded-lg shrink-0">
            <button 
               onClick={() => setActiveSidebarTab("modules")} 
               className={`flex-1 py-1.5 text-xs font-bold rounded shadow-sm transition ${activeSidebarTab === "modules" ? "bg-white text-blue-600" : "text-gray-500 hover:text-gray-800"}`}
            >Modules</button>
            <button 
               onClick={() => setActiveSidebarTab("services")} 
               className={`flex-1 py-1.5 text-xs font-bold rounded shadow-sm transition ${activeSidebarTab === "services" ? "bg-white text-blue-600" : "text-gray-500 hover:text-gray-800"}`}
            >Services</button>
            <button 
               onClick={() => setActiveSidebarTab("finishers")} 
               className={`flex-1 py-1.5 text-xs font-bold rounded shadow-sm transition ${activeSidebarTab === "finishers" ? "bg-white text-blue-600" : "text-gray-500 hover:text-gray-800"}`}
            >Finishers</button>
          </div>

          {/* MODULES LIST */}
          {activeSidebarTab === "modules" && (
            <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2 flex flex-col">
              <input type="text" placeholder="Search modules..." value={searchMod} onChange={(e) => setSearchMod(e.target.value)} className="w-full border p-2 mb-2 rounded outline-none text-sm bg-gray-50 focus:bg-white focus:border-blue-500 transition" />
              <div className="flex-1 overflow-y-auto space-y-2">
                {filteredModules.map(mod => (
                  <div 
                    key={mod.id} 
                    onClick={() => setSelectedModuleId(mod.id)} 
                    className={`p-3 rounded-xl cursor-pointer font-bold text-sm transition-all border ${selectedModuleId === mod.id ? "bg-blue-600 border-blue-600 text-white shadow-md transform scale-[1.02]" : "bg-gray-50 border-gray-100 text-gray-600 hover:border-gray-300 hover:bg-white"}`}
                  >
                    {mod.name}
                    <p className={`text-[10px] mt-1 font-normal opacity-80 ${(mod.designs || []).length === 0 ? "text-red-300" : ""}`}>
                      {(mod.designs || []).length} Design Options
                    </p>
                  </div>
                ))}
                {filteredModules.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No modules found.</p>}
              </div>
            </div>
          )}

          {/* SERVICES LIST */}
          {activeSidebarTab === "services" && (
             <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2 flex flex-col">
               <input type="text" placeholder="Search services..." value={searchSvc} onChange={(e) => setSearchSvc(e.target.value)} className="w-full border p-2 mb-2 rounded outline-none text-sm bg-gray-50 focus:bg-white focus:border-blue-500 transition" />
               <div className="flex-1 overflow-y-auto space-y-2">
                 {filteredServices.map((item, i) => {
                   const sName = item.name || item;
                   return (
                     <div key={i} onClick={() => setDesignToSize({ type: 'service', data: item })} className={`p-3 rounded-lg cursor-pointer text-sm font-semibold transition border bg-gray-50 border-gray-100 text-gray-600 hover:bg-blue-50 hover:border-blue-200 flex justify-between items-center group`}>
                       <span>{sName}</span>
                       <span className="text-blue-500 bg-white shadow-sm p-1 rounded font-bold opacity-0 group-hover:opacity-100 transition-opacity text-[10px]">Add Size</span>
                     </div>
                   )
                 })}
                 {filteredServices.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No services found.</p>}
               </div>
             </div>
          )}

          {/* FINISHERS LIST */}
          {activeSidebarTab === "finishers" && (
             <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2 flex flex-col">
               <input type="text" placeholder="Search finishers..." value={searchFin} onChange={(e) => setSearchFin(e.target.value)} className="w-full border p-2 mb-2 rounded outline-none text-sm bg-gray-50 focus:bg-white focus:border-blue-500 transition" />
               <div className="flex-1 overflow-y-auto space-y-2">
                 {filteredFinishings.map((item, i) => {
                   const fName = item.name || item;
                   return (
                     <div key={i} onClick={() => addFinishing(fName)} className="p-3 rounded-lg cursor-pointer text-sm font-semibold transition border bg-white border-gray-100 text-gray-600 hover:bg-gray-50 flex justify-between">
                       {fName}
                       <span className="text-blue-500 font-bold">+</span>
                     </div>
                   )
                 })}
                 {filteredFinishings.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No finishers found.</p>}
               </div>
             </div>
          )}
        </div>

        {/* BUILDER VIEW PANEL */}
        <div className="bg-white shadow-sm border border-gray-100 p-6 md:p-8 flex-1 rounded-xl h-auto lg:h-[700px] flex flex-col">
          
          <div className="flex justify-between items-center mb-6 pb-4 border-b">
            <div>
               <p className="text-xs font-bold text-gray-400 uppercase mb-1">Room Custom Label</p>
               <input
                 className="border border-gray-300 p-2 min-w-[200px] sm:min-w-[300px] rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-800"
                 value={roomName}
                 onChange={(e) => setRoomName(e.target.value)}
               />
            </div>
            
            <div className="text-right">
               <p className="text-xs font-bold text-gray-400 uppercase mb-1">Current Draft Total</p>
               <p className="text-2xl font-black text-blue-600">₹{total.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            
            {activeSidebarTab === "modules" && selectedModuleId && roomSchema.modules[selectedModuleId] && (
              <div className="animate-fade-in block h-full flex flex-col">
                <h3 className="mb-4 font-black text-2xl text-gray-900">{roomSchema.modules[selectedModuleId].name}</h3>
                
                {/* Tier selection removed */}

                <div className="grid grid-cols-2 xl:grid-cols-3 gap-6 flex-1 content-start">
                  {(roomSchema.modules[selectedModuleId].designs || []).filter(Boolean).map((design) => {
                     let rateToShow = design.price || design.standardRate || 0;

                     return (
                        <div key={design.id} onClick={() => setDesignToSize({ type: 'module', data: design })} className="border border-gray-200 p-4 text-center cursor-pointer rounded-xl hover:shadow-xl hover:-translate-y-1 hover:border-blue-400 transition-all group flex flex-col bg-white">
                          {design.image ? (
                            <div className="h-32 w-full rounded-lg mb-4 bg-gray-100 overflow-hidden">
                              <img src={design.image} alt={design.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            </div>
                          ) : (
                            <div className="h-32 w-full bg-gray-50 mb-4 rounded-lg flex items-center justify-center border border-gray-100">
                              <span className="text-xs font-bold text-gray-300 uppercase">No Image</span>
                            </div>
                          )}
                          <p className="font-bold text-gray-800 text-[15px] leading-tight mb-2 h-10 flex items-center justify-center">{design.name}</p>
                          <div className="mt-auto bg-gray-50 py-2 rounded border border-gray-100 group-hover:bg-blue-50 transition-colors">
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-0.5">Rate</p>
                            <p className="text-blue-600 font-black">₹{rateToShow}<span className="text-xs font-normal text-gray-500"> /sqft</span></p>
                          </div>
                        </div>
                     )
                  })}
                  {(roomSchema.modules[selectedModuleId].designs || []).length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-16 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                      <p className="text-gray-400 font-bold text-lg mb-1">No Designs Configured</p>
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

            {activeSidebarTab === "finishers" && (
              <div className="h-full flex items-center justify-center text-gray-400 font-medium border-2 border-dashed border-gray-100 rounded-xl px-10 text-center">
                Click finishers on the left sidebar to inject them as global scope remarks into the draft cart.
              </div>
            )}

          </div>
        </div>
      </div>

      {/* GENERIC DIMENSIONAL INPUT MODAL */}
      {designToSize && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full animate-fade-in border border-gray-100 max-h-[90vh] overflow-y-auto custom-scrollbar">
            
            {/* Conditional Image Rendering */}
            {designToSize.data.image ? (
               <div className="w-full h-32 rounded-xl mb-4 overflow-hidden border border-gray-200 shadow-inner">
                  <img src={designToSize.data.image} alt={designToSize.data.name} className="w-full h-full object-cover" />
               </div>
            ) : null}

            <h3 className="text-2xl font-black text-gray-900 mb-2 leading-tight">
               {designToSize.data.name} 
               {editingIndex !== null && <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded align-middle">EDITING</span>}
            </h3>
            
            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-200 mb-6">
              {designToSize.type === 'module' ? (
                 <span className="text-xs font-bold text-gray-500 uppercase">Pricing Rate (Fixed)</span>
              ) : (
                 <span className="text-xs font-bold text-gray-500 uppercase">Service Scope (Fixed Rate)</span>
              )}
              <span className="text-sm font-black text-blue-600">
                 ₹{previewRate} / sqft
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 text-center">
                <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Width / Length (ft)</label>
                <input type="number" className="border border-gray-300 p-3 rounded-xl w-full text-center outline-none focus:ring-2 focus:ring-blue-500 font-bold text-lg" placeholder="0" value={dimWidth} onChange={(e) => setDimWidth(e.target.value)} />
              </div>
              <div className="flex items-center justify-center pt-6 text-gray-400 font-bold">×</div>
              <div className="flex-1 text-center">
                <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Height (ft)</label>
                <input type="number" className="border border-gray-300 p-3 rounded-xl w-full text-center outline-none focus:ring-2 focus:ring-blue-500 font-bold text-lg" placeholder="0" value={dimHeight} onChange={(e) => setDimHeight(e.target.value)} />
              </div>
            </div>

            {/* SHOW EXTRAS ONLY FOR MODULES */}
            {designToSize.type === 'module' && (
              <div className="grid grid-cols-1 gap-3 mb-6">
                {(coreMaterials && coreMaterials.length > 0) && (
                  <div>
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1.5">Materials (Opt.)</label>
                    <select 
                      className="border border-gray-300 p-2.5 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium text-gray-700 text-sm"
                      value={selectedCore}
                      onChange={(e) => setSelectedCore(e.target.value)}
                    >
                      <option value="">-- Original / None --</option>
                      {coreMaterials.map((c, idx) => {
                        const cName = typeof c === 'string' ? c : c.name;
                        const cPrice = typeof c === 'string' ? 0 : c.price;
                        return <option key={idx} value={cName}>{cName} (+₹{cPrice}/sq)</option>;
                      })}
                    </select>
                  </div>
                )}
                {/* Ext. Finish Removed as requested */}
                {(accessories && accessories.length > 0) && (
                  <div>
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1.5">Accessories (Opt.)</label>
                    <select 
                      className="border border-gray-300 p-2.5 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium text-gray-700 text-sm"
                      value={selectedAccessory}
                      onChange={(e) => setSelectedAccessory(e.target.value)}
                    >
                      <option value="">-- No Add-on Accessories --</option>
                      {accessories.map((acc, idx) => {
                        const aName = acc.name;
                        const aPrice = acc.price;
                        return <option key={idx} value={aName}>{aName} (+₹{aPrice} flat)</option>;
                      })}
                    </select>
                  </div>
                )}
              </div>
            )}

            {(dimWidth && dimHeight) ? (
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6 text-center">
                <p className="text-sm text-blue-800 font-bold mb-1">Calculated Area: {curArea} sqft</p>
                <p className="text-2xl font-black text-blue-600">
                  ₹{previewBasePrice.toLocaleString()} {designToSize.type === 'module' && <span className="text-sm font-medium">+ Extras</span>}
                </p>
              </div>
            ) : (
              <div className="h-[70px] bg-gray-50 border border-gray-100 rounded-xl mb-6 flex items-center justify-center text-sm text-gray-400 font-medium">
                Enter dimensions to preview price
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => { setDesignToSize(null); setEditingIndex(null); setSelectedCore(""); setSelectedFinish(""); setSelectedAccessory(""); }} className="flex-1 bg-white border border-gray-300 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-50 transition text-sm">Cancel</button>
              <button onClick={handleDimensionSubmit} className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition shadow-md shadow-blue-600/20 text-sm">
                 {editingIndex !== null ? 'Save Changes' : 'Add to Draft'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DRAFT COMPONENTS TABLE */}
      {items.length > 0 && (
        <div className="px-10 mt-10 max-w-[1400px] mx-auto pb-20 animate-fade-in">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <h3 className="bg-gray-900 px-6 py-4 font-black text-lg text-white flex justify-between items-center">
              <span>Final Draft Components</span>
              <span className="text-blue-400 text-sm font-bold bg-white/10 px-3 py-1 rounded">{items.length} Items</span>
            </h3>
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs uppercase text-gray-500 border-b border-gray-100 bg-gray-50/50">
                    <th className="px-4 py-4 w-16">Image</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Item Name</th>
                    <th className="px-6 py-4">Specs / Dimensions</th>
                    <th className="px-6 py-4">Build Tier</th>
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
                      <td className="px-6 py-4 text-gray-500 min-w-[120px]">{item.category}</td>
                      <td className="px-6 py-4 text-gray-900 font-bold min-w-[150px]">{item.name}</td>
                      <td className="px-6 py-4 font-mono text-[11px] text-blue-600 bg-blue-50/30 rounded break-words max-w-[300px]">
                         {item.details}
                      </td>
                      <td className="px-6 py-4">
                        {item.tier !== "-" && (
                          <span className={`px-2 py-1 rounded text-[10px] font-black uppercase whitespace-nowrap ${item.tier === 'Budget' ? 'bg-gray-100 text-gray-600' : item.tier === 'Standard' ? 'bg-blue-100 text-blue-700' : 'bg-indigo-100 text-indigo-700'}`}>
                            {item.tier}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap text-lg font-black text-gray-900">₹{item.price.toLocaleString()}</td>
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
            <button onClick={() => navigate("/rooms", { state: { projectId } })} className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-bold px-8 py-4 rounded-xl shadow-sm transition w-full sm:w-auto">
              Cancel & Return
            </button>
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 w-full sm:w-auto">
              <div className="text-center sm:text-right">
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Total Value</p>
                <h2 className="text-4xl font-black text-gray-900">₹<span className="text-blue-600">{total.toLocaleString()}</span></h2>
              </div>
              <button onClick={saveProject} className="bg-green-600 text-white font-black px-10 py-5 rounded-xl shadow-lg shadow-green-600/20 hover:bg-green-700 hover:scale-[1.02] hover:shadow-xl transition-all text-xl w-full sm:w-auto">
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
    </div>
  );
}

export default RoomConfigurator;
