import React from "react";

const Home = () => {
  return (
    <div className="p-6 bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 min-h-screen font-sans">

      {/* TOP GREETING */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Hello, Jalilov 👋</h1>
        <p className="text-gray-500 mt-1">Here’s a summary of your finance</p>
      </div>

      {/* BALANCE CARD */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white p-6 rounded-3xl shadow-2xl mb-8 transform transition hover:scale-105">
        <p className="text-sm font-semibold opacity-90">Total Balance</p>
        <h2 className="text-4xl font-extrabold mt-2">13,200,000 so'm</h2>

        <div className="flex gap-3 mt-5">
          <button className="bg-white text-purple-600 px-6 py-2 rounded-xl font-semibold shadow-lg hover:scale-105 transition-transform">
            + Add Income
          </button>
          <button className="bg-pink-600 px-6 py-2 rounded-xl font-semibold shadow-lg hover:bg-pink-700 transition-colors">
            + Add Expense
          </button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {[
          { title: "Income", amount: "+6,500,000", color: "text-emerald-600" },
          { title: "Expenses", amount: "-3,200,000", color: "text-red-500" },
          { title: "Investments", amount: "4,100,000", color: "text-indigo-500" },
          { title: "Savings", amount: "2,500,000", color: "text-yellow-500" },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-transform transform hover:-translate-y-1"
          >
            <p className="text-gray-400 text-sm">{item.title}</p>
            <h3 className={`text-2xl font-bold mt-2 ${item.color}`}>{item.amount}</h3>
          </div>
        ))}
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SPENDING OVERVIEW */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-md hover:shadow-xl transition-transform">
          <h2 className="text-lg font-bold mb-4 text-gray-900">Spending Overview</h2>
          <div className="h-60 flex items-center justify-center text-gray-400 border-2 border-dashed rounded-2xl">
            📊 Chart Placeholder
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="bg-white p-6 rounded-3xl shadow-md hover:shadow-xl transition-transform">
          <h2 className="text-lg font-bold mb-4 text-gray-900">Quick Actions</h2>
          <div className="flex flex-col gap-3">
            <button className="bg-emerald-500 text-white py-3 rounded-xl shadow-md hover:bg-emerald-600 transition-colors">
              ➕ Add Transaction
            </button>
            <button className="bg-indigo-100 py-3 rounded-xl shadow-md hover:bg-indigo-200 transition-colors">
              📊 View Reports
            </button>
            <button className="bg-orange-100 py-3 rounded-xl shadow-md hover:bg-orange-200 transition-colors">
              💳 Manage Cards
            </button>
          </div>
        </div>
      </div>

      {/* RECENT TRANSACTIONS */}
      <div className="bg-white p-6 rounded-3xl shadow-2xl mt-8">
        <h2 className="text-lg font-bold mb-5 text-gray-900">Recent Transactions</h2>
        <div className="space-y-4">
          {[
            { name: "Groceries", date: "Today", amount: "-150,000", red: true },
            { name: "Salary", date: "Yesterday", amount: "+4,000,000" },
            { name: "Netflix", date: "2 days ago", amount: "-50,000", red: true },
          ].map((t, i) => (
            <div key={i} className="flex justify-between items-center border-b border-gray-200 pb-3">
              <div>
                <p className="font-medium text-gray-700">{t.name}</p>
                <p className="text-xs text-gray-400">{t.date}</p>
              </div>
              <p className={`font-semibold ${t.red ? "text-red-500" : "text-green-500"}`}>
                {t.amount}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Home;