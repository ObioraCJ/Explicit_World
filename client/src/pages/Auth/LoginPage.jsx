import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import AuthLayout from "../../components/common/AuthLayout";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const remembered = localStorage.getItem("rememberedEmail");
    if (remembered) {
      setEmail(remembered);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(email, password);

      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Sign in to your account"
      subtitle="Pick up where you left off"
    >
      {error && (
        <div className="mb-5 text-sm text-red-800 bg-red-50 border border-red-200 rounded-md px-4 py-3">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-medium text-charcoal tracking-wide mb-1.5">
            EMAIL
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-hairline bg-white px-3.5 py-2.5 text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold transition"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-charcoal tracking-wide mb-1.5">
            PASSWORD
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-hairline bg-white px-3.5 py-2.5 pr-10 text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold transition"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40 hover:text-charcoal transition"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-charcoal/70 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-hairline accent-gold cursor-pointer"
            />
            Remember me
          </label>
          <Link to="/forgot-password" className="text-charcoal/70 hover:text-gold-deep transition">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-ink text-cream rounded-md py-3 font-medium tracking-wide hover:bg-gold-deep disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-charcoal/60">
        Don't have an account?{" "}
        <Link to="/register" className="text-ink font-medium hover:text-gold-deep transition">
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
}

export default LoginPage;