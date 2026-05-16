import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Wallet,
  BarChart3,
  Loader2,
  Edit2,
  Trash2,
  X,
  CreditCard,
  Tag,
  Calendar,
  FileText,
  AlertTriangle,
  RefreshCw,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  CalendarDays,
} from "lucide-react";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const BASE_URL = "http://localhost:2000";

// ─── EDIT MODAL COMPONENT (TAHRIRLASH OYNASI) ─────────────────────────────────
const EditModal = ({ transaction, onClose, onSave }) => {
  const [amount, setAmount] = useState(transaction.amount || "");
  const [category, setCategory] = useState(transaction.category || "");
  const [comment, setComment] = useState(transaction.comment || "");

  const getInitialDate = () => {
    if (!transaction.date && !transaction.createdAt) return "";
    const rawDate = transaction.date || transaction.createdAt;
    return rawDate.substring(0, 10);
  };
  const [date, setDate] = useState(getInitialDate());

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isIncome = transaction.type === "income";
  const categories = isIncome
    ? ["Sotuv", "Investitsiya", "Xizmat ko'rsatish", "Kirim"]
    : ["Products", "Прочие", "Arenda", "Zarplata", "Soliq", "Kommunal"];

  const handleUpdate = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError("Iltimos, to'g'ri summa kiriting.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const chosenDate = new Date(date + "T00:00:00");

      const res = await fetch(
        `${BASE_URL}/transaction/${transaction._id || transaction.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: transaction.type,
            amount: Number(amount),
            category,
            comment: comment.trim(),
            date: chosenDate.toISOString(),
          }),
        }
      );

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "O'zgartirishda xatolik yuz berdi");

      onSave();
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0f172a]/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#ffffff] w-full max-w-md rounded-[32px] shadow-2xl border border-[#f1f5f9] p-8 relative animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-[#94a3b8] hover:text-[#475569] p-2 hover:bg-[#f8fafc] rounded-full transition"
        >
          <X size={20} />
        </button>

        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${
            isIncome
              ? "bg-[#ecfdf5] text-[#059669]"
              : "bg-[#fff1f2] text-[#e11d48]"
          }`}
        >
          <Edit2 size={22} />
        </div>

        <h2 className="text-2xl font-black text-[#1e293b] tracking-tight mb-1">
          Amaliyotni tahrirlash
        </h2>
        <p className="text-sm text-[#94a3b8] mb-6">
          Kiritilgan ma'lumotlarni tahrirlang
        </p>

        <div className="space-y-5">
          <div>
            <label className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CreditCard size={14} /> Summa (so'm) *
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-5 py-3.5 rounded-2xl border-2 border-[#f1f5f9] focus:border-[#4f46e5] focus:bg-[#ffffff] bg-[#f8fafc]/50 outline-none text-[#1e293b] font-bold transition"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Tag size={14} /> Kategoriya *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-5 py-3.5 rounded-2xl border-2 border-[#f1f5f9] focus:border-[#4f46e5] bg-[#f8fafc]/50 outline-none text-[#1e293b] font-semibold transition cursor-pointer appearance-none"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Calendar size={14} /> Amaliyot sanasi *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-5 py-3.5 rounded-2xl border-2 border-[#f1f5f9] focus:border-[#4f46e5] outline-none text-[#1e293b] font-semibold transition bg-[#f8fafc]/50"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FileText size={14} /> Qo'shimcha Izoh
            </label>
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Izoh qoldiring..."
              className="w-full px-5 py-3.5 rounded-2xl border-2 border-[#f1f5f9] focus:border-[#4f46e5] outline-none text-[#1e293b] font-medium transition bg-[#f8fafc]/50"
            />
          </div>

          {error && (
            <p className="text-[#e11d48] text-xs font-bold bg-[#fff1f2] border border-[#ffe4e6] px-4 py-3 rounded-xl flex items-center gap-2">
              ⚠ {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="w-1/2 py-3.5 bg-[#f1f5f9] text-[#475569] font-bold rounded-2xl hover:bg-[#e2e8f0] transition"
            >
              Bekor qilish
            </button>
            <button
              onClick={handleUpdate}
              disabled={loading}
              className="w-1/2 py-3.5 bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] hover:from-[#4338ca] hover:to-[#6d28d9] text-[#ffffff] font-black rounded-2xl transition flex items-center justify-center gap-2 shadow-lg shadow-[#4f46e5]/20"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                "Saqlash"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── CHIROYLI CONFIRM MODAL (O'CHIRISHNI TASDIQLASH) ──────────────────────────
const ConfirmDeleteModal = ({ onClose, onConfirm, loading }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0f172a]/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#ffffff] w-full max-w-sm rounded-[32px] shadow-2xl border border-[#f1f5f9] p-7 text-center animate-in zoom-in-95 duration-200">
        <div className="w-14 h-14 bg-[#fff1f2] text-[#f43f5e] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#ffe4e6]/50">
          <AlertTriangle size={26} />
        </div>
        <h3 className="text-xl font-black text-[#1e293b] mb-2 tracking-tight">
          O'chirishni tasdiqlaysizmi?
        </h3>
        <p className="text-xs text-[#94a3b8] leading-relaxed mb-6 px-2">
          Ushbu tranzaksiya butkul o'chiriladi. Amaliyotni ortga qaytarib
          bo'lmaydi.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="w-1/2 py-3 bg-[#f1f5f9] text-[#64748b] font-bold rounded-xl hover:bg-[#e2e8f0] transition"
          >
            Bekor qilish
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="w-1/2 py-3 bg-[#f43f5e] text-[#ffffff] font-black rounded-xl hover:bg-[#e11d48] transition flex items-center justify-center gap-2 shadow-lg shadow-[#f43f5e]/20"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              "O'chirilsin"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── MAIN BUDGET UI COMPONENT ─────────────────────────────────────────────────
const HomeChecks = () => {
  const [activeTab, setActiveTab] = useState("total");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingTx, setEditingTx] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [stats, setStats] = useState({ balance: 0, income: 0, expense: 0 });

  // ─── PAGINATION & LIMIT STATES ───
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(8);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      // 💡 MANA SHU YERGA HEADERS VA TOKEN QO'SHILDI 🚀
      const res = await fetch(`${BASE_URL}/transaction`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) throw new Error("Ma'lumotlarni olib bo'lmadi");
      const data = await res.json();

      const sortedData = data.sort(
        (a, b) =>
          new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)
      );
      setTransactions(sortedData);

      let totalIncome = 0;
      let totalExpense = 0;

      sortedData.forEach((item) => {
        const amt = item.amount || 0;
        if (item.type === "income") totalIncome += amt;
        else if (item.type === "expense") totalExpense += amt;
      });

      setStats({
        income: totalIncome,
        expense: totalExpense,
        balance: totalIncome - totalExpense,
      });
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, limit]);

  const handleDelete = async () => {
    if (!deletingId) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/transaction/${deletingId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("O'chirishda xatolik yuz berdi");

      await fetchTransactions();
      setDeletingId(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleBackToHome = () => {
    window.location.href = "/home";
  };

  const filteredTransactions = transactions.filter((t) => t.type === activeTab);
  const totalItems = filteredTransactions.length;
  const totalPages = Math.ceil(totalItems / limit);

  const indexOfLastItem = currentPage * limit;
  const indexOfFirstItem = indexOfLastItem - limit;
  const currentTransactions = filteredTransactions.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const months = [
    {
      name: "Yan",
      h: "60%",
      color: "bg-gradient-to-t from-[#10b981] to-[#2dd4bf]",
    },
    {
      name: "Fev",
      h: "40%",
      color: "bg-gradient-to-t from-[#f43f5e] to-[#f472b6]",
    },
    {
      name: "Mar",
      h: "85%",
      color: "bg-gradient-to-t from-[#10b981] to-[#2dd4bf]",
    },
    {
      name: "Apr",
      h: "30%",
      color: "bg-gradient-to-t from-[#f43f5e] to-[#f472b6]",
    },
    {
      name: "May",
      h: "70%",
      color: "bg-gradient-to-t from-[#10b981] to-[#2dd4bf]",
    },
    {
      name: "Iyun",
      h: "50%",
      color: "bg-gradient-to-t from-[#f43f5e] to-[#f472b6]",
    },
    {
      name: "Iyul",
      h: "90%",
      color: "bg-gradient-to-t from-[#10b981] to-[#2dd4bf]",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc]/70 p-6 md:p-12 font-sans antialiased text-[#64748b] selection:bg-[#e0e7ff]">
      {/* MODALLAR */}
      {editingTx && (
        <EditModal
          transaction={editingTx}
          onClose={() => setEditingTx(null)}
          onSave={fetchTransactions}
        />
      )}
      {deletingId && (
        <ConfirmDeleteModal
          onClose={() => setDeletingId(null)}
          onConfirm={handleDelete}
          loading={deleteLoading}
        />
      )}

      {/* TOP NAVIGATION HEADER */}
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-10 select-none">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBackToHome}
            className="p-3 bg-[#ffffff] border border-[#e2e8f0] text-[#475569] rounded-[18px] shadow-xs transition-all hover:bg-[#f8fafc] hover:text-[#0f172a] hover:border-[#cbd5e1] active:scale-90 flex items-center justify-center group"
            title="Ortga qaytish"
          >
            <ArrowLeft
              size={18}
              strokeWidth={2.5}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
          </button>
          <div>
            <h1 className="text-3xl font-black text-[#1e293b] tracking-tight">
              Moliya Markazi
            </h1>
            <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest mt-0.5">
              Kassa va Analitika boshqaruvi
            </p>
          </div>
        </div>

        {/* REFRESH BUTTON */}
        <button
          onClick={fetchTransactions}
          disabled={loading}
          className="h-12 px-5 bg-gradient-to-r from-[#1e293b] to-[#020617] text-[#ffffff] rounded-[20px] font-bold shadow-md shadow-[#020617]/10 transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 group hover:brightness-110 disabled:opacity-50"
        >
          <RefreshCw
            size={15}
            strokeWidth={2.5}
            className={`${
              loading
                ? "animate-spin"
                : "group-hover:rotate-180 transition-transform duration-500"
            }`}
          />
          <span className="text-xs font-black tracking-wide uppercase">
            Yangilash
          </span>
        </button>
      </div>

      {/* ─── 3 TA ZAMONAVIY TAB KARTALARI ─── */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 select-none">
        {/* BALANS KARTASI */}
        <div
          onClick={() => setActiveTab("total")}
          className={`p-8 rounded-[36px] cursor-pointer transition-all duration-300 border relative overflow-hidden group ${
            activeTab === "total"
              ? "bg-gradient-to-br from-[#0f172a] via-[#020617] to-[#1e1b4b] text-[#ffffff] border-transparent shadow-xl shadow-[#020617]/20 scale-[1.02]"
              : "bg-[#ffffff] border-[#f1f5f9] hover:border-[#e2e8f0] text-[#94a3b8] shadow-xs hover:shadow-md"
          }`}
        >
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
              activeTab === "total"
                ? "bg-[#ffffff]/10 text-[#818cf8]"
                : "bg-[#f8fafc] text-[#475569]"
            }`}
          >
            <Wallet size={20} strokeWidth={2.5} />
          </div>
          <p className="text-[10px] font-black uppercase mt-6 tracking-widest opacity-70">
            Umumiy Balans
          </p>
          <h2
            className={`text-2xl font-black mt-1 tracking-tight ${
              activeTab === "total" ? "text-[#ffffff]" : "text-[#1e293b]"
            }`}
          >
            {loading ? "..." : `${stats.balance.toLocaleString()} so'm`}
          </h2>
        </div>

        {/* KIRIM KARTASI */}
        <div
          onClick={() => setActiveTab("income")}
          className={`p-8 rounded-[36px] cursor-pointer transition-all duration-300 border relative overflow-hidden ${
            activeTab === "income"
              ? "bg-gradient-to-br from-[#10b981] to-[#0d9488] text-[#ffffff] border-transparent shadow-xl shadow-[#0d9488]/20 scale-[1.02]"
              : "bg-[#ffffff] border-[#f1f5f9] hover:border-[#a7f3d0] text-[#94a3b8] shadow-xs hover:shadow-md"
          }`}
        >
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
              activeTab === "income"
                ? "bg-[#ffffff]/20 text-[#ffffff]"
                : "bg-[#ecfdf5] text-[#10b981]"
            }`}
          >
            <TrendingUp size={20} strokeWidth={2.5} />
          </div>
          <p className="text-[10px] font-black uppercase mt-6 tracking-widest opacity-80">
            Jami Kirimlar
          </p>
          <h2
            className={`text-2xl font-black mt-1 tracking-tight ${
              activeTab === "income" ? "text-[#ffffff]" : "text-[#1e293b]"
            }`}
          >
            {loading ? "..." : `+${stats.income.toLocaleString()} so'm`}
          </h2>
        </div>

        {/* CHIQIM KARTASI */}
        <div
          onClick={() => setActiveTab("expense")}
          className={`p-8 rounded-[36px] cursor-pointer transition-all duration-300 border relative overflow-hidden ${
            activeTab === "expense"
              ? "bg-gradient-to-br from-[#f43f5e] to-[#db2777] text-[#ffffff] border-transparent shadow-xl shadow-[#db2777]/20 scale-[1.02]"
              : "bg-[#ffffff] border-[#f1f5f9] hover:border-[#fecdd3] text-[#94a3b8] shadow-xs hover:shadow-md"
          }`}
        >
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
              activeTab === "expense"
                ? "bg-[#ffffff]/20 text-[#ffffff]"
                : "bg-[#fff1f2] text-[#f43f5e]"
            }`}
          >
            <TrendingDown size={20} strokeWidth={2.5} />
          </div>
          <p className="text-[10px] font-black uppercase mt-6 tracking-widest opacity-80">
            Jami Chiqimlar
          </p>
          <h2
            className={`text-2xl font-black mt-1 tracking-tight ${
              activeTab === "expense" ? "text-[#ffffff]" : "text-[#1e293b]"
            }`}
          >
            {loading ? "..." : `-${stats.expense.toLocaleString()} so'm`}
          </h2>
        </div>
      </div>

      {/* ─── PASTI: CONTEXT BOX (GRAFIK YOKI CHEKLAR) ─── */}
      <div className="max-w-6xl mx-auto bg-[#ffffff] rounded-[40px] p-6 md:p-10 shadow-xs border border-[#f1f5f9]">
        {activeTab === "total" ? (
          /* GRAFIK QISMI */
          <div className="animate-in fade-in duration-300">
            <div className="flex items-center gap-3 mb-10 select-none">
              <div className="p-2.5 bg-[#e0e7ff] text-[#4f46e5] rounded-xl">
                <BarChart3 size={18} />
              </div>
              <div>
                <h3 className="font-black text-lg text-[#1e293b] tracking-tight">
                  Oylik Pul Oqimi Analitikasi
                </h3>
                <p className="text-xs text-[#94a3b8]">
                  Kirim va chiqimlarning oylik balansi
                </p>
              </div>
            </div>

            <div className="flex items-end justify-between h-[260px] gap-3 px-2 md:px-6 border-b border-[#f1f5f9] pb-3 select-none">
              {months.map((m, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center flex-1 group"
                >
                  <div className="w-full bg-[#f8fafc]/50 rounded-t-2xl h-full flex items-end justify-center px-1">
                    <div
                      className={`${m.color} w-full max-w-[24px] rounded-t-lg transition-all duration-500 group-hover:scale-y-105 shadow-xs`}
                      style={{ height: m.h }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-[#94a3b8] mt-4 uppercase tracking-wider">
                    {m.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* REAL CHEKLAR RO'YXATI */
          <div className="animate-in slide-in-from-bottom-3 duration-300">
            <div className="flex justify-between items-center mb-8 border-b border-[#f8fafc] pb-4 select-none">
              <div>
                <h3 className="font-black text-lg text-[#1e293b] tracking-tight">
                  {activeTab === "income"
                    ? "Kirim Amaliyotlari"
                    : "Chiqim Amaliyotlari"}
                </h3>
                <p className="text-xs text-[#94a3b8]">
                  Tizimdagi filtrlangan cheklar
                </p>
              </div>
              <span className="text-xs font-black px-3 py-1.5 bg-[#f8fafc] rounded-xl text-[#64748b] border border-[#f1f5f9]">
                {totalItems} ta chek
              </span>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 text-[#94a3b8] gap-3 select-none">
                <Loader2 className="animate-spin text-[#4f46e5]" size={24} />
                <span className="text-xs font-bold uppercase tracking-widest text-[#94a3b8]">
                  Yuklanmoqda...
                </span>
              </div>
            ) : totalItems === 0 ? (
              <div className="text-center py-16 bg-[#f8fafc]/30 rounded-2xl border-2 border-dashed border-[#e2e8f0] select-none">
                <div className="text-[#94a3b8] font-black text-xs uppercase tracking-widest">
                  Hali cheklar mavjud emas
                </div>
              </div>
            ) : (
              <>
                {/* TRANSACTIONS CONTAINER */}
                <div className="space-y-3.5 min-h-[460px]">
                  {currentTransactions.map((item) => {
                    const isIncomeType = item.type === "income";
                    const txDate = item.date || item.createdAt;

                    const formattedDate = (() => {
                      if (!txDate) return "Sana kiritilmagan";

                      const d = new Date(txDate);
                      // Agar sana noto'g'ri bo'lsa (Invalid Date)
                      if (isNaN(d.getTime())) return "Sana kiritilmagan";

                      const year = d.getFullYear();
                      // Oyni har doim 2 xonali qilish (masalan: 5-oyni -> 05 qilish)
                      const month = String(d.getMonth() + 1).padStart(2, "0");
                      // Kunni har doim 2 xonali qilish (masalan: 9-kunni -> 09 qilish)
                      const day = String(d.getDate()).padStart(2, "0");

                      return `${year}-${month}-${day}`;
                    })();

                    return (
                      <div
                        key={item._id || item.id}
                        className="flex flex-col sm:flex-row justify-between sm:items-center p-5 bg-[#f8fafc]/60 hover:bg-[#ffffff] rounded-[24px] border border-transparent hover:border-[#e2e8f0]/80 hover:-translate-y-0.5 transition-all duration-300 shadow-2xs hover:shadow-md group gap-4"
                      >
                        {/* CATEGORY & INFO */}
                        <div className="flex items-center gap-4">
                          <div
                            className={`p-3.5 rounded-2xl shrink-0 shadow-2xs ${
                              isIncomeType
                                ? "bg-[#ecfdf5] text-[#10b981]"
                                : "bg-[#fff1f2] text-[#f43f5e]"
                            }`}
                          >
                            {isIncomeType ? (
                              <TrendingUp size={18} strokeWidth={2.5} />
                            ) : (
                              <TrendingDown size={18} strokeWidth={2.5} />
                            )}
                          </div>
                          <div className="space-y-0.5">
                            <p className="font-black text-[#1e293b] tracking-tight text-base">
                              {item.category}
                            </p>
                            {item.comment && (
                              <p className="text-xs font-semibold text-[#94a3b8] line-clamp-1">
                                {item.comment}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* DATE, VALUE & ACTIONS */}
                        <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
                          <div className="flex items-center gap-1.5 text-[#94a3b8] sm:mr-4 select-none">
                            <CalendarDays
                              size={13}
                              className="text-[#cbd5e1]"
                            />
                            <span className="text-[11px] font-bold tracking-tight">
                              {formattedDate}
                            </span>
                          </div>

                          <div className="flex items-center gap-4">
                            <span
                              className={`text-lg font-black tracking-tight ${
                                isIncomeType
                                  ? "text-[#10b981]"
                                  : "text-[#0f172a]"
                              }`}
                            >
                              {isIncomeType ? "+" : "-"}
                              {item.amount?.toLocaleString()}{" "}
                              <span className="text-xs font-bold opacity-50">
                                so'm
                              </span>
                            </span>

                            {/* MINI EDIT & DELETE PANEL */}
                            <div className="flex items-center gap-1 bg-[#ffffff]/80 p-1 rounded-xl opacity-40 group-hover:opacity-100 transition-opacity border border-[#e2e8f0]/40 shadow-2xs">
                              <button
                                onClick={() => setEditingTx(item)}
                                className="p-2 text-[#94a3b8] hover:text-[#4f46e5] hover:bg-[#f8fafc] rounded-lg transition"
                                title="Tahrirlash"
                              >
                                <Edit2 size={13} strokeWidth={2.5} />
                              </button>
                              <button
                                onClick={() =>
                                  setDeletingId(item._id || item.id)
                                }
                                className="p-2 text-[#94a3b8] hover:text-[#e11d48] hover:bg-[#f8fafc] rounded-lg transition"
                                title="O'chirish"
                              >
                                <Trash2 size={13} strokeWidth={2.5} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* ─── 🛠 FOOTER-BASED PAGINATION & LIMIT PANEL (NOT STICKY) ─── */}
                {totalPages > 1 || totalItems > 8 ? (
                  <div className="w-full bg-[#ffffff] pt-8 mt-6 border-t border-[#f1f5f9] flex flex-col sm:flex-row items-center justify-between gap-4 select-none animate-in fade-in duration-300">
                    {/* CHAP TOMONDA: MODERN LIMIT SELECT */}
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-[#64748b]">
                        <SlidersHorizontal size={13} strokeWidth={2.5} />
                      </div>
                      <span className="text-[11px] font-black uppercase text-[#94a3b8] tracking-wider hidden sm:inline">
                        Ko'rsatish:
                      </span>
                      <div className="relative">
                        <select
                          value={limit}
                          onChange={(e) => setLimit(Number(e.target.value))}
                          className="pl-3 pr-8 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] text-[#1e293b] text-xs font-black rounded-xl outline-none appearance-none cursor-pointer hover:border-[#cbd5e1] transition"
                        >
                          {[8, 16, 48, 96].map((l) => (
                            <option key={l} value={l}>
                              {l} tadan
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none text-[#94a3b8]">
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="3"
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* O'NG TOMONDA: PREMIUM GRADIENT PAGINATION */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.max(p - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className="p-2 rounded-xl border border-[#e2e8f0] bg-[#ffffff] text-[#475569] hover:bg-[#f8fafc] hover:text-[#0f172a] transition disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        <ChevronLeft size={15} strokeWidth={2.5} />
                      </button>

                      {/* Sahifa raqamlari */}
                      {Array.from({ length: totalPages }, (_, index) => {
                        const pageNum = index + 1;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-8 h-8 rounded-xl text-xs font-black tracking-tight transition-all duration-200 ${
                              currentPage === pageNum
                                ? "bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] text-[#ffffff] shadow-md shadow-[#4f46e5]/20 scale-105"
                                : "bg-[#ffffff] border border-[#e2e8f0] text-[#475569] hover:bg-[#f8fafc]"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.min(p + 1, totalPages))
                        }
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-xl border border-[#e2e8f0] bg-[#ffffff] text-[#475569] hover:bg-[#f8fafc] hover:text-[#0f172a] transition disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        <ChevronRight size={15} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeChecks;
