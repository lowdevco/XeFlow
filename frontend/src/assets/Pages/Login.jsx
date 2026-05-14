import { useState } from "react";
import { FiMail, FiLock, FiArrowRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // TODO: Replace this timeout with your actual Django JWT login fetch request
    try {
      // Simulating network request
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Temporary fake authentication check
      if (formData.email && formData.password.length >= 6) {
        // Success! Redirect to the dashboard
        navigate("/dashboard");
      } else {
        throw new Error("Invalid email or password. Please try again.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-xeflow-bg transition-colors duration-300">
      {/* ── Main Login Card ── */}
      <div className="w-full max-w-md bg-xeflow-surface border border-xeflow-border rounded-2xl shadow-xl overflow-hidden transition-colors duration-300 animate-in fade-in slide-in-from-bottom-4">
        <div className="p-8 pb-6 text-center">
          {/* Logo Placeholder */}
          <div className="w-16 h-16 bg-gradient-to-br from-xeflow-brand to-blue-500 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-xeflow-brand/20">
            <span className="text-white text-2xl font-black tracking-tighter">
              XF
            </span>
          </div>

          <h1 className="text-2xl font-bold text-xeflow-text tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-xeflow-muted mt-2">
            Enter your credentials to access your dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 pt-2 space-y-5">
          {/* Error Message Display */}
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium text-center">
              {error}
            </div>
          )}

          {/* Email Field */}
          <div>
            <label className="block text-xs font-bold text-xeflow-muted uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <FiMail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-xeflow-muted"
                size={18}
              />
              <input
                required
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@company.com"
                className="w-full pl-11 pr-4 py-3.5 bg-xeflow-bg border border-xeflow-border rounded-xl text-sm text-xeflow-text placeholder:text-xeflow-muted/50 outline-none focus:border-xeflow-brand transition-all duration-200"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-xeflow-muted uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                className="text-xs font-bold text-xeflow-brand hover:underline"
              >
                Forgot password?
              </button>
            </div>
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
                className="w-full pl-11 pr-4 py-3.5 bg-xeflow-bg border border-xeflow-border rounded-xl text-sm text-xeflow-text placeholder:text-xeflow-muted/50 outline-none focus:border-xeflow-brand transition-all duration-200"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            disabled={isLoading}
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3.5 mt-4 rounded-xl bg-xeflow-brand text-white font-bold hover:opacity-90 shadow-lg shadow-xeflow-brand/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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

        {/* Footer */}
        <div className="p-6 pt-0 text-center">
          <p className="text-sm text-xeflow-muted">
            Don't have an account?{" "}
            <button
              type="button"
              className="font-bold text-xeflow-brand hover:underline"
            >
              Contact Admin
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
