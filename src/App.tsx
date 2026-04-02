import React, { useState } from "react";
import { Search, MapPin, FileText, Building2, Package, Phone, ArrowLeft, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { fetchPOData } from "./services/googleSheetService";
import { POData } from "./types";

export default function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [result, setResult] = useState<POData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"search" | "result">("search");

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
        setError("กรุณาตรวจสอบหมายเลข PO ของคุณ");
      }
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการดึงข้อมูล");
    } finally {
      setLoading(false);
    }
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
            className="w-full max-w-md text-center"
          >
            <h1 className="text-7xl font-bold mb-2 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent py-2">
              Search
            </h1>
            <p className="text-gray-600 mb-10 text-xl font-medium">ค้นหาหมายเลข PO</p>
            
            <div className="relative group max-w-sm mx-auto">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="ค้นหา PO เช่น 300xxxxxxxx"
                className="w-full pl-14 pr-28 py-5 bg-white rounded-full shadow-xl border-none focus:ring-2 focus:ring-blue-400 transition-all text-gray-700 placeholder-gray-400 text-lg"
              />
              <button
                onClick={() => handleSearch()}
                disabled={loading}
                className="absolute right-2 top-2 bottom-2 px-8 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-full font-bold transition-all flex items-center justify-center min-w-[100px]"
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
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-lg relative"
          >
            <button
              onClick={() => setView("search")}
              className="absolute -top-14 left-0 flex items-center gap-2 px-6 py-3 bg-[#E0F2FE] hover:bg-[#D0E8FD] rounded-full transition-all text-[#3B82F6] font-bold text-sm shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>กลับไปหน้าค้นหา</span>
            </button>

            <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden">
              <div className="p-8 pt-12 text-center">
                <p className="text-[10px] text-blue-400 uppercase font-bold tracking-[0.2em] mb-2">PO NO.</p>
                <h2 className="text-5xl font-bold text-gray-800 mb-10 tracking-tight">
                  {result?.poNo}
                </h2>
                
                <div className="space-y-4 mb-10">
                  {/* Supplier - Full Width */}
                  <div className="bg-[#F8FAFC]/50 p-4 rounded-2xl border border-gray-50">
                    <DataRow icon={<Building2 className="w-6 h-6" />} label="ชื่อบริษัท" value={result?.supplier} />
                  </div>

                  {/* Bidding & Contract - Side by Side */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#F8FAFC]/50 p-4 rounded-2xl border border-gray-50">
                      <DataRow 
                        icon={<span className="text-xl font-bold">#</span>} 
                        label={<span className="bg-blue-100 text-blue-600 px-1 rounded">เลขบิดดิ้ง</span>} 
                        value={result?.orderId} 
                      />
                    </div>
                    <div className="bg-[#F8FAFC]/50 p-4 rounded-2xl border border-gray-50">
                      <DataRow icon={<FileText className="w-6 h-6" />} label="เลขที่สัญญา" value={result?.contractId} />
                    </div>
                  </div>

                  {/* BA - Full Width */}
                  <div className="bg-[#F8FAFC]/50 p-4 rounded-2xl border border-gray-50">
                    <DataRow icon={<MapPin className="w-6 h-6" />} label="คลังพัสดุ (BA)" value={result?.location} />
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-[0.1em] mb-3">สถานะปัจจุบัน</p>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-6 bg-[#FF9500] hover:bg-[#E68600] text-white rounded-3xl font-bold text-2xl shadow-xl shadow-orange-100 transition-all flex items-center justify-center gap-3"
                  >
                    <Package className="w-8 h-8" />
                    {result?.status || "บริษัทส่งของแล้ว"}
                  </motion.button>
                </div>
              </div>
              
              <div className="bg-[#F8FAFC] py-6 px-8 flex items-center justify-between text-[#3B82F6] border-t border-gray-50 rounded-b-[2.5rem]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
                    <Phone className="w-6 h-6 fill-current" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] uppercase font-bold tracking-wider opacity-70">ติดต่อสอบถาม</p>
                    <p className="font-bold text-lg">038-455280 ต่อ 10426</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DataRow({ icon, label, value }: { icon: React.ReactNode; label: React.ReactNode; value?: string }) {
  return (
    <div className="flex items-start gap-5 text-left group">
      <div className="mt-1 text-gray-300 group-hover:text-blue-400 transition-colors">{icon}</div>
      <div className="flex-1 border-b border-gray-50 pb-2">
        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-[0.1em] mb-1">{label}</p>
        <p className="text-gray-700 font-semibold text-lg leading-tight">{value || "-"}</p>
      </div>
    </div>
  );
}
