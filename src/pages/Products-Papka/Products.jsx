import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  X,
  Apple,
  Coffee,
  Pizza,
  ShoppingCart,
  ShoppingBag,
  Clock,
  ChevronRight,
} from "lucide-react";

const Products = () => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  // React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  // Avtomatik hisoblash mantiqi (Quantity * Price)
  const qty = watch("quantity");
  const price = watch("priceForOne");

  React.useEffect(() => {
    setValue("totalSum", (qty || 0) * (price || 0));
  }, [qty, price, setValue]);

  // React Query Mutation
  const mutation = useMutation({
    mutationFn: async (newCheck) => {
      console.log("Yuborildi:", newCheck);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["products"]);
      setOpen(false);
      reset();
    },
  });

  const onSubmit = (data) => mutation.mutate(data);

  const categories = [
    { name: "Фрукты", icon: <Apple />, color: "bg-[#10b981]" }, // HEX qilindi
    { name: "Кофе", icon: <Coffee />, color: "bg-[#f97316]" }, // HEX qilindi
    { name: "Маркет", icon: <ShoppingCart />, color: "bg-[#3b82f6]" }, // HEX qilindi
    { name: "Обед", icon: <Pizza />, color: "bg-[#f43f5e]" }, // HEX qilindi
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans text-gray-900">
      {/* HEADER */}
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-black text-gray-800 tracking-tight">
            Еда и Покупки
          </h1>
          <p className="text-gray-500 font-medium">Barcha harajatlar hisobi</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
        >
          <Plus size={20} /> Добавить
        </button>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT SIDE */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm"
              >
                <div
                  className={`${cat.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-inherit/20`}
                >
                  {cat.icon}
                </div>
                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">
                  {cat.name}
                </p>
                <p className="text-2xl font-black text-gray-800">
                  240 000 <small className="text-xs">UZS</small>
                </p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-[35px] p-8 shadow-sm border border-gray-100">
            <h3 className="text-xl font-black text-gray-800 mb-6">
              Последние покупки
            </h3>
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="flex justify-between items-center p-5 bg-gray-50/50 rounded-[24px] hover:bg-white border border-transparent hover:border-gray-100 transition-all group"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-indigo-500 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <ShoppingBag size={22} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-lg">
                        Korzinka Market
                      </p>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock size={12} /> 14:20
                      </p>
                    </div>
                  </div>
                  <p className="font-black text-xl text-gray-800 tracking-tight">
                    45 000{" "}
                    <small className="text-[10px] text-gray-400">UZS</small>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE (Budget Card) */}
        <div className="bg-[#1e293b] text-white p-10 rounded-[45px] h-fit top-6 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 blur-[80px] rounded-full" />
          <p className="text-[#94a3b8] text-[10px] font-black uppercase tracking-widest mb-4">
            Balans
          </p>
          <h2 className="text-5xl font-black mb-10 tracking-tighter italic text-white">
            1.200.000
          </h2>

          <div className="space-y-4">
            <div className="flex justify-between text-xs font-bold text-[#cbd5e1]">
              <span>Траты</span>
              <span>65%</span>
            </div>
            <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
              <div className="w-[65%] h-full bg-indigo-500 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* MODAL - 6 TA INPUT BILAN */}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#0f172a]/60 backdrop-blur-md"
            onClick={() => setOpen(false)}
          />

          <div className="relative bg-white w-full max-w-xl rounded-[40px] shadow-2xl p-10 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-gray-800">Новый чек</h2>
              <button
                onClick={() => setOpen(false)}
                className="p-2 bg-gray-100 rounded-full hover:bg-rose-50 hover:text-rose-500 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                {/* 1. DATA */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase ml-2 tracking-widest">
                    Дата
                  </label>
                  <div className="relative group">
                    <input
                      type="text" // 1. Avval text bo'lib turadi (placeholder ko'rinishi uchun)
                      placeholder="Выберите дату"
                      onFocus={(e) => (e.target.type = "date")} // 2. Bosilganda date'ga aylanadi
                      onBlur={(e) =>
                        !e.target.value && (e.target.type = "text")
                      } // 3. Bo'sh bo'lsa yana text bo'ladi
                      {...register("dateOfPayment", { required: true })}
                      className="w-full p-4 rounded-2xl bg-gray-50 border-2 border-gray-100 text-gray-800 font-bold outline-none 
                 focus:border-indigo-500 transition-all 
                 [&::-webkit-calendar-picker-indicator]:cursor-pointer 
                 [&::-webkit-calendar-picker-indicator]:p-1
                 [&::-webkit-calendar-picker-indicator]:hover:opacity-70"
                    />
                  </div>
                </div>

                {/* 2. TITLE */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase ml-2 tracking-widest">
                    Название
                  </label>
                  <input
                    type="text"
                    placeholder="Наименование"
                    {...register("title", { required: true })}
                    className="p-4 rounded-2xl bg-gray-50 border-2 border-gray-100 text-gray-800 font-bold outline-none focus:border-indigo-500 transition-all"
                  />
                </div>

                {/* 3. QUANTITY */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase ml-2 tracking-widest">
                    Кол-во
                  </label>
                  <input
                    type="number"
                    placeholder="1"
                    {...register("quantity", { required: true })}
                    className="p-4 rounded-2xl bg-gray-50 border-2 border-gray-100 text-gray-800 font-bold outline-none focus:border-indigo-500 transition-all"
                  />
                </div>

                {/* 4. PRICE FOR ONE */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase ml-2 tracking-widest">
                    Цена (1шт)
                  </label>
                  <input
                    type="number"
                    placeholder="5000"
                    {...register("priceForOne", { required: true })}
                    className="p-4 rounded-2xl bg-gray-50 border-2 border-gray-100 text-gray-800 font-bold outline-none focus:outline-none focus:ring-0 focus:border-gray-100"
                  />
                </div>

                {/* 5. TOTAL SUM (Automatic) */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase ml-2 tracking-widest">
                    Итого
                  </label>
                  <input
                    type="number"
                    readOnly
                    {...register("totalSum")}
                    className="p-4 rounded-2xl cursor-not-allowed bg-gray-100 border-2 border-gray-100 text-indigo-600 font-black outline-none"
                  />
                </div>

                {/* 6. UNIT (Birlik) */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase ml-2 tracking-widest">
                    Ед. изм.
                  </label>
                  <select
                    {...register("unit")}
                    className="p-4 rounded-2xl bg-gray-50 border-2 border-gray-100 text-gray-800 font-bold outline-none focus:border-indigo-500 transition-all appearance-none"
                  >
                    <option value="шт">шт (dona)</option>
                    <option value="кг">кг (kg)</option>
                    <option value="л">л (litr)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={mutation.isPending}
                className="w-full bg-indigo-600 text-white py-5 rounded-[24px] font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
              >
                {mutation.isPending ? "Сохранение..." : "Сохранить транзакцию"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
