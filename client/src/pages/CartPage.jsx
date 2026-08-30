import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, X } from "lucide-react";
import api from "../services/api";

function formatPrice(amount) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

function CartPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingItemId, setUpdatingItemId] = useState(null);

  const fetchCart = async () => {
    try {
      const { data } = await api.get("/cart");
      setCart(data.cart);
    } catch (err) {
      setError("Couldn't load your cart. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    setUpdatingItemId(itemId);
    try {
      const { data } = await api.put(`/cart/items/${itemId}`, { quantity: newQuantity });
      setCart(data.cart);
    } catch (err) {
      // Silently ignore - the item's stock limit was likely hit; the UI just won't update
    } finally {
      setUpdatingItemId(null);
    }
  };

  const removeItem = async (itemId) => {
    setUpdatingItemId(itemId);
    try {
      const { data } = await api.delete(`/cart/items/${itemId}`);
      setCart(data.cart);
    } finally {
      setUpdatingItemId(null);
    }
  };

  if (isLoading) {
    return <div className="text-center py-24 text-charcoal/50">Loading your cart...</div>;
  }

  if (error) {
    return <div className="text-center py-24 text-red-700">{error}</div>;
  }

  const items = cart?.items || [];
  const validItems = items.filter((item) => item.product);

  const subtotal = validItems.reduce((sum, item) => {
    const price = item.product.discountPrice || item.product.price;
    return sum + price * item.quantity;
  }, 0);

  if (validItems.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h1 className="font-display text-2xl text-ink mb-2">Your cart is empty</h1>
        <p className="text-charcoal/60 mb-6">Start browsing to add something you love.</p>
        <Link
          to="/shop"
          className="inline-block bg-ink text-cream rounded-md px-6 py-3 font-medium tracking-wide hover:bg-gold-deep transition"
        >
          Go to shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 lg:px-8 py-10">
      <h1 className="font-display text-3xl text-ink mb-8">Your Cart</h1>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 divide-y divide-hairline">
          {validItems.map((item) => {
            const price = item.product.discountPrice || item.product.price;
            const isUpdating = updatingItemId === item._id;

            return (
              <div key={item._id} className={`flex gap-4 py-5 ${isUpdating ? "opacity-50" : ""}`}>
                <Link
                  to={`/products/${item.product.slug}`}
                  className="w-20 h-24 rounded-md overflow-hidden bg-hairline/30 flex-shrink-0"
                >
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </Link>

                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between">
                    <div>
                      <Link
                        to={`/products/${item.product.slug}`}
                        className="text-sm font-medium text-ink capitalize hover:text-gold-deep transition"
                      >
                        {item.product.name}
                      </Link>
                      {item.size && (
                        <p className="text-xs text-charcoal/50 mt-0.5">Size: {item.size}</p>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(item._id)}
                      disabled={isUpdating}
                      className="text-charcoal/40 hover:text-red-700 transition"
                      aria-label="Remove item"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-hairline rounded-md">
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        disabled={isUpdating}
                        className="w-8 h-8 flex items-center justify-center text-charcoal/60 hover:text-ink transition"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        disabled={isUpdating || item.quantity >= item.product.stock}
                        className="w-8 h-8 flex items-center justify-center text-charcoal/60 hover:text-ink transition disabled:opacity-30"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="text-sm font-medium text-ink">
                      {formatPrice(price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white border border-hairline rounded-lg p-6 sticky top-24">
            <h2 className="font-display text-lg text-ink mb-4">Order Summary</h2>
            <div className="flex justify-between text-sm text-charcoal/70 mb-2">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <p className="text-xs text-charcoal/50 mb-4">
              Shipping and taxes calculated at checkout
            </p>
            <button
              onClick={() => navigate("/checkout")}
              className="w-full bg-ink text-cream rounded-md py-3 font-medium tracking-wide hover:bg-gold-deep transition"
            >
              Proceed to checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartPage;