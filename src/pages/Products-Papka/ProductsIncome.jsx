import React, { useState } from "react";
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
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast"; // ✅ Toaster shu yerda import
import instance from "../../utils/axios";
import { useNavigate } from "react-router-dom";
import ModalStructure from "../Products-Papka/ProductsCreateForm"; // ✅ Edit modal uchun

const IncomePage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [dateFilter, setDateFilter] = useState({ from: "", to: "" });
  const [openHistory, setOpenHistory] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // ✅ Edit modal uchun state'lar
  const [openEdit, setOpenEdit] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productSearch, setProductSearch] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);

  const nav = useNavigate();
  const queryClient = useQueryClient();

  const historyList = selectedProduct?.history
    ?.sort((a, b) => new Date(a.dateOfPayment) - new Date(b.dateOfPayment))
    ?.map((item, index, arr) => {
      const prev = arr[index - 1];
      const prevQty = prev ? prev.quantity : 0;

      return {
        ...item,
        before: prevQty,
        change: item.quantity,
        after: prevQty + Number(item.quantity),
      };
    });

  // ✅ Edit formasi
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

  // 3. ASOSIY DATA — faqat income
  const { data: productsData, isLoading } = useQuery({
    queryKey: ["productsIncome", searchTerm, selectedCategory, dateFilter],
    queryFn: async () => {
      const res = await instance.get("/products");
      const allData = res.data || [];

      let filteredData = allData.filter((item) => item.type === "income");

      if (searchTerm?.trim()) {
        filteredData = filteredData.filter((item) => {
          const productName =
            typeof item.title === "object"
              ? item.title?.title
              : titleProducts.find((p) => p._id === item.title)?.title || "";
          return productName.toLowerCase().includes(searchTerm.toLowerCase());
        });
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
          const from = dateFilter.from ? new Date(dateFilter.from) : null;
          const to = dateFilter.to ? new Date(dateFilter.to) : null;
          if (from && !to) return itemDate >= from;
          if (!from && to) return itemDate <= to;
          if (from && to) return itemDate >= from && itemDate <= to;
          return true;
        });
      }

      const sortedData = filteredData.sort(
        (a, b) => new Date(b.dateOfPayment) - new Date(a.dateOfPayment)
      );

      // 🔥 GROUP
      const grouped = {};

      sortedData.forEach((item) => {
        const key =
          typeof item.title === "object" ? item.title._id : item.title;

        if (!grouped[key]) {
          grouped[key] = {
            ...item,
            quantity: Number(item.quantity),
            totalPrice: Number(item.quantity) * Number(item.priceForOne),
            history: [item],
          };
        } else {
          grouped[key].quantity += Number(item.quantity);
          grouped[key].totalPrice +=
            Number(item.quantity) * Number(item.priceForOne);

          grouped[key].history.push(item);

          if (
            new Date(item.dateOfPayment) > new Date(grouped[key].dateOfPayment)
          ) {
            grouped[key].dateOfPayment = item.dateOfPayment;
          }
        }
      });

      const groupedArray = Object.values(grouped);

      // 🔥 RETURN
      return {
        items: groupedArray,
        totalCount: groupedArray.length,
        totalSum: groupedArray.reduce((acc, curr) => acc + curr.totalPrice, 0),
      };
    },
    enabled: titleProducts.length >= 0, // titleProducts bo'lmasa ham ishlaydi
  });

  // ✅ DELETE — faqat income uchun, o'z toastId bilan
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await instance.delete(`/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productsIncome"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });

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
    mutationFn: async (data) =>
      await instance.put(
        `/products/${editingProduct._id || editingProduct.id}`,
        data
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["productsIncome"] });
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Данные успешно обновлены", {
        style: { borderRadius: "16px", background: "#1e293b", color: "#fff" },
      });
      closeEditModal();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Yangilashda xatolik");
    },
  });

  // ✅ DELETE confirm — o'z sahifasida, "income-page-confirm" toastId
  const handleDelete = (id) => {
    if (!id) return;

    // 1. Avval hamma narsani tozalash (majburiy)
    toast.dismiss();

    toast(
      ({ closeToast }) => (
        <div className="flex flex-col gap-3 p-1">
          <div className="flex items-center gap-2 text-slate-800">
            <Trash size={18} className="text-red-500" />
            <span className="font-bold text-sm">Удалить этот ПРИХОД?</span>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={() => toast.dismiss()} // Hamma toastni yopish
              className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={() => {
                // 2. Avval confirm oynasini yopamiz
                toast.dismiss();

                // 3. Keyin o'chirishni ishga tushiramiz
                deleteMutation.mutate(id);
              }}
              className="px-4 py-1.5 text-xs font-bold bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 cursor-pointer"
            >
              Да, удалить
            </button>
          </div>
        </div>
      ),
      {
        // 4. toastId ni olib tashladik (ba'zan u "muzlab" qolishga sabab bo'ladi)
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
    updateForm.reset({
      title: product.title?._id || product.title,
      dateOfPayment: product.dateOfPayment,
      edinisaIzmereniya:
        product.edinisaIzmereniya?._id || product.edinisaIzmereniya,
      productsCategory:
        product.productsCategory?._id || product.productsCategory,
      quantity: product.quantity,
      priceForOne: product.priceForOne,
      type: "income", // ✅ Har doim income bo'lib saqlanadi
    });
    setOpenEdit(true);
  };

  const closeEditModal = () => {
    setOpenEdit(false);
    setEditingProduct(null);
    updateForm.reset();
    setProductSearch("");
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
    updateMutation.mutate({
      ...data,
      type: "income", // ✅ Update qilganda ham income saqlanadi
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

  if (isLoading)
    return (
      <div className="p-20 text-center font-black text-slate-300 animate-pulse uppercase tracking-[0.3em]">
        Yuklanmoqda...
      </div>
    );

  const products = productsData?.items || [];

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8">
      {/* ✅ Toaster shu sahifada — boshqa sahifaga chiqib ketmaydi */}
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
            Barcha kirim operatsiyalari va ombor statistikasi
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
              Bugungi sana
            </p>
            <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase italic">
              {new Date().toLocaleDateString("ru-RU")}
            </h3>
          </div>
        </div>
      </div>

      {/* 3. FILTER & SEARCH */}
      {/* <div className="bg-white p-5 rounded-[28px] shadow-sm border border-slate-100 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative md:col-span-2">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Поиск товара по названию..."
            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 ring-green-500/20 font-bold text-slate-700 transition-all"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 col-span-1">
          <input
            type="date"
            className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl outline-none font-bold text-slate-500 text-sm"
            onChange={(e) =>
              setDateFilter({ ...dateFilter, from: e.target.value })
            }
          />
        </div>
        <div className="flex gap-2 col-span-1">
          <button className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-600 px-5 py-3 rounded-xl font-black text-xs uppercase hover:bg-slate-200 transition-all">
            <Filter size={16} />
            Фильтры
          </button>
        </div>
      </div> */}

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
                  Кол-во
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
              {products.map((item) => {
                const productName =
                  typeof item.title === "object"
                    ? item.title?.title
                    : titleProducts.find((p) => p._id === item.title)?.title ||
                      item.title ||
                      "Без названия";

                return (
                  <tr
                    key={item._id}
                    className="hover:bg-green-50/30 transition-all group"
                  >
                    <td className="p-6">
                      <div className="font-black text-slate-700 text-base uppercase tracking-tight">
                        {productName}
                      </div>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-[11px] text-slate-400 font-black italic">
                          {item.dateOfPayment}
                        </span>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase border border-blue-100">
                        {item.productsCategory?.title || "Общее"}
                      </span>
                    </td>
                    <td className="p-6 text-center">
                      <div className="font-black text-slate-700 text-lg">
                        {item.quantity}
                      </div>
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
                          className="p-2.5 bg-white shadow-sm border border-slate-100 text-slate-600 rounded-xl hover:bg-slate-800 hover:text-white transition-all"
                        >
                          <ReceiptText size={18} />
                        </button>
                        {/* ✅ EDIT tugmasi — endi ishlaydi */}
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="p-2.5 bg-white shadow-sm border border-slate-100 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all active:scale-90"
                        >
                          <Pencil size={18} />
                        </button>
                        {/* ✅ DELETE tugmasi — confirm shu sahifada */}
                        <button
                          type="button"
                          disabled={deleteMutation.isPending}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDelete(item._id);
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
      </div>

      {openHistory && selectedProduct && (
  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-300">
    <div className="bg-white w-[450px] rounded-[35px] p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] relative overflow-hidden">
      
      {/* DEKORATIV FON */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 z-0" />

      {/* HEADER */}
      <div className="relative z-10 flex justify-between items-start mb-6">
        <div>
          <h2 className="font-black text-2xl text-slate-800 leading-tight tracking-tighter uppercase italic">
            {selectedProduct.title?.title || selectedProduct.title}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
              Текущий остаток: <span className="text-blue-600">{selectedProduct.quantity} шт</span>
            </p>
          </div>
        </div>
        <button 
          onClick={() => setOpenHistory(false)}
          className="p-2 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      {/* HISTORY LIST */}
      <div className="relative z-10 flex flex-col gap-3 max-h-[420px] overflow-y-auto pr-2 custom-scroll">
        {historyList?.length > 0 ? (
          historyList.map((h, idx) => (
            <div
              key={h._id || idx}
              className="group bg-slate-50/50 border border-slate-100 rounded-[24px] p-4 flex justify-between items-center hover:bg-white hover:shadow-md hover:border-blue-100 transition-all duration-300"
            >
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-[2px]">Приход</span>
                <span className="text-[13px] font-bold text-slate-700">{h.dateOfPayment}</span>
                {h.priceForOne && (
                  <span className="text-[10px] text-slate-400 font-medium">
                    По {h.priceForOne.toLocaleString()} UZS
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4">
                {/* LOGIKA: OLDIN -> QOSHILDI -> KEYIN */}
                <div className="flex flex-col items-end">
                   <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[10px] font-bold text-slate-300 uppercase">было</span>
                      <span className="text-[12px] font-black text-slate-400">{h.before || 0}</span>
                   </div>
                   
                   <div className="bg-green-100 px-2 py-0.5 rounded-lg mb-1">
                      <span className="text-[14px] font-black text-green-600">+{h.change}</span>
                   </div>

                   <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-blue-400 uppercase">стало</span>
                      <span className="text-[16px] font-black text-slate-800 italic">{h.after}</span>
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

      {/* FOOTER BUTTON */}
      <button
        onClick={() => setOpenHistory(false)}
        className="relative z-10 mt-6 w-full bg-slate-900 text-white py-4 rounded-[20px] font-black text-[12px] uppercase tracking-[2px] shadow-lg shadow-slate-200 hover:bg-blue-600 hover:shadow-blue-200 transition-all active:scale-[0.98]"
      >
        Закрыть окно
      </button>
    </div>
  </div>
)}

      {/* ✅ EDIT MODAL — shu sahifada render bo'ladi */}
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
