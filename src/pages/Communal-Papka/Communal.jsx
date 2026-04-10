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
  X, // X ikonkasini qo'shdik
} from "lucide-react";
import { FaRightLong } from "react-icons/fa6";
import instance from "../../utils/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

const Communal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    dateOfPayment: "",
    sum: "",
    note: "",
  });

  const nav = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const config = {
    Электроэнергия: {
      icon: <Zap size={22} />,
      color: "#FBBF24",
      bg: "#FEF3C7",
    },
    "Горячая Вода": {
      icon: <Droplets size={22} />,
      color: "#F97316",
      bg: "#FFEDD5",
    },
    "Холодная Вода": {
      icon: <Waves size={22} />,
      color: "#3B82F6",
      bg: "#DBEAFE",
    },
    Газ: { icon: <Flame size={22} />, color: "#F43F5E", bg: "#FFE4E6" },
    Мусор: { icon: <Trash2 size={22} />, color: "#10B981", bg: "#D1FAE5" },
    "Коммунальный Налог": {
      icon: <Receipt size={22} />,
      color: "#6366F1",
      bg: "#E0E7FF",
    },
    "Земельный Налог": {
      icon: <Landmark size={22} />,
      color: "#64748B",
      bg: "#F1F5F9",
    },
    "Налог на Имущество": {
      icon: <Home size={22} />,
      color: "#8B5CF6",
      bg: "#EDE9FE",
    },
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

  async function handlePost(newdata) {
    instance.post("/communal", newdata);
    queryClient.invalidateQueries(["getCommunal"]);
  }

  const mutation = useMutation({
    mutationFn: handlePost,
    onSuccess: () => {
      alert("Communal created");
      nav("/communal");
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  
  const filterElektr = data?.filter((Elektr) => Elektr.title == "Электроэнергия").at(-1)
  const filterIssiqSuv = data?.filter((IssiqSuv) => IssiqSuv.title == "Горячая вода").at(-1)
  const filterSovuqSuv = data?.filter((SovuqSuv) => SovuqSuv.title == "Холодная вода").at(-1)
  const filterGaz = data?.filter((Gaz) => Gaz.title == "Газ").at(-1)
  const filterMusor = data?.filter((Musor) => Musor.title == "Мусор").at(-1)
  const filterKomOplata = data?.filter((KomOplata) => KomOplata.title == "Коммунальный налог").at(-1)
  const filterZemelniyNalog = data?.filter((ZemelniyNalog) => ZemelniyNalog.title == "Земельный налог").at(-1)
  const filterNalogImushestvo = data?.filter((NalogImushestvo) => NalogImushestvo.title == "Налог на имущество").at(-1)
  const filterElektroZaryad = data?.filter((ElektroZaryad) => ElektroZaryad.title == "Электро-зарядка").at(-1)

  const utilityCategories = [
    filterElektr, filterIssiqSuv, filterSovuqSuv, filterGaz, filterMusor, filterKomOplata, filterZemelniyNalog, filterNalogImushestvo, filterElektroZaryad
  ];

  if (isLoading) return <h1 className="text-white text-lg">Loading ...</h1>;
  if (error) return <h1>{error.message}</h1>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-10 font-sans relative">
      {/* 🟢 MODAL (OYNA) - BU QISM YANGI QO'SHILDI */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Orqa fon (Blur) */}
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          ></div>

          {/* Modal Kontenti */}
          <div className="relative bg-white w-full max-w-lg rounded-[32px] shadow-2xl p-8 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-slate-800">Новый чек</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={24} className="text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Название услуги */}
              <input
                {...register("title", {
                  required: "Sarlavha yozish majburiy!",
                })}
                type="text"
                placeholder="Услуга (напр. Газ)"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
              {errors.title && (
                <p className="text-red-500">{errors.title.message}</p>
              )}

              {/* Дата создания - HUDDI SIZDAGI MANTIQDA */}
              <input
                {...register("dateOfPayment", {
                  required: "Sana tanlanishi shart!",
                })}
                type="text"
                placeholder="Дата создания"
                onFocus={(e) => (e.target.type = "date")}
                onBlur={(e) => {
                  if (!e.target.value) e.target.type = "text";
                }}
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
              />
              {errors.createdAt && (
                <p className="text-red-500">{errors.createdAt.message}</p>
              )}

              {/* Сумма */}
              <input
                {...register("sum", {
                  required: "Summani kiriting",
                  min: {
                    value: 1000,
                    message: "Summa 1000 so'mdan kam bo'lmasligi kerak",
                  },
                })}
                type="number"
                placeholder="Сумма"
                value={form.sum}
                onChange={(e) => setForm({ ...form, sum: e.target.value })}
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
              {errors.sum && (
                <p className="text-red-500">{errors.sum.message}</p>
              )}

              {/* Комментарий */}
              <textarea
                {...register("note")}
                placeholder="Комментарий"
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all h-24 resize-none"
              />

              <button className="w-full bg-[#4F5BD5] text-white py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 mt-4">
                Сохранить
              </button>
            </form>
          </div>
        </div>
      )}

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

        {/* Tugmaga onClick qo'shildi */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="group relative flex items-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-[22px] font-black tracking-wide overflow-hidden transition-all duration-300 hover:bg-indigo-700 hover:shadow-[0_20px_40px_rgba(79,91,213,0.4)] active:scale-95"
        >
          {/* Chiroyli nurli effekt (Glow) */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

          <div className="relative flex items-center gap-3">
            <div className="bg-white/20 p-1.5 rounded-xl group-hover:rotate-90 transition-transform duration-500">
              <Plus size={20} strokeWidth={3} />
            </div>
            <span className="text-sm uppercase tracking-widest">
              Добавить чек
            </span>
          </div>
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {utilityCategories.map((cat) => {
          const itemConfig = config[cat.name];
          return (
            <div
              key={cat.id}
              className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm hover:shadow-lg transition-all group min-h-[190px] flex flex-col justify-between"
            >
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
                      {cat.sumu}{" "}
                      <small className="text-[11px] font-semibold text-slate-400">
                        сум
                      </small>
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-slate-500 text-[11px] uppercase tracking-[0.2em] mb-1">
                  {cat.title}
                </h3>
              </div>
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

      {/* RECENT RECEIPTS AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl rounded-[48px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-white overflow-hidden transition-all duration-500 hover:shadow-[0_30px_70px_-10px_rgba(79,91,213,0.1)]">
          {/* Header: Sarlavha va Actionlar */}
          <div className="p-10 pb-6 flex justify-between items-end">
            <div>
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-500 mb-2 block">
                Транзакции
              </span>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                История <span className="text-slate-400">платежей</span>
              </h3>
            </div>

            <div className="flex gap-3">
              <button className="w-12 h-12 flex items-center justify-center bg-slate-50 text-slate-400 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-300 group">
                <Search
                  size={20}
                  className="group-hover:scale-110 transition-transform"
                />
              </button>
              <button className="w-12 h-12 flex items-center justify-center bg-slate-50 text-slate-400 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-300 group">
                <Filter
                  size={20}
                  className="group-hover:scale-110 transition-transform"
                />
              </button>
            </div>
          </div>

          {/* Receipts List: Har bir element modern qilingan */}
          <div className="px-8 pb-4 space-y-4">
            {recentReceipts.map((receipt) => {
              const itemStyle = config[receipt.service] || {
                icon: <FileText size={22} />,
                color: "#94a3b8",
                bg: "#f1f5f9",
              };

              return (
                <div
                  key={receipt.id}
                  className="group relative flex items-center justify-between p-6 rounded-[32px] bg-slate-50/50 hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-[0_15px_35px_-5px_rgba(0,0,0,0.05)] transition-all duration-500"
                >
                  {/* Chap tomon: Icon va Text */}
                  <div className="flex items-center gap-6">
                    <div
                      className="w-16 h-16 rounded-[24px] flex items-center justify-center transition-all duration-700 group-hover:rotate-[10deg] group-hover:scale-110 shadow-sm"
                      style={{
                        backgroundColor: itemStyle.bg,
                        color: itemStyle.color,
                      }}
                    >
                      {/* Ikonka atrofida kichik effekt */}
                      <div className="relative">
                        {itemStyle.icon}
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full scale-0 group-hover:scale-100 transition-transform duration-500"></div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-800 text-lg mb-1 group-hover:text-indigo-600 transition-colors">
                        {receipt.service}
                      </h4>
                      <div className="flex items-center gap-3">
                        <p className="text-xs font-bold text-slate-400">
                          {receipt.date}
                        </p>
                        <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                          Выполнено
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* O'ng tomon: Summa va Navigatsiya */}
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <span className="block font-black text-xl text-slate-900 tracking-tighter">
                        {receipt.amount}
                        <span className="text-[10px] ml-1.5 text-slate-400 font-bold">
                          UZS
                        </span>
                      </span>
                    </div>

                    <button className="w-12 h-12 flex items-center justify-center bg-white text-slate-300 group-hover:bg-indigo-600 group-hover:text-white rounded-[18px] transition-all duration-500 shadow-sm border border-slate-100 group-hover:border-indigo-600 group-hover:-translate-x-1">
                      <FaRightLong size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Section */}
          <div className="p-8 pt-4">
            <button
              onClick={() => nav("/communal/all")}
              className="group relative w-full py-5 rounded-[28px] bg-indigo-600 overflow-hidden transition-all duration-300 shadow-lg shadow-indigo-200 hover:shadow-indigo-400/40 active:scale-[0.98]"
            >
              {/* Gradient fon - Doim ko'rinib turadi, hoverda suriladi */}
              <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-indigo-600 via-purple-500 to-indigo-600 -translate-x-[30%] group-hover:translate-x-0 transition-transform duration-700 ease-in-out"></div>

              {/* Tugma matni va ikonka */}
              <div className="relative z-10 flex items-center justify-center gap-3 text-sm font-black uppercase tracking-[0.2em] text-white">
                <span>Показать все чеки</span>
                <FaRightLong className="group-hover:translate-x-2 transition-transform duration-300" />
              </div>
            </button>
          </div>
        </div>

        {/* O'ng tomon uchun qo'shimcha "Quick Stats" Card (Bento uslubida) */}
        <div className="bg-indigo-600 rounded-[48px] p-10 text-white shadow-2xl shadow-indigo-200 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>

          <div className="relative z-10">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8">
              <Receipt size={28} />
            </div>
            <h3 className="text-2xl font-black mb-2">Аналитика</h3>
            <p className="text-indigo-100/70 text-sm font-medium leading-relaxed">
              Ваши расходы на коммунальные услуги снизились на 5% по сравнению с
              прошлым месяцем.
            </p>
          </div>

          <div className="relative z-10 mt-12 pt-8 border-t border-white/10">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-1">
                  Итого за месяц
                </p>
                <p className="text-3xl font-black">
                  1,240,000{" "}
                  <small className="text-xs opacity-60 font-bold">сум</small>
                </p>
              </div>
              <div className="bg-emerald-400 text-slate-900 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter shadow-lg shadow-emerald-500/20">
                -5.2%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Communal;
