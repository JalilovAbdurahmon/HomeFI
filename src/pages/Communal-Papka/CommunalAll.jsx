import React, { useMemo, useState } from "react";
import {
  Search,
  Filter,
  ArrowLeft,
  Download,
  Calendar,
  FileText,
  Zap,
  Droplets,
  Waves,
  Flame,
  Trash2,
  Receipt,
  Landmark,
  Home,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import instance from "../../utils/axios";

const CommunalAll = () => {
  const nav = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  // Kodingizdagi mavjud config
  const config = {
    Электроэнергия: {
      icon: <Zap size={20} />,
      color: "#FBBF24",
      bg: "#FEF3C7",
    },
    "Горячая Вода": {
      icon: <Droplets size={20} />,
      color: "#F97316",
      bg: "#FFEDD5",
    },
    "Холодная Вода": {
      icon: <Waves size={20} />,
      color: "#3B82F6",
      bg: "#DBEAFE",
    },
    Газ: { icon: <Flame size={20} />, color: "#F43F5E", bg: "#FFE4E6" },
    Мусор: { icon: <Trash2 size={20} />, color: "#10B981", bg: "#D1FAE5" },
    "Коммунальный Налог": {
      icon: <Receipt size={20} />,
      color: "#6366F1",
      bg: "#E0E7FF",
    },
    "Земельный Налог": {
      icon: <Landmark size={20} />,
      color: "#64748B",
      bg: "#F1F5F9",
    },
    "Налог на Имущество": {
      icon: <Home size={20} />,
      color: "#8B5CF6",
      bg: "#EDE9FE",
    },
  };

  const { data: allData = [], isLoading } = useQuery({
    queryKey: ["getCommunal"],
    queryFn: async () => {
      const res = await instance.get("/communal");
      return res.data;
    },
  });

  // Qidiruv mantiqi
  const filteredData = useMemo(() => {
    return allData
      .filter((item) =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [allData, searchTerm]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-12 font-sans">
      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-10">
        <button
          onClick={() => nav(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors mb-6 font-bold text-sm uppercase tracking-widest"
        >
          <ArrowLeft size={18} /> Назад
        </button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
              Все транзакции
            </h1>
            <p className="text-slate-500 font-medium text-lg">
              Полный список ваших коммунальных платежей
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Поиск по услугам..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-[22px] focus:outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-sm"
              />
            </div>
            <button className="p-4 bg-white border border-slate-100 rounded-[22px] text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
              <Filter size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="max-w-7xl mx-auto bg-white rounded-[40px] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-bottom border-slate-100">
                <th className="px-8 py-6 text-left text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Услуга
                </th>
                <th className="px-8 py-6 text-left text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Дата платежа
                </th>
                <th className="px-8 py-6 text-left text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Примечание
                </th>
                <th className="px-8 py-6 text-right text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Сумма
                </th>
                <th className="px-8 py-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredData.map((item) => {
                const style = config[item.title] || {
                  icon: <FileText />,
                  color: "#94a3b8",
                  bg: "#f1f5f9",
                };
                return (
                  <tr
                    key={item._id}
                    className="group hover:bg-slate-50/80 transition-all duration-300"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform"
                          style={{
                            backgroundColor: style.bg,
                            color: style.color,
                          }}
                        >
                          {style.icon}
                        </div>
                        <span className="font-bold text-slate-800 text-lg tracking-tight">
                          {item.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-slate-500 font-bold">
                        <Calendar size={16} className="text-slate-300" />
                        {new Date(item.createdAt).toLocaleDateString("ru-RU", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-slate-400 font-medium italic max-w-xs block truncate">
                        {item.note || "Нет примечаний"}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex flex-col">
                        <span className="text-xl font-black text-slate-900 leading-none">
                          {Number(item.sum).toLocaleString()}
                        </span>
                        <span className="text-[10px] font-black text-slate-400 uppercase mt-1">
                          UZS
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-300 rounded-xl group-hover:bg-indigo-600 group-hover:text-white group-hover:rotate-[-45deg] transition-all duration-500">
                        <Download size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* EMPTY STATE */}
        {filteredData.length === 0 && (
          <div className="p-20 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
              <Search size={40} />
            </div>
            <h3 className="text-xl font-black text-slate-800">
              Чеки не найдены
            </h3>
            <p className="text-slate-400">
              Попробуйте изменить параметры поиска
            </p>
          </div>
        )}

        {/* FOOTER STATS */}
        <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
          <span className="text-slate-500 font-bold uppercase text-xs tracking-widest">
            Всего записей: {filteredData.length}
          </span>
          <div className="flex items-center gap-3">
            <span className="text-slate-400 font-bold uppercase text-xs tracking-widest">
              Итоговая сумма:
            </span>
            <span className="text-2xl font-black text-indigo-600">
              {filteredData
                .reduce((acc, curr) => acc + Number(curr.sum), 0)
                .toLocaleString()}{" "}
              <small className="text-xs">сум</small>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunalAll;
