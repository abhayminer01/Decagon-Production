import { useNavigate, useLocation } from "react-router-dom";
import Layout from "../components/Layout";
import { useAdminData } from "../context/AdminDataContext";

function RoomSelection() {
  const navigate = useNavigate();
  const location = useLocation();
  const projectId = location.state?.projectId || "";
  
  const { rooms, loading } = useAdminData();

  if (loading) {
    return (
      <Layout>
        <div className="flex-1 flex justify-center items-center font-bold text-xl text-gray-500 min-h-[60vh]">Loading Configuration...</div>
      </Layout>
    );
  }

  // To map UI if rooms are empty...
  const roomsArray = rooms ? Object.values(rooms) : [];

  return (
    <Layout>
      {/* Rooms */}
      <div className="flex flex-col flex-1 items-center justify-center p-8 animate-fade-in relative z-10 w-full">
        
        <div className="text-center mb-10">
           <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-3">Room Selection</h1>
           <p className="text-gray-500 font-medium text-base max-w-md mx-auto">Select a room template to configure.</p>
        </div>

        {roomsArray.length === 0 ? (
          <div className="bg-white border border-gray-200 p-12 rounded-xl shadow-sm flex flex-col items-center justify-center text-gray-500 text-center max-w-lg w-full">
            <div className="h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
               <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            </div>
            <p className="font-bold text-gray-700 text-lg mb-2">No Rooms Configured</p>
            <p className="text-sm">Please ask an Administrator to bootstrap the initial database data in the Admin Panel.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-[1200px] w-full">
            {roomsArray.map((room, idx) => (
              <div
                key={room.id || idx}
                onClick={() => {
                  const uniqueRoomId = `room_${Date.now()}`;
                  navigate(`/configure/${room.id}`, { state: { projectId, roomId: uniqueRoomId } });
                }}
                className="group bg-white border border-gray-200 hover:border-gray-900 p-6 rounded-xl shadow-sm transition-colors duration-200 cursor-pointer flex flex-col items-center justify-center min-h-[160px] text-center"
              >
                {/* Visual Icon abstraction for room */}
                <div className="mb-4 h-12 w-12 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center transition-colors">
                  <span className="text-lg font-bold text-gray-400 group-hover:text-gray-900 transition-colors">
                    {(room.title || room.name || "RM").substring(0, 2).toUpperCase()}
                  </span>
                </div>
                
                <h3 className="font-semibold text-lg text-gray-900">{room.title || room.name || "Unnamed Room"}</h3>
                <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <span className="text-xs bg-gray-900 text-white font-semibold px-3 py-1 rounded">Configure Room</span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </Layout>
  );
}

export default RoomSelection;