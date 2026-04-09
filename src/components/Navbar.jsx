import React, { useState, useRef, useEffect } from "react";
import { FaBell, FaChevronDown } from "react-icons/fa";

const Navbar = () => {
  const notificationCount = 4;
  const [open, setOpen] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="h-[64px] flex justify-between items-center w-full px-6 bg-white/70 backdrop-blur-sm border-b border-gray-200">

      {/* LEFT: Bell */}
      <div className="flex items-center">
        <div className="relative cursor-pointer group">
          <div className="p-2 rounded-xl group-hover:bg-indigo-50 transition">
            <FaBell className="text-gray-700 text-xl group-hover:text-indigo-500 transition" />
          </div>

          {notificationCount > 0 && (
            <span className="absolute top-1 right-1 px-1.5 py-0.5 text-[10px] text-white 
              bg-gradient-to-r from-red-500 to-pink-500 rounded-full 
              translate-x-1/2 -translate-y-1/2 animate-pulse shadow-md">
              {notificationCount > 9 ? "9+" : notificationCount}
            </span>
          )}
        </div>
      </div>

      {/* RIGHT: Avatar */}
      <div className="ml-auto flex items-center gap-4">
        <div className="relative" ref={menuRef}>
          <div
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 cursor-pointer bg-white px-2 py-1 rounded-full shadow-sm hover:shadow-md transition"
          >
            <div className="relative">
              <img
                src="https://i.pravatar.cc/40"
                alt="avatar"
                className="w-9 h-9 rounded-full border border-gray-300"
              />
              {/* Online dot */}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
            </div>

            <FaChevronDown
              className={`text-gray-500 text-xs transition-transform duration-300 ${
                open ? "rotate-180" : ""
              }`}
            />
          </div>

          {/* Dropdown */}
          <div
            className={`absolute mt-3 w-44 bg-white/90 backdrop-blur-md rounded-xl shadow-xl border border-gray-200
            right-0 transform transition-all duration-200 origin-top-right z-50
            ${
              open
                ? "opacity-100 scale-100"
                : "opacity-0 scale-95 pointer-events-none"
            }`}
          >
            <ul className="py-2 text-sm text-gray-700">
              <li className="px-4 py-2 hover:bg-gray-50 cursor-pointer transition">
                <span className="mr-2 text-blue-500">👤</span> Profile
              </li>
              <li className="px-4 py-2 hover:bg-gray-50 cursor-pointer transition">
                <span className="mr-2 text-indigo-500">⚙️</span> Settings
              </li>
              <li className="px-4 py-2 hover:bg-red-50 text-red-500 cursor-pointer transition">
                <span className="mr-2">🚪</span> Logout
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;