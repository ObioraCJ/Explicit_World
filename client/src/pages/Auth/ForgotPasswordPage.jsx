import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import AuthLayout from "../../components/common/AuthLayout";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await api.post("/auth/forgot-password", { email });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <AuthLayout
        eyebrow="Check your inbox"
        title="Reset link sent"
        subtitle="If an account exists for that email, we've sent a link to reset your password."
      >
        <Link
          to="/login"
          className="block w-full text-center bg-ink text-cream rounded-md py-3 font-medium tracking-wide hover:bg-gold-deep transition"
        >
          Back to sign in
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      eyebrow="Reset password"
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a reset link"
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

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-ink text-cream rounded-md py-3 font-medium tracking-wide hover:bg-gold-deep disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isSubmitting ? "Sending..." : "Send reset link"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-charcoal/60">
        Remembered your password?{" "}
        <Link to="/login" className="text-ink font-medium hover:text-gold-deep transition">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}

export default ForgotPasswordPage;