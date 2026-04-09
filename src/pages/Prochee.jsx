import React from "react";
import {
  ShoppingBag,
  Tv,
  Heart,
  Home,
  MoreHorizontal,
  Gift,
  Smartphone,
  ArrowUpRight,
  Sparkles,
  Plus,
} from "lucide-react";

const Prochee = () => {
  // Данные для категории "Прочее"
  const miscellaneous = [
    {
      id: 1,
      name: "Netflix Sub",
      price: "12.99",
      icon: <Tv size={20} />,
      color: "bg-red-500",
      tag: "Подписка",
    },
    {
      id: 2,
      name: "Nike Store",
      price: "120.00",
      icon: <ShoppingBag size={20} />,
      color: "bg-slate-900",
      tag: "Одежда",
    },
    {
      id: 3,
      name: "App Store",
      price: "0.99",
      icon: <Smartphone size={20} />,
      color: "bg-blue-500",
      tag: "Сервис",
    },
    {
      id: 4,
      name: "Подарок маме",
      price: "50.00",
      icon: <Gift size={20} />,
      color: "bg-pink-500",
      tag: "Подарки",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F4F7FE] p-6 md:p-10 font-sans">
      {/* 🚀 HEADER */}
      <div className="mb-10 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="text-indigo-600" size={24} />
            <h1 className="text-3xl font-black text-slate-800 tracking-tight text-uppercase">
              Прочее и Лайфстайл
            </h1>
          </div>
          <p className="text-slate-400 font-medium">
            Подписки, шоппинг и личные расходы.
          </p>
        </div>
        <button className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition">
          <Plus className="text-indigo-600" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 💳 LEFT: МОИ ПОДПИСКИ (Subscription Cards) */}
        <div className="space-y-6">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] ml-2">
            Активные сервисы
          </h3>
          {miscellaneous
            .filter((i) => i.tag === "Подписка" || i.tag === "Сервис")
            .map((item) => (
              <div
                key={item.id}
                className="bg-white p-6 rounded-[35px] shadow-sm border border-slate-50 flex items-center justify-between group hover:border-indigo-200 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`${item.color} text-white p-4 rounded-2xl shadow-lg`}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800">{item.name}</h4>
                    <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md uppercase tracking-widest">
                      {item.tag}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-slate-800">-${item.price}</p>
                  <p className="text-[10px] font-bold text-slate-300">
                    Ежемесячно
                  </p>
                </div>
              </div>
            ))}

          {/* Спец. предложение или бонусная карта */}
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-[40px] text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 blur-3xl rounded-full" />
            <h3 className="text-lg font-black mb-2 leading-tight text-white">
              Кэшбэк на <br /> развлечения 5%
            </h3>
            <button className="mt-4 bg-white/20 hover:bg-white/30 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
              Активировать
            </button>
          </div>
        </div>

        {/* 🛍 CENTER: КАТЕГОРИЯ "ПРОЧЕЕ" (Grid List) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">
              История шоппинга
            </h3>
            <button className="text-indigo-600 font-bold text-xs">
              Весь список
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {miscellaneous
              .filter((i) => i.tag !== "Подписка")
              .map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-6 rounded-[40px] border border-slate-50 shadow-sm hover:shadow-xl transition-all group"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div
                      className={`w-12 h-12 ${item.color} text-white rounded-2xl flex items-center justify-center shadow-lg`}
                    >
                      {item.icon}
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl text-slate-300 group-hover:text-indigo-500 transition-colors cursor-pointer">
                      <ArrowUpRight size={18} />
                    </div>
                  </div>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-1">
                    {item.tag}
                  </p>
                  <h4 className="text-xl font-black text-slate-800 mb-4">
                    {item.name}
                  </h4>
                  <div className="flex justify-between items-center border-t border-slate-50 pt-4">
                    <span className="text-slate-400 text-xs font-bold italic">
                      04 Апреля, 2026
                    </span>
                    <span className="text-xl font-black text-slate-800">
                      -${item.price}
                    </span>
                  </div>
                </div>
              ))}

            {/* Заглушка для добавления нового */}
            <div className="border-2 border-dashed border-slate-200 rounded-[40px] p-6 flex flex-col items-center justify-center text-slate-300 hover:border-indigo-300 hover:text-indigo-300 transition-all cursor-pointer bg-slate-50/30">
              <div className="w-10 h-10 rounded-full border-2 border-current flex items-center justify-center mb-2">
                <Plus size={20} />
              </div>
              <span className="font-black text-[10px] uppercase tracking-widest">
                Добавить покупку
              </span>
            </div>
          </div>

          {/* 🏠 HOUSEHOLD / КАТЕГОРИЯ ДОМ */}
          <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-50">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center">
                <Home size={24} />
              </div>
              <div>
                <h3 className="font-black text-slate-800 text-lg uppercase italic tracking-tighter">
                  Все для дома
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  Хозтовары, мебель, декор
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                <span className="text-sm font-bold text-slate-600 italic tracking-tight">
                  Нужно купить: Моющее средство, Лампочки...
                </span>
              </div>
              <ChevronRight className="text-slate-300" size={18} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Вспомогательный иконка для стрелочки (не импортировалась выше)
const ChevronRight = ({ className, size }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m9 18 6-6-6-6" />
  </svg>
);

export default Prochee;
