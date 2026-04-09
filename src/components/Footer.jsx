import React, { useState, useRef } from "react";
import {
  FaTelegramPlane,
  FaInstagram,
  FaGithub,
  FaEnvelope,
} from "react-icons/fa";
import { FiPhone, FiMapPin, FiChevronRight } from "react-icons/fi";
import emailjs from "@emailjs/browser";

const ContactCard = ({ icon, title, value, colorClass, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-4 p-4 rounded-2xl border bg-white border-slate-100 group hover:border-indigo-200 transition-all shadow-sm cursor-pointer`}
    >
      <div
        className={`p-3 rounded-xl ${colorClass} transition-transform group-hover:scale-110`}
      >
        {React.cloneElement(icon, { size: 18 })}
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          {title}
        </p>
        <p className="font-bold text-slate-800 text-sm mt-0.5">{value}</p>
      </div>
    </div>
  );
};

const Footer = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const formRef = useRef();

  const sendEmail = (e) => {
    e.preventDefault();

    emailjs
      .sendForm(
        "service_2oiw9gb", // EmailJS service ID
        "template_bpwyblm", // EmailJS template ID
        formRef.current,
        "e-c-tRiPMV-Hk3lDY" // EmailJS public key
      )
      .then(
        () => {
          alert("Xabar muvaffaqiyatli yuborildi ✅");
          setModalOpen(false);
          formRef.current.reset();
        },
        (error) => {
          console.log(error);
          alert("Xato yuz berdi ❌");
        }
      );
  };

  return (
    <footer className="mt-16 bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-slate-100 mb-6 relative">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
        {/* 1. Brend va Social Links */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
              <span className="text-xl">🏠</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tighter">
              Home<span className="text-indigo-600">Fi</span>
            </h1>
          </div>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">
            Smart way to manage your home finances. Moliyaviy erkinlikni biz
            bilan birga boshqaring.
          </p>

          {/* Social Links */}
          <div className="flex gap-4 mt-8">
            <a
              href="https://t.me/Jalilov_918"
              target="_blank"
              className="group p-3 rounded-2xl bg-sky-50 transition-all duration-300 hover:bg-[#229ED9] hover:scale-110 shadow-sm"
            >
              <FaTelegramPlane
                className="text-[#229ED9] transition-colors duration-300 group-hover:text-white"
                size={22}
              />
            </a>
            <a
              href="https://www.instagram.com/_jalilovv_a"
              target="_blank"
              className="group p-3 rounded-2xl bg-rose-50 transition-all duration-300 hover:bg-gradient-to-tr hover:from-[#f9ce34] hover:via-[#ee2a7b] hover:to-[#6228d7] hover:scale-110 shadow-sm"
            >
              <FaInstagram
                className="text-[#ee2a7b] transition-colors duration-300 group-hover:text-white"
                size={22}
              />
            </a>
            <a
              href="https://github.com/JalilovAbdurahmon"
              target="_blank"
              className="group p-3 rounded-2xl bg-slate-100 transition-all duration-300 hover:bg-black hover:scale-110 shadow-sm"
            >
              <FaGithub
                className="text-slate-800 transition-colors duration-300 group-hover:text-white"
                size={22}
              />
            </a>

            {/* EMAIL ICON - Modal Trigger */}
            <div
              onClick={() => setModalOpen(true)}
              className="group p-3 rounded-2xl bg-indigo-50 cursor-pointer transition-all duration-300 hover:bg-indigo-600 hover:scale-110 shadow-sm"
            >
              <FaEnvelope
                className="text-indigo-600 group-hover:text-white transition-colors duration-300"
                size={22}
              />
            </div>
          </div>
        </div>

        {/* 2. Sections */}
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-6">Bo'limlar</h2>
          <ul className="space-y-4 text-sm font-semibold text-slate-600">
            {[
              "Bosh sahifa",
              "Byudjet",
              "Hisobotlar",
              "Profil",
              "Sozlamalar",
            ].map((link) => (
              <li
                key={link}
                className="flex items-center gap-2 group cursor-pointer"
              >
                <FiChevronRight className="text-slate-300 group-hover:text-indigo-600 transition-all group-hover:translate-x-1" />
                <span className="group-hover:text-slate-900 transition-colors">
                  {link}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* 3 va 4. Contact */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          {" "}
          {/* flex-col + gap */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">
              Bog'lanish
            </h2>
          </div>
          {/* Telefon */}
          <a href="tel:+998900237522" className="w-full block">
            <ContactCard
              icon={<FiPhone />}
              title="Telefon"
              value="+998 90 023 75 22"
              colorClass="bg-emerald-50 text-emerald-600"
            />
          </a>
          {/* Lokatsiya */}
          <a
            href="https://maps.app.goo.gl/tWLhfFrSwSAZWZT48" // <-- Google Maps link
            target="_blank"
            rel="noopener noreferrer"
            className="w-full block"
          >
            <ContactCard
              icon={<FiMapPin />}
              title="Manzil"
              value="Tashkent, Uzbekistan, 100011"
              colorClass="bg-rose-50 text-rose-600"
            />
          </a>
        </div>
      </div>

      {/* Footer bottom */}
      <div className="border-t border-slate-50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-slate-400">
        <p>© 2026 HomeFi. Barcha huquqlar himoyalangan.</p>
        <div className="flex gap-6 uppercase tracking-widest">
          <a href="#" className="hover:text-indigo-600 transition-colors">
            Terms
          </a>
          <a href="#" className="hover:text-indigo-600 transition-colors">
            Privacy
          </a>
          <a href="#" className="hover:text-indigo-600 transition-colors">
            Cookies
          </a>
        </div>
      </div>

      {/* ==================== EMAIL MODAL ==================== */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md relative">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              Xabar yuborish
            </h2>
            <form
              ref={formRef}
              onSubmit={sendEmail}
              className="flex flex-col gap-4"
            >
              <input
                type="text"
                name="user_name"
                placeholder="Ismingiz"
                className="border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
              />
              <input
                type="email"
                name="user_email"
                placeholder="Emailingiz"
                className="border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
              />
              <textarea
                name="message"
                placeholder="Xabaringiz"
                rows={4}
                className="border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  Yuborish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;
