import { Link } from "react-router-dom";

function formatPrice(amount) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

function ProductCard({ product }) {
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;

  return (
    <Link to={`/products/${product.slug}`} className="group block">
      <div className="aspect-[3/4] rounded-lg overflow-hidden bg-hairline/30 mb-3 relative">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
        />
        {product.isCustomizable && (
          <span className="absolute top-3 left-3 bg-ink text-cream text-[11px] font-medium tracking-wide px-2.5 py-1 rounded-full">
            Made to order
          </span>
        )}
      </div>

      <h3 className="text-sm font-medium text-ink capitalize mb-1 group-hover:text-gold-deep transition">
        {product.name}
      </h3>

      <div className="flex items-center gap-2">
        <span className="text-sm text-charcoal/70">
          {formatPrice(hasDiscount ? product.discountPrice : product.price)}
        </span>
        {hasDiscount && (
          <span className="text-xs text-charcoal/40 line-through">
            {formatPrice(product.price)}
          </span>
        )}
      </div>
    </Link>
  );
}

export default ProductCard;