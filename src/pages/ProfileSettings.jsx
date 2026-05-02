import React, { useState } from "react";
import { Camera, User, Mail, Phone, MapPin, ShieldCheck, Save, Trash2 } from "lucide-react";

const ProfileSettings = () => {
  const [profile, setProfile] = useState({
    name: "Abduraxmon",
    email: "admin@gmail.com",
    phone: "+998 90 123 45 67",
    address: "Toshkent, O'zbekiston",
    role: "Administrator",
  });

  const [preview, setPreview] = useState("https://i.pravatar.cc/150?u=a042581f4e29026704d");

  // Rasm yuklash mantiqi (preview)
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      
      {/* 1. HEADER SECTION (Visual Card) */}
      <div className="relative h-48 w-full bg-gradient-to-r from-indigo-600 to-violet-600 rounded-[30px] shadow-lg overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="absolute -bottom-1 w-full h-24 bg-gradient-to-t from-white to-transparent"></div>
      </div>

      {/* 2. PROFILE OVERVIEW CARD */}
      <div className="relative -mt-24 px-8 pb-8 bg-white/70 backdrop-blur-xl border border-white rounded-[32px] shadow-xl">
        <div className="flex flex-col md:flex-row items-end gap-6">
          {/* Avatar Upload */}
          <div className="relative group">
            <div className="w-32 h-32 rounded-[28px] border-4 border-white shadow-2xl overflow-hidden bg-slate-100">
              <img src={preview} alt="Profile" className="w-full h-full object-cover transition group-hover:scale-110" />
            </div>
            <label className="absolute bottom-2 -right-2 p-2 bg-indigo-600 text-white rounded-xl shadow-lg cursor-pointer hover:bg-indigo-700 transition-all hover:scale-110 active:scale-95">
              <Camera size={18} />
              <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
            </label>
          </div>

          <div className="flex-1 pb-2">
            <h1 className="text-2xl font-black text-slate-800">{profile.name}</h1>
            <div className="flex items-center gap-2 text-slate-500 mt-1">
              <ShieldCheck size={16} className="text-emerald-500" />
              <span className="text-xs font-bold uppercase tracking-widest">{profile.role}</span>
            </div>
          </div>

          <div className="flex gap-3 pb-2">
            <button className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95">
              <Save size={18} /> Saqlash
            </button>
          </div>
        </div>

        {/* 3. FORM SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          
          {/* Shaxsiy Ma'lumotlar */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <User size={20} className="text-indigo-500" /> Shaxsiy ma'lumotlar
            </h3>
            
            <div className="space-y-4">
              <div className="group">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 mb-2">To'liq ismingiz</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={profile.name}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-semibold text-slate-700"
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                  />
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                </div>
              </div>

              <div className="group">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 mb-2">Email manzil</label>
                <div className="relative">
                  <input 
                    type="email" 
                    value={profile.email}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-semibold text-slate-700"
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                  />
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                </div>
              </div>
            </div>
          </div>

          {/* Aloqa va Manzil */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Phone size={20} className="text-emerald-500" /> Aloqa
            </h3>

            <div className="space-y-4">
              <div className="group">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 mb-2">Telefon raqam</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={profile.phone}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-semibold text-slate-700"
                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                  />
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                </div>
              </div>

              <div className="group">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 mb-2">Yashash manzili</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={profile.address}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-semibold text-slate-700"
                    onChange={(e) => setProfile({...profile, address: e.target.value})}
                  />
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. DANGER ZONE (Optional) */}
        <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-700">Hisobni o'chirish</h4>
            <p className="text-xs text-slate-400 mt-1">Barcha ma'lumotlaringiz butunlay o'chib ketadi.</p>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 text-red-500 hover:bg-red-50 rounded-xl font-bold text-xs transition-all">
            <Trash2 size={16} /> Hisobni o'chirish
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;