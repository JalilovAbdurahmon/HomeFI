import React, { useState } from "react";
import {
  Droplets,
  Flame,
  Zap,
  Plus,
  Waves,
  Trash2,
  Receipt,
  Landmark,
  Home,
  Search,
  Filter,
  X,
} from "lucide-react";
import { FaRightLong } from "react-icons/fa6";
import instance from "../../utils/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

const Communal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dateInputType, setDateInputType] = useState("text");

  const nav = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const config = {
    Электроэнергия: {
      icon: <Zap size={22} />,
      color: "#FBBF24",
      bg: "#FEF3C7",
    },
    "Горячая вода": {
      icon: <Droplets size={22} />,
      color: "#F97316",
      bg: "#FFEDD5",
    },
    "Холодная вода": {
      icon: <Waves size={22} />,
      color: "#3B82F6",
      bg: "#DBEAFE",
    },
    Газ: { icon: <Flame size={22} />, color: "#F43F5E", bg: "#FFE4E6" },
    Мусор: { icon: <Trash2 size={22} />, color: "#10B981", bg: "#D1FAE5" },
    "Коммунальный налог": {
      icon: <Receipt size={22} />,
      color: "#6366F1",
      bg: "#E0E7FF",
    },
    "Земельный налог": {
      icon: <Landmark size={22} />,
      color: "#64748B",
      bg: "#F1F5F9",
    },
    "Налог на имущество": {
      icon: <Home size={22} />,
      color: "#8B5CF6",
      bg: "#EDE9FE",
    },
  };

  // 🟢 Backenddan ma'lumot olish (Pagination obyekt qaytaradi)
  const {
    error,
    isLoading,
    data: serverResponse,
  } = useQuery({
    queryKey: ["getCommunal"],
    queryFn: async () => {
      const res = await instance.get("/communal?limit=1000"); // Dashboard uchun ko'proq ma'lumot olamiz
      return res.data;
    },
  });

  // 🟢 Massivni obyekt ichidan sug'urib olamiz
  const actualData = serverResponse?.data || [];

  const uniqueServices =
    actualData.length > 0
      ? Array.from(
          new Map(
            actualData.map((item) => [
              item.titleCommunal?._id,
              item.titleCommunal?.title,
            ])
          ).entries()
        ).map(([_id, title]) => ({ _id, title }))
      : [];

  const recentReceipts = actualData
    ?.slice()
    ?.sort((a, b) => new Date(b.dateOfPayment) - new Date(a.dateOfPayment))
    ?.slice(0, 5);

  const utilityCategories = Object.keys(config).map((title) => {
    const items = actualData?.filter(
      (item) => item.titleCommunal?.title === title
    );
    const sorted = items
      ?.slice()
      .sort((a, b) => new Date(b.dateOfPayment) - new Date(a.dateOfPayment));
    const last = sorted?.[0];
    const totalSum = items?.reduce((acc, curr) => {
      const year = new Date(curr.dateOfPayment).getFullYear();
      const currentYear = new Date().getFullYear();
      return year === currentYear ? acc + curr.sum : acc;
    }, 0);

    return {
      title,
      sum: last?.sum || 0,
      totalSum: totalSum || 0,
      lastDate: last?.dateOfPayment,
    };
  });

  const handleFilterNavigate = (title) => {
    nav(`/communal/all/${encodeURIComponent(title)}`);
  };

  const mutation = useMutation({
    mutationFn: async (newdata) => {
      const payload = { ...newdata, sum: Number(newdata.sum) };
      return await instance.post("/communal", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["getCommunal"]);
      setIsModalOpen(false);
      reset();
    },
  });

  const onSubmit = (formData) => {
    mutation.mutate(formData);
  };

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <h1 className="text-2xl font-black text-indigo-600 animate-pulse uppercase tracking-tighter italic">
          Загрузка Dashboard...
        </h1>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-10 font-sans relative">
      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          ></div>
          <div className="relative bg-white w-full max-w-lg rounded-[32px] shadow-2xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-slate-800">Новый чек</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full"
              >
                <X size={24} className="text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <select
                {...register("titleCommunal", { required: true })}
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700"
              >
                <option value="">Выберите услуgu</option>
                {/* Agar uniqueServices bo'sh bo'lsa, xato bermasligi uchun */}
                {uniqueServices.length > 0
                  ? uniqueServices.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.title}
                      </option>
                    ))
                  : Object.keys(config).map((title) => (
                      <option key={title} value={title}>
                        {title}
                      </option>
                    ))}
              </select>
              <input
                {...register("dateOfPayment", { required: true })}
                type={dateInputType}
                placeholder="Дата платежа"
                onFocus={() => setDateInputType("date")}
                onBlur={(e) => !e.target.value && setDateInputType("text")}
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700"
              />
              <input
                {...register("sum", { required: true })}
                type="number"
                placeholder="Сумма"
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700"
              />
              <textarea
                {...register("desc")}
                placeholder="Комментарий"
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl h-24 resize-none outline-none font-medium"
              />
              <button
                type="submit"
                disabled={mutation.isPending}
                className="w-full bg-[#4F5BD5] text-white py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg mt-4 disabled:opacity-50 active:scale-95"
              >
                {mutation.isPending ? "Сохранение..." : "Сохранить чек"}
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
        <button
          onClick={() => setIsModalOpen(true)}
          className="group relative flex items-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-[22px] font-black tracking-wide transition-all hover:bg-indigo-700 active:scale-95 shadow-xl shadow-indigo-100"
        >
          <Plus size={20} strokeWidth={3} />
          <span className="text-sm uppercase tracking-widest">
            Добавить чек
          </span>
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {utilityCategories.map((cat) => {
          const itemConfig = config[cat?.title];
          return (
            <div
              key={cat.title}
              className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm hover:shadow-lg transition-all min-h-[190px] flex flex-col justify-between group"
            >
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-black/5 transform group-hover:scale-110 transition-transform"
                    style={{
                      backgroundColor: itemConfig?.bg,
                      color: itemConfig?.color,
                    }}
                  >
                    {itemConfig?.icon}
                  </div>
                  <div className="flex flex-col leading-tight">
                    <span className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">
                      Последний платёж
                    </span>
                    <span className="text-[20px] font-extrabold text-slate-800">
                      {cat?.sum.toLocaleString()}{" "}
                      {/* <small className="text-[11px] font-semibold text-slate-400 uppercase">
                        сум
                      </small> */}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-slate-500 text-[13px] uppercase tracking-[0.2em] mb-1">
                  {cat?.title}
                </h3>
                <div className="border-t border-slate-50 pt-4 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-300 font-semibold uppercase">
                      Итог за год
                    </span>
                    <span className="text-[15px] text-slate-800">
                      {cat?.totalSum.toLocaleString()}{" "}
                      <small className="text-[10px] text-slate-400 uppercase">
                        сум
                      </small>
                    </span>
                  </div>
                  <button
                    onClick={() => handleFilterNavigate(cat.title)}
                    className="p-3 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                  >
                    <FaRightLong size={18} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* RECENT RECEIPTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl rounded-[40px] shadow-sm border border-white overflow-hidden p-8">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-6">
            История <span className="text-slate-300">платежей</span>
          </h3>
          <div className="space-y-3">
            {recentReceipts?.length > 0 ? (
              recentReceipts.map((receipt) => {
                const itemStyle = config[receipt.titleCommunal?.title] || {};
                return (
                  <div
                    key={receipt._id}
                    className="flex items-center justify-between p-4 rounded-[24px] bg-slate-50/50 hover:bg-white border border-transparent hover:border-slate-100 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      {/* Ikonka razmeri kichraytirildi (w-16 -> w-12) */}
                      <div
                        className="w-12 h-12 rounded-[18px] flex items-center justify-center shadow-sm"
                        style={{
                          backgroundColor: itemStyle?.bg,
                          color: itemStyle?.color,
                        }}
                      >
                        {/* Lucide icon razmeri ham kichraytirildi */}
                        {React.cloneElement(itemStyle?.icon, { size: 18 })}
                      </div>
                      <div>
                        {/* Sarlavha razmeri (text-lg -> text-sm) */}
                        <h4 className="font-bold text-slate-800 text-sm mb-0.5">
                          {receipt.titleCommunal?.title}
                        </h4>
                        {/* Sana razmeri (text-[11px] -> text-[10px]) */}
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {formatDate(receipt.dateOfPayment)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {/* Summa razmeri (text-xl -> text-base) */}
                      <span className="font-black text-base text-slate-900">
                        {receipt.sum.toLocaleString()}{" "}
                        <span className="text-[9px] text-slate-400 uppercase font-bold">
                          UZS
                        </span>
                      </span>
                      {/* Tugma razmeri (w-12 -> w-9) */}
                      <button
                        onClick={() =>
                          handleFilterNavigate(receipt.titleCommunal?.title)
                        }
                        className="w-9 h-9 flex items-center justify-center bg-white text-slate-300 hover:bg-indigo-600 hover:text-white rounded-xl transition-all shadow-sm"
                      >
                        <FaRightLong size={14} />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center py-10 text-slate-400 text-sm font-bold italic">
                Платежи пока отсутствуют
              </p>
            )}
          </div>

          {/* "Показать все чеки" tugmasi ham biroz ixchamlashtirildi */}
          <button
            onClick={() => nav("/communal/all")}
            className="w-full mt-8 py-4 rounded-[22px] bg-indigo-600 text-white font-black uppercase text-[11px] tracking-[0.2em] hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 shadow-lg shadow-indigo-100 active:scale-95"
          >
            <span>Показать все чеki</span> <FaRightLong size={14} />
          </button>
        </div>

        {/* ANALYTICS */}
        <div className="bg-indigo-600 rounded-[48px] p-10 text-white shadow-2xl flex flex-col justify-between overflow-hidden relative">
          <div className="relative z-10">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-8 border border-white/10">
              <Receipt size={28} />
            </div>
            <h3 className="text-2xl font-black mb-3">Аналитика</h3>
            <p className="text-indigo-100/70 text-sm leading-relaxed font-medium">
              Ваши расходы под контролем. Система автоматически группирует чеки
              и считает годовой бюджет.
            </p>
          </div>
          <div className="mt-10 p-6 bg-white/10 rounded-3xl border border-white/10">
            <p className="text-[10px] uppercase font-black tracking-widest text-indigo-200 mb-1">
              Всего транзакций
            </p>
            <p className="text-3xl font-black">
              {serverResponse?.totalItems || 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Communal;
