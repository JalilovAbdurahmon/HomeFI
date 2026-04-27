import React, { useState, useMemo } from "react";
import {
  Flame,
  Plus,
  Trash2,
  Receipt,
  Landmark,
  X,
  ClipboardList,
  ChevronRight,
  FileCheck2,
  Zap,
  AlertCircle,
  ChevronDown,
  PlusCircle,
  Wallet,
  Layers,
  LayoutGrid,
} from "lucide-react";
import { FaFaucet, FaRightLong } from "react-icons/fa6";
import instance from "../../utils/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

const Communal = () => {
  const { type } = useParams();
  const decodedType = type ? decodeURIComponent(type) : null;
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
      icon: <Zap size={22} />, // 💡 Lampochka iconi
      color: "#FBBF24", // Yorqin sariq
      bg: "#FEF3C7",
    },
    "Горячая вода": {
      // 🔥 Aynan rakvina smistiteli
      icon: <FaFaucet size={20} />,
      color: "#EF4444", // Issiq suv - qizil
      bg: "#FEE2E2",
    },
    "Холодная вода": {
      icon: <FaFaucet size={20} />,
      color: "#3B82F6",
      bg: "#DBEAFE",
    },
    Газ: { icon: <Flame size={20} />, color: "#F43F5E", bg: "#FFE4E6" },
    Мусор: { icon: <Trash2 size={20} />, color: "#10B981", bg: "#D1FAE5" },
    "Коммунальный налог": {
      icon: <FileCheck2 size={22} />, // Bank yoki bino (rasmiy soliq)
      color: "#6366F1",
      bg: "#E0E7FF",
    },
    "Земельный налог + Налог на имущество": {
      icon: <Landmark size={20} />, // Ko'chmas mulk (Bino)
      color: "#6366F1",
      bg: "#E0E7FF",
    },
    Прочие: {
      icon: <LayoutGrid size={22} />, // Yer, o'simlik, yashil maydon
      color: "#475569", // To'q yashil
      bg: "#e2e8f0",
    },
  };

  // 🟢 Backenddan Xizmatlar modelini (Services) olish
  const { data: servicesResponse } = useQuery({
    queryKey: ["getTitleCommunal"],
    queryFn: async () => {
      const res = await instance.get("/titleCommunal");
      return res.data;
    },
  });

  const allServices = useMemo(() => servicesResponse || [], [servicesResponse]);

  // 🟢 Backenddan Cheklarni olish
  const { isLoading, data: serverResponse } = useQuery({
    queryKey: ["getCommunal"],
    queryFn: async () => {
      const res = await instance.get("/communal?limit=1000");
      return res.data;
    },
  });

  const actualData = useMemo(
    () => serverResponse?.data || [],
    [serverResponse]
  );

  const utilityCategories = useMemo(() => {
    return Object.keys(config).map((title) => {
      const items = actualData.filter(
        (item) => (item.titleCommunal?.title || item.titleCommunal) === title
      );
      const sorted = items
        .slice()
        .sort((a, b) => new Date(b.dateOfPayment) - new Date(a.dateOfPayment));
      const last = sorted[0];
      const currentYear = new Date().getFullYear();
      const totalSum = items.reduce((acc, curr) => {
        return new Date(curr.dateOfPayment).getFullYear() === currentYear
          ? acc + curr.sum
          : acc;
      }, 0);

      return {
        title,
        sum: last?.sum || 0,
        totalSum,
        lastDate: last?.dateOfPayment,
      };
    });
  }, [actualData]);

  const recentReceipts = useMemo(() => {
    return actualData
      .slice()
      .sort((a, b) => new Date(b.dateOfPayment) - new Date(a.dateOfPayment))
      .slice(0, 5);
  }, [actualData]);

  const handleFilterNavigate = (typeOrId) => {
    const found = allServices.find(
      (s) => s.title === typeOrId || s._id === typeOrId
    );
    if (found) {
      nav(`/communal/all/${found._id}`, { state: { category: found.title } });
    } else {
      nav("/communal/all");
    }
  };

  const { data: allStatsResponse } = useQuery({
    queryKey: ["getCommunalAllStats", decodedType],
    queryFn: async () => {
      let url = `/communal?limit=10000`;
      if (decodedType && decodedType !== "all") {
        url += `&titleCommunal=${encodeURIComponent(decodedType)}`;
      }
      const res = await instance.get(url);
      return res.data;
    },
  });

  const stats = React.useMemo(() => {
    const allItems = allStatsResponse?.data || [];

    if (allItems.length === 0)
      return {
        yearlyTotal: 0,
        prevYearTotal: 0,
        yearlyChecks: 0,
        prevYearChecks: 0,

        currentMonthSum: 0,
        prevMonthSum: 0,
        currentMonthChecks: 0,
        prevMonthChecks: 0,

        monthName: "",
        prevMonthName: "",
        year: new Date().getFullYear(),
      };

    const allDates = allItems
      .map((item) => new Date(item.dateOfPayment).getTime())
      .filter((t) => !isNaN(t));

    const latestDate = new Date(Math.max(...allDates));

    const currentMonth = latestDate.getMonth();
    const currentYear = latestDate.getFullYear();

    const previousYear = currentYear - 1;

    const prevDateObj = new Date(currentYear, currentMonth - 1, 1);
    const prevMonth = prevDateObj.getMonth();
    const prevYear = prevDateObj.getFullYear();

    const monthNames = [
      "Январь",
      "Февраль",
      "Март",
      "Апрель",
      "Май",
      "Июнь",
      "Июль",
      "Август",
      "Сентябрь",
      "Октябрь",
      "Ноябрь",
      "Декабрь",
    ];

    return allItems.reduce(
      (acc, item) => {
        const d = new Date(item.dateOfPayment);
        if (isNaN(d.getTime())) return acc;

        const m = d.getMonth();
        const y = d.getFullYear();

        const s =
          typeof item.sum === "string"
            ? Number(item.sum.replace(/\s/g, ""))
            : Number(item.sum || 0);

        // YEARLY
        if (y === currentYear) {
          acc.yearlyTotal += s;
          acc.yearlyChecks += 1;
        } else if (y === previousYear) {
          acc.prevYearTotal += s;
          acc.prevYearChecks += 1;
        }

        // MONTHLY
        if (m === currentMonth && y === currentYear) {
          acc.currentMonthSum += s;
          acc.currentMonthChecks += 1;
        } else if (m === prevMonth && y === prevYear) {
          acc.prevMonthSum += s;
          acc.prevMonthChecks += 1;
        }

        acc.year = currentYear;
        acc.monthName = monthNames[currentMonth];
        acc.prevMonthName = monthNames[prevMonth];

        return acc;
      },
      {
        yearlyTotal: 0,
        prevYearTotal: 0,
        yearlyChecks: 0,
        prevYearChecks: 0,

        currentMonthSum: 0,
        prevMonthSum: 0,
        currentMonthChecks: 0,
        prevMonthChecks: 0,

        monthName: monthNames[new Date().getMonth()],
        prevMonthName: monthNames[(new Date().getMonth() + 11) % 12],
        year: new Date().getFullYear(),
      }
    );
  }, [allStatsResponse]);

  const mutation = useMutation({
    mutationFn: async (newdata) => {
      const payload = {
        ...newdata,
        titleCommunal: newdata.titleCommunal,
        sum: Number(newdata.sum),
      };
      return await instance.post("/communal", payload);
    },
    onSuccess: () => {
      // 🎉 Chiroyli "Qo'shildi" xabarnomasi
      toast.success(
        ({ closeToast }) => (
          <div className="flex items-center gap-3 py-1">
            {/* Ko'k/Emerald rangli ikonka bloki */}
            <div className="bg-blue-500 p-2 rounded-xl shadow-lg shadow-blue-200">
              <PlusCircle size={20} className="text-white" />
            </div>

            <div className="flex flex-col">
              <p className="text-gray-800 font-extrabold text-[13px] leading-tight uppercase">
                Успешно создано!
              </p>
              <p className="text-gray-500 text-[11px] mt-0.5">
                Новая запись добавлена в список
              </p>
            </div>
          </div>
        ),
        {
          icon: false,
          className: "rounded-2xl border-none shadow-2xl bg-white",
          autoClose: 3000,
        }
      );
      queryClient.invalidateQueries(["getCommunal"]);
      setIsModalOpen(false);
      reset();
    },
    onError: (err) => {
      alert("Xatolik: " + (err.response?.data?.message || err.message));
    },
  });

  const onSubmit = (formData) => mutation.mutate(formData);

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleCloseModal = () => {
    reset(); // 🔥 Formani va barcha errorlarni tozalaydi
    setIsModalOpen(false); // Modalni yopadi
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
                onClick={handleCloseModal}
                className="p-2 hover:bg-slate-100 rounded-full"
              >
                <X size={24} className="text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="flex flex-col gap-1.5 w-full group">
                <div className="relative">
                  <select
                    {...register("titleCommunal", { required: true })}
                    className={`w-full p-4 transition-all duration-300 font-bold outline-none rounded-2xl border appearance-none cursor-pointer
        ${
          errors.titleCommunal
            ? "bg-white border-red-500 ring-4 ring-red-100 animate-shake"
            : "bg-slate-50 border-slate-100 text-slate-700 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
        }`}
                  >
                    <option value="">Выберите услугу</option>
                    {allServices.map((service) => (
                      <option key={service._id} value={service._id}>
                        {service.title}
                      </option>
                    ))}
                  </select>

                  {/* O'ng tomondagi doimiy strelka */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none flex items-center">
                    <ChevronDown
                      size={20}
                      className={`transition-colors duration-300 ${
                        errors.titleCommunal ? "text-red-500" : "text-slate-400"
                      }`}
                    />
                  </div>
                </div>

                {/* Select pastidagi error xabari */}
                {errors.titleCommunal && (
                  <div className="flex items-center gap-1.5 ml-3 text-red-500 animate-in slide-in-from-top-1 duration-200">
                    <AlertCircle size={14} className="stroke-[3px]" />
                    <span className="text-[12px] font-bold tracking-tight">
                      Пожалуйста, выберите услугу из списка
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1.5 w-full group">
                <input
                  {...register("dateOfPayment", { required: true })}
                  type={dateInputType}
                  onFocus={() => setDateInputType("date")}
                  onBlur={(e) => !e.target.value && setDateInputType("text")}
                  placeholder="Дата платежа"
                  className={`w-full p-4 transition-all duration-300 font-bold text-slate-700 outline-none rounded-2xl border
      ${
        errors.dateOfPayment
          ? "bg-white border-red-500 ring-4 ring-red-100 animate-shake"
          : "bg-slate-50 border-slate-100 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
      } [&::-webkit-calendar-picker-indicator]:cursor-pointer`}
                />

                {/* Input pastidagi error xabari */}
                {errors.dateOfPayment && (
                  <div className="flex items-center gap-1.5 ml-3 text-red-500 animate-in slide-in-from-top-1 duration-200">
                    <AlertCircle size={14} className="stroke-[3px]" />
                    <span className="text-[12px] font-bold tracking-tight">
                      Пожалуйста, выберите дату
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1.5 w-full group">
                <div className="relative">
                  <input
                    {...register("sum", { required: true, min: 1 })}
                    type="number"
                    placeholder="Сумма"
                    className={`w-full p-4 transition-all duration-300 font-bold text-slate-700 outline-none rounded-2xl border
        [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
        ${
          errors.sum
            ? "bg-white border-red-500 ring-4 ring-red-100 animate-shake"
            : "bg-slate-50 border-slate-100 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
        }`}
                  />

                  {!errors.sum && (
                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm pointer-events-none">
                      UZS
                    </span>
                  )}
                </div>

                {/* Input pastidagi error xabari */}
                {errors.sum && (
                  <div className="flex items-center gap-1.5 ml-3 text-red-500 animate-in slide-in-from-top-1 duration-200">
                    <AlertCircle size={14} className="stroke-[3px]" />
                    <span className="text-[12px] font-bold tracking-tight">
                      Пожалуйста, введите сумму платежа
                    </span>
                  </div>
                )}
              </div>
              <textarea
                {...register("desc")}
                placeholder="Комментарий"
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl h-24 resize-none outline-none font-medium"
              />
              {/* Tugmani markazga olish uchun ota blok */}
              <div className="flex justify-center items-center w-full mt-6">
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="group relative flex items-center justify-center gap-3 px-8 h-[48px] min-w-[220px] 
      /* Rang: Indigo dan Purple ga gradient */
      bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#a855f7] 
      text-white rounded-[24px] font-bold text-[11px] tracking-[1.5px] uppercase 
      shadow-xl shadow-indigo-500/25
      transition-all duration-300 
      hover:shadow-2xl hover:shadow-purple-500/40 hover:-translate-y-0.5
      active:scale-95 
      disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
                >
                  {/* Effekt: Hover bo'lganda ichida yorug'lik o'tishi */}
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>

                  {mutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      <span className="animate-pulse">СОЗДАНИЕ...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>ПОДТВЕРДИТЬ И СОХРАНИТЬ</span>
                      {/* Lucide ikonka bo'lsa qo'shishing mumkin */}
                      <svg
                        size={16}
                        className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </div>
                  )}
                </button>
              </div>
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

        {/* Underline effektli tugma va Add btn */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => nav("/communal/all")}
            className="group flex items-center gap-3 px-8 py-2.5 
  bg-[#10b981] text-white rounded-[22px] 
  font-black uppercase text-[11px] tracking-[0.2em] 
  transition-all duration-300 shadow-lg shadow-emerald-500/20 
  hover:-translate-y-0.5 active:scale-95 border-none"
          >
            {/* Ikonka bloki - o'sha rasmdagi kabi bir oz yorqinroq yashil fonda */}
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-white/20 transition-all duration-300">
              <ClipboardList
                size={16}
                className="text-white group-hover:scale-110 transition-all"
              />
            </div>

            <span className="relative font-black">
              Все чеки
              {/* Tag chiziq doim oq rangda bo'ladi */}
              <span className="absolute bottom-[-4px] left-0 w-0 h-[2px] bg-white transition-all duration-300 group-hover:w-full"></span>
            </span>

            <ChevronRight
              size={14}
              className="ml-1 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all"
            />
          </button>

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
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {utilityCategories.map((cat) => {
          const itemConfig = config[cat.title];
          return (
            <div
              key={cat.title}
              className="bg-white p-6 rounded-[28px] border border-[#f1f5f9] shadow-sm hover:shadow-lg transition-all min-h-[220px] flex flex-col justify-between group"
            >
              {/* TEPPA QISM: Icon va Oxirgi to'lov */}
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform"
                  style={{
                    backgroundColor: itemConfig?.bg || "#f8fafc",
                    color: itemConfig?.color || "#000000",
                  }}
                >
                  {itemConfig?.icon}
                </div>
                <div className="flex flex-col leading-tight text-left">
                  <span className="text-[10px] uppercase text-[#666666] font-bold tracking-wider">
                    Последний платёж
                  </span>
                  <span className="text-[20px] font-black text-[#000000]">
                    {cat.sum.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* O'RTA QISM: Title (min-h bilan tekislangan) */}
              <div className="min-h-[42px] flex items-center mb-2">
                <h3 className="font-black text-[#000000] text-[12px] uppercase tracking-[0.15em] leading-tight text-left">
                  {cat.title}
                </h3>
              </div>

              {/* PASTI QISM: Yillik xulosa */}
              <div className="border-t border-[#f8fafc] pt-4 flex items-center justify-between mt-auto">
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-bold uppercase">
                    Итого за год
                  </span>
                  <span className="text-[15px] text-[#000000] font-black">
                    {cat.totalSum.toLocaleString()}{" "}
                    <small className="text-[10px] uppercase font-bold ml-0.5">
                      сум
                    </small>
                  </span>
                </div>

                <button
                  onClick={() => handleFilterNavigate(cat.title)}
                  className="p-2.5 bg-white border border-[#e2e8f0] rounded-xl transition-all duration-300 hover:text-[#4f46e5] hover:border-[#4f46e5] hover:bg-[#eff6ff] hover:shadow-md active:scale-90"
                >
                  <FaRightLong size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* STATS CARDS GRID - Barcha ranglar HEX formatida */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full items-stretch">
        {/* 1. LEFT - YEARLY CARD (Katta karta) */}
        <div className="lg:col-span-2 bg-[#4f46e5] p-7 px-9 rounded-[35px] shadow-xl shadow-[#4f46e533] text-white relative overflow-hidden group flex flex-col justify-between min-h-[280px]">
          {/* Orqa fondagi katta dekorativ ikonka */}
          <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:rotate-12 group-hover:scale-110 transition-all duration-700">
            <Wallet size={180} />
          </div>

          {/* TEPPA QISM */}
          <div className="relative z-10 flex justify-between items-start">
            <div className="text-left">
              <p className="text-[11px] font-black text-[#e0e7ff] opacity-70 uppercase tracking-[0.2em] mb-2">
                Итого за {stats.year} год
              </p>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter flex items-baseline gap-2">
                {stats.yearlyTotal.toLocaleString()}
                <span className="text-sm font-medium opacity-60">UZS</span>
              </h2>
            </div>

            <div className="text-right">
              <p className="text-[10px] font-black text-[#c7d2fe] uppercase tracking-widest">
                Чеков в году
              </p>
              <p className="text-3xl font-black">
                {stats.yearlyChecks}{" "}
                <span className="text-[10px] opacity-50 ml-1 text-[#e0e7ff]">
                  ШТ
                </span>
              </p>
            </div>
          </div>

          {/* PASTI QISM (O'tgan yilgi ma'lumotlar) */}
          <div className="relative z-10 pt-5 border-t border-white/10 flex flex-col gap-2">
            <div className="flex justify-between items-center bg-white/5 px-5 py-2.5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
              <p className="text-[11px] font-bold text-[#e0e7ff] uppercase">
                За {new Date().getFullYear() - 1} год:
              </p>
              <span className="text-[15px] font-black">
                {(stats.prevYearTotal || 0).toLocaleString()}{" "}
                <small className="text-[10px] opacity-60 ml-1">UZS</small>
              </span>
            </div>

            <div className="flex justify-between items-center px-5 py-1">
              <p className="text-[10px] font-bold text-[#c7d2fe] opacity-60 uppercase italic">
                Количество чеков в прошлом году:
              </p>
              <span className="text-[14px] font-black text-[#e0e7ff]">
                {stats.prevYearChecks ?? 0}{" "}
                <small className="text-[10px] opacity-50 ml-0.5">ШТ</small>
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - Ikkita kichik karta ustuni */}
        <div className="flex flex-col gap-4">
          {/* 2. MONTH SUM (Oylik summa) */}
          <div className="flex-1 bg-white p-6 rounded-[30px] border border-[#f1f5f9] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-center relative overflow-hidden group min-h-[132px]">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-[#eef2ff] rounded-full group-hover:scale-110 transition-transform duration-500"></div>

            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 bg-[#eef2ff] text-[#6366f1] rounded-2xl flex items-center justify-center shadow-inner">
                <Receipt size={24} strokeWidth={2.5} />
              </div>
              <div className="flex flex-col text-left leading-tight">
                <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest mb-1.5">
                  Расход за {stats.monthName}
                </p>
                <div className="flex items-baseline gap-1.5">
                  <h3 className="text-2xl font-black text-[#1e293b] tracking-tight">
                    {stats.currentMonthSum.toLocaleString()}
                  </h3>
                  <span className="text-[10px] font-black text-[#818cf8] uppercase tracking-tighter">
                    UZS
                  </span>
                </div>
              </div>
            </div>

            {/* Oylik o'tgan safargi summa */}
            <div className="mt-3 flex items-center justify-between px-4 py-2 bg-[#eef2ff] rounded-xl border border-[#f1f5f9] relative z-10">
              <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider">
                {stats.prevMonthName}
              </span>
              <span className="text-[12px] font-black text-[#475569]">
                {stats.prevMonthSum.toLocaleString()}{" "}
                <small className="text-[8px] text-[#818cf8]">UZS</small>
              </span>
            </div>
          </div>

          {/* 3. MONTH CHECKS (Oylik cheklar soni) */}
          <div className="flex-1 bg-white p-6 rounded-[30px] border border-[#f1f5f9] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-center relative overflow-hidden group min-h-[132px]">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-[#fffbeb] rounded-full group-hover:scale-110 transition-transform duration-500"></div>

            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 bg-[#fffbeb] text-[#d97706] rounded-2xl flex items-center justify-center shadow-inner">
                <Layers size={24} strokeWidth={2.5} />
              </div>
              <div className="flex flex-col text-left leading-tight">
                <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest mb-1.5">
                  Чеков за {stats.monthName}
                </p>
                <div className="flex items-baseline gap-1.5">
                  <h3 className="text-2xl font-black text-[#1e293b] tracking-tight">
                    {stats.currentMonthChecks}
                  </h3>
                  <span className="text-[10px] font-black text-[#fbbf24] uppercase tracking-tighter ml-1">
                    ШТ
                  </span>
                </div>
              </div>
            </div>

            {/* Oylik o'tgan safargi cheklar soni */}
            <div className="mt-3 flex items-center justify-between px-4 py-2 bg-[#fffbeb] rounded-xl border border-[#f1f5f9] relative z-10">
              <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider">
                {stats.prevMonthName}
              </span>
              <span className="text-[12px] font-black text-[#475569]">
                {stats.prevMonthChecks}{" "}
                <small className="text-[9px] ml-0.5 text-[#fbbf24]">ШТ</small>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Communal;
