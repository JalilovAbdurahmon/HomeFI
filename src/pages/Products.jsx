import React, { useState } from "react";
import { 
  Plus, Search, Check, ShoppingBag, 
  Apple, Coffee, Pizza, ShoppingCart,
  ArrowRight, PieChart, Clock, Filter
} from "lucide-react";

const Products = () => {
  const [activeFilter, setActiveFilter] = useState("all");

  // Категории теперь в едином стиле Indigo
  const categories = [
    { name: "Фрукты", icon: <Apple size={20}/> },
    { name: "Кофе", icon: <Coffee size={20}/> },
    { name: "Маркет", icon: <ShoppingCart size={20}/> },
    { name: "Обед", icon: <Pizza size={20}/> },
  ];

  const purchases = [
    { title: "Супермаркет Korzinka", price: "45.00", time: "12:40", cat: "Продукты" },
    { title: "Starbucks Coffee", price: "12.50", time: "09:15", cat: "Напитки" },
    { title: "Pizzeria Bella", price: "28.00", time: "Yesterday", cat: "Еда вне дома" },
    { title: "Hozmag Store", price: "15.20", time: "Yesterday", cat: "Быт" },
  ];

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-6 md:p-10 font-sans text-slate-900">
      
      {/* 🔝 HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-800 flex items-center gap-3">
            Еда и Покупки
          </h1>
          <p className="text-indigo-600/60 font-semibold text-sm">Управление расходами в стиле Indigo</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-white/60 backdrop-blur-md p-1.5 rounded-2xl border border-indigo-100 flex gap-1">
            {['all', 'weekly', 'monthly'].map((f) => (
              <button 
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeFilter === f 
                  ? 'bg-[#3730A3] text-white shadow-lg shadow-indigo-200' // Indigo-800 style
                  : 'text-indigo-400 hover:text-indigo-600'
                }`}
              >
                {f === 'all' ? 'Все' : f === 'weekly' ? 'Неделя' : 'Месяц'}
              </button>
            ))}
          </div>
          <button className="bg-[#3730A3] text-white p-4 rounded-2xl shadow-xl shadow-indigo-100 hover:bg-[#312E81] transition-all active:scale-95">
            <Plus size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto">
        
        {/* 📊 LEFT COLUMN */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* CATEGORIES (Indigo Tint) */}
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
            {categories.map((cat, i) => (
              <div key={i} className="bg-white min-w-[160px] p-6 rounded-[32px] border border-transparent hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all cursor-pointer group">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-400 group-hover:bg-[#3730A3] group-hover:text-white transition-all mb-4">
                  {cat.icon}
                </div>
                <p className="font-bold text-[10px] uppercase tracking-widest text-indigo-300 mb-1 group-hover:text-indigo-500">{cat.name}</p>
                <p className="text-xl font-black text-slate-800 tracking-tighter">$240.50</p>
              </div>
            ))}
          </div>

          {/* RECENT PURCHASES */}
          <div className="bg-white rounded-[40px] p-8 shadow-sm border border-indigo-50/50">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black text-slate-800">Последние покупки</h3>
              <div className="flex gap-2">
                <button className="p-2.5 bg-indigo-50 text-indigo-400 rounded-xl hover:bg-indigo-100 transition-colors"><Search size={18}/></button>
                <button className="p-2.5 bg-indigo-50 text-indigo-400 rounded-xl hover:bg-indigo-100 transition-colors"><Filter size={18}/></button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {purchases.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-5 rounded-[28px] bg-slate-50/50 hover:bg-indigo-50/30 hover:shadow-md transition-all group border border-transparent hover:border-indigo-100/50">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-indigo-200 group-hover:text-indigo-600 shadow-sm transition-colors">
                      <ShoppingBag size={22} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 tracking-tight">{item.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{item.cat}</span>
                        <span className="w-1 h-1 bg-indigo-100 rounded-full" />
                        <span className="text-[10px] font-bold text-slate-300 uppercase flex items-center gap-1">
                          <Clock size={10} /> {item.time}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-slate-800">
                    <span className="font-black text-lg tracking-tighter">${item.price}</span>
                    <ArrowRight size={18} className="text-indigo-100 group-hover:text-indigo-500 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 📝 RIGHT COLUMN */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* BUDGET (Indigo-800 Style) */}
          <div className="bg-[#3730A3] rounded-[40px] p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 blur-[40px] rounded-full" />
            <div className="relative z-10">
              <PieChart className="text-indigo-200 mb-6" size={28} />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-300/80 mb-2">Бюджет месяца</p>
              <h3 className="text-3xl font-black mb-6 tracking-tighter">$1,200.00</h3>
              
              <div className="w-full h-2.5 bg-black/20 rounded-full overflow-hidden mb-4">
                <div className="h-full bg-white w-[65%] rounded-full shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
              </div>
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-indigo-200/60">
                <span>Потрачено: $780</span>
                <span>Осталось: 65%</span>
              </div>
            </div>
          </div>

          {/* CHECKLIST (Soft Indigo) */}
          <div className="bg-white rounded-[40px] p-8 border border-indigo-50 shadow-sm">
            <h3 className="text-indigo-900 font-black text-lg mb-6 flex items-center gap-2">
               Список покупок
            </h3>
            <div className="space-y-4">
              {[
                { text: "Молоко 1.5%", checked: true },
                { text: "Свежий хлеб", checked: false },
                { text: "Куриное филе", checked: false },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 group cursor-pointer">
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                    item.checked ? 'bg-[#4338CA] border-[#4338CA]' : 'border-indigo-100 bg-indigo-50/30'
                  }`}>
                    {item.checked && <Check size={14} className="text-white" strokeWidth={4} />}
                  </div>
                  <span className={`text-sm font-bold tracking-tight transition-all ${item.checked ? 'text-indigo-200 line-through' : 'text-slate-600'}`}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
            <button className="w-full mt-8 py-4 bg-indigo-50/50 rounded-2xl text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">
               + Добавить пункт
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Products;