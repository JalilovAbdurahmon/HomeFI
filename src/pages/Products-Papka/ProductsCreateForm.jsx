import React, { useRef, useEffect, useState } from "react";
import {
  X,
  ArrowDownCircle,
  ArrowUpCircle,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";

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
  productsData = { items: [] },
  isUpdate = false,
  // ✅ YANGI PROP: forcedType — tashqaridan type berilsa, switch ko'rinmaydi
  // va foydalanuvchi o'zgartira olmaydi. Masalan: expense page -> forcedType="expense"
  forcedType = null,
}) => {
  if (!form) return null;

  const {
    type,
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // ✅ ASOSIY FIX:
  // 1. forcedType berilgan bo'lsa — uni ishlatamiz (expense/income page)
  // 2. forcedType yo'q bo'lsa — form dagi type yoki "expense" default
  const [transactionType, setTransactionType] = useState(
    forcedType || watch("type") || "expense"
  );

  // forcedType o'zgarganda (masalan modal qayta ochilganda) sync qilamiz
  useEffect(() => {
    if (forcedType) {
      setTransactionType(forcedType);
      setValue("type", forcedType);
    }
  }, [forcedType]);

  const watchedProductId = watch("title");

  const handleTypeChange = (newType) => {
    setTransactionType(newType);
    setValue("type", newType);
  };

  useEffect(() => {
    const currentDate = watch("dateOfPayment");
    if (!currentDate) {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      setValue("dateOfPayment", `${year}-${month}-${day}`);
    }
  }, [setValue, watch]);

  const handleSelect = (item) => {
    setProductSearch(item.title);
    setValue("title", item._id || item.id, { shouldValidate: true });

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

  const getSelectedProductStock = () => {
    if (!watchedProductId || !productsData?.items) return null;

    const movements = productsData.items.filter(
      (item) => (item.title?._id || item.title) === watchedProductId
    );

    if (movements.length === 0) return null;

    return movements.reduce((acc, curr) => {
      const qty = Number(curr.quantity) || 0;
      return curr.type === "income" ? acc + qty : acc - qty;
    }, 0);
  };

  const currentStock = getSelectedProductStock();

  useEffect(() => {
    const clickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setIsOpen(false);
    };
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, []);

  const onFormSubmit = (data) => {
    const isValidId = /^[0-9a-fA-F]{24}$/.test(data.title);
    if (!isValidId) {
      return toast.error(`Mahsulot ro'yxatda topilmadi!`, {
        description: `"${productSearch}" nomi bilan saqlab bo'lmaydi. Iltimos, pastdan tanlang.`,
        duration: 4000,
        icon: "❌",
        style: {
          borderRadius: "16px",
          background: "#1e293b",
          color: "#fff",
          border: "1px solid #ef4444",
        },
      });
    }

    // ✅ transactionType (useState) — har doim ishonchli qiymat
    data.type = transactionType;

    // expense da narx yo'q — backend 0 olsin
    if (transactionType === "expense") {
      data.priceForOne = 0;
    }

    if (submit) submit(data);
  };

  const onError = () => {
    toast.error("Hamma maydonlarni to'g'ri to'ldiring!");
  };

  const inputClass =
    "w-full p-3 rounded-xl border-2 border-gray-200 outline-none focus:border-blue-500 font-semibold transition-all placeholder:text-gray-300 bg-white text-slate-800";
  const labelClass =
    "block text-[10px] font-black text-gray-400 mb-1 ml-1 uppercase tracking-wider";

  // Switch ko'rsatiladimi yoki yo'qmi:
  // - forcedType berilgan → switch ko'rinmaydi (expense/income page)
  // - isUpdate=true → switch ko'rinmaydi
  // - ikkalasi ham yo'q → switch ko'rinadi (universal modal)
  const showSwitch = !isUpdate;

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

        {/* Switch — faqat universal modalda (forcedType yo'q, isUpdate yo'q) */}
        {showSwitch && (
          <div className="flex p-1 bg-gray-100 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => handleTypeChange("expense")}
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
              onClick={() => handleTypeChange("income")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold transition-all ${
                transactionType === "income"
                  ? "bg-white text-green-600 shadow-sm"
                  : "text-gray-500"
              }`}
            >
              <ArrowDownCircle size={18} /> Приход
            </button>
          </div>
        )}

        {/* forcedType yoki isUpdate bo'lganda — tip badge ko'rsatamiz */}
        {!showSwitch && (
          <div
            className={`text-center py-2.5 mb-6 rounded-2xl font-bold text-sm ${
              transactionType === "expense"
                ? "bg-red-50 text-red-600"
                : "bg-green-50 text-green-600"
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              {transactionType === "expense" ? (
                <>
                  <ArrowUpCircle size={16} />
                  {isUpdate ? "Расходни tahrirlash" : "Расход qo'shish"}
                </>
              ) : (
                <>
                  <ArrowDownCircle size={16} />
                  {isUpdate ? "Приходни tahrirlash" : "Приход qo'shish"}
                </>
              )}
            </span>
          </div>
        )}

        <form
          onSubmit={handleSubmit(onFormSubmit, onError)}
          className="space-y-4"
        >
          {/* 1. MAHSULOT QIDIRUV */}
          <div className="relative" ref={dropdownRef}>
            <label className={labelClass}>Название</label>
            <input
              type="text"
              autoComplete="off"
              value={productSearch}
              onChange={(e) => {
                setProductSearch(e.target.value);
                setIsOpen(true);
                setValue("title", e.target.value);
              }}
              className={inputClass}
              placeholder="Выберите продукты..."
            />
            <input type="hidden" {...register("title", { required: true })} />

            {isOpen &&
              productSearch.length > 0 &&
              searchSuggestions.length > 0 && (
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

          {/* CRITICAL STOCK OGOHLANTIRISH */}
          {watchedProductId &&
            currentStock !== null &&
            currentStock <= 5 &&
            currentStock >= 0 && (
              <div className="animate-in zoom-in-95 duration-300">
                <div className="p-4 bg-[#1e293b] rounded-[22px] border border-red-500/30 shadow-xl relative overflow-hidden">
                  <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-red-500/10 rounded-full blur-xl" />
                  <div className="relative z-10 flex justify-between items-center">
                    <div>
                      <p className="text-[9px] font-black text-red-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                        <AlertTriangle size={10} /> Critical Stock
                      </p>
                      <h4 className="text-white font-bold text-sm italic">
                        {productSearch}
                      </h4>
                      <p className="text-[9px] text-slate-400 mt-1">
                        Осталось очень мало!
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-white italic">
                        {currentStock}
                      </span>
                      <p className="text-[9px] text-slate-500 font-bold uppercase">
                        шт
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500 shadow-[0_0_8px_#ef4444]"
                      style={{ width: `${(currentStock / 5) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

          {/* 2. KATEGORIYA — to'liq kenglik */}
          <div className="cursor-not-allowed">
            <label className={labelClass}>Категория</label>
            <select
              {...register("productsCategory", { required: true })}
              className={`${inputClass} pointer-events-none bg-gray-100`}
              tabIndex={-1}
            >
              <option value=""></option>
              {categories
                .filter((c) => c._id !== "all")
                .map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.title}
                  </option>
                ))}
            </select>
          </div>

          {/* 3. BIRLIK + MIQDOR (+ NARX income da) — bitta row */}
          <div
            className={`grid gap-3 ${
              transactionType === "income" ? "grid-cols-3" : "grid-cols-2"
            }`}
          >
            <div className="cursor-not-allowed">
              <label className={labelClass}>Ед.измерения</label>
              <select
                {...register("edinisaIzmereniya", { required: true })}
                className={`${inputClass} pointer-events-none bg-gray-100`}
                tabIndex={-1}
              >
                <option value=""></option>
                {units.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Количество</label>
              <input
                type="number"
                step="0.01"
                {...register("quantity", { required: true })}
                className={inputClass}
                placeholder="0.00"
              />
            </div>

            {transactionType === "income" && (
              <div>
                <label className={labelClass}>Цена (за ед.)</label>
                <input
                  type="number"
                  {...register("priceForOne", {
                    required: transactionType === "income",
                  })}
                  className={inputClass}
                  placeholder="0"
                />
              </div>
            )}
          </div>

          {/* 4. TO'LOV SANASI */}
          <div className="relative">
            <label className={labelClass}>
              {type === "income" ? "Дата прихода" : "Дата расхода"}
            </label>
            <div className="relative">
              <input
                type="date"
                {...register("dateOfPayment", { required: true })}
                className={`${inputClass} pr-10 [&::-webkit-calendar-picker-indicator]:cursor-pointer`}
              />
              <Calendar
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                size={18}
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className={`w-full py-4 mt-2 rounded-xl font-black text-white transition-all active:scale-95 uppercase italic tracking-widest shadow-lg ${
              transactionType === "expense"
                ? "bg-red-600 hover:bg-red-700 shadow-red-200"
                : "bg-green-600 hover:bg-green-700 shadow-green-200"
            }`}
          >
            {transactionType === "expense"
              ? isUpdate
                ? "Расходни yangilash"
                : "Сохранить Расход"
              : isUpdate
              ? "Приходни yangilash"
              : "Сохранить Приход"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ModalStructure;
