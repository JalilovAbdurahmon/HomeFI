import React, { useState } from "react";
import {
  Droplets,
  Flame,
  Zap,
  Plus,
  FileText,
  Download,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  Search,
  Filter,
  Waves,
  Trash2,
  Receipt,
  Landmark,
  Home,
} from "lucide-react";
import {
  FaRightLong,
} from "react-icons/fa6";
import instance from "../utils/axios";
import { useQuery } from "@tanstack/react-query";

const Communal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 🎨 ASOSIY RANG VA IKONKALAR KONFIGURATSIYASI (Yagona manba)
  const config = {
    Электроэнергия: {
      icon: <Zap size={22} />,
      color: "#FBBF24",
      bg: "#FEF3C7",
    }, // Amber
    "Горячая Вода": {
      icon: <Droplets size={22} />,
      color: "#F97316",
      bg: "#FFEDD5",
    }, // Orange
    "Холодная Вода": {
      icon: <Waves size={22} />,
      color: "#3B82F6",
      bg: "#DBEAFE",
    }, // Blue
    Газ: { icon: <Flame size={22} />, color: "#F43F5E", bg: "#FFE4E6" }, // Rose
    Мусор: { icon: <Trash2 size={22} />, color: "#10B981", bg: "#D1FAE5" }, // Emerald
    "Коммунальный Налог": {
      icon: <Receipt size={22} />,
      color: "#6366F1",
      bg: "#E0E7FF",
    }, // Indigo
    "Земельный Налог": {
      icon: <Landmark size={22} />,
      color: "#64748B",
      bg: "#F1F5F9",
    }, // Slate
    "Налог на Имущество": {
      icon: <Home size={22} />,
      color: "#8B5CF6",
      bg: "#EDE9FE",
    }, // Violet
  };

  

  const recentReceipts = [
    { id: 1, service: "Электроэнергия", date: "02.04.2026", amount: "80,000" },
    { id: 2, service: "Газ", date: "28.03.2026", amount: "60,000" },
    {
      id: 3,
      service: "Земельный Налог",
      date: "15.02.2026",
      amount: "120,000",
    },
    { id: 4, service: "Мусор", date: "11.01.2026", amount: "250,000" },
  ];

  async function handleGet() {
    const res = await instance.get("/communal");
    return res.data;
  }

  const { error, isLoading, data } = useQuery({
    queryKey: ["getCommunal"],
    queryFn: handleGet,
  }); 

  if (isLoading) return <h1 className="text-white text-lg">Loading ...</h1>;
  if (error) return <h1>{error.message}</h1>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-10 font-sans">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Коммунальные Услуги
          </h1>
          <p className="text-slate-500 font-medium">
            Контролируйте счета и храните чеки в одном месте.
          </p>
        </div>
        <button className="flex items-center gap-2 bg-[#4F5BD5] text-white px-6 py-3.5 rounded-2xl font-bold hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-200">
          <Plus size={20} />
          <span>Добавить чек</span>
        </button>
      </div>

      {/* 📊 SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {utilityCategories.map((cat) => {
          const itemConfig = config[cat.name];
          return (
            <div
              key={cat.id}
              className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm hover:shadow-lg transition-all group min-h-[190px] flex flex-col justify-between"
            >
              {/* TOP: Icon + Last Payment */}
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-black/5"
                    style={{
                      backgroundColor: itemConfig.bg,
                      color: itemConfig.color,
                    }}
                  >
                    {itemConfig.icon}
                  </div>

                  <div className="flex flex-col leading-tight">
                    <span className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">
                      Последний платёж
                    </span>
                    <span className="text-[20px] font-extrabold text-slate-800">
                      {cat.amount}{" "}
                      <small className="text-[11px] font-semibold text-slate-400">
                        сум
                      </small>
                    </span>
                  </div>
                </div>
              </div>

              {/* CATEGORY */}
              <div>
                <h3 className="font-bold text-slate-500 text-[11px] uppercase tracking-[0.2em] mb-1">
                  {cat.name}
                </h3>
              </div>

              {/* BOTTOM */}
              <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">
                    Итог за год
                  </span>
                  <span className="text-[15px] font-extrabold text-slate-800">
                    {cat.totalSum}{" "}
                    <small className="text-[10px] text-slate-400">сум</small>
                  </span>
                </div>

                <button className="p-3 text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all">
                  <FaRightLong size={18} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 📜 RECENT RECEIPTS */}
        <div className="lg:col-span-2 bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 flex justify-between items-center border-b border-slate-50">
            <h3 className="text-xl font-black text-slate-800">
              История платежей
            </h3>
            <div className="flex gap-2">
              <button className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-indigo-500 transition">
                <Search size={20} />
              </button>
              <button className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-indigo-500 transition">
                <Filter size={20} />
              </button>
            </div>
          </div>

          <div className="p-4 space-y-3">
            {recentReceipts.map((receipt) => {
              const itemStyle = config[receipt.service] || {
                icon: <FileText size={22} />,
                color: "#94a3b8",
                bg: "#f1f5f9",
              };
              return (
                <div
                  key={receipt.id}
                  className="flex items-center justify-between p-5 rounded-[28px] hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group"
                >
                  <div className="flex items-center gap-5">
                    {/* BU YERDA RANG VA IKONKA ENDI ANIQ CHIQADI */}
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105"
                      style={{
                        backgroundColor: itemStyle.bg,
                        color: itemStyle.color,
                      }}
                    >
                      {itemStyle.icon}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-800 tracking-tight">
                        {receipt.service}
                      </h4>
                      <p className="text-xs font-bold text-slate-400">
                        {receipt.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="font-black text-lg text-slate-800">
                      {receipt.amount} сум
                    </span>
                    <button className="p-3 text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all">
                      <FaRightLong size={20} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          {/* 👇 BUTTON */}
          <div className="flex justify-center pb-6">
            <button className="px-6 py-3 rounded-2xl font-semibold text-sm text-white bg-indigo-500 hover:bg-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md">
              Показать все чеки
            </button>
          </div>
        </div>

        {/* ☁️ UPLOAD AREA */}
        <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-[40px] p-8 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-[50px] rounded-full" />
          <div className="relative z-10">
            <h3 className="text-xl font-black mb-2">Быстрая загрузка</h3>
            <p className="text-indigo-200/60 text-sm font-medium mb-8">
              Перетащите ваш чек сюда для распознавания.
            </p>
            <div className="border-2 border-dashed border-white/10 rounded-[30px] p-10 flex flex-col items-center justify-center group hover:border-indigo-400/50 transition-colors cursor-pointer bg-white/5 backdrop-blur-sm">
              <UploadCloud className="text-indigo-400 mb-4" size={32} />
              <p className="text-sm font-bold">Нажмите или перетащите</p>
            </div>
            <div className="mt-8 space-y-4 text-xs font-bold">
              <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl">
                <CheckCircle2 className="text-emerald-400" size={18} />{" "}
                Авто-распознавание
              </div>
              <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl">
                <AlertCircle className="text-amber-400" size={18} /> Безопасное
                хранение
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Communal;
