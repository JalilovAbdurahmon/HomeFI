import React, { useState, useEffect, useMemo } from "react";
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
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import instance from "../../utils/axios";
import { exportProductsToExcel } from "../../utils/exportHelpers";
import { exportProductsToPDF } from "../../utils/exportHelpers";

const Products = () => {
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [editingProduct, setEditingProduct] = useState(null);
  const [openDateModal, setOpenDateModal] = useState(false);
  const [dateFilter, setDateFilter] = useState({ from: "", to: "" });
  const [showExportMenu, setShowExportMenu] = useState(false);

  const queryClient = useQueryClient();

  const handleExport = (format) => {
    if (format === "excel") {
      exportProductsToExcel(productsData?.items, dateFilter);
    } else if (format === "pdf") {
      exportProductsToPDF(productsData?.items, dateFilter);
    }
    setShowExportMenu(false); // Eksportdan keyin menyuni yopish
  };

  // --- DATA FETCHING ---
  const { data: productsData, isLoading } = useQuery({
    queryKey: ["products", page, limit, selectedCategory, dateFilter],
    queryFn: async () => {
      const res = await instance.get(`/products`, {
        params: {
          category: selectedCategory === "all" ? undefined : selectedCategory,
        },
      });

      const allData = res.data;

      // ✅ DATE FILTER
      let filteredData = allData;

      if (dateFilter.from && dateFilter.to) {
        filteredData = allData.filter((item) => {
          return (
            item.dateOfPayment >= dateFilter.from &&
            item.dateOfPayment <= dateFilter.to
          );
        });
      } else if (dateFilter.from) {
        filteredData = allData.filter(
          (item) => item.dateOfPayment === dateFilter.from
        );
      }

      const total = filteredData.length;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      return {
        items: filteredData.slice(startIndex, endIndex),
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

  const allUnits = useMemo(() => unitsResponse || [], [unitsResponse]);
  const totalPages = Math.ceil((productsData?.totalCount || 0) / limit);

  // --- FORMS ---
  const createForm = useForm();
  const updateForm = useForm();

  const setupAutoSum = (form) => {
    const qty = form.watch("quantity");
    const price = form.watch("priceForOne");
    useEffect(() => {
      form.setValue("sum", (Number(qty) || 0) * (Number(price) || 0));
    }, [qty, price, form]);
  };

  setupAutoSum(createForm);
  setupAutoSum(updateForm);

  // --- MUTATIONS ---
  const createMutation = useMutation({
    mutationFn: async (data) => await instance.post("/products", data),
    onSuccess: () => {
      queryClient.invalidateQueries(["products"]);
      toast.success("Данные успешно добавлены", {
        style: {
          borderRadius: "16px",
          background: "#1e293b",
          color: "#fff",
          fontWeight: "bold",
        },
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
    onSuccess: () => {
      queryClient.invalidateQueries(["products"]);
      toast.success("Данные успешно обновлены", {
        style: {
          borderRadius: "16px",
          background: "#1e293b",
          color: "#fff",
          fontWeight: "bold",
        },
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
          fontWeight: "bold",
        },
      });
    },
  });

  // --- CHIROYLI DELETE CONFIRM TOAST ---
  const confirmDelete = (id) => {
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
              className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-all"
            >
              Отмена
            </button>
            <button
              onClick={() => {
                deleteMutation.mutate(id);
                toast.dismiss(t.id);
              }}
              className="px-4 py-1.5 text-xs font-bold bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition-all uppercase tracking-tighter"
            >
              Да, удалить
            </button>
          </div>
        </div>
      ),
      {
        duration: 5000,
        position: "top-center",
        style: {
          borderRadius: "24px",
          background: "#fff",
          padding: "16px",
          border: "1px solid #fee2e2",
          boxShadow:
            "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
        },
      }
    );
  };

  // --- HANDLERS ---
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
      quantity: product.quantity,
      priceForOne: product.priceForOne,
      sum: product.sum,
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
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [page, limit]);

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
          className="flex items-center gap-2 bg-[#3b59ce] text-white px-7 py-4 rounded-2xl font-black hover:scale-105 transition-all shadow-xl"
        >
          <Plus size={20} strokeWidth={3} /> ДОBAVİTЬ
        </button>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          {/* ... FILTERS ... */}
          <div className="flex items-center gap-3">
            <div>
              <button
                onClick={() => setOpenDateModal(true)}
                className="h-[54px] flex items-center gap-3 bg-[#2e5cdb] text-white px-6 rounded-[18px] font-bold shadow-lg"
              >
                <Calendar size={18} />
                {dateFilter.from
                  ? dateFilter.to
                    ? `${dateFilter.from} / ${dateFilter.to}`
                    : dateFilter.from
                  : "Дата"}
              </button>

              {openDateModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
                  <div className="bg-white w-full max-w-md rounded-[32px] p-7 shadow-2xl animate-in zoom-in-95 duration-200">
                    {/* HEADER */}
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 flex items-center justify-center bg-blue-100 text-blue-600 rounded-xl">
                        <Calendar size={18} />
                      </div>
                      <h3 className="text-lg font-black text-slate-800">
                        Выберите диапазон
                      </h3>
                    </div>

                    {/* INPUTS */}
                    <div className="space-y-4">
                      {/* FROM */}
                      <div className="relative">
                        <input
                          type="date"
                          value={dateFilter.from}
                          onChange={(e) =>
                            setDateFilter((prev) => ({
                              ...prev,
                              from: e.target.value,
                            }))
                          }
                          className="w-full p-4 pr-12 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:border-blue-500 font-semibold"
                        />
                        <Calendar
                          size={18}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                      </div>

                      {/* TO */}
                      <div className="relative">
                        <input
                          type="date"
                          value={dateFilter.to}
                          onChange={(e) =>
                            setDateFilter((prev) => ({
                              ...prev,
                              to: e.target.value,
                            }))
                          }
                          className="w-full p-4 pr-12 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:border-blue-500 font-semibold"
                        />
                        <Calendar
                          size={18}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                      </div>
                    </div>

                    {/* BUTTONS */}
                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={() => {
                          setDateFilter({ from: "", to: "" });
                          setPage(1);
                          setOpenDateModal(false);
                        }}
                        className="w-full py-4 rounded-2xl bg-slate-200 text-slate-600 font-bold"
                      >
                        Очистить
                      </button>

                      <button
                        onClick={() => {
                          setPage(1);
                          setOpenDateModal(false);
                        }}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold shadow-lg"
                      >
                        Применить
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                toast(
                  (t) => (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2 text-slate-800">
                        <FilterX size={18} className="text-red-500" />
                        <span className="font-bold text-sm">
                          Сбросить фильтр?
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
                            setDateFilter({ from: "", to: "" });
                            setSelectedCategory("all");
                            setPage(1);
                            toast.dismiss(t.id);
                          }}
                          className="px-4 py-1.5 text-xs font-bold bg-red-500 text-white rounded-lg hover:bg-red-600 uppercase"
                        >
                          Да, сбросить
                        </button>
                      </div>
                    </div>
                  ),
                  {
                    duration: 4000,
                    position: "top-center",
                    style: {
                      borderRadius: "20px",
                      background: "#fff",
                      padding: "14px",
                      border: "1px solid #fee2e2",
                    },
                  }
                );
              }}
              className="h-[54px] w-[54px] flex items-center justify-center bg-white text-red-500 rounded-[18px] border border-slate-100 shadow-sm hover:bg-red-50 transition-all"
            >
              <FilterX size={20} />
            </button>

            {/* Eksport Dropdown Tugmasi */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="h-[54px] flex items-center gap-3 bg-[#10a37f] text-white px-6 rounded-[18px] font-bold shadow-lg hover:bg-[#0d8a6b] transition-all"
              >
                <FileText size={18} />
                Отчёт
                <ChevronDown
                  size={16}
                  className={`transition-transform ${
                    showExportMenu ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
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

          {/* LIST */}
          <div className="bg-white rounded-[35px] p-8 shadow-sm border border-slate-50">
            <div className="space-y-4 mb-10">
              {isLoading ? (
                <div className="py-20 text-center font-black text-slate-200 text-2xl uppercase italic">
                  Загрузка...
                </div>
              ) : productsData?.items?.length > 0 ? (
                productsData.items.map((item) => (
                  <div
                    key={item._id || item.id}
                    className="flex justify-between items-center p-5 bg-[#f8fafc] rounded-[24px] border border-transparent hover:border-slate-100 hover:shadow-xl transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#3b59ce] shadow-sm group-hover:bg-[#3b59ce] group-hover:text-white transition-all">
                        <ShoppingBag size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{item.title}</p>
                        <p className="text-[11px] text-slate-400 font-bold uppercase">
                          {item.dateOfPayment} •{" "}
                          <span className="text-blue-500">Расход</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <p className="font-black text-lg text-slate-800 italic">
                        {item.sum?.toLocaleString()}{" "}
                        <small className="text-[10px] text-slate-400">
                          UZS
                        </small>
                      </p>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all"
                        >
                          <Pencil size={14} />
                        </button>
                        {/* WINDOW.CONFIRM O'RNIGA TOAST ISHLATILDI */}
                        <button
                          onClick={() => confirmDelete(item._id || item.id)}
                          className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center text-slate-400 font-bold italic uppercase tracking-tighter">
                  Ma'lumot topilmadi
                </div>
              )}
            </div>

            {/* PAGINATION ... (oz'garishsiz) */}
            <div className="pt-8 border-t border-slate-50 flex flex-col items-center gap-6">
              <div className="w-full flex justify-between items-center">
                <div className="flex items-center gap-2 bg-slate-50 pl-4 pr-1 py-1 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    ЛИМИТ:
                  </span>
                  <select
                    value={limit}
                    onChange={(e) => {
                      setLimit(Number(e.target.value));
                      setPage(1);
                    }}
                    className="bg-white text-[#3b59ce] font-black text-xs py-1.5 px-3 rounded-xl outline-none border-none"
                  >
                    <option value={5}>5 линий</option>
                    <option value={10}>10 линий</option>
                  </select>
                </div>
                <div className="bg-[#f0f5ff] px-5 py-2.5 rounded-2xl font-black text-[11px] text-slate-500 uppercase">
                  Показано {(page - 1) * limit + 1} –{" "}
                  {Math.min(page * limit, productsData?.totalCount || 0)} из{" "}
                  {productsData?.totalCount || 0}
                </div>
              </div>
              <div className="flex items-center gap-1 bg-white p-1.5 rounded-[22px] shadow-lg border border-slate-50">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="p-2.5 rounded-full text-slate-300 hover:bg-slate-50 disabled:opacity-30"
                >
                  <ChevronLeft size={20} />
                </button>
                {Array.from({ length: totalPages || 1 }, (_, i) => i + 1).map(
                  (n) => (
                    <button
                      key={n}
                      onClick={() => setPage(n)}
                      className={`w-10 h-10 rounded-xl text-sm font-black transition-all ${
                        page === n
                          ? "bg-[#3b59ce] text-white"
                          : "text-slate-400 hover:bg-slate-50"
                      }`}
                    >
                      {n}
                    </button>
                  )
                )}
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-2.5 rounded-full text-slate-600 hover:bg-slate-50 disabled:opacity-30"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* BALANCE CARD */}
        <div className="lg:col-span-4">
          <div className="bg-[#1e293b] text-white p-8 rounded-[35px] shadow-xl border border-white/5">
            <p className="text-slate-400 text-[10px] font-black uppercase mb-4 tracking-widest">
              BALANS
            </p>
            <h2 className="text-4xl font-black mb-8 italic">
              1.200.000{" "}
              <small className="text-xs uppercase opacity-30">uzs</small>
            </h2>
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-[#3b59ce] w-[65%]" />
            </div>
          </div>
        </div>
      </div>

      {/* MODALS (Avvalgi o'zgartirilgan chiroyli versiyalar) */}
      {openAdd && (
        <ModalStructure
          title="Добавить расход"
          close={closeAddModal}
          form={createForm}
          submit={(data) => {
            const user = JSON.parse(localStorage.getItem("user"));
            createMutation.mutate({ ...data, user: user?._id || user?.id });
          }}
          units={allUnits}
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
          btnText="Сохранить изменения"
        />
      )}
    </div>
  );
};

// MODAL COMPONENT (Avvalgi iconli errorlar bilan)
const ModalStructure = ({ title, close, form, submit, units, btnText }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;
  const baseInputClass =
    "w-full p-4 rounded-2xl bg-slate-50 border outline-none focus:outline-none focus:ring-0 font-bold transition-all";
  const getBorderClass = (fieldName) =>
    errors[fieldName]
      ? "border-red-500 focus:border-red-500"
      : "border-slate-200 focus:border-slate-200";

  const ErrorMsg = ({ name }) =>
    errors[name] ? (
      <div className="flex items-center gap-1 text-red-500 text-[10px] font-bold ml-2 uppercase italic animate-in fade-in mt-1 leading-none">
        <AlertCircle size={11} strokeWidth={3} className="mb-[1px]" />
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
            type="button"
            className="p-2 bg-slate-100 rounded-full hover:bg-red-50 hover:text-red-500 transition-all"
          >
            <X size={20} />
          </button>
        </div>
        <form
          onSubmit={handleSubmit(submit)}
          className="grid grid-cols-2 gap-5"
        >
          <div className="col-span-2 space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">
              Название
            </label>
            <input
              {...register("title", { required: "Введите название" })}
              className={`${baseInputClass} ${getBorderClass("title")}`}
            />
            <ErrorMsg name="title" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">
              Дата
            </label>
            <input
              type="date"
              {...register("dateOfPayment", { required: "Выберите дату" })}
              className={`${baseInputClass} ${getBorderClass("dateOfPayment")}`}
            />
            <ErrorMsg name="dateOfPayment" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">
              Ед. изм.
            </label>
            <select
              {...register("edinisaIzmereniya", {
                required: "Выберите ед. изм.",
              })}
              className={`${baseInputClass} ${getBorderClass(
                "edinisaIzmereniya"
              )}`}
            >
              <option value="">Выберите...</option>
              {units.map((unit) => (
                <option key={unit._id} value={unit._id}>
                  {unit.title}
                </option>
              ))}
            </select>
            <ErrorMsg name="edinisaIzmereniya" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">
              Кол-во
            </label>
            <input
              type="number"
              step="0.01"
              {...register("quantity", {
                required: "Укажите кол-во",
                min: { value: 0.01, message: "Мин 0.01" },
              })}
              className={`${baseInputClass} ${getBorderClass("quantity")}`}
            />
            <ErrorMsg name="quantity" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">
              Цена
            </label>
            <input
              type="number"
              {...register("priceForOne", {
                required: "Укажите цену",
                min: { value: 1, message: "Мин 1" },
              })}
              className={`${baseInputClass} ${getBorderClass("priceForOne")}`}
            />
            <ErrorMsg name="priceForOne" />
          </div>
          <div className="col-span-2 space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">
              Сумма
            </label>
            <input
              type="number"
              {...register("sum")}
              readOnly
              className="w-full p-4 rounded-2xl bg-blue-50 text-blue-700 font-black border border-blue-100 outline-none"
            />
          </div>
          <button
            type="submit"
            className="col-span-2 w-full bg-[#3b59ce] text-white py-5 rounded-3xl font-black text-lg shadow-xl uppercase italic hover:bg-[#2e47a5] transition-all active:scale-[0.98]"
          >
            {btnText}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Products;
