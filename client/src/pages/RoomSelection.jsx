import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAdminData } from "../context/AdminDataContext";

function RoomSelection() {
  const navigate = useNavigate();
  const location = useLocation();
  const projectId = location.state?.projectId || "";
  
  const { rooms, loading } = useAdminData();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex flex-col font-sans text-gray-800">
        <Navbar />
        <div className="flex-1 flex justify-center items-center font-bold text-xl text-gray-500">Loading Configuration...</div>
      </div>
    );
  }

  // To map UI if rooms are empty...
  const roomsArray = rooms ? Object.values(rooms) : [];

  return (
    <div className="min-h-screen bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-gray-50 flex flex-col font-sans text-gray-800 relative isolation-auto">
      {/* Decorative gradients */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-br from-indigo-100/50 via-purple-50/20 to-transparent -z-10"></div>

      {/* ✅ COMMON NAVBAR */}
      <Navbar />

      {/* Rooms */}
      <div className="flex flex-col flex-1 items-center justify-center p-8 animate-fade-in relative z-10">
        
        <div className="text-center mb-12">
           <h1 className="text-4xl font-black text-gray-900 tracking-tight drop-shadow-sm mb-3">Room Selection</h1>
           <p className="text-gray-500 font-medium text-lg max-w-md mx-auto">Select a room template to configure.</p>
        </div>

        {roomsArray.length === 0 ? (
          <div className="bg-white/60 backdrop-blur-xl border border-white/50 p-16 rounded-3xl shadow-xl flex flex-col items-center justify-center text-gray-500 text-center max-w-lg">
            <div className="h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
               <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            </div>
            <p className="font-bold text-gray-700 text-lg mb-2">No Rooms Configured</p>
            <p className="text-sm">Please ask an Administrator to bootstrap the initial database data in the Admin Panel.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl w-full">
            {roomsArray.map((room, idx) => (
              <div
                key={room.id || idx}
                onClick={() => {
                  const uniqueRoomId = `room_${Date.now()}`;
                  navigate(`/configure/${room.id}`, { state: { projectId, roomId: uniqueRoomId } });
                }}
                className="group bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center min-h-[180px] text-center relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Visual Icon abstraction for room */}
                <div className="mb-5 h-16 w-16 bg-gradient-to-tr from-gray-100 to-white border border-gray-200 rounded-2xl shadow-sm flex items-center justify-center group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
                  <span className="text-xl font-black text-gray-400 group-hover:text-indigo-500 transition-colors">
                    {(room.title || room.name || "RM").substring(0, 2).toUpperCase()}
                  </span>
                </div>
                
                <h3 className="font-black text-xl text-gray-800 relative z-10 group-hover:text-indigo-900 transition-colors">{room.title || room.name || "Unnamed Room"}</h3>
                <div className="mt-4 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 relative z-10">
                  <span className="text-xs bg-indigo-600 text-white font-bold px-4 py-1.5 rounded-full shadow-md">Configure Room</span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
}

export default RoomSelection;