import React from "react";
import { ListItem, ListItemPrefix } from "@material-tailwind/react";
import { MdDashboard } from "react-icons/md";
import {
  FaBoxOpen,
  FaCartPlus,
  FaChartLine,
  FaHome,
  FaTools,
  FaWallet,
} from "react-icons/fa";
// 1. Link o'rniga NavLink import qilamiz
import { NavLink } from "react-router-dom";

export function SidebarWithContentSeparator() {
  // 2. Takrorlanuvchi stilni funksiya ichiga olamiz (kod tozaroq bo'lishi uchun)
  const activeClass = ({ isActive }) =>
    `flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-all ${
      isActive ? "bg-indigo-700" : "hover:bg-indigo-700"
    }`;

  return (
    <div className="h-screen w-72 bg-indigo-600 text-white sticky top-0">
      {/* HEADER */}
      <div className="bg-indigo-800 px-6 py-4 flex items-center gap-3">
        <FaHome className="text-white text-2xl" />
        <span className="text-xl font-semibold text-white">HomeFI</span>
      </div>

      <div className="mt-4 px-3 space-y-1">
        {/* DASHBOARD */}
        <NavLink to="/" end className={activeClass}>
          <MdDashboard className="text-[#38BDF8] text-xl" />
          <span className="text-white">Панель управления</span>
        </NavLink>

        {/* PRODUCTS */}
        <NavLink to="/products" className={activeClass}>
          <ListItem className="!text-white p-0 hover:bg-transparent focus:bg-transparent active:bg-transparent">
            <ListItemPrefix>
              <FaBoxOpen className="text-[#FB7185] text-xl" />
            </ListItemPrefix>
            Продукты
          </ListItem>
        </NavLink>

        {/* COMMUNAL */}
        <NavLink to="/communal" className={activeClass}>
          <ListItem className="!text-white p-0 hover:bg-transparent focus:bg-transparent active:bg-transparent">
            <ListItemPrefix>
              <FaTools className="text-[#FACC15] text-xl" />
            </ListItemPrefix>
            Коммунальные услуги
          </ListItem>
        </NavLink>

        {/* PROCHEE */}
        <NavLink to="/prochee" className={activeClass}>
          <ListItem className="!text-white p-0 hover:bg-transparent focus:bg-transparent active:bg-transparent">
            <ListItemPrefix>
              <FaWallet className="text-[#2DD4BF] text-2xl" />
            </ListItemPrefix>
            Прочие расходы
          </ListItem>
        </NavLink>

        {/* SHOPPING */}
        <NavLink to="/formirovaniyaZakupa" className={activeClass}>
          <div className="flex items-center gap-3">
            <FaCartPlus className="text-[#4ADE80] text-xl" />
            <span className="text-white">Формирование закупа</span>
          </div>
        </NavLink>

        {/* ANALYTICS */}
        <NavLink to="/budget" className={activeClass}>
          <div className="flex items-center gap-4">
            <FaChartLine className="text-[#E879F9]" />
            <span className="text-white">Аналитика расходов</span>
          </div>
        </NavLink>
      </div>
    </div>
  );
}