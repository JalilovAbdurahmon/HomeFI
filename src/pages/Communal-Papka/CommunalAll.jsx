import React, { useMemo, useState, useEffect } from "react";
import {
  ArrowLeft,
  FileText,
  Zap,
  Flame,
  Trash2,
  Landmark,
  Edit3,
  X,
  Layers,
  ChevronDown,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Info,
  FilterX,
  RefreshCcw,
  FileCheck2,
  Square,
  Shapes,
} from "lucide-react";
import { exportToExcel, exportToPDF } from "../../utils/exportHelpers";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import instance from "../../utils/axios";
import { FaFaucet, FaFileExcel } from "react-icons/fa6";
import { toast } from "react-toastify";

const CommunalAll = () => {
  const { type } = useParams();
  const decodedType = type ? decodeURIComponent(type) : null;
  const nav = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(""); // ✅ YANGI
  const [editingItem, setEditingItem] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const location = useLocation();
  const initialCategory = location.state?.category || "all";
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [appliedDate, setAppliedDate] = useState({
    start: "",
    end: "",
  });

  const titleFromState = location.state?.title;

  const { register, handleSubmit, reset, setValue } = useForm();

  // ✅ DEBOUNCE: foydalanuvchi yozishni to'xtatgandan 500ms keyin qidiradi
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

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
      icon: <Shapes size={22} />, // Yer, o'simlik, yashil maydon
      color: "#16A34A", // To'q yashil
      bg: "#DCFCE7",
    },
  };

  const options = [
    {
      label: "Excel",
      value: "excel",
      icon: <FaFileExcel size={18} className="text-green-800" />,
    },
    {
      label: "PDF",
      value: "pdf",
      icon: <FileText size={18} className="text-red-500" />,
    },
  ];

  useEffect(() => {
    setPage(1);
    if (type) {
      console.log("ID o'zgardi, yangi ma'lumot chaqirilyapti:", type);
    }
  }, [type]);

  const {
    data: serverResponse,
    isLoading,
    refetch,
  } = useQuery({
    // ✅ searchTerm o'rniga debouncedSearch ishlatiladi
    queryKey: [
      "getCommunal",
      page,
      limit,
      decodedType,
      debouncedSearch,
      appliedDate.start,
      appliedDate.end,
    ],
    queryFn: async () => {
      const params = {
        page,
        limit,
        search: debouncedSearch || undefined,
      };

      if (decodedType && decodedType !== "all") {
        params.titleCommunal = decodedType;
      }

      if (appliedDate.start) {
        params.from = appliedDate.start;
      }

      if (appliedDate.end) {
        params.to = appliedDate.end;
      }

      const res = await instance.get("/communal", { params });
      return res.data;
    },
    keepPreviousData: true, // ✅ true — yozayotganda eski ma'lumot ko'rinib turadi
  });

  const handleCategoryChange = (catId) => {
    setPage(1);
    nav(`/communal/all/${catId}`);
  };

  const displayData = serverResponse?.data || [];

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

  const currentTitle = useMemo(() => {
    if (!decodedType || decodedType === "all") return "Все транзакции";

    const allItems = serverResponse?.data || [];
    const foundItem = allItems.find(
      (item) =>
        item.titleCommunal?._id === decodedType ||
        item.titleCommunal === decodedType
    );

    return foundItem?.titleCommunal?.title || decodedType;
  }, [decodedType, serverResponse]);

  const handleSelect = async (opt) => {
    const dataToExpert = allStatsResponse?.data || [];

    setOpen(false);

    // ✅ appliedDate - sening sanalaring saqlangan state
    const currentFilter = {
      from: appliedDate.start,
      to: appliedDate.end,
    };

    if (opt.value === "excel") {
      exportToExcel(dataToExpert, currentFilter);
    }

    if (opt.value === "pdf") {
      exportToPDF(dataToExpert, currentFilter);
    }
  };

  const updateMutation = useMutation({
    mutationFn: async (updatedData) => {
      const { id, ...payload } = updatedData;
      const finalPayload = {
        ...payload,
        sum: Number(payload.sum),
        titleCommunal: editingItem.titleCommunal?._id || payload.titleCommunal,
      };

      return await instance.put(`/communal/${id}`, finalPayload);
    },
    onSuccess: () => {
      toast.success(
        ({ closeToast }) => (
          <div className="flex items-center gap-3">
            <div className="bg-[#10b981] p-2 rounded-xl shadow-lg shadow-[#a7f3d0]">
              <CheckCircle size={20} className="text-white" />
            </div>
            <div>
              <p className="text-gray-800 font-bold text-[13px]">Обновлено!</p>
              <p className="text-gray-500 text-[11px]">
                Данные успешно сохранены
              </p>
            </div>
          </div>
        ),
        {
          icon: false, // Standart ikonkani o'chiramiz
          className: "rounded-2xl border-none shadow-2xl", // Borderlarni butunlay yo'qotamiz
        }
      );
      queryClient.invalidateQueries(["getCommunal"]);
      setEditingItem(null);
      reset();
    },
    onError: (err) => {
      console.error("Xato tafsiloti:", err.response?.data);
      alert("Update xatosi: " + (err.response?.data?.message || err.message));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await instance.delete(`/communal/${id}`);
    },
    onSuccess: () => {
      // 🎉 O'chirish uchun maxsus chiroyli toast
      toast.success(
        ({ closeToast }) => (
          <div className="flex items-center gap-3 py-1">
            {/* Qizil rangli ikonka bloki */}
            <div className="bg-[#f43f5e] p-2 rounded-xl shadow-lg shadow-[#fecdd3]">
              <Trash2 size={20} className="text-white" />
            </div>

            <div className="flex flex-col">
              <p className="text-gray-800 font-extrabold text-[13px] leading-tight uppercase">
                Удалено!
              </p>
              <p className="text-gray-500 text-[11px] mt-0.5 font-medium">
                Данные были успешно удалены
              </p>
            </div>
          </div>
        ),
        {
          icon: false,
          className: "rounded-2xl border-none shadow-2xl bg-white",
        }
      );
      queryClient.invalidateQueries(["getCommunal"]);
      queryClient.invalidateQueries(["getCommunalAllStats"]);
    },
  });

  const handleEdit = (item) => {
    setEditingItem(item);
    const currentCategoryName = item.titleCommunal?.title || item.titleCommunal;
    setValue("titleCommunal", currentCategoryName);
    setValue("sum", item.sum);
    setValue("desc", item.desc || "");
    if (item.dateOfPayment)
      setValue("dateOfPayment", item.dateOfPayment.split("T")[0]);
  };

  const handleUpdate = (data) => {
    if (!editingItem) return;

    const currentData = {
      sum: Number(data.sum),
      titleCommunal: editingItem.titleCommunal?._id || data.titleCommunal,
      dateOfPayment: data.dateOfPayment,
      desc: data.desc || "",
    };

    const initialData = {
      sum: Number(editingItem.sum),
      titleCommunal: editingItem.titleCommunal?._id,
      dateOfPayment: editingItem.dateOfPayment
        ? editingItem.dateOfPayment.split("T")[0]
        : "",
      desc: editingItem.desc || "",
    };

    // 🔥 CHECK
    if (JSON.stringify(currentData) === JSON.stringify(initialData)) {
      z;

      setEditingItem(null);
      return;
    }

    updateMutation.mutate({
      id: editingItem._id,
      ...data,
    });
  };

  const handleDeleteConfirm = (id) => {
    // Toast ichida bizning maxsus komponentimiz chiqadi
    toast.info(
      ({ closeToast }) => (
        <div className="flex flex-col gap-3 p-1">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-2 rounded-full">
              <AlertTriangle size={20} className="text-orange-600" />
            </div>
            <div>
              <h4 className="font-bold text-gray-800 text-sm">
                O'chirishni tasdiqlang
              </h4>
              <p className="text-xs text-gray-500">
                Haqiqatan ham ushbu ma'lumotni o'chirmoqchimisiz?
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-2">
            {/* Qaytish tugmasi */}
            <button
              onClick={closeToast}
              className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
            >
              Bekor qilish
            </button>

            {/* O'chirish tugmasi */}
            <button
              onClick={async () => {
                closeToast(); // Oldin toastni yopamiz
                deleteMutation.mutate(id);
              }}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg shadow-md shadow-red-200 transition-all"
            >
              O'chirish
            </button>
          </div>
        </div>
      ),
      {
        position: "top-center",
        autoClose: false, // Foydalanuvchi tugmani bosmaguncha yopilmaydi
        closeOnClick: false,
        draggable: false,
        icon: false, // Standart ikonkani o'chirib qo'yamiz
      }
    );
  };

  const handleFilterClick = () => {
    // 1. Holatlarni tekshiramiz (Senda "all" ekan)
    const isDateActive = startDate || endDate;
    const isCategoryActive = selectedCategory && selectedCategory !== "all";

    if (!isDateActive && !isCategoryActive) {
      toast.info("Фильтры не выбраны", {
        icon: <Info size={20} />,
        className: "rounded-2xl font-bold",
      });
      return;
    }

    // 2. Toast vizual parametrlari
    let message = "";
    let toastIcon = <FilterX size={20} className="text-[#d97706]" />;
    let toastColor = "#fffbeb";

    if (isDateActive && isCategoryActive) {
      message = "Сбросить всё (период и категорию)?";
      toastIcon = <RefreshCcw size={20} className="text-[#4f46e5]" />;
      toastColor = "#eef2ff";
    } else if (isDateActive) {
      message = "Сбросить выбранный период?";
      toastIcon = <Calendar size={20} className="text-[#3b82f6]" />;
      toastColor = "#eff6ff";
    } else {
      message = "Сбросить фильтр категории?";
      toastIcon = <Layers size={20} className="text-[#10b981]" />;
      toastColor = "#ecfdf5";
    }

    toast.warning(
      ({ closeToast }) => (
        <div className="flex flex-col gap-4 p-1">
          <div className="flex items-center gap-3">
            <div
              className="p-3 rounded-2xl"
              style={{ backgroundColor: toastColor }}
            >
              {toastIcon}
            </div>
            <div className="flex flex-col text-left">
              <p className="text-[13px] font-black text-[#000000] uppercase tracking-tight leading-tight">
                {message}
              </p>
              <p className="text-[10px] text-[#666666] font-medium mt-1">
                Все данные будут восстановлены
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                // 1. Statelarni tozalash
                setStartDate("");
                setEndDate("");
                setAppliedDate({ start: "", end: "" });
                setSelectedCategory("all"); // "all" ga qaytaramiz
                setPage(1);

                // 2. Navigatsiya (Hamma cheklarni ko'rsatish uchun asosiy yo'lga qaytamiz)
                nav("/communal/all");

                closeToast();

                // Yakuniy muvaffaqiyat xabari
                const successMsg =
                  isDateActive && isCategoryActive
                    ? "Все фильтры очищены"
                    : isDateActive
                    ? "Период очищен"
                    : "Категория сброшена";

                toast.success(successMsg, {
                  icon: <RefreshCcw size={18} className="animate-spin" />,
                  className:
                    "rounded-[20px] font-black text-[12px] uppercase shadow-lg",
                });
              }}
              className="flex-[1.5] py-3 bg-[#000000] text-white text-[10px] font-black rounded-xl uppercase tracking-widest hover:bg-[#333333] transition-colors"
            >
              Да, очистить
            </button>
            <button
              onClick={closeToast}
              className="flex-1 py-3 bg-[#f1f5f9] text-[#000000] text-[10px] font-black rounded-xl uppercase tracking-widest"
            >
              Отмена
            </button>
          </div>
        </div>
      ),
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        className:
          "rounded-[28px] shadow-2xl bg-white p-3 border border-[#f1f5f9]",
      }
    );
  };
  // Haqiqiy o'chirish jarayoni
  const executeDelete = async (id) => {
    const loadingToast = toast.loading("O'chirilmoqda...");
    try {
      // API so'rovingni kutamiz
      // await instance.delete(`/communal/${id}`);

      // Test uchun 1 soniya kutamiz
      await new Promise((res) => setTimeout(res, 1000));

      toast.update(loadingToast, {
        render: "Muvaffaqiyatli o'chirildi! 🗑️",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      // Ma'lumotlarni qayta yuklash (refetch)
      // refetch();
    } catch (err) {
      toast.update(loadingToast, {
        render: "Xatolik yuz berdi! ❌",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [page, limit]);

  if (isLoading)
    return (
      <div className="p-20 text-center animate-pulse font-black text-indigo-600">
        Загрузка...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-12 font-sans text-slate-900">
      {editingItem && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            onClick={() => setEditingItem(null)}
          ></div>
          <div className="relative bg-white w-full max-w-lg rounded-[40px] shadow-2xl p-10 overflow-hidden">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-slate-800">
                Изменить чек
              </h2>
              <button
                onClick={() => setEditingItem(null)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={24} className="text-slate-400" />
              </button>
            </div>
            <form
              onSubmit={handleSubmit(handleUpdate)}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.preventDefault();
              }}
              className="space-y-4"
            >
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">
                  Категория услуги
                </label>
                <select
                  {...register("titleCommunal")}
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-[20px] outline-none font-bold text-slate-700"
                >
                  {Object.keys(config).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">
                  Дата платежа
                </label>
                <input
                  {...register("dateOfPayment")}
                  type="date"
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-[20px] outline-none font-bold text-slate-700 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">
                  Сумма (UZS)
                </label>
                <input
                  {...register("sum")}
                  type="number"
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-[20px] outline-none font-bold text-slate-700"
                  placeholder="0"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">
                  Примечание
                </label>
                <textarea
                  {...register("desc")}
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-[20px] outline-none font-bold min-h-[80px] resize-none text-slate-700"
                  placeholder="Примечание..."
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-5 rounded-[24px] font-black text-lg shadow-lg hover:bg-indigo-700 transition-all active:scale-95 mt-4"
              >
                Сохранить изменения
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => nav("/communal")}
          className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 mb-6 font-bold text-sm uppercase tracking-widest group"
        >
          <ArrowLeft
            size={18}
            className="group-hover:-translate-x-1 transition-transform"
          />{" "}
          Назад
        </button>

        <div className="flex flex-col lg:flex-row justify-between items-start gap-8 mb-10">
          <div className="space-y-6 w-full lg:max-w-md">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              {currentTitle}
            </h1>

            <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full mb-8">
              {/* 1. ВЫБРАТЬ ДАТУ - Chap taraf */}
              <div className="relative w-full md:flex-1">
                <button
                  type="button"
                  onClick={() => setIsDateModalOpen(true)}
                  className="group w-full flex items-center gap-4 px-5 h-[60px] 
      bg-gradient-to-br from-[#1e3a8a] to-[#2563eb] 
      text-white rounded-[20px] font-semibold 
      shadow-lg shadow-blue-500/20 
      hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/15 border border-white/10 group-hover:bg-white/25 transition-all">
                    <Calendar size={20} />
                  </div>
                  <div className="flex flex-col items-start leading-tight">
                    <span className="text-[13px] whitespace-nowrap">
                      {startDate || endDate
                        ? startDate && endDate
                          ? `${startDate} - ${endDate}`
                          : `${startDate || endDate}`
                        : "Выбрать дату"}
                    </span>
                  </div>
                </button>

                {/* MODAL — O‘ZGARMAGAN */}
                {isDateModalOpen && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                      className="fixed inset-0 bg-[#0f172a]/60 backdrop-blur-md"
                      onClick={() => setIsDateModalOpen(false)}
                    />
                    <div
                      className="relative w-full max-w-md bg-white rounded-[30px] p-8 shadow-2xl"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <h3 className="text-lg font-black text-[#0f172a] mb-6 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center">
                          <Calendar className="text-[#1d4ed8]" size={16} />
                        </div>
                        Выберите диапазон
                      </h3>
                      <div className="space-y-4">
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full px-4 py-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl outline-none focus:border-[#1d4ed8] transition-all"
                        />
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full px-4 py-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl outline-none focus:border-[#1d4ed8] transition-all"
                        />
                      </div>
                      <div className="flex gap-3 mt-8">
                        <button
                          type="button"
                          onClick={() => {
                            setStartDate("");
                            setEndDate("");
                            setAppliedDate({ start: "", end: "" });
                            setPage(1);
                            setIsDateModalOpen(false);
                          }}
                          className="flex-1 py-3 rounded-2xl font-bold text-[#64748b] bg-[#f1f5f9] hover:bg-[#e2e8f0] transition-all"
                        >
                          Очистить
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            let from = startDate;
                            let to = endDate;
                            if (from && !to) to = from;
                            if (!from && to) from = to;
                            setAppliedDate({ start: from, end: to });
                            setPage(1);
                            setIsDateModalOpen(false);
                          }}
                          className="flex-1 py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-[#1d4ed8] to-[#1e40af] shadow-md hover:shadow-lg transition-all active:scale-95"
                        >
                          Применить
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center">
                <button
                  onClick={handleFilterClick}
                  className={`w-[60px] h-[60px] flex items-center justify-center border rounded-2xl transition-all shadow-sm active:scale-95 ${
                    startDate ||
                    endDate ||
                    (selectedCategory && selectedCategory !== "Все")
                      ? "bg-[#eff6ff] border-[#3b82f6] text-[#3b82f6]" // Filtr aktiv bo'lsa ko'k rang
                      : "bg-white border-[#e2e8f0] text-[#94a3b8]" // Filtr ochiq bo'lmasa kulrang
                  }`}
                >
                  <FilterX size={22} strokeWidth={2.5} />
                </button>
              </div>

              {/* 2. ВЫБЕРИТЕ ОТЧЁТ - Markazda */}
              <div className="relative w-full md:flex-1">
                <button
                  type="button"
                  onClick={() => setOpen(!open)}
                  className="group w-full flex items-center justify-between px-5 h-[60px] 
      bg-gradient-to-br from-[#10b981] to-[#059669] 
      text-white rounded-[20px] font-semibold 
      shadow-lg shadow-emerald-500/20 
      hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/15 border border-white/10 group-hover:bg-white/25 transition-all">
                      <FileText size={20} />
                    </div>
                    <div className="flex flex-col items-start leading-tight">
                      <span className="text-[13px] whitespace-nowrap">
                        Выберите отчёт
                      </span>
                    </div>
                  </div>
                  <ChevronDown
                    size={18}
                    className={`transition-transform duration-300 ${
                      open ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* DROPDOWN */}
                {open && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setOpen(false)}
                    ></div>
                    <div className="absolute left-0 mt-3 w-full min-w-[200px] bg-white border border-emerald-100 rounded-[22px] shadow-2xl z-20 overflow-hidden p-2 animate-in fade-in zoom-in duration-200">
                      <div className="max-h-[180px] overflow-y-auto custom-scrollbar space-y-1">
                        {options.map((opt) => (
                          <div
                            key={opt.value}
                            onClick={() => handleSelect(opt)}
                            className="flex items-center gap-3 px-4 py-3 cursor-pointer rounded-xl text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-all group"
                          >
                            <span className="text-lg group-hover:scale-110 transition-transform">
                              {opt.icon}
                            </span>
                            <span className="font-bold text-[12px]">
                              {opt.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* 3. КАТЕГОРИЯ - O'ng taraf */}
              <div className="relative w-full md:flex-1">
                <button
                  type="button"
                  onClick={() => setIsOpen(!isOpen)}
                  className="group w-full flex items-center justify-between px-5 h-[60px] 
      bg-gradient-to-br from-[#4338ca] to-[#3730a3] 
      text-white rounded-[20px] font-semibold 
      shadow-lg shadow-indigo-500/20 
      hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/15 border border-white/10 group-hover:bg-white/25 transition-all">
                      <Layers size={20} />
                    </div>
                    <div className="flex flex-col items-start leading-tight">
                      <span className="text-[13px] whitespace-nowrap truncate max-w-[120px]">
                        {selectedCategory === "all"
                          ? "Все услуги"
                          : selectedCategory}
                      </span>
                    </div>
                  </div>
                  <ChevronDown
                    size={18}
                    className={`transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* DROPDOWN */}
                {isOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsOpen(false)}
                    ></div>
                    <div className="absolute right-0 mt-3 w-full min-w-[260px] bg-[#1e293b] border border-slate-700 rounded-[22px] shadow-2xl z-20 overflow-hidden p-2 animate-in fade-in zoom-in duration-200">
                      <div className="max-h-[220px] overflow-y-auto custom-scrollbar space-y-1 p-1">
                        <div
                          onClick={() => {
                            setPage(1);
                            setSelectedCategory("all");
                            setIsOpen(false);
                            nav("/communal/all");
                          }}
                          className={`px-4 py-3 rounded-xl cursor-pointer font-bold text-[12px] transition-all ${
                            selectedCategory === "all"
                              ? "bg-indigo-500/20 text-indigo-300"
                              : "text-[#e2e8f0] hover:bg-slate-800"
                          }`}
                        >
                          📊 Показать все категории
                        </div>
                        {Object.keys(config).map((cat) => (
                          <div
                            key={cat}
                            onClick={() => {
                              setPage(1);
                              setSelectedCategory(cat);
                              setIsOpen(false);
                              const categoryData = allStatsResponse?.data?.find(
                                (item) =>
                                  (item.titleCommunal?.title ||
                                    item.titleCommunal) === cat
                              );
                              const categoryID =
                                categoryData?.titleCommunal?._id ||
                                categoryData?._id;
                              categoryID
                                ? nav(`/communal/all/${categoryID}`)
                                : nav("/communal/all");
                            }}
                            className={`px-4 py-3 rounded-xl cursor-pointer font-bold text-[12px] transition-all ${
                              selectedCategory === cat
                                ? "bg-indigo-500/20 text-indigo-300"
                                : "text-[#e2e8f0] hover:bg-slate-800"
                            }`}
                          >
                            {cat}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* STATS CARDS
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full lg:w-auto">
            <div className="relative md:col-span-2 bg-indigo-600 p-8 px-10 rounded-[40px] shadow-2xl text-white overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform">
                <Wallet size={120} />
              </div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-[11px] font-black text-indigo-100 uppercase tracking-[0.2em] mb-1">
                      Итого за {stats.year} год
                    </p>
                    <h2 className="text-4xl md:text-5xl font-black">
                      {stats.yearlyTotal.toLocaleString()}{" "}
                      <span className="text-sm font-medium opacity-60">
                        UZS
                      </span>
                    </h2>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">
                      Чеков в году
                    </p>
                    <p className="text-2xl font-black">
                      {stats.yearlyChecks}{" "}
                      <span className="text-[10px] opacity-50">ШТ</span>
                    </p>
                  </div>
                </div>
                <div
                  className="pt-4 border-t border-indigo-400/30 space-y-1
                "
                >
                  TOP ROW: Year Text and Total Sum
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-wider">
                      За {new Date().getFullYear() - 1} год было:
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-black text-white/90">
                        {(stats.prevYearTotal || 0).toLocaleString()}
                      </span>
                      <span className="text-[10px] font-bold text-white/60 uppercase">
                        UZS
                      </span>
                    </div>
                  </div>

                  BOTTOM ROW: Checks Label and Count
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-wider">
                      За {new Date().getFullYear() - 1} год чеков:
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-extrabold mr-[3px] text-white/90">
                        {stats.prevYearChecks ?? 0}
                      </span>
                      <span className="text-[10px] font-bold mr-[1px] text-white/60 uppercase">
                        шт
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white p-5 px-6 rounded-[28px] border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center shrink-0">
                <Receipt size={22} />
              </div>
              <div className="w-full">
                <p className="text-[10px] font-black text-[#475569] uppercase tracking-widest">
                  Расход за {stats.monthName}
                </p>
                <p className="text-lg font-black text-indigo-500">
                  {stats.currentMonthSum.toLocaleString()}{" "}
                  <span className="text-[12px]">UZS</span>
                </p>
                <div className="mt-2 text-right border-t border-slate-50 pt-1">
                  <span className="text-[9px] text-[#475569] font-bold uppercase">
                    {stats.prevMonthName}:{" "}
                  </span>
                  <span className="text-[13px] font-black text-indigo-500">
                    {stats.prevMonthSum.toLocaleString()}
                    <span className="text-[10px] ml-1">UZS</span>
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-white p-5 px-6 rounded-[28px] border-2 border-amber-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center shrink-0">
                <Layers size={22} />
              </div>
              <div className="w-full">
                <p className="text-[10px] font-black text-[#475569] uppercase tracking-widest">
                  Чеков за {stats.monthName}
                </p>
                <p className="text-lg font-black text-amber-500">
                  {stats.currentMonthChecks} шт
                </p>
                <div className="mt-2 text-right border-t border-slate-50 pt-1">
                  <span className="text-[9px] text-[#475569] font-bold uppercase">
                    {stats.prevMonthName}:{" "}
                  </span>
                  <span className="text-[12px] font-black text-amber-600">
                    {stats.prevMonthChecks} шт
                  </span>
                </div>
              </div>
            </div>
          </div> */}
        </div>

        {/* JADVAL */}
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden mb-12">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-6 text-[11px] font-black uppercase text-slate-400">
                  Услуга
                </th>
                <th className="px-8 py-6 text-[11px] font-black uppercase text-slate-400">
                  Дата
                </th>
                <th className="px-8 py-6 text-[11px] font-black uppercase text-slate-400">
                  Примечание
                </th>
                <th className="px-8 py-6 text-[11px] font-black uppercase text-slate-400 text-right">
                  Сumma
                </th>
                <th className="px-8 py-6 text-[11px] font-black uppercase text-slate-400 text-center">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {serverResponse?.data?.map((item) => {
                const serviceName =
                  item?.titleCommunal?.title || item.titleCommunal || "Другое";
                const style = config[serviceName] || {
                  icon: <FileText size={22} />,
                  color: "#94a3b8",
                  bg: "#f1f5f9",
                };
                return (
                  <tr
                    key={item._id}
                    className="hover:bg-slate-50/80 transition-all"
                  >
                    <td className="px-8 py-6 flex items-center gap-4">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center"
                        style={{
                          backgroundColor: style.bg,
                          color: style.color,
                        }}
                      >
                        {style.icon}
                      </div>
                      <span className="font-bold text-slate-800">
                        {serviceName}
                      </span>
                    </td>
                    <td className="px-8 py-6 font-bold text-slate-500">
                      {item?.dateOfPayment
                        ? new Date(item.dateOfPayment).toLocaleDateString(
                            "ru-RU"
                          )
                        : "—"}
                    </td>
                    <td className="px-8 py-6 text-slate-400 italic truncate max-w-[200px]">
                      {item?.desc || "—"}
                    </td>
                    <td className="px-8 py-6 text-right font-black text-slate-900">
                      {Number(item.sum).toLocaleString()} UZS
                    </td>
                    <td className="px-8 py-6 flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 bg-amber-50 text-amber-400 rounded-lg hover:bg-amber-400 hover:text-white transition-all"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteConfirm(item._id)}
                        className="p-2.5 rounded-2xl bg-[#fff1f2] text-[#f43f5e] hover:bg-[#f43f5e] hover:text-white active:scale-90 transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col items-center gap-10 pb-20 mt-12">
          <div className="flex flex-col md:flex-row items-center gap-6 w-full justify-center">
            <div className="flex flex-col items-center gap-2">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">
                Записей на странице
              </span>
              <div className="flex p-1 bg-slate-100/80 backdrop-blur-sm rounded-[18px] border border-slate-200/50">
                {[10, 20, 50, 100].map((num) => (
                  <button
                    key={num}
                    onClick={() => {
                      setLimit(num);
                      setPage(1);
                    }}
                    className={`px-5 py-2 rounded-[14px] font-black text-[11px] transition-all duration-300 ${
                      limit === num
                        ? "bg-white text-indigo-600 shadow-md shadow-indigo-100/50 scale-105"
                        : "text-slate-500 hover:text-indigo-600 hover:bg-white/50"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div className="hidden md:block w-[1px] h-10 bg-slate-200 mx-2"></div>

            <div className="flex flex-col items-center gap-2">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">
                Общая статистика
              </span>
              <div className="flex items-center h-[42px] px-6 bg-indigo-50/50 rounded-full border border-indigo-100/50">
                <p className="text-sm font-bold text-slate-600">
                  Показано{" "}
                  <span className="text-indigo-600 font-black mx-1">
                    {(page - 1) * limit + 1} –{" "}
                    {Math.min(page * limit, serverResponse?.totalItems || 0)}
                  </span>
                  <span className="text-slate-400 mx-1 font-medium">из</span>
                  <span className="text-slate-800 font-black underline decoration-indigo-200 decoration-2 underline-offset-4">
                    {serverResponse?.totalItems || 0}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="relative p-2 bg-white rounded-[32px] border border-slate-100 shadow-[0_20px_50px_-12px_rgba(79,70,229,0.12)]">
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="w-12 h-12 flex items-center justify-center rounded-2xl text-slate-400 hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-10 transition-all active:scale-90"
              >
                <ArrowLeft size={20} />
              </button>

              <div className="flex items-center gap-1.5">
                {Array.from(
                  { length: serverResponse?.totalPages || 1 },
                  (_, i) => i + 1
                ).map((n) => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`w-12 h-12 rounded-2xl font-black text-sm transition-all duration-300 ${
                      page === n
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200/50 scale-110"
                        : "text-slate-400 hover:bg-slate-50 hover:text-indigo-600"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>

              <button
                disabled={page >= (serverResponse?.totalPages || 1)}
                onClick={() => setPage((p) => p + 1)}
                className="w-12 h-12 flex items-center justify-center rounded-2xl text-slate-400 hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-10 transition-all active:scale-90"
              >
                <ArrowLeft size={20} className="rotate-180" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-50 rounded-full border border-slate-100">
            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse"></div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              Используйте стрелки для быстрой навигации
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunalAll;
