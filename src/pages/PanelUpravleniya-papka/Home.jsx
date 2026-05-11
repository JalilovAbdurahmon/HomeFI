import React, { useState, useEffect, useCallback } from "react";
import {
  TrendingUp,
  TrendingDown,
  PieChart,
  Wallet,
  Plus,
  CreditCard,
  BarChart3,
  X,
  Loader2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const BASE_URL = "http://localhost:2000"; // Backend URL

// ─── MODAL COMPONENT ──────────────────────────────────────────────────────────
const TransactionModal = ({ type, onClose, onSave }) => {
  const [text, setText] = useState("");
  const [amount, setAmount] = useState("");
  const [dateOfPayment, setDateOfPayment] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isIncome = type === "income";
  const accent = isIncome ? "indigo" : "rose";

  const handleSubmit = async () => {
    if (
      !text.trim() ||
      !amount ||
      isNaN(Number(amount)) ||
      Number(amount) <= 0
    ) {
      setError("Iltimos, to'g'ri ma'lumot kiriting.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${BASE_URL}/transaction/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          amount: Number(amount),
          type,
          dateOfPayment,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Xatolik");
      onSave();
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 transition"
        >
          <X size={22} />
        </button>

        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${
            isIncome ? "bg-indigo-100" : "bg-rose-100"
          }`}
        >
          {isIncome ? (
            <TrendingUp className="text-indigo-600" size={28} />
          ) : (
            <TrendingDown className="text-rose-500" size={28} />
          )}
        </div>

        <h2 className="text-2xl font-black text-gray-900 mb-1">
          {isIncome ? "Kirim qo'shish" : "Chiqim qo'shish"}
        </h2>
        <p className="text-sm text-gray-400 mb-7">
          {isIncome ? "Yangi daromad manbasi" : "Yangi xarajat"}
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">
              Nomi / Tavsifi
            </label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={
                isIncome ? "Masalan: Oylik maosh" : "Masalan: Supermarket"
              }
              className="w-full px-5 py-3.5 rounded-2xl border-2 border-gray-100 focus:border-indigo-400 outline-none text-gray-800 font-medium transition"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">
              Miqdor (so'm)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              min="1"
              className="w-full px-5 py-3.5 rounded-2xl border-2 border-gray-100 focus:border-indigo-400 outline-none text-gray-800 font-medium transition"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">
              Sana
            </label>
            <input
              type="date"
              value={dateOfPayment}
              onChange={(e) => setDateOfPayment(e.target.value)}
              className="w-full px-5 py-3.5 rounded-2xl border-2 border-gray-100 focus:border-indigo-400 outline-none text-gray-800 font-medium transition"
            />
          </div>

          {error && (
            <p className="text-rose-500 text-sm font-semibold bg-rose-50 px-4 py-2 rounded-xl">
              ⚠ {error}
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full py-4 rounded-2xl font-black text-white transition-all flex items-center justify-center gap-2 ${
              isIncome
                ? "bg-indigo-600 hover:bg-indigo-700 active:scale-95"
                : "bg-rose-500 hover:bg-rose-600 active:scale-95"
            } disabled:opacity-60`}
          >
            {loading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Plus size={20} />
            )}
            {loading ? "Saqlanmoqda..." : "Saqlash"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── CUSTOM TOOLTIP ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl shadow-xl p-4 text-sm min-w-[160px]">
        <p className="font-bold text-gray-500 mb-2 text-xs uppercase tracking-wider">
          {label}
        </p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.color }} className="font-bold">
            {p.name === "income" ? "Kirim" : "Chiqim"}:{" "}
            {p.value.toLocaleString()} so'm
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const MAIN_FILTERS = [
  { label: "1 oy", value: "1m" },
  { label: "3 oy", value: "3m" },
  { label: "6 oy", value: "6m" },
  { label: "1 yil", value: "1y" },
];

const CHART_FILTERS = [
  { label: "15 kun", value: "15d" },
  { label: "1 oy", value: "1m" },
  { label: "3 oy", value: "3m" },
  { label: "6 oy", value: "6m" },
  { label: "1 yil", value: "1y" },
];

const Home = () => {
  const [mainFilter, setMainFilter] = useState("1m");
  const [chartFilter, setChartFilter] = useState("1m");
  const [stats, setStats] = useState({ income: 0, expense: 0, balance: 0 });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [modal, setModal] = useState(null); // 'income' | 'expense' | null

  // ── Fetch stats (cards) ─────────────────────────────────────────────────────
  const fetchStats = useCallback(async (period) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${BASE_URL}/transaction/panelStats?period=${period}`
      );
      const data = await res.json();
      setStats(data.stats || { income: 0, expense: 0, balance: 0 });
    } catch (e) {
      console.error("Stats xatosi:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Fetch chart data ────────────────────────────────────────────────────────
  const fetchChart = useCallback(async (period) => {
    setChartLoading(true);
    try {
      const res = await fetch(
        `${BASE_URL}/transaction/panelStats?period=${period}`
      );
      const data = await res.json();
      const formatted = (data.chartData || []).map((d) => ({
        date: d._id,
        income: d.income,
        expense: d.expense,
      }));
      setChartData(formatted);
    } catch (e) {
      console.error("Chart xatosi:", e);
    } finally {
      setChartLoading(false);
    }
  }, []);

  // ── On mount & filter change ────────────────────────────────────────────────
  useEffect(() => {
    fetchStats(mainFilter);
  }, [mainFilter, fetchStats]);
  useEffect(() => {
    fetchChart(chartFilter);
  }, [chartFilter, fetchChart]);

  const savings = Math.max(0, stats.income - stats.expense);

  const statCards = [
    {
      title: "Kirim",
      amount: `+${stats.income.toLocaleString()}`,
      color: "text-emerald-600",
      icon: <TrendingUp />,
      bg: "bg-emerald-50",
    },
    {
      title: "Chiqim",
      amount: `-${stats.expense.toLocaleString()}`,
      color: "text-rose-500",
      icon: <TrendingDown />,
      bg: "bg-rose-50",
    },
    {
      title: "Investitsiya",
      amount: "0",
      color: "text-blue-600",
      icon: <PieChart />,
      bg: "bg-blue-50",
    },
    {
      title: "Jamg'arma",
      amount: savings.toLocaleString(),
      color: "text-amber-500",
      icon: <Wallet />,
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      {/* Modal */}
      {modal && (
        <TransactionModal
          type={modal}
          onClose={() => setModal(null)}
          onSave={() => {
            fetchStats(mainFilter);
            fetchChart(chartFilter);
          }}
        />
      )}

      {/* GREETING & MAIN FILTERS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Hello, Jalilov 👋
          </h1>
          <p className="text-gray-500 font-medium">
            Mana sizning moliyaviy hisobotingiz
          </p>
        </div>

        <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 w-fit">
          {MAIN_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setMainFilter(f.value)}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
                mainFilter === f.value
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* BALANCE CARD */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white p-8 rounded-[35px] shadow-2xl mb-10 group">
        <div className="relative z-10">
          <p className="text-sm font-medium opacity-80 uppercase tracking-widest text-white/90">
            Umumiy Balans
          </p>
          {loading ? (
            <div className="flex items-center gap-3 mt-3">
              <Loader2 size={28} className="animate-spin opacity-80" />
              <span className="text-2xl opacity-70">Yuklanmoqda...</span>
            </div>
          ) : (
            <h2 className="text-5xl font-black mt-3 leading-none">
              {stats.balance.toLocaleString()}{" "}
              <span className="text-2xl opacity-70">so'm</span>
            </h2>
          )}

          <div className="flex gap-4 mt-8">
            <button
              onClick={() => setModal("income")}
              className="flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-2xl font-bold shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              <Plus size={20} strokeWidth={3} /> Kirim qo'sh
            </button>
            <button
              onClick={() => setModal("expense")}
              className="flex items-center gap-2 bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-2xl font-bold border border-white/30 hover:bg-white/30 transition-all"
            >
              <Plus size={20} strokeWidth={3} /> Chiqim qo'sh
            </button>
          </div>
        </div>
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        {statCards.map((item, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-[28px] shadow-sm border border-gray-100 hover:shadow-xl transition-all group"
          >
            <div
              className={`${item.bg} ${item.color} w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
            >
              {item.icon}
            </div>
            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">
              {item.title}
            </p>
            {loading ? (
              <div className="h-7 w-24 bg-gray-100 rounded-lg mt-2 animate-pulse" />
            ) : (
              <h3 className={`text-2xl font-black mt-1 ${item.color}`}>
                {item.amount} so'm
              </h3>
            )}
          </div>
        ))}
      </div>

      {/* CHART SECTION */}
      {/* <div className="bg-white p-8 rounded-[35px] shadow-sm border border-gray-50 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <BarChart3 className="text-indigo-500" size={22} />
            <h2 className="text-xl font-black text-gray-900">
              Xarajatlar Statistikasi
            </h2>
          </div>

          Chart filters
          <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100 w-fit">
            {CHART_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setChartFilter(f.value)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  chartFilter === f.value
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {chartLoading ? (
          <div className="h-72 flex flex-col items-center justify-center text-gray-300 border-2 border-dashed border-gray-100 rounded-[28px] bg-gray-50/50">
            <Loader2 size={36} className="animate-spin mb-2 text-indigo-300" />
            <p className="font-bold text-sm uppercase tracking-wider">
              Yuklanmoqda...
            </p>
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-72 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 rounded-[28px] bg-gray-50/50">
            <div className="p-4 bg-white rounded-full shadow-sm mb-2">📊</div>
            <p className="font-bold text-sm uppercase tracking-wider">
              Ma'lumot yo'q
            </p>
          </div>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={(value) =>
                    value === "income" ? "Kirim" : "Chiqim"
                  }
                  wrapperStyle={{ fontSize: "12px", fontWeight: "700" }}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fill="url(#colorIncome)"
                  dot={false}
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  stroke="#f43f5e"
                  strokeWidth={2.5}
                  fill="url(#colorExpense)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div> */}

      {/* QUICK ACTIONS */}
      {/* <div className="bg-white p-8 rounded-[35px] shadow-sm border border-gray-50">
        <h2 className="text-xl font-black text-gray-900 mb-6">
          Tezkor Amallar
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => setModal("income")}
            className="flex items-center justify-between p-4 bg-indigo-50 text-indigo-700 rounded-[22px] font-bold hover:bg-indigo-100 transition-all group"
          >
            <span className="flex items-center gap-3">
              <Plus size={18} /> Kirim qo'sh
            </span>
            <span className="bg-indigo-200 p-1 rounded-lg group-hover:translate-x-1 transition-transform">
              →
            </span>
          </button>
          <button
            onClick={() => setModal("expense")}
            className="flex items-center justify-between p-4 bg-rose-50 text-rose-600 rounded-[22px] font-bold hover:bg-rose-100 transition-all group"
          >
            <span className="flex items-center gap-3">
              <TrendingDown size={18} /> Chiqim qo'sh
            </span>
            <span className="bg-rose-200 p-1 rounded-lg group-hover:translate-x-1 transition-transform">
              →
            </span>
          </button>
          <button className="flex items-center justify-between p-4 bg-amber-50 text-amber-700 rounded-[22px] font-bold hover:bg-amber-100 transition-all group">
            <span className="flex items-center gap-3">
              <CreditCard size={18} /> Kartalar
            </span>
            <span className="bg-amber-200 p-1 rounded-lg group-hover:translate-x-1 transition-transform">
              →
            </span>
          </button>
        </div>
      </div> */}
    </div>
  );
};

export default Home;
