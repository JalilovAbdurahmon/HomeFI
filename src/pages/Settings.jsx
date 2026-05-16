import React, { useState } from "react";
import {
  User,
  Globe,
  Moon,
  Sun,
  Bell,
  ShieldCheck,
  Trash2,
  Lock,
  KeyRound,
  ChevronRight,
  HelpCircle,
  LogOut,
  EyeOff,
  Eye,
  LayoutDashboard,
  CreditCard,
  Sparkles,
  Sliders,
  Smartphone,
  Plus,
  ListOrdered,
  X,
  CheckCircle2,
} from "lucide-react";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("general");

  // Switch holatlari
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState("uz");
  const [notifications, setNotifications] = useState(true);
  const [hideBalance, setHideBalance] = useState(false);
  const [quickAdd, setQuickAdd] = useState(true);
  const [budgetLimit, setBudgetLimit] = useState(true);
  const [autoComment, setAutoComment] = useState(false);

  // Modallar paneli
  const [showAddModal, setShowAddModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);

  // Shaxsiy sarlavhalar statelari
  const [newCategoryName, setNewCategoryName] = useState("");
  const [myCategories, setMyCategories] = useState([
    { _id: "1", title: "Olma", isGlobal: false },
    { _id: "2", title: "Shaftoli", isGlobal: false },
  ]);

  // Admin qo'shgan va faqat GET bo'ladigan global sarlavhalar
  const globalCategories = [
    { _id: "g1", title: "Продукты", isGlobal: true },
    { _id: "g2", title: "Транспорт", isGlobal: true },
    { _id: "g3", title: "Коммуналка", isGlobal: true },
  ];

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    const newCat = {
      _id: Date.now().toString(),
      title: newCategoryName,
      isGlobal: false,
    };
    setMyCategories([...myCategories, newCat]);
    setNewCategoryName("");
    setShowAddModal(false);
  };

  const handleDeleteCategory = (id) => {
    setMyCategories(myCategories.filter((cat) => cat._id !== id));
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#1e293b] p-6 md:p-12 font-sans selection:bg-indigo-100">
      <div className="w-full max-w-[1440px] mx-auto">
        {/* 🏷️ SAHIFA SARLAVHASI */}
        <div className="mb-4 border-b-2 border-slate-200 pb-6">
          <h1 className="text-4xl font-black tracking-tight text-[#0f172a]">
            Настройки
          </h1>
          <p className="text-base text-[#64748b] mt-1">
            Настройте интерфейс приложения и свой профиль.
          </p>
        </div>

        {/* Grid tizimi o'ng tomonga ko'proq joy berish va muvozanat uchun moslandi */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
          {/* 🧭 CHAP MENU PANELI (WIDTH KATTALASHTIRILDI: xl:col-span-4 qilindi) */}
          <div className="xl:col-span-4 flex flex-col gap-4 bg-white border border-slate-200 p-6 rounded-[32px] shadow-sm w-full min-w-[320px] lg:min-w-[360px]">
            {/* Profil qismi */}
            <div className="p-6 bg-slate-50/80 rounded-2xl text-center mb-2 border border-slate-100">
              <div className="w-24 h-24 bg-gradient-to-tr from-[#4f46e5] to-[#7c3aed] rounded-3xl mx-auto flex items-center justify-center text-white font-black text-3xl shadow-md mb-4">
                U
              </div>
              <h3 className="font-black text-xl text-[#0f172a]">User Name</h3>
              <p className="text-sm text-[#94a3b8] font-bold mt-1">
                user@example.com
              </p>

              <div className="mt-4 inline-block px-4 py-1.5 bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-black rounded-full tracking-wider uppercase">
                Premium Account
              </div>
            </div>

            {/* Menu tugmalari (Keng, katta va matnlari bir qatorga joylashadigan bo'ldi) */}
            <button
              onClick={() => setActiveTab("general")}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-base font-black transition-all ${
                activeTab === "general"
                  ? "bg-[#0f172a] text-white shadow-xl translate-x-1"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Sliders
                size={22}
                className={
                  activeTab === "general" ? "text-indigo-400" : "text-slate-500"
                }
              />
              <span>Umumiy sozlamalar</span>
            </button>

            <button
              onClick={() => setActiveTab("security")}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-base font-black transition-all ${
                activeTab === "security"
                  ? "bg-[#0f172a] text-white shadow-xl translate-x-1"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <ShieldCheck
                size={22}
                className={
                  activeTab === "security"
                    ? "text-indigo-400"
                    : "text-slate-500"
                }
              />
              <span>Xavfsizlik va Profil</span>
            </button>

            <button
              onClick={() => setActiveTab("danger")}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-base font-black transition-all ${
                activeTab === "danger"
                  ? "bg-rose-50 text-rose-600 shadow-sm"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Trash2 size={22} className="text-rose-500" />
              <span>Xavfli hudud</span>
            </button>

            <div className="h-px bg-slate-200 my-2" />

            <button className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-base font-black text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all whitespace-nowrap">
              <LogOut size={22} className="rotate-180 text-rose-500" />
              <span>Tizimdan chiqish</span>
            </button>
          </div>

          {/* 📝 O'NG TOMON KONTENT BLOKI (xl:col-span-8) */}
          <div className="xl:col-span-8 flex flex-col gap-8 w-full">
            {activeTab === "general" && (
              <>
                {/* 🛡️ 1. MAHSULOTLAR (TITLE) BOSHQARUVI */}
                <div className="bg-white border border-slate-200 rounded-[32px] shadow-sm overflow-hidden">
                  <div className="p-6 bg-slate-50/70 border-b border-slate-200 flex items-center gap-3">
                    <ListOrdered size={22} className="text-indigo-600" />
                    <h2 className="text-sm font-black uppercase tracking-wider text-[#475569]">
                      Maxsus Mahsulot Sarlavhalari (Kategoriyalar)
                    </h2>
                  </div>

                  <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white">
                    <div className="p-6 border border-slate-200 rounded-2xl bg-slate-50/50 flex flex-col justify-between">
                      <div>
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-black rounded-md uppercase tracking-wider">
                          Shaxsiy funksiya
                        </span>
                        <h3 className="text-xl font-black text-slate-800 mt-3">
                          Yangi sarlavha qo'shish
                        </h3>
                        <p className="text-base text-slate-500 mt-2 leading-relaxed">
                          Siz yaratgan sarlavha faqat o'zingizga ko'rinadi va
                          tranzaksiyalarni kiritishda chiqadi.
                        </p>
                      </div>
                      <button
                        onClick={() => setShowAddModal(true)}
                        className="mt-6 w-full flex items-center justify-center gap-3 py-4 bg-[#0f172a] hover:bg-slate-800 text-white text-base font-black rounded-xl transition-all shadow-md"
                      >
                        <Plus size={22} /> Sarlavha qo'shish (POST)
                      </button>
                    </div>

                    <div className="p-6 border border-slate-200 rounded-2xl bg-slate-50/50 flex flex-col justify-between">
                      <div>
                        <span className="px-3 py-1 bg-rose-50 text-rose-600 text-xs font-black rounded-md uppercase tracking-wider">
                          Nazorat paneli
                        </span>
                        <h3 className="text-xl font-black text-slate-800 mt-3">
                          O'chirish va Ko'rish
                        </h3>
                        <p className="text-base text-slate-500 mt-2 leading-relaxed">
                          O'zingiz qo'shganlarni o'chirish (DELETE), adminnikini
                          esa faqat ko'rish (GET-ONLY) rejimi.
                        </p>
                      </div>
                      <button
                        onClick={() => setShowManageModal(true)}
                        className="mt-6 w-full flex items-center justify-center gap-3 py-4 bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 text-base font-black rounded-xl transition-all shadow-sm"
                      >
                        <Trash2 size={22} className="text-rose-500" /> Ro'yxatni
                        boshqarish
                      </button>
                    </div>
                  </div>
                </div>

                {/* 💳 2. KASSA VA DASHBOARD FUNKSIYALARI */}
                <div className="bg-white border border-slate-200 rounded-[32px] shadow-sm overflow-hidden">
                  <div className="p-6 bg-slate-50/70 border-b border-slate-200 flex items-center gap-3">
                    <CreditCard size={22} className="text-indigo-600" />
                    <h2 className="text-sm font-black uppercase tracking-wider text-[#475569]">
                      Kassa va Dashboard Funksiyalari
                    </h2>
                  </div>

                  <div className="divide-y divide-slate-100">
                    <div className="p-6 flex items-center justify-between hover:bg-slate-50/40 transition-all">
                      <div className="flex items-center gap-5">
                        <div
                          className={`p-3 rounded-xl ${
                            hideBalance
                              ? "bg-indigo-50 text-indigo-600"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {hideBalance ? (
                            <EyeOff size={24} />
                          ) : (
                            <Eye size={24} />
                          )}
                        </div>
                        <div>
                          <p className="text-lg font-black text-[#1e293b]">
                            Maxfiy rejim (Balansni yashirish)
                          </p>
                          <p className="text-base text-[#94a3b8] mt-1">
                            Bosh sahifadagi umumiy pul summasini yashirish
                            ("***" ko'rinishida)
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setHideBalance(!hideBalance)}
                        className={`w-14 h-7 flex items-center rounded-full p-1 transition-colors duration-300 ${
                          hideBalance ? "bg-indigo-600" : "bg-slate-200"
                        }`}
                      >
                        <div
                          className={`bg-white w-5 h-5 rounded-full shadow transform transition-transform duration-300 ${
                            hideBalance ? "translate-x-7" : ""
                          }`}
                        />
                      </button>
                    </div>

                    <div className="p-6 flex items-center justify-between hover:bg-slate-50/40 transition-all">
                      <div className="flex items-center gap-5">
                        <div className="p-3 bg-slate-100 text-slate-600 rounded-xl">
                          <LayoutDashboard size={24} />
                        </div>
                        <div>
                          <p className="text-lg font-black text-[#1e293b]">
                            Tezkor Amaliyot Vidjeti
                          </p>
                          <p className="text-base text-[#94a3b8] mt-1">
                            Bosh sahifada tranzaksiyalarni tezkor kiritish
                            panelini doim ochib qo'yish
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setQuickAdd(!quickAdd)}
                        className={`w-14 h-7 flex items-center rounded-full p-1 transition-colors duration-300 ${
                          quickAdd ? "bg-indigo-600" : "bg-slate-200"
                        }`}
                      >
                        <div
                          className={`bg-white w-5 h-5 rounded-full shadow transform transition-transform duration-300 ${
                            quickAdd ? "translate-x-7" : ""
                          }`}
                        />
                      </button>
                    </div>

                    <div className="p-6 flex items-center justify-between hover:bg-slate-50/40 transition-all">
                      <div className="flex items-center gap-5">
                        <div className="p-3 bg-slate-100 text-slate-600 rounded-xl">
                          <Sparkles size={24} />
                        </div>
                        <div>
                          <p className="text-lg font-black text-[#1e293b]">
                            Byudjet limiti haqida ogohlantirish
                          </p>
                          <p className="text-base text-[#94a3b8] mt-1">
                            Oylik xarajatlar limiti 80% dan oshganda tizim
                            ogohlantiruvchi qizil signal beradi
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setBudgetLimit(!budgetLimit)}
                        className={`w-14 h-7 flex items-center rounded-full p-1 transition-colors duration-300 ${
                          budgetLimit ? "bg-indigo-600" : "bg-slate-200"
                        }`}
                      >
                        <div
                          className={`bg-white w-5 h-5 rounded-full shadow transform transition-transform duration-300 ${
                            budgetLimit ? "translate-x-7" : ""
                          }`}
                        />
                      </button>
                    </div>

                    <div className="p-6 flex items-center justify-between hover:bg-slate-50/40 transition-all">
                      <div className="flex items-center gap-5">
                        <div className="p-3 bg-slate-100 text-slate-600 rounded-xl">
                          <Smartphone size={24} />
                        </div>
                        <div>
                          <p className="text-lg font-black text-[#1e293b]">
                            Aqlli Izohlar (Auto-comment)
                          </p>
                          <p className="text-base text-[#94a3b8] mt-1">
                            Kategoriya tanlanganda, unga mos keladigan izohni
                            tizim o'zi taxmin qilib yozadi
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setAutoComment(!autoComment)}
                        className={`w-14 h-7 flex items-center rounded-full p-1 transition-colors duration-300 ${
                          autoComment ? "bg-indigo-600" : "bg-slate-200"
                        }`}
                      >
                        <div
                          className={`bg-white w-5 h-5 rounded-full shadow transform transition-transform duration-300 ${
                            autoComment ? "translate-x-7" : ""
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* 🌐 3. TIZIM VA TASHQI KO'RINISH */}
                <div className="bg-white border border-slate-200 rounded-[32px] shadow-sm overflow-hidden">
                  <div className="p-6 bg-slate-50/70 border-b border-slate-200 flex items-center gap-3">
                    <Globe size={22} className="text-indigo-600" />
                    <h2 className="text-sm font-black uppercase tracking-wider text-[#475569]">
                      Tizim va Tashqi ko'rinish
                    </h2>
                  </div>

                  <div className="divide-y divide-slate-100">
                    <div className="p-6 flex items-center justify-between hover:bg-slate-50/40 transition-all">
                      <div className="flex items-center gap-5">
                        <div
                          className={`p-3 rounded-xl ${
                            isDarkMode
                              ? "bg-amber-50 text-amber-500"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
                        </div>
                        <div>
                          <p className="text-lg font-black text-[#1e293b]">
                            Tungi rejim (Dark Mode)
                          </p>
                          <p className="text-base text-[#94a3b8] mt-1">
                            Ilovani butkul qorong'u (to'q) mavzuga moslashtirish
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className={`w-14 h-7 flex items-center rounded-full p-1 transition-colors duration-300 ${
                          isDarkMode ? "bg-indigo-600" : "bg-slate-200"
                        }`}
                      >
                        <div
                          className={`bg-white w-5 h-5 rounded-full shadow transform transition-transform duration-300 ${
                            isDarkMode ? "translate-x-7" : ""
                          }`}
                        />
                      </button>
                    </div>

                    <div className="p-6 flex items-center justify-between hover:bg-slate-50/40 transition-all">
                      <div className="flex items-center gap-5">
                        <div className="p-3 bg-slate-100 text-slate-600 rounded-xl">
                          <Globe size={24} />
                        </div>
                        <div>
                          <p className="text-lg font-black text-[#1e293b]">
                            Tizim tili
                          </p>
                          <p className="text-base text-[#94a3b8] mt-1">
                            Platforma interfeysining asosiy tili
                          </p>
                        </div>
                      </div>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="text-base font-black bg-slate-50 border-2 border-slate-200 text-[#1e293b] rounded-xl px-5 py-3 cursor-pointer focus:outline-none focus:border-indigo-500"
                      >
                        <option value="uz">O'zbekcha</option>
                        <option value="ru">Русский</option>
                        <option value="en">English</option>
                      </select>
                    </div>

                    <div className="p-6 flex items-center justify-between hover:bg-slate-50/40 transition-all">
                      <div className="flex items-center gap-5">
                        <div className="p-3 bg-slate-100 text-slate-600 rounded-xl">
                          <Bell size={24} />
                        </div>
                        <div>
                          <p className="text-lg font-black text-[#1e293b]">
                            Tezkor Bildirishnomalar
                          </p>
                          <p className="text-base text-[#94a3b8] mt-1">
                            Xaridlar muddati kelganda yoki limitlar buzilganda
                            brauzer xabarnomalari
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setNotifications(!notifications)}
                        className={`w-14 h-7 flex items-center rounded-full p-1 transition-colors duration-300 ${
                          notifications ? "bg-indigo-600" : "bg-slate-200"
                        }`}
                      >
                        <div
                          className={`bg-white w-5 h-5 rounded-full shadow transform transition-transform duration-300 ${
                            notifications ? "translate-x-7" : ""
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ================= 🟢 MODAL 1: TITLE QO'SHISH ================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-[300] flex justify-center items-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          />
          <div className="relative bg-white w-full max-w-lg rounded-[32px] shadow-2xl p-8 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-slate-800">
                Yangi maxsus sarlavha
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="space-y-5">
              <div>
                <label className="text-xs uppercase font-black text-slate-400 tracking-wider">
                  Sarlavha nomi (Title)
                </label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Masalan: Olma, Shaftoli..."
                  className="w-full mt-2 px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-base font-bold focus:outline-none focus:border-indigo-500 transition-colors"
                  required
                />
              </div>
              <p className="text-sm text-slate-400 italic leading-relaxed">
                🔒 Eslatma: Bu sarlavha faqat sizning akkauntingiz uchun
                yaratiladi.
              </p>

              <button
                type="submit"
                className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black text-base uppercase tracking-wider hover:bg-indigo-500 transition-all shadow-lg"
              >
                Bazaga saqlash (POST)
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= 🔴 MODAL 2: RO'YXATNI BOSHQARISH (SCROLL BILAN) ================= */}
      {showManageModal && (
        <div className="fixed inset-0 z-[300] flex justify-center items-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setShowManageModal(false)}
          />
          <div className="relative bg-white w-full max-w-xl rounded-[32px] shadow-2xl p-8 animate-in zoom-in-95 duration-200 max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center pb-5 border-b-2 border-slate-100">
              <div>
                <h2 className="text-2xl font-black text-slate-800">
                  Sarlavhalar nazorati
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Huquqlar darajasi va elementlarni o'chirish
                </p>
              </div>
              <button
                onClick={() => setShowManageModal(false)}
                className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-all"
              >
                <X size={24} />
              </button>
            </div>

            {/* 📜 Scroll qismi */}
            <div className="flex-1 overflow-y-auto my-6 pr-2 space-y-6 custom-scrollbar">
              <div>
                <h4 className="text-xs uppercase font-black text-indigo-500 tracking-wider mb-3">
                  Siz qo'shgan sarlavhalar ({myCategories.length})
                </h4>
                <div className="space-y-2">
                  {myCategories.map((cat) => (
                    <div
                      key={cat._id}
                      className="flex items-center justify-between p-4 bg-indigo-50/40 border border-indigo-100/60 rounded-xl"
                    >
                      <span className="text-base font-extrabold text-slate-700">
                        {cat.title}
                      </span>
                      <button
                        onClick={() => handleDeleteCategory(cat._id)}
                        className="p-2.5 bg-white text-rose-500 hover:bg-rose-50 rounded-xl transition-all border border-slate-200 shadow-sm hover:text-rose-700"
                        title="O'chirish (DELETE)"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                  {myCategories.length === 0 && (
                    <p className="text-base text-slate-400 italic pl-1">
                      Siz hali maxsus sarlavha qo'shmadingiz.
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-xs uppercase font-black text-slate-400 tracking-wider mb-3">
                  Admin sarlavhalari (Faqat ko'rish - GET-ONLY 🛡️)
                </h4>
                <div className="space-y-2">
                  {globalCategories.map((cat) => (
                    <div
                      key={cat._id}
                      className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl opacity-75"
                    >
                      <span className="text-base font-extrabold text-slate-600">
                        {cat.title}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs font-black uppercase text-slate-400 bg-slate-100 px-3 py-1 rounded-md">
                        <CheckCircle2 size={16} /> GET
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={() => setShowManageModal(false)}
                className="w-full py-4 bg-slate-900 text-white rounded-xl text-base font-black uppercase tracking-wider hover:bg-slate-800 transition-all"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
