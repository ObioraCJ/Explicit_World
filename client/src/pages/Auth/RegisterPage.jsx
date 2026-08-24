import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import AuthLayout from "../../components/common/AuthLayout";

function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await register(name, email, password);
      navigate("/");
    } catch (err) {
      const backendErrors = err.response?.data?.errors;
      if (backendErrors && backendErrors.length > 0) {
        setError(backendErrors.map((e) => e.message).join(" "));
      } else {
        setError(err.response?.data?.message || "Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Get started"
      title="Create your account"
      subtitle="Join us for ready-made pieces and bespoke tailoring"
    >
      {error && (
        <div className="mb-5 text-sm text-red-800 bg-red-50 border border-red-200 rounded-md px-4 py-3">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-medium text-charcoal tracking-wide mb-1.5">
            FULL NAME
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-hairline bg-white px-3.5 py-2.5 text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold transition"
            placeholder="Ada Lovelace"
          />
        </div>

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
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-charcoal/60">
        Already have an account?{" "}
        <Link to="/login" className="text-ink font-medium hover:text-gold-deep transition">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}

export default RegisterPage;