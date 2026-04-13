import React, { useMemo, useState } from "react";
import {
  Search,
  ArrowLeft,
  FileText,
  Zap,
  Droplets,
  Waves,
  Flame,
  Trash2,
  Receipt,
  Landmark,
  Home,
  Edit3,
  X,
  Layers,
  Wallet,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import instance from "../../utils/axios";

const CommunalAll = () => {
  const { type } = useParams();
  const decodedType = type ? decodeURIComponent(type) : null; // URL'dan kelgan title (masalan: Svet)
  const nav = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [page, setPage] = useState(1);
  const limit = 10;

  const { register, handleSubmit, reset, setValue } = useForm();

  const config = {
    Электроэнергия: {
      icon: <Zap size={20} />,
      color: "#FBBF24",
      bg: "#FEF3C7",
    },
    "Горячая вода": {
      icon: <Droplets size={20} />,
      color: "#F97316",
      bg: "#FFEDD5",
    },
    "Холодная вода": {
      icon: <Waves size={20} />,
      color: "#3B82F6",
      bg: "#DBEAFE",
    },
    Газ: { icon: <Flame size={20} />, color: "#F43F5E", bg: "#FFE4E6" },
    Мусор: { icon: <Trash2 size={20} />, color: "#10B981", bg: "#D1FAE5" },
    "Коммунальный налог": {
      icon: <Receipt size={20} />,
      color: "#6366F1",
      bg: "#E0E7FF",
    },
    "Земельный налог": {
      icon: <Landmark size={20} />,
      color: "#64748B",
      bg: "#F1F5F9",
    },
    "Налог на имущество": {
      icon: <Home size={20} />,
      color: "#8B5CF6",
      bg: "#EDE9FE",
    },
  };

  // 1. DATA FETCHING (URL'dagi type o'zgarsa qayta ishlaydi)
  const { data: serverResponse, isLoading } = useQuery({
    queryKey: ["getCommunal", page, decodedType],
    queryFn: async () => {
      const url = `/communal?page=${page}&limit=${limit}${
        decodedType ? `&title=${encodeURIComponent(decodedType)}` : ""
      }`;
      const res = await instance.get(url);
      return res.data;
    },
    keepPreviousData: true,
  });

  const { data: allStatsResponse } = useQuery({
    queryKey: ["getCommunalAllStats", decodedType],
    queryFn: async () => {
      const url = `/communal?limit=10000${
        decodedType ? `&title=${encodeURIComponent(decodedType)}` : ""
      }`;
      const res = await instance.get(url);
      return res.data;
    },
  });

  const allData = serverResponse?.data || [];

  // 2. FILTRLASH MANTIQI (ASOSIY JOYI SHU)
  const filteredData = useMemo(() => {
    if (!allData || !Array.isArray(allData)) return [];
    return allData.filter((item) => {
      const itemTitle = item.titleCommunal?.title || item.titleCommunal || "";

      // Agar URL'da type bo'lsa, faqat o'shani chiqaradi, bo'lmasa qidiruv bo'yicha ishlaydi
      const matchesType = decodedType
        ? itemTitle.toLowerCase() === decodedType.toLowerCase()
        : true;
      const matchesSearch = itemTitle
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      return matchesType && matchesSearch;
    });
  }, [allData, searchTerm, decodedType]);

  const pageSum = useMemo(() => {
    return filteredData.reduce((a, c) => a + Number(c.sum), 0);
  }, [filteredData]);

  const totalGlobalSum = useMemo(() => {
    const allItems = allStatsResponse?.data || [];
    return allItems.reduce((a, c) => a + Number(c.sum), 0);
  }, [allStatsResponse]);

  const totalCheckCount =
    allStatsResponse?.totalItems || allStatsResponse?.data?.length || 0;

  // MUTATIONS
  const updateMutation = useMutation({
    mutationFn: async (updatedData) => {
      return await instance.put(`/communal/${editingItem._id}`, updatedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["getCommunal"]);
      setEditingItem(null);
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      if (window.confirm("Вы уверены, что хотите удалить этот чек?")) {
        return await instance.delete(`/communal/${id}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["getCommunal"]);
    },
  });

  const handleEdit = (item) => {
    setEditingItem(item);
    const categoryId = item.titleCommunal?._id || item.titleCommunal;
    setValue("titleCommunal", categoryId);
    setValue("sum", item.sum);
    setValue("desc", item.desc || "");
    if (item.dateOfPayment)
      setValue("dateOfPayment", item.dateOfPayment.split("T")[0]);
  };

  const onUpdateSubmit = (data) => {
    updateMutation.mutate({ ...data, sum: Number(data.sum) });
  };

  if (isLoading)
    return (
      <div className="p-20 text-center font-black text-indigo-600 text-2xl italic animate-pulse">
        Загрузка данных...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-12 font-sans relative text-slate-900">
      {/* MODAL EDIT */}
      {editingItem && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            onClick={() => setEditingItem(null)}
          ></div>
          <div className="relative bg-white w-full max-w-lg rounded-[40px] shadow-2xl p-10">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-slate-800">
                Изменить чек
              </h2>
              <button
                onClick={() => setEditingItem(null)}
                className="p-2 hover:bg-slate-100 rounded-full"
              >
                <X size={24} className="text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit(onUpdateSubmit)} className="space-y-5">
              <select
                {...register("titleCommunal")}
                className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[24px] outline-none font-bold"
              >
                {Array.from(
                  new Map(
                    allData.map((i) => [
                      i.titleCommunal?._id || i.titleCommunal,
                      i.titleCommunal?.title || i.titleCommunal,
                    ])
                  ).entries()
                ).map(([id, title]) => (
                  <option key={id} value={id}>
                    {title}
                  </option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-4">
                <input
                  {...register("dateOfPayment")}
                  type="date"
                  className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[24px] outline-none font-bold"
                />
                <input
                  {...register("sum")}
                  type="number"
                  className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[24px] outline-none font-bold"
                />
              </div>
              <textarea
                {...register("desc")}
                placeholder="Примечание"
                className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[24px] outline-none font-bold min-h-[100px] resize-none"
              />
              <button className="w-full bg-indigo-600 text-white py-5 rounded-[24px] font-black text-lg shadow-lg hover:bg-indigo-700 transition-all active:scale-95">
                Сохранить изменения
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => nav("/communal")}
          className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors mb-6 font-bold text-sm uppercase tracking-widest group"
        >
          <ArrowLeft
            size={18}
            className="group-hover:-translate-x-1 transition-transform"
          />{" "}
          Назад
        </button>

        <div className="flex flex-col lg:flex-row justify-between items-start gap-8 mb-10">
          <div className="space-y-6 w-full lg:max-w-md">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              {decodedType ? decodedType : "Все транзакции"}
            </h1>
            <div className="relative">
              <Search
                className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Поиск по услугам..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-[22px] focus:outline-none shadow-sm font-bold text-slate-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full lg:w-auto">
            <div className="md:col-span-2 bg-indigo-600 p-6 px-8 rounded-[32px] shadow-xl text-white flex items-center gap-6">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center border border-white/10">
                <Wallet size={30} />
              </div>
              <div>
                <p className="text-[11px] font-black text-indigo-100 uppercase tracking-widest">
                  Итоговая сумма
                </p>
                <p className="text-3xl font-black">
                  {totalGlobalSum.toLocaleString()}{" "}
                  <span className="text-sm opacity-70">UZS</span>
                </p>
              </div>
            </div>
            <div className="bg-white p-5 px-6 rounded-[28px] border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center">
                <Receipt size={22} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  На этой странице
                </p>
                <p className="text-xl font-black">
                  {pageSum.toLocaleString()}{" "}
                  <span className="text-[10px] text-slate-400">UZS</span>
                </p>
              </div>
            </div>
            <div className="bg-white p-5 px-6 rounded-[28px] border-2 border-amber-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center">
                <Layers size={22} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Кол-во чеков
                </p>
                <p className="text-xl font-black">
                  {totalCheckCount}{" "}
                  <span className="text-amber-500 text-[10px]">шт</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden mb-12">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-left">
                <th className="px-8 py-6 text-[11px] font-black uppercase text-slate-400">
                  Услуга
                </th>
                <th className="px-8 py-6 text-[11px] font-black uppercase text-slate-400">
                  Дата
                </th>
                <th className="px-8 py-6 text-[11px] font-black uppercase text-slate-400">
                  Примечание
                </th>
                <th className="px-8 py-6 text-[11px] font-black uppercase text-slate-400 text-right">
                  Сumma
                </th>
                <th className="px-8 py-6 text-[11px] font-black uppercase text-slate-400 text-center">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredData.map((item) => {
                const serviceName =
                  item?.titleCommunal?.title || item.titleCommunal || "Другое";
                const style = config[serviceName] || {
                  icon: <FileText size={22} />,
                  color: "#94a3b8",
                  bg: "#f1f5f9",
                };
                return (
                  <tr
                    key={item._id}
                    className="hover:bg-slate-50/80 transition-all"
                  >
                    <td className="px-8 py-6 flex items-center gap-4">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center"
                        style={{
                          backgroundColor: style.bg,
                          color: style.color,
                        }}
                      >
                        {style.icon}
                      </div>
                      <span className="font-bold text-slate-800">
                        {serviceName}
                      </span>
                    </td>
                    <td className="px-8 py-6 font-bold text-slate-500">
                      {item?.dateOfPayment
                        ? new Date(item.dateOfPayment).toLocaleDateString(
                            "ru-RU"
                          )
                        : "—"}
                    </td>
                    <td className="px-8 py-6 text-slate-400 italic truncate max-w-[200px]">
                      {item?.desc || "—"}
                    </td>
                    <td className="px-8 py-6 text-right font-black text-slate-900">
                      {Number(item.sum).toLocaleString()} UZS
                    </td>
                    <td className="px-8 py-6 flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 bg-amber-50 text-amber-400 rounded-lg hover:bg-amber-400 hover:text-white transition-all"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(item._id)}
                        className="p-2.5 rounded-2xl
                        bg-[#fff1f2] text-[#f43f5e]
                        hover:bg-[#f43f5e] hover:text-white
                        active:scale-90 transition-all duration-300 ease-in-out"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* <div className="flex justify-center pb-20">
          <div className="flex gap-1 bg-white p-2 rounded-2xl shadow-sm">
            {Array.from(
              { length: serverResponse?.totalPages || 1 },
              (_, i) => i + 1
            ).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`w-10 h-10 rounded-xl font-black transition-all ${
                  page === n
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "text-slate-400 hover:bg-slate-50"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div> */}

        {/* 🚀 ENHANCED NUMERIC PAGINATION SECTION */}
        <div className="mt-auto pt-10 pb-20">
          <div className="flex flex-col items-center gap-6">
            {/* 1. Status Info - Qaysi cheklar ko'rinayotganini bildiradi */}
            <div className="flex items-center gap-2 px-6 py-2 bg-slate-100/50 rounded-full border border-slate-200/50">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                Показано {(page - 1) * limit + 1} -{" "}
                {Math.min(page * limit, serverResponse?.totalItems)} из{" "}
                {serverResponse?.totalItems} чеков
              </p>
            </div>

            {/* 2. Numeric Buttons - Raqamli tugmalar */}
            <div className="flex items-center gap-3">
              {/* Chapga o'tish kichkina belgisi */}
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="p-3 text-slate-400 hover:text-indigo-600 disabled:opacity-20 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="flex items-center gap-2 bg-white p-2 rounded-[24px] shadow-sm border border-slate-100">
                {Array.from(
                  { length: serverResponse?.totalPages || 1 },
                  (_, i) => i + 1
                ).map((pageNumber) => (
                  <button
                    key={pageNumber}
                    onClick={() => setPage(pageNumber)}
                    className={`
              relative w-12 h-12 rounded-2xl font-black text-sm transition-all duration-300 active:scale-90
              ${
                page === pageNumber
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                  : "text-slate-400 hover:bg-slate-50 hover:text-indigo-600"
              }
            `}
                  >
                    {pageNumber}
                    {/* Aktiv sahifa ostida nuqta */}
                    {page === pageNumber && (
                      <span className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"></span>
                    )}
                  </button>
                ))}
              </div>

              {/* O'ngga o'tish kichkina belgisi */}
              <button
                disabled={page >= (serverResponse?.totalPages || 1)}
                onClick={() => setPage((p) => p + 1)}
                className="p-3 text-slate-400 hover:text-indigo-600 disabled:opacity-20 transition-colors rotate-180"
              >
                <ArrowLeft size={20} />
              </button>
            </div>

            {/* 3. Quick Jump Helper */}
            <p className="text-[10px] font-bold text-slate-400 italic">
              Нажмите на номер, чтобы быстро перейти к нужной странице
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CommunalAll;
