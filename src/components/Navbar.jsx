import React, { useState, useRef, useEffect } from "react";
import {
  Bell,
  ChevronDown,
  User,
  LogOut,
  X,
  BellRing,
  BellOff,
  CheckCircle,
  Wallet, // Hamyon ikonkasi
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BASE_URL = "http://localhost:2000";

const instance = axios.create({
  baseURL: BASE_URL,
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [notifItems, setNotifItems] = useState([]);
  const [totalSum, setTotalSum] = useState("0");
  const [username, setUsername] = useState(
    localStorage.getItem("username") || "User"
  );

  const menuRef = useRef(null);
  const nav = useNavigate();

  const fetchNotifications = async () => {
    try {
      const res = await instance.get("/xaridlar");
      const today = new Date().toISOString().split("T")[0];

      // Umumiy summani backenddan olish
      setTotalSum(res.data.totalSum || "0");

      const filtered = res.data.products.filter(
        (item) => item.neededBy && item.neededBy <= today
      );
      setNotifItems(filtered);
    } catch (err) {
      console.error("Xatolik:", err);
    }
  };

  const handleBought = async (id) => {
    try {
      await instance.delete(`/xaridlar/${id}`);
      setNotifItems((prev) => prev.filter((item) => item._id !== id));
      fetchNotifications(); // Summani yangilash
      window.dispatchEvent(new Event("xaridUpdated"));
    } catch (err) {
      alert("Xatolik yuz berdi!");
    }
  };

  useEffect(() => {
    fetchNotifications();
    window.addEventListener("xaridUpdated", fetchNotifications);
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("xaridUpdated", fetchNotifications);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    nav("/");
  };

  return (
    <nav className="h-16 flex justify-between items-center w-full px-8 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-[100]">
      {/* 🔔 Notification Bell */}
      <div className="flex items-center">
        <button
          onClick={() => setShowNotifModal(true)}
          className="relative p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition-all group"
        >
          <Bell size={22} />
          {notifItems.length > 0 && (
            <span className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center text-[10px] font-bold text-white bg-red-500 border-2 border-white rounded-full animate-bounce">
              {notifItems.length}
            </span>
          )}
        </button>
      </div>

      {/* 👤 User Profile (O'zgarishsiz) */}
      <div className="flex items-center gap-4" ref={menuRef}>
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-3 p-1.5 pr-4 rounded-full hover:bg-slate-50"
          >
            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border-2 border-white shadow-sm">
              {username[0]}
            </div>
            <div className="hidden sm:block text-left leading-none">
              <p className="text-sm font-bold text-slate-700">{username}</p>
              <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold">
                Пользователь
              </p>
            </div>
            <ChevronDown
              size={14}
              className={`text-slate-400 transition-transform ${
                open ? "rotate-180" : ""
              }`}
            />
          </button>
          {/* Dropdown menu shu yerda bo'ladi... */}
        </div>
      </div>

      {/* 📝 NOTIFICATION MODAL */}
      {showNotifModal && (
        <div className="fixed inset-0 z-[200] flex justify-center items-start pt-20 p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setShowNotifModal(false)}
          ></div>

          <div className="relative bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-5 duration-300">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <BellRing size={22} />
                </div>
                <h2 className="text-lg font-black text-slate-800">
                  Уведомления
                </h2>
              </div>
              <button
                onClick={() => setShowNotifModal(false)}
                className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-full bg-white shadow-sm transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* 💰 TOTAL BUDGET SECTION (Modal ichida, ro'yxatdan tepada) */}
            <div className="px-6 pt-6">
              <div className="flex items-center gap-4 bg-indigo-50/50 border border-indigo-100 p-4 rounded-[24px]">
                <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100">
                  <Wallet size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] uppercase font-bold text-indigo-400 tracking-wider">
                    Общий бюджет
                  </span>
                  <span className="text-xl font-black text-slate-800">
                    {totalSum}{" "}
                    <small className="text-xs text-slate-400 font-bold">
                      СУМ
                    </small>
                  </span>
                </div>
              </div>
            </div>

            {/* Notifications List */}
            <div className="p-4 max-h-[400px] overflow-y-auto space-y-3">
              {notifItems.length > 0 ? (
                notifItems.map((item) => (
                  <div
                    key={item._id}
                    className="p-5 rounded-[24px] border border-slate-100 bg-white hover:border-emerald-100 transition-all shadow-sm"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-extrabold text-slate-800 text-base">
                        {item.productTitle || item.name}
                      </h3>
                      <span className="text-[11px] font-black text-slate-900 uppercase">
                        до {item.neededBy}
                      </span>
                    </div>
                    <div className="flex justify-between items-end pt-3 border-t border-slate-50">
                      <div className="flex flex-row gap-1 text-[13px] text-slate-600 font-bold">
                        <span>📦 {item.quantity} шт/кг</span>
                        <span className="text-indigo-600">
                          💰 {item.sum?.toLocaleString()} сум
                        </span>
                      </div>
                      <button
                        onClick={() => handleBought(item._id)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#ECFDF5] text-[#059669] rounded-2xl hover:bg-[#059669] hover:text-white transition-all shadow-sm"
                      >
                        <CheckCircle size={16} />
                        <span className="text-xs font-black uppercase">
                          Куплено
                        </span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-slate-400">
                  <BellOff size={40} className="mx-auto mb-3 opacity-20" />
                  <p className="font-bold">Hozircha xaridlar yo'q</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-white border-t border-slate-50">
              <button
                onClick={() => setShowNotifModal(false)}
                className="w-full py-4 bg-[#0F172A] text-white rounded-[20px] font-black hover:bg-slate-800 transition-all shadow-lg text-sm tracking-widest uppercase"
              >
                Понятно
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
