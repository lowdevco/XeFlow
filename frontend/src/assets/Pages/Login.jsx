import { useState } from "react";
import { API_BASE_URL } from "../js/api";
import {
  FiUser,
  FiLock,
  FiArrowRight,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/token/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("accessToken", data.access);
        localStorage.setItem("refreshToken", data.refresh);
        navigate("/dashboard");
      } else {
        throw new Error(
          data.detail || "Invalid username or password. Please try again.",
        );
      }
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to server. Is Django running?"
          : err.message,
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-xeflow-bg transition-colors duration-300 relative overflow-hidden select-none">
      <div className="w-full max-w-5xl bg-xeflow-surface border border-xeflow-border rounded-xl shadow-xl overflow-hidden transition-all duration-300 grid grid-cols-1 md:grid-cols-12 min-h-[600px] z-10 animate-in fade-in slide-in-from-bottom-4 duration-400">
        <div className="hidden md:flex md:col-span-5 relative bg-xeflow-navy p-12 flex-col justify-between overflow-hidden text-white border-r border-xeflow-border/10">
          <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1.5px,transparent_1.5px)] [background-size:24px_24px] z-0"></div>

          <svg
            className="absolute right-[-20%] top-[15%] w-[130%] h-[130%] text-white opacity-[0.05] pointer-events-none z-0"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.75"
            />
            <circle
              cx="50"
              cy="50"
              r="30"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              strokeDasharray="2 2"
            />
            <circle
              cx="50"
              cy="50"
              r="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
            />
            <line
              x1="10"
              y1="50"
              x2="90"
              y2="50"
              stroke="currentColor"
              strokeWidth="0.25"
            />
            <line
              x1="50"
              y1="10"
              x2="50"
              y2="90"
              stroke="currentColor"
              strokeWidth="0.25"
            />
          </svg>

          <div className="flex items-center gap-3 z-10">
            <span className="font-extrabold text-xl tracking-tight text-white">
              XeFlow
            </span>
          </div>

          <div className="space-y-4 my-auto z-10">
            <h2 className="text-3xl font-bold tracking-tight leading-tight text-white">
              Hello,
              <br />
              Welcome Back!
            </h2>
            <p className="text-sm text-slate-300 font-medium leading-relaxed">
              Xeflow Billing System. Internal dashboard for managing Xeventure's
              service billing, invoice automation, and financial reporting.
              Designed for optimized, secure, and rapid billing operations.
            </p>
          </div>

          <div className="z-10">
            <p className="text-[10px] font-bold text-slate-400 tracking-wider">
              &copy; 2026 Xeventure IT Solutions. All rights reserved.
            </p>
          </div>
        </div>

        <div className="col-span-12 md:col-span-7 bg-xeflow-surface p-8 sm:p-12 flex flex-col justify-between relative">
          <div className="md:hidden flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-xeflow-brand text-white font-black rounded-lg flex items-center justify-center shadow-md">
                XF
              </div>
              <span className="font-extrabold text-md tracking-tight text-xeflow-text">
                XeFlow
              </span>
            </div>
          </div>

          <div className="my-auto space-y-6">
            <div>
              <h1 className="text-2xl font-black text-xeflow-text tracking-tight sm:text-3xl">
                Dashboard Log In
              </h1>
              <p className="text-sm text-xeflow-muted mt-2 font-medium">
                Enter your credentials to access the dashboard.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold text-center animate-in shake duration-300">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-xs font-bold text-xeflow-muted uppercase tracking-wider">
                  Username
                </label>
                <div className="relative">
                  <FiUser
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-xeflow-muted"
                    size={18}
                  />
                  <input
                    required
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    autoComplete="username"
                    placeholder="Enter your username"
                    className="w-full pl-11 pr-4 py-3.5 bg-xeflow-surface2 border border-xeflow-border rounded-xl text-sm text-xeflow-text placeholder:text-xeflow-muted/50 outline-none focus:border-xeflow-brand focus:bg-xeflow-surface transition-all duration-200"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-xeflow-muted uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <FiLock
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-xeflow-muted"
                    size={18}
                  />
                  <input
                    required
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full pl-11 pr-4 py-3.5 bg-xeflow-surface2 border border-xeflow-border rounded-xl text-sm text-xeflow-text placeholder:text-xeflow-muted/50 outline-none focus:border-xeflow-brand focus:bg-xeflow-surface transition-all duration-200"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer group select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-xeflow-border text-xeflow-brand focus:ring-xeflow-brand/10 bg-xeflow-surface2 cursor-pointer transition-colors"
                  />
                  <span className="text-xs font-bold text-xeflow-muted group-hover:text-xeflow-text transition-colors">
                    Remember me
                  </span>
                </label>
                <button
                  type="button"
                  className="text-xs font-black text-xeflow-brand hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              <button
                disabled={isLoading}
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-xeflow-brand hover:bg-xeflow-brand-alt text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.99]"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    Sign In <FiArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-8 text-center border-t border-xeflow-border/40 pt-6">
            <p className="text-xs font-bold text-xeflow-muted">
              Don't have an account?{" "}
              <button
                type="button"
                className="text-xeflow-brand hover:underline font-black"
              >
                Contact Admin
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
