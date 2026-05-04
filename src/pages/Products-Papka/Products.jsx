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
  SearchX,
  Bookmark,
  Home,
  Cylinder,
  RefreshCcw,
  Search,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import instance from "../../utils/axios";
import { exportProductsToExcel } from "../../utils/exportHelpers";
import { exportProductsToPDF } from "../../utils/exportHelpers";
import ProductIcon from "../../components/ProductsIcon";
import ModalStructure from "../Products-Papka/ProductsCreateForm";

const Products = () => {
  const [activeQuick, setActiveQuick] = useState(null);
  // ✅ TO'G'RI: barcha state'lar component ichida, return'dan OLDIN
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("expense"); // "expense" yoki "income"
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
  const [activeInput, setActiveInput] = useState("from");
  const dropdownRef = useRef(null);
  const dayRef = useRef(null);
  const monthRef = useRef(null);
  const yearRef = useRef(null);

  // --- AUTOCOMPLETE STATE ---
  const [productSearch, setProductSearch] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const queryClient = useQueryClient();

  // ✅ TO'G'RI: barcha useForm hook'lar component ichida, shartlarsiz
  const createForm = useForm({
    defaultValues: { type: "expense" },
  });
  const updateForm = useForm();

  const { setValue: setCreateValue } = createForm;

  // Modal ochish funksiyalari
  const openAddModal = (type = "expense") => {
    createForm.reset({ type });
    setModalType(type);
    setProductSearch("");
    setIsModalOpen(true);
  };

  // Tashqarini bosganda yopish
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
      if (!dateFilter.from && !dateFilter.to) {
        const now = new Date();
        const d = String(now.getDate()).padStart(2, "0");
        const m = months[now.getMonth()];
        const y = now.getFullYear();
        const today = `${d}.${m}.${y}`;
        setDateFilter({ from: today, to: today });
        setActiveQuick("today");
      }

      const timer = setTimeout(() => {
        const alignToIndicator = (containerRef) => {
          if (containerRef.current) {
            const activeItem = containerRef.current.querySelector(
              ".text-\\[\\#14d1c9\\]"
            );
            if (activeItem) {
              const container = containerRef.current;
              const targetScroll =
                activeItem.offsetTop -
                container.offsetHeight / 2 +
                activeItem.offsetHeight / 2;
              container.scrollTo({ top: targetScroll, behavior: "smooth" });
            }
          }
        };
        alignToIndicator(dayRef);
        alignToIndicator(monthRef);
        alignToIndicator(yearRef);
      }, 150);

      return () => clearTimeout(timer);
    }
  }, [openDateModal, activeInput, dateFilter.from, dateFilter.to]);

  // Qidiruv effekti
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (productSearch && productSearch.trim().length > 0) {
        try {
          const res = await instance.get(
            `/titleProducts?search=${productSearch}`
          );
          setSearchSuggestions(res.data || []);
          setIsSuggestionsOpen(true);
        } catch (err) {
          console.error("Backend qidiruvda xato:", err);
        }
      } else {
        setSearchSuggestions([]);
        setIsSuggestionsOpen(false);
      }
    }, 200);
    return () => clearTimeout(delayDebounceFn);
  }, [productSearch]);

  const now = new Date();
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
  const currentYear = now.getFullYear();
  const years = Array.from({ length: 7 }, (_, i) => currentYear - 1 + i);
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

  const updateWheelDate = (type, value) => {
    const currentStr = activeInput === "from" ? dateFilter.from : dateFilter.to;
    let parts = currentStr ? currentStr.split(".") : ["ДД", "ММ", "ГГГГ"];
    let d = parts[0] || "ДД";
    let m = parts[1] || "ММ";
    let y = parts[2] || "ГГГГ";
    if (type === "day") d = String(value).padStart(2, "0");
    if (type === "month") m = months[value];
    if (type === "year") y = String(value);
    const newDateStr = `${d}.${m}.${y}`;
    if (newDateStr !== currentStr) {
      setDateFilter((prev) => ({ ...prev, [activeInput]: newDateStr }));
      setActiveQuick(null);
    }
  };

  const setQuickFilter = (type) => {
    const now = new Date();
    const formatDateCustom = (date) => {
      const d = String(date.getDate()).padStart(2, "0");
      const m = months[date.getMonth()];
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
    setDateFilter({ from, to });
    setActiveQuick(type);
    setPage(1);
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

  const handleExport = (format) => {
    if (format === "excel")
      exportProductsToExcel(productsData?.items, dateFilter);
    else if (format === "pdf")
      exportProductsToPDF(productsData?.items, dateFilter);
    setShowExportMenu(false);
  };

  const { data: productsData, isLoading } = useQuery({
    queryKey: [
      "products",
      page,
      limit,
      selectedCategory,
      dateFilter,
      searchTerm,
    ],
    queryFn: async () => {
      const res = await instance.get("/products");
      const allData = res.data || [];
      let filteredData = [...allData];

      if (searchTerm?.trim()) {
        filteredData = filteredData.filter((item) =>
          item.title?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (selectedCategory !== "all") {
        filteredData = filteredData.filter((item) => {
          const itemCatId = item.productsCategory?._id || item.productsCategory;
          return itemCatId === selectedCategory;
        });
      }

      if (dateFilter.from || dateFilter.to) {
        filteredData = filteredData.filter((item) => {
          const itemDate = new Date(item.dateOfPayment);
          const from = dateFilter.from
            ? new Date(dateFilter.from.split(".").reverse().join("-"))
            : null;
          const to = dateFilter.to
            ? new Date(dateFilter.to.split(".").reverse().join("-"))
            : null;
          if (from && !to)
            return itemDate.toDateString() === from.toDateString();
          if (!from && to) return itemDate.toDateString() === to.toDateString();
          if (from && to) return itemDate >= from && itemDate <= to;
          return true;
        });
      }

      const sortedData = filteredData.sort(
        (a, b) => new Date(b.dateOfPayment) - new Date(a.dateOfPayment)
      );
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

  const { data: categoriesResponse } = useQuery({
    queryKey: ["productsCategory"],
    queryFn: async () => {
      const res = await instance.get("/productsCategory");
      return res.data;
    },
  });

  const categories = useMemo(() => {
    return (categoriesResponse || []).map((c) => ({
      _id: c._id,
      title: c.title,
    }));
  }, [categoriesResponse]);

  const allUnits = useMemo(() => unitsResponse || [], [unitsResponse]);
  const totalPages = Math.ceil((productsData?.totalCount || 0) / limit);

  useEffect(() => {
    if (productsData?.totalCount > 0 && page > totalPages) {
      setPage(totalPages);
    }
  }, [productsData?.totalCount, totalPages, page]);

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
      await queryClient.invalidateQueries(["products"]);
      toast.success("Данные успешно обновлены", {
        style: { borderRadius: "16px", background: "#1e293b", color: "#fff" },
      });
      closeEditModal();
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
    if (!id) return;
    toast.dismiss();
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
        id: "confirm-delete",
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

  const handleSelectProductFromList = (item) => {
    setProductSearch(item.title);
    const catId =
      typeof item.productsCategory === "object"
        ? item.productsCategory?._id
        : item.productsCategory;
    const unitId =
      typeof item.edinisaIzmereniya === "object"
        ? item.edinisaIzmereniya?._id
        : item.edinisaIzmereniya;
    setCreateValue("title", item.title);
    setCreateValue("productsCategory", catId);
    setCreateValue("edinisaIzmereniya", unitId);
    setIsSuggestionsOpen(false);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    const titleText = product.title?.title || product.title || "";
    setProductSearch(titleText);
    updateForm.reset({
      title: product.title?._id || product.title,
      dateOfPayment: product.dateOfPayment,
      edinisaIzmereniya:
        product.edinisaIzmereniya?._id || product.edinisaIzmereniya,
      productsCategory:
        product.productsCategory?._id || product.productsCategory,
      quantity: product.quantity,
      priceForOne: product.priceForOne,
      type: product.type || "expense",
    });
    setOpenEdit(true);
  };

  // ✅ closeAddModal endi isModalOpen ni yopadi
  const closeAddModal = () => {
    setIsModalOpen(false);
    createForm.reset();
    setProductSearch("");
  };

  const closeEditModal = () => {
    setOpenEdit(false);
    setEditingProduct(null);
    updateForm.reset();
    setProductSearch("");
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

        {/* ✅ ДОБАВИТЬ tugmasi: Приход va Расход */}
        <div className="flex items-center gap-3">
          {/* РАСХОД tugmasi */}
          <button
            onClick={() => openAddModal("expense")}
            className="group relative flex items-center gap-3 bg-gradient-to-br from-[#ef4444] via-[#dc2626] to-[#b91c1c] text-white px-6 py-4 rounded-[20px] font-black tracking-wide overflow-hidden transition-all duration-300 hover:scale-[1.03] active:scale-95 shadow-[0_10px_20px_-5px_rgba(220,38,38,0.4)]"
          >
            <div className="relative flex items-center justify-center bg-white/20 p-1.5 rounded-xl group-hover:rotate-90 transition-transform duration-500">
              <TrendingDown size={18} strokeWidth={3} />
            </div>
            <span className="relative drop-shadow-md text-sm">РАСХОД</span>
          </button>

          {/* ПРИХОД tugmasi */}
          <button
            onClick={() => openAddModal("income")}
            className="group relative flex items-center gap-3 bg-gradient-to-br from-[#4f6fee] via-[#3b59ce] to-[#2a44a5] text-white px-6 py-4 rounded-[20px] font-black tracking-wide overflow-hidden transition-all duration-300 hover:scale-[1.03] active:scale-95 shadow-[0_10px_20px_-5px_rgba(59,89,206,0.4)]"
          >
            <div className="relative flex items-center justify-center bg-white/20 p-1.5 rounded-xl group-hover:rotate-90 transition-transform duration-500">
              <TrendingUp size={18} strokeWidth={3} />
            </div>
            <span className="relative drop-shadow-md text-sm">ПРИХОД</span>
          </button>
        </div>

        <style jsx>{`
          @keyframes shine {
            0% {
              left: -100%;
            }
            100% {
              left: 125%;
            }
          }
        `}</style>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-4">
          {/* TEPADAGI ASBOBLAR PANELI */}
          <div className="flex justify-start items-center gap-3 ml-6">
            {/* DATA TUGMASI */}
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

            {/* DATE MODAL */}
            {openDateModal && (
              <div className="fixed inset-0 z-[250] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-md p-0 sm:p-4">
                <div className="bg-white w-full max-w-md rounded-t-[40px] sm:rounded-[45px] p-8 shadow-[0_-20px_50px_rgba(0,0,0,0.1)] animate-in slide-in-from-bottom-10 duration-500 relative">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDateFilter({ from: "", to: "" });
                      setActiveQuick(null);
                      setOpenDateModal(false);
                    }}
                    type="button"
                    className="absolute top-8 right-8 p-2 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-[#14d1c9] transition-all active:scale-95 z-[300]"
                  >
                    <X size={22} strokeWidth={3} />
                  </button>

                  <div
                    className="w-16 h-1.5 bg-slate-100 rounded-full mx-auto mb-8 cursor-pointer hover:bg-slate-200 transition-colors"
                    onClick={() => setOpenDateModal(false)}
                  />

                  <h3 className="text-2xl font-[900] text-slate-800 mb-8 px-2 italic uppercase tracking-tighter leading-none">
                    Выбрать <span className="text-[#14d1c9]">период</span>
                  </h3>

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

                  <div className="relative h-48 flex bg-slate-50/50 rounded-[35px] border border-slate-100 overflow-hidden mb-8 shadow-inner">
                    <div className="absolute inset-x-0 h-12 top-1/2 -translate-y-1/2 bg-[#14d1c9]/10 border-y border-[#14d1c9]/20 pointer-events-none z-10" />

                    {[
                      {
                        ref: dayRef,
                        items: days,
                        type: "day",
                        getVal: (d) => d,
                        getLabel: (d) => d,
                        getPart: 0,
                      },
                      {
                        ref: monthRef,
                        items: months,
                        type: "month",
                        getVal: (m, i) => i,
                        getLabel: (m) => m,
                        getPart: 1,
                      },
                      {
                        ref: yearRef,
                        items: years,
                        type: "year",
                        getVal: (y) => y,
                        getLabel: (y) => y,
                        getPart: 2,
                      },
                    ].map(({ ref, items, type, getVal, getLabel, getPart }) => (
                      <div
                        key={type}
                        ref={ref}
                        className="flex-1 overflow-y-auto wheel-scroll snap-y snap-mandatory py-[72px]"
                      >
                        {items.map((item, i) => {
                          const currentStr =
                            activeInput === "from"
                              ? dateFilter.from
                              : dateFilter.to;
                          const part = currentStr?.split(".")?.[getPart];
                          const isSelected =
                            type === "day"
                              ? part === String(item).padStart(2, "0")
                              : type === "month"
                              ? part === item
                              : part === String(item);
                          return (
                            <div
                              key={item}
                              onClick={() =>
                                updateWheelDate(
                                  type,
                                  type === "month" ? i : item
                                )
                              }
                              className={`h-12 flex items-center justify-center snap-center font-bold cursor-pointer transition-all duration-300 ${
                                isSelected
                                  ? "text-[#14d1c9] text-xl scale-110"
                                  : "text-slate-300 text-sm"
                              }`}
                            >
                              {getLabel(item, i)}
                            </div>
                          );
                        })}
                      </div>
                    ))}
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

            {/* FILTER RESET */}
            <button
              onClick={() => {
                const isDateActive = dateFilter.from || dateFilter.to;
                const isCategoryActive = selectedCategory !== "all";
                if (!isDateActive && !isCategoryActive) {
                  return toast("Фильтры еще не применены", { icon: "ℹ️" });
                }
                let message = "";
                if (isDateActive && isCategoryActive)
                  message = "Сбросить фильтр даты и категории?";
                else if (isDateActive) message = "Сбросить фильтр даты?";
                else if (isCategoryActive)
                  message = "Сбросить фильтр категории?";
                setActiveQuick(null);
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
                            if (isDateActive)
                              setDateFilter({ from: "", to: "" });
                            if (isCategoryActive) setSelectedCategory("all");
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

            {/* SEARCH */}
            <div className="relative flex items-center h-[54px]">
              <div
                onClick={() => !isSearchOpen && setIsSearchOpen(true)}
                className={`relative flex items-center bg-white border border-slate-100 shadow-sm rounded-[20px] transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                  isSearchOpen
                    ? "w-[280px] px-4 shadow-lg ring-2 ring-blue-500/10 cursor-default"
                    : "w-[54px] cursor-pointer hover:bg-slate-50"
                } h-full`}
              >
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
                        e.stopPropagation();
                        setSearchTerm("");
                        setIsSearchOpen(false);
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
                <input
                  type="text"
                  autoFocus={isSearchOpen}
                  placeholder="Ввести..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className={`bg-transparent outline-none text-sm font-bold text-slate-700 transition-all duration-300 ${
                    isSearchOpen
                      ? "ml-3 opacity-100 w-full"
                      : "opacity-0 w-0 pointer-events-none"
                  }`}
                />
              </div>
            </div>

            {/* EXPORT */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="h-[54px] flex items-center gap-3 bg-[#10a37f] text-white px-6 rounded-[20px] font-bold shadow-lg active:scale-95 transition-all"
              >
                <FileText size={18} />
                <span className="text-sm">Отчёт</span>
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
                    </div>
                    Excel (.xlsx)
                  </button>
                  <button
                    onClick={() => handleExport("pdf")}
                    className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 font-bold text-sm transition-colors"
                  >
                    <div className="w-8 h-8 bg-red-50 text-red-600 rounded-lg flex items-center justify-center">
                      <FileText size={16} />
                    </div>
                    PDF (.pdf)
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ASOSIY JADVAL BLOKI */}
<div className="bg-white rounded-[35px] p-8 shadow-sm border border-slate-50">
  <div className="flex items-center gap-3 mb-8">
    <div className="w-1.5 h-8 bg-[#3b59ce] rounded-full" />
    <h2 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter">
      Чеки из:{" "}
      <span className="text-[#3b59ce]">
        {categories.find((c) => c._id === selectedCategory)?.title || "Все категории"}
      </span>
    </h2>
  </div>

  <div
    className={`grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 overflow-y-auto pr-2 custom-scroll-container content-start transition-all duration-300 ${
      productsData?.items?.length > 0 ? "max-h-[610px] h-auto" : "h-auto"
    }`}
  >
    {isLoading ? (
      <div className="col-span-2 py-20 text-center font-black text-slate-200 text-3xl uppercase italic animate-pulse">
        Загрузка...
      </div>
    ) : productsData?.items?.length > 0 ? (
      productsData.items.map((item) => {
        const isIncome = item.type === "income";
        
        // 1. ID o'rniga mahsulot nomini olish (Backend populate bo'lsa ham, bo'lmasa ham ishlaydi)
        const displayTitle = typeof item.title === 'object' 
          ? item.title?.title 
          : (item.title || "Без названия");

        return (
          <div
            key={item._id || item.id}
            className="relative flex flex-col justify-between p-6 bg-white rounded-[32px] border border-slate-50 hover:shadow-[0_20px_50px_rgba(0,0,0,0.04)] transition-all duration-500 group h-[190px] w-full hover:-translate-y-1 overflow-hidden"
          >
            {/* Prishod/Rashod badge - Doim tepada */}
            <div
              className={`absolute top-4 right-4 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider z-20 ${
                isIncome ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
              }`}
            >
              {isIncome ? "Приход" : "Расход"}
            </div>

            <div className="relative flex items-start justify-between z-10">
              <div className="flex items-center gap-4">
                <div className="transform group-hover:scale-110 transition-transform duration-500">
                  <ProductIcon name={displayTitle} />
                </div>
                <div>
                  {/* MAHSULOT NOMI - Agar ID bo'lsa displayTitle uni ko'rsatadi */}
                  <h3 className="font-black text-slate-800 text-[16px] leading-tight tracking-tight group-hover:text-indigo-600 transition-colors max-w-[140px] truncate">
                    {displayTitle}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1 opacity-80">
                    {item.dateOfPayment || "Нет даты"}
                  </p>
                </div>
              </div>

              {/* TUGMALAR - Opacity-0 olib tashlandi, mobil va desktopda doim ko'rinadi */}
              <div className="flex items-center gap-2 z-30">
                <button
                  type="button"
                  onClick={() => openEditModal(item)}
                  className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all active:scale-90"
                >
                  <Pencil size={15} strokeWidth={2.5} />
                </button>
                <button
                  type="button"
                  disabled={deleteMutation?.isLoading}
                  onClick={(e) => {
                    e.preventDefault();
                    confirmDelete(item._id || item.id);
                  }}
                  className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all active:scale-90"
                >
                  <Trash2 size={15} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            <div className="relative h-px w-full bg-gradient-to-r from-transparent via-slate-100 to-transparent z-10 my-2" />

            <div className="relative z-10 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className={`text-[9px] font-black uppercase tracking-[2px] ${isIncome ? "text-green-400" : "text-slate-300"}`}>
                  {isIncome ? "Приход" : "Расход"}
                </span>
                <p className="text-[12px] font-black text-slate-600 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                  {item.quantity || 0}{" "}
                  <span className="text-[10px] text-slate-400 ml-0.5">
                    {item.edinisaIzmereniya?.title || "шт"}
                  </span>
                </p>
              </div>

              <div className="flex items-end justify-between">
                <p className="text-[11px] text-slate-400 font-bold">
                  <span className="text-[9px] mr-1 opacity-60">Цена:</span>
                  {item.priceForOne?.toLocaleString()}
                </p>
                <p className={`font-black text-xl italic leading-none tracking-tighter ${isIncome ? "text-green-600" : "text-slate-800"}`}>
                  {isIncome ? "+" : ""}
                  {item.sum?.toLocaleString()}
                  <span className="text-[10px] text-indigo-500 ml-1.5 not-italic uppercase">uzs</span>
                </p>
              </div>
            </div>

            {/* Pastki dekorativ chiziq */}
            <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-1 rounded-t-full transition-all duration-500 group-hover:w-1/3 ${isIncome ? "bg-green-500" : "bg-indigo-500"}`} />
          </div>
        );
      })
    ) : (
      <div className="col-span-2 py-20 flex flex-col items-center justify-center">
        <SearchX size={40} className="text-slate-200" />
        <h3 className="mt-4 text-slate-400 font-black text-lg uppercase italic">Ничего не найдено</h3>
      </div>
    )}
  </div>

  {/* PAGINATION - Ozgarmaydi */}
  <div className="pt-8 border-t border-slate-50 flex flex-col items-center gap-6">
    <div className="w-full flex justify-between items-center">
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 bg-white font-bold text-[11px] py-2 px-4 rounded-xl shadow-sm border border-slate-200 min-w-[140px] justify-between"
        >
          <div className="flex items-center gap-1.5">
            <span className="uppercase tracking-widest text-[9px] text-slate-400">Лимит:</span>
            <span className="text-[#3b59ce] -mt-1 font-black text-xs">{limit} линий</span>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 text-[#3b59ce] transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
        {isOpen && (
          <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white rounded-xl shadow-2xl border border-slate-100 p-1 z-[120]">
            {limits.map((num) => (
              <button
                key={num}
                onClick={() => { setLimit(num); setPage(1); setIsOpen(false); }}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all ${limit === num ? "bg-[#3b59ce] text-white" : "text-slate-600 hover:bg-blue-50"}`}
              >
                {num} линий
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="bg-[#f0f5ff] px-6 py-3 rounded-2xl flex items-center justify-center gap-2 font-bold text-[11px] text-slate-500 uppercase tracking-wider border border-blue-50">
        <span>Показано</span>
        <span className="text-[#3b59ce] -mt-1 font-black text-[13px]">
          {productsData?.totalCount === 0 ? 0 : (page - 1) * limit + 1} – {Math.min(page * limit, productsData?.totalCount || 0)}
        </span>
        <span>из</span>
        <span className="text-slate-900 -mt-1 font-black text-[13px]">{productsData?.totalCount || 0}</span>
      </div>
    </div>

    <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-[20px] shadow-lg border border-slate-100">
      <button
        disabled={page === 1}
        onClick={() => setPage((p) => Math.max(1, p - 1))}
        className="p-2 rounded-full text-slate-400 hover:bg-slate-50 disabled:opacity-30 transition-all active:scale-90"
      >
        <ChevronLeft size={16} />
      </button>
      <div className="flex items-center gap-1">
        {Array.from({ length: totalPages || 0 }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            onClick={() => setPage(n)}
            className={`w-9 h-9 rounded-lg text-xs font-black transition-all active:scale-95 ${page === n ? "bg-[#3b59ce] text-white shadow-md scale-105" : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"}`}
          >
            {n}
          </button>
        ))}
      </div>
      <button
        disabled={page >= totalPages || totalPages === 0}
        onClick={() => setPage((p) => p + 1)}
        className="p-2 rounded-full text-slate-400 hover:bg-slate-50 disabled:opacity-30 transition-all active:scale-90"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  </div>
</div>
        </div>

        {/* O'NG TARAF: CATEGORY CARDS */}
        <div className="lg:col-span-4 space-y-4 mt-[82px]">
          <div className="flex flex-col gap-4">
            {[{ _id: "all", title: "Все категории" }, ...categories].map(
              (cat) => {
                const categoryId = cat._id || cat.id;
                const categoryName = cat.title || cat.name;

                const getCategoryDetails = (id, name) => {
                  const lowerName = name?.toLowerCase() || "";
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
                  if (
                    lowerName.includes("сохр") ||
                    lowerName.includes("saqlan")
                  )
                    return {
                      icon: <Bookmark size={22} />,
                      color: "text-[#e11d48]",
                      bg: "bg-[#fff1f2]",
                    };
                  if (
                    lowerName.includes("час") ||
                    lowerName.includes("ko'p") ||
                    lowerName.includes("sotib")
                  )
                    return {
                      icon: <RefreshCcw size={22} />,
                      color: "text-[#7c3aed]",
                      bg: "bg-[#f5f3ff]",
                    };
                  return {
                    icon: <ShoppingBag size={22} />,
                    color: "text-slate-600",
                    bg: "bg-[#f8fafc]",
                  };
                };

                const details = getCategoryDetails(categoryId, categoryName);
                const isActive = selectedCategory === categoryId;

                return (
                  <div
                    key={categoryId}
                    onClick={() => {
                      setSelectedCategory(categoryId);
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
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm ${
                            isActive
                              ? "bg-[#3b59ce] text-white rotate-[360deg]"
                              : `${details.bg} ${details.color} group-hover:scale-110`
                          }`}
                        >
                          {details.icon}
                        </div>
                        <div>
                          <h3
                            className={`font-black text-[9px] uppercase tracking-[0.2em] transition-colors ${
                              isActive ? "text-[#3b59ce]" : "text-slate-400"
                            }`}
                          >
                            {categoryId === "all"
                              ? "Общий список"
                              : "Категория"}
                          </h3>
                          <p
                            className={`font-black text-[15px] mt-0.5 transition-colors ${
                              isActive ? "text-slate-900" : "text-slate-600"
                            }`}
                          >
                            {categoryName}
                          </p>
                        </div>
                      </div>
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
              }
            )}
          </div>
        </div>
      </div>

      {/* ✅ MODALS — return() ICHIDA, lekin grid'dan tashqarida */}

      {/* ADD MODAL — Приход yoki Расход */}
      {isModalOpen && (
        <ModalStructure
          title={modalType === "income" ? "Добавить приход" : "Добавить расход"}
          close={closeAddModal}
          form={createForm}
          submit={(data) => {
            const user = JSON.parse(localStorage.getItem("user"));
            createMutation.mutate({
              ...data,
              type: modalType, // "income" yoki "expense" backendga jo'natiladi
              user: user?._id || user?.id,
            });
          }}
          units={allUnits}
          categories={categories}
          btnText={
            modalType === "income" ? "Добавить приход" : "Добавить расход"
          }
          productSearch={productSearch}
          setProductSearch={setProductSearch}
          isSuggestionsOpen={isSuggestionsOpen}
          setIsSuggestionsOpen={setIsSuggestionsOpen}
          searchSuggestions={searchSuggestions}
          handleSelectProductFromList={handleSelectProductFromList}
        />
      )}

      {/* EDIT MODAL */}
      {openEdit && (
        <ModalStructure
          title="Изменить расход"
          close={closeEditModal}
          form={updateForm}
          submit={handleUpdateSubmit}
          units={allUnits}
          categories={categories}
          btnText="Сохранить изменения"
          productSearch={productSearch}
          setProductSearch={setProductSearch}
          isSuggestionsOpen={isSuggestionsOpen}
          setIsSuggestionsOpen={setIsSuggestionsOpen}
          searchSuggestions={searchSuggestions}
          handleSelectProductFromList={handleSelectProductFromList}
        />
      )}
    </div>
  );
};

export default Products;
