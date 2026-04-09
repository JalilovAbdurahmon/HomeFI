import { useState } from "react";
import { Search, Plus, Trash2, Pencil, X } from "lucide-react";

export default function ProcurementPage() {
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
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Формирование закупки</h1>
        <button
          onClick={() => {
            setShowModal(true);
            setEditingIndex(null);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={18} /> Добавить
        </button>
      </div>

      {/* SEARCH */}
      <div className="flex items-center gap-2 bg-white p-3 rounded-2xl shadow mb-6">
        <Search />
        <input
          type="text"
          placeholder="Поиск..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full outline-none"
        />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-3">Название</th>
              <th className="p-3">Дата создания</th>
              <th className="p-3">Требуемая дата</th>
              <th className="p-3">Последняя цена</th>
              <th className="p-3">Комментарий</th>
              <th className="p-3 text-right">Действия</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item, index) => (
              <tr key={index} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium">{item.name}</td>
                <td className="p-3">{item.createdAt}</td>
                <td className="p-3">{item.neededBy}</td>
                <td className="p-3">{item.lastPrice}</td>
                <td className="p-3">{item.note}</td>
                <td className="p-3 flex justify-end gap-2">
                  <button
                    onClick={() => handleEdit(index)}
                    className="p-2 rounded-lg bg-yellow-100 hover:bg-yellow-200"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(index)}
                    className="p-2 rounded-lg bg-red-100 hover:bg-red-200"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <p className="text-center p-6 text-gray-400">Ничего не найдено</p>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl w-full max-w-lg shadow-lg relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-black"
            >
              <X />
            </button>

            <h2 className="text-xl font-semibold mb-4">
              {editingIndex !== null ? "Обновить" : "Новая закупка"}
            </h2>

            <div className="grid grid-cols-1 gap-3">
              <input
                type="text"
                placeholder="Название"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="border p-3 rounded-xl focus:ring-2 focus:ring-blue-500"
              />

              <input
                type="text"
                placeholder="Дата создания"
                onFocus={(e) => (e.target.type = "date")}
                value={form.createdAt}
                onChange={(e) => setForm({ ...form, createdAt: e.target.value })}
                className="border p-3 rounded-xl focus:ring-2 focus:ring-blue-500"
              />

              <input
                type="text"
                placeholder="Требуемая дата"
                onFocus={(e) => (e.target.type = "date")}
                value={form.neededBy}
                onChange={(e) => setForm({ ...form, neededBy: e.target.value })}
                className="border p-3 rounded-xl focus:ring-2 focus:ring-blue-500"
              />

              <input
                type="number"
                placeholder="Последняя цена"
                value={form.lastPrice}
                onChange={(e) => setForm({ ...form, lastPrice: e.target.value })}
                className="border p-3 rounded-xl focus:ring-2 focus:ring-blue-500"
              />

              <textarea
                placeholder="Комментарий"
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                className="border p-3 rounded-xl focus:ring-2 focus:ring-blue-500"
              />

              <button
                onClick={handleSubmit}
                className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700"
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