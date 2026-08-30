import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2 } from "lucide-react";
import api from "../../services/api";

function formatPrice(amount) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get("/products", { params: { limit: 50 } });
      setProducts(data.products);
    } catch (err) {
      setError("Couldn't load products.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;

    setDeletingId(id);
    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Couldn't delete this product.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl text-ink">Products</h1>
        <Link
          to="/admin/products/new"
          className="flex items-center gap-2 bg-ink text-cream text-sm font-medium px-4 py-2.5 rounded-md hover:bg-gold-deep transition"
        >
          <Plus size={16} />
          Add Product
        </Link>
      </div>

      {isLoading && <p className="text-charcoal/50">Loading...</p>}
      {error && <p className="text-red-700">{error}</p>}

      {!isLoading && !error && (
        <div className="bg-white border border-hairline rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-hairline text-left text-charcoal/50">
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Price</th>
                <th className="px-5 py-3 font-medium">Stock</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id} className="border-b border-hairline last:border-0">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.images[0]}
                        alt=""
                        className="w-10 h-12 rounded object-cover bg-hairline/30"
                      />
                      <span className="font-medium text-ink capitalize">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-charcoal/70 capitalize">{product.category}</td>
                  <td className="px-5 py-3 text-charcoal/70">{formatPrice(product.price)}</td>
                  <td className="px-5 py-3 text-charcoal/70">
                    {product.stock === 0 ? (
                      <span className="text-red-700">Out of stock</span>
                    ) : (
                      product.stock
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full border ${
                        product.isActive
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-hairline/30 text-charcoal/50 border-hairline"
                      }`}
                    >
                      {product.isActive ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        to={`/admin/products/${product._id}/edit`}
                        className="text-charcoal/50 hover:text-ink transition"
                        aria-label="Edit"
                      >
                        <Pencil size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete(product._id, product.name)}
                        disabled={deletingId === product._id}
                        className="text-charcoal/50 hover:text-red-700 transition disabled:opacity-50"
                        aria-label="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {products.length === 0 && (
            <p className="text-center py-10 text-charcoal/50">No products yet.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminProductsPage;