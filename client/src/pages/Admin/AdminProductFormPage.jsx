import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { X } from "lucide-react";
import api from "../../services/api";

const CATEGORIES = [
  "shirts",
  "trousers",
  "suits",
  "dresses",
  "traditional-wear",
  "accessories",
  "other",
];

function AdminProductFormPage() {
  const { id } = useParams(); // present only when editing
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "shirts",
    price: "",
    discountPrice: "",
    stock: "",
    sku: "",
    isCustomizable: false,
    fabricOptions: "", // comma-separated in the UI, converted to an array on submit
    availableSizes: "", // same
    tags: "", // same
  });

  const [existingImages, setExistingImages] = useState([]); // URLs already on the product (edit mode)
  const [newImages, setNewImages] = useState([]); // File objects to upload
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEditMode) return;

    const fetchProduct = async () => {
      try {
        // We only have a public "get by slug" route, so we fetch the full list
        // and find this one by id - simplest option without adding a new backend route.
        const { data } = await api.get("/products", { params: { limit: 50 } });
        const product = data.products.find((p) => p._id === id);

        if (!product) {
          setError("Product not found.");
          return;
        }

        setForm({
          name: product.name,
          description: product.description,
          category: product.category,
          price: product.price,
          discountPrice: product.discountPrice || "",
          stock: product.stock,
          sku: product.sku || "",
          isCustomizable: product.isCustomizable,
          fabricOptions: (product.fabricOptions || []).join(", "),
          availableSizes: (product.availableSizes || []).join(", "),
          tags: (product.tags || []).join(", "),
        });
        setExistingImages(product.images);
      } catch (err) {
        setError("Couldn't load this product.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id, isEditMode]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e) => {
    setNewImages(Array.from(e.target.files));
  };

  const removeExistingImage = (url) => {
    setExistingImages((prev) => prev.filter((img) => img !== url));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("category", form.category);
      formData.append("price", form.price);
      if (form.discountPrice) formData.append("discountPrice", form.discountPrice);
      formData.append("stock", form.stock);
      if (form.sku) formData.append("sku", form.sku);
      formData.append("isCustomizable", form.isCustomizable);

      const toArray = (str) =>
        str
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);

      formData.append("fabricOptions", JSON.stringify(toArray(form.fabricOptions)));
      formData.append("availableSizes", JSON.stringify(toArray(form.availableSizes)));
      formData.append("tags", JSON.stringify(toArray(form.tags)));

      newImages.forEach((file) => formData.append("images", file));

      if (isEditMode) {
        await api.put(`/products/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/products", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      navigate("/admin/products");
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

  if (isLoading) {
    return <div className="p-8 text-charcoal/50">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="font-display text-2xl text-ink mb-1">
        {isEditMode ? "Edit Product" : "Add Product"}
      </h1>
      <p className="text-charcoal/60 mb-8">
        {isEditMode
          ? "Update this product's details below."
          : "Fill in the details to add a new product to your shop."}
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-charcoal tracking-wide mb-1.5">
              NAME *
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full rounded-md border border-hairline px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold transition"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-charcoal tracking-wide mb-1.5">
              DESCRIPTION *
            </label>
            <textarea
              required
              rows={3}
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="w-full rounded-md border border-hairline px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-charcoal tracking-wide mb-1.5">
              CATEGORY *
            </label>
            <select
              required
              value={form.category}
              onChange={(e) => handleChange("category", e.target.value)}
              className="w-full rounded-md border border-hairline px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold transition capitalize"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-charcoal tracking-wide mb-1.5">
              SKU
            </label>
            <input
              type="text"
              value={form.sku}
              onChange={(e) => handleChange("sku", e.target.value)}
              className="w-full rounded-md border border-hairline px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-charcoal tracking-wide mb-1.5">
              PRICE (₦) *
            </label>
            <input
              type="number"
              required
              min="0"
              value={form.price}
              onChange={(e) => handleChange("price", e.target.value)}
              className="w-full rounded-md border border-hairline px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-charcoal tracking-wide mb-1.5">
              DISCOUNT PRICE (₦)
            </label>
            <input
              type="number"
              min="0"
              value={form.discountPrice}
              onChange={(e) => handleChange("discountPrice", e.target.value)}
              className="w-full rounded-md border border-hairline px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold transition"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-charcoal tracking-wide mb-1.5">
              STOCK *
            </label>
            <input
              type="number"
              required
              min="0"
              value={form.stock}
              onChange={(e) => handleChange("stock", e.target.value)}
              className="w-full rounded-md border border-hairline px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-charcoal tracking-wide mb-1.5">
              FABRIC OPTIONS
            </label>
            <input
              type="text"
              placeholder="Cotton, Linen, Silk"
              value={form.fabricOptions}
              onChange={(e) => handleChange("fabricOptions", e.target.value)}
              className="w-full rounded-md border border-hairline px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold transition"
            />
            <p className="text-xs text-charcoal/40 mt-1">Comma-separated</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-charcoal tracking-wide mb-1.5">
              AVAILABLE SIZES
            </label>
            <input
              type="text"
              placeholder="S, M, L, XL"
              value={form.availableSizes}
              onChange={(e) => handleChange("availableSizes", e.target.value)}
              className="w-full rounded-md border border-hairline px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold transition"
            />
            <p className="text-xs text-charcoal/40 mt-1">Comma-separated</p>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-charcoal tracking-wide mb-1.5">
              TAGS
            </label>
            <input
              type="text"
              placeholder="wedding, formal, bestseller"
              value={form.tags}
              onChange={(e) => handleChange("tags", e.target.value)}
              className="w-full rounded-md border border-hairline px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold transition"
            />
            <p className="text-xs text-charcoal/40 mt-1">Comma-separated</p>
          </div>

          <div className="sm:col-span-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isCustomizable}
                onChange={(e) => handleChange("isCustomizable", e.target.checked)}
                className="w-4 h-4 rounded border-hairline accent-gold cursor-pointer"
              />
              <span className="text-sm text-charcoal">
                Customers can order this tailored to their own measurements
              </span>
            </label>
          </div>
        </div>

        {/* Images */}
        <div>
          <h2 className="font-display text-lg text-ink mb-3">Images</h2>

          {existingImages.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-4">
              {existingImages.map((url) => (
                <div key={url} className="relative w-20 h-24 rounded-md overflow-hidden">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(url)}
                    className="absolute top-1 right-1 bg-ink/80 text-cream rounded-full p-1 hover:bg-red-700 transition"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <label className="block text-xs font-medium text-charcoal tracking-wide mb-1.5">
            {isEditMode ? "ADD MORE IMAGES" : "IMAGES *"}
          </label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            required={!isEditMode && existingImages.length === 0}
            onChange={handleFileChange}
            className="block w-full text-sm text-charcoal/70 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-ink file:text-cream file:text-sm file:font-medium hover:file:bg-gold-deep file:cursor-pointer cursor-pointer"
          />
          {newImages.length > 0 && (
            <p className="text-xs text-charcoal/50 mt-2">
              {newImages.length} new file{newImages.length !== 1 ? "s" : ""} selected
            </p>
          )}
        </div>

        {error && (
          <div className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-md px-4 py-3">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-ink text-cream rounded-md px-6 py-2.5 font-medium tracking-wide hover:bg-gold-deep disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isSubmitting ? "Saving..." : isEditMode ? "Save changes" : "Create product"}
          </button>
          <Link
            to="/admin/products"
            className="border border-hairline text-charcoal rounded-md px-6 py-2.5 font-medium hover:bg-hairline/20 transition"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

export default AdminProductFormPage;