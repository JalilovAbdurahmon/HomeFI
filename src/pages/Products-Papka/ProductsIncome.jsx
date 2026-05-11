import React, { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import {
  Plus,
  ArrowDownCircle,
  Search,
  Filter,
  TrendingUp,
  Package,
  Calendar as CalendarIcon,
  Pencil,
  Trash2,
  ReceiptText,
  ArrowLeft,
  Trash,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import instance from "../../utils/axios";
import { useNavigate } from "react-router-dom";
import ModalStructure from "../Products-Papka/ProductsCreateForm";

const IncomePage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [dateFilter, setDateFilter] = useState({ from: "", to: "" });
  const [openHistory, setOpenHistory] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [openEdit, setOpenEdit] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productSearch, setProductSearch] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  const nav = useNavigate();
  const queryClient = useQueryClient();

  // History modali uchun — income'lar bo'yicha, yangi sana birinchi
  const historyList = selectedProduct?.history
    ?.slice()
    ?.sort((a, b) => new Date(b.dateOfPayment) - new Date(a.dateOfPayment))
    ?.map((item, index, arr) => {
      // Kumulyativ balansni hisoblash (eski → yangi tartibda)
      const reversedArr = [...arr].reverse();
      const reversedIndex = reversedArr.findIndex((x) => x._id === item._id);
      let runningTotal = 0;
      for (let i = 0; i <= reversedIndex; i++) {
        runningTotal += Number(reversedArr[i].quantity) || 0;
      }
      const before = runningTotal - (Number(item.quantity) || 0);
      return {
        ...item,
        before,
        change: item.quantity,
        after: runningTotal,
      };
    });

  const updateForm = useForm();

  // 1. MAHSULOTLAR NOMINI OLIB KELISH
  const { data: titleProducts = [] } = useQuery({
    queryKey: ["titleProducts"],
    queryFn: async () => {
      const res = await instance.get("/titleProducts");
      return res.data || [];
    },
  });

  // 2. UNITS VA CATEGORIES
  const { data: unitsResponse } = useQuery({
    queryKey: ["getEdinisaIzmereniya"],
    queryFn: async () => {
      const res = await instance.get("/edinisaIzmereniya");
      return res.data || [];
    },
  });

  const { data: categoriesResponse } = useQuery({
    queryKey: ["productsCategory"],
    queryFn: async () => {
      const res = await instance.get("/productsCategory");
      return res.data || [];
    },
  });

  const allUnits = unitsResponse || [];
  const categories = (categoriesResponse || []).map((c) => ({
    _id: c._id,
    title: c.title,
  }));

  // 3. ASOSIY DATA
  const { data: productsData, isLoading } = useQuery({
    queryKey: ["productsIncome", searchTerm, selectedCategory, dateFilter],
    queryFn: async () => {
      const res = await instance.get("/products");
      const allItems = res.data || [];

      // Barcha income'larni olamiz (filter uchun)
      let incomeItems = allItems.filter((item) => item.type === "income");

      // Search filter
      if (searchTerm?.trim()) {
        incomeItems = incomeItems.filter((item) => {
          const productName =
            typeof item.title === "object"
              ? item.title?.title
              : titleProducts.find((p) => p._id === item.title)?.title || "";
          return productName.toLowerCase().includes(searchTerm.toLowerCase());
        });
      }

      // Category filter
      if (selectedCategory !== "all") {
        incomeItems = incomeItems.filter((item) => {
          const itemCatId = item.productsCategory?._id || item.productsCategory;
          return itemCatId === selectedCategory;
        });
      }

      // Date filter
      if (dateFilter.from || dateFilter.to) {
        incomeItems = incomeItems.filter((item) => {
          const itemDate = new Date(item.dateOfPayment);
          const from = dateFilter.from ? new Date(dateFilter.from) : null;
          const to = dateFilter.to ? new Date(dateFilter.to) : null;
          if (from && !to) return itemDate >= from;
          if (!from && to) return itemDate <= to;
          if (from && to) return itemDate >= from && itemDate <= to;
          return true;
        });
      }

      // GROUP — title key bo'yicha
      const grouped = {};

      // Avval barcha income'larni guruhlash (filter qilingan)
      incomeItems.forEach((item) => {
        const key =
          typeof item.title === "object" ? item.title._id : item.title;
        if (!key) return;

        if (!grouped[key]) {
          grouped[key] = {
            ...item,
            incomeQty: 0,
            expenseQty: 0,
            totalPrice: 0,
            history: [],
            // Barcha income ID'larini saqlash (bulk delete uchun)
            allIncomeIds: [],
          };
        }

        grouped[key].incomeQty += Number(item.quantity) || 0;
        grouped[key].totalPrice +=
          (Number(item.quantity) || 0) * (Number(item.priceForOne) || 0);

        // History ga qo'shamiz — yangi sana birinchi bo'lishi uchun keyin sort qilamiz
        grouped[key].history.push(item);

        // Barcha income ID'larini yig'amiz
        grouped[key].allIncomeIds.push(item._id);

        // Eng so'nggi income sanasi va ma'lumotlarini saqlash
        if (
          !grouped[key].dateOfPayment ||
          new Date(item.dateOfPayment) > new Date(grouped[key].dateOfPayment)
        ) {
          grouped[key].dateOfPayment = item.dateOfPayment;
          grouped[key].priceForOne = item.priceForOne;
          grouped[key].edinisaIzmereniya = item.edinisaIzmereniya;
          grouped[key].productsCategory = item.productsCategory;
        }
      });

      // Expense'larni ayirish — barcha allItems dan (filter qilinmagan)
      allItems.forEach((item) => {
        if (item.type !== "expense") return;
        const key =
          typeof item.title === "object" ? item.title._id : item.title;
        if (!key || !grouped[key]) return;
        grouped[key].expenseQty += Number(item.quantity) || 0;
      });

      // Qolgan miqdor = income - expense
      Object.values(grouped).forEach((g) => {
        g.quantity = g.incomeQty - g.expenseQty;

        // History'ni yangi sana birinchi bo'lishi uchun sort qilamiz
        g.history.sort(
          (a, b) => new Date(b.dateOfPayment) - new Date(a.dateOfPayment)
        );
      });

      // YANGI — quantity > 0 bo'lganlarni jadvaldan olib tashlaydi:
      const groupedArray = Object.values(grouped).filter(
        (g) => g.incomeQty > 0 && g.quantity > 0
      );

      // Jadval: eng yangi sana birinchi
      groupedArray.sort(
        (a, b) => new Date(b.dateOfPayment) - new Date(a.dateOfPayment)
      );

      return {
        items: groupedArray,
        totalCount: groupedArray.length,
        totalSum: groupedArray.reduce((acc, curr) => acc + curr.totalPrice, 0),
      };
    },
    enabled: titleProducts.length >= 0,
  });

  const products = productsData?.items || [];

  const totalPages = Math.ceil(products.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const paginatedProducts = products.slice(startIndex, endIndex);

  // ✅ DELETE — grouped item uchun barcha income'larni o'chirish
  const deleteMutation = useMutation({
    // ids — barcha income ID'lari massivi
    mutationFn: async (ids) => {
      // Parallel ravishda hammasi o'chiriladi
      await Promise.all(ids.map((id) => instance.delete(`/products/${id}`)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productsIncome"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["allProductsRaw"] });

      toast.success("Успешно удалено", {
        style: {
          borderRadius: "16px",
          background: "#fef2f2",
          color: "#991b1b",
        },
      });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi");
    },
  });

  // ✅ UPDATE mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...payload }) => {
      return await instance.put(`/products/${id}`, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      await queryClient.invalidateQueries({ queryKey: ["productsIncome"] });

      toast.success("Данные успешно обновлены", {
        style: { borderRadius: "16px", background: "#1e293b", color: "#fff" },
      });
      closeEditModal();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Yangilashda xatolik");
    },
  });

  // ✅ DELETE confirm — allIncomeIds massivini yuboradi
  const handleDelete = (item) => {
    if (!item) return;

    const ids = item.allIncomeIds || [item._id];
    const count = ids.length;

    toast.dismiss();

    toast(
      ({ closeToast }) => (
        <div className="flex flex-col gap-3 p-1">
          <div className="flex items-center gap-2 text-slate-800">
            <Trash size={18} className="text-red-500" />
            <div>
              <span className="font-bold text-sm block">
                Удалить этот ПРИХОД?
              </span>
              {count > 1 && (
                <span className="text-xs text-slate-500">
                  {count} та запись будет удалена
                </span>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={() => toast.dismiss()}
              className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={() => {
                toast.dismiss();
                deleteMutation.mutate(ids);
              }}
              className="px-4 py-1.5 text-xs font-bold bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 cursor-pointer"
            >
              Да, удалить
            </button>
          </div>
        </div>
      ),
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: false,
      }
    );
  };

  // ✅ EDIT modal ochish
  const openEditModal = (product) => {
    setEditingProduct(product);
    const titleText = product.title?.title || product.title || "";
    setProductSearch(titleText);

    const formData = {
      title: product.title?.title || product.title || "",
      dateOfPayment: product.dateOfPayment,
      edinisaIzmereniya:
        product.edinisaIzmereniya?._id || product.edinisaIzmereniya,
      productsCategory:
        product.productsCategory?._id || product.productsCategory,
      quantity: product.quantity,
      priceForOne: product.priceForOne,
      type: "income",
    };

    updateForm.reset(formData);
    setOpenEdit(true);
  };

  const closeEditModal = () => {
    setOpenEdit(false);
    setEditingProduct(null);
    updateForm.reset();
    setProductSearch("");
  };

  const handleUpdateSubmit = (data) => {
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;

    const productId = editingProduct?._id || editingProduct?.id;

    if (!productId) {
      toast.error("Mahsulot IDsi topilmadi");
      return;
    }

    const titleId =
      typeof editingProduct?.title === "object"
        ? editingProduct?.title?._id
        : editingProduct?.title;

    updateMutation.mutate({
      id: productId,
      ...data,
      title: titleId,
      type: "income",
      user: user?._id || user?.id,
    });
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
    updateForm.setValue("title", item.title);
    updateForm.setValue("productsCategory", catId);
    updateForm.setValue("edinisaIzmereniya", unitId);
    setIsSuggestionsOpen(false);
  };
  
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage, itemsPerPage]);
  if (isLoading)
    return (
      <div className="p-20 text-center font-black text-slate-300 animate-pulse uppercase tracking-[0.3em]">
        Загрузка...
      </div>
    );


  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8">
      <Toaster position="top-center" reverseOrder={false} />

      {/* НАЗАД TUGMASI */}
      <button
        onClick={() => nav("/products")}
        className="mb-6 flex items-center gap-2 text-slate-400 hover:text-[#3b59ce] transition-all font-black text-[11px] uppercase tracking-[2px] group"
      >
        <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-50 group-hover:border-blue-100 transition-all">
          <ArrowLeft
            size={16}
            strokeWidth={3}
            className="group-hover:-translate-x-1 transition-transform"
          />
        </div>
        <span>Назад к списку</span>
      </button>

      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 uppercase italic tracking-tight flex items-center gap-3">
            <ArrowDownCircle className="text-green-500" size={32} />
            Приход Товаров
          </h1>
          <p className="text-slate-500 font-medium ml-1 text-sm">
            Все входящие транзакции и складская статистика
          </p>
        </div>
      </div>

      {/* 2. STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-[28px] shadow-sm border border-slate-100 flex items-center gap-5">
          <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
            <TrendingUp size={32} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              Сума прихода
            </p>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">
              {productsData?.totalSum?.toLocaleString()}{" "}
              <span className="text-xs font-bold text-slate-400">UZS</span>
            </h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[28px] shadow-sm border border-slate-100 flex items-center gap-5">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
            <Package size={32} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              Кол-во позиций
            </p>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">
              {productsData?.totalCount}{" "}
              <span className="text-xs font-bold text-slate-400">
                товар(ов)
              </span>
            </h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[28px] shadow-sm border border-slate-100 flex items-center gap-5">
          <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
            <CalendarIcon size={32} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              Сегодняшняя дата
            </p>
            <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase italic">
              {new Date().toLocaleDateString("ru-RU")}
            </h3>
          </div>
        </div>
      </div>

      {/* 4. DATA TABLE */}
      <div className="bg-white rounded-[32px] shadow-xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Информация о товаре
                </th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Категория
                </th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                  Кол-во (остаток)
                </th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                  Цена за ед.
                </th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Итого
                </th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {paginatedProducts.map((item) => {
                const productName =
                  typeof item.title === "object"
                    ? item.title?.title
                    : titleProducts.find((p) => p._id === item.title)?.title ||
                      item.title ||
                      "Без названия";

                return (
                  <tr
                    key={
                      (typeof item.title === "object"
                        ? item.title._id
                        : item.title) || item._id
                    }
                    className="hover:bg-green-50/30 transition-all group"
                  >
                    <td className="p-6">
                      <div className="font-black text-slate-700 text-base uppercase tracking-tight">
                        {productName}
                      </div>
                      <div className="flex items-center gap-3 mt-1.5">
                        {/* ✅ Eng yangi sana ko'rsatiladi */}
                        <span className="text-[11px] text-slate-400 font-black italic">
                          {item.dateOfPayment}
                        </span>
                        {item.allIncomeIds?.length > 1 && (
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-500 text-[9px] font-black rounded-full border border-blue-100">
                            {item.allIncomeIds.length} та приход
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-6">
                      <span className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase border border-blue-100">
                        {item.productsCategory?.title || "Общее"}
                      </span>
                    </td>
                    <td className="p-6 text-center">
                      {/* Qolgan miqdor (income - expense) */}
                      <div className="font-black text-slate-700 text-lg">
                        {Number(Number(item.quantity).toFixed(2))}
                      </div>
                      {item.expenseQty > 0 && (
                        <div className="text-[10px] font-bold text-red-400 mt-0.5">
                          -{item.expenseQty} использовано
                        </div>
                      )}
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {item.edinisaIzmereniya?.title || "ед"}
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <div className="font-bold text-slate-500 italic">
                        {Number(item.priceForOne).toLocaleString()}
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="font-black text-green-600 text-lg tracking-tighter">
                        {item.totalPrice.toLocaleString()}
                        <span className="text-[10px] ml-1 text-green-400">
                          UZS
                        </span>
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedProduct(item);
                            setOpenHistory(true);
                          }}
                          className="p-2.5 bg-white shadow-sm border border-[#f1f5f9] text-[#475569] rounded-xl hover:bg-[#1e293b] hover:text-white transition-all"
                        >
                          <ReceiptText size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="p-2.5 bg-white shadow-sm border border-slate-100 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all active:scale-90"
                        >
                          <Pencil size={18} />
                        </button>
                        {/* ✅ DELETE — butun grouped item (barcha income'lar) o'chiriladi */}
                        <button
                          type="button"
                          disabled={deleteMutation.isPending}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDelete(item);
                          }}
                          className="p-2.5 bg-white shadow-sm border border-slate-100 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all active:scale-90 disabled:opacity-50"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {products.length === 0 && (
          <div className="p-20 text-center">
            <Package className="mx-auto text-slate-200 mb-4" size={64} />
            <p className="text-slate-400 font-black uppercase italic tracking-widest">
              Данные не найдены
            </p>
          </div>
        )}
        {/* PREMIUM PAGINATION */}
        <div className="border-t border-slate-100 bg-gradient-to-b from-white to-slate-50/80 px-6 md:px-8 py-5">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-5">
            {/* LEFT SIDE */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[9px] font-black uppercase tracking-[1.5px] text-slate-400">
                Показано
              </span>

              <div className="relative flex items-center">
                <div className="relative">
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="w-[66px] h-9 pl-4 pr-9 rounded-2xl bg-white border border-slate-200 shadow-sm text-[13px] font-black text-slate-700 outline-none cursor-pointer appearance-none hover:border-green-300  focus:border-green-400 transition-all"
                  >
                    <option value={6}>6</option>
                    <option value={12}>12</option>
                    <option value={48}>48</option>
                    <option value={96}>96</option>
                  </select>

                  {/* CUSTOM ARROW */}
                  <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">
                    <ChevronDown size={14} strokeWidth={2.5} />
                  </div>
                </div>

                {/* RESET BUTTON */}
                {itemsPerPage > 6 && (
                  <button
                    onClick={() => {
                      setItemsPerPage(6);
                      setCurrentPage(1);
                    }}
                    className="absolute -right-2 -top-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md hover:scale-110 hover:bg-red-600 transition-all"
                  >
                    <X size={11} strokeWidth={3} />
                  </button>
                )}
              </div>

              <span className="text-[11px] font-bold text-slate-400">
                записей
              </span>
            </div>

            {/* CENTER INFO (COMPACT & MODERN) */}
            <div className="flex items-center gap-1.5 flex-wrap justify-center">
              {/* PREV */}
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="w-9 h-9 rounded-xl bg-white border border-slate-200/60 shadow-sm flex items-center justify-center text-slate-500 hover:text-slate-900 hover:border-slate-300 hover:ring-4 hover:ring-slate-50 active:scale-90 transition-all duration-200 disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronLeft size={18} strokeWidth={2.5} />
              </button>

              {/* PAGE BUTTONS */}
              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalPages }, (_, index) => {
                  const page = index + 1;
                  const isActive = currentPage === page;

                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`min-w-[36px] h-9 px-2 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-95 ${
                        isActive
                          ? "bg-[#0f172a] text-white shadow-md shadow-[#e2e8f0]"
                          : "bg-white border border-[#e2e8f0] text-[#475569] hover:border-[#cbd5e1] hover:bg-[#f8fafc]"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              {/* NEXT */}
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="w-9 h-9 rounded-xl bg-white border border-slate-200/60 shadow-sm flex items-center justify-center text-slate-500 hover:text-slate-900 hover:border-slate-300 hover:ring-4 hover:ring-slate-50 active:scale-90 transition-all duration-200 disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronRight size={18} strokeWidth={2.5} />
              </button>
            </div>

            {/* RIGHT SIDE (DYNAMIC VERSION) */}
            <div className="group hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#f1f5f9] shadow-sm transition-all duration-300 hover:border-slate-200 hover:shadow-md hover:-translate-y-0.5 cursor-default">
              {/* Status Dot */}
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse ring-4 ring-green-50" />

              {/* Label */}
              <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 group-hover:text-slate-500 transition-colors duration-300">
                Страница
              </span>

              {/* Page Numbers */}
              <div className="flex items-center gap-1 ml-0.5 bg-slate-50 px-2 py-0.5 rounded-lg border border-transparent group-hover:border-slate-100 group-hover:bg-white transition-all duration-300">
                <span className="text-sm font-bold text-slate-800">
                  {currentPage}
                </span>

                <span className="text-slate-300 text-xs">/</span>

                <span className="text-sm font-bold text-slate-400">
                  {totalPages || 1}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* HISTORY MODAL */}
      {openHistory && selectedProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-300">
          <div className="bg-white w-[450px] rounded-[35px] p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 z-0" />

            <div className="relative z-10 flex justify-between items-start mb-6">
              <div>
                <h2 className="font-black text-2xl text-slate-800 leading-tight tracking-tighter uppercase italic">
                  {(() => {
                    const item = selectedProduct;
                    if (!item) return "Загрузка...";
                    return typeof item.title === "object" && item.title !== null
                      ? item.title?.title || "Bez nomi"
                      : titleProducts.find((p) => p._id === item.title)
                          ?.title ||
                          item.title ||
                          "Bez nomi";
                  })()}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                    Остаток:{" "}
                    <span className="text-blue-600">
                      {selectedProduct.quantity}{" "}
                      {selectedProduct.edinisaIzmereniya?.title || "шт"}
                    </span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpenHistory(false)}
                className="p-2 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              >
                <svg
                  width="20"
                  height="20"
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
            </div>

            {/* HISTORY LIST — yangi sana birinchi */}
            <div className="relative z-10 flex flex-col gap-3 max-h-[420px] overflow-y-auto pr-2 custom-scroll">
              {historyList?.length > 0 ? (
                historyList.map((h, idx) => (
                  <div
                    key={h._id || idx}
                    className="group bg-slate-50/50 border border-slate-100 rounded-[24px] p-4 flex justify-between items-center hover:bg-white hover:shadow-md hover:border-blue-100 transition-all duration-300"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-blue-500 uppercase tracking-[2px]">
                        Приход
                      </span>
                      <span className="text-[13px] font-bold text-slate-700">
                        {h.dateOfPayment}
                      </span>
                      {h.priceForOne && (
                        <span className="text-[10px] text-slate-400 font-medium">
                          По {Number(h.priceForOne).toLocaleString()} UZS
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[10px] font-bold text-slate-300 uppercase">
                            было
                          </span>
                          <span className="text-[12px] -mt-0.5 font-black text-slate-400">
                            {h.before || 0}
                          </span>
                        </div>

                        <div className="bg-green-100 px-2 py-0.5 rounded-lg mb-1">
                          <span className="text-[14px] font-black text-green-600">
                            +{h.change}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-blue-400 uppercase">
                            стало
                          </span>
                          <span className="text-[16px] font-black text-slate-800 italic">
                            {h.after}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center text-slate-300 font-black uppercase italic text-sm">
                  История пуста
                </div>
              )}
            </div>

            <button
              onClick={() => setOpenHistory(false)}
              className="relative z-10 mt-6 w-full bg-[#0f172a] text-white py-4 rounded-[20px] font-black text-[12px] uppercase tracking-[2px] shadow-lg shadow-[#e2e8f0] hover:bg-blue-600 hover:shadow-blue-200 transition-all active:scale-[0.98]"
            >
              Закрыть окно
            </button>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {openEdit && (
        <ModalStructure
          title="Изменить приход"
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

export default IncomePage;
