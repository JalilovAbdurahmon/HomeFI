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
  ArrowLeft,
  ShoppingCart,
  Zap,
  MoreHorizontal,
  Package,
} from "lucide-react";
import instance from "../utils/axios";

const API_URL = "http://localhost:2000/xaridlar";

// 4 ta kategoriya konfiguratsiyasi
const CATEGORIES = [
  {
    key: "products",
    label: "Продукты",
    sublabel: "Oziq-ovqat mahsulotlari",
    icon: ShoppingCart,
    color: "#4F5BD5",
    shadow: "shadow-indigo-200",
    bg: "bg-indigo-50",
    text: "text-indigo-600",
  },
  {
    key: "communal",
    label: "Коммунальные",
    sublabel: "Kommunal xizmatlar",
    icon: Zap,
    color: "#10B981",
    shadow: "shadow-emerald-200",
    bg: "bg-emerald-50",
    text: "text-emerald-600",
  },
  {
    key: "prochee",
    label: "Прочее",
    sublabel: "Boshqa xarajatlar",
    icon: MoreHorizontal,
    color: "#F59E0B",
    shadow: "shadow-amber-200",
    bg: "bg-amber-50",
    text: "text-amber-600",
  },
  {
    key: "zakup",
    label: "Эта страница",
    sublabel: "Joriy sahifada qo'shilganlar",
    icon: Package,
    color: "#E11D48",
    shadow: "shadow-rose-200",
    bg: "bg-rose-50",
    text: "text-rose-600",
  },
];

export default function FormirovaniyaZakupa() {
  const [items, setItems] = useState([]);
  const [totalSum, setTotalSum] = useState("0");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // --- YANGI: Kategoriya tanlash state ---
  const [selectedCategory, setSelectedCategory] = useState(null);

  // --- PAGINATION STATES ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [form, setForm] = useState({
    productTitle: "",
    createdAt: new Date().toISOString().split("T")[0],
    neededBy: "",
    lastPrice: "",
    quantity: "",
    note: "",
    category: "zakup", // default kategoriya
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

  // localStorage ga category saqlash helper
  const saveCategoryLocal = (id, category) => {
    try {
      const cats = JSON.parse(localStorage.getItem("itemCategories") || "{}");
      cats[id] = category;
      localStorage.setItem("itemCategories", JSON.stringify(cats));
    } catch {}
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await instance.get(API_URL);
      const rawItems = res.data.products || [];

      // localStorage dan saqlangan categorylarni olish
      let savedCats = {};
      try {
        savedCats = JSON.parse(localStorage.getItem("itemCategories") || "{}");
      } catch {}

      // Har bir itemga category qo'shish
      // Ustuvorlik: 1) localStorage _id, 2) localStorage temp key, 3) backend category, 4) "zakup"
      // localStorage BIRINCHI — foydalanuvchi tanlagan category to'g'ri bo'ladi
      const itemsWithCat = rawItems.map((item) => {
        const tempKey = `temp_${item.productTitle}_${item.neededBy}`;
        const resolvedCat =
          savedCats[item._id] || savedCats[tempKey] || item.category || "zakup";

        // temp key orqali topilgan bo'lsa real _id ga ko'chiramiz
        if (!savedCats[item._id] && savedCats[tempKey]) {
          saveCategoryLocal(item._id, resolvedCat);
        }

        return { ...item, category: resolvedCat };
      });

      setItems(itemsWithCat);
      setTotalSum(res.data.totalSum || "0");
    } catch (err) {
      console.error("Xatolik yuz berdi:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    const handleGlobalUpdate = () => fetchItems();
    window.addEventListener("xaridUpdated", handleGlobalUpdate);
    return () => window.removeEventListener("xaridUpdated", handleGlobalUpdate);
  }, []);

  // Kategoriya bo'yicha filter
  // Agar itemda category yo'q bo'lsa (eski itemlar) => "zakup" deb hisoblaymiz
  const getItemCategory = (item) => item.category || "zakup";

  const filteredByCategory = selectedCategory
    ? items.filter((item) => getItemCategory(item) === selectedCategory)
    : [];

  const filtered = filteredByCategory.filter((item) =>
    (item.productTitle || "").toLowerCase().includes(search.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory]);

  // Har bir kategoriya uchun count va sum
  const calcItemSum = (item) => {
    // priceForOne string yoki number bo'lishi mumkin, ikkalasini ham handle qilamiz
    const raw = String(item.priceForOne || "0")
      .replace(/\s/g, "")
      .replace(/,/g, ".");
    const price = parseFloat(raw) || 0;
    const qty = parseFloat(item.quantity) || 1;
    return price * qty;
  };

  const getCategoryStats = (catKey) => {
    const catItems = items.filter(
      (item) => (item.category || "zakup") === catKey
    );
    const sum = catItems.reduce((acc, item) => acc + calcItemSum(item), 0);
    return { count: catItems.length, sum };
  };

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 1000);
  };

  const openDeleteConfirm = (id) => setConfirmDelete({ show: true, id });
  const closeDeleteConfirm = () => setConfirmDelete({ show: false, id: null });

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
    const chosenCategory = form.category || selectedCategory || "zakup";
    const dataToSend = {
      productTitle: form.productTitle.trim(),
      priceForOne: cleanPrice,
      quantity: cleanQuantity,
      sum: cleanPrice * cleanQuantity,
      neededBy: form.neededBy,
      note: form.note,
      createdAt: form.createdAt,
      category: chosenCategory,
    };
    try {
      if (editingId) {
        // Edit: mavjud _id ga category saqlash
        saveCategoryLocal(editingId, chosenCategory);
        await instance.put(`${API_URL}/${editingId}`, dataToSend);
        showToast("success", "Muvaffaqiyatli yangilandi");
      } else {
        // Create: backend response dan _id olish
        const response = await instance.post(API_URL, dataToSend);
        // Backend turli shaklda qaytarishi mumkin, hammasini tekshiramiz
        const newId =
          response.data?._id ||
          response.data?.product?._id ||
          response.data?.data?._id ||
          response.data?.newProduct?._id ||
          null;

        if (newId) {
          saveCategoryLocal(newId, chosenCategory);
        } else {
          // _id kelmasa, keyingi fetchdan keyin barcha yangi itemlarga category qo'shamiz
          // Vaqtinchalik: productTitle + neededBy kombinatsiyasini key sifatida ishlatamiz
          const tempKey = `temp_${dataToSend.productTitle}_${dataToSend.neededBy}`;
          saveCategoryLocal(tempKey, chosenCategory);
        }
        showToast("success", "Yangi xarid qo'shildi");
      }

      await fetchItems();
      window.dispatchEvent(new Event("xaridUpdated"));
      closeModal();
    } catch (err) {
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
      window.dispatchEvent(new Event("xaridUpdated"));
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
      productTitle: item.productTitle || "",
      createdAt: formatToDateInput(item.createdAt),
      neededBy: item.neededBy || "",
      lastPrice: item.priceForOne?.toString().replace(/\s/g, "") || "",
      note: item.note || "",
      quantity: item.quantity || "",
      category: item.category || selectedCategory || "zakup",
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
      category: selectedCategory || "zakup",
    });
  };

  const activeCat = CATEGORIES.find((c) => c.key === selectedCategory);

  // ─── CARD VIEW (Kategoriya tanlanmagan) ───
  if (!selectedCategory) {
    return (
      <div className="p-6 md:p-10 bg-[#F8FAFC] min-h-screen font-sans">
        {/* Ixcham Sarlavha qismi */}
        <div className="mb-8 relative">
          {/* Tepasidagi minimalist chiziq */}
          <div className="h-1.5 w-10 bg-[#4F5BD5] rounded-full mb-3"></div>

          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-[1000] text-slate-800 tracking-tighter uppercase italic leading-none">
              Формирование
              <span className="ml-2 text-transparent bg-clip-text bg-gradient-to-r from-[#4F5BD5] to-emerald-500">
                закупки
              </span>
            </h1>

            <div className="flex items-center gap-2 mt-1">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em]">
                Управления расходами{" "}
                <span className="mx-1 text-slate-200">|</span>
                <span className="text-[#4F5BD5]/70">Выберите категорию</span>
              </p>
            </div>
          </div>
        </div>

        {/* Umumiy budjet - Yangilangan Premium Dizayn */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#4F5BD5] to-[#3A44A1] px-10 py-7 mx-1 mb-12 rounded-[35px] shadow-2xl shadow-indigo-200 flex items-center gap-6 w-fit min-w-[320px] group transition-all hover:scale-[1.02]">
          {/* Orqa fondagi bezak doirachalar (dekoratsiya uchun) */}
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
          <div className="absolute -left-4 -bottom-4 w-16 h-16 bg-indigo-400/20 rounded-full blur-xl"></div>

          {/* Ikonka qismi */}
          <div className="relative p-4 bg-white/15 backdrop-blur-md border border-white/20 rounded-[22px] text-white shadow-inner">
            <Calendar size={32} strokeWidth={2.5} />
          </div>

          {/* Matn qismi */}
          <div className="relative flex flex-col gap-1">
            <span className="text-[13px] uppercase font-black text-indigo-100 tracking-[0.1em] opacity-80">
              Общий Расход
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-white tracking-tight">
                {totalSum}
              </span>
              <span className="text-lg font-bold text-indigo-200 italic uppercase">
                сум
              </span>
            </div>
          </div>
        </div>

        {/* 4 ta Karta */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORIES.map((cat) => {
            const stats = getCategoryStats(cat.key);
            const Icon = cat.icon;
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`group relative bg-white rounded-[28px] p-7 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all duration-300 text-left overflow-hidden`}
              >
                {/* Dekorativ orqa fon doirasi */}
                <div
                  className="absolute -right-6 -top-6 w-28 h-28 rounded-full opacity-10 transition-all duration-300 group-hover:opacity-20 group-hover:scale-110"
                  style={{ backgroundColor: cat.color }}
                />

                {/* Ikonka */}
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${cat.bg}`}
                >
                  <Icon size={26} style={{ color: cat.color }} />
                </div>

                {/* Matn */}
                <h3 className="text-xl font-black text-slate-800 mb-1">
                  {cat.label}
                </h3>
                <p className="text-xs text-slate-400 font-medium mb-5">
                  {cat.sublabel}
                </p>

                {/* Stats */}
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[11px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                      Jami
                    </p>
                    <p
                      className="text-2xl font-black"
                      style={{ color: cat.color }}
                    >
                      {stats.count}
                      <span className="text-sm font-bold text-slate-400 ml-1">
                        ta
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                      Summa
                    </p>
                    <p className="text-sm font-black text-slate-600">
                      {stats.sum.toLocaleString()}
                      <span className="text-slate-400 font-bold ml-1 text-xs">
                        сум
                      </span>
                    </p>
                  </div>
                </div>

                {/* Pastki rang chizig'i */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-1 rounded-b-[28px] opacity-60"
                  style={{ backgroundColor: cat.color }}
                />
              </button>
            );
          })}
        </div>

        {/* Toast */}
        {toast.show && <ToastComponent toast={toast} />}
      </div>
    );
  }

  // ─── TABLE VIEW (Kategoriya tanlangan) ───
  return (
    <div className="p-6 md:p-10 bg-[#F8FAFC] min-h-screen font-sans">
      {/* Sarlavha */}
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-4">
          {/* Назад tugmasi */}
          <button
            onClick={() => {
              setSelectedCategory(null);
              setSearch("");
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 hover:-translate-x-0.5 active:scale-95 transition-all shadow-sm"
          >
            <ArrowLeft size={18} />
            Назад
          </button>

          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              {/* Ikonka bloki */}
              <div
                className={`w-11 h-11 rounded-[14px] flex items-center justify-center shadow-sm border border-white/50 ${activeCat.bg} transition-transform hover:scale-105`}
              >
                {activeCat && (
                  <activeCat.icon
                    size={22}
                    style={{ color: activeCat.color }}
                  />
                )}
              </div>

              {/* Matnlar bloki */}
              <div className="flex items-center gap-3 h-full">
                {/* mt-2 olib tashlandi, font-size va line-height markazlashishi uchun */}
                <h1 className="text-3xl font-[1000] text-slate-800 tracking-tighter uppercase italic leading-none">
                  {activeCat?.label}
                </h1>

                {/* Badge bloki - items-center va h-fit markazda saqlaydi */}
                <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full border border-slate-200/60 h-fit self-center mt-1">
                  {/* Pulsatsiya qiluvchi nuqta */}
                  <span className="w-1.5 h-1.5 bg-[#10b981] rounded-full animate-pulse flex-shrink-0"></span>

                  {/* Matn - leading-none bilan markazlashgan */}
                  <span className="text-[12px] font-black text-slate-500 uppercase tracking-wider leading-none">
                    {filtered.length} ta yozuv
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setForm((prev) => ({
              ...prev,
              category: selectedCategory || "zakup",
            }));
            setShowModal(true);
          }}
          className="flex items-center gap-2 text-white px-6 py-3 rounded-2xl font-bold hover:scale-105 active:scale-95 transition-all shadow-xl"
          style={{
            backgroundColor: activeCat?.color,
            boxShadow: `0 8px 24px ${activeCat?.color}33`,
          }}
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

      {/* Kategoriya summasi */}
      <div
        className="px-8 mx-1 mb-8 py-4 rounded-[24px] shadow-lg flex items-center gap-4 w-fit"
        style={{
          backgroundColor: activeCat?.color,
          boxShadow: `0 8px 24px ${activeCat?.color}44`,
        }}
      >
        <div className="p-2 bg-white/20 rounded-xl text-white">
          <Calendar size={20} />
        </div>
        <div className="flex flex-col">
          <span className="text-[12px] uppercase font-bold text-white/70 leading-none">
            Общий расход — {activeCat?.label}
          </span>
          <span className="text-2xl font-black text-white">
            {filteredByCategory
              .reduce((acc, item) => acc + calcItemSum(item), 0)
              .toLocaleString()}{" "}
            сум
          </span>
        </div>
      </div>

      {/* Jadval */}
      <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden mb-10">
        {loading ? (
          <div className="p-10 text-center text-slate-500 font-bold">
            Ma'lumotlar yuklanmoqda...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${activeCat?.bg}`}
            >
              {activeCat && (
                <activeCat.icon size={28} style={{ color: activeCat.color }} />
              )}
            </div>
            <p className="text-slate-400 font-bold text-lg">
              Hozircha yozuv yo'q
            </p>
            <p className="text-slate-300 font-medium text-sm mt-1">
              «Добавить» tugmasini bosing
            </p>
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
                  <th className="p-5 border-b border-slate-50">Комментарий</th>
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
                    <td
                      className="p-5 text-sm font-semibold"
                      style={{ color: activeCat?.color }}
                    >
                      {item.neededBy || "---"}
                    </td>
                    <td className="p-5 text-center font-bold text-slate-600">
                      {item.quantity || 1} шт/кг
                    </td>
                    <td className="p-5 font-bold text-right pr-10">
                      {item.priceForOne?.toLocaleString()}{" "}
                      <small className="text-slate-400">сум</small>
                    </td>
                    <td className="p-5">
                      <p
                        className="text-sm text-slate-500 max-w-[200px] truncate font-medium"
                        title={item.note}
                      >
                        {item.note || (
                          <span className="text-slate-300">---</span>
                        )}
                      </p>
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
                          ? "text-white shadow-lg"
                          : "text-slate-500 hover:bg-slate-50 border border-transparent hover:border-slate-200"
                      }`}
                      style={
                        currentPage === i + 1
                          ? { backgroundColor: activeCat?.color }
                          : {}
                      }
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
              <div className="group relative">
                <label className="text-[10px] uppercase font-bold text-slate-500 ml-2 tracking-[0.1em] opacity-90 group-focus-within:text-slate-800 transition-colors">
                  Название товара / услуги
                </label>
                <div className="relative mt-1.5">
                  <input
                    type="text"
                    placeholder="Masalan: Maxsus xaridlar..."
                    required
                    value={form.productTitle}
                    onChange={(e) =>
                      setForm({ ...form, productTitle: e.target.value })
                    }
                    className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-[18px] text-slate-700 text-base font-bold outline-none ring-0 focus:ring-0 focus:border-slate-400 transition-all duration-200 placeholder:text-slate-300 placeholder:font-normal"
                  />
                </div>
              </div>

              {/* Kategoriya tanlash (modal ichida) */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-500 ml-2 tracking-[0.1em]">
                  Kategoriya
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isActive = form.category === cat.key;
                    return (
                      <button
                        key={cat.key}
                        type="button"
                        onClick={() => setForm({ ...form, category: cat.key })}
                        className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl border-2 transition-all font-bold text-[11px] ${
                          isActive
                            ? "border-current"
                            : "border-slate-100 text-slate-400 hover:border-slate-200"
                        }`}
                        style={
                          isActive
                            ? {
                                borderColor: cat.color,
                                color: cat.color,
                                backgroundColor: `${cat.color}12`,
                              }
                            : {}
                        }
                      >
                        <Icon size={18} />
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

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
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-500 ml-2 tracking-[0.1em] opacity-90">
                    Требуемая дата
                  </label>
                  <div className="relative">
                    <input
                      type={form.neededBy ? "date" : "text"}
                      onFocus={(e) => (e.target.type = "date")}
                      onBlur={(e) => !form.neededBy && (e.target.type = "text")}
                      placeholder="Sana tanlang..."
                      required
                      value={form.neededBy}
                      onChange={(e) =>
                        setForm({ ...form, neededBy: e.target.value })
                      }
                      className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-[18px] text-slate-700 text-base font-bold outline-none ring-0 focus:ring-0 focus:border-slate-400 transition-all duration-200 placeholder:text-slate-300 placeholder:font-normal text-left [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="group relative">
                  <label className="text-[10px] uppercase font-bold text-slate-500 ml-2 tracking-[0.1em] opacity-90 group-focus-within:text-slate-800 transition-colors">
                    Кол-во (шт/кг)
                  </label>
                  <div className="relative mt-1.5">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-800 pointer-events-none">
                      <span className="text-[14px] font-black tracking-tight">
                        QTY
                      </span>
                    </div>
                    <input
                      type="number"
                      step="any"
                      placeholder="0"
                      value={form.quantity}
                      onChange={(e) =>
                        setForm({ ...form, quantity: e.target.value })
                      }
                      className="w-full pl-14 pr-4 py-3.5 bg-white border border-slate-200 rounded-[18px] text-slate-700 text-base font-bold outline-none ring-0 focus:ring-0 focus:border-slate-400 transition-all duration-200 placeholder:text-slate-300"
                    />
                  </div>
                </div>
                <div className="group space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-500 ml-2 tracking-[0.1em] opacity-90 group-focus-within:text-slate-800 transition-colors">
                    Цена за шт/кг
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-800 pointer-events-none">
                      <span className="text-[14px] font-black tracking-tight">
                        UZS
                      </span>
                    </div>
                    <input
                      type="number"
                      placeholder="0.00"
                      required
                      value={form.lastPrice}
                      onChange={(e) =>
                        setForm({ ...form, lastPrice: e.target.value })
                      }
                      className="w-full pl-14 pr-4 py-3.5 bg-white border border-slate-200 rounded-[18px] text-slate-700 text-base font-bold outline-none ring-0 focus:ring-0 focus:border-slate-400 transition-all duration-200 placeholder:text-slate-300 placeholder:font-normal"
                    />
                  </div>
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
                className="w-full text-white py-4 rounded-2xl font-bold text-lg transition-all shadow-lg mt-4 active:scale-95 hover:opacity-90"
                style={{ backgroundColor: activeCat?.color }}
              >
                {editingId !== null ? "Сохранить изменения" : "Сохранить"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast.show && <ToastComponent toast={toast} />}

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

// ─── Toast alohida komponent ───
function ToastComponent({ toast }) {
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] animate-in fade-in slide-in-from-top-8 duration-500 ease-out">
      <div className="relative group">
        <div
          className={`absolute -inset-1 blur-xl opacity-40 transition duration-500 rounded-[16px] ${
            toast.type === "success"
              ? "bg-[#10B981]"
              : toast.type === "error"
              ? "bg-[#F43F5E]"
              : "bg-[#F59E0B]"
          }`}
        />
        <div className="relative px-6 py-4 rounded-[16px] bg-[#0F172A]/90 backdrop-blur-2xl border border-white/10 shadow-2xl flex items-center gap-4 min-w-[320px]">
          <div
            className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 ${
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
          <div
            className={`absolute bottom-0 left-4 right-4 h-[2px] rounded-full opacity-50 ${
              toast.type === "success"
                ? "bg-[#10B981]"
                : toast.type === "error"
                ? "bg-[#F43F5E]"
                : "bg-[#F59E0B]"
            }`}
          />
        </div>
      </div>
    </div>
  );
}
