import React, { useState, useEffect } from "react";
import {
  Camera,
  User,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Save,
  Lock,
  KeyRound,
  EyeOff,
  Eye,
} from "lucide-react";
import instance from "../utils/axios";

const BASE_URL = "http://localhost:2000";

const ProfileSettings = () => {
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    phone: "",
    address: "",
    avatar: "",
    role: "",
  });

  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Avatar URL yasash (har doim to'g'ri URL qaytaradi)
  const getAvatarUrl = (avatarPath, username = "User") => {
    // Avatar yo'q bo'lsa
    if (!avatarPath || avatarPath === "null") {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(
        username
      )}&background=random&color=fff`;
    }

    // Agar full URL bo'lsa
    if (avatarPath.startsWith("http")) {
      return `${avatarPath}?t=${new Date().getTime()}`;
    }

    // uploads/avatars/image.jpg
    return `${BASE_URL}/${avatarPath.replace(
      /^\/+/,
      ""
    )}?t=${new Date().getTime()}`;
  };

  // 1. Ma'lumotlarni Backenddan olish (GET)
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await instance.get("/profileSettings", {
          headers: {
            token: localStorage.getItem("token"),
          },
        });

        const userData = res.data;

        setProfile(userData);

        // localStorage update
        localStorage.setItem("avatar", userData.avatar || "");

        localStorage.setItem("username", userData.username || "User");

        // preview update
        setPreview(getAvatarUrl(userData.avatar, userData.username));
      } catch (err) {
        console.error("Yuklashda xato:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // 2. Rasm tanlash (Local preview)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Lokal preview uchun object URL ishlatamiz
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
    }
  };

  const showToast = (message, type = "success") => {
    const toast = document.createElement("div");

    // Ranglarni aniqlash
    const isSuccess = type === "success";
    const bgColor = isSuccess ? "bg-white/90" : "bg-red-50";
    const iconBg = isSuccess ? "bg-green-500" : "bg-red-500";
    const textColor = isSuccess ? "text-gray-800" : "text-red-800";
    const borderColor = isSuccess ? "border-green-200" : "border-red-200";

    // Tailwind klasslari (Glassmorphism + Shadow)
    toast.className = `fixed top-[-100px] left-1/2 -translate-x-1/2 z-[10000] flex items-center gap-3 px-5 py-3 rounded-2xl border ${borderColor} ${bgColor} ${textColor} shadow-2xl backdrop-blur-md transition-all duration-500 ease-in-out min-w-[300px]`;

    toast.innerHTML = `
      <div class="flex-shrink-0 w-8 h-8 ${iconBg} rounded-full flex items-center justify-center shadow-lg shadow-green-200">
        ${
          isSuccess
            ? '<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>'
            : '<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path></svg>'
        }
      </div>
      <div class="flex flex-col">
        <span class="font-bold text-sm">${
          isSuccess ? "Muvaffaqiyatli!" : "Xatolik!"
        }</span>
        <span class="text-xs opacity-80">${message}</span>
      </div>
    `;

    document.body.appendChild(toast);

    // Animatsiya: Tepadan tushadi
    setTimeout(() => {
      toast.style.top = "24px";
    }, 10);

    // 3 soniyadan keyin yo'qoladi
    setTimeout(() => {
      toast.style.top = "-100px";
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 500);
    }, 3000);
  };

  // 3. Saqlash funksiyasi (PUT)
  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("username", profile.username);
      formData.append("email", profile.email);
      formData.append("phone", profile.phone || "");
      formData.append("address", profile.address || "");

      if (passwords.newPassword) {
        formData.append("oldPassword", passwords.oldPassword);
        formData.append("newPassword", passwords.newPassword);
      }

      if (selectedFile) {
        formData.append("avatar", selectedFile);
      }

      const res = await instance.put("/profileSettings", formData, {
        headers: {
          token: localStorage.getItem("token"),
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.user) {
        const updatedUser = res.data.user;

        // state update
        setProfile(updatedUser);

        // localStorage update
        localStorage.setItem("avatar", updatedUser.avatar || "");

        localStorage.setItem("username", updatedUser.username || "User");

        // avatar preview
        setPreview(getAvatarUrl(updatedUser.avatar, updatedUser.username));

        // file reset
        setSelectedFile(null);

        // navbar update
        window.dispatchEvent(new Event("profileUpdated"));

        showToast("Muvaffaqiyatli saqlandi!");
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "Xatolik yuz berdi", "error");
    }
  };
  console.log(localStorage.getItem("avatar"));

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-white">
        Yuklanmoqda...
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-10 space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="relative h-40 w-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-[30px] shadow-2xl overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
      </div>

      {/* Card */}
      <div className="relative -mt-20 px-6 pb-10 bg-white border border-gray-100 rounded-[40px] shadow-xl shadow-gray-200/50">
        <div className="flex flex-col md:flex-row items-end gap-6 pt-0">
          {/* Avatar */}
          <div className="relative -mt-12">
            <div className="w-32 h-32 rounded-3xl border-4 border-white shadow-xl overflow-hidden bg-gray-50">
              {preview && (
                <img
                  src={preview}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      profile.username || "User"
                    )}&background=random&color=fff`;
                  }}
                />
              )}
            </div>
            <label className="absolute -bottom-2 -right-2 p-2.5 bg-indigo-600 text-white rounded-2xl shadow-lg cursor-pointer hover:bg-indigo-700 transition-all active:scale-90">
              <Camera size={18} />
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </label>
          </div>

          <div className="flex-1 pb-2">
            <h1 className="text-2xl font-black text-gray-800">
              {profile.username}
            </h1>
            <div className="flex items-center gap-2 text-gray-400">
              <ShieldCheck size={16} className="text-green-500" />
              <span className="text-xs font-bold uppercase tracking-widest">
                {profile.role || "USER HAS NO ROLE"}
              </span>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-8 py-3.5 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all active:scale-95 mb-2"
          >
            <Save size={18} /> Saqlash
          </button>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
          {/* Ma'lumotlar */}
          <div className="space-y-5">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <User size={16} /> Ma'lumotlar
            </h3>
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={profile.username}
                  placeholder="Username"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-indigo-500 outline-none transition-all font-medium"
                  onChange={(e) =>
                    setProfile({ ...profile, username: e.target.value })
                  }
                />
                <User
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                  size={20}
                />
              </div>
              <div className="relative">
                <input
                  type="email"
                  value={profile.email}
                  placeholder="Email"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-indigo-500 outline-none transition-all font-medium"
                  onChange={(e) =>
                    setProfile({ ...profile, email: e.target.value })
                  }
                />
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                  size={20}
                />
              </div>
            </div>
          </div>

          {/* Xavfsizlik */}
          <div className="space-y-5">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Lock size={16} /> Xavfsizlik
            </h3>
            <div className="space-y-4">
              {/* Eski parol */}
              <div className="relative">
                <input
                  type={showOldPassword ? "text" : "password"}
                  placeholder="Eski parol"
                  value={passwords.oldPassword}
                  className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-indigo-500 outline-none transition-all"
                  onChange={(e) =>
                    setPasswords({ ...passwords, oldPassword: e.target.value })
                  }
                />
                <KeyRound
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                  size={20}
                />
                {/* Ko'zcha tugmasi */}
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-500 transition-colors"
                >
                  {showOldPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Yangi parol */}
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Yangi parol"
                  value={passwords.newPassword}
                  className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-indigo-500 outline-none transition-all"
                  onChange={(e) =>
                    setPasswords({ ...passwords, newPassword: e.target.value })
                  }
                />
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                  size={20}
                />
                {/* Ko'zcha tugmasi */}
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-500 transition-colors"
                >
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </div>

          {/* Aloqa */}
          <div className="space-y-5">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Phone size={16} /> Aloqa
            </h3>
            <input
              type="text"
              placeholder="Telefon"
              value={profile.phone || ""}
              className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-indigo-500 outline-none transition-all"
              onChange={(e) =>
                setProfile({ ...profile, phone: e.target.value })
              }
            />
          </div>

          {/* Manzil */}
          <div className="space-y-5">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <MapPin size={16} /> Manzil
            </h3>
            <input
              type="text"
              placeholder="Shahar, Ko'cha..."
              value={profile.address || ""}
              className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-indigo-500 outline-none transition-all"
              onChange={(e) =>
                setProfile({ ...profile, address: e.target.value })
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
