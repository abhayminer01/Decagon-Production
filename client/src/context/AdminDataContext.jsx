import { createContext, useContext, useState, useEffect } from "react";
import api from "../api";
import { genericServices as initialServices, roomData as initialRooms } from "../data/roomData";

export const AdminDataContext = createContext();

export function useAdminData() {
  return useContext(AdminDataContext);
}

export function AdminDataProvider({ children }) {
  const [services, setServices] = useState([]);
  const [finishings, setFinishings] = useState([]);
  const [coreMaterials, setCoreMaterials] = useState([]);
  const [accessories, setAccessories] = useState([]);
  const [stylings, setStylings] = useState([]);
  const [rooms, setRooms] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    if (token || localStorage.getItem('isAdmin') === 'true') {
      try {
        const res = await api.get('/admin');
        const data = res.data || {};
        setServices(data.services || []);
        setFinishings(data.finishings || []);
        setCoreMaterials(data.coreMaterials || []);
        setAccessories(data.accessories || []);
        setStylings(data.stylings || []);
        setRooms(data.rooms || {});
      } catch (error) {
        console.error("Error fetching admin data:", error);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const bootstrapData = async () => {
    try {
      const initialFinishings = [
        { name: "Matte Laminate", price: 150 },
        { name: "High Gloss Laminate", price: 180 },
        { name: "Acrylic", price: 250 },
        { name: "PU Finish", price: 350 },
        { name: "Veneer + Polish", price: 400 },
        { name: "Glass/Profile", price: 450 }
      ];

      const initialCoreMaterials = [
        { name: "MR Grade Plywood", price: 100 },
        { name: "BWR Plywood", price: 120 },
        { name: "BWP Plywood", price: 150 },
        { name: "HDHMR", price: 110 }
      ];

      const initialDesigns = [
        { id: "design_1", name: "Modern Minimalist", price: 1000 },
        { id: "design_2", name: "Classic Elegance", price: 1200 },
        { id: "design_3", name: "Industrial Chic", price: 900 },
        { id: "design_4", name: "Bohemian Rhapsody", price: 1100 }
      ];

      const formattedRooms = {};
      Object.keys(initialRooms).forEach(key => {
        const formattedModules = {};
        const oldModules = initialRooms[key].modules || [];
        
        oldModules.forEach((modStr, idx) => {
           const moduleId = `mod_${idx}`;
           formattedModules[moduleId] = {
             id: moduleId,
             name: modStr,
             designs: initialDesigns.map(d => ({ 
               ...d, 
               image: "",
               budgetRate: d.price * 0.8,
               standardRate: d.price,
               premiumRate: d.price * 1.5
             }))
           };
        });

        formattedRooms[key] = {
          id: key,
          title: initialRooms[key].title,
          modules: formattedModules
        };
      });

      const defaultServices = [
        { name: "Painting", price: 15, image: "" },
        { name: "Deep Cleaning", price: 20, image: "" }
      ];

      const defaultAccessories = [
        { name: "LED Strip Lights", price: 450, image: "" },
        { name: "Soft Close Hinges", price: 250, image: "" }
      ];

      const defaultData = {
        services: defaultServices,
        finishings: initialFinishings,
        coreMaterials: initialCoreMaterials,
        accessories: defaultAccessories,
        rooms: formattedRooms
      };
      
      await api.post('/admin/bootstrap', { data: defaultData });
      alert("Database Bootstrapped successfully.");
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Error bootstrapping data: " + error.message);
    }
  };

  return (
    <AdminDataContext.Provider value={{ services, finishings, coreMaterials, accessories, stylings, rooms, loading, bootstrapData, fetchData }}>
      {children}
    </AdminDataContext.Provider>
  );
}
