import React, { useState, useRef, useEffect } from "react";
import { Bell, ChevronDown, User, Settings, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BASE_URL = "http://localhost:2000";

const getAvatarUrl = (avatarPath, username = "User") => {
  if (!avatarPath) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random&color=fff`;
  }
  if (avatarPath.startsWith("http")) {
    return avatarPath;
  }
  return `${BASE_URL}${avatarPath.startsWith("/") ? "" : "/"}${avatarPath}`;
};

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [username, setUsername] = useState("User");
  const notificationCount = 4;
  const menuRef = useRef(null);
  const nav = useNavigate();

  // localStorage dan avatar va username ni o'qiymiz
  const loadUserInfo = () => {
    const savedAvatar = localStorage.getItem("avatar") || "";
    const savedUsername = localStorage.getItem("username") || "User";
    setUsername(savedUsername);
    setAvatarUrl(getAvatarUrl(savedAvatar, savedUsername));
  };

  useEffect(() => {
    // Sahifa ochilganda o'qiymiz
    loadUserInfo();

    // ProfileSettings saqlanganda yangilansin (custom event)
    window.addEventListener("profileUpdated", loadUserInfo);

    // Tashqariga bosganda menyu yopilsin
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("profileUpdated", loadUserInfo);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("avatar");
    localStorage.removeItem("username");
    nav("/");
  };

  const handleProfileSettings = () => {
    nav("/profileSettings");
    setOpen(false);
  };

  return (
    <nav className="h-16 flex justify-between items-center w-full px-8 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-[100]">
      {/* LEFT: Notification Bell */}
      <div className="flex items-center">
        <button className="relative p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition-all duration-200 group">
          <Bell size={22} />
          {notificationCount > 0 && (
            <span className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center text-[10px] font-bold text-white bg-red-500 border-2 border-white rounded-full shadow-sm animate-bounce">
              {notificationCount > 9 ? "9+" : notificationCount}
            </span>
          )}
        </button>
      </div>

      {/* RIGHT: User Profile */}
      <div className="flex items-center gap-4" ref={menuRef}>
        <div className="relative">
          {/* Trigger Button */}
          <button
            onClick={() => setOpen(!open)}
            className={`flex items-center gap-3 p-1.5 pr-4 rounded-full transition-all duration-300 ${
              open
                ? "bg-slate-100 ring-1 ring-slate-200"
                : "hover:bg-slate-50 border border-transparent"
            }`}
          >
            <div className="relative">
              <img
                src={avatarUrl}
                alt="avatar"
                className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    username
                  )}&background=random&color=fff`;
                }}
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
            </div>

            <div className="hidden sm:block text-left">
              {/* Username dinamik — ProfileSettings bilan sinxron */}
              <p className="text-sm font-bold text-slate-700 leading-none">
                {username}
              </p>
              <p className="text-[10px] text-slate-400 mt-1 font-medium uppercase tracking-wider">
                Пользователь
              </p>
            </div>

            <ChevronDown
              size={14}
              className={`text-slate-400 transition-transform duration-300 ${
                open ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown */}
          <div
            className={`absolute mt-3 w-56 bg-white/95 backdrop-blur-xl rounded-[22px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 right-0 py-2 transform transition-all duration-300 origin-top-right z-50 ${
              open
                ? "opacity-100 scale-100"
                : "opacity-0 scale-95 pointer-events-none"
            }`}
          >
            <ul className="px-2 space-y-1">
              <li
                onClick={handleProfileSettings}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer transition-all group"
              >
                <div className="w-8 h-8 flex items-center justify-center bg-slate-50 rounded-lg group-hover:bg-white transition-colors">
                  <User size={16} />
                </div>
                <span className="text-sm font-semibold">Профиль</span>
              </li>

              <li className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer transition-all group">
                <div className="w-8 h-8 flex items-center justify-center bg-slate-50 rounded-lg group-hover:bg-white transition-colors">
                  <Settings size={16} />
                </div>
                <span className="text-sm font-semibold">Настройки</span>
              </li>

              <div className="h-px bg-slate-100 my-2 mx-2" />

              <li
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 cursor-pointer transition-all group"
              >
                <div className="w-8 h-8 flex items-center justify-center bg-red-50 rounded-lg group-hover:bg-red-500 group-hover:text-white transition-all">
                  <LogOut size={16} />
                </div>
                <span className="text-sm font-bold">Выход</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;