import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";
import ProductCard from "../components/product/ProductCard";

const CATEGORIES = [
  { value: "", label: "All" },
  { value: "shirts", label: "Shirts" },
  { value: "trousers", label: "Trousers" },
  { value: "suits", label: "Suits" },
  { value: "dresses", label: "Dresses" },
  { value: "traditional-wear", label: "Traditional Wear" },
  { value: "accessories", label: "Accessories" },
];

function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get("category") || "";
  const page = Number(searchParams.get("page")) || 1;

  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError("");

      try {
        const params = { page };
        if (category) params.category = category;

        const { data } = await api.get("/products", { params });
        setProducts(data.products);
        setPagination(data.pagination);
      } catch (err) {
        setError("Couldn't load products right now. Please try again shortly.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [category, page]);

  const handleCategoryChange = (newCategory) => {
    const params = {};
    if (newCategory) params.category = newCategory;
    setSearchParams(params);
  };

  const goToPage = (newPage) => {
    const params = { page: newPage };
    if (category) params.category = category;
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
      <div className="mb-8">
        <p className="text-gold text-xs tracking-[0.2em] uppercase mb-2">Collection</p>
        <h1 className="font-display text-3xl text-ink">Shop</h1>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => handleCategoryChange(cat.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${
              category === cat.value
                ? "bg-ink text-cream border-ink"
                : "bg-transparent text-charcoal/70 border-hairline hover:border-ink"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="text-center py-20 text-charcoal/50">Loading products...</div>
      )}

      {!isLoading && error && (
        <div className="text-center py-20 text-red-700">{error}</div>
      )}

      {!isLoading && !error && products.length === 0 && (
        <div className="text-center py-20 text-charcoal/50">
          No products found in this category yet.
        </div>
      )}

      {!isLoading && !error && products.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  className={`w-9 h-9 rounded-full text-sm font-medium transition ${
                    p === pagination.page
                      ? "bg-ink text-cream"
                      : "text-charcoal/60 hover:bg-hairline/40"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ShopPage;