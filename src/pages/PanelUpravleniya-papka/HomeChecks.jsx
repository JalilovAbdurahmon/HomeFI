import React, { useState, useMemo } from 'react';
import { 
  ArrowUp, 
  ArrowDown, 
  Edit2, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Calendar,
  Wallet
} from 'lucide-react';

const TransactionHistory = ({ homeChecks = [], onUpdate, onDelete }) => {
  // 1. Holatlar (States)
  const [activeTab, setActiveTab] = useState('expense'); // Sahifaga kirganda birinchi RASXODI turadi
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(6);

  // 2. Filtrlash Mantiqi: Home pagedan kelgan ma'lumotni turiga qarab ajratamiz
  const filteredData = useMemo(() => {
    return homeChecks.filter(check => check.type === activeTab);
  }, [homeChecks, activeTab]);

  // 3. Pagination hisob-kitobi
  const totalPages = Math.ceil(filteredData.length / limit) || 1;
  const startIndex = (currentPage - 1) * limit;
  const paginatedData = filteredData.slice(startIndex, startIndex + limit);

  // Tab o'zgarganda sahifani 1-ga qaytarish
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen font-sans">
      
      {/* --- HEADER QISMI --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100">
              <Wallet className={activeTab === 'income' ? 'text-green-500' : 'text-red-500'} size={24} />
            </div>
            <h1 className="text-2xl font-black uppercase italic text-[#1E293B] tracking-tight">ИСТОРИЯ ТРАНЗАКЦИЙ</h1>
          </div>
          <p className="text-gray-400 text-sm font-medium">История всех денежных поступлений и расходов</p>
        </div>

        {/* --- SWITCHER (PRIXOD / RASXOD) --- */}
        <div className="bg-gray-200/70 p-1.5 rounded-full flex w-full md:w-[400px] shadow-inner backdrop-blur-sm">
          <button 
            onClick={() => handleTabChange('expense')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full font-bold uppercase transition-all duration-300 ${
              activeTab === 'expense' 
              ? 'bg-[#EF4444] text-white shadow-lg transform scale-[1.02]' 
              : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <ArrowDown size={18} /> Расходы
          </button>
          <button 
            onClick={() => handleTabChange('income')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full font-bold uppercase transition-all duration-300 ${
              activeTab === 'income' 
              ? 'bg-[#22C55E] text-white shadow-lg transform scale-[1.02]' 
              : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <ArrowUp size={18} /> Приходы
          </button>
        </div>
      </div>

      {/* --- JADVAL KONTEYNERI --- */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 uppercase text-[11px] font-black text-gray-400 tracking-[0.15em]">
                <th className="pb-6 px-4">Информация о чеке</th>
                <th className="pb-6 px-4 text-center">Сумма</th>
                <th className="pb-6 px-4">Дата оплаты</th>
                <th className="pb-6 px-4 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginatedData.length > 0 ? (
                paginatedData.map((item) => (
                  <tr key={item.id} className="group hover:bg-gray-50/50 transition-all duration-200">
                    <td className="py-7 px-4">
                      <p className="font-extrabold text-[#1E293B] text-lg uppercase tracking-tight">{item.text}</p>
                      <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase mt-1">
                        <span className="bg-gray-100 px-2 py-0.5 rounded">ID: {item.id}2026</span>
                        <span>•</span>
                        <span className="italic">Электронный чек</span>
                      </div>
                    </td>
                    <td className="py-7 px-4 text-center">
                      <p className={`text-2xl font-black italic tracking-tighter ${item.type === 'income' ? 'text-[#22C55E]' : 'text-[#1E293B]'}`}>
                        {item.type === 'income' ? '+' : '-'} {item.amount?.toLocaleString()} 
                        <span className="text-[10px] not-italic text-gray-400 ml-1 font-bold">UZS</span>
                      </p>
                    </td>
                    <td className="py-7 px-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-700 flex items-center gap-1.5">
                          <Calendar size={14} className="text-gray-400" /> {item.date}
                        </span>
                        <span className="text-[10px] text-red-500 font-black uppercase mt-1">-15% НДС включено</span>
                      </div>
                    </td>
                    <td className="py-7 px-4 text-right">
                      <div className="flex justify-end gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => onUpdate && onUpdate(item)}
                          className="p-3 border border-blue-100 rounded-2xl text-blue-500 hover:bg-blue-50 hover:border-blue-200 transition-all active:scale-95"
                        >
                          <Edit2 size={18}/>
                        </button>
                        <button 
                          onClick={() => onDelete && onDelete(item.id)}
                          className="p-3 border border-red-100 rounded-2xl text-red-500 hover:bg-red-50 hover:border-red-200 transition-all active:scale-95"
                        >
                          <Trash2 size={18}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-32 text-center">
                    <div className="flex flex-col items-center opacity-20">
                      <Wallet size={64} className="mb-4" />
                      <p className="text-2xl font-black uppercase italic tracking-widest text-gray-400">Данные отсутствуют</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* --- PAGINATION & LIMIT --- */}
        <div className="mt-12 flex flex-col sm:flex-row justify-between items-center gap-6 px-4">
          <div className="flex items-center gap-4 bg-gray-50/80 p-1.5 px-4 rounded-2xl border border-gray-100">
            <p className="text-[11px] font-black uppercase text-gray-400 tracking-wider">Лимит:</p>
            <select 
              value={limit} 
              onChange={(e) => {setLimit(Number(e.target.value)); setCurrentPage(1);}}
              className="bg-transparent border-none text-sm font-bold focus:ring-0 cursor-pointer text-[#1E293B] outline-none"
            >
              <option value={4}>4</option>
              <option value={6}>6</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
             <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-3 border border-gray-100 rounded-2xl hover:bg-gray-50 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
             >
                <ChevronLeft size={20}/>
             </button>
             
             {[...Array(totalPages)].map((_, i) => (
               <button 
                 key={i}
                 onClick={() => setCurrentPage(i + 1)}
                 className={`w-11 h-11 rounded-2xl text-sm font-black transition-all duration-200 ${
                   currentPage === i + 1 
                   ? 'bg-[#1E293B] text-white shadow-xl transform scale-105' 
                   : 'text-gray-400 hover:bg-gray-100'
                 }`}
               >
                 {i + 1}
               </button>
             ))}

             <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-3 border border-gray-100 rounded-2xl hover:bg-gray-50 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
             >
                <ChevronRight size={20}/>
             </button>
          </div>

          <div className="bg-[#f0fdf4] text-[#16a34a] px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 border border-[#dcfce7] shadow-sm">
            <span className="w-2 h-2 bg-[#22c55e] rounded-full animate-pulse"></span>
            Страница {currentPage} / {totalPages}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;