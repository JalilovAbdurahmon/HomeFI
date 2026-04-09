import React, { useState } from "react";
import { Search, Plus, TrendingUp, TrendingDown, Wallet, BarChart3, ArrowRight } from "lucide-react";

const BudgetUI = () => {
  const [activeTab, setActiveTab] = useState("total"); // total, income, expense

  // ODDIY DATA (O'zgarmas massiv)
  const myData = [
    { id: 1, name: "Oylik maosh", type: "kirim", amount: 1200, date: "Mart, 2026" },
    { id: 2, name: "Freelance", type: "kirim", amount: 500, date: "Mart, 2026" },
    { id: 3, name: "Kommunal to‘lov", type: "chiqim", amount: 150, date: "Mart, 2026" },
    { id: 4, name: "Restoran", type: "chiqim", amount: 85, date: "Aprel, 2026" },
    { id: 5, name: "Bonus", type: "kirim", amount: 300, date: "May, 2026" },
  ];

  // GRAFIKA UCHUN OYLAR (Buni qo'lda xohlagancha ko'paytirishingiz mumkin)
  const months = [
    { name: "Yan", h: "60%", color: "bg-emerald-500" },
    { name: "Fev", h: "40%", color: "bg-rose-500" },
    { name: "Mar", h: "85%", color: "bg-emerald-500" },
    { name: "Apr", h: "30%", color: "bg-rose-500" },
    { name: "May", h: "70%", color: "bg-emerald-500" },
    { name: "Iyun", h: "50%", color: "bg-rose-500" },
    { name: "Iyul", h: "90%", color: "bg-emerald-500" }, // 2027 kelsa shunchaki pastiga qo'shib ketasiz
  ];

  return (
    <div className="min-h-screen bg-[#F0F2F5] p-6 md:p-10 font-sans">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Moliya Markazi</h1>
        <button className="bg-[#4F5BD5] text-white px-6 py-3 rounded-2xl font-bold hover:scale-105 transition shadow-lg shadow-indigo-100">
          + Yangi
        </button>
      </div>

      {/* 3 TA CARD (TABS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        
        {/* Balans Card */}
        <div 
          onClick={() => setActiveTab("total")}
          className={`p-8 rounded-[35px] cursor-pointer transition-all ${activeTab === 'total' ? 'bg-[#0F172A] text-white ring-4 ring-indigo-400 scale-105' : 'bg-white text-slate-400 border border-slate-100 shadow-sm'}`}
        >
          <Wallet className={activeTab === 'total' ? 'text-indigo-400' : 'text-slate-300'} />
          <p className="text-[10px] font-black uppercase mt-4 tracking-widest">Balans</p>
          <h2 className={`text-3xl font-black mt-1 ${activeTab === 'total' ? 'text-white' : 'text-slate-800'}`}>$7,450</h2>
        </div>

        {/* Kirim Card */}
        <div 
          onClick={() => setActiveTab("income")}
          className={`p-8 rounded-[35px] cursor-pointer transition-all ${activeTab === 'income' ? 'bg-white ring-4 ring-emerald-400 scale-105 shadow-xl' : 'bg-white border border-slate-100 text-slate-400 opacity-60'}`}
        >
          <TrendingUp className="text-emerald-500" />
          <p className="text-[10px] font-black uppercase mt-4 tracking-widest">Kirim</p>
          <h2 className="text-3xl font-black mt-1 text-slate-800">$2,000</h2>
        </div>

        {/* Chiqim Card */}
        <div 
          onClick={() => setActiveTab("expense")}
          className={`p-8 rounded-[35px] cursor-pointer transition-all ${activeTab === 'expense' ? 'bg-white ring-4 ring-rose-400 scale-105 shadow-xl' : 'bg-white border border-slate-100 text-slate-400 opacity-60'}`}
        >
          <TrendingDown className="text-rose-500" />
          <p className="text-[10px] font-black uppercase mt-4 tracking-widest">Chiqim</p>
          <h2 className="text-3xl font-black mt-1 text-slate-800">$1,195</h2>
        </div>
      </div>

      {/* PASTI: ALMASHADIGAN QISM */}
      <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100 overflow-hidden">
        
        {activeTab === "total" ? (
          /* 📊 GRAFIKA CHIQADI */
          <div className="animate-in fade-in duration-500">
            <div className="flex items-center gap-2 mb-10">
              <BarChart3 className="text-indigo-500" />
              <h3 className="font-black text-xl text-slate-800">Oylik Pul Oqimi</h3>
            </div>
            
            <div className="flex items-end justify-between h-[250px] gap-2 px-4 border-b border-slate-100 pb-2">
              {months.map((m, i) => (
                <div key={i} className="flex flex-col items-center flex-1 group">
                  <div 
                    className={`${m.color} w-full max-w-[30px] rounded-t-xl transition-all duration-300 group-hover:scale-110 group-hover:brightness-110 shadow-lg`} 
                    style={{ height: m.h }}
                  ></div>
                  <span className="text-[10px] font-black text-slate-400 mt-4 uppercase tracking-tighter">{m.name}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* 📑 RO'YXAT CHIQADI */
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            <h3 className="font-black text-xl text-slate-800 mb-6 uppercase italic">
              {activeTab === "income" ? "Barcha Kirimlar" : "Barcha Chiqimlar"}
            </h3>
            
            <div className="space-y-4">
              {myData.map((item) => {
                // Faqat tanlangan turdagi narsalarni ko'rsatadi
                const typeToView = activeTab === "income" ? "kirim" : "chiqim";
                if (item.type !== typeToView) return null;

                return (
                  <div key={item.id} className="flex justify-between items-center p-6 bg-slate-50 rounded-[25px] border border-transparent hover:border-indigo-100 transition group">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl ${item.type === 'kirim' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                        {item.type === 'kirim' ? <TrendingUp size={20}/> : <TrendingDown size={20}/>}
                      </div>
                      <div>
                        <p className="font-black text-slate-800">{item.name}</p>
                        <p className="text-[10px] font-bold text-slate-400">{item.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-xl font-black ${item.type === 'kirim' ? 'text-emerald-500' : 'text-slate-800'}`}>
                        {item.type === 'kirim' ? '+' : '-'}${item.amount}
                      </span>
                      <ArrowRight className="text-slate-200 group-hover:text-slate-400 transition" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default BudgetUI;