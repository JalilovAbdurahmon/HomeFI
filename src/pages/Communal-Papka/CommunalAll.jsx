import React, { useMemo, useState, useEffect } from "react";
import {
  Search,
  ArrowLeft,
  FileText,
  Zap,
  Droplets,
  Waves,
  Flame,
  Trash2,
  Receipt,
  Landmark,
  Home,
  Edit3,
  X,
  Layers,
  Wallet,
  ChevronDown,
  Calendar,
} from "lucide-react";
import { exportToExcel, exportToPDF } from "../../utils/exportHelpers";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import instance from "../../utils/axios";
import { FaFileExcel } from "react-icons/fa6";

const CommunalAll = () => {
  const { type } = useParams();
  const decodedType = type ? decodeURIComponent(type) : null;
  const nav = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10); // Default holatda 10 ta chek
  const location = useLocation();
  const initialCategory = location.state?.category || "all";
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);

  const titleFromState = location.state?.title;

  const { register, handleSubmit, reset, setValue } = useForm();

  const config = {
    Электроэнергия: {
      icon: <Zap size={20} />,
      color: "#FBBF24",
      bg: "#FEF3C7",
    },
    "Горячая вода": {
      icon: <Droplets size={20} />,
      color: "#F97316",
      bg: "#FFEDD5",
    },
    "Холодная вода": {
      icon: <Waves size={20} />,
      color: "#3B82F6",
      bg: "#DBEAFE",
    },
    Газ: { icon: <Flame size={20} />, color: "#F43F5E", bg: "#FFE4E6" },
    Мусор: { icon: <Trash2 size={20} />, color: "#10B981", bg: "#D1FAE5" },
    "Коммунальный налог": {
      icon: <Receipt size={20} />,
      color: "#6366F1",
      bg: "#E0E7FF",
    },
    "Земельный налог": {
      icon: <Landmark size={20} />,
      color: "#64748B",
      bg: "#F1F5F9",
    },
    "Налог на имущество": {
      icon: <Home size={20} />,
      color: "#8B5CF6",
      bg: "#EDE9FE",
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

  // URL'dagi 'type' o'zgarganda sahifani 1-ga qaytarish
  useEffect(() => {
    setPage(1);
  }, [type]); // URL params o'zgarganda ishlaydi

  const { data: serverResponse, isLoading } = useQuery({
    // queryKey ichiga startDate va endDate qo'shildi.
    // Ular o'zgarganda React Query avtomat serverga yangi so'rov yuboradi.
    queryKey: [
      "getCommunal",
      page,
      limit,
      decodedType,
      searchTerm,
      startDate,
      endDate,
    ],
    queryFn: async () => {
      // 1. Asosiy parametrlar
      const params = {
        page: page,
        limit: limit,
        search: searchTerm || undefined,
      };

      // 2. KATEGORIYA FILTRI: Agar kategoriya tanlangan bo'lsa ID yuboramiz
      if (decodedType && decodedType !== "all") {
        params.titleCommunal = decodedType;
      }

      // 3. SANA FILTRI: Agar sanalar tanlangan bo'lsa parametrlarga qo'shamiz
      if (startDate) {
        params.from = startDate; // Backend'dagi parametr nomi 'from' bo'lsa
      }
      if (endDate) {
        params.to = endDate; // Backend'dagi parametr nomi 'to' bo'lsa
      }

      // 4. API so'rovi
      const res = await instance.get("/communal", { params });
      return res.data;
    },
    // Ma'lumot almashayotgan paytda eski ma'lumotni o'chirib, yangisini yuklaydi
    keepPreviousData: false,
  });

  // 🛠 2. FILTER BOSILGANDA PAGE-NI 1 GA QAYTARISH
  // Buni Dropdown ichidagi onClick-ga qo'shib qo'ying
  const handleCategoryChange = (catId) => {
    setPage(1); // Filtr o'zgarganda doim 1-sahifaga qaytish shart!
    nav(`/communal/all/${catId}`);
  };

  // 🛠 3. JADVALGA BERILADIGAN DATA
  // Endi filteredData kerak emas, to'g'ridan-to'g'ri serverResponse.data ni ishlating
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

  // STATISTIKA (O'zingniki qoldi)
  const stats = React.useMemo(() => {
    const allItems = allStatsResponse?.data || [];
    if (allItems.length === 0)
      return {
        yearlyTotal: 0,
        prevYearTotal: 0,
        yearlyChecks: 0,
        currentMonthSum: 0,
        prevMonthSum: 0,
        currentMonthChecks: 0,
        prevMonthChecks: 0,
        monthName: "",
        prevMonthName: "",
        year: new Date().getFullYear(),
      };
    const allDates = allItems.map((item) =>
      new Date(item.dateOfPayment).getTime()
    );
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
        const m = d.getMonth();
        const y = d.getFullYear();
        const s =
          typeof item.sum === "string"
            ? Number(item.sum.replace(/\s/g, ""))
            : Number(item.sum || 0);
        if (y === currentYear) {
          acc.yearlyTotal += s;
          acc.yearlyChecks += 1;
        } else if (y === previousYear) {
          acc.prevYearTotal += s;
        }
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
        currentMonthSum: 0,
        prevMonthSum: 0,
        currentMonthChecks: 0,
        prevMonthChecks: 0,
        monthName: monthNames[currentMonth],
        prevMonthName: monthNames[prevMonth],
        year: currentYear,
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

  const handleSelect = (opt) => {
    const dataToExpert = serverResponse?.data || [];
    setSelected(opt);
    setOpen(false);

    if (opt.value === "excel") {
      exportToExcel(dataToExpert);
    }

    if (opt.value === "pdf") {
      exportToPDF(dataToExpert);
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
      if (window.confirm("Вы уверены?"))
        return await instance.delete(`/communal/${id}`);
    },
    onSuccess: () => {
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
      {/* 🛠 MODAL EDIT (O'zingniki qoldi) */}
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
              onSubmit={handleSubmit((data) =>
                updateMutation.mutate({
                  ...data,
                  id: editingItem._id,
                  sum: Number(data.sum),
                })
              )}
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
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-[20px] outline-none font-bold text-slate-700"
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

            <div className="relative flex-1">
              <Search
                className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Поиск..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-[22px] focus:outline-none shadow-sm font-bold text-slate-700"
              />
            </div>

            {/* 🎨 SHINAM BTN & KOTTA OPTION */}
            <div className="relative inline-block">
              {/* Tugma - Modern Pill-style Gradient with Interactive Hover */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative flex items-center gap-2.5 px-5 py-2.5 
    /* Asosiy Indigo Gradiyenti */
    bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700 
    text-white rounded-full font-bold 
    /* Soya effekti */
    shadow-[0_10px_20px_-5px_rgba(79,70,229,0.4)]
    
    /* HOVER: Rangi silliq qorayishi va soyasi kuchayishi */
    hover:from-indigo-600 hover:via-indigo-700 hover:to-indigo-800
    hover:shadow-[0_15px_30px_-5px_rgba(79,70,229,0.6)]
    
    /* Interaktivlik */
    outline-none cursor-pointer text-[11px] tracking-widest uppercase 
    transition-all duration-300 active:scale-95 border border-white/10 whitespace-nowrap"
              >
                {/* Minimalist ICON Box */}
                <div
                  className={`flex items-center justify-center w-7 h-7 rounded-full transition-colors duration-300 ${
                    isOpen ? "bg-white/30" : "bg-white/15"
                  }`}
                >
                  <Layers className="text-white shrink-0" size={14} />
                </div>

                <span className="truncate max-w-[120px]">
                  {selectedCategory === "all" ? "Категории" : selectedCategory}
                </span>

                <ChevronDown
                  className={`transition-transform duration-300 text-white/80 shrink-0 ${
                    isOpen ? "rotate-180 text-white" : ""
                  }`}
                  size={14}
                />
              </button>

              {/* Ochiladigan menyu - Modern Glassmorphism */}
              {isOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setIsOpen(false)}
                  ></div>

                  <ul
                    className="absolute left-0 mt-3 min-w-[320px] max-h-[400px] overflow-y-auto 
      bg-indigo-900/95 backdrop-blur-xl border border-white/10 rounded-[30px] 
      shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] z-30 animate-in fade-in zoom-in slide-in-from-top-2 duration-200 
      custom-scrollbar overflow-hidden"
                  >
                    {/* ВСЕ КАТЕГОРИИ - Sticky Header */}
                    <li
                      onClick={() => {
                        setPage(1);
                        setSelectedCategory("all");
                        setIsOpen(false);
                        nav("/communal/all");
                      }}
                      className={`sticky top-0 z-10 flex justify-center py-4 text-[11px] font-black cursor-pointer transition-all border-b border-white/10 ${
                        selectedCategory === "all"
                          ? "bg-white text-indigo-900"
                          : "bg-indigo-800/50 text-indigo-100 hover:bg-indigo-700"
                      }`}
                    >
                      📊 ВСЕ КАТЕГОРИИ
                    </li>

                    {/* Grid-based Categories */}
                    <div className="grid grid-cols-2 p-2 gap-1">
                      {Object.keys(config).map((cat, index) => (
                        <li
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
                              categoryData?.titleCommunal;

                            if (categoryID) {
                              nav(`/communal/all/${categoryID}`);
                            }
                          }}
                          className={`px-3 py-4 text-[10px] rounded-2xl font-bold cursor-pointer transition-all flex items-center justify-center text-center
                ${
                  selectedCategory === cat
                    ? "bg-indigo-500 text-white shadow-lg"
                    : "text-indigo-100 hover:bg-white/10 hover:scale-[0.98]"
                }`}
                        >
                          {cat.toUpperCase()}
                        </li>
                      ))}
                    </div>
                  </ul>
                </>
              )}
            </div>

            {/* CSS qismiga (index.css yoki global css) buni qo'shib qo'ysangiz scrollbar chiroyli bo'ladi */}
            <style jsx>{`
              .custom-scrollbar::-webkit-scrollbar {
                width: 4px;
              }
              .custom-scrollbar::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.1);
              }
              .custom-scrollbar::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.3);
                border-radius: 10px;
              }
            `}</style>

            <div className="relative inline-block">
              {/* 📅 Sana Tugmasi */}
              <button
                type="button" // 👈 BU JUDA MUHIM
                onClick={() => setIsDateModalOpen(true)}
                className="flex items-center gap-2.5 px-5 py-2.5 
    bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 
    text-white rounded-full font-bold shadow-[0_10px_20px_-5px_rgba(249,115,22,0.4)]
    hover:from-orange-600 hover:to-red-700 hover:shadow-[0_15px_30px_-5px_rgba(249,115,22,0.6)]
    transition-all duration-300 active:scale-95 border border-white/10 text-[11px] uppercase tracking-widest"
              >
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-white/20">
                  <Calendar size={14} />
                </div>
                <span>
                  {startDate && endDate
                    ? `${startDate} - ${endDate}`
                    : "Sana bo'yicha"}
                </span>
              </button>

              {/* 🖼 MODAL */}
              {isDateModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
                    onClick={() => setIsDateModalOpen(false)}
                  ></div>

                  {/* Modal Content - Div ishlatamiz, Form emas! */}
                  <div
                    className="relative bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl animate-in zoom-in duration-300 border border-slate-100"
                    onClick={(e) => e.stopPropagation()} // Modal ichini bossa yopilib ketmasligi uchun
                  >
                    <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
                      <Calendar className="text-orange-500" /> Sana oralig'ini
                      tanlang
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400 ml-2 mb-1 block">
                          Dan (Start Date)
                        </label>
                        <input
                          type="date"
                          value={startDate}
                          onKeyDown={(e) =>
                            e.key === "Enter" && e.preventDefault()
                          }
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-medium text-slate-700"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400 ml-2 mb-1 block">
                          Gacha (End Date)
                        </label>
                        <input
                          type="date"
                          value={endDate}
                          onKeyDown={(e) =>
                            e.key === "Enter" && e.preventDefault()
                          } // 👈 Enter bosilganda refreshni to'xtatish
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-medium text-slate-700"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 mt-8">
                      <button
                        type="button" // 👈 Refreshga qarshi
                        onClick={() => {
                          setStartDate("");
                          setEndDate("");
                          setIsDateModalOpen(false);
                        }}
                        className="flex-1 py-3.5 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-all text-sm"
                      >
                        Tozalash
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPage(1);
                          setIsDateModalOpen(false);
                        }}
                        className="flex-1 py-3.5 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-2xl font-bold shadow-lg shadow-orange-200 hover:brightness-110 transition-all text-sm"
                      >
                        Filtrni qo'llash
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="relative inline-block self-start">
              {/* BUTTON - Gradiyent, Maksimal Rounded va Neon Effect */}
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 px-5 py-2.5 
    bg-gradient-to-r from-[#10b981] via-[#059669] to-teal-600 
    text-white rounded-full 
    shadow-[0_10px_30px_-10px_rgba(16,185,129,0.7)]
    hover:from-[#059669] hover:via-[#047857] hover:to-teal-700
    hover:shadow-[0_15px_35px_-10px_rgba(16,185,129,0.8)]
    transition-all duration-300 active:scale-95 font-bold text-xs tracking-wider"
              >
                {/* Modern & Fully Rounded ICON */}
                <div
                  className={`flex items-center justify-center w-7 h-7 rounded-full transition-colors duration-300 ${
                    open ? "bg-white/20" : "bg-white/10"
                  }`}
                >
                  <FileText size={14} className="text-white" />
                </div>

                {/* Matn - Bosh harflar bilan va Ixcham */}
                <span className="truncate uppercase">
                  {selected ? selected.label : "СКАЧАТЬ ОТЧЁТ"}
                </span>

                {/* Chevron - Rangi va rotate effekti */}
                <ChevronDown
                  size={14}
                  className={`text-white/70 transition-transform duration-300 ${
                    open ? "rotate-180 text-white" : ""
                  }`}
                />
              </button>

              {/* DROPDOWN - Modern Floating effect (O'zgarishsiz qoldi) */}
              {open && (
                <>
                  {/* backdrop */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setOpen(false)}
                  ></div>

                  <div className="absolute left-0 mt-3 w-52 bg-white border border-slate-100 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.1)] z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="p-2">
                      {options.map((opt) => (
                        <div
                          key={opt.value}
                          onClick={() => handleSelect(opt)}
                          className="flex items-center gap-3 px-4 py-3 cursor-pointer 
              rounded-xl hover:bg-emerald-500/10 transition-all group"
                        >
                          <span className="text-lg group-hover:scale-110 transition-transform">
                            {opt.icon}
                          </span>

                          <span className="font-semibold text-[13px] text-slate-700 group-hover:text-emerald-600">
                            {opt.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* STATS CARDS (O'zingniki qoldi) */}
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
                <div className="pt-4 border-t border-indigo-400/30 flex justify-between items-center">
                  <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-wider">
                    За {stats.year - 1} год было:
                  </p>
                  <p className="text-lg font-black text-white/90">
                    {stats.prevYearTotal.toLocaleString()}{" "}
                    <span className="text-[10px]">UZS</span>
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-5 px-6 rounded-[28px] border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center shrink-0">
                <Receipt size={22} />
              </div>
              <div className="w-full">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Расход за {stats.monthName}
                </p>
                <p className="text-xl font-black text-slate-800">
                  {stats.currentMonthSum.toLocaleString()}{" "}
                  <span className="text-[10px] text-slate-400">UZS</span>
                </p>
                <div className="mt-2 text-right border-t border-slate-50 pt-1">
                  <span className="text-[9px] text-slate-400 font-bold uppercase">
                    {stats.prevMonthName}:{" "}
                  </span>
                  <span className="text-[10px] font-black text-indigo-500">
                    {stats.prevMonthSum.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-white p-5 px-6 rounded-[28px] border-2 border-amber-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center shrink-0">
                <Layers size={22} />
              </div>
              <div className="w-full">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Чеков за {stats.monthName}
                </p>
                <p className="text-xl font-black text-slate-800">
                  {stats.currentMonthChecks}{" "}
                  <span className="text-amber-500 text-[10px]">шт</span>
                </p>
                <div className="mt-2 text-right border-t border-slate-50 pt-1">
                  <span className="text-[9px] text-slate-400 font-bold uppercase">
                    {stats.prevMonthName}:{" "}
                  </span>
                  <span className="text-[10px] font-black text-amber-600">
                    {stats.prevMonthChecks} шт
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* JADVAL (O'zingniki qoldi) */}
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
                        onClick={() => deleteMutation.mutate(item._id)}
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
          {/* 1. LIMIT SELECTOR & INFO SECTION */}
          <div className="flex flex-col md:flex-row items-center gap-6 w-full justify-center">
            {/* Limit tanlash (Sonlar) */}
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

            {/* Vertikal ajratgich (Faqat kompyuterda ko'rinadi) */}
            <div className="hidden md:block w-[1px] h-10 bg-slate-200 mx-2"></div>

            {/* Ma'lumot ko'rsatkichi (Kapsula dizayni) */}
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

          {/* 2. MAIN PAGINATION CONTROLLER (SAHIFALAR) */}
          <div className="relative p-2 bg-white rounded-[32px] border border-slate-100 shadow-[0_20px_50px_-12px_rgba(79,70,229,0.12)]">
            <div className="flex items-center gap-2">
              {/* Orqaga */}
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="w-12 h-12 flex items-center justify-center rounded-2xl text-slate-400 hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-10 transition-all active:scale-90"
              >
                <ArrowLeft size={20} />
              </button>

              {/* Sahifa raqamlari */}
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

              {/* Oldinga */}
              <button
                disabled={page >= (serverResponse?.totalPages || 1)}
                onClick={() => setPage((p) => p + 1)}
                className="w-12 h-12 flex items-center justify-center rounded-2xl text-slate-400 hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-10 transition-all active:scale-90"
              >
                <ArrowLeft size={20} className="rotate-180" />
              </button>
            </div>
          </div>

          {/* 3. FOOTER TIP */}
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
