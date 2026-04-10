import { useState } from "react";
import { Search, Plus, Trash2, Pencil, X, Calendar } from "lucide-react";

export default function FormirovaniyaZakupa() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    createdAt: "",
    neededBy: "",
    lastPrice: "",
    note: "",
  });
  const [editingIndex, setEditingIndex] = useState(null);

  const handleSubmit = () => {
    if (!form.name) return;
    if (editingIndex !== null) {
      const updated = [...items];
      updated[editingIndex] = form;
      setItems(updated);
      setEditingIndex(null);
    } else {
      setItems([...items, form]);
    }
    setForm({ name: "", createdAt: "", neededBy: "", lastPrice: "", note: "" });
    setShowModal(false);
  };

  const handleDelete = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleEdit = (index) => {
    setForm(items[index]);
    setEditingIndex(index);
    setShowModal(true);
  };

  const filtered = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 md:p-10 bg-[#F8FAFC] min-h-screen font-sans">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Формирование закупки
          </h1>
          <p className="text-slate-500 font-medium">
            Barcha xaridlarni bir joyda boshqaring
          </p>
        </div>
        <button
          onClick={() => {
            setShowModal(true);
            setEditingIndex(null);
            setForm({
              name: "",
              createdAt: "",
              neededBy: "",
              lastPrice: "",
              note: "",
            });
          }}
          className="flex items-center gap-2 bg-[#4F5BD5] text-white px-6 py-3 rounded-2xl font-bold hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-200"
        >
          <Plus size={20} /> Добавить
        </button>
      </div>

      {/* SEARCH */}
      <div className="flex items-center gap-3 bg-white p-4 rounded-[24px] shadow-sm border border-slate-100 mb-8 max-w-2xl">
        <Search className="text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Поиск по названию..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full outline-none bg-transparent text-slate-700 font-medium"
        />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 text-slate-400 uppercase text-[11px] font-bold tracking-widest">
              <th className="p-5 border-b border-slate-50">Название</th>
              <th className="p-5 border-b border-slate-50">Дата создания</th>
              <th className="p-5 border-b border-slate-50">Требуемая дата</th>
              <th className="p-5 border-b border-slate-50">Последняя цена</th>
              <th className="p-5 border-b border-slate-50">Комментарий</th>
              <th className="p-5 border-b border-slate-50 text-right">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="text-slate-700">
            {filtered.map((item, index) => (
              <tr
                key={index}
                className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
              >
                <td className="p-5 font-bold text-slate-800">{item.name}</td>
                <td className="p-5 text-sm">{item.createdAt}</td>
                <td className="p-5 text-sm font-semibold text-indigo-600">
                  {item.neededBy}
                </td>
                <td className="p-5 font-bold">
                  {item.lastPrice} <small className="text-slate-400">сум</small>
                </td>
                <td className="p-5 text-sm text-slate-500 max-w-[200px] truncate">
                  {item.note}
                </td>
                <td className="p-5 flex justify-end gap-3">
                  <button
                    onClick={() => handleEdit(index)}
                    className="p-2.5 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 transition-all"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(index)}
                    className="p-2.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-20 text-slate-400 font-medium">
            Ничего не найдено
          </div>
        )}
      </div>

      {/* 🟢 MODAL (OYNA) - BLUR VA CHIROYLI DIZAYN */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Orqa fon (Xira/Blur) */}
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setShowModal(false)}
          ></div>

          {/* Modal Kontenti */}
          <div className="relative bg-white w-full max-w-lg rounded-[32px] shadow-2xl p-8 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-slate-800">
                {editingIndex !== null ? "Обновить закупку" : "Новая закупka"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Название"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
              />

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Дата создания"
                  onFocus={(e) => (e.target.type = "date")}
                  onBlur={(e) => !e.target.value && (e.target.type = "text")}
                  value={form.createdAt}
                  onChange={(e) =>
                    setForm({ ...form, createdAt: e.target.value })
                  }
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer font-medium"
                />
                <input
                  type="text"
                  placeholder="Требуемая дата"
                  onFocus={(e) => (e.target.type = "date")}
                  onBlur={(e) => !e.target.value && (e.target.type = "text")}
                  value={form.neededBy}
                  onChange={(e) =>
                    setForm({ ...form, neededBy: e.target.value })
                  }
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all cursor-pointer font-medium"
                />
              </div>

              <input
                type="number"
                placeholder="Последняя цена"
                value={form.lastPrice}
                onChange={(e) =>
                  setForm({ ...form, lastPrice: e.target.value })
                }
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
              />

              <textarea
                placeholder="Комментарий"
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all h-28 resize-none font-medium"
              />

              <button
                onClick={handleSubmit}
                className="w-full bg-[#4F5BD5] text-white py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 mt-4 active:scale-[0.98]"
              >
                {editingIndex !== null ? "Сохранить изменения" : "Сохранить"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
