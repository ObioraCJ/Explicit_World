import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../services/api";

function PaymentCallbackPage() {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get("reference") || searchParams.get("trxref");

  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verify = async () => {
      if (!reference) {
        setStatus("failed");
        setMessage("No payment reference was found.");
        return;
      }

      try {
        await api.get(`/orders/verify/${reference}`);
        setStatus("success");
      } catch (err) {
        setStatus("failed");
        setMessage(
          err.response?.data?.message || "We couldn't verify your payment. Please contact support."
        );
      }
    };

    verify();
  }, [reference]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        {status === "verifying" && (
          <>
            <h1 className="font-display text-2xl text-ink mb-2">Confirming your payment...</h1>
            <p className="text-charcoal/60">This will only take a moment.</p>
          </>
        )}

        {status === "success" && (
          <>
            <h1 className="font-display text-2xl text-ink mb-2">Payment successful!</h1>
            <p className="text-charcoal/60 mb-6">
              Thank you for your order. You can track its progress from your orders page.
            </p>
            <Link
              to="/orders"
              className="inline-block bg-ink text-cream rounded-md px-6 py-3 font-medium tracking-wide hover:bg-gold-deep transition"
            >
              View my orders
            </Link>
          </>
        )}

        {status === "failed" && (
          <>
            <h1 className="font-display text-2xl text-ink mb-2">Payment verification failed</h1>
            <p className="text-charcoal/60 mb-6">{message}</p>
            <Link
              to="/cart"
              className="inline-block bg-ink text-cream rounded-md px-6 py-3 font-medium tracking-wide hover:bg-gold-deep transition"
            >
              Back to cart
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default PaymentCallbackPage;