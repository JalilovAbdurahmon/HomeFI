import React, { useRef, useEffect, useState } from "react";
import { X, ArrowDownCircle, ArrowUpCircle, Calendar } from "lucide-react";

const ModalStructure = ({
  title,
  close,
  form,
  submit,
  units = [],
  categories = [],
  searchSuggestions = [],
  productSearch = "",
  setProductSearch,
}) => {
  if (!form) return null;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form;
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const transactionType = watch("type", "expense");

  // --- BUGUNGI SANANI FORMATLASH (YYYY-MM-DD) ---
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setValue("dateOfPayment", today);
  }, [setValue]);

  const handleSelect = (item) => {
    setProductSearch(item.title);
    setValue("title", item.title || item._id, { shouldValidate: true });

    if (item.productsCategory) {
      const catId = item.productsCategory._id || item.productsCategory;
      setValue("productsCategory", catId, { shouldValidate: true });
    }

    if (item.edinisaIzmereniya) {
      const unitId = item.edinisaIzmereniya._id || item.edinisaIzmereniya;
      setValue("edinisaIzmereniya", unitId, { shouldValidate: true });
    }

    setIsOpen(false);
  };

  useEffect(() => {
    const clickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setIsOpen(false);
    };
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, []);

  const inputClass =
    "w-full p-3 rounded-xl border-2 border-gray-200 outline-none focus:border-blue-500 font-semibold transition-all placeholder:text-gray-300 bg-white text-slate-800";
  const labelClass =
    "block text-[10px] font-black text-gray-400 mb-1 ml-1 uppercase tracking-wider";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-[24px] p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black uppercase italic text-gray-800">
            {title}
          </h2>
          <button
            type="button"
            onClick={close}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Switch Section */}
        <div className="flex p-1 bg-gray-100 rounded-2xl mb-6 relative">
          <button
            type="button"
            onClick={() => setValue("type", "expense")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold transition-all ${
              transactionType === "expense"
                ? "bg-white text-red-600 shadow-sm"
                : "text-gray-500"
            }`}
          >
            <ArrowUpCircle size={18} /> Расход
          </button>
          <button
            type="button"
            onClick={() => setValue("type", "income")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold transition-all ${
              transactionType === "income"
                ? "bg-white text-green-600 shadow-sm"
                : "text-gray-500"
            }`}
          >
            <ArrowDownCircle size={18} /> Приход
          </button>
          <input type="hidden" {...register("type")} />
        </div>

        <form onSubmit={handleSubmit(submit)} className="space-y-4">
          {/* 1. MAHSULOT QIDIRUV */}
          <div className="relative" ref={dropdownRef}>
            <label className={labelClass}>Mahsulot</label>
            <input
              type="text"
              autoComplete="off"
              value={productSearch}
              onChange={(e) => {
                setProductSearch(e.target.value);
                setIsOpen(true);
              }}
              className={inputClass}
              placeholder="Mahsulotni qidiring..."
            />
            <input type="hidden" {...register("title", { required: true })} />

            {isOpen && productSearch.length > 0 && (
              <div className="absolute top-full left-0 w-full bg-white border border-gray-100 rounded-xl shadow-2xl z-[110] mt-1 max-h-48 overflow-y-auto">
                {searchSuggestions.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => handleSelect(item)}
                    className="p-3 hover:bg-blue-50 cursor-pointer flex justify-between items-center border-b last:border-0"
                  >
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-700">
                        {item.title}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {item.productsCategory?.title}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-md">
                      {item.edinisaIzmereniya?.title}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. KATEGORIYA VA BIRLIK */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Kategoriya</label>
              <select
                {...register("productsCategory", { required: true })}
                className={inputClass}
              >
                <option value="">Tanlang</option>
                {categories
                  .filter((c) => c._id !== "all")
                  .map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.title}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Birlik</label>
              <select
                {...register("edinisaIzmereniya", { required: true })}
                className={inputClass}
              >
                <option value="">Tanlang</option>
                {units.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. MIQDOR VA NARX */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Miqdori</label>
              <input
                type="number"
                step="0.01"
                {...register("quantity", { required: true })}
                className={inputClass}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className={labelClass}>Narxi (Dona)</label>
              <input
                type="number"
                {...register("priceForOne", { required: true })}
                className={inputClass}
                placeholder="0"
              />
            </div>
          </div>

          {/* 4. TO'LOV SANASI (YANGI QO'SHILDI) */}
          <div className="relative">
            <label className={labelClass}>To'lov sanasi</label>
            <div className="relative">
              <input
                type="date"
                {...register("dateOfPayment", { required: true })}
                className={`${inputClass} pr-10`}
              />
              <Calendar
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                size={18}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full py-4 mt-2 rounded-xl font-black text-white transition-all active:scale-95 uppercase italic tracking-widest shadow-lg ${
              transactionType === "expense"
                ? "bg-red-600 hover:bg-red-700 shadow-red-200"
                : "bg-green-600 hover:bg-green-700 shadow-green-200"
            }`}
          >
            {transactionType === "expense"
              ? "Сохранить Расход"
              : "Сохранить Приход"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ModalStructure;
