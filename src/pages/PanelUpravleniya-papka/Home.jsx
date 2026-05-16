import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  PieChart,
  Wallet,
  Plus,
  X,
  Loader2,
  Calendar,
  Tag,
  FileText,
  ArrowRight,
  BarChart3,
  Eye,
  EyeOff,
  Minus,
} from "lucide-react";

const BASE_URL = "http://localhost:2000";

// ─── TRANSACTION MODAL ─────────────────────────────────────────────────────────
const TransactionModal = ({ type, onClose, onSave }) => {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getLocalDateString = () => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localToday = new Date(today.getTime() - offset * 60 * 1000);
    return localToday.toISOString().split("T")[0];
  };

  const [date, setDate] = useState(getLocalDateString());
  const isIncome = type === "income";

  const categories = isIncome
    ? ["Продукты", "Прочие", "Коммунальные услуги", "Зарплата", "Премия"]
    : ["Распродажа", "Инвестиции", "Услуга"];

  useEffect(() => {
    setCategory(categories[0]);
  }, [type]);

  const handleSubmit = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError("Iltimos, to'g'ri summa kiriting.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 💡 Agar sana tanlanmagan bo'lsa, xatolik bermasligi uchun bugungi sanani olamiz
      const safeDate = date ? date : new Date().toISOString().split("T")[0];
      const chosenDate = new Date(safeDate + "T00:00:00");

      const res = await fetch(`${BASE_URL}/transaction`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // 💡 MANA BU YERGA TOKEN QO'SHILDI! Backend endi kimligingizni biladi 🚀
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          type,
          amount: Number(amount),
          category,
          comment: comment.trim() || `${category} amali`,
          date: chosenDate.toISOString(),
        }),
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Serverdan kutilmagan xatolik qaytdi (Not JSON)");
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Xatolik yuz berdi");

      onSave();
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-all duration-300">
      {/* Atrofga rangli nur taratish uchun fon bloki */}
      <div
        className="absolute w-[300px] h-[300px] rounded-full blur-[120px] opacity-20 transition-all duration-500 top-10 left-10"
        style={{ backgroundColor: isIncome ? "#10b981" : "#f43f5e" }}
      />

      <div className="bg-white/95 w-full max-w-md rounded-[40px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] p-8 relative border border-white/60 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
        {/* Yopish tugmasi */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full transition-all duration-200 active:scale-90"
          style={{
            color: "#94a3b8",
            backgroundColor: "transparent",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#f1f5f9";
            e.currentTarget.style.color = "#1e293b";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "#94a3b8";
          }}
        >
          <X size={20} strokeWidth={2.5} />
        </button>

        {/* Tepasi: Status va Sarlavha */}
        <div className="flex items-center gap-4 mb-8 select-none">
          <div
            className="w-12 h-12 rounded-[20px] flex items-center justify-center shadow-inner transition-transform duration-300 hover:rotate-6"
            style={{
              backgroundColor: isIncome ? "#e6f4ea" : "#fce8e6",
              color: isIncome ? "#10b981" : "#f43f5e",
            }}
          >
            {isIncome ? (
              <TrendingUp size={24} strokeWidth={2.5} />
            ) : (
              <TrendingDown size={24} strokeWidth={2.5} />
            )}
          </div>
          <div>
            <h2
              className="text-xl font-black tracking-tight"
              style={{ color: "#1e293b" }}
            >
              {isIncome ? "Kirim Amaliyoti" : "Chiqim Amaliyoti"}
            </h2>
            <p
              className="text-xs font-semibold mt-0.5"
              style={{ color: "#94a3b8" }}
            >
              Kassa oqimini tizimga qayd etish
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {/* BIG AMOUNT INPUT (Premium Hero Section) */}
          <div
            className="relative rounded-[24px] p-5 border transition-all duration-200"
            style={{
              backgroundColor: "#f8fafc",
              borderColor: "#f1f5f9",
            }}
            onFocusIn={(e) => {
              e.currentTarget.style.borderColor = "#4f46e5";
              e.currentTarget.style.backgroundColor = "#ffffff";
              e.currentTarget.style.boxShadow =
                "0 12px 24px -8px rgba(79, 70, 229, 0.12)";
            }}
            onFocusOut={(e) => {
              e.currentTarget.style.borderColor = "#f1f5f9";
              e.currentTarget.style.backgroundColor = "#f8fafc";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <label
              className="text-[10px] font-black uppercase tracking-widest block text-center mb-1 select-none"
              style={{ color: "#94a3b8" }}
            >
              Tranzaksiya Summasi
            </label>
            <div className="flex items-center justify-center gap-2">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full bg-transparent text-center text-4xl font-black outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                style={{ color: "#1e293b" }}
                autoFocus
              />
              <span
                className="text-lg font-extrabold border-l pl-2 select-none"
                style={{ color: "#94a3b8", borderColor: "#cbd5e1" }}
              >
                SO'M
              </span>
            </div>
          </div>

          {/* KATEGORIYA TANLASH */}
          <div className="space-y-2">
            <label
              className="text-[11px] font-bold uppercase tracking-wider ml-1 flex items-center gap-1.5 select-none"
              style={{ color: "#94a3b8" }}
            >
              <Tag size={13} style={{ color: "#94a3b8" }} /> Kategoriya *
            </label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-5 py-3.5 rounded-[18px] border bg-white outline-none text-sm font-bold transition-all duration-200 appearance-none cursor-pointer"
                style={{ color: "#334155", borderColor: "#e2e8f0" }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#4f46e5";
                  e.target.style.boxShadow =
                    "0 0 0 4px rgba(79, 70, 229, 0.08)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e2e8f0";
                  e.target.style.boxShadow = "none";
                }}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <div
                className="absolute inset-y-0 right-5 flex items-center pointer-events-none"
                style={{ color: "#94a3b8" }}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* OPERATSIYA SANASI */}
          <div className="space-y-2">
            <label
              className="text-[11px] font-bold uppercase tracking-wider ml-1 flex items-center gap-1.5 select-none"
              style={{ color: "#94a3b8" }}
            >
              <Calendar size={13} style={{ color: "#94a3b8" }} /> Sanani
              Belgilash *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-5 py-3.5 rounded-[18px] border bg-white outline-none text-sm font-bold transition-all duration-200"
              style={{ color: "#334155", borderColor: "#e2e8f0" }}
              onFocus={(e) => {
                e.target.style.borderColor = "#4f46e5";
                e.target.style.boxShadow = "0 0 0 4px rgba(79, 70, 229, 0.08)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e2e8f0";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          {/* IZOH QOLDIRISH */}
          <div className="space-y-2">
            <label
              className="text-[11px] font-bold uppercase tracking-wider ml-1 flex items-center gap-1.5 select-none"
              style={{ color: "#94a3b8" }}
            >
              <FileText size={13} style={{ color: "#94a3b8" }} /> Qo'shimcha
              Izoh
            </label>
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Shartnoma raqami yoki eslatma..."
              className="w-full px-5 py-3.5 rounded-[18px] border bg-white outline-none text-sm font-medium transition-all duration-200"
              style={{ color: "#334155", borderColor: "#e2e8f0" }}
              onFocus={(e) => {
                e.target.style.borderColor = "#4f46e5";
                e.target.style.boxShadow = "0 0 0 4px rgba(79, 70, 229, 0.08)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e2e8f0";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          {/* XATOLIK CHIQSA */}
          {error && (
            <div
              className="flex items-center gap-2 text-xs font-bold bg-[#fff1f2] px-4 py-3 rounded-[16px] border border-[#ffe4e6] animate-shake"
              style={{ color: "#e11d48" }}
            >
              <span>⚠</span>
              <span>{error}</span>
            </div>
          )}

          {/* TASDIQLASH TUGMASI (Dinamik toza inline-style hover motori bilan) */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-4 mt-2 rounded-[22px] font-black text-white text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden active:scale-[0.97] disabled:opacity-50"
            style={{
              background: isIncome
                ? "linear-gradient(to right, #10b981, #06b6d4)"
                : "linear-gradient(to right, #f43f5e, #ec4899)",
              boxShadow: isIncome
                ? "0 10px 20px -5px #10b98133"
                : "0 10px 20px -5px #f43f5e33",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isIncome
                ? "linear-gradient(to right, #059669, #0891b2)"
                : "linear-gradient(to right, #e11d48, #db2777)";
              e.currentTarget.style.boxShadow = isIncome
                ? "0 12px 24px -3px #10b9814D"
                : "0 12px 24px -3px #f43f5e4D";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isIncome
                ? "linear-gradient(to right, #10b981, #06b6d4)"
                : "linear-gradient(to right, #f43f5e, #ec4899)";
              e.currentTarget.style.boxShadow = isIncome
                ? "0 10px 20px -5px #10b98133"
                : "0 10px 20px -5px #f43f5e33";
            }}
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" strokeWidth={3} />
            ) : (
              <Plus size={18} strokeWidth={3} />
            )}
            <span>
              {loading ? "Tizimga yozilmoqda..." : "Tranzaksiyani Yakunlash"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── CANDLESTICK TOOLTIP ───────────────────────────────────────────────────────
const CandleTooltip = ({ candle, x, y, wrapperWidth }) => {
  if (!candle) return null;
  const isInc = candle.type === "income";
  const sign = isInc ? "+" : "-";
  const color = isInc ? "#10b981" : "#f43f5e";
  const tipW = 230;
  let left = x + 14;
  if (left + tipW > wrapperWidth) left = x - tipW - 14;

  return (
    <div
      style={{
        position: "absolute",
        left: Math.max(0, left),
        top: Math.max(0, y - 80),
        width: tipW,
        background: "rgba(15,23,42,0.97)",
        border: "1px solid rgba(99,102,241,0.3)",
        borderRadius: 14,
        padding: "12px 14px",
        fontSize: 12,
        color: "#e2e8f0",
        pointerEvents: "none",
        zIndex: 20,
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      }}
    >
      <p
        style={{
          fontWeight: 700,
          color: "#94a3b8",
          marginBottom: 8,
          paddingBottom: 6,
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          margin: "0 0 8px 0",
        }}
      >
        📅 {candle.fullLabel}
      </p>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 4,
        }}
      >
        <span style={{ color: "#94a3b8" }}>Kategoriya:</span>
        <span style={{ fontWeight: 600, color: "#fff" }}>
          {candle.category}
        </span>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <span style={{ color: "#94a3b8" }}>Izoh:</span>
        <span
          style={{
            color: "#cbd5e1",
            fontStyle: "italic",
            maxWidth: 130,
            textAlign: "right",
          }}
        >
          {candle.comment}
        </span>
      </div>
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.08)",
          paddingTop: 8,
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#94a3b8" }}>Boshlang'ich:</span>
          <span style={{ color: "#cbd5e1" }}>
            {candle.open.toLocaleString()} so'm
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#94a3b8" }}>Tranzaksiya:</span>
          <span style={{ color, fontWeight: 700 }}>
            {sign}
            {candle.txAmount.toLocaleString()} so'm
          </span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            borderTop: "1px dashed rgba(255,255,255,0.08)",
            paddingTop: 4,
          }}
        >
          <span style={{ fontWeight: 600, color: "#fff" }}>Yopilish:</span>
          <span style={{ color, fontWeight: 700 }}>
            {candle.close.toLocaleString()} so'm
          </span>
        </div>
      </div>
    </div>
  );
};

// ─── CANVAS CANDLESTICK CHART ──────────────────────────────────────────────────
const CandlestickChart = ({ data, loading }) => {
  const scrollRef = useRef(null);
  const canvasRef = useRef(null);
  const [tooltip, setTooltip] = useState({ candle: null, x: 0, y: 0 });
  const [wrapperWidth, setWrapperWidth] = useState(600);

  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragScrollLeft = useRef(0);

  // Chart layout constants
  const CANDLE_W = 14;
  const CANDLE_GAP = 28;
  const PADDING_LEFT = 72;
  const PADDING_RIGHT = 20;
  const PADDING_TOP = 16;
  const PADDING_BOTTOM = 48;
  const CHART_H = 280;

  // Build candles from raw transaction data
  const candles = React.useMemo(() => {
    if (!data || data.length === 0) return [];
    let balance = 0;
    return data.map((t) => {
      const amt = t.amount || 0;
      const open = balance;
      const close = t.type === "income" ? open + amt : open - amt;
      balance = close;
      const d = new Date(t.date || t.createdAt);
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yyyy = d.getFullYear();
      return {
        ...t,
        txAmount: amt,
        open,
        close,
        shortLabel: `${dd}.${mm}`,
        fullLabel: `${dd}.${mm}.${yyyy}`,
        _dateObj: d,
      };
    });
  }, [data]);

  const totalW = Math.max(
    PADDING_LEFT + candles.length * CANDLE_GAP + PADDING_RIGHT,
    600
  );

  const allVals = candles.flatMap((c) => [c.open, c.close]);
  const dataMin = allVals.length ? Math.min(...allVals) : 0;
  const dataMax = allVals.length ? Math.max(...allVals) : 1;
  const range = dataMax - dataMin || 1;
  const ranPad = range * 0.15;
  const yMin = dataMin - ranPad;
  const yMax = dataMax + ranPad;

  const toY = useCallback(
    (val) =>
      PADDING_TOP +
      (1 - (val - yMin) / (yMax - yMin)) *
        (CHART_H - PADDING_TOP - PADDING_BOTTOM),
    [yMin, yMax]
  );

  const formatM = (v) => {
    const abs = Math.abs(v);
    if (abs >= 1000000) return (v / 1000000).toFixed(1) + "M";
    if (abs >= 1000) return (v / 1000).toFixed(0) + "K";
    return Math.round(v).toString();
  };

  // Draw the chart on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || candles.length === 0) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = totalW * dpr;
    canvas.height = CHART_H * dpr;
    canvas.style.width = totalW + "px";
    canvas.style.height = CHART_H + "px";

    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, totalW, CHART_H);

    const gridColor = "rgba(0,0,0,0.05)";
    const textColor = "#94a3b8";

    // Y-axis grid lines + labels
    const yTicks = 5;
    ctx.font = "500 10px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "right";
    for (let i = 0; i <= yTicks; i++) {
      const val = yMin + (yMax - yMin) * (i / yTicks);
      const y = toY(val);
      ctx.beginPath();
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      ctx.moveTo(PADDING_LEFT - 6, y);
      ctx.lineTo(totalW - PADDING_RIGHT, y);
      ctx.stroke();
      ctx.fillStyle = textColor;
      ctx.fillText(formatM(val), PADDING_LEFT - 10, y + 3.5);
    }

    // Zero line (if data crosses zero)
    if (yMin < 0 && yMax > 0) {
      const zeroY = toY(0);
      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = "rgba(99,102,241,0.4)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.moveTo(PADDING_LEFT - 6, zeroY);
      ctx.lineTo(totalW - PADDING_RIGHT, zeroY);
      ctx.stroke();
      ctx.restore();
    }

    // X-axis labels — show only every 3-day bucket
    ctx.textAlign = "center";
    ctx.font = "500 10px system-ui, -apple-system, sans-serif";
    ctx.fillStyle = textColor;
    const seenKeys = new Set();

    candles.forEach((c, i) => {
      const cx = PADDING_LEFT + i * CANDLE_GAP + CANDLE_GAP / 2;
      const d = c._dateObj;
      const dayNum = d.getDate();
      const bucket = Math.floor((dayNum - 1) / 3);
      const key = `${d.getFullYear()}-${d.getMonth()}-${bucket}`;
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        ctx.fillText(c.shortLabel, cx, CHART_H - PADDING_BOTTOM + 18);
      }
    });

    // Draw candles (yonma-yon, qapishtirib)
    candles.forEach((c, i) => {
      const cx = PADDING_LEFT + i * CANDLE_GAP + CANDLE_GAP / 2;
      const openY = toY(c.open);
      const closeY = toY(c.close);
      const top = Math.min(openY, closeY);
      const h = Math.max(Math.abs(openY - closeY), 3);
      const color = c.type === "income" ? "#10b981" : "#f43f5e";

      ctx.fillStyle = color;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(cx - CANDLE_W / 2, top, CANDLE_W, h, [2]);
      } else {
        ctx.rect(cx - CANDLE_W / 2, top, CANDLE_W, h);
      }
      ctx.fill();

      // Dashed connector line between candles (close → next open)
      if (i < candles.length - 1) {
        const nextCx = PADDING_LEFT + (i + 1) * CANDLE_GAP + CANDLE_GAP / 2;
        const thisCloseY = toY(c.close);
        const nextOpenY = toY(candles[i + 1].open);
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = "rgba(148,163,184,0.3)";
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 3]);
        ctx.moveTo(cx + CANDLE_W / 2, thisCloseY);
        ctx.lineTo(nextCx - CANDLE_W / 2, nextOpenY);
        ctx.stroke();
        ctx.restore();
      }
    });
  }, [candles, totalW, toY]);

  // Auto-scroll to right after load
  useEffect(() => {
    if (scrollRef.current && candles.length > 0) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [candles]);

  // Track wrapper width for tooltip positioning
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    setWrapperWidth(el.offsetWidth);
    const ro = new ResizeObserver(() => setWrapperWidth(el.offsetWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Drag-to-scroll
  const handleMouseDown = (e) => {
    isDragging.current = true;
    dragStartX.current = e.clientX;
    dragScrollLeft.current = scrollRef.current.scrollLeft;
  };

  useEffect(() => {
    const onMove = (e) => {
      if (!isDragging.current) return;
      const dx = e.clientX - dragStartX.current;
      scrollRef.current.scrollLeft = dragScrollLeft.current - dx;
    };
    const onUp = () => {
      isDragging.current = false;
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
  }, []);

  // Tooltip hover detection
  const handleMouseMove = (e) => {
    if (isDragging.current || candles.length === 0) return;
    const scroll = scrollRef.current;
    if (!scroll) return;
    const rect = scroll.getBoundingClientRect();
    const mx = e.clientX - rect.left + scroll.scrollLeft;

    let found = null;
    candles.forEach((c, i) => {
      const cx = PADDING_LEFT + i * CANDLE_GAP + CANDLE_GAP / 2;
      if (Math.abs(mx - cx) < CANDLE_GAP / 2) found = c;
    });

    if (found) {
      setTooltip({
        candle: found,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    } else {
      setTooltip({ candle: null, x: 0, y: 0 });
    }
  };

  if (loading) {
    return (
      <div className="h-72 flex flex-col items-center justify-center text-slate-400">
        <Loader2 size={28} className="animate-spin text-[#4f46e5]" />
        <span className="text-xs font-medium mt-2">Grafik yuklanmoqda...</span>
      </div>
    );
  }

  if (candles.length === 0) {
    return (
      <div className="h-72 flex items-center justify-center text-slate-400 text-xs font-bold uppercase tracking-wider">
        Ma'lumot kiritilmagan
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setTooltip({ candle: null, x: 0, y: 0 })}
      className="no-scrollbar"
      style={{
        width: "100%",
        overflowX: "auto",
        overflowY: "hidden",
        cursor: "grab",
        position: "relative",
        userSelect: "none",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
    >
      <div
        style={{
          width: totalW,
          height: CHART_H,
          position: "relative",
          flexShrink: 0,
        }}
      >
        <canvas ref={canvasRef} style={{ display: "block" }} />
        {tooltip.candle && (
          <CandleTooltip
            candle={tooltip.candle}
            x={tooltip.x}
            y={tooltip.y}
            wrapperWidth={wrapperWidth}
          />
        )}
      </div>
    </div>
  );
};

// ─── MAIN HOME PAGE ────────────────────────────────────────────────────────────
export default function Home() {
  const [stats, setStats] = useState({ income: 0, expense: 0, balance: 0 });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [activePeriod, setActivePeriod] = useState("1M");
  const [hideBalance, setHideBalance] = useState(() => {
    const saved = localStorage.getItem("hide_kassa_balance");
    return saved === "true";
  });

  useEffect(() => {
    localStorage.setItem("hide_kassa_balance", hideBalance);
  }, [hideBalance]);

  const navigate = useNavigate();

  // 🧮 Tranzaksiyalarni vaqtga qarab filterlash mantig'i (Client-side hisoblash uchun)
  const getFilteredStats = () => {
    if (!stats || !stats.allTransactions) {
      // Agar massiv bo'lmasa, mavjud stats'ni o'zini qaytaramiz
      return { income: stats?.income || 0, expense: stats?.expense || 0 };
    }

    const now = new Date();
    let startDate = new Date();

    // Davrni aniqlash
    if (activePeriod === "1M") {
      // Joriy oyning 1-sanasidan boshlab hisoblash
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (activePeriod === "3M") {
      startDate.setMonth(now.getMonth() - 3);
    } else if (activePeriod === "6M") {
      startDate.setMonth(now.getMonth() - 6);
    } else if (activePeriod === "1Y") {
      startDate.setFullYear(now.getFullYear() - 1);
    }

    // Tranzaksiyalarni filterlash va summani hisoblash
    const filtered = stats.allTransactions.filter((t) => {
      const tDate = new Date(t.date);
      return tDate >= startDate && tDate <= now;
    });

    const income = filtered
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = filtered
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    return { income, expense };
  };

  const currentStats = getFilteredStats();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // 💡 MANA SHU YERGA HEADERS VA AUTHORIZATION TOKEN QO'SHILDI
      const res = await fetch(`${BASE_URL}/transaction`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) throw new Error("Ma'lumot yuklanmadi");
      const data = await res.json();

      let totalIncome = 0;
      let totalExpense = 0;

      const sortedTransactions = data.sort((a, b) => {
        const dateA = new Date(a.date || a.createdAt);
        const dateB = new Date(b.date || b.createdAt);
        return dateA - dateB;
      });

      sortedTransactions.forEach((t) => {
        if (t.type === "income") totalIncome += t.amount || 0;
        else if (t.type === "expense") totalExpense += t.amount || 0;
      });

      setStats({
        income: totalIncome,
        expense: totalExpense,
        balance: totalIncome - totalExpense,
      });
      setChartData(sortedTransactions);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const statCards = [
    {
      title: "Umumiy Kirim",
      amount: `+${stats.income.toLocaleString()}`,
      color: "text-[#10b981]",
      icon: <TrendingUp size={22} />,
      bg: "bg-[#e6f4ea]",
    },
    {
      title: "Umumiy Chiqim",
      amount: `-${stats.expense.toLocaleString()}`,
      color: "text-[#f43f5e]",
      icon: <TrendingDown size={22} />,
      bg: "bg-[#fce8e6]",
    },
    {
      title: "Sof Foyda",
      amount: `${stats.balance.toLocaleString()}`,
      color: stats.balance >= 0 ? "text-[#4f46e5]" : "text-[#f43f5e]",
      icon: <PieChart size={22} />,
      bg: "bg-[#e0e7ff]",
    },
    {
      title: "Kassa Jamg'armasi",
      amount: `${Math.max(0, stats.balance).toLocaleString()}`,
      color: "text-[#d97706]",
      icon: <Wallet size={22} />,
      bg: "bg-[#fef3c7]",
    },
  ];

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans">
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {modal && (
        <TransactionModal
          type={modal}
          onClose={() => setModal(null)}
          onSave={loadData}
        />
      )}

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Привет, Джалилов 👋
        </h1>
        <p className="text-slate-500 font-medium mt-1">
          Общий центр финансового контроля всей платформы
        </p>
      </div>

      {/* 💳 PREMIUM TOTAL BALANCE CARD (GLASS-DARK NEON INTEGRATED FILTERS) */}
      <div className="bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#0f172a] p-7 md:p-9 rounded-[40px] shadow-xl mb-8 border border-slate-800/60 relative overflow-hidden transition-all duration-300 group">
        {/* Orqa fondagi nafis communal uslubidagi ambient nurlar va dekoratsiya */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-[#4f46e5]/10 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-[#06b6d4]/10 rounded-full blur-2xl pointer-events-none" />

        {/* Nozik kassa/hamyon chiziqli ikonasi foni (Xuddi rasmdagi kabi devoriy bezak) */}
        <div className="absolute right-4 bottom-0 opacity-[0.03] text-white pointer-events-none select-none hidden md:block">
          <BarChart3 size={180} strokeWidth={1} />
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10 w-full">
          {/* 💰 BALANS VA KO'Z TUGMASI QISMI */}
          <div className="flex items-center gap-4 min-w-[280px]">
            <div>
              <div className="flex items-center gap-2.5">
                <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-white whitespace-nowrap">
                  Platformadagi Umumiy Kassa Jamg'armasi
                </p>

                {/* 👁️ KO'Z TUGMASI (To'q fonga moslab o'zgartirildi) */}
                {!loading && (
                  <button
                    onClick={() => setHideBalance(!hideBalance)}
                    className="p-1.5 bg-white/5 hover:bg-white/10 rounded-full text-white hover:text-[#818cf8] border border-white/5 transition-all duration-200"
                    title={
                      hideBalance ? "Balansni ko'rsatish" : "Balansni yashirish"
                    }
                  >
                    {hideBalance ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                )}
              </div>

              {loading ? (
                <div className="flex items-center gap-3 mt-4 h-[50px]">
                  <Loader2 size={26} className="animate-spin text-[#818cf8]" />
                  <span className="text-base font-bold text-slate-400 animate-pulse">
                    Hisoblanmoqda...
                  </span>
                </div>
              ) : (
                <div className="mt-2 flex items-baseline gap-2 h-[50px]">
                  {hideBalance ? (
                    <span className="text-3xl tracking-[0.18em] font-mono text-[#818cf8]/40 select-none align-middle leading-[50px]">
                      ••••••
                    </span>
                  ) : (
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-none selection:bg-indigo-500/30">
                      {stats?.balance?.toLocaleString() || "0"}
                    </h2>
                  )}
                  <span className="text-base md:text-lg font-black text-[#818cf8] uppercase tracking-wider ml-1 self-end mb-1">
                    so'm
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 🎛️ O'NG TOMONDAGI BOSHQARUV BLOKI */}
          <div className="flex flex-col gap-5 w-full lg:w-auto items-start lg:items-end">
            {/* 1-QATOR: AMALLAR TUGMALARI */}
            <div className="flex items-center gap-3 lg:gap-4 overflow-x-auto lg:overflow-visible no-scrollbar w-full lg:w-auto justify-start lg:justify-end py-1">
              {/* MOLIYA PANELIGA O'TISH (Premium Shaffof Glass) */}
              <button
                onClick={() => navigate("/homeChecks")}
                className="group relative flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black px-4 md:px-5 py-3 rounded-2xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shrink-0"
              >
                <div className="bg-white/10 p-2 rounded-xl text-[#818cf8] group-hover:rotate-6 transition-transform duration-300 border border-white/5">
                  <BarChart3 size={18} />
                </div>
                <div className="text-left flex flex-col pr-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">
                    Moliya paneli
                  </span>
                  <span className="text-xs font-black tracking-tight mt-1 text-white whitespace-nowrap">
                    Cheklarni Ko'rish
                  </span>
                </div>
                <ArrowRight
                  size={16}
                  className="text-[#818cf8] group-hover:translate-x-1 transition-transform duration-300"
                  strokeWidth={2.5}
                />
              </button>

              {/* KIRIM QO'SHISH (Yorqin Emerald) */}
              <button
                onClick={() => setModal("income")}
                className="flex items-center gap-2 bg-[#10b981] hover:bg-[#059669] text-white px-5 py-3.5 rounded-2xl font-black text-xs md:text-sm uppercase tracking-wider shadow-[0_4px_20px_rgba(16,185,129,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shrink-0 whitespace-nowrap"
              >
                <Plus size={18} strokeWidth={3} /> Kirim qo'sh
              </button>

              {/* CHIQIM QO'SHISH (Yorqin Rose) */}
              <button
                onClick={() => setModal("expense")}
                className="flex items-center gap-2 bg-[#f43f5e] hover:bg-[#e11d48] text-white px-5 py-3.5 rounded-2xl font-black text-xs md:text-sm uppercase tracking-wider shadow-[0_4px_20px_rgba(244,63,94,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shrink-0 whitespace-nowrap"
              >
                <Plus size={18} strokeWidth={3} /> Chiqim qo'sh
              </button>
            </div>

            {/* 📅 2-QATOR: PREMIUM VAQT FILTRLARI TUGMALARI (To'q fonga moslangan variant) */}
            <div className="flex items-center gap-1.5 bg-white/5 p-1.5 rounded-2xl w-full sm:w-fit border border-white/10 shadow-2xl backdrop-blur-md mt-0.5">
              {[
                { id: "1M", label: "1 Oy" },
                { id: "3M", label: "3 Oy" },
                { id: "6M", label: "6 Oy" },
                { id: "1Y", label: "1 Yil" },
              ].map((period) => {
                const isActive = activePeriod === period.id;
                return (
                  <button
                    key={period.id}
                    onClick={() => setActivePeriod(period.id)}
                    className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap relative ${
                      isActive
                        ? "bg-white text-[#1e1b4b] shadow-xl scale-[1.02] font-black"
                        : "text-[#94a3b8] hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {isActive && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#1e1b4b] rounded-full" />
                    )}
                    <span className={isActive ? "relative -top-0.5" : ""}>
                      {period.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 📊 STATS CARDS (COMMUNAL STYLE GLASS-CHROMATIC) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* 🟢 UMUMIY KIRIM KARTASI (Nafis och yalpiz-havorang tonlar) */}
        <div className="bg-[#f0f9ff]/80 backdrop-blur-md p-7 md:p-8 rounded-[36px] border border-[#bae6fd]/60 shadow-sm relative overflow-hidden transition-all hover:shadow-md hover:scale-[1.01] duration-300 group">
          {/* Orqa fondagi communal uslubidagi nafis ambient doira */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#e0f2fe] rounded-full pointer-events-none group-hover:scale-110 transition-transform duration-500" />

          <div className="flex items-center gap-5 relative z-10">
            {/* Belgining shishasimon premium idishi */}
            <div className="p-4 bg-[#e0f2fe] text-[#0369a1] rounded-2xl border border-[#bae6fd]/40 shadow-sm group-hover:bg-[#0369a1] group-hover:text-white transition-all duration-300">
              <Plus
                size={24}
                strokeWidth={3}
                className="transition-transform duration-500 group-hover:scale-110"
              />
            </div>

            <div className="flex-1">
              <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-[#0369a1]/70">
                Umumiy Kirim ({activePeriod === "1M" ? "Shu oy" : activePeriod})
              </p>

              <div className="mt-1.5 flex items-baseline gap-1.5 h-[46px]">
                {hideBalance ? (
                  <span className="text-2xl md:text-3xl tracking-[0.15em] font-mono text-[#0369a1]/30 select-none leading-[46px]">
                    ••••••
                  </span>
                ) : (
                  <h3 className="text-2xl md:text-3xl font-black text-[#0369a1] tracking-tight leading-none self-end">
                    +{currentStats.income.toLocaleString()}
                  </h3>
                )}
                <span className="text-xs md:text-sm font-black text-[#0369a1]/60 uppercase tracking-wider ml-0.5 self-end mb-0.5">
                  so'm
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 🔴 UMUMIY CHIQIM KARTASI (Communal sahifadagi och pastel-sariq tonlar) */}
        <div className="bg-[#fefce8]/80 backdrop-blur-md p-7 md:p-8 rounded-[36px] border border-[#fef08a]/60 shadow-sm relative overflow-hidden transition-all hover:shadow-md hover:scale-[1.01] duration-300 group">
          {/* Orqa fondagi communal uslubidagi nafis ambient doira */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#fef9c3] rounded-full pointer-events-none group-hover:scale-110 transition-transform duration-500" />

          <div className="flex items-center gap-5 relative z-10">
            {/* Belgining shishasimon premium idishi */}
            <div className="p-4 bg-[#fef9c3] text-[#a16207] rounded-2xl border border-[#fef08a]/40 shadow-sm group-hover:bg-[#a16207] group-hover:text-white transition-all duration-300">
              <Minus
                size={24}
                strokeWidth={3}
                className="rotate-0 transition-transform duration-500 group-hover:scale-110"
              />
            </div>

            <div className="flex-1">
              <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-[#a16207]/70">
                Umumiy Chiqim ({activePeriod === "1M" ? "Shu oy" : activePeriod}
                )
              </p>

              <div className="mt-1.5 flex items-baseline gap-1.5 h-[46px]">
                {hideBalance ? (
                  <span className="text-2xl md:text-3xl tracking-[0.15em] font-mono text-[#a16207]/30 select-none leading-[46px]">
                    ••••••
                  </span>
                ) : (
                  <h3 className="text-2xl md:text-3xl font-black text-[#a16207] tracking-tight leading-none self-end">
                    -{currentStats.expense.toLocaleString()}
                  </h3>
                )}
                <span className="text-xs md:text-sm font-black text-[#a16207]/60 uppercase tracking-wider ml-0.5 self-end mb-0.5">
                  so'm
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CANDLESTICK CHART */}
      <div className="bg-white p-6 rounded-[26px] shadow-sm border border-slate-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 border-b border-slate-50 pb-3">
          <div className="flex items-center gap-2">
            <PieChart className="text-[#4f46e5]" size={20} />
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Kassa Trend Shamchalari (Real MT5 Style)
            </h2>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-bold opacity-80 flex-wrap">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-[#10b981] rounded-sm inline-block" />
              Kirim Balans O'sishi
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-[#f43f5e] rounded-sm inline-block" />
              Chiqim Balans Tushishi
            </span>
            <span className="text-[#4f46e5] font-black animate-pulse">
              ⟺ Bosib sudrab scroll qiling
            </span>
          </div>
        </div>

        <CandlestickChart data={chartData} loading={loading} />
      </div>
    </div>
  );
}
