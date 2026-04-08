import React, { useState } from "react";
import { Search, Phone, ArrowLeft, Loader2, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { fetchPOData } from "./services/googleSheetService";
import { POData } from "./types";

export default function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [egpSearchQuery, setEgpSearchQuery] = useState("");
  const [result, setResult] = useState<POData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"search" | "result">("search");

  const workflowSteps = [
    { title: "ประกาศผู้ชนะ", hasDetail: true, image: "https://lh3.googleusercontent.com/u/0/d/13qFq3xMHHRsJug75C4yzgFdfpjUdrBSn" },
    { title: "แจ้งลงนามสัญญา", hasDetail: true, image: "https://lh3.googleusercontent.com/u/0/d/1uqSCKlWBtIHVdbfwTeLTDRlSLPaSfeeD" },
    { title: "ทำสัญญา", hasDetail: true, image: "https://lh3.googleusercontent.com/u/0/d/1D8FzIJo5nGPDHaJK1wAUaHTF5CHDMDon" },
    { title: "รอบริษัทส่งของ", hasDetail: true, image: "https://lh3.googleusercontent.com/u/0/d/1_fH6XLMTvbOduCzVIOBD32QmlqAGQec0" },
    { title: "บริษัทส่งของแล้ว", hasDetail: true, image: "https://lh3.googleusercontent.com/u/0/d/1P1CXGWB7BM8PA_ZS3hvH1vkVjcmgU0UU" },
    { title: "ส่งทดสอบ", hasDetail: true, image: "https://lh3.googleusercontent.com/u/0/d/1yR_zVgXGRHd38JctGNrxTHfHn7RrJBic" },
    { title: "กรรมการตรวจรับ", hasDetail: true, image: "https://lh3.googleusercontent.com/u/0/d/16l_6H_GwLig0RuBxj0NfWajRnewWpfwA" },
    { title: "ตรวจเอกสารเบิกจ่าย", hasDetail: false, image: "https://lh3.googleusercontent.com/u/0/d/1mKqyx51SoEIn5ATc3yqvBjW0_6eiUd5v" },
    { title: "เบิกจ่าย", hasDetail: true, image: "https://lh3.googleusercontent.com/u/0/d/1sNR1fotKS_0iMyeJ7M9kRHl37XC0o4hY" },
  ];

  const getCurrentStepIndex = (status?: string) => {
    if (!status) return 4; // Default to "บริษัทส่งของแล้ว" for demo
    const index = workflowSteps.findIndex(step => step.title === status);
    return index !== -1 ? index : 4;
  };

  const handleSearch = async (query: string, type: "po" | "egp" = "po") => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPOData(query, type);
      if (data) {
        setResult(data);
        setView("result");
      } else {
        setError("กรุณาตรวจสอบหมายเลขของคุณ");
      }
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการดึงข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  const Step = ({ step, index, globalIndex }: { step: any; index: number; globalIndex: number }) => {
    const currentStepIndex = getCurrentStepIndex(result?.status);
    const isCurrent = globalIndex === currentStepIndex;
    const isPast = globalIndex < currentStepIndex;

    return (
      <div className={`flex flex-col items-center gap-1.5 w-[28%] min-w-[80px] max-w-[120px] relative transition-opacity duration-500 ${!isCurrent ? "opacity-40 grayscale-[0.2]" : "opacity-100"}`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: globalIndex * 0.05 }}
          className={`relative p-2.5 sm:p-4 rounded-[1.5rem] sm:rounded-[2rem] w-full aspect-square flex flex-col items-center justify-center transition-all duration-500 border ${
            isCurrent
              ? "bg-gradient-to-br from-[#6366F1] to-[#D946EF] shadow-[0_0_30px_rgba(168,85,247,0.5)] text-white border-transparent scale-110 z-20"
              : "bg-white/40 backdrop-blur-md border-white/60 text-gray-400 shadow-sm"
          }`}
        >
          {/* Checkmark for completed steps */}
          {isPast && (
            <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-green-400 rounded-full flex items-center justify-center text-white shadow-md z-30 border-2 border-white">
              <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
            </div>
          )}

          <div className={`w-10 h-10 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl overflow-hidden mb-1.5 flex items-center justify-center shadow-inner ${isCurrent ? "bg-white/20" : "bg-gray-200/30"}`}>
            <img
              src={step.image}
              alt={step.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://picsum.photos/seed/step-${globalIndex}/300/300`;
              }}
            />
          </div>
          
          <div className="flex flex-col items-center">
            <span className={`text-[6px] sm:text-[8px] font-black mb-0.5 opacity-60 ${isCurrent ? "text-white" : "text-gray-500"}`}>STEP {globalIndex + 1}</span>
            <p className={`text-center text-[8px] sm:text-[10px] font-bold leading-tight px-0.5 ${isCurrent ? "text-white" : "text-gray-600"}`}>
              {step.title}
            </p>
            {globalIndex === 0 && result?.announcementDate && (
              <p className={`text-[6px] sm:text-[7px] mt-0.5 font-medium ${isCurrent ? "text-white/80" : "text-gray-400"}`}>
                {result.announcementDate}
              </p>
            )}
          </div>
        </motion.div>

        {step.hasDetail && (
          <motion.div
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-1 rounded-lg w-full text-[7px] sm:text-[9px] text-center transition-all duration-500 border ${
              isCurrent
                ? "bg-[#6366F1] shadow-md text-white border-transparent font-bold"
                : "bg-white/20 text-gray-400 border-white/10"
            }`}
          >
            {isCurrent ? "กำลังดำเนินการ" : isPast ? <span className="text-gray-400">เสร็จสิ้น</span> : "รอดำเนินการ"}
          </motion.div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E0F2FE] to-[#F3E8FF] flex items-center justify-center p-4 font-sans overflow-hidden">
      <AnimatePresence mode="wait">
        {view === "search" ? (
          <motion.div
            key="search"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-4xl text-center"
          >
            <h1 className="text-6xl sm:text-9xl font-black mb-2 bg-gradient-to-r from-[#6366F1] to-[#D946EF] bg-clip-text text-transparent py-2 tracking-tighter">
              Search
            </h1>
            <p className="text-gray-500 mb-6 text-xl sm:text-2xl font-bold tracking-tight">ค้นหาสถานะงานจัดซื้อ</p>
            
            <div className="space-y-4 max-w-4xl mx-auto">
              {/* PO Search */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                  <Search className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch(searchQuery, "po")}
                  placeholder="ค้นหา PO เช่น 300xxxxxxxx"
                  className="w-full pl-12 pr-24 py-3 sm:py-5 bg-white rounded-full shadow-xl border-none focus:ring-2 focus:ring-blue-400 transition-all text-gray-700 placeholder:text-gray-600/30 text-lg sm:text-2xl font-light"
                />
                <button
                  onClick={() => handleSearch(searchQuery, "po")}
                  disabled={loading}
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-6 sm:px-8 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-full font-normal transition-all flex items-center justify-center min-w-[80px] sm:min-w-[120px] text-base sm:text-xl"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "ค้นหา"}
                </button>
              </div>

              {/* e-GP Search (Matching the image) */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                  <Search className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={egpSearchQuery}
                  onChange={(e) => setEgpSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch(egpSearchQuery, "egp")}
                  placeholder="ค้นหาหมายเลขโครงการ e-GP"
                  className="w-full pl-12 pr-24 py-3 sm:py-5 bg-white rounded-full shadow-xl border-none focus:ring-2 focus:ring-purple-400 transition-all text-gray-700 placeholder:text-gray-600/30 text-lg sm:text-2xl font-light"
                />
                <button
                  onClick={() => handleSearch(egpSearchQuery, "egp")}
                  disabled={loading}
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-6 sm:px-8 bg-[#A855F7] hover:bg-[#9333EA] disabled:bg-purple-300 text-white rounded-full font-normal transition-all flex items-center justify-center min-w-[80px] sm:min-w-[120px] text-base sm:text-xl"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "ค้นหา"}
                </button>
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6 text-red-500 font-medium"
              >
                {error}
              </motion.p>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-7xl relative flex flex-col items-center min-h-screen py-4 sm:py-12 px-4"
          >
            <button
              onClick={() => setView("search")}
              className="absolute top-2 left-2 z-50 flex items-center gap-2 px-3 py-1.5 bg-white/60 backdrop-blur-md hover:bg-white rounded-full transition-all text-[#3B82F6] font-bold text-[9px] shadow-md border border-white/40"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>กลับไปหน้าค้นหา</span>
            </button>

            {/* Main Workflow Section - Centered */}
            <div className="flex-1 flex flex-col items-center justify-center w-full py-2 sm:py-8 overflow-hidden">
              <div className="w-full max-w-4xl flex flex-col items-center gap-4 sm:gap-10 relative">
                
                {/* Row 1: Steps 1-3 */}
                <div className="flex items-start justify-center gap-2 sm:gap-6 relative w-full px-4">
                  {workflowSteps.slice(0, 3).map((step, index) => (
                    <React.Fragment key={index}>
                      <Step step={step} index={index} globalIndex={index} />
                      {index < 2 && (
                        <div className="flex items-center h-16 sm:h-40">
                          <div className={`h-[1px] sm:h-[1.5px] w-4 sm:w-16 rounded-full transition-all duration-500 ${
                            index < getCurrentStepIndex(result?.status) ? "bg-gradient-to-r from-[#6366F1] to-[#D946EF]" : "bg-gray-200/20"
                          }`} />
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                  {/* S-Curve Connector: Row 1 to Row 2 */}
                  <div className="absolute -bottom-4 right-[10%] sm:right-20 w-12 sm:w-24 h-4 border-r-[1px] border-b-[1px] border-dashed border-purple-300/30 rounded-br-[1rem] pointer-events-none"></div>
                </div>

                {/* Row 2: Steps 4-6 */}
                <div className="flex items-start justify-center gap-2 sm:gap-6 relative mt-1 w-full px-4">
                  {/* Connector from Row 1 */}
                  <div className="absolute -top-4 left-[10%] sm:left-20 w-12 sm:w-24 h-4 border-l-[1px] border-t-[1px] border-dashed border-purple-300/30 rounded-tl-[1rem] translate-x-[-100%] pointer-events-none"></div>
                  
                  {workflowSteps.slice(3, 6).map((step, index) => (
                    <React.Fragment key={index + 3}>
                      <Step step={step} index={index} globalIndex={index + 3} />
                      {index < 2 && (
                        <div className="flex items-center h-16 sm:h-40">
                          <div className={`h-[1px] sm:h-[1.5px] w-4 sm:w-16 rounded-full transition-all duration-500 ${
                            (index + 3) < getCurrentStepIndex(result?.status) ? "bg-gradient-to-r from-[#6366F1] to-[#D946EF]" : "bg-gray-200/20"
                          }`} />
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                  {/* S-Curve Connector: Row 2 to Row 3 */}
                  <div className="absolute -bottom-4 right-[10%] sm:right-20 w-12 sm:w-24 h-4 border-r-[1px] border-b-[1px] border-dashed border-purple-300/30 rounded-br-[1rem] pointer-events-none"></div>
                </div>

                {/* Row 3: Steps 7-9 */}
                <div className="flex items-start justify-center gap-2 sm:gap-6 relative mt-1 w-full px-4">
                  {/* Connector from Row 2 */}
                  <div className="absolute -top-4 left-[10%] sm:left-20 w-12 sm:w-24 h-4 border-l-[1px] border-t-[1px] border-dashed border-purple-300/30 rounded-tl-[1rem] translate-x-[-100%] pointer-events-none"></div>
                  
                  {workflowSteps.slice(6, 9).map((step, index) => (
                    <React.Fragment key={index + 6}>
                      <Step step={step} index={index} globalIndex={index + 6} />
                      {index < 2 && (
                        <div className="flex items-center h-16 sm:h-40">
                          <div className={`h-[1px] sm:h-[1.5px] w-4 sm:w-16 rounded-full transition-all duration-500 ${
                            (index + 6) < getCurrentStepIndex(result?.status) ? "bg-gradient-to-r from-[#6366F1] to-[#D946EF]" : "bg-gray-200/20"
                          }`} />
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Project Info Panel */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full bg-white/70 backdrop-blur-3xl border-t border-white/80 p-4 sm:p-8 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] text-gray-700 mt-auto backdrop-saturate-150"
            >
              <div className="max-w-xl mx-auto space-y-2">
                <div className="flex flex-col gap-0.5">
                  <p className="text-[8px] uppercase font-black text-blue-500 tracking-widest opacity-60">Project Details</p>
                  <div className="space-y-1">
                    {result?.poNo ? (
                      <>
                        <div className="flex justify-between items-baseline border-b border-gray-100 pb-1">
                          <span className="text-[9px] text-gray-400 font-bold">PO NO:</span>
                          <span className="font-black text-blue-600 text-xs">{result.poNo}</span>
                        </div>
                        <div className="flex justify-between items-baseline border-b border-gray-100 pb-1">
                          <span className="text-[9px] text-gray-400 font-bold">บริษัท:</span>
                          <span className="font-bold text-gray-800 text-xs">{result.supplier}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between items-baseline border-b border-gray-100 pb-1">
                          <span className="text-[9px] text-gray-400 font-bold">เลขบิด:</span>
                          <span className="font-black text-blue-600 text-xs">{result?.bidNo}</span>
                        </div>
                        <div className="flex justify-between items-baseline border-b border-gray-100 pb-1">
                          <span className="text-[9px] text-gray-400 font-bold">หมายเลขโครงการ e-GP:</span>
                          <span className="font-bold text-gray-800 text-xs">{result?.egp}</span>
                        </div>
                        <div className="flex justify-between items-baseline border-b border-gray-100 pb-1">
                          <span className="text-[9px] text-gray-400 font-bold">วิธีการจัดซื้อ:</span>
                          <span className="font-bold text-gray-800 text-xs">{result?.howTo}</span>
                        </div>
                        {result?.announcementDate && (
                          <div className="flex justify-between items-baseline border-b border-gray-100 pb-1">
                            <span className="text-[9px] text-gray-400 font-bold">วันที่ประกาศผลผู้ชนะ:</span>
                            <span className="font-bold text-gray-800 text-xs">{result.announcementDate}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {result?.poNo && (
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[8px] uppercase font-black text-purple-500 tracking-widest opacity-60">Contract Info</p>
                    <div className="space-y-1">
                      <div className="flex justify-between items-baseline border-b border-gray-100 pb-1">
                        <span className="text-[9px] text-gray-400 font-bold">เลขบิดดิ้ง:</span>
                        <span className="font-bold text-gray-700 text-[10px]">{result.orderId}</span>
                      </div>
                      <div className="flex justify-between items-baseline border-b border-gray-100 pb-1">
                        <span className="text-[9px] text-gray-400 font-bold">เลขที่สัญญา:</span>
                        <span className="font-bold text-gray-700 text-[10px]">{result.contractId}</span>
                      </div>
                      <div className="flex justify-between items-baseline border-b border-gray-100 pb-1">
                        <span className="text-[9px] text-gray-400 font-bold">คลังพัสดุ:</span>
                        <span className="font-bold text-gray-700 text-[10px]">{result.location}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-2 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-blue-500 font-bold text-[10px] bg-blue-50/50 p-2 rounded-xl border border-blue-100/50">
                    <Phone className="w-3.5 h-3.5" />
                    <span className="tracking-tight">ติดต่อ: 038-455280 ต่อ 10426</span>
                  </div>
                  <div className="w-full py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-white text-center text-[9px] uppercase tracking-widest font-black shadow-lg shadow-blue-500/20">
                    Status: {result?.status || "In Progress"}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
