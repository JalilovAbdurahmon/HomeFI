import React, { useState, useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  X,
  ShoppingBag,
  Calendar,
  FileText,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Pencil,
  Trash2,
  AlertCircle,
  Trash,
  FilterX,
  LayoutGrid,
  Leaf,
  Beef,
  GlassWater,
  Inbox,
  SearchX,
  Bookmark,
  Home,
  Cylinder,
  RefreshCcw,
  Milk,
  Search,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import instance from "../../utils/axios";
import { exportProductsToExcel } from "../../utils/exportHelpers";
import { exportProductsToPDF } from "../../utils/exportHelpers";
import ProductIcon from "../../components/ProductsIcon";

const Products = () => {
  const [activeQuick, setActiveQuick] = useState(null);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(6);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [editingProduct, setEditingProduct] = useState(null);
  const [openDateModal, setOpenDateModal] = useState(false);
  const [dateFilter, setDateFilter] = useState({ from: "", to: "" });
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const limits = [6, 12, 18, 48];
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeInput, setActiveInput] = useState("from"); // 'from' yoki 'to'
  const dropdownRef = useRef(null);
  const dayRef = useRef(null);
  const monthRef = useRef(null);
  const yearRef = useRef(null);

  const queryClient = useQueryClient();

  // Tashqarini bosganda yopish mantiqi
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (quickOptions && quickOptions.length > 0) {
      setActiveQuick(quickOptions[0].id);
    }
  }, []);

  useEffect(() => {
    if (openDateModal) {
      // 1. DEFAULT QIYMAT: Agar inputlar bo'sh bo'lsa, bugungi sanani o'rnatamiz
      if (!dateFilter.from && !dateFilter.to) {
        const now = new Date();
        const d = String(now.getDate()).padStart(2, "0");
        const m = months[now.getMonth()];
        const y = now.getFullYear();
        const today = `${d}.${m}.${y}`;

        setDateFilter({ from: today, to: today });
        setActiveQuick("today"); // "Сегодня" tugmasini yashil qiladi
      }

      // 2. SCROLL MANTIQI:
      const timer = setTimeout(() => {
        const alignToIndicator = (containerRef) => {
          if (containerRef.current) {
            // Tanlangan (yashil) elementni qidiramiz
            const activeItem = containerRef.current.querySelector(
              ".text-\\[\\#14d1c9\\]"
            );

            if (activeItem) {
              const container = containerRef.current;
              const targetScroll =
                activeItem.offsetTop -
                container.offsetHeight / 2 +
                activeItem.offsetHeight / 2;

              container.scrollTo({
                top: targetScroll,
                behavior: "smooth",
              });
            }
          }
        };

        alignToIndicator(dayRef);
        alignToIndicator(monthRef);
        alignToIndicator(yearRef);
      }, 150); // Sanalar o'rnashib olishi uchun ozgina kutamiz

      return () => clearTimeout(timer);
    }
  }, [openDateModal, activeInput, dateFilter.from, dateFilter.to]);

  // 1. Bugungi sanani aniqlovchi obyekt
  const now = new Date();

  // 2. Kunlar (doimgidek 31 ta)
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const months = [
    "01",
    "02",
    "03",
    "04",
    "05",
    "06",
    "07",
    "08",
    "09",
    "10",
    "11",
    "12",
  ];

  // 4. Yillar (Dinamik variant: o'tgan yildan boshlab kelasi 5 yilgacha)
  const currentYear = now.getFullYear();
  const years = Array.from({ length: 7 }, (_, i) => currentYear - 1 + i);
  // Bu senga [2025, 2026, 2027, 2028, 2029, 2030, 2031] kabi ro'yxat yasab beradi

  // 5. Bugungi kun formati (YYYY-MM-DD) - State uchun tayyorlab olamiz
  const todayFormatted = now.toISOString().split("T")[0];

  const quickOptions = [
    { id: "today", label: "Сегодня" },
    { id: "yesterday", label: "Вчера" },
    { id: "thisWeek", label: "Эта неделя" },
    { id: "lastWeek", label: "Прошлая неделя" },
    { id: "thisMonth", label: "Этот месяц" },
    { id: "lastMonth", label: "Прошлый месяц" },
    { id: "thisYear", label: "Этот год" },
    { id: "lastYear", label: "Прошлый год" },
  ];

  const getTodayFormatted = () => {
    const now = new Date();
    const d = String(now.getDate()).padStart(2, "0");
    const m = months[now.getMonth()]; // Oylar massividan nomini oladi
    const y = now.getFullYear();
    return `${d}.${m}.${y}`;
  };

  const updateWheelDate = (type, value) => {
    const currentStr = activeInput === "from" ? dateFilter.from : dateFilter.to;

    // 1. Sanani bo'laklarga bo'lamiz va tozalaymiz
    let parts = currentStr ? currentStr.split(".") : ["ДД", "ММ", "ГГГГ"];

    // Har doim 3 ta element bo'lishini ta'minlash (nuqtalar ko'payib ketmasligi uchun)
    let d = parts[0] || "ДД";
    let m = parts[1] || "ММ";
    let y = parts[2] || "ГГГГ";

    // 2. Faqat o'zgargan qismni yangilaymiz
    if (type === "day") d = String(value).padStart(2, "0");
    if (type === "month") m = months[value]; // Oy nomi (masalan: "апр.")
    if (type === "year") y = String(value);

    const newDateStr = `${d}.${m}.${y}`;

    // 3. Agar qiymat o'zgargan bo'lsa, stateni yangilaymiz
    if (newDateStr !== currentStr) {
      setDateFilter((prev) => ({
        ...prev,
        [activeInput]: newDateStr,
      }));
      setActiveQuick(null);
    }
  };

  const setQuickFilter = (type) => {
    const now = new Date();

    // 1. CHROYLI FORMATLASH FUNKSIYASI
    // Bu funksiya sanani "30.апрель.2026" formatiga o'tkazadi
    const formatDateCustom = (date) => {
      const d = String(date.getDate()).padStart(2, "0");
      const m = months[date.getMonth()]; // Senda bor bo'lgan oylar massivi
      const y = date.getFullYear();
      return `${d}.${m}.${y}`;
    };

    let from, to;

    switch (type) {
      case "today":
        from = to = formatDateCustom(now);
        break;
      case "yesterday":
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        from = to = formatDateCustom(yesterday);
        break;
      case "thisWeek":
        const dayOfWeek = now.getDay();
        const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const monday = new Date(now);
        monday.setDate(now.getDate() - diffToMonday);
        from = formatDateCustom(monday);
        to = formatDateCustom(now);
        break;
      case "lastWeek":
        const lastMonday = new Date(now);
        const lastSunday = new Date(now);
        const currentDay = now.getDay() === 0 ? 7 : now.getDay();
        lastMonday.setDate(now.getDate() - currentDay - 6);
        lastSunday.setDate(now.getDate() - currentDay);
        from = formatDateCustom(lastMonday);
        to = formatDateCustom(lastSunday);
        break;
      case "thisMonth":
        from = formatDateCustom(new Date(now.getFullYear(), now.getMonth(), 1));
        to = formatDateCustom(now);
        break;
      case "lastMonth":
        from = formatDateCustom(
          new Date(now.getFullYear(), now.getMonth() - 1, 1)
        );
        to = formatDateCustom(new Date(now.getFullYear(), now.getMonth(), 0));
        break;
      case "thisYear":
        from = formatDateCustom(new Date(now.getFullYear(), 0, 1));
        to = formatDateCustom(now);
        break;
      case "lastYear":
        from = formatDateCustom(new Date(now.getFullYear() - 1, 0, 1));
        to = formatDateCustom(new Date(now.getFullYear() - 1, 11, 31));
        break;
      default:
        return;
    }

    // 2. STATELARNI YANGILASH
    setDateFilter({ from, to });
    setActiveQuick(type); // Tugmani yashil qilish uchun
    setPage(1);

    // 3. WHEEL PICKERLARNI HARAKATGA KELTIRISH
    // Agar biz "from" inputini tahrirlayotgan bo'lsak, wheel pickerlar yangi sanaga scroll bo'ladi
    setActiveInput("from");
  };

  const quickFilterScrollRef = useRef(null);
  const [dragInfo, setDragInfo] = useState({
    isActive: false,
    xStart: 0,
    scrollStart: 0,
    moved: false,
  });

  const onQuickFilterDragStart = (e) => {
    const el = quickFilterScrollRef.current;
    if (!el) return;

    setDragInfo({
      isActive: true,
      xStart: e.pageX - el.offsetLeft,
      scrollStart: el.scrollLeft,
      moved: false,
    });
  };

  const onQuickFilterDragEnd = () => {
    setDragInfo((prev) => ({ ...prev, isActive: false }));
  };

  const onQuickFilterDragging = (e) => {
    if (!dragInfo.isActive) return;

    const el = quickFilterScrollRef.current;
    if (!el) return;

    e.preventDefault();
    const currentX = e.pageX - el.offsetLeft;
    const distance = (currentX - dragInfo.xStart) * 2;

    if (Math.abs(currentX - dragInfo.xStart) > 5) {
      setDragInfo((prev) => ({ ...prev, moved: true }));
    }

    el.scrollLeft = dragInfo.scrollStart - distance;
  };

  const handleMouseLeaveOrUp = () => {
    const slider = scrollRef.current;
    if (!slider) return;
    slider.isDown = false;
    slider.style.cursor = "grab";
  };

  const handleMouseMove = (e) => {
    const slider = scrollRef.current;
    if (!slider || !slider.isDown) return;

    e.preventDefault();
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - slider.startX) * 1.5; // Scroll tezligi
    slider.scrollLeft = slider.scrollLeftStart - walk;
  };

  const handleExport = (format) => {
    if (format === "excel") {
      exportProductsToExcel(productsData?.items, dateFilter);
    } else if (format === "pdf") {
      exportProductsToPDF(productsData?.items, dateFilter);
    }
    setShowExportMenu(false);
  };

  const { data: productsData, isLoading } = useQuery({
    queryKey: [
      "products",
      page,
      limit,
      selectedCategory,
      dateFilter,
      searchTerm, // 🔥 NEW
    ],
    queryFn: async () => {
      const res = await instance.get("/products");
      const allData = res.data || [];

      let filteredData = [...allData];

      // ===============================
      // 🔍 SEARCH FILTER
      // ===============================
      if (searchTerm?.trim()) {
        filteredData = filteredData.filter((item) =>
          item.title?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // ===============================
      // 📦 CATEGORY FILTER
      // ===============================
      if (selectedCategory !== "all") {
        filteredData = filteredData.filter((item) => {
          const itemCatId = item.productsCategory?._id || item.productsCategory;
          return itemCatId === selectedCategory;
        });
      }

      // ===============================
      // 📅 DATE FILTER (FIXED SAFE VERSION)
      // ===============================
      if (dateFilter.from || dateFilter.to) {
        filteredData = filteredData.filter((item) => {
          const itemDate = new Date(item.dateOfPayment);

          const from = dateFilter.from
            ? new Date(dateFilter.from.split(".").reverse().join("-"))
            : null;

          const to = dateFilter.to
            ? new Date(dateFilter.to.split(".").reverse().join("-"))
            : null;

          // =========================
          // 🔥 1. FAQAT 1 TA SANa
          // =========================
          if (from && !to) {
            return itemDate.toDateString() === from.toDateString();
          }

          // =========================
          // 🔥 2. FAQAT TO
          // =========================
          if (!from && to) {
            return itemDate.toDateString() === to.toDateString();
          }

          // =========================
          // 🔥 3. FROM + TO (RANGE)
          // =========================
          if (from && to) {
            return itemDate >= from && itemDate <= to;
          }

          return true;
        });
      }

      // ===============================
      // 🔃 SORT (NEW → OLD)
      // ===============================
      const sortedData = filteredData.sort(
        (a, b) => new Date(b.dateOfPayment) - new Date(a.dateOfPayment)
      );

      // ===============================
      // 📄 PAGINATION
      // ===============================
      const total = sortedData.length;

      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      return {
        items: sortedData.slice(startIndex, endIndex),
        totalCount: total,
      };
    },
  });

  const { data: unitsResponse } = useQuery({
    queryKey: ["getEdinisaIzmereniya"],
    queryFn: async () => {
      const res = await instance.get("/edinisaIzmereniya");
      return res.data;
    },
  });

  // 🔥 PRODUCTS CATEGORY FETCH
  const { data: categoriesResponse } = useQuery({
    queryKey: ["productsCategory"],
    queryFn: async () => {
      const res = await instance.get("/productsCategory");
      return res.data;
    },
  });

  // 🔥 DYNAMIC CATEGORY
  const categories = useMemo(() => {
    const backendCats = (categoriesResponse || []).map((c) => ({
      id: c._id,
      name: c.title,
    }));

    return [{ id: "all", name: "Все категории" }, ...backendCats];
  }, [categoriesResponse]);

  const allUnits = useMemo(() => unitsResponse || [], [unitsResponse]);
  const totalPages = Math.ceil((productsData?.totalCount || 0) / limit);

  // Pagination xavfsizligi: jami sahifalar kamaysa, page-ni to'g'irlaydi
  useEffect(() => {
    // Agar hozirgi sahifa jami sahifalar sonidan katta bo'lib ketsa
    if (productsData?.totalCount > 0 && page > totalPages) {
      setPage(totalPages);
    }
  }, [productsData?.totalCount, totalPages, page, setPage]);

  // --- FORMS ---
  const createForm = useForm();
  const updateForm = useForm();

  // const setupAutoSum = (form) => {
  //   const qty = form.watch("quantity");
  //   const price = form.watch("priceForOne");
  //   useEffect(() => {
  //     form.setValue("sum", (Number(qty) || 0) * (Number(price) || 0));
  //   }, [qty, price, form]);
  // };

  // setupAutoSum(createForm);
  // setupAutoSum(updateForm);

  // --- MUTATIONS (create, update, delete) o'zgarishsiz qoldi ---
  const createMutation = useMutation({
    mutationFn: async (data) => await instance.post("/products", data),
    onSuccess: () => {
      queryClient.invalidateQueries(["products"]);
      toast.success("Данные успешно добавлены", {
        style: { borderRadius: "16px", background: "#1e293b", color: "#fff" },
      });
      closeAddModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data) =>
      await instance.put(
        `/products/${editingProduct._id || editingProduct.id}`,
        data
      ),

    onSuccess: async () => {
      await queryClient.invalidateQueries(["products"]); // 🔥 kutish shart

      toast.success("Данные успешно обновлены", {
        style: { borderRadius: "16px", background: "#1e293b", color: "#fff" },
      });

      closeEditModal(); // endi to‘g‘ri vaqtda yopiladi
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => await instance.delete(`/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["products"]);
      toast.success("Успешно удалено", {
        style: {
          borderRadius: "16px",
          background: "#fef2f2",
          color: "#991b1b",
        },
      });
    },
  });

  const confirmDelete = (id) => {
    // 1. Agar id kelmagan bo'lsa, funksiyani to'xtatish (himoya)
    if (!id) return;

    // 2. Eskilarini tozalash (Rasmda chiqqan "poyezd"ni to'xtatadi)
    toast.dismiss();

    // 3. Yangi toast chiqarish
    toast(
      (t) => (
        <div className="flex flex-col gap-3 p-1">
          <div className="flex items-center gap-2 text-slate-800">
            <Trash size={18} className="text-red-500" />
            <span className="font-bold text-sm">
              Вы уверены, что хотите удалить?
            </span>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg"
            >
              Отмена
            </button>
            <button
              onClick={() => {
                // MUHIM: Mana shu yerda id to'g'ri uzatilyapti
                deleteMutation.mutate(id);
                toast.dismiss(t.id);
              }}
              className="px-4 py-1.5 text-xs font-bold bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition-colors"
            >
              Да, удалить
            </button>
          </div>
        </div>
      ),
      {
        id: "confirm-delete", // Bu ID 2-marta bosilganda yangisi chiqishini to'xtatadi
        duration: 6000,
        position: "top-center",
        style: { borderRadius: "24px", background: "#fff", padding: "16px" },
      }
    );
  };

  const handleUpdateSubmit = (data) => {
    if (!updateForm.formState.isDirty) {
      toast("Данные не изменены", {
        icon: "ℹ️",
        style: { borderRadius: "16px" },
      });
      closeEditModal();
      return;
    }
    const user = JSON.parse(localStorage.getItem("user"));
    updateMutation.mutate({ ...data, user: user?._id || user?.id });
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    updateForm.reset({
      title: product.title,
      dateOfPayment: product.dateOfPayment,
      edinisaIzmereniya:
        product.edinisaIzmereniya?._id || product.edinisaIzmereniya,
      productsCategory:
        product.productsCategory?._id || product.productsCategory,
      quantity: product.quantity,
      priceForOne: product.priceForOne,
    });
    setOpenEdit(true);
  };

  const closeAddModal = () => {
    setOpenAdd(false);
    createForm.reset();
  };
  const closeEditModal = () => {
    setOpenEdit(false);
    setEditingProduct(null);
    updateForm.reset();
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page, limit, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 font-sans text-slate-900">
      <Toaster position="top-center" reverseOrder={false} />

      {/* HEADER */}
      <div className="max-w-7xl mx-auto flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tighter italic uppercase">
            Еда и Покупки
          </h1>
          <p className="text-slate-400 font-bold text-sm">
            Управление расходами
          </p>
        </div>
        <button
          onClick={() => {
            createForm.reset();
            setOpenAdd(true);
          }}
          className="group relative flex items-center gap-3 bg-gradient-to-br from-[#4f6fee] via-[#3b59ce] to-[#2a44a5] text-white px-8 py-4 rounded-[20px] font-black tracking-wide overflow-hidden transition-all duration-300 hover:scale-[1.03] active:scale-95 shadow-[0_10px_20px_-5px_rgba(59,89,206,0.4)] hover:shadow-[0_20px_30px_-10px_rgba(59,89,206,0.6)]"
        >
          {/* Chiroyli "Glass" effekt beruvchi yaltiroq qatlam */}
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Ikonka animatsiyasi */}
          <div className="relative flex items-center justify-center bg-white/20 p-1.5 rounded-xl group-hover:rotate-90 transition-transform duration-500">
            <Plus size={20} strokeWidth={3} className="drop-shadow-md" />
          </div>

          <span className="relative drop-shadow-md">ДОБАВИТЬ</span>

          {/* Tugma chetidagi yashirin nurli effekt */}
          <div className="absolute -inset-full top-0 block h-full w-1/2 -skew-x-12 z-5 bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shine_1s_ease-in-out]" />
        </button>
        {/* Agar tailwind configda shine animatsiyasi bo'lmasa, buni CSS-ga qo'shish kerak */}
        <style jsx>{`
          @keyframes shine {
            0% {
              left: -100%;
              transition-property: left;
            }
            100% {
              left: 125%;
            }
          }

          .group:hover .group-hover\:animate-shine {
            animation: shine 0.5s ease-in-out; /* 1s dan 0.6s ga tushirdik, darrov yonadi */
          }
        `}</style>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-4">
          {/* ========================================================================
      1. TEPADAGI ASBOBLAR PANELI (Jadvaldan tashqarida, o'ngga yopishgan)
      ======================================================================== */}
          <div className="flex justify-start items-center gap-3 ml-6">
            {/* --- DATA TUGMASI --- */}
            <button
              onClick={() => setOpenDateModal(true)}
              className="h-[54px] flex items-center gap-3 bg-[#2e5cdb] text-white px-6 rounded-[20px] font-bold shadow-lg shadow-blue-200 active:scale-95 transition-all"
            >
              <Calendar size={18} />
              <span className="text-sm">
                {dateFilter.from
                  ? dateFilter.to
                    ? `${dateFilter.from} / ${dateFilter.to}`
                    : dateFilter.from
                  : "Дата"}
              </span>
            </button>

            {openDateModal && (
              <div className="fixed inset-0 z-[250] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-md p-0 sm:p-4">
                {/* Konteynerga 'relative' qo'shildi */}
                <div className="bg-white w-full max-w-md rounded-t-[40px] sm:rounded-[45px] p-8 shadow-[0_-20px_50px_rgba(0,0,0,0.1)] animate-in slide-in-from-bottom-10 duration-500 relative">
                  {/* --- 1. X TUGMASI (O'NG TEPADA) --- */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();

                      // X bosilganda "Сбросить" mantiqini takrorlaymiz
                      setDateFilter({ from: "", to: "" }); // Sanalarni o'chiramiz
                      setActiveQuick(null); // Quick-filtr tanlovini o'chiramiz

                      // Modalni yopamiz
                      setOpenDateModal(false);
                    }}
                    type="button"
                    className="absolute top-8 right-8 p-2 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-[#14d1c9] transition-all active:scale-95 z-[300]"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>

                  {/* 2. YOPISH CHIZIG'I (MOBIL UCHUN) */}
                  <div
                    className="w-16 h-1.5 bg-slate-100 rounded-full mx-auto mb-8 cursor-pointer hover:bg-slate-200 transition-colors"
                    onClick={() => setOpenDateModal(false)}
                  ></div>

                  <h3 className="text-2xl font-[900] text-slate-800 mb-8 px-2 italic uppercase tracking-tighter leading-none">
                    Выбрать <span className="text-[#14d1c9]">период</span>
                  </h3>

                  {/* --- TEPADAGI INPUTLAR --- */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {["from", "to"].map((type) => {
                      const val = dateFilter[type];
                      const displayDate =
                        !val || val === "ДД.ММ.ГГГГ" ? "ДД.ММ.ГГГГ" : val;

                      return (
                        <div
                          key={type}
                          onClick={() => setActiveInput(type)}
                          className={`p-4 rounded-[25px] border-2 transition-all cursor-pointer ${
                            activeInput === type
                              ? "border-[#14d1c9] bg-emerald-50"
                              : "border-slate-50"
                          }`}
                        >
                          <p className="text-[10px] font-black text-slate-400 uppercase mb-1">
                            {type === "from" ? "Начало" : "Конец"}
                          </p>
                          <p
                            className={`font-black ${
                              displayDate === "ДД.ММ.ГГГГ"
                                ? "text-slate-300"
                                : "text-slate-700"
                            }`}
                          >
                            {displayDate}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* --- ASOSIY WHEEL PICKER --- */}
                  <div className="relative h-48 flex bg-slate-50/50 rounded-[35px] border border-slate-100 overflow-hidden mb-8 shadow-inner">
                    <div className="absolute inset-x-0 h-12 top-1/2 -translate-y-1/2 bg-[#14d1c9]/10 border-y border-[#14d1c9]/20 pointer-events-none z-10"></div>

                    {/* KUNLAR */}
                    <div
                      ref={dayRef}
                      className="flex-1 overflow-y-auto wheel-scroll snap-y snap-mandatory py-[72px]"
                    >
                      {days.map((d) => {
                        const currentStr =
                          activeInput === "from"
                            ? dateFilter.from
                            : dateFilter.to;
                        const isSelected =
                          currentStr?.split(".")[0] ===
                          String(d).padStart(2, "0");
                        return (
                          <div
                            key={d}
                            onClick={() => updateWheelDate("day", d)}
                            className={`h-12 flex items-center justify-center snap-center font-bold cursor-pointer transition-all duration-300 ${
                              isSelected
                                ? "text-[#14d1c9] text-xl scale-110"
                                : "text-slate-300 text-sm"
                            }`}
                          >
                            {d}
                          </div>
                        );
                      })}
                    </div>

                    {/* OYLAR */}
                    <div
                      ref={monthRef}
                      className="flex-1 overflow-y-auto wheel-scroll snap-y snap-mandatory py-[72px]"
                    >
                      {months.map((m, i) => {
                        const currentStr =
                          activeInput === "from"
                            ? dateFilter.from
                            : dateFilter.to;
                        const isSelected = currentStr?.split(".")[1] === m;
                        return (
                          <div
                            key={m}
                            onClick={() => updateWheelDate("month", i)}
                            className={`h-12 flex items-center justify-center snap-center font-bold cursor-pointer transition-all duration-300 ${
                              isSelected
                                ? "text-[#14d1c9] text-xl scale-110"
                                : "text-slate-300 text-sm"
                            }`}
                          >
                            {m}
                          </div>
                        );
                      })}
                    </div>

                    {/* YILLAR */}
                    <div
                      ref={yearRef}
                      className="flex-1 overflow-y-auto wheel-scroll snap-y snap-mandatory py-[72px]"
                    >
                      {years.map((y) => {
                        const currentStr =
                          activeInput === "from"
                            ? dateFilter.from
                            : dateFilter.to;
                        const isSelected =
                          currentStr?.split(".")[2] === String(y);
                        return (
                          <div
                            key={y}
                            onClick={() => updateWheelDate("year", y)}
                            className={`h-12 flex items-center justify-center snap-center font-bold cursor-pointer transition-all duration-300 ${
                              isSelected
                                ? "text-[#14d1c9] text-xl scale-110"
                                : "text-slate-300 text-sm"
                            }`}
                          >
                            {y}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* QUICK FILTERS */}
                  <div className="mt-8">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[2.5px] mb-4 ml-1">
                      БЫСТРЫЙ ФИЛЬТР
                    </p>

                    <div className="relative -mx-8">
                      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none z-10" />

                      <div
                        ref={quickFilterScrollRef}
                        onMouseDown={onQuickFilterDragStart}
                        onMouseLeave={onQuickFilterDragEnd}
                        onMouseUp={onQuickFilterDragEnd}
                        onMouseMove={onQuickFilterDragging}
                        className="overflow-x-auto px-8 no-scrollbar select-none cursor-grab active:cursor-grabbing"
                      >
                        <div className="flex gap-3 py-4 w-max">
                          {quickOptions.map((opt) => {
                            const isActive = activeQuick === opt.id;
                            return (
                              <button
                                key={opt.id}
                                onClick={() => {
                                  if (!dragInfo.moved) {
                                    setQuickFilter(opt.id);
                                    setActiveQuick(opt.id);
                                    setActiveInput("from");
                                  }
                                }}
                                className={`px-6 py-3 rounded-full font-extrabold text-[13px] transition-all duration-300 shrink-0 ${
                                  isActive
                                    ? "bg-[#14d1c9] text-white shadow-[0_10px_20px_rgba(20,209,201,0.3)] scale-105"
                                    : "bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-100"
                                }`}
                              >
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex gap-3 w-full mt-8">
                    <button
                      onClick={() => {
                        setDateFilter({ from: "", to: "" });
                        setActiveQuick(null);
                        setPage(1);
                        setOpenDateModal(false);
                      }}
                      className="flex-1 py-5 bg-slate-100 text-slate-500 font-bold text-lg rounded-[25px] uppercase tracking-tighter"
                    >
                      Сбросить
                    </button>
                    <button
                      onClick={() => {
                        setPage(1);
                        setOpenDateModal(false);
                      }}
                      className="flex-[2] py-5 bg-[#14d1c9] text-white font-[900] text-xl rounded-[25px] shadow-lg uppercase italic tracking-tighter"
                    >
                      Применить
                    </button>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => {
                const isDateActive = dateFilter.from || dateFilter.to;
                const isCategoryActive = selectedCategory !== "all";

                if (!isDateActive && !isCategoryActive) {
                  return toast("Фильтры еще не применены", { icon: "ℹ️" });
                }

                // 🔥 MESSAGE BUILD
                let message = "";

                if (isDateActive && isCategoryActive) {
                  message = "Сбросить фильтр даты и категории?";
                } else if (isDateActive) {
                  message = "Сбросить фильтр даты?";
                } else if (isCategoryActive) {
                  message = "Сбросить фильтр категории?";
                }

                setActiveQuick(null); // 🔥 THIS IS THE FIX

                toast(
                  (t) => (
                    <div className="flex flex-col gap-3 p-1">
                      <div className="flex items-center gap-2 text-slate-800">
                        <FilterX size={18} className="text-red-500" />
                        <span className="font-bold text-sm text-slate-800">
                          {message}
                        </span>
                      </div>

                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          onClick={() => toast.dismiss(t.id)}
                          className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg"
                        >
                          Отмена
                        </button>

                        <button
                          onClick={() => {
                            if (isDateActive) {
                              setDateFilter({ from: "", to: "" });
                            }

                            if (isCategoryActive) {
                              setSelectedCategory("all");
                            }

                            setPage(1);
                            toast.dismiss(t.id);
                            toast.success("Фильтры очищены");
                          }}
                          className="px-4 py-1.5 text-xs font-bold bg-red-500 text-white rounded-lg shadow-md"
                        >
                          Да, сбросить
                        </button>
                      </div>
                    </div>
                  ),
                  { duration: 4000, position: "top-center" }
                );
              }}
              className="h-[54px] min-w-[54px] flex items-center justify-center bg-white text-red-500 rounded-[20px] border border-slate-100 shadow-sm hover:bg-red-50 active:scale-95 transition-all"
            >
              <FilterX size={20} />
            </button>

            {/* --- SEARCH KONTEYNERI --- */}
            <div className="relative flex items-center h-[54px]">
              <div
                onClick={() => !isSearchOpen && setIsSearchOpen(true)} // Faqat yopiq bo'lsa ochadi
                className={`relative flex items-center bg-white border border-slate-100 shadow-sm rounded-[20px] transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                  isSearchOpen
                    ? "w-[280px] px-4 shadow-lg ring-2 ring-blue-500/10 cursor-default"
                    : "w-[54px] cursor-pointer hover:bg-slate-50"
                } h-full`}
              >
                {/* ICON (SEARCH yoki X) */}
                <div
                  className={`flex items-center justify-center transition-all duration-500 ${
                    isSearchOpen
                      ? "relative w-6"
                      : "absolute inset-0 m-auto w-full h-full"
                  }`}
                >
                  <div
                    className={`transition-colors ${
                      isSearchOpen
                        ? "text-blue-600 cursor-pointer"
                        : "text-slate-400"
                    } hover:text-blue-700`}
                    onClick={(e) => {
                      if (isSearchOpen) {
                        e.stopPropagation(); // Konteyner onClick'ini to'xtatamiz
                        setSearchTerm(""); // Tekstni tozalaymiz 🔥
                        setIsSearchOpen(false); // Inputni yopamiz
                      }
                    }}
                  >
                    {isSearchOpen ? (
                      <X size={18} strokeWidth={2.5} />
                    ) : (
                      <Search size={18} strokeWidth={2.5} />
                    )}
                  </div>
                </div>

                {/* INPUT */}
                <input
                  type="text"
                  autoFocus={isSearchOpen}
                  placeholder="Ввести..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()} // Input ichini bosganda yopilmaydi
                  className={`bg-transparent outline-none text-sm font-bold text-slate-700 transition-all duration-300 ${
                    isSearchOpen
                      ? "ml-3 opacity-100 w-full"
                      : "opacity-0 w-0 pointer-events-none"
                  }`}
                />
              </div>
            </div>

            {/* --- EXPORT (OTCHYOT) TUGMASI --- */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="h-[54px] flex items-center gap-3 bg-[#10a37f] text-white px-6 rounded-[20px] font-bold shadow-lg shadow-emerald-1  00 active:scale-95 transition-all"
              >
                <FileText size={18} /> <span className="text-sm">Отчёт</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-300 ${
                    showExportMenu ? "rotate-180" : ""
                  }`}
                />
              </button>
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-slate-100 z-[110] overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <button
                    onClick={() => handleExport("excel")}
                    className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 font-bold text-sm transition-colors border-b border-slate-50"
                  >
                    <div className="w-8 h-8 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
                      <FileText size={16} />
                    </div>{" "}
                    Excel (.xlsx)
                  </button>
                  <button
                    onClick={() => handleExport("pdf")}
                    className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 font-bold text-sm transition-colors"
                  >
                    <div className="w-8 h-8 bg-red-50 text-red-600 rounded-lg flex items-center justify-center">
                      <FileText size={16} />
                    </div>{" "}
                    PDF (.pdf)
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ========================================================================
      2. ASOSIY JADVAL BLOKI (Oq konteyner)
      ======================================================================== */}
          <div className="bg-white rounded-[35px] p-8 shadow-sm border border-slate-50">
            {/* --- JADVAL ICHIDAGI SARLAVHA --- */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1.5 h-8 bg-[#3b59ce] rounded-full"></div>
              <h2 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter">
                Чеки из:{" "}
                <span className="text-[#3b59ce]">
                  {categories.find((c) => c.id === selectedCategory)?.name ||
                    "Все категории"}
                </span>
              </h2>
            </div>

            {/* --- CARDLAR LISTI (Scroll qismi) --- */}
            <div
              className={`grid grid-cols-1 md:grid-cols-2 gap-4 mb-10 overflow-y-auto pr-2 custom-scroll-container content-start transition-all duration-300 ${
                productsData?.items?.length > 0 ? "h-[600px]" : "h-auto"
              }`}
            >
              {isLoading ? (
                <div className="col-span-2 py-20 text-center font-black text-slate-200 text-2xl uppercase italic animate-pulse">
                  Загрузка...
                </div>
              ) : productsData?.items?.length > 0 ? (
                productsData.items.map((item) => {
                  return (
                    <div
                      key={item._id || item.id}
                      className="flex flex-col justify-between p-5 bg-[#f8fafc] rounded-[28px] border border-transparent hover:border-slate-200 hover:bg-white hover:shadow-xl transition-all group h-[185px] w-full"
                    >
                      {/* Card tepasi */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <ProductIcon name={item.title} />
                          <div>
                            <p className="font-bold text-slate-800 text-[15px] truncate max-w-[120px] lg:max-w-[160px]">
                              {item.title}
                            </p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                              {item.dateOfPayment}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-2.5 bg-white/80 text-indigo-600 rounded-2xl shadow-sm border border-indigo-50 hover:bg-indigo-600 hover:text-white transition-all"
                          >
                            <Pencil size={14} strokeWidth={2.5} />
                          </button>
                          <button
                            type="button"
                            // deleteMutation.isLoading (yoki isPending) vaqtida tugmani muzlatamiz
                            disabled={deleteMutation.isLoading}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation(); // Card'ning o'zi bosilib ketmasligi uchun
                              confirmDelete(item._id || item.id);
                            }}
                            className={`p-2.5 bg-white/80 text-[#f43f5e] rounded-2xl shadow-sm border border-[#fff1f2] transition-all ${
                              deleteMutation.isLoading
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:bg-[#f43f5e] hover:text-white active:scale-90"
                            }`}
                          >
                            {deleteMutation.isLoading ? (
                              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Trash2 size={14} strokeWidth={2.5} />
                            )}
                          </button>
                        </div>
                      </div>
                      {/* Card pastki qismi */}
                      <div className="mt-1 pt-2 border-t border-slate-100 flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <div className={`px-2.5 py-0.5 rounded-lg`}>
                            <span
                              className={`text-[9px] font-black uppercase tracking-widest`}
                            >
                              Расход
                            </span>
                          </div>
                          <p className="text-[13px] font-bold text-slate-600">
                            {item.quantity || 0}{" "}
                            <span className="text-[9px] text-slate-400">
                              {item.edinisaIzmereniya?.title || "шт"}
                            </span>
                          </p>
                        </div>
                        <div className="flex items-end justify-between">
                          <p className="text-[11px] text-slate-400 font-bold">
                            <span className="text-[9px] mr-1">Цена:</span>
                            {item.priceForOne?.toLocaleString()}
                          </p>
                          <p className="font-black text-base text-slate-800 italic leading-none">
                            {item.sum?.toLocaleString()}{" "}
                            <small className="text-[9px] text-slate-400 ml-1 not-italic uppercase">
                              uzs
                            </small>
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-2 py-20 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
                  <div className="relative w-20 h-20 bg-slate-50 rounded-[24px] flex items-center justify-center text-slate-300 border border-slate-100">
                    <SearchX size={40} strokeWidth={1.5} />
                  </div>
                  <h3 className="mt-4 text-slate-800 font-black text-xl uppercase italic">
                    Ma'lumot topilmadi
                  </h3>
                </div>
              )}
            </div>

            {/* ========================================================================
        3. PAGINATION QISMI (Jadval ichida, pastda)
        ======================================================================== */}
            <div className="pt-8 border-t border-slate-50 flex flex-col items-center gap-6">
              <div className="w-full flex justify-between items-center">
                {/* Sahifa Limiti (Dropdown) */}
                <div className="relative">
                  <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 bg-white text-slate-500 font-bold text-[11px] py-2 px-4 rounded-xl shadow-sm border border-slate-200 min-w-[140px] justify-between"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="uppercase tracking-widest text-[9px] text-slate-400">
                        Лимит:
                      </span>
                      <span className="text-[#3b59ce] -mt-1 font-black text-xs">
                        {limit} линий
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-[#3b59ce] transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white rounded-xl shadow-2xl border border-slate-100 p-1 z-[120]">
                      {limits.map((num) => (
                        <button
                          key={num}
                          onClick={() => {
                            setLimit(num);
                            setPage(1);
                            setIsOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                            limit === num
                              ? "bg-[#3b59ce] text-white"
                              : "text-slate-600 hover:bg-blue-50"
                          }`}
                        >
                          {num} линий
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Ma'lumotlar hisoblagichi */}
                <div className="bg-[#f0f5ff] px-6 py-3 rounded-2xl flex items-center justify-center gap-2 font-bold text-[11px] text-slate-500 uppercase tracking-wider border border-blue-50">
                  <span>Показано</span>
                  <span className="text-[#3b59ce] -mt-1 font-black text-[13px]">
                    {productsData?.totalCount === 0
                      ? 0
                      : (page - 1) * limit + 1}{" "}
                    – {Math.min(page * limit, productsData?.totalCount || 0)}
                  </span>
                  <span>из</span>
                  <span className="text-slate-900 -mt-1 font-black text-[13px]">
                    {productsData?.totalCount || 0}
                  </span>
                </div>
              </div>

              {/* Sahifa raqamlari (Pagination buttons) */}
              <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-[20px] shadow-lg border border-slate-100">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="p-2 rounded-full text-slate-400 hover:bg-slate-50 disabled:opacity-30 transition-all active:scale-90"
                >
                  <ChevronLeft size={16} />
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages || 0 }, (_, i) => i + 1).map(
                    (n) => (
                      <button
                        key={n}
                        onClick={() => setPage(n)}
                        className={`w-9 h-9 rounded-lg text-xs font-black transition-all active:scale-95 ${
                          page === n
                            ? "bg-[#3b59ce] text-white shadow-md scale-105"
                            : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                        }`}
                      >
                        {n}
                      </button>
                    )
                  )}
                </div>

                <button
                  disabled={page >= totalPages || totalPages === 0}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-2 rounded-full text-slate-400 hover:bg-slate-50 disabled:opacity-30 transition-all active:scale-90"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
              <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-50 rounded-full border border-slate-100">
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse"></div>
                <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">
                  Используйте стрелки для быстрой навигации
                </p>
              </div>
            </div>
          </div>

          {/* ========================================================================
      4. DATE PICKER MODAL (Fixed Overlay)
      ======================================================================== */}
          {openDateModal && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
              <div className="bg-white w-full max-w-md rounded-[35px] p-8 shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 flex items-center justify-center bg-blue-50 text-blue-600 rounded-2xl border border-blue-100 shadow-sm">
                      <Calendar size={20} />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 italic uppercase">
                      Фильтр по дате
                    </h3>
                  </div>
                  <button
                    onClick={() => setOpenDateModal(false)}
                    className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Начало
                    </label>
                    <input
                      type="date"
                      value={dateFilter.from}
                      onChange={(e) =>
                        setDateFilter((prev) => ({
                          ...prev,
                          from: e.target.value,
                        }))
                      }
                      className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Конец
                    </label>
                    <input
                      type="date"
                      value={dateFilter.to}
                      onChange={(e) =>
                        setDateFilter((prev) => ({
                          ...prev,
                          to: e.target.value,
                        }))
                      }
                      className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-10">
                  <button
                    onClick={() => {
                      setDateFilter({ from: "", to: "" });
                      setPage(1);
                      setOpenDateModal(false);
                    }}
                    className="flex-1 py-4 rounded-[22px] bg-slate-100 text-slate-500 font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-all"
                  >
                    Очистить
                  </button>
                  <button
                    onClick={() => {
                      setPage(1);
                      setOpenDateModal(false);
                    }}
                    className="flex-1 py-4 rounded-[22px] bg-[#3b59ce] text-white font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
                  >
                    Применить
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* --- O'NG TARAFF: DINAMIK CATEGORY CARDS --- */}
        <div className="lg:col-span-4 space-y-4 mt-[82px]">
          <div className="flex flex-col gap-4">
            {categories.map((cat) => {
              // 1. Funksiya faqat ma'lumotlarni saralab bersin
              const getCategoryDetails = (id, name) => {
                const lowerName = name.toLowerCase();
                if (id === "all")
                  return {
                    icon: <LayoutGrid size={22} />,
                    color: "text-blue-600",
                    bg: "bg-blue-50",
                  };
                if (lowerName.includes("хоз") || lowerName.includes("uy"))
                  return {
                    icon: <Home size={22} />,
                    color: "text-[#059669]",
                    bg: "bg-[#ecfdf5]",
                  };
                if (lowerName.includes("бан") || lowerName.includes("idish"))
                  return {
                    icon: <Cylinder size={22} />,
                    color: "text-[#d97706]",
                    bg: "bg-[#fffbeb]",
                  };
                if (lowerName.includes("сохр") || lowerName.includes("saqlan"))
                  return {
                    icon: <Bookmark size={22} />,
                    color: "text-[#e11d48]",
                    bg: "bg-[#fff1f2]",
                  };
                if (lowerName.includes("час") || lowerName.includes("ko'p"))
                  return {
                    icon: <RefreshCcw size={22} />,
                    color: "text-[#7c3aed]",
                    bg: "bg-[#f5f3ff]",
                  };
                return {
                  icon: <ShoppingBag size={22} />,
                  color: "text-#475569",
                  bg: "bg-[#f8fafc]",
                };
              };

              // 2. Detallarni o'zgaruvchiga olamiz
              const details = getCategoryDetails(cat.id, cat.name);
              const isActive = selectedCategory === cat.id;

              return (
                <div
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setPage(1);
                  }}
                  className={`cursor-pointer group relative overflow-hidden p-4 rounded-[24px] border-2 transition-all duration-500 ${
                    isActive
                      ? "bg-white border-[#3b59ce] shadow-[0_20px_40px_-12px_rgba(59,89,206,0.2)] -translate-x-3"
                      : "bg-slate-50/50 border-transparent hover:bg-white hover:border-slate-200 hover:shadow-lg"
                  }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-0 h-full w-1.5 bg-[#3b59ce] rounded-r-full" />
                  )}

                  <div className="flex justify-between items-center relative z-10">
                    <div className="flex items-center gap-4">
                      {/* IKONKA KONTEYNERI */}
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm ${
                          isActive
                            ? "bg-[#3b59ce] text-white rotate-[360deg] shadow-blue-200"
                            : // Mana bu yerda detallardan ranglarni ishlatamiz
                              `${details.bg} ${details.color} group-hover:scale-110`
                        }`}
                      >
                        {/* Obyektni emas, faqat ikonkani chiqaramiz */}
                        {details.icon}
                      </div>

                      <div>
                        <h3
                          className={`font-black text-[9px] uppercase tracking-[0.2em] transition-colors ${
                            isActive ? "text-[#3b59ce]" : "text-slate-400"
                          }`}
                        >
                          Категория
                        </h3>
                        <p
                          className={`font-black text-[15px] mt-0.5 transition-colors ${
                            isActive ? "text-slate-900" : "text-slate-600"
                          }`}
                        >
                          {cat.name}
                        </p>
                      </div>
                    </div>

                    {/* O'NG TOMONDAGI INDICATOR */}
                    <div className="flex items-center">
                      {isActive ? (
                        <div className="flex gap-1">
                          <div className="w-1 h-4 bg-[#3b59ce] rounded-full animate-bounce [animation-delay:-0.3s]" />
                          <div className="w-1 h-4 bg-[#3b59ce] rounded-full animate-bounce [animation-delay:-0.15s]" />
                          <div className="w-1 h-4 bg-[#3b59ce] rounded-full animate-bounce" />
                        </div>
                      ) : (
                        <ChevronRight
                          size={18}
                          className="text-slate-300 group-hover:text-slate-500 transition-transform group-hover:translate-x-1"
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* MODALS (ModalStructure pastda o'zgarishsiz qoladi) */}
      {openAdd && (
        <ModalStructure
          title="Добавить расход"
          close={closeAddModal}
          form={createForm}
          submit={(data) => {
            const user = JSON.parse(localStorage.getItem("user"));
            createMutation.mutate({
              ...data,
              user: user?._id || user?.id,
              category: data.category,
            });
          }}
          units={allUnits}
          categories={categories}
          btnText="Добавить запись"
        />
      )}
      {openEdit && (
        <ModalStructure
          title="Изменить расход"
          close={closeEditModal}
          form={updateForm}
          submit={handleUpdateSubmit}
          units={allUnits}
          categories={categories}
          btnText="Сохранить изменения"
        />
      )}
    </div>
  );
};

// ModalStructure o'zgarishsiz qoldi (kodni tejash uchun pastki qismini yozmadim, o'zingizniki tursin)
const ModalStructure = ({
  title,
  close,
  form,
  submit,
  units,
  categories,
  btnText,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = form;
  const baseInputClass =
    "w-full p-4 rounded-2xl bg-slate-50 border outline-none font-bold transition-all";
  const getBorderClass = (fieldName) =>
    errors[fieldName] ? "border-red-500" : "border-slate-200";

  const ErrorMsg = ({ name }) =>
    errors[name] ? (
      <div className="flex items-center gap-1 text-red-500 text-[10px] font-bold ml-2 mt-1 uppercase italic animate-in fade-in">
        <AlertCircle size={11} strokeWidth={3} />{" "}
        <span>{errors[name].message}</span>
      </div>
    ) : null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
      <div className="bg-white w-full max-w-lg rounded-[40px] p-10 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-8 border-b pb-4">
          <h2 className="text-2xl font-black text-slate-800 italic uppercase tracking-tighter">
            {title}
          </h2>
          <button
            onClick={close}
            className="p-2 bg-slate-100 rounded-full hover:bg-red-50 hover:text-red-500 transition-all"
          >
            <X size={20} />
          </button>
        </div>
        <form
          onSubmit={handleSubmit(submit)}
          className="grid grid-cols-2 gap-5"
        >
          <div className="relative col-span-2 mt-2">
            {/* 1. Input va Label uchun alohida konteyner */}
            <div className="relative">
              <input
                type="text"
                id="title"
                {...register("title", { required: "Введите название" })}
                placeholder=" "
                className={`${baseInputClass} peer w-full px-4 py-4 bg-white border-2 border-slate-200 rounded-2xl 
      text-slate-900 placeholder-transparent focus:outline-none focus:border-blue-500 
      focus:ring-4 focus:ring-blue-50 transition-all min-h-[58px]`}
              />

              <label
                htmlFor="title"
                className="absolute left-4 top-[18px] text-slate-400 text-sm transition-all duration-200 
      pointer-events-none px-1 bg-white
      /* Fokus bo'lganda yoki yozuv bo'lganda borderga chiqish */
      peer-focus:-top-2 peer-focus:left-3 peer-focus:text-xs peer-focus:text-blue-600 peer-focus:z-10
      peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:z-10"
              >
                Название
              </label>
            </div>

            {/* 2. Error xabari alohida divdan tashqarida */}
            <ErrorMsg name="title" />
          </div>
          <div className="relative mt-2">
            {/* 1. Input va Labelni alohida divga o'raymiz (bu muhim!) */}
            <div className="relative">
              <input
                type="text"
                id="dateOfPayment"
                {...register("dateOfPayment", { required: "Выберите дату" })}
                placeholder=" "
                onFocus={(e) => (e.target.type = "date")}
                onBlur={(e) => {
                  if (!e.target.value) {
                    e.target.type = "text";
                  }
                }}
                className={`${baseInputClass} peer w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-2xl 
      text-slate-900 placeholder-transparent focus:outline-none focus:border-blue-500 
      focus:ring-4 focus:ring-blue-50 transition-all 
      flex items-center min-h-[54px] [&::-webkit-calendar-picker-indicator]:cursor-pointer`}
              />

              <label
                htmlFor="dateOfPayment"
                className="absolute left-4 top-[18px] text-slate-400 text-sm transition-all duration-200 
      pointer-events-none px-1 bg-white
      /* Fokus bo'lganda yoki yozuv bo'lganda borderga chiqish */
      peer-focus:-top-2 peer-focus:left-3 peer-focus:text-xs peer-focus:text-blue-600 peer-focus:z-10
      peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:z-10"
              >
                Дата
              </label>
            </div>

            {/* ErrorMsg inputning dividan tashqarida bo'lishi kerak */}
            <ErrorMsg name="dateOfPayment" />
          </div>
          <div className="relative mt-2">
            <div className="relative">
              <select
                {...register("edinisaIzmereniya", {
                  required: "Выберите ед.изм.",
                })}
                defaultValue="" // ❗ bo‘sh
                className="peer w-full px-4 py-3 pr-10 bg-white border-2 border-slate-200 
      rounded-2xl appearance-none outline-none transition-all cursor-pointer
      text-slate-900
      focus:border-blue-500 focus:ring-4 focus:ring-blue-50 hover:border-slate-300"
              >
                {/* 🔥 FAKE DEFAULT */}
                <option value="" disabled hidden>
                  шт
                </option>

                {units.map((unit) => (
                  <option key={unit._id} value={unit._id}>
                    {unit.title}
                  </option>
                ))}
              </select>

              {/* FLOATING LABEL */}
              <label
                className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 
      transition-all duration-200 pointer-events-none px-1 bg-white
      peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:text-blue-600
      peer-valid:top-0 peer-valid:-translate-y-1/2 peer-valid:text-xs peer-valid:text-blue-600"
              >
                Ед. изм.
              </label>

              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 peer-focus:text-blue-500 transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>
            </div>

            <ErrorMsg name="edinisaIzmereniya" />
          </div>
          <div className="col-span-2 relative group">
            {/* Label (border ustida) */}
            <label
              className="absolute -top-2 left-4 bg-white px-1 text-xs text-slate-500
    transition-colors text-blue-600 z-10"
            >
              Категория
            </label>

            <div className="relative">
              <select
                {...register("productsCategory", {
                  required: "Выберите категорию",
                })}
                defaultValue=""
                className="w-full appearance-none bg-slate-50 border-2 border-slate-200
      rounded-2xl px-4 py-3 pr-10 text-slate-700 font-medium
      focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100
      outline-none transition-all cursor-pointer hover:border-slate-300"
              >
                <option value="" disabled hidden>
                  Выберите...
                </option>

                {categories
                  .filter((cat) => cat.id !== "all")
                  .map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
              </select>

              {/* Arrow */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
            </div>

            <ErrorMsg name="productsCategory" />
          </div>
          <div className="relative group mt-2">
            <div className="relative">
              <input
                type="number"
                step="0.01"
                placeholder=" " // Bu bo'sh joy floating effekt uchun shart!
                {...register("quantity", {
                  required: "Укажите кол-во",
                  min: { value: 0.01, message: "Мин 0.01" },
                })}
                className={`${baseInputClass} peer w-full px-4 py-3 bg-white border-2 border-slate-200 
      rounded-2xl outline-none transition-all
      focus:border-blue-500 focus:ring-4 focus:ring-blue-50`}
              />

              {/* FLOATING LABEL */}
              <label
                className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 
      transition-all duration-200 pointer-events-none
      bg-white px-1
      /* Fokus bo'lganda borderga chiqishi */
      peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:text-blue-600 peer-focus:z-10
      /* Ma'lumot kiritilganda (placeholder ko'rinmayotganda) borderda qolishi */
      peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:-translate-y-1/2 
      peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-blue-600 peer-[:not(:placeholder-shown)]:z-10"
              >
                Кол-во
              </label>
            </div>

            <ErrorMsg name="quantity" />
          </div>
          <div className="relative group mt-2">
            <div className="relative">
              <input
                type="number"
                id="price"
                {...register("priceForOne", {
                  required: "Укажите цену",
                  min: {
                    value: 0,
                    message: "Цена не может быть отрицательной",
                  },
                })}
                placeholder=" "
                className={`${baseInputClass} peer w-full px-4 py-3 pr-16 bg-white border-2 border-slate-200 rounded-2xl 
        text-slate-900 placeholder-transparent focus:outline-none focus:border-blue-500 
        focus:ring-4 focus:ring-blue-50 transition-all`}
              />

              {/* Floating Label - Borderning qoq ustiga chiqadigan variant */}
              <label
                htmlFor="price"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm transition-all duration-200 
        pointer-events-none px-1 bg-transparent
        /* Fokus bo'lgandagi holat */
        peer-focus:-top-2 peer-focus:translate-y-0 peer-focus:left-3 peer-focus:text-[11px] peer-focus:text-blue-600 peer-focus:bg-white peer-focus:z-10
        /* Ichida yozuv bo'lgandagi holat */
        peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:z-10"
              >
                Цена (за ед.)
              </label>

              {/* O'ng tarafdagi UZS yozuvi */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 font-bold text-[10px] tracking-tight peer-focus:text-blue-600 transition-colors">
                UZS
              </div>
            </div>

            <ErrorMsg name="priceForOne" />
          </div>

          {/* <div className="col-span-2 space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">
              Сумма
            </label>
            <input
              type="number"
              {...register("sum")}
              readOnly
              className="w-full p-4 rounded-2xl bg-blue-50 text-blue-700 font-black border border-blue-100 outline-none"
            />
          </div> */}
          <button
            type="submit"
            className="col-span-2 w-full mt-3 py-4 rounded-[24px] font-black text-base uppercase italic tracking-widest
    bg-gradient-to-r from-[#4f46e5] via-[#3b59ce] to-[#2563eb] 
    text-white shadow-[0_10px_25px_-5px_rgba(59,89,206,0.4)]
    border-t border-white/20 
    relative overflow-hidden transition-all duration-300
    hover:scale-[1.02] hover:shadow-[0_15px_30px_-5px_rgba(59,89,206,0.6)]
    active:scale-[0.98]
    before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent 
    before:-translate-x-full hover:before:translate-x-full before:transition-transform before:duration-700"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {btnText}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Products;
