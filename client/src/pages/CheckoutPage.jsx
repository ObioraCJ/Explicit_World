import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function formatPrice(amount) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

function CheckoutPage() {
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [isLoadingCart, setIsLoadingCart] = useState(true);

  const [shippingAddress, setShippingAddress] = useState({
    street: "",
    city: "",
    state: "",
    country: "Nigeria",
    postalCode: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("paystack");

  const [bankDetails, setBankDetails] = useState(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [orderPlaced, setOrderPlaced] = useState(false);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const { data } = await api.get("/cart");
        setCart(data.cart);
      } finally {
        setIsLoadingCart(false);
      }
    };
    fetchCart();
  }, []);

  const validItems = (cart?.items || []).filter((item) => item.product);
  const subtotal = validItems.reduce((sum, item) => {
    const price = item.product.discountPrice || item.product.price;
    return sum + price * item.quantity;
  }, 0);

  const handleAddressChange = (field, value) => {
    setShippingAddress((prev) => ({ ...prev, [field]: value }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setOrderError("");
    setIsPlacingOrder(true);

    try {
      const { data } = await api.post("/orders", { shippingAddress, paymentMethod });

      if (paymentMethod === "cash-on-delivery") {
        setOrderPlaced(true);
      } else if (paymentMethod === "bank-transfer") {
        setBankDetails(data.bankDetails);
      } else {
        window.location.href = data.authorizationUrl;
      }
    } catch (err) {
      setOrderError(err.response?.data?.message || "Couldn't place your order. Please try again.");
      setIsPlacingOrder(false);
    }
  };

  if (isLoadingCart) {
    return <div className="text-center py-24 text-charcoal/50">Loading...</div>;
  }

  if (orderPlaced) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <h1 className="font-display text-2xl text-ink mb-2">Order placed!</h1>
        <p className="text-charcoal/60 mb-6">
          Thank you for your order. You can track its progress from your orders page.
        </p>
        <button
          onClick={() => navigate("/orders")}
          className="bg-ink text-cream rounded-md px-6 py-3 font-medium tracking-wide hover:bg-gold-deep transition"
        >
          View my orders
        </button>
      </div>
    );
  }

  if (validItems.length === 0) {
    return (
      <div className="text-center py-24 text-charcoal/60">
        Your cart is empty. Add something before checking out.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 lg:px-8 py-10">
      <h1 className="font-display text-3xl text-ink mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          {bankDetails ? (
            <div className="border border-hairline rounded-lg p-6">
              <h2 className="font-display text-lg text-ink mb-2">Complete your bank transfer</h2>
              <p className="text-sm text-charcoal/60 mb-5">
                Transfer the total amount to the account below, using your order reference
                as the transfer description. Your order will be confirmed once payment is
                verified, usually within 1 business day.
              </p>

              <div className="bg-cream rounded-md p-5 space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-charcoal/60">Bank Name</span>
                  <span className="font-medium text-ink">{bankDetails.bankName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-charcoal/60">Account Name</span>
                  <span className="font-medium text-ink">{bankDetails.accountName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-charcoal/60">Account Number</span>
                  <span className="font-medium text-ink">{bankDetails.accountNumber}</span>
                </div>
                <div className="flex justify-between text-sm pt-3 border-t border-hairline">
                  <span className="text-charcoal/60">Reference (include this)</span>
                  <span className="font-medium text-gold-deep">{bankDetails.reference}</span>
                </div>
              </div>

              <button
                onClick={() => navigate("/orders")}
                className="w-full bg-ink text-cream rounded-md py-3 font-medium tracking-wide hover:bg-gold-deep transition"
              >
                I've made the transfer
              </button>
            </div>
          ) : (
            <form onSubmit={handlePlaceOrder} className="space-y-6">
              <div>
                <h2 className="font-display text-lg text-ink mb-4">Shipping Address</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <input
                    required
                    placeholder="Street address"
                    value={shippingAddress.street}
                    onChange={(e) => handleAddressChange("street", e.target.value)}
                    className="sm:col-span-2 rounded-md border border-hairline px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold transition"
                  />
                  <input
                    required
                    placeholder="City"
                    value={shippingAddress.city}
                    onChange={(e) => handleAddressChange("city", e.target.value)}
                    className="rounded-md border border-hairline px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold transition"
                  />
                  <input
                    required
                    placeholder="State"
                    value={shippingAddress.state}
                    onChange={(e) => handleAddressChange("state", e.target.value)}
                    className="rounded-md border border-hairline px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold transition"
                  />
                  <input
                    required
                    placeholder="Postal code"
                    value={shippingAddress.postalCode}
                    onChange={(e) => handleAddressChange("postalCode", e.target.value)}
                    className="rounded-md border border-hairline px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold transition"
                  />
                  <input
                    required
                    placeholder="Country"
                    value={shippingAddress.country}
                    onChange={(e) => handleAddressChange("country", e.target.value)}
                    className="rounded-md border border-hairline px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold transition"
                  />
                </div>
              </div>

              <div>
                <h2 className="font-display text-lg text-ink mb-4">Payment Method</h2>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 border border-hairline rounded-md px-4 py-3 cursor-pointer">
                    <input
                      type="radio"
                      checked={paymentMethod === "paystack"}
                      onChange={() => setPaymentMethod("paystack")}
                      className="accent-gold"
                    />
                    <span className="text-sm text-charcoal">Pay with card / bank (Paystack)</span>
                  </label>
                  <label className="flex items-center gap-3 border border-hairline rounded-md px-4 py-3 cursor-pointer">
                    <input
                      type="radio"
                      checked={paymentMethod === "cash-on-delivery"}
                      onChange={() => setPaymentMethod("cash-on-delivery")}
                      className="accent-gold"
                    />
                    <span className="text-sm text-charcoal">Cash on delivery</span>
                  </label>
                  <label className="flex items-center gap-3 border border-hairline rounded-md px-4 py-3 cursor-pointer">
                    <input
                      type="radio"
                      checked={paymentMethod === "bank-transfer"}
                      onChange={() => setPaymentMethod("bank-transfer")}
                      className="accent-gold"
                    />
                    <span className="text-sm text-charcoal">Bank transfer</span>
                  </label>
                </div>
              </div>

              {orderError && (
                <div className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-md px-4 py-3">
                  {orderError}
                </div>
              )}

              <button
                type="submit"
                disabled={isPlacingOrder}
                className="w-full bg-ink text-cream rounded-md py-3 font-medium tracking-wide hover:bg-gold-deep disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isPlacingOrder
                  ? "Placing order..."
                  : paymentMethod === "paystack"
                  ? "Continue to Paystack"
                  : "Place order"}
              </button>
            </form>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white border border-hairline rounded-lg p-6">
            <h2 className="font-display text-lg text-ink mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4">
              {validItems.map((item) => (
                <div key={item._id} className="flex justify-between text-sm text-charcoal/70">
                  <span>
                    {item.product.name} × {item.quantity}
                  </span>
                  <span>
                    {formatPrice(
                      (item.product.discountPrice || item.product.price) * item.quantity
                    )}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-hairline pt-4 flex justify-between font-medium text-ink">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <p className="text-xs text-charcoal/50 mt-1">
              Final total including shipping and tax will be confirmed at payment
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;