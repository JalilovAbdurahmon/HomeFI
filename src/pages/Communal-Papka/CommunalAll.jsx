import React, { useMemo, useState, useEffect } from "react";
import {
  Search,
  Filter,
  ArrowLeft,
  Calendar,
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
  Trash,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import instance from "../../utils/axios";

const CommunalAll = () => {
  const nav = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingItem, setEditingItem] = useState(null);

  const { register, handleSubmit, reset, setValue } = useForm();

  // Sahifa yuklanganda tepaga chiqarish
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const config = {
    Электроэнергия: {
      icon: <Zap size={20} />,
      color: "#FBBF24",
      bg: "#FEF3C7",
    },
    "Горячая Вода": {
      icon: <Droplets size={20} />,
      color: "#F97316",
      bg: "#FFEDD5",
    },
    "Холодная Вода": {
      icon: <Waves size={20} />,
      color: "#3B82F6",
      bg: "#DBEAFE",
    },
    Газ: { icon: <Flame size={20} />, color: "#F43F5E", bg: "#FFE4E6" },
    Мусор: { icon: <Trash2 size={20} />, color: "#10B981", bg: "#D1FAE5" },
    "Коммунальный Налог": {
      icon: <Receipt size={20} />,
      color: "#6366F1",
      bg: "#E0E7FF",
    },
    "Земельный Налог": {
      icon: <Landmark size={20} />,
      color: "#64748B",
      bg: "#F1F5F9",
    },
    "Налог на Имущество": {
      icon: <Home size={20} />,
      color: "#8B5CF6",
      bg: "#EDE9FE",
    },
  };

  // 1. DATA FETCHING
  const { data: allData = [], isLoading } = useQuery({
    queryKey: ["getCommunal"],
    queryFn: async () => {
      const res = await instance.get("/communal");
      return res.data;
    },
  });

  // 2. UPDATE MUTATION
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

  // 3. DELETE MUTATION
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

  // EDIT MODALNI OCHISH
  const handleEdit = (item) => {
    setEditingItem(item);
    setValue("title", item.title);
    setValue("sum", item.sum);
    setValue("desc", item.desc); // Backendda desc bo'lgani uchun
    setValue("createdAt", item.createdAt.split("T")[0]);
  };

  const onUpdateSubmit = (data) => {
    updateMutation.mutate({ ...data, sum: Number(data.sum) });
  };

  // SEARCH VA SORT
  const filteredData = useMemo(() => {
    return allData
      .filter((item) =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [allData, searchTerm]);

  if (isLoading)
    return (
      <div className="p-20 text-center font-black text-indigo-600">
        Загрузка...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-12 font-sans relative">
      {/* EDIT MODAL */}
      {editingItem && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            onClick={() => setEditingItem(null)}
          ></div>
          <div className="relative bg-white w-full max-w-lg rounded-[40px] shadow-2xl p-10">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                Изменить чек
              </h2>
              <button
                onClick={() => setEditingItem(null)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={24} className="text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onUpdateSubmit)} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase text-slate-400 ml-4 tracking-widest">
                  Услуга
                </label>
                <select
                  {...register("title")}
                  className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[24px] outline-none font-bold text-slate-700"
                >
                  {Object.keys(config).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase text-slate-400 ml-4 tracking-widest">
                    Дата
                  </label>
                  <input
                    {...register("createdAt")}
                    type="date"
                    className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[24px] outline-none font-bold text-slate-700"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase text-slate-400 ml-4 tracking-widest">
                    Сумма
                  </label>
                  <input
                    {...register("sum")}
                    type="number"
                    className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[24px] outline-none font-bold text-slate-700"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase text-slate-400 ml-4 tracking-widest">
                  Примечание
                </label>
                <textarea
                  {...register("desc")}
                  placeholder="Описание..."
                  className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[24px] h-28 resize-none outline-none font-medium"
                />
              </div>

              <button className="w-full bg-indigo-600 text-white py-5 rounded-[24px] font-black text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 mt-4 active:scale-95">
                {updateMutation.isPending ? "Сохранение..." : "Обновить данные"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-10">
        <button
          onClick={() => nav(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors mb-6 font-bold text-sm uppercase tracking-widest group"
        >
          <ArrowLeft
            size={18}
            className="group-hover:-translate-x-1 transition-transform"
          />{" "}
          Назад
        </button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
              Все транзакции
            </h1>
            <p className="text-slate-500 font-medium text-lg">
              Полный список ваших коммунальных платежей
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Поиск по услугам..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-[22px] focus:outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-sm"
              />
            </div>
            <button className="p-4 bg-white border border-slate-100 rounded-[22px] text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
              <Filter size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="max-w-7xl mx-auto bg-white rounded-[40px] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-6 text-left text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Услуга
                </th>
                <th className="px-8 py-6 text-left text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Дата
                </th>
                <th className="px-8 py-6 text-left text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Примечание
                </th>
                <th className="px-8 py-6 text-right text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Сумма
                </th>
                <th className="px-8 py-6 text-center text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredData.map((item) => {
                const style = config[item.title] || {
                  icon: <FileText />,
                  color: "#94a3b8",
                  bg: "#f1f5f9",
                };
                return (
                  <tr
                    key={item._id}
                    className="group hover:bg-slate-50/80 transition-all duration-300"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm"
                          style={{
                            backgroundColor: style.bg,
                            color: style.color,
                          }}
                        >
                          {style.icon}
                        </div>
                        <span className="font-bold text-slate-800 text-lg tracking-tight">
                          {item.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 font-bold text-slate-500">
                      {new Date(item.createdAt).toLocaleDateString("ru-RU", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-slate-400 font-medium italic max-w-[200px] block truncate">
                        {item.desc || "—"}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex flex-col">
                        <span className="text-xl font-black text-slate-900">
                          {Number(item.sum).toLocaleString()}
                        </span>
                        <span className="text-[10px] font-black text-slate-400 uppercase">
                          UZS
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-center gap-3">
                        {/* TAHRIRLASH TUGMASI (AMBER) */}
                        <button
                          onClick={() => handleEdit(item)}
                          className="group p-3 rounded-[18px] bg-[#FFF8E6] text-[#FFB000] hover:bg-[#FFB000] hover:text-white hover:shadow-xl hover:shadow-amber-200/50 transition-all duration-300 active:scale-90"
                          title="Изменить"
                        >
                          <Edit3
                            size={20}
                            className="group-hover:rotate-[-12deg] transition-transform duration-300"
                          />
                        </button>

                        {/* O'CHIRISH TUGMASI (ROSE) */}
                        <button
                          onClick={() => deleteMutation.mutate(item._id)}
                          className="group p-3 rounded-[18px] bg-[#FFF0F3] text-[#FF4D71] hover:bg-[#FF4D71] hover:text-white hover:shadow-xl hover:shadow-rose-200/50 transition-all duration-300 active:scale-90"
                          title="Удалить"
                        >
                          <Trash2
                            size={20}
                            className="group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300"
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
          <span className="text-slate-500 font-bold uppercase text-xs tracking-widest">
            Записей: {filteredData.length}
          </span>
          <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm">
            <span className="text-slate-400 font-bold uppercase text-xs tracking-widest">
              Итого:
            </span>
            <span className="text-2xl font-black text-indigo-600">
              {filteredData
                .reduce((acc, curr) => acc + Number(curr.sum), 0)
                .toLocaleString()}{" "}
              <small className="text-xs">сум</small>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunalAll;
