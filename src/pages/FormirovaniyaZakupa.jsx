import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Trash2,
  Pencil,
  X,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import instance from "../utils/axios";

const API_URL = "http://localhost:2000/xaridlar";

export default function FormirovaniyaZakupa() {
  const [items, setItems] = useState([]);
  const [totalSum, setTotalSum] = useState("0");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // --- PAGINATION STATES ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // DIQQAT: form ichidagi 'name' ni 'productTitle' ga o'zgartirdik
  const [form, setForm] = useState({
    productTitle: "",
    createdAt: new Date().toISOString().split("T")[0],
    neededBy: "",
    lastPrice: "",
    quantity: "",
    note: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [toast, setToast] = useState({
    show: false,
    type: "success",
    message: "",
  });

  const [confirmDelete, setConfirmDelete] = useState({
    show: false,
    id: null,
  });

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await instance.get(API_URL);
      setItems(res.data.products || []);
      setTotalSum(res.data.totalSum || "0");
    } catch (err) {
      console.error("Xatolik yuz berdi:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const filtered = items.filter((item) =>
    (item.productTitle || "").toLowerCase().includes(search.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const showToast = (type, message) => {
    setToast({
      show: true,
      type,
      message,
    });

    setTimeout(() => {
      setToast((prev) => ({
        ...prev,
        show: false,
      }));
    }, 1000);
  };

  const openDeleteConfirm = (id) => {
    setConfirmDelete({
      show: true,
      id,
    });
  };

  const closeDeleteConfirm = () => {
    setConfirmDelete({
      show: false,
      id: null,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.productTitle.trim()) {
      showToast("warning", "Название kiritish shart!");
      return;
    }

    const cleanPrice =
      Number(form.lastPrice.toString().replace(/\s/g, "")) || 0;

    const inputQuantity = parseFloat(form.quantity);

    const cleanQuantity =
      !isNaN(inputQuantity) && inputQuantity > 0 ? inputQuantity : 1;

    const dataToSend = {
      productTitle: form.productTitle.trim(),
      priceForOne: cleanPrice,
      quantity: cleanQuantity,
      sum: cleanPrice * cleanQuantity,
      neededBy: form.neededBy,
      note: form.note,
      createdAt: form.createdAt,
    };

    try {
      if (editingId) {
        await instance.put(`${API_URL}/${editingId}`, dataToSend);

        showToast("success", "Muvaffaqiyatli yangilandi");
      } else {
        await instance.post(API_URL, dataToSend);

        showToast("success", "Yangi xarid qo'shildi");
      }

      await fetchItems();

      closeModal();

      console.log(dataToSend);
    } catch (err) {
      console.log("Saqlashda xato:", err.response?.data);

      showToast(
        "error",
        err.response?.data?.message || "Serverga yuborishda xato"
      );
    }
  };

  const handleDelete = async (id) => {
    try {
      setItems((prevItems) => prevItems.filter((item) => item._id !== id));

      await instance.delete(`${API_URL}/${id}`);

      const res = await instance.get(API_URL);
      setTotalSum(res.data.totalSum || "0");

      showToast("success", "Xarid o'chirildi");

      closeDeleteConfirm();
    } catch (err) {
      fetchItems();

      showToast("error", "O'chirishda xatolik");

      closeDeleteConfirm();
    }
  };

  const handleEdit = (item) => {
    const formatToDateInput = (dateStr) => {
      if (!dateStr) return "";
      if (dateStr.includes("/")) {
        const [d, m, y] = dateStr.split("/");
        return `${y}-${m}-${d}`;
      }
      return dateStr;
    };

    setForm({
      productTitle: item.productTitle || "", // Editda ham productTitle ni to'g'ri olamiz
      createdAt: formatToDateInput(item.createdAt),
      neededBy: item.neededBy || "",
      lastPrice: item.priceForOne?.toString().replace(/\s/g, "") || "",
      note: item.note || "",
      quantity: item.quantity || "",
    });
    setEditingId(item._id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm({
      productTitle: "",
      createdAt: new Date().toISOString().split("T")[0],
      neededBy: "",
      lastPrice: "",
      quantity: "",
      note: "",
    });
  };

  return (
    <div className="p-6 md:p-10 bg-[#F8FAFC] min-h-screen font-sans">
      {/* Sarlavha qismi */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Формирование закупки
          </h1>
          <p className="text-slate-500 font-medium">
            Управляйте всеми покупками в одном месте
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[#4F5BD5] text-white px-6 py-3 rounded-2xl font-bold hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-200"
        >
          <Plus size={20} /> Добавить
        </button>
      </div>

      {/* Qidiruv */}
      <div className="flex items-center gap-3 bg-white p-4 rounded-[24px] shadow-sm border border-slate-100 mb-8 max-w-2xl">
        <Search className="text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Поиск по названию..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full outline-none bg-transparent text-slate-700 font-medium"
        />
      </div>

      {/* Umumiy budjet kartasi */}
      <div className="bg-[#4F5BD5] px-8 mx-1 mb-8 py-4 rounded-[24px] shadow-lg shadow-indigo-200 flex items-center gap-4 w-fit">
        <div className="p-2 bg-white/20 rounded-xl text-white">
          <Calendar size={20} />
        </div>
        <div className="flex flex-col">
          <span className="text-[12px] uppercase font-bold text-white/70 leading-none">
            Общий бюджет
          </span>
          <span className="text-2xl font-black text-white">{totalSum} сум</span>
        </div>
      </div>

      {/* Jadval qismi */}
      <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden mb-10">
        {loading ? (
          <div className="p-10 text-center text-slate-500 font-bold">
            Ma'lumotlar yuklanmoqda...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 uppercase text-[11px] font-bold tracking-widest">
                  <th className="p-5 border-b border-slate-50">Название</th>
                  <th className="p-5 border-b border-slate-50">
                    Требуемая дата
                  </th>
                  <th className="p-5 border-b border-slate-50 text-center">
                    Кол-во
                  </th>
                  <th className="p-5 border-b border-slate-50 text-right pr-10">
                    Цена
                  </th>
                  <th className="p-5 border-b border-slate-50 text-right">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                {currentItems.map((item) => (
                  <tr
                    key={item._id}
                    className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="p-5 font-bold text-slate-800">
                      {item.productTitle}
                    </td>
                    <td className="p-5 text-sm font-semibold text-indigo-600">
                      {item.neededBy || "---"}
                    </td>
                    <td className="p-5 text-center font-bold text-slate-600">
                      {item.quantity || 1} шт/кг
                    </td>
                    <td className="p-5 font-bold text-right pr-10">
                      {item.priceForOne?.toLocaleString()}{" "}
                      <small className="text-slate-400">сум</small>
                    </td>
                    <td className="p-5 flex justify-end gap-3">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2.5 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 transition-all"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => openDeleteConfirm(item._id)}
                        className="p-2.5 rounded-xl bg-[#FFF1F2] text-[#E11D48] hover:bg-[#FFE4E6] transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-6 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between gap-4 bg-white">
                <p className="text-sm text-slate-500 font-medium">
                  Показано{" "}
                  <span className="text-slate-800 font-bold">
                    {indexOfFirstItem + 1}
                  </span>{" "}
                  -{" "}
                  <span className="text-slate-800 font-bold">
                    {Math.min(indexOfLastItem, filtered.length)}
                  </span>{" "}
                  из{" "}
                  <span className="text-slate-800 font-bold">
                    {filtered.length}
                  </span>
                </p>
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className={`p-2.5 rounded-xl border transition-all ${
                      currentPage === 1
                        ? "text-slate-300 border-slate-100 cursor-not-allowed"
                        : "text-slate-600 border-slate-200 hover:bg-slate-50 active:scale-90"
                    }`}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-10 h-10 rounded-xl font-bold transition-all ${
                        currentPage === i + 1
                          ? "bg-[#4F5BD5] text-white shadow-lg shadow-indigo-100"
                          : "text-slate-500 hover:bg-slate-50 border border-transparent hover:border-slate-200"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className={`p-2.5 rounded-xl border transition-all ${
                      currentPage === totalPages
                        ? "text-slate-300 border-slate-100 cursor-not-allowed"
                        : "text-slate-600 border-slate-200 hover:bg-slate-50 active:scale-90"
                    }`}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            onClick={closeModal}
          ></div>
          <div className="relative bg-white w-full max-w-lg rounded-[32px] shadow-2xl p-8 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-slate-800">
                {editingId !== null ? "Обновить закупку" : "Новая закупка"}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Название"
                required
                value={form.productTitle} // Input ham productTitle ga bog'landi
                onChange={(e) =>
                  setForm({ ...form, productTitle: e.target.value })
                }
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
              />
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 ml-2">
                    Дата создания
                  </label>
                  <input
                    type="date"
                    value={form.createdAt}
                    onChange={(e) =>
                      setForm({ ...form, createdAt: e.target.value })
                    }
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 ml-2">
                    Требуемая дата
                  </label>
                  <input
                    type="date"
                    value={form.neededBy}
                    onChange={(e) =>
                      setForm({ ...form, neededBy: e.target.value })
                    }
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none font-medium"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 ml-2 text-indigo-500">
                    Кол-во
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="1"
                    value={form.quantity}
                    onChange={(e) =>
                      setForm({ ...form, quantity: e.target.value })
                    }
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 ml-2">
                    Цена за единицу
                  </label>
                  <input
                    type="number"
                    placeholder="Цена"
                    value={form.lastPrice}
                    onChange={(e) =>
                      setForm({ ...form, lastPrice: e.target.value })
                    }
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                  />
                </div>
              </div>
              <textarea
                placeholder="Комментарий"
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 h-28 resize-none outline-none font-medium"
              />
              <button
                type="submit"
                className="w-full bg-[#4F5BD5] text-white py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg mt-4 active:scale-95"
              >
                {editingId !== null ? "Сохранить изменения" : "Сохранить"}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* TOAST */}
      {toast.show && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] animate-in fade-in slide-in-from-top-8 duration-500 ease-out">
          <div className="relative group">
            {/* 1. Neon Glow - Orqa fondagi nurlanish */}
            <div
              className={`absolute -inset-1 blur-xl opacity-40 transition duration-500 rounded-[16px]
        ${
          toast.type === "success"
            ? "bg-[#10B981]"
            : toast.type === "error"
            ? "bg-[#F43F5E]"
            : "bg-[#F59E0B]"
        }`}
            ></div>

            {/* 2. Asosiy Toast Tanasi */}
            <div className="relative px-6 py-4 rounded-[16px] bg-[#0F172A]/90 backdrop-blur-2xl border border-white/10 shadow-2xl flex items-center gap-4 min-w-[320px]">
              {/* 3. Ikonka uchun aylana */}
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 
          ${
            toast.type === "success"
              ? "bg-[#10B981]/20 border-[#10B981]/50 text-[#34D399]"
              : toast.type === "error"
              ? "bg-[#F43F5E]/20 border-[#F43F5E]/50 text-[#FB7185]"
              : "bg-[#F59E0B]/20 border-[#F59E0B]/50 text-[#FBBF24]"
          }`}
              >
                <span className="text-xl font-bold">
                  {toast.type === "success"
                    ? "✓"
                    : toast.type === "error"
                    ? "✕"
                    : "!"}
                </span>
              </div>

              {/* 4. Matn qismi */}
              <div className="flex flex-col">
                <div className="text-white font-bold tracking-tight text-[15px]">
                  {toast.message}
                </div>
                <div className="text-[#94A3B8] text-[12px] font-medium">
                  {toast.type === "success"
                    ? "Muvaffaqiyatli yakunlandi"
                    : "Tizim xabari"}
                </div>
              </div>

              {/* 5. Pastki dekorativ chiziq */}
              <div
                className={`absolute bottom-0 left-4 right-4 h-[2px] rounded-full opacity-50
          ${
            toast.type === "success"
              ? "bg-[#10B981]"
              : toast.type === "error"
              ? "bg-[#F43F5E]"
              : "bg-[#F59E0B]"
          }`}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {confirmDelete.show && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeDeleteConfirm}
          />

          <div className="relative bg-white w-full max-w-sm rounded-[32px] p-7 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-rose-100 flex items-center justify-center mb-5">
                <Trash2 className="text-[#F43F5E]" size={34} />
              </div>

              <h2 className="text-2xl font-black text-slate-800 mb-2">
                O'chirilsinmi?
              </h2>

              <p className="text-slate-500 font-medium mb-7">
                Bu amalni ortga qaytarib bo'lmaydi
              </p>

              <div className="flex items-center gap-3 w-full">
                <button
                  onClick={closeDeleteConfirm}
                  className="flex-1 py-3 rounded-2xl bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#334155] font-bold transition-all"
                >
                  Bekor qilish
                </button>

                <button
                  onClick={() => handleDelete(confirmDelete.id)}
                  className="flex-1 py-3 rounded-2xl bg-[#F43F5E] hover:bg-[#E11D48] text-white font-black shadow-lg shadow-[#FECDD3] transition-all"
                >
                  O'chirish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
