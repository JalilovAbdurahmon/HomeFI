import React, { useState, useEffect } from "react";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from "lucide-react";
import instance from "../utils/axios";
import { useForm } from "react-hook-form";

const Register = () => {
  // 1. Состояние: Вход или Регистрация
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue, // 👈 qo‘shildi
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      if (isLogin) {
        // ✅ 1. 'res' o'zgaruvchisiga javobni olamiz
        const res = await instance.post("/login", data);
        
        // Backenddan kelayotgan ma'lumotni tekshiramiz (odatda res.data ichida bo'ladi)
        const token = res.data.token;
        const username = res.data.user?.username || data.username; // Backenddan kelsa yaxshi

        // ✅ 2. Ma'lumotlarni saqlaymiz
        localStorage.setItem("token", token);
        localStorage.setItem("username", username);

        console.log("AFTER LOGIN:", localStorage.getItem("token"));

        // Agar setToken Context'dan kelsa, ishlating, bo'lmasa o'chirib tashlang
        // setToken(token); 

        alert("Login successful!");
      } else {
        // ✅ 3. Registratsiya
        await instance.post("/register", data);
        alert("User registered! Now please login.");
        setIsLogin(true); // Registratsiyadan keyin Login qismiga o'tkazish
        return; // Navigatsiya qilishdan oldin login qilsin
      }

      window.location.href= "/home"
    } catch (err) {
      console.error(err);
      // Backenddan kelayotgan xato xabarini ko'rsatish
      alert(err?.response?.data?.message || "Xatolik yuz berdi");
    }
  };

  useEffect(() => {
    const savedUsername = localStorage.getItem("username");
  
    if (savedUsername) {
      setValue("username", savedUsername);
    }
  }, [setValue]);

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   console.log(isLogin ? "Вход в систему:" : "Регистрация профиля:", formData);
  // };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-4 font-sans relative overflow-hidden">
      {/* Декоративные элементы фона */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      <div className="relative w-full max-w-md">
        {/* Основная карточка */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-10">
              <h1 className="text-4xl font-bold text-white tracking-tight mb-2">
                HomeFI
              </h1>
              <p className="text-gray-400 text-sm">
                Добро пожаловать в систему!
              </p>
            </div>

            {/* Переключатель (Switcher) */}
            <div className="relative flex bg-gray-900/50 p-1 rounded-2xl mb-8">
              <div
                className={`absolute top-1 bottom-1 w-[48%] bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl transition-all duration-300 ease-out ${
                  isLogin ? "left-1" : "left-[51%]"
                }`}
              />
              <button
                onClick={() => setIsLogin(true)}
                className={`relative z-10 w-1/2 py-2 text-sm font-semibold transition-colors duration-300 ${
                  isLogin ? "text-white" : "text-gray-400"
                }`}
              >
                Вход
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`relative z-10 w-1/2 py-2 text-sm font-semibold transition-colors duration-300 ${
                  !isLogin ? "text-white" : "text-gray-400"
                }`}
              >
                Регистрация
              </button>
            </div>

            {/* Форма */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-400 ml-1">
                  Имя пользователя
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    {...register("username", { required: true })}
                    type="text"
                    placeholder="Абдурахмон"
                    className="w-full bg-gray-800/50 border border-gray-700 text-white rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-gray-600"
                  />
                </div>
              </div>

              {!isLogin && (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-400 ml-1">
                    Электронная почта
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      {...register("email", { required: true })}
                      type="email"
                      placeholder="example@mail.com"
                      className="w-full bg-gray-800/50 border border-gray-700 text-white rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-gray-600"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-400 ml-1">
                  Пароль
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    {...register("password", { required: true })}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full bg-gray-800/50 border border-gray-700 text-white rounded-xl py-3 pl-10 pr-12 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-gray-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 group transition-all active:scale-95 mt-4"
              >
                {isLogin ? "Войти" : "Создать аккаунт"}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </div>

          {/* Футер */}
          <div className="px-8 py-4 bg-gray-900/30 border-t border-white/5 text-center">
            <p className="text-xs text-gray-500">
              {isLogin ? "Нет аккаунта?" : "Уже есть аккаунт?"}{" "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-4 transition-colors"
              >
                {isLogin ? "Зарегистрируйтесь" : "Войдите в систему"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
