import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Star } from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function formatPrice(amount) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [addToCartStatus, setAddToCartStatus] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      setError("");
      try {
        const { data } = await api.get(`/products/${slug}`);
        setProduct(data.product);
        setActiveImage(0);
        setSelectedSize(data.product.availableSizes?.[0] || "");
      } catch (err) {
        setError("This product could not be found.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setAddToCartStatus("loading");
    try {
      await api.post("/cart/items", {
        productId: product._id,
        quantity,
        size: selectedSize || undefined,
      });
      setAddToCartStatus("success");
      setTimeout(() => setAddToCartStatus(""), 2500);
    } catch (err) {
      setAddToCartStatus("error");
    }
  };

  if (isLoading) {
    return <div className="text-center py-24 text-charcoal/50">Loading...</div>;
  }

  if (error || !product) {
    return (
      <div className="text-center py-24">
        <p className="text-charcoal/60 mb-4">{error}</p>
        <Link to="/shop" className="text-gold-deep font-medium hover:underline">
          Back to shop
        </Link>
      </div>
    );
  }

  const hasDiscount = product.discountPrice && product.discountPrice < product.price;

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
      <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
        <div>
          <div className="aspect-[3/4] rounded-lg overflow-hidden bg-hairline/30 mb-3">
            <img
              src={product.images[activeImage]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={img}
                  onClick={() => setActiveImage(i)}
                  className={`w-16 h-20 rounded-md overflow-hidden border-2 transition ${
                    i === activeImage ? "border-gold" : "border-transparent"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          {product.isCustomizable && (
            <span className="inline-block bg-ink text-cream text-[11px] font-medium tracking-wide px-2.5 py-1 rounded-full mb-3">
              Made to order
            </span>
          )}

          <h1 className="font-display text-3xl text-ink capitalize mb-2">{product.name}</h1>

          <div className="flex items-center gap-3 mb-4">
            <span className="text-xl text-charcoal">
              {formatPrice(hasDiscount ? product.discountPrice : product.price)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-charcoal/40 line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {product.numReviews > 0 && (
            <div className="flex items-center gap-1.5 mb-6 text-sm text-charcoal/60">
              <Star size={16} className="fill-gold text-gold" />
              <span>{product.averageRating.toFixed(1)}</span>
              <span>
                ({product.numReviews} review{product.numReviews !== 1 ? "s" : ""})
              </span>
            </div>
          )}

          <p className="text-charcoal/70 leading-relaxed mb-6">{product.description}</p>

          {product.availableSizes?.length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-medium text-charcoal tracking-wide mb-2">SIZE</p>
              <div className="flex gap-2">
                {product.availableSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-11 h-11 rounded-md border text-sm font-medium transition ${
                      selectedSize === size
                        ? "bg-ink text-cream border-ink"
                        : "border-hairline text-charcoal/70 hover:border-ink"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6">
            <p className="text-xs font-medium text-charcoal tracking-wide mb-2">QUANTITY</p>
            <div className="flex items-center border border-hairline rounded-md w-fit">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-10 h-10 text-charcoal/60 hover:text-ink transition"
              >
                −
              </button>
              <span className="w-10 text-center text-sm">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                className="w-10 h-10 text-charcoal/60 hover:text-ink transition"
              >
                +
              </button>
            </div>
            {product.stock <= 5 && product.stock > 0 && (
              <p className="text-xs text-gold-deep mt-2">Only {product.stock} left in stock</p>
            )}
          </div>

          <div className="space-y-3">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0 || addToCartStatus === "loading"}
              className="w-full bg-ink text-cream rounded-md py-3 font-medium tracking-wide hover:bg-gold-deep disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {product.stock === 0
                ? "Out of stock"
                : addToCartStatus === "loading"
                ? "Adding..."
                : addToCartStatus === "success"
                ? "Added to cart ✓"
                : "Add to cart"}
            </button>

            {addToCartStatus === "error" && (
              <p className="text-sm text-red-700">
                Couldn't add this to your cart. Please try again.
              </p>
            )}

            {product.isCustomizable && (
              <Link
                to={`/custom-order?product=${product._id}`}
                className="block w-full text-center border border-ink text-ink rounded-md py-3 font-medium tracking-wide hover:bg-ink hover:text-cream transition"
              >
                Order tailored to my measurements
              </Link>
            )}
          </div>
        </div>
      </div>

      {product.reviews.length > 0 && (
        <div className="mt-16 max-w-2xl">
          <h2 className="font-display text-2xl text-ink mb-6">
            Reviews ({product.numReviews})
          </h2>
          <div className="space-y-6">
            {product.reviews.map((review) => (
              <div key={review._id} className="border-b border-hairline pb-6">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={
                          i < review.rating
                            ? "fill-gold text-gold"
                            : "fill-transparent text-hairline"
                        }
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-ink">{review.name}</span>
                </div>
                {review.comment && (
                  <p className="text-sm text-charcoal/70">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductDetailPage;