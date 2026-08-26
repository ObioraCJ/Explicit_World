import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import api from "../../services/api";
import AuthLayout from "../../components/common/AuthLayout";

function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await api.put(`/auth/reset-password/${token}`, { password });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setError(err.response?.data?.message || "This reset link is invalid or has expired.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <AuthLayout
        eyebrow="All set"
        title="Password updated"
        subtitle="Redirecting you to sign in..."
      >
        <Link
          to="/login"
          className="block w-full text-center bg-ink text-cream rounded-md py-3 font-medium tracking-wide hover:bg-gold-deep transition"
        >
          Sign in now
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      eyebrow="Reset password"
      title="Choose a new password"
      subtitle="Make it at least 8 characters"
    >
      {error && (
        <div className="mb-5 text-sm text-red-800 bg-red-50 border border-red-200 rounded-md px-4 py-3">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-medium text-charcoal tracking-wide mb-1.5">
            NEW PASSWORD
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-hairline bg-white px-3.5 py-2.5 pr-10 text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold transition"
              placeholder="At least 8 characters"
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

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-ink text-cream rounded-md py-3 font-medium tracking-wide hover:bg-gold-deep disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isSubmitting ? "Updating..." : "Update password"}
        </button>
      </form>
    </AuthLayout>
  );
}

export default ResetPasswordPage;