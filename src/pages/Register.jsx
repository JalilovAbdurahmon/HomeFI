import React, { useState, useEffect } from "react";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
} from "lucide-react";
import instance from "../utils/axios";
import { useForm } from "react-hook-form";

const useToast = () => {
  const [toasts, setToasts] = useState([]);
  const addToast = (message, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      3500
    );
  };
  const removeToast = (id) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));
  return {
    toasts,
    success: (msg) => addToast(msg, "success"),
    error: (msg) => addToast(msg, "error"),
    info: (msg) => addToast(msg, "info"),
    removeToast,
  };
};

const ToastContainer = ({ toasts, removeToast }) => (
  <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[999] flex flex-col gap-3 pointer-events-none items-center">
    {toasts.map((toast) => {
      const styles = {
        success: {
          icon: (
            <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
          ),
          glow: "shadow-[0_8px_32px_rgba(16,185,129,0.25)]",
          bar: "bg-emerald-400",
        },
        error: {
          icon: <XCircle size={20} className="text-red-400 shrink-0" />,
          glow: "shadow-[0_8px_32px_rgba(239,68,68,0.25)]",
          bar: "bg-red-400",
        },
        info: {
          icon: <AlertCircle size={20} className="text-indigo-400 shrink-0" />,
          glow: "shadow-[0_8px_32px_rgba(99,102,241,0.25)]",
          bar: "bg-indigo-400",
        },
      };
      const s = styles[toast.type];
      return (
        <div
          key={toast.id}
          className={`pointer-events-auto relative flex items-center gap-4 px-5 py-4 rounded-2xl border border-white/10 bg-[#1e293b]/95 backdrop-blur-2xl ${s.glow} min-w-[320px] max-w-[420px] overflow-hidden animate-in slide-in-from-top-4 fade-in duration-500`}
        >
          <div
            className={`absolute left-0 top-0 bottom-0 w-1 ${s.bar} rounded-r-full`}
          />
          <div className="ml-2">{s.icon}</div>
          <p className="text-sm font-semibold flex-1 text-white">
            {toast.message}
          </p>
          <button
            onClick={() => removeToast(toast.id)}
            className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-all"
          >
            <X size={14} />
          </button>
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/5">
            <div
              className={`h-full ${s.bar} opacity-60`}
              style={{ animation: "shrink 3.5s linear forwards" }}
            />
          </div>
        </div>
      );
    })}
    <style>{`@keyframes shrink { from { width: 100%; } to { width: 0%; } }`}</style>
  </div>
);

const Register = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  const password = watch("password");
  const confirmPassword = watch("confirmPassword");
  const passwordsMatch =
    !isLogin && confirmPassword ? password === confirmPassword : true;

  const onSubmit = async (data) => {
    if (!isLogin && data.password !== data.confirmPassword) {
      toast.error("Пароли не совпадают!");
      return;
    }
    setIsLoading(true);
    try {
      if (isLogin) {
        const res = await instance.post("/login", data);
        const token = res.data.token;
        const username = res.data.user?.username || data.username;
        localStorage.setItem("token", token);
        localStorage.setItem("username", username);
        toast.success("Вы успешно вошли в систему!");
        setTimeout(() => {
          window.location.href = "/products";
        }, 1000);
      } else {
        const { confirmPassword: _, ...submitData } = data;
        await instance.post("/register", submitData);
        toast.success("Аккаунт создан! Теперь войдите в систему.");
        setIsLogin(true);
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Произошла ошибка. Попробуйте снова."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isLogin) {
      const savedUsername = localStorage.getItem("username");
      reset();
      if (savedUsername) setValue("username", savedUsername);
    } else {
      reset();
    }
  }, [isLogin, setValue, reset]);

  const inputClass = (hasError) =>
    `w-full bg-white/5 border ${
      hasError ? "border-red-500" : "border-white/10"
    } text-white rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-gray-600`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a1f3a] via-[#1e2548] to-[#16213e] p-4 font-sans relative overflow-hidden">
      <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />

      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full filter blur-[120px] opacity-30" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-violet-600 rounded-full filter blur-[120px] opacity-25" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500 rounded-full filter blur-[100px] opacity-15" />

      <div className="relative w-full max-w-md">
        <div className="bg-white/[0.08] backdrop-blur-xl border border-white/25 rounded-3xl shadow-[0_25px_50px_rgba(0,0,0,0.4)] overflow-hidden">
          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-10">
              <h1 className="text-4xl font-bold text-white tracking-tight mb-2">
                HomeFI
              </h1>
              <p className="text-gray-400 text-sm">
                Добро пожаловать в систему!
              </p>
            </div>

            {/* Switcher */}
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

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Username */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-400 ml-1">
                  Имя пользователя
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    {...register("username", { required: true })}
                    type="text"
                    placeholder="Имя пользователя"
                    className={inputClass(errors.username)}
                  />
                </div>
                {errors.username && (
                  <p className="text-red-400 text-xs ml-1">Обязательное поле</p>
                )}
              </div>

              {/* Email — only register */}
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
                      className={`${inputClass(errors.email)} pr-4`}
                    />
                  </div>
                </div>
              )}

              {/* Password */}
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
                    className={`${inputClass(errors.password)} pr-12`}
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

              {/* Confirm Password — only register */}
              {!isLogin && (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-400 ml-1">
                    Подтвердите пароль
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      {...register("confirmPassword", { required: true })}
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className={`w-full bg-white/5 border text-white rounded-xl py-3 pl-10 pr-12 focus:ring-2 focus:border-transparent outline-none transition-all placeholder:text-gray-600 ${
                        confirmPassword
                          ? passwordsMatch
                            ? "border-emerald-500 focus:ring-emerald-500"
                            : "border-red-500 focus:ring-red-500"
                          : "border-white/10 focus:ring-indigo-500"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {confirmPassword && (
                    <p
                      className={`text-xs ml-1 flex items-center gap-1 mt-1 ${
                        passwordsMatch ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {passwordsMatch ? (
                        <CheckCircle2 size={13} />
                      ) : (
                        <XCircle size={13} />
                      )}
                      {passwordsMatch
                        ? "Пароли совпадают"
                        : "Пароли не совпадают"}
                    </p>
                  )}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={
                  isLoading || (!isLogin && confirmPassword && !passwordsMatch)
                }
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 group transition-all active:scale-95 mt-4"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {isLogin ? "Войти" : "Создать аккаунт"}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
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
