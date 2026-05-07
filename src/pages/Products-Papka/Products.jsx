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
  ReceiptText,
  RotateCcw,
  HistoryIcon,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import instance from "../../utils/axios";
import { exportProductsToExcel } from "../../utils/exportHelpers";
import { exportProductsToPDF } from "../../utils/exportHelpers";
import ProductIcon from "../../components/ProductsIcon";
import ModalStructure from "../Products-Papka/ProductsCreateForm";
import { useNavigate } from "react-router-dom";

const Products = () => {
  const [activeQuick, setActiveQuick] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("expense");
  const [openEdit, setOpenEdit] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(6);
  const [activeRange, setActiveRange] = useState(12);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [dashboardCategory, setDashboardCategory] = useState("all");
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
  const [historyModalItem, setHistoryModalItem] = useState(null);
  const [movements, setMovements] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [productSearch, setProductSearch] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const queryClient = useQueryClient();
  const nav = useNavigate();

  const createForm = useForm({ defaultValues: { type: "expense" } });
  const updateForm = useForm();
  const { setValue: setCreateValue } = createForm;

  // ✅ FIX: Faqat expense uchun modal ochiladi
  const openAddModal = (type = "expense") => {
    createForm.reset({ type });
    setModalType(type);
    setProductSearch("");
    setIsModalOpen(true);
  };

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
  const onQuickFilterDragEnd = () =>
    setDragInfo((prev) => ({ ...prev, isActive: false }));
  const onQuickFilterDragging = (e) => {
    if (!dragInfo.isActive) return;
    const el = quickFilterScrollRef.current;
    if (!el) return;
    e.preventDefault();
    const currentX = e.pageX - el.offsetLeft;
    const distance = (currentX - dragInfo.xStart) * 2;
    if (Math.abs(currentX - dragInfo.xStart) > 5)
      setDragInfo((prev) => ({ ...prev, moved: true }));
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
      let filteredData = allData.filter((item) => item.type === "expense");
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
      return {
        items: sortedData.slice(startIndex, startIndex + limit),
        totalCount: total,
      };
    },
  });

  // ✅ titleProducts — ID dan nomga o'girish uchun
  const { data: titleProducts = [] } = useQuery({
    queryKey: ["titleProducts"],
    queryFn: async () => {
      const res = await instance.get("/titleProducts");
      return res.data || [];
    },
  });

  const { data: allProductsRaw = [] } = useQuery({
    queryKey: ["allProductsRaw"],
    queryFn: async () => {
      const res = await instance.get("/products");
      return res.data || [];
    },
  });

  const getItemName = (item) => {
    if (typeof item.title === "object")
      return item.title?.title?.trim().toLowerCase() || "";
    return (item.title || "").trim().toLowerCase();
  };

  const getProductHistory = (targetName) => {
    return allProductsRaw
      .filter((item) => getItemName(item) === targetName.trim().toLowerCase())
      .sort((a, b) => new Date(a.dateOfPayment) - new Date(b.dateOfPayment));
  };

  const calcOstatokForItem = (expenseItem) => {
    const targetName = getItemName(expenseItem);
    const expenseDate = new Date(expenseItem.dateOfPayment);
    const expenseId = expenseItem._id || expenseItem.id;
    const history = getProductHistory(targetName);
    let runningBalance = 0;
    let foundCurrent = false;
    for (const item of history) {
      const itemDate = new Date(item.dateOfPayment);
      const qty = Number(item.quantity) || 0;
      const itemId = item._id || item.id;
      if (itemDate > expenseDate) break;
      if (
        itemDate.toDateString() === expenseDate.toDateString() &&
        itemId === expenseId
      ) {
        if (item.type === "income") runningBalance += qty;
        else runningBalance -= qty;
        foundCurrent = true;
        break;
      }
      if (item.type === "income") runningBalance += qty;
      else runningBalance -= qty;
    }
    if (!foundCurrent) {
      runningBalance = 0;
      for (const item of history) {
        const qty = Number(item.quantity) || 0;
        if (item.type === "income") runningBalance += qty;
        else runningBalance -= qty;
      }
    }
    return runningBalance;
  };

  const openHistory = (selectedItem) => {
    setIsHistoryLoading(true);
    setHistoryModalItem(selectedItem);
    setMovements([]);
    try {
      const targetName = getItemName(selectedItem);
      const history = getProductHistory(targetName);
      let runningBalance = 0;
      const historyWithBalance = [];
      for (const item of history) {
        const qty = Number(item.quantity) || 0;
        const beforeBalance = runningBalance;
        if (item.type === "income") runningBalance += qty;
        else runningBalance -= qty;
        historyWithBalance.push({
          ...item,
          amount: qty,
          balanceBefore: beforeBalance,
          balanceAfter: runningBalance,
        });
      }
      setMovements([...historyWithBalance].reverse());
    } catch (error) {
      console.error("Xatolik:", error);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const closeHistoryModal = () => {
    setHistoryModalItem(null);
    setMovements([]);
  };

  const lowStockAlerts = useMemo(() => {
    if (!allProductsRaw.length) return [];
    const totals = {};

    allProductsRaw.forEach((item) => {
      // ID ni kalit sifatida olamiz (bu juda muhim!)
      const titleKey =
        typeof item.title === "object" ? item.title?._id : item.title;

      if (!titleKey) return;

      if (!totals[titleKey]) {
        totals[titleKey] = {
          title: item.title, // Asl title ma'lumotini saqlab qolamiz
          quantity: 0,
        };
      }

      if (item.type === "income") {
        totals[titleKey].quantity += Number(item.quantity || 0);
      } else {
        totals[titleKey].quantity -= Number(item.quantity || 0);
      }
    });

    return Object.values(totals)
      .filter((obj) => obj.quantity > 0 && obj.quantity <= 5)
      .map((obj) => ({
        title: obj.title,
        count: obj.quantity,
      }));
  }, [allProductsRaw]);

  const totalExpense = useMemo(() => {
    if (!allProductsRaw.length) return 0;
    return allProductsRaw
      .filter((item) => {
        if (item.type !== "income") return false;
        const itemDate = new Date(item.dateOfPayment);
        const rangeDate = new Date();
        rangeDate.setMonth(now.getMonth() - activeRange);
        const timeMatch = itemDate >= rangeDate;
        const itemCatId = item.productsCategory?._id || item.productsCategory;
        const categoryMatch =
          dashboardCategory === "all" ? true : itemCatId === dashboardCategory;
        return timeMatch && categoryMatch;
      })
      .reduce((sum, item) => {
        const q = Number(item.quantity) || 0;
        const p = Number(item.priceForOne) || 0;
        return sum + q * p;
      }, 0);
  }, [allProductsRaw, activeRange, dashboardCategory]);
  console.log("productsData items:", productsData?.items?.slice(0, 3));

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
    if (productsData?.totalCount > 0 && page > totalPages) setPage(totalPages);
  }, [productsData?.totalCount, totalPages, page]);

  const createMutation = useMutation({
    mutationFn: (data) => instance.post("/products", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["allProductsRaw"] });
      toast.success("Данные успешно добавлены", {
        style: { borderRadius: "16px", background: "#1e293b", color: "#fff" },
      });
      closeAddModal();
    },
    onError: (error) => {
      toast.error(
        "Ошибка: " + (error.response?.data?.message || error.message)
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data) =>
      await instance.put(
        `/products/${editingProduct._id || editingProduct.id}`,
        data
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      await queryClient.invalidateQueries({ queryKey: ["allProductsRaw"] });
      toast.success("Данные успешно обновлены", {
        style: { borderRadius: "16px", background: "#1e293b", color: "#fff" },
      });
      closeEditModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => await instance.delete(`/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["allProductsRaw"] });
      queryClient.invalidateQueries({ queryKey: ["productsIncome"] });
      toast.success("Удален успешно", {
        style: {
          borderRadius: "16px",
          background: "#fef2f2",
          color: "#991b1b",
        },
      });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "При удалении произошла ошибка"
      );
    },
  });

  const confirmDelete = (id) => {
    if (!id) return;
    toast.dismiss();
    toast(
      ({ closeToast }) => (
        <div className="flex flex-col gap-3 p-1">
          <div className="flex items-center gap-2 text-slate-800">
            <Trash size={18} className="text-red-500" />
            <span className="font-bold text-sm">Удалить этот ТОВАР?</span>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={() => {
                toast.dismiss();
                closeToast();
              }}
              className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={() => {
                deleteMutation.mutate(id);
                toast.dismiss();
                closeToast();
              }}
              className="px-4 py-1.5 text-xs font-bold bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 cursor-pointer"
            >
              Да, удалить
            </button>
          </div>
        </div>
      ),
      {
        toastId: "main-delete-confirm",
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: false,
      }
    );
  };

  const handleUpdateSubmit = (data) => {
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

  // ✅ ASOSIY FIX: openEditModal — title ni to'g'ri ko'rsatish
  // item.title object bo'lsa → item.title.title
  // item.title string (ID) bo'lsa → titleProducts dan qidirib nomini topamiz
  const openEditModal = (product) => {
    setEditingProduct(product);

    // ✅ Mahsulot nomini aniqlash
    let titleText = "";
    if (typeof product.title === "object" && product.title !== null) {
      // title object: { _id, title }
      titleText = product.title?.title || "";
    } else {
      // title string (ID yoki oddiy matn)
      const found = titleProducts.find((p) => p._id === product.title);
      titleText = found ? found.title : product.title || "";
    }

    setProductSearch(titleText);

    // ✅ title ID sini form ga yuboriш
    const titleId =
      typeof product.title === "object" && product.title !== null
        ? product.title._id
        : product.title;

    updateForm.reset({
      title: titleId,
      dateOfPayment: product.dateOfPayment,
      edinisaIzmereniya:
        product.edinisaIzmereniya?._id || product.edinisaIzmereniya,
      productsCategory:
        product.productsCategory?._id || product.productsCategory,
      quantity: product.quantity,
      priceForOne: product.priceForOne,
      // ✅ expense page da har doim expense
      type: "expense",
    });
    setOpenEdit(true);
  };

  // ✅ Edit modalda ham suggestions ishlashi uchun alohida handler
  const handleEditSelectProductFromList = (item) => {
    setProductSearch(item.title);
    const catId =
      typeof item.productsCategory === "object"
        ? item.productsCategory?._id
        : item.productsCategory;
    const unitId =
      typeof item.edinisaIzmereniya === "object"
        ? item.edinisaIzmereniya?._id
        : item.edinisaIzmereniya;
    updateForm.setValue("title", item._id || item.title);
    updateForm.setValue("productsCategory", catId);
    updateForm.setValue("edinisaIzmereniya", unitId);
    setIsSuggestionsOpen(false);
  };

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
        <div className="flex items-center gap-3">
          <button
            onClick={() => openAddModal("expense")}
            className="group relative flex items-center gap-3 bg-gradient-to-br from-[#4f46e5] via-[#3730a3] to-[#1e1b4b]q text-white px-6 py-4 rounded-[20px] font-black tracking-wide overflow-hidden transition-all duration-300 hover:scale-[1.03] active:scale-95 shadow-[0_10px_20px_-5px_rgba(220,38,38,0.4)]"
          >
            <div className="relative flex items-center justify-center bg-white/20 p-1.5 rounded-xl group-hover:rotate-90 transition-transform duration-500">
              <TrendingDown size={18} strokeWidth={3} />
            </div>
            <span className="relative drop-shadow-md text-sm">
              Добавить чек
            </span>
          </button>
          {/* <button
              onClick={() => openAddModal("expense")}
              className="group relative flex items-center gap-3 bg-gradient-to-br from-[#ef4444] via-[#dc2626] to-[#b91c1c] text-white px-6 py-4 rounded-[20px] font-black tracking-wide overflow-hidden transition-all duration-300 hover:scale-[1.03] active:scale-95 shadow-[0_10px_20px_-5px_rgba(220,38,38,0.4)]"
            >
              <div className="relative flex items-center justify-center bg-white/20 p-1.5 rounded-xl group-hover:rotate-90 transition-transform duration-500">
                <TrendingDown size={18} strokeWidth={3} />
              </div>
              <span className="relative drop-shadow-md text-sm">РАСХОД</span>
            </button> */}
          {/* <button
              onClick={() => openAddModal("income")}
              className="group relative flex items-center gap-3 bg-gradient-to-br from-green-500 via-green-600 to-green-700 text-white px-6 py-4 rounded-[20px] font-black tracking-wide overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_15px_30px_-5px_rgba(34,197,94,0.4)] active:scale-95 shadow-[0_10px_20px_-5px_rgba(34,197,94,0.3)]"
            >
              <div className="relative flex items-center justify-center bg-white/20 p-1.5 rounded-xl group-hover:rotate-90 transition-transform duration-500">
                <TrendingUp size={18} strokeWidth={3} />
              </div>
              <span className="relative drop-shadow-md text-sm">ПРИХОД</span>
            </button> */}
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-4">
          {/* TOOLBAR */}
          <div className="flex justify-start items-center gap-3 ml-6">
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
                    className="w-16 h-1.5 bg-slate-100 rounded-full mx-auto mb-8 cursor-pointer hover:bg-slate-200"
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
                        getLabel: (d) => d,
                        getPart: 0,
                      },
                      {
                        ref: monthRef,
                        items: months,
                        type: "month",
                        getLabel: (m) => m,
                        getPart: 1,
                      },
                      {
                        ref: yearRef,
                        items: years,
                        type: "year",
                        getLabel: (y) => y,
                        getPart: 2,
                      },
                    ].map(({ ref, items, type, getLabel, getPart }) => (
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
                if (!isDateActive && !isCategoryActive)
                  return toast("Фильтры еще не применены", { icon: "ℹ️" });
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

            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="h-[48px] flex items-center gap-2 bg-[#10a37f] text-white px-6 rounded-[20px] font-bold shadow-lg active:scale-95 transition-all"
              >
                <FileText size={18} />
                <span className="text-[13px]">Сохранить отчёт</span>
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

          <div className="flex flex-col gap-6">
            {/* LOW STOCK ALERTS */}
            {lowStockAlerts && lowStockAlerts.length > 0 && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-700">
                {/* HEADER */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-8 bg-gradient-to-b from-red-500 to-orange-400 rounded-full" />

                    <h2 className="text-sm font-black uppercase tracking-wider text-slate-800">
                      Товары на исходе
                    </h2>
                  </div>

                  <span className="px-3 py-1 bg-red-50 text-red-600 text-[11px] font-bold rounded-full border border-red-100">
                    {lowStockAlerts.length} alert
                  </span>
                </div>

                {/* GRID - Kenglikni oshirish uchun lg:grid-cols-3 qildik (4 tadan 3 taga kamaytirish cardni kengaytiradi) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {lowStockAlerts.map((item, idx) => {
                    const name =
                      typeof item.title === "object"
                        ? item.title?.title
                        : titleProducts?.find((p) => p._id === item.title)
                            ?.title ||
                          item.title ||
                          "Без названия";

                    const percent = Math.min((item.count / 5) * 100, 100);

                    return (
                      <div
                        key={idx}
                        className="relative group rounded-[26px] p-[1px] bg-gradient-to-br from-red-200 via-white to-orange-100 shadow-sm hover:shadow-xl transition-all duration-300 min-w-[280px]"
                      >
                        {/* INNER CARD */}
                        <div className="relative bg-white rounded-[25px] p-5 overflow-hidden">
                          {" "}
                          {/* p-4 dan p-5 ga oshirildi ichki joy uchun */}
                          {/* content */}
                          <div className="flex justify-between items-center relative z-10 gap-3">
                            {/* LEFT */}
                            <div className="flex flex-col gap-1 flex-1">
                              <span className="text-[10px] font-black text-red-500 tracking-widest uppercase">
                                Предупреждение
                              </span>

                              <h3 className="text-[15px] font-black text-slate-800 leading-tight truncate">
                                {name}
                              </h3>

                              <span className="text-[12px] font-medium text-slate-400">
                                запас низкий
                              </span>
                            </div>

                            {/* RIGHT - Dumaloqni kichraytirdik */}
                            <div className="flex flex-col items-center shrink-0">
                              <div className="relative w-10 h-10">
                                {" "}
                                {/* w-12 dan w-10 ga kichraydi */}
                                <svg className="w-10 h-10 -rotate-90">
                                  <circle
                                    cx="20"
                                    cy="20"
                                    r="17"
                                    stroke="#f1f1f1"
                                    strokeWidth="3.5"
                                    fill="none"
                                  />
                                  <circle
                                    cx="20"
                                    cy="20"
                                    r="17"
                                    stroke="#ef4444"
                                    strokeWidth="3.5"
                                    fill="none"
                                    strokeDasharray={
                                      107
                                    } /* Radius 17 bo'lgani uchun o'zgardi (2 * PI * 17) */
                                    strokeDashoffset={
                                      107 - (107 * percent) / 100
                                    }
                                    strokeLinecap="round"
                                    className="transition-all duration-700"
                                  />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <span className="text-[11px] font-black text-slate-800">
                                    {item.count}
                                  </span>
                                </div>
                              </div>

                              <span className="text-[10px] text-slate-400 font-bold mt-1 uppercase">
                                шт
                              </span>
                            </div>
                          </div>
                          {/* bottom hint bar */}
                          <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-red-500 to-orange-400 transition-all duration-700"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ASOSIY JADVAL */}
            <div className="bg-white rounded-[35px] p-8 shadow-sm border border-slate-50">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-8 bg-[#3b59ce] rounded-full" />
                  <h2 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter">
                    Чеки из:{" "}
                    <span className="text-[#3b59ce]">
                      {categories.find((c) => c._id === selectedCategory)
                        ?.title || "Все категории"}
                    </span>
                  </h2>
                </div>
                <button
                  onClick={() => nav("/productsIncome")}
                  className="flex items-center gap-3 px-7 py-3.5 bg-[#2d439e] text-white rounded-[20px] font-black text-[10px] uppercase tracking-[1.5px] border-b-4 border-[#1e2d6b] shadow-lg transition-all duration-300 hover:bg-[#3b59ce] hover:border-[#2d439e] hover:shadow-[0_15px_30px_rgba(59,89,206,0.3)] hover:-translate-y-1 active:translate-y-0.5 active:border-b-0 group/btn"
                >
                  <ReceiptText
                    size={18}
                    strokeWidth={2.5}
                    className="text-blue-200 group-hover/btn:text-white transition-all"
                  />
                  <span>Чеки прихода</span>
                </button>
              </div>

              {/* CARDS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 overflow-y-auto pr-2 custom-scroll-container content-start transition-all duration-300 min-h-0 max-h-[565px] h-auto">
                {isLoading ? (
                  <div className="col-span-2 py-20 flex items-center justify-center font-black text-slate-200 text-3xl uppercase italic animate-pulse">
                    Загрузка...
                  </div>
                ) : productsData?.items?.length > 0 ? (
                  productsData.items.map((item) => {
                    const displayTitle =
                      typeof item.title === "object" && item.title !== null
                        ? item.title?.title || "Bez nomi"
                        : titleProducts.find((p) => p._id === item.title)
                            ?.title ||
                          item.title ||
                          "Bez nomi";

                    const ostatokValue = calcOstatokForItem(item);
                    const usedQty = Number(item.quantity) || 0;

                    return (
                      <div
                        key={item._id || item.id}
                        className="relative flex flex-col justify-between p-5 bg-white rounded-[32px] border border-slate-100 hover:shadow-[0_20px_50px_rgba(0,0,0,0.07)] transition-all duration-500 group h-[180px] w-full hover:-translate-y-1 overflow-hidden"
                      >
                        {/* Top accent line */}
                        <div className="absolute top-0 left-6 right-6 h-[2px] rounded-b-full bg-gradient-to-r from-transparent via-indigo-200 to-transparent" />

                        {/* РАСХОД badge */}
                        <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-red-50 text-red-400 border border-red-100">
                          Расход
                        </div>

                        {/* Title + buttons */}
                        <div className="relative flex items-center justify-between z-10 mt-1">
                          <div className="flex items-center gap-3">
                            <div className="transform group-hover:scale-110 transition-transform duration-500">
                              <ProductIcon name={displayTitle} />
                            </div>
                            <div>
                              <h3 className="font-black text-slate-800 text-[15px] leading-tight tracking-tight group-hover:text-indigo-600 transition-colors max-w-[140px] truncate">
                                {displayTitle}
                              </h3>
                              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mt-0.5">
                                {item.dateOfPayment || "Нет даты"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 z-30">
                            <button
                              onClick={() => openHistory(item)}
                              className="p-2.5 bg-blue-50 text-blue-400 rounded-xl hover:bg-blue-500 hover:text-white transition-all active:scale-90"
                            >
                              <HistoryIcon size={14} strokeWidth={2.5} />
                            </button>
                            <button
                              onClick={() => openEditModal(item)}
                              className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-indigo-50 hover:text-indigo-500 transition-all active:scale-90"
                            >
                              <Pencil size={14} strokeWidth={2.5} />
                            </button>
                            <button
                              onClick={() => confirmDelete(item._id || item.id)}
                              className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-red-50 hover:text-red-400 transition-all active:scale-90"
                            >
                              <Trash2 size={14} strokeWidth={2.5} />
                            </button>
                          </div>
                        </div>

                        {/* Divider */}
                        <div className="relative h-px w-full bg-gradient-to-r from-transparent via-slate-100 to-transparent z-10" />

                        {/* ИСПОЛЬЗОВАНО badge — centered */}
                        <div className="relative z-10 flex justify-center pb-1">
                          <div className="flex items-center gap-2 bg-gradient-to-r from-red-50 to-rose-50 px-4 py-2 rounded-2xl border border-red-100 shadow-sm">
                            <span className="text-[9px] font-black text-red-300 uppercase tracking-widest border-r border-red-200 pr-2.5 leading-none">
                              Использовано
                            </span>
                            <div className="flex items-center gap-1 pl-0.5">
                              <span className="text-[18px] font-black text-red-500 italic leading-none">
                                -{usedQty}
                              </span>
                              <span className="text-[9px] ml-1 mt-1.5 font-bold text-slate-400 uppercase leading-none">
                                {item.edinisaIzmereniya?.title || "шт"}
                              </span>
                            </div>
                            <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse ml-0.5" />
                          </div>
                        </div>

                        {/* Bottom hover line */}
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[3px] rounded-t-full transition-all duration-500 group-hover:w-1/3 bg-indigo-400" />
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-2 py-20 flex flex-col items-center justify-center italic">
                    <SearchX size={40} className="text-slate-200" />
                    <h3 className="mt-4 text-slate-400 font-black text-lg uppercase">
                      Ничего не найдено
                    </h3>
                  </div>
                )}
              </div>

              {/* PAGINATION */}
              <div className="pt-8 border-t border-slate-50 flex flex-col items-center gap-6">
                <div className="w-full flex justify-between items-center">
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setIsOpen(!isOpen)}
                      className="flex items-center gap-2 bg-white font-bold text-[11px] py-2 px-4 rounded-xl shadow-sm border border-slate-200 min-w-[140px] justify-between"
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
                <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-[20px] shadow-lg border border-slate-100">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="p-2 rounded-full text-slate-400 hover:bg-slate-50 disabled:opacity-30 transition-all active:scale-90"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from(
                      { length: totalPages || 0 },
                      (_, i) => i + 1
                    ).map((n) => (
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

          {/* HISTORY MODAL */}
          {historyModalItem && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white w-full max-w-lg rounded-[35px] shadow-2xl overflow-hidden animate-in zoom-in-95">
                <div className="p-6 border-b flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg">
                      <HistoryIcon size={20} />
                    </div>
                    <div>
                      {/* // ✅ TO'G'RI — titleProducts dan nom topadi */}
                      <h3 className="font-black text-slate-800 uppercase italic">
                        {typeof historyModalItem.title === "object"
                          ? historyModalItem.title?.title
                          : titleProducts.find(
                              (p) => p._id === historyModalItem.title
                            )?.title || historyModalItem.title}
                      </h3>
                      {movements.length > 0 && (
                        <p className="text-[11px] font-bold text-slate-400 mt-0.5">
                          Текущий баланс:{" "}
                          <span
                            className={`font-black ${
                              movements[0]?.balanceAfter >= 0
                                ? "text-emerald-600"
                                : "text-orange-500"
                            }`}
                          >
                            {movements[0]?.balanceAfter ?? 0}{" "}
                            {movements[0]?.edinisaIzmereniya?.title || "шт"}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={closeHistoryModal}
                    className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full"
                  >
                    <X size={20} strokeWidth={3} />
                  </button>
                </div>

                <div className="p-6 max-h-[420px] overflow-y-auto custom-scroll-container">
                  {isHistoryLoading ? (
                    <div className="py-10 text-center animate-pulse font-bold text-slate-300">
                      Загрузка данных...
                    </div>
                  ) : movements.length > 0 ? (
                    <div className="space-y-3">
                      {movements.map((move, idx) => {
                        const isIncome = move.type === "income";
                        return (
                          <div
                            key={idx}
                            className={`relative flex items-center justify-between p-4 rounded-2xl border transition-all ${
                              isIncome
                                ? "bg-emerald-50/50 border-emerald-100"
                                : "bg-red-50/50 border-red-100"
                            }`}
                          >
                            {idx < movements.length - 1 && (
                              <div className="absolute -bottom-3 left-7 w-0.5 h-3 bg-slate-200 z-10" />
                            )}
                            <div className="flex items-center gap-3">
                              <div
                                className={`p-2.5 rounded-xl flex-shrink-0 ${
                                  isIncome
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-red-100 text-red-600"
                                }`}
                              >
                                {isIncome ? (
                                  <TrendingUp size={15} strokeWidth={2.5} />
                                ) : (
                                  <TrendingDown size={15} strokeWidth={2.5} />
                                )}
                              </div>
                              <div>
                                <p className="text-[12px] font-black text-slate-700 leading-none">
                                  {isIncome ? "Приход" : "Расход"}
                                </p>
                                <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wide">
                                  {move.dateOfPayment}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-center">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                                  Было
                                </p>
                                <p className="text-[13px] font-black text-slate-500 leading-none">
                                  {move.balanceBefore}
                                </p>
                              </div>
                              <div
                                className={`text-[10px] font-black px-2 py-1 rounded-lg ${
                                  isIncome
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-red-100 text-red-600"
                                }`}
                              >
                                {isIncome
                                  ? `+${move.amount}`
                                  : `-${move.amount}`}
                              </div>
                              <div className="text-center min-w-[36px]">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                                  Остаток
                                </p>
                                <p
                                  className={`text-[15px] font-black italic leading-none ${
                                    move.balanceAfter >= 0
                                      ? "text-emerald-600"
                                      : "text-orange-500"
                                  }`}
                                >
                                  {move.balanceAfter}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-10 text-center font-black text-slate-300 uppercase italic">
                      История пуста
                    </div>
                  )}
                </div>

                <div className="p-6 bg-slate-50/50 border-t flex justify-end">
                  <button
                    onClick={closeHistoryModal}
                    className="group relative px-10 py-4 bg-[#1e293b] text-white rounded-[22px] font-black text-[11px] uppercase tracking-[2px] overflow-hidden transition-all duration-300 hover:shadow-[0_10px_30px_rgba(30,41,59,0.4)] hover:-translate-y-0.5"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                    <span className="relative flex items-center justify-center gap-2">
                      Закрыть{" "}
                      <span className="opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
                        ✕
                      </span>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CATEGORY CARDS */}
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

      {/* DASHBOARD */}
      <div className="w-full max-w-4xl mt-6 bg-[#111827] text-white p-8 rounded-[35px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] mb-10 relative border border-white/5 mx-auto lg:mx-0 overflow-hidden group">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl group-hover:bg-indigo-600/20 transition-all duration-700" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl group-hover:bg-blue-600/20 transition-all duration-700" />
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                <p className="text-indigo-400 text-[10px] uppercase tracking-[3px] font-black">
                  Общий приход:{" "}
                  {dashboardCategory === "all"
                    ? "Все категории"
                    : categories.find((c) => c._id === dashboardCategory)
                        ?.title}
                </p>
              </div>
              <h2 className="text-5xl font-black tracking-tighter flex items-baseline gap-3 text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                {Number(totalExpense || 0).toLocaleString("ru-RU")}
                <span className="text-base font-bold text-indigo-500/80 uppercase tracking-widest italic">
                  uzs
                </span>
              </h2>
            </div>
            <button
              onClick={() => {
                setActiveRange(12);
                setDashboardCategory("all");
              }}
              title="Сбросить фильтры"
              className="p-3 bg-slate-800/50 hover:bg-red-500 text-slate-400 hover:text-white rounded-2xl transition-all duration-300 border border-white/5 hover:border-red-400 active:scale-90 group"
            >
              <RotateCcw
                size={20}
                className="group-hover:rotate-[-90deg] transition-transform duration-500"
              />
            </button>
          </div>
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4 ml-1">
              <div className="w-1 h-3 bg-slate-600 rounded-full" />
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
                Фильтр по категориям:
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={() => setDashboardCategory("all")}
                className={`px-5 py-2 rounded-xl text-[11px] font-black transition-all duration-300 border ${
                  dashboardCategory === "all"
                    ? "bg-indigo-600 border-indigo-500 text-white shadow-[0_10px_20px_rgba(79,70,229,0.3)] scale-105"
                    : "bg-slate-800/30 border-white/5 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                }`}
              >
                Все чеки
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => setDashboardCategory(cat._id)}
                  className={`px-5 py-2 rounded-xl text-[11px] font-black transition-all duration-300 border ${
                    dashboardCategory === cat._id
                      ? "bg-indigo-600 border-indigo-500 text-white shadow-[0_10px_20px_rgba(79,70,229,0.3)] scale-105"
                      : "bg-slate-800/30 border-white/5 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                  }`}
                >
                  {cat.title}
                </button>
              ))}
            </div>
          </div>
          <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row sm:items-center gap-4">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest ml-1 shrink-0">
              Выберите период:
            </p>
            <div className="flex gap-2 p-1.5 bg-black/40 rounded-2xl border-white/5 w-fit">
              {[1, 3, 6, 12].map((range) => (
                <button
                  key={range}
                  onClick={() => setActiveRange(range)}
                  className={`px-5 py-2 rounded-[14px] text-[10px] font-black transition-all duration-300 whitespace-nowrap ${
                    activeRange === range
                      ? "bg-white text-[#1e1b4b] shadow-xl scale-105"
                      : "text-[#64748b] hover:text-[#e2e8f0] hover:bg-white/5"
                  }`}
                >
                  {range === 12 ? "1 ГОД" : `${range} МЕСЯЦА`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ✅ ADD MODAL — modalType bo'yicha title va type uzatiladi */}
      {isModalOpen && (
        <ModalStructure
          title={modalType === "income" ? "Добавить приход" : "Добавить расход"}
          close={closeAddModal}
          form={createForm}
          submit={(data) => {
            const user = JSON.parse(localStorage.getItem("user"));
            createMutation.mutate({
              ...data,
              user: user?._id || user?.id,
            });
          }}
          units={allUnits}
          categories={categories}
          btnText={
            modalType === "income" ? "Добавить приход" : "Добавить расход"
          }
          // ✅ Faqat expense pageda — forced type, tab ko'rsatilmaydi
          forcedType={modalType}
          productSearch={productSearch}
          setProductSearch={setProductSearch}
          isSuggestionsOpen={isSuggestionsOpen}
          setIsSuggestionsOpen={setIsSuggestionsOpen}
          searchSuggestions={searchSuggestions}
          handleSelectProductFromList={handleSelectProductFromList}
        />
      )}

      {/* ✅ EDIT MODAL — har doim expense, tab yo'q */}
      {openEdit && (
        <ModalStructure
          title="Изменить расход"
          close={closeEditModal}
          form={updateForm}
          submit={handleUpdateSubmit}
          units={allUnits}
          categories={categories}
          btnText="Сохранить расход"
          // ✅ Expense page: faqat expense tab ko'rinadi
          forcedType="expense"
          productSearch={productSearch}
          setProductSearch={setProductSearch}
          isSuggestionsOpen={isSuggestionsOpen}
          setIsSuggestionsOpen={setIsSuggestionsOpen}
          searchSuggestions={searchSuggestions}
          handleSelectProductFromList={handleEditSelectProductFromList}
        />
      )}
    </div>
  );
};

export default Products;
