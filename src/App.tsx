import React, { useState, useEffect } from "react";
import { Search, Phone, ArrowLeft, Loader2, Check, Users, Lock, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { fetchPOData } from "./services/googleSheetService";
import { authenticateUser } from "./services/authService";
import { POData } from "./types";
import { parseThaiDate, addThaiWorkingDays } from "./services/dateUtils";
import { incrementVisitorCount, subscribeToVisitorCount } from "./services/visitorService";

export default function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [egpSearchQuery, setEgpSearchQuery] = useState("");
  const [result, setResult] = useState<POData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"search" | "result">("search");
  const [visitorCount, setVisitorCount] = useState<number>(0);

  const [currentUser, setCurrentUser] = useState<{ username: string; company: string } | null>(null);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    const hasVisited = sessionStorage.getItem("hasVisited");
    if (!hasVisited) {
      incrementVisitorCount();
      sessionStorage.setItem("hasVisited", "true");
    }

    const unsubscribe = subscribeToVisitorCount((count) => {
      setVisitorCount(count);
    });

    return () => unsubscribe();
  }, []);

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
    if (!status) return 0; 
    const index = workflowSteps.findIndex(step => 
       status.includes(step.title) || step.title.includes(status)
    );
    // If we've reached the final step "เบิกจ่าย", treat it as completed
    if (index === 8) return 9;
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
      <div className={`flex flex-col items-center gap-2 w-[30%] sm:w-[28%] min-w-[85px] max-w-[130px] relative transition-all duration-500 ${isCurrent ? "z-30 scale-110" : "opacity-40 grayscale-[0.8] scale-95"}`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 300,
            damping: 20,
            delay: globalIndex * 0.05 
          }}
          className={`relative p-3 sm:p-5 rounded-[2rem] sm:rounded-[2.5rem] w-full aspect-square flex flex-col items-center justify-center transition-all duration-500 border ${
            isCurrent
              ? "bg-gradient-to-br from-[#6366F1] to-[#D946EF] shadow-[0_0_50px_rgba(168,85,247,0.7)] text-white border-transparent"
              : "bg-white/50 backdrop-blur-md border-white/60 text-gray-400 shadow-sm"
          }`}
        >
          {/* Checkmark icon - moved to be inside for active, but usually just a status marker */}
          {isPast && (
            <div className="absolute top-2 right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg z-30 border-2 border-white">
              <Check className="w-3 h-3 stroke-[4]" />
            </div>
          )}

          <div className={`w-10 h-10 sm:w-16 sm:h-16 rounded-2xl overflow-hidden mb-2 flex items-center justify-center shadow-inner ${isCurrent ? "bg-white/20" : "bg-gray-200/30"}`}>
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
            <span className={`text-[5px] sm:text-[7px] font-black mb-0.5 opacity-60 ${isCurrent ? "text-white" : "text-gray-400"}`}>STEP {globalIndex + 1}</span>
            <p className={`text-center text-[8px] sm:text-[10px] font-extrabold leading-tight px-0.5 ${isCurrent ? "text-white" : "text-gray-700"}`}>
              {step.title}
            </p>
            {(isPast || isCurrent) && result?.announcementDate && (
              <p className={`text-[6px] sm:text-[8px] mt-1 font-bold ${isCurrent ? "text-white/90" : "text-gray-400"}`}>
                {result.announcementDate}
              </p>
            )}
          </div>
        </motion.div>

        {/* Status Label (Pill for active, Text for others) */}
        <div className={`px-3 py-1 rounded-full text-[7px] sm:text-[9px] font-black uppercase tracking-tight transition-all duration-500 ${
          isCurrent 
            ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg animate-pulse" 
            : "text-gray-400 font-bold"
        }`}>
          {isCurrent ? "กำลังดำเนินการ" : isPast ? "เสร็จสิ้น" : "รอดำเนินการ"}
        </div>
      </div>
    );
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E0F2FE] to-[#F3E8FF] flex items-center justify-center p-4 font-sans overflow-hidden relative">
        {/* Global Visitor Counter Box */}
        <div 
          style={{ zIndex: 99999 }}
          className="fixed top-4 right-4 bg-white border border-purple-200 px-4 py-2 rounded-2xl flex items-center gap-3 shadow-[0_10px_40px_rgba(168,85,247,0.15)] hover:shadow-[0_10px_50px_rgba(168,85,247,0.25)] transition-all group"
        >
          <div className="relative">
            <Users className="w-5 h-5 text-purple-600 transition-transform group-hover:scale-110" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-black text-purple-500 tracking-[0.2em] opacity-80 leading-tight">Total Users</span>
            <span className="text-lg font-black text-gray-900 leading-none tabular-nums">
              {(visitorCount || 0).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Background Decorative Blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-300/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-300/20 blur-3xl pointer-events-none" />

        <motion.div
          key="login"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white/80 backdrop-blur-2xl border border-white/60 p-8 sm:p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(168,85,247,0.15)] flex flex-col relative z-10"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-tr from-[#6366F1] to-[#D946EF] rounded-3xl mx-auto mb-4 flex items-center justify-center text-white shadow-lg">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-4xl font-black bg-gradient-to-r from-[#6366F1] to-[#D946EF] bg-clip-text text-transparent py-1 tracking-tight">
              Sign In
            </h2>
            <p className="text-gray-500 font-bold text-sm mt-1">กรุณาเข้าสู่ระบบเพื่อค้นหาสถานะงานจัดซื้อ</p>
          </div>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (loginLoading) return;
              if (!loginUsername.trim() || !loginPassword.trim()) {
                setLoginError("กรุณากรอก Username และ Password");
                return;
              }
              setLoginLoading(true);
              setLoginError(null);
              try {
                const user = await authenticateUser(loginUsername, loginPassword);
                if (user) {
                  setCurrentUser(user);
                } else {
                  setLoginError("Username หรือ Password ไม่ถูกต้อง");
                }
              } catch (err) {
                setLoginError("เกิดข้อผิดพลาดในการเชื่อมต่อกรุณาลองใหม่");
              } finally {
                setLoginLoading(false);
              }
            }}
            className="space-y-5"
          >
            <div className="space-y-1">
              <label className="text-[11px] font-black uppercase text-purple-600 tracking-wider">Username</label>
              <input
                type="text"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder="Username"
                className="w-full px-5 py-3.5 bg-white border border-purple-100 rounded-full shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all font-semibold text-gray-700"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-black uppercase text-purple-600 tracking-wider">Password</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-5 py-3.5 bg-white border border-purple-100 rounded-full shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all font-semibold text-gray-700"
              />
            </div>

            {loginError && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-2.5 text-red-500 text-xs font-bold"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />
                <span>{loginError}</span>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-4 bg-gradient-to-r from-[#6366F1] to-[#D946EF] hover:brightness-105 active:scale-[0.98] disabled:opacity-50 text-white rounded-full font-black text-center transition-all shadow-lg hover:shadow-[0_8px_30px_rgba(168,85,247,0.3)] flex items-center justify-center gap-2 cursor-pointer"
            >
              {loginLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <span>เข้าสู่ระบบ</span>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      {/* Welcome [Company] Box */}
      <div 
        style={{ zIndex: 99999 }}
        className="fixed top-4 left-4 bg-white border border-purple-200 px-4 py-2 rounded-2xl flex items-center gap-3 shadow-[0_10px_40px_rgba(168,85,247,0.15)] hover:shadow-[0_10px_50px_rgba(168,85,247,0.25)] transition-all group"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-[#6366F1] to-[#D946EF] text-white shrink-0">
          <Users className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-black text-purple-500 tracking-[0.2em] opacity-80 leading-tight">Welcome</span>
          <span className="text-sm font-black text-gray-800 leading-none">
            {currentUser.company}
          </span>
        </div>
        <button
          onClick={() => {
            setCurrentUser(null);
            setLoginUsername("");
            setLoginPassword("");
            setLoginError(null);
          }}
          className="ml-2 hover:bg-red-50 p-1.5 rounded-lg text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* Global Visitor Counter Box */}
      <div 
        style={{ zIndex: 99999 }}
        className="fixed top-4 right-4 bg-white border border-purple-200 px-4 py-2 rounded-2xl flex items-center gap-3 shadow-[0_10px_40px_rgba(168,85,247,0.15)] hover:shadow-[0_10px_50px_rgba(168,85,247,0.25)] transition-all group"
      >
        <div className="relative">
          <Users className="w-5 h-5 text-purple-600 transition-transform group-hover:scale-110" />
          <span className="absolute -top-1 -right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-black text-purple-500 tracking-[0.2em] opacity-80 leading-tight">Total Users</span>
          <span className="text-lg font-black text-gray-900 leading-none tabular-nums">
            {(visitorCount || 0).toLocaleString()}
          </span>
        </div>
      </div>

      <div className="min-h-screen bg-gradient-to-br from-[#E0F2FE] to-[#F3E8FF] flex items-center justify-center p-4 font-sans overflow-hidden relative">
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
              onClick={() => {
                setView("search");
                setSearchQuery("");
                setEgpSearchQuery("");
              }}
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
              <div className="max-w-xl mx-auto space-y-3">
                <div className="flex flex-col gap-1">
                  <p className="text-[10px] uppercase font-black text-blue-500 tracking-widest opacity-60">Project Details</p>
                  <div className="space-y-1.5">
                    {result?.poNo && (
                      <div className="flex justify-between items-center border-b border-gray-100 pb-1.5">
                        <span className="text-[10px] text-gray-400 font-bold">PO No.:</span>
                        <span className="font-black text-blue-600 text-[11px]">{result.poNo}</span>
                      </div>
                    )}
                    {result?.supplier && (
                      <div className="flex justify-between items-center border-b border-gray-100 pb-1.5">
                        <span className="text-[10px] text-gray-400 font-bold">บริษัท:</span>
                        <span className="font-bold text-gray-800 text-[11px]">{result.supplier}</span>
                      </div>
                    )}
                    {result?.bidNo && (
                      <div className="flex justify-between items-center border-b border-gray-100 pb-1.5">
                        <span className="text-[10px] text-gray-400 font-bold">เลขบิด:</span>
                        <span className="font-black text-blue-600 text-[11px]">{result.bidNo}</span>
                      </div>
                    )}
                    {result?.egp && (
                      <div className="flex justify-between items-center border-b border-gray-100 pb-1.5">
                        <span className="text-[10px] text-gray-400 font-bold">หมายเลขโครงการ e-GP:</span>
                        <span className="font-bold text-gray-800 text-[11px]">{result.egp}</span>
                      </div>
                    )}
                    {result?.howTo && (
                      <div className="flex justify-between items-center border-b border-gray-100 pb-1.5">
                        <span className="text-[10px] text-gray-400 font-bold">วิธีการจัดซื้อ:</span>
                        <span className="font-bold text-gray-800 text-[11px]">{result.howTo}</span>
                      </div>
                    )}
                    {result?.announcementDate && (
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-1.5">
                          <span className="text-[10px] text-gray-400 font-bold">วันที่ประกาศผลผู้ชนะ:</span>
                          <span className="font-bold text-gray-800 text-[11px]">{result.announcementDate}</span>
                        </div>
                        {(() => {
                          const startDate = parseThaiDate(result.announcementDate);
                          if (startDate) {
                            const appealEndDate = addThaiWorkingDays(startDate, 7);
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            if (today > appealEndDate) {
                              return (
                                <div className="flex justify-end pt-0.5">
                                  <span className="text-[10px] font-black text-green-600">ล่วงพ้นระยะเวลาอุทธรณ์แล้ว</span>
                                </div>
                              );
                            } else {
                              return (
                                <div className="flex justify-end pt-0.5">
                                  <span className="text-[10px] font-black text-blue-600">อยู่ในระยะเวลาอุทธรณ์</span>
                                </div>
                              );
                            }
                          }
                          return null;
                        })()}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <p className="text-[10px] uppercase font-black text-purple-500 tracking-widest opacity-60">Contract & Logistical Info</p>
                  <div className="space-y-1.5">
                    {result?.orderId && (
                      <div className="flex justify-between items-center border-b border-gray-100 pb-1.5">
                        <span className="text-[10px] text-gray-400 font-bold">เลขบิด:</span>
                        <span className="font-bold text-gray-700 text-[11px]">{result.orderId}</span>
                      </div>
                    )}
                    {result?.contractId && (
                      <div className="flex justify-between items-center border-b border-gray-100 pb-1.5">
                        <span className="text-[10px] text-gray-400 font-bold">เลขที่สัญญา:</span>
                        <span className="font-bold text-gray-700 text-[11px]">{result.contractId}</span>
                      </div>
                    )}
                    {result?.location && (
                      <div className="flex justify-between items-center border-b border-gray-100 pb-1.5">
                        <span className="text-[10px] text-gray-400 font-bold">คลังพัสดุ:</span>
                        <span className="font-bold text-gray-700 text-[11px]">{result.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-blue-500 font-bold text-[10px] bg-blue-50/50 p-2 rounded-xl border border-blue-100/50">
                    <Phone className="w-3.5 h-3.5" />
                    <span className="tracking-tight">ติดต่อ: 038-455280 ต่อ 10426</span>
                  </div>
                  <div className="w-full py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-white text-center text-[9px] uppercase tracking-widest font-black shadow-lg shadow-blue-500/20">
                    สถานะ: {result?.status || "กำลังดำเนินการ"}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </>
  );
}
