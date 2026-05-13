import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import Navbar from "../components/Navbar";
import { useAdminData } from "../context/AdminDataContext";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

function ProjectView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const { rooms } = useAdminData();

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await api.get(`/projects/${id}`);
        // Ensure the _id from Mongo is mapped to id
        setProject({ ...res.data, id: res.data._id });
      } catch (error) {
        console.error("Error fetching project", error);
        setProject(null);
      }
    };
    fetchProject();
  }, [id]);

  if (!project) {
    return (
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-100 via-gray-200 to-gray-300 flex flex-col font-sans">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <div className="bg-white/40 backdrop-blur-md px-10 py-6 rounded-2xl shadow-xl border border-white/50 text-gray-500 font-semibold mt-10">
            <span className="animate-pulse flex items-center gap-3">
               <svg className="animate-spin h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
               Loading Project Data...
            </span>
          </div>
        </div>
      </div>
    );
  }

  const handleDownloadInvoice = () => {
    if (!project) return;

    const doc = new jsPDF();
    const primaryColor = [255, 0, 0]; // Red
    const secondaryColor = [128, 128, 128]; // Grey
    const lightGrey = [243, 244, 246];
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Helper: Add Header
    const addHeader = (pageNum) => {
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, 15, pageWidth - margin, 15);
      
      doc.setFillColor(255, 255, 255);
      const textWidth = doc.getTextWidth("Decagon Design Studio");
      doc.rect((pageWidth / 2) - (textWidth / 2) - 5, 12, textWidth + 10, 6, "F");
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text("Decagon Design Studio", pageWidth / 2, 16, { align: "center" });

      try {
        doc.addImage("/logo.png", "PNG", pageWidth - margin - 25, 5, 25, 25);
      } catch (e) {
        console.warn("Logo failed to load", e);
      }
    };

    // Helper: Add Footer
    const addFooter = (pageNum, totalPages) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${pageNum}`, pageWidth / 2, pageHeight - 10, { align: "center" });
      doc.text("Decagon Design Studio | Interior Design Management", margin, pageHeight - 10);
    };

    // --- PAGE 1: SUMMARY DASHBOARD ---
    addHeader(1);
    
    doc.setFontSize(30);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text("Quotation", margin, 45);

    doc.setFontSize(14);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(`Hi ${project.name || "Client"} & Family,`, margin, 60);
    
    const totalWithGST = (project.total || 0) - (project.discount || 0);
    const gstAmount = Math.round(totalWithGST * 18 / 118);

    doc.setFontSize(10);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFont("helvetica", "normal");
    doc.text("Here is the quote that you requested. Please review and reach out to us, for any questions.", margin, 68);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text(`*GST @ 18% ( Rs. ${gstAmount.toLocaleString()}/- ) is included in the quote.`, margin, 74);

    // Project Details Box
    doc.setDrawColor(230, 230, 230);
    doc.roundedRect(margin, 85, pageWidth - (2 * margin), 35, 3, 3, "S");
    
    const colWidth = (pageWidth - (2 * margin)) / 4;
    const boxY = 95;
    
    const details = [
      { label: "PROPERTY NAME", value: project.property || "—" },
      { label: "TOTAL BUILT UP AREA", value: project.sqft ? `${project.sqft} SqFt` : "—" },
      { label: "CONFIGURATION", value: project.config || "—" },
      { label: "DATE", value: new Date().toLocaleDateString() }
    ];

    details.forEach((det, i) => {
      doc.setFontSize(8);
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.text(det.label, margin + (i * colWidth) + 5, boxY);
      doc.setFontSize(10);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      // Use maxWidth to prevent value overflow in box
      doc.text(det.value, margin + (i * colWidth) + 5, boxY + 10, { maxWidth: colWidth - 10 });
    });

    // Room Summary Table
    const roomsData = Object.entries(project.rooms || {}).map(([id, room]) => {
      const items = room.items || [];
      const getSum = (catMatch) => items
        .filter(it => it.category?.toLowerCase().includes(catMatch))
        .reduce((sum, it) => sum + (it.price || 0), 0);

      const modules = getSum("module") + getSum("wardrobe") + getSum("kitchen");
      const accessories = getSum("accessory");
      const appliances = getSum("appliance");
      const services = getSum("service");
      const furniture = (room.total || 0) - (modules + accessories + appliances + services);

      const amountStyle = { textColor: primaryColor, halign: 'right' };

      return [
        { content: room.name || id, styles: { fontStyle: 'bold' } },
        { content: `Rs. ${modules.toLocaleString()}`, styles: amountStyle },
        { content: `Rs. ${accessories.toLocaleString()}`, styles: amountStyle },
        { content: `Rs. ${appliances.toLocaleString()}`, styles: amountStyle },
        { content: `Rs. ${services.toLocaleString()}`, styles: amountStyle },
        { content: `Rs. ${furniture.toLocaleString()}`, styles: amountStyle },
        { content: `Rs. ${room.total?.toLocaleString() || 0}`, styles: { ...amountStyle, fontStyle: 'bold' } }
      ];
    });

    autoTable(doc, {
      startY: 130,
      head: [["Room Name", "Modules", "Accessories", "Appliances", "Services", "Furniture", "Total"]],
      body: roomsData,
      theme: 'grid',
      styles: { fontSize: 7, cellPadding: 2, overflow: 'linebreak' },
      headStyles: { fillColor: lightGrey, textColor: [50, 50, 50], fontStyle: 'bold', halign: 'center' },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 'auto' },
        3: { cellWidth: 'auto' },
        4: { cellWidth: 'auto' },
        5: { cellWidth: 'auto' },
        6: { cellWidth: 'auto' }
      },
      margin: { left: margin, right: margin }
    });

    let finalY = doc.lastAutoTable.finalY;
    if (finalY + 40 > pageHeight) {
      doc.addPage();
      addHeader(doc.internal.getNumberOfPages());
      finalY = 30;
    }

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Total Project Value:", pageWidth - margin - 80, finalY + 20);
    doc.setFontSize(20);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(`Rs. ${((project.total || 0) - (project.discount || 0)).toLocaleString()}/-`, pageWidth - margin, finalY + 32, { align: "right" });

    addFooter(1);

    // --- PAGE 2: PAYMENTS & TIMELINE ---
    doc.addPage();
    addHeader(2);
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("Payment Schedule", margin, 40);

    const totalValue = (project.total || 0) - (project.discount || 0);
    let tokenAmount = "Rs. 20,000/-";
    let orderRange = "ORDERS BELOW 5 LAKHS";
    
    if (totalValue >= 2000000) {
      tokenAmount = "Rs. 1,50,000/-";
      orderRange = "ORDERS ABOVE 20 LAKHS / TURNKEY PROJECTS";
    } else if (totalValue >= 1000000) {
      tokenAmount = "Rs. 60,000/-";
      orderRange = "ORDERS ABOVE 10 LAKHS";
    } else if (totalValue >= 500000) {
      tokenAmount = "Rs. 40,000/-";
      orderRange = "ORDERS ABOVE 5 LAKHS";
    }

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`${orderRange} | Booking Amount`, margin, 48);

    const paymentStages = [
      ["Token Advance", "Will start working on the designing and provide 3D Drawings once the token advance is received.", tokenAmount],
      ["First Payment", "Upon confirmation of final drawings and final quotation, the client shall pay 50% of the total estimate to initiate production at the factory.", "50%"],
      ["Second Payment", "Once the products are received at site, the client shall pay 40% of the total estimate to initiate the installation at site.", "40%"],
      ["Final Payment", "Client shall pay the balance 10% of the final quotation after the installation is done at site.", "10%"]
    ];

    autoTable(doc, {
      startY: 52,
      head: [["Stage", "Description", "Requirement"]],
      body: paymentStages,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: lightGrey, textColor: [0, 0, 0] },
      columnStyles: {
        0: { cellWidth: 30, fontStyle: 'bold' },
        2: { cellWidth: 30, halign: 'right', textColor: primaryColor, fontStyle: 'bold' }
      },
      margin: { left: margin, right: margin }
    });

    const timelineY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Project Completion & Handover", margin, timelineY);
    
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    doc.setFont("helvetica", "normal");
    const timelineText = [
      "Projects with area below 500 Sqft will require a completion time of 45 working days, where as projects ranging",
      "from 500 Sqft to 900Sqft will take up to 60 working days, while those above 900 Sqft will require 75 working days for completion.",
      "For PU finish projects, areas under 500 Sqft will require a minimum of 60 working days for completion, while areas above",
      "500 Sqft will need at least 75 working days.",
      "Turnkey Solutions : Turnkey projects will be completed within 90 working days.",
      "If you choose Aristo Wardrobes, the door measurements will be taken only after the wardrobe frame is installed,",
      "and the installation may take up to 10 - 15 additional days.",
      "",
      "*Number of days mentioned are excluding the design phase."
    ];
    doc.text(timelineText, margin, timelineY + 8);

    addFooter(2);

    // --- PAGE 3+: ITEMISED DETAILS ---
    Object.entries(project.rooms || {}).forEach(([id, room], index) => {
      doc.addPage();
      addHeader(3 + index);
      
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text(`${(room.name || id).toUpperCase()} SUMMARY`, margin, 40);
      doc.setFontSize(12);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(`Total: Rs. ${room.total?.toLocaleString() || 0}`, pageWidth - margin, 40, { align: "right" });

      const itemRows = (room.items || []).map(it => [
        "", // Image column
        { content: it.name || it.design || "—", styles: { fontStyle: 'bold' } },
        it.category || "—",
        it.details || it.level || "—",
        it.tier || "—",
        "1",
        { content: `Rs. ${it.price?.toLocaleString() || 0}`, styles: { textColor: primaryColor, halign: 'right', fontStyle: 'bold' } }
      ]);

      autoTable(doc, {
        startY: 50,
        head: [["Img", "Product Name", "Category", "Config/Size", "Tier", "Qty", "Price"]],
        body: itemRows,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2, minCellHeight: 15 },
        headStyles: { fillColor: lightGrey, textColor: [0, 0, 0], halign: 'center' },
        columnStyles: {
          0: { cellWidth: 15 },
          6: { cellWidth: 30 }
        },
        didDrawCell: (data) => {
          if (data.column.index === 0 && data.cell.section === 'body') {
             const it = room.items[data.row.index];
             const img = it?.raw?.configItem?.data?.image;
             if (img) {
                try {
                   doc.addImage(img, 'JPEG', data.cell.x + 2, data.cell.y + 2, 11, 11);
                } catch(e) {}
             }
          }
        },
        margin: { left: margin, right: margin }
      });

      addFooter(3 + index);
    });

    // --- FINAL PAGE: TERMS ---
    doc.addPage();
    const lastPageNum = doc.internal.getNumberOfPages();
    addHeader(lastPageNum);
    
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Terms & Conditions", margin, 40);
    
    doc.setFontSize(7);
    doc.setTextColor(80, 80, 80);
    doc.setFont("helvetica", "normal");
    
    const termsY = 48;
    doc.setFont("helvetica", "bold");
    doc.text("Price Validity", margin, termsY);
    doc.setFont("helvetica", "normal");
    const priceTerms = [
      "1. This quotation is an initial estimate and is valid for 60 days from quote preparation.",
      "2. The exact price of your project will depend on measurements, scope of work and change in designs / material / finishes.",
      "3. To move forward with measurement based designs, you will have to pay the token advance mentioned.",
      "4. Minimum order value is INR 1,50,000. No order below minimum order value will be accepted.",
      "5. The initial estimates may not include civil, plumbing, gas-piping or electrical work. Exact value depends on site conditions.",
      "6. By default, all lofts will be non-soft close. Final payment due 3 days before completion of installation."
    ];
    doc.text(priceTerms, margin, termsY + 4);

    const installY = termsY + 30;
    doc.setFont("helvetica", "bold");
    doc.text("Installation Checks", margin, installY);
    doc.setFont("helvetica", "normal");
    doc.text("Hand marks and scratches are bound to occur during civil work (false ceiling, electrical, plumbing etc.) and cannot be", margin, installY + 4);
    doc.text("avoided. It is recommended to have a final coat of paint after completion of all interiors.", margin, installY + 8);

    const warrantyY = installY + 16;
    doc.setFont("helvetica", "bold");
    doc.text("Upto 10-Year Warranty*", margin, warrantyY);
    doc.setFont("helvetica", "normal");
    const warrantyTerms = [
      "1. 10 years warranty on carcass, shutters and panels manufactured by Decagon Design Studio.",
      "2. No warranty for damages due to termites, white ants, or natural calamities (floods, earthquakes etc.).",
      "3. Branded appliances and accessories carry respective manufacturer warranties, serviced under our supervision.",
      "4. No warranty for damages due to scratches on granite slabs, floor tiles or civil works (masonry, plastering, plumbing etc.)."
    ];
    doc.text(warrantyTerms, margin, warrantyY + 4);

    const cleaningY = warrantyY + 24;
    doc.setFont("helvetica", "bold");
    doc.text("Cleaning Services", margin, cleaningY);
    doc.setFont("helvetica", "normal");
    doc.text("Includes dusting, sweeping, and cleaning cabinet doors/insides to remove pencil marks and dust.", margin, cleaningY + 4);
    doc.text("Deep cleaning with mechanical equipment is out of scope.", margin, cleaningY + 8);

    const cancelY = cleaningY + 18;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("Cancellation Policy", margin, cancelY);
    
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text("For cancellations, we follow a fair and transparent process based on the stage of your order:", margin, cancelY + 5, { maxWidth: pageWidth - 2*margin });

    autoTable(doc, {
      startY: cancelY + 10,
      head: [["Stage of Order", "Eligibility", "Policy"]],
      body: [
        ["Design Stage", "Cancellation within 48 hours of booking or measurement visit", "100% Refund of Token Advance"],
        ["Design Stage", "Cancellation after booking but before site masking", "5% Deduction for design costs"],
        ["Design Stage", "Cancellation after site masking but before 40% payment", "Nil Refund"]
      ],
      theme: 'grid',
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: lightGrey, textColor: [0, 0, 0] },
      columnStyles: {
        0: { cellWidth: 30, fontStyle: 'bold' },
        2: { textColor: primaryColor, fontStyle: 'bold' }
      },
      margin: { left: margin, right: margin }
    });

    addFooter(lastPageNum);

    const filename = `Quotation_${project.name || 'Project'}.pdf`;
    doc.save(filename);
  };

  const handleDeleteItem = async (roomName, itemIndex, itemPrice) => {
    const confirmDelete = window.confirm("Are you sure you want to remove this item?");
    if (!confirmDelete) return;

    try {
      if (project && project.rooms && project.rooms[roomName]) {
        const itemsList = project.rooms[roomName].items || [];
        const updatedItems = itemsList.filter((_, idx) => idx !== itemIndex);
        const newRoomTotal = updatedItems.reduce((sum, item) => sum + (item.price || 0), 0);
        const currentProjectTotal = project.total || 0;
        const newProjectTotal = currentProjectTotal - itemPrice;
        
        // Ensure discount is not lost
        const discount = project.discount || 0;

        const updatedRooms = { ...project.rooms };
        updatedRooms[roomName] = {
           ...updatedRooms[roomName],
           items: updatedItems,
           total: newRoomTotal
        };

        await api.put(`/projects/${id}`, {
          rooms: updatedRooms,
          total: newProjectTotal > 0 ? newProjectTotal : 0
        });

        setProject({
          ...project,
          rooms: updatedRooms,
          total: newProjectTotal > 0 ? newProjectTotal : 0
        });
      }
    } catch (error) {
      console.error(error);
      alert("Failed to delete item from room.");
    }
  };

  const handleApplyDiscount = async () => {
    const amount = prompt("Enter discount amount (₹):", project.discount || 0);
    if (amount === null) return;
    
    const discountVal = Number(amount);
    if (isNaN(discountVal)) {
      alert("Invalid amount");
      return;
    }

    try {
      await api.put(`/projects/${id}`, { discount: discountVal });
      setProject({ ...project, discount: discountVal });
    } catch (error) {
      console.error(error);
      alert("Failed to apply discount");
    }
  };

  const roomsList = project.rooms ? Object.entries(project.rooms) : [];

  return (
  <div className="min-h-screen bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-gray-50 flex flex-col font-sans text-gray-800 relative isolation-auto">
      {/* Decorative gradients */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-br from-indigo-100/50 via-purple-100/30 to-transparent -z-10"></div>
      
      <Navbar />

      <div className="p-8 max-w-7xl mx-auto w-full flex-1 mt-6">
        
        {/* Header Block with Glassmorphism */}
        <div className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white flex flex-col md:flex-row justify-between items-start md:items-center mb-10 transition-all hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)]">
          <div>
            <div className="flex gap-3 mb-2 items-center">
              <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${project.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                {project.status === 'completed' ? 'Completed Dashboard' : 'Active Dashboard'}
              </span>
              <span className="text-gray-400 text-sm font-medium">{project.customId || `#${id}`}</span>
            </div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-1">{project.name || "Untitled Project"}</h1>
            <p className="text-gray-500 font-medium tracking-wide flex items-center gap-4">
              <span>Property: <span className="text-gray-800 font-bold">{project.property || "Unknown"}</span></span>
              <span>•</span>
              <span>Dimensions: <span className="text-gray-800 font-bold">{project.sqft || 0} SqFt</span></span>
              <span>•</span>
              <span>Location: <span className="text-gray-800 font-bold">{project.location || "Not Provided"}</span></span>
            </p>
          </div>
          
          <div className="mt-6 md:mt-0 text-left md:text-right">
            <p className="text-gray-500 uppercase tracking-widest text-xs font-bold mb-1">Total Project Cost</p>
            <h2 className="text-4xl font-black text-gray-900 drop-shadow-sm">₹ {((project.total || 0) - (project.discount || 0)).toLocaleString()}</h2>
            {project.discount > 0 && (
              <p className="text-green-600 text-xs font-bold mt-1 tracking-tight">Includes ₹{project.discount.toLocaleString()} Discount</p>
            )}
          </div>
        </div>

        {/* Master Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 px-2">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Configured Rooms</h2>
          <div className="flex gap-4">
            <button
              onClick={handleApplyDiscount}
              className="bg-orange-500/90 backdrop-blur-md text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 hover:bg-orange-600 transition-all duration-300 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12z"></path></svg>
              Apply Discount
            </button>
            <button
              onClick={handleDownloadInvoice}
              className="bg-emerald-500/90 backdrop-blur-md text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 hover:bg-emerald-600 transition-all duration-300 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              Download Invoice
            </button>
            <button
              onClick={() => navigate("/rooms", { state: { projectId: id } })}
              className="bg-gray-900/90 backdrop-blur-md text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 hover:bg-black transition-all duration-300"
            >
              + Add New Room
            </button>
          </div>
        </div>

        {/* Rooms Listing */}
        {roomsList.length === 0 ? (
          <div className="bg-white p-10 text-center rounded-xl border border-gray-200 shadow-sm">
            <p className="text-gray-500 font-medium mb-4">No rooms have been added to this project yet.</p>
            <button
              onClick={() => navigate("/rooms", { state: { projectId: id } })}
              className="bg-blue-600 text-white font-medium px-6 py-2 rounded shadow hover:bg-blue-700 transition"
            >
              Start Room Configuration
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {roomsList.map(([roomId, roomData]) => {
              const displayTitle = roomData.name || roomId;
              return (
              <div key={roomId} className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-sm hover:shadow-md transition duration-300 border border-white/60 overflow-hidden group">
                
                {/* Room Header */}
                <div className="bg-gradient-to-r from-gray-50/80 to-transparent px-8 py-5 flex justify-between items-center border-b border-gray-100 group-hover:bg-blue-50/30 transition-colors duration-300">
                  <h3 className="text-2xl font-black text-gray-900 capitalize tracking-tight">{displayTitle}</h3>
                  <div className="flex gap-4 items-center">
                    <p className="text-gray-900 font-extrabold bg-white/60 backdrop-blur-md px-5 py-2 rounded-xl shadow-sm text-sm border border-white">
                      Room Total: ₹ {roomData.total || 0}
                    </p>
                    <button
                      onClick={() => {
                        let finalRoomType = roomData.type;
                        if (!finalRoomType && rooms) {
                           const matchingRoom = Object.values(rooms).find(r => r.title === roomData.name || r.id === roomId);
                           if (matchingRoom) finalRoomType = matchingRoom.id;
                        }
                        if (!finalRoomType) finalRoomType = roomId;

                        navigate(`/configure/${finalRoomType}`, { state: { projectId: id, roomId: roomId } });
                      }}
                      className="text-sm bg-blue-600/10 text-blue-700 font-bold px-6 py-2 rounded-xl hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-sm"
                    >
                      Edit Room
                    </button>
                  </div>
                </div>

                {/* Items Table */}
                <div className="p-0">
                  {(!roomData.items || roomData.items.length === 0) ? (
                    <div className="p-6 text-sm text-gray-500 italic">No modules or services attached to this room.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
                            <th className="px-4 py-3 font-semibold w-16">Image</th>
                            <th className="px-4 py-3 font-semibold">Category</th>
                            <th className="px-4 py-3 font-semibold">Design Detail</th>
                            <th className="px-4 py-3 font-semibold">Configuration (Size/Scale)</th>
                            <th className="px-4 py-3 font-semibold">Tier</th>
                            <th className="px-4 py-3 font-semibold w-1/5 text-right">Cost (₹)</th>
                            <th className="px-4 py-3 font-semibold w-24 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                          {roomData.items.map((item, idx) => {
                            const itemImage = item.raw?.configItem?.data?.image || null;
                            return (
                            <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                              {/* THUMBNAIL */}
                              <td className="px-4 py-3">
                                {itemImage ? (
                                  <div className="h-12 w-12 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 shrink-0">
                                    <img src={itemImage} alt={item.name} className="w-full h-full object-cover" />
                                  </div>
                                ) : (
                                  <div className="h-12 w-12 rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-center shrink-0">
                                    <span className="text-[9px] text-gray-300 font-bold uppercase leading-tight text-center">No{"\n"}Img</span>
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-4 text-xs font-bold text-gray-500 uppercase">{item.category || "-"}</td>
                              <td className="px-4 py-4 font-bold text-gray-900">{item.name || item.design || "Unknown Item"}</td>
                              <td className="px-4 py-4"><span className="text-xs font-mono text-blue-700 bg-blue-50 px-2.5 py-1 rounded inline-block">{item.details || item.level || "-"}</span></td>
                              <td className="px-4 py-4 font-bold text-gray-700">{item.tier || '-'}</td>
                              <td className="px-4 py-4 text-gray-900 font-bold text-right text-lg">₹{(item.price || 0).toLocaleString()}</td>
                              <td className="px-4 py-4 text-center">
                                <button
                                  onClick={() => handleDeleteItem(roomId, idx, item.price || 0)}
                                  className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md font-bold text-xs transition-colors"
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

              </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProjectView;
