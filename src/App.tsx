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

  const handleSearch = async (query: string = searchQuery) => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPOData(query);
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
    const isFuture = globalIndex > currentStepIndex;

    return (
      <div className={`flex flex-col items-center gap-4 w-32 sm:w-40 relative transition-opacity duration-500 ${!isCurrent ? "opacity-50 grayscale-[0.5]" : "opacity-100"}`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: globalIndex * 0.05 }}
          className={`relative p-4 sm:p-5 rounded-[2rem] w-full aspect-square flex flex-col items-center justify-center transition-all duration-500 border ${
            isCurrent
              ? "bg-gradient-to-br from-[#6366F1] to-[#D946EF] shadow-[0_0_40px_rgba(99,102,241,0.4)] text-white border-transparent scale-110 z-20"
              : "bg-white/40 backdrop-blur-md border-white/60 text-gray-400 shadow-sm"
          }`}
        >
          {/* Checkmark for completed steps */}
          {isPast && (
            <div className="absolute -top-1.5 -right-1.5 w-6 h-6 sm:w-7 sm:h-7 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg z-30 border-2 border-white">
              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
            </div>
          )}

          <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden mb-2.5 flex items-center justify-center shadow-inner ${isCurrent ? "bg-white/20" : "bg-gray-200/30"}`}>
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
            <span className={`text-[8px] font-black mb-0.5 opacity-60 ${isCurrent ? "text-white" : "text-gray-500"}`}>STEP {globalIndex + 1}</span>
            <p className={`text-center text-[10px] sm:text-xs font-bold leading-tight px-0.5 ${isCurrent ? "text-white" : "text-gray-600"}`}>
              {step.title}
            </p>
          </div>
        </motion.div>

        {step.hasDetail && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-2 rounded-lg w-full text-[8px] sm:text-[9px] text-center transition-all duration-500 border ${
              isCurrent
                ? "bg-white shadow-lg text-gray-600 border-purple-100"
                : "bg-white/20 text-gray-400 border-white/10"
            }`}
          >
            {isCurrent ? "กำลังดำเนินการ" : isPast ? "เสร็จสิ้น" : "รอดำเนินการ"}
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
            <h1 className="text-9xl font-black mb-4 bg-gradient-to-r from-[#6366F1] to-[#D946EF] bg-clip-text text-transparent py-2 tracking-tighter">
              Search
            </h1>
            <p className="text-gray-500 mb-12 text-2xl font-bold tracking-tight">ค้นหาหมายเลข PO</p>
            
            <div className="relative group max-w-4xl mx-auto">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch(searchQuery)}
                placeholder="ค้นหา PO เช่น 300xxxxxxxx"
                className="w-full pl-14 pr-28 py-5 bg-white rounded-full shadow-xl border-none focus:ring-2 focus:ring-blue-400 transition-all text-gray-700 placeholder:text-gray-600/30 text-2xl font-light"
              />
              <button
                onClick={() => handleSearch(searchQuery)}
                disabled={loading}
                className="absolute right-2 top-2 bottom-2 px-8 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-full font-normal transition-all flex items-center justify-center min-w-[120px] text-xl"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "ค้นหา"}
              </button>
            </div>

            <div className="relative group max-w-4xl mx-auto mt-10">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={egpSearchQuery}
                onChange={(e) => setEgpSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch(egpSearchQuery)}
                placeholder="ค้นหาหมายเลขโครงการ e-GP"
                className="w-full pl-14 pr-28 py-5 bg-white rounded-full shadow-xl border-none focus:ring-2 focus:ring-purple-400 transition-all text-gray-700 placeholder:text-gray-600/30 text-2xl font-light"
              />
              <button
                onClick={() => handleSearch(egpSearchQuery)}
                disabled={loading}
                className="absolute right-2 top-2 bottom-2 px-8 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white rounded-full font-normal transition-all flex items-center justify-center min-w-[120px] text-xl"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "ค้นหา"}
              </button>
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
            className="w-full max-w-7xl relative flex flex-col items-center min-h-screen py-12 px-4"
          >
            <button
              onClick={() => setView("search")}
              className="absolute top-4 left-4 z-50 flex items-center gap-2 px-5 py-2.5 bg-white/60 backdrop-blur-md hover:bg-white rounded-full transition-all text-[#3B82F6] font-bold text-xs shadow-lg border border-white/40"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>ค้นหาใหม่</span>
            </button>

            {/* Main Workflow Section - Centered */}
            <div className="flex-1 flex flex-col items-center justify-center w-full py-10">
              <div className="w-full max-w-5xl flex flex-col items-center gap-12 relative">
                {/* Row 1: Steps 1-5 */}
                <div className="flex items-start justify-center gap-3 sm:gap-4 relative">
                  {workflowSteps.slice(0, 5).map((step, index) => (
                    <React.Fragment key={index}>
                      <Step step={step} index={index} globalIndex={index} />
                      {index < 4 && (
                        <div className="flex items-center h-32 sm:h-40 px-0.5 sm:px-1">
                          <div className={`h-[2px] w-6 sm:w-10 rounded-full transition-all duration-500 ${
                            index < getCurrentStepIndex(result?.status) ? "bg-gradient-to-r from-[#6366F1] to-[#D946EF]" : "bg-gray-200/30"
                          }`} />
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                  
                  {/* Connector from Step 5 to 6 (Curved Path) */}
                  <div className="absolute -bottom-12 right-16 sm:right-20 w-24 sm:w-32 h-12 border-r-2 border-b-2 border-dashed border-purple-300/40 rounded-br-[2.5rem] pointer-events-none"></div>
                </div>

                {/* Row 2: Steps 6-9 */}
                <div className="flex items-start justify-center gap-3 sm:gap-4 relative mt-4">
                  {/* Connector from Row 1 to Step 6 */}
                  <div className="absolute -top-12 left-16 sm:left-20 w-24 sm:w-32 h-12 border-l-2 border-t-2 border-dashed border-purple-300/40 rounded-tl-[2.5rem] translate-x-[-100%] pointer-events-none"></div>
                  
                  {workflowSteps.slice(5).map((step, index) => (
                    <React.Fragment key={index + 5}>
                      <Step step={step} index={index} globalIndex={index + 5} />
                      {index < 3 && (
                        <div className="flex items-center h-32 sm:h-40 px-0.5 sm:px-1">
                          <div className={`h-[2px] w-6 sm:w-10 rounded-full transition-all duration-500 ${
                            (index + 5) < getCurrentStepIndex(result?.status) ? "bg-gradient-to-r from-[#6366F1] to-[#D946EF]" : "bg-gray-200/30"
                          }`} />
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Project Info Panel (Glassmorphism) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-2xl bg-white/40 backdrop-blur-xl border border-white/60 p-6 rounded-[2.5rem] shadow-2xl text-gray-700 mt-auto mb-4 backdrop-saturate-150"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                <div className="space-y-1.5">
                  <p className="text-[10px] uppercase font-black text-blue-500 tracking-widest opacity-70">Project Details</p>
                  <p className="font-black text-gray-900 tracking-tight text-base">
                    PO NO: <span className="text-blue-600">{result?.poNo}</span>
                  </p>
                  <p className="font-medium text-sm">
                    บริษัท: <span className="text-gray-600">{result?.supplier}</span>
                  </p>
                </div>
                <div className="space-y-1.5 sm:text-right">
                  <p className="text-[10px] uppercase font-black text-purple-500 tracking-widest opacity-70">Contract Info</p>
                  <p className="text-xs text-gray-600 font-medium">
                    เลขบิดดิ้ง: {result?.orderId} <span className="mx-1 text-gray-300">|</span> เลขที่สัญญา: {result?.contractId}
                  </p>
                  <p className="font-medium text-sm">
                    คลังพัสดุ: <span className="text-gray-600">{result?.location}</span>
                  </p>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-gray-200/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-blue-500 font-bold text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>ติดต่อ: 038-455280 ต่อ 10426</span>
                </div>
                <div className="px-4 py-1.5 bg-blue-500/10 rounded-full text-[10px] uppercase tracking-tighter">
                  Status: {result?.status || "In Progress"}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
