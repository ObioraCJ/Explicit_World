import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import api from "../../services/api";

function formatPrice(amount) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const STATUS_OPTIONS = [
  "pending",
  "confirmed",
  "cutting",
  "stitching",
  "fitting",
  "ready",
  "delivered",
  "cancelled",
];

const statusStyles = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  cutting: "bg-blue-50 text-blue-700 border-blue-200",
  stitching: "bg-blue-50 text-blue-700 border-blue-200",
  fitting: "bg-blue-50 text-blue-700 border-blue-200",
  ready: "bg-green-50 text-green-700 border-green-200",
  delivered: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

function AdminCustomOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  // Local draft values for price and estimated completion, per order,
  // so typing doesn't immediately save on every keystroke
  const [drafts, setDrafts] = useState({});

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const { data } = await api.get("/custom-orders", { params });
      setOrders(data.orders);
    } catch (err) {
      setError("Couldn't load custom orders.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const getDraft = (order) =>
    drafts[order._id] || {
      price: order.price || "",
      estimatedCompletionDate: order.estimatedCompletionDate
        ? order.estimatedCompletionDate.slice(0, 10)
        : "",
    };

  const updateDraft = (orderId, field, value) => {
    setDrafts((prev) => ({
      ...prev,
      [orderId]: { ...getDraft({ _id: orderId, ...prev[orderId] }), [field]: value },
    }));
  };

  const updateStatus = async (orderId, status) => {
    setUpdatingId(orderId);
    try {
      const { data } = await api.put(`/custom-orders/${orderId}/status`, { status });
      setOrders((prev) => prev.map((o) => (o._id === orderId ? data.order : o)));
    } catch (err) {
      alert(err.response?.data?.message || "Couldn't update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const saveQuote = async (orderId) => {
    const draft = getDraft({ _id: orderId, ...drafts[orderId] });
    setUpdatingId(orderId);
    try {
      const { data } = await api.put(`/custom-orders/${orderId}/status`, {
        price: draft.price ? Number(draft.price) : undefined,
        estimatedCompletionDate: draft.estimatedCompletionDate || undefined,
      });
      setOrders((prev) => prev.map((o) => (o._id === orderId ? data.order : o)));
    } catch (err) {
      alert(err.response?.data?.message || "Couldn't save quote.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl text-ink">Custom Orders</h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-hairline px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold transition capitalize"
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {isLoading && <p className="text-charcoal/50">Loading...</p>}
      {error && <p className="text-red-700">{error}</p>}

      {!isLoading && !error && (
        <div className="bg-white border border-hairline rounded-lg overflow-hidden">
          {orders.length === 0 ? (
            <p className="text-center py-10 text-charcoal/50">No custom orders found.</p>
          ) : (
            orders.map((order) => {
              const isExpanded = expandedId === order._id;
              const isUpdating = updatingId === order._id;
              const draft = getDraft(order);

              return (
                <div key={order._id} className="border-b border-hairline last:border-0">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : order._id)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-cream/50 transition"
                  >
                    <div className="flex items-center gap-4">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      <div>
                        <p className="text-sm font-medium text-ink">
                          {order.customer?.name || "Unknown customer"}
                        </p>
                        <p className="text-xs text-charcoal/50 font-mono">#{order._id}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-xs text-charcoal/50">
                        {formatDate(order.createdAt)}
                      </span>
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full border capitalize ${
                          statusStyles[order.status]
                        }`}
                      >
                        {order.status}
                      </span>
                      <span className="text-sm font-medium text-ink w-24 text-right">
                        {order.price > 0 ? formatPrice(order.price) : "Unquoted"}
                      </span>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1 bg-cream/30 space-y-4">
                      <div className="grid sm:grid-cols-2 gap-6">
                        <div>
                          <p className="text-xs font-medium text-charcoal/50 tracking-wide mb-1">
                            REQUEST DETAILS
                          </p>
                          <p className="text-sm text-charcoal/70">
                            Fabric: {order.fabricChoice}
                            {order.color && ` · Color: ${order.color}`}
                          </p>
                          <p className="text-sm text-charcoal/70">
                            Chest: {order.measurements.chest}cm · Waist: {order.measurements.waist}cm
                            {order.measurements.hip && ` · Hip: ${order.measurements.hip}cm`}
                          </p>
                          {order.specialInstructions && (
                            <p className="text-sm text-charcoal/70 mt-1">
                              Notes: {order.specialInstructions}
                            </p>
                          )}
                          {order.product && (
                            <p className="text-sm text-charcoal/70 mt-1">
                              Based on: {order.product.name}
                            </p>
                          )}
                        </div>

                        {order.styleReferenceImages?.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-charcoal/50 tracking-wide mb-2">
                              REFERENCE IMAGES
                            </p>
                            <div className="flex gap-2">
                              {order.styleReferenceImages.map((url) => (
                                <a key={url} href={url} target="_blank" rel="noreferrer">
                                  <img
                                    src={url}
                                    alt=""
                                    className="w-16 h-20 rounded-md object-cover"
                                  />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Quote + completion date */}
                      <div className="grid sm:grid-cols-3 gap-3 items-end pt-3 border-t border-hairline">
                        <div>
                          <label className="block text-xs font-medium text-charcoal/50 tracking-wide mb-1">
                            PRICE QUOTE (₦)
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={draft.price}
                            onChange={(e) => updateDraft(order._id, "price", e.target.value)}
                            className="w-full text-sm rounded-md border border-hairline px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold transition"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-charcoal/50 tracking-wide mb-1">
                            EST. COMPLETION
                          </label>
                          <input
                            type="date"
                            value={draft.estimatedCompletionDate}
                            onChange={(e) =>
                              updateDraft(order._id, "estimatedCompletionDate", e.target.value)
                            }
                            className="w-full text-sm rounded-md border border-hairline px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold transition"
                          />
                        </div>
                        <button
                          onClick={() => saveQuote(order._id)}
                          disabled={isUpdating}
                          className="text-sm bg-ink text-cream px-4 py-1.5 rounded-md hover:bg-gold-deep disabled:opacity-50 transition"
                        >
                          Save quote
                        </button>
                      </div>

                      {/* Status update */}
                      <div className="flex items-center gap-2 pt-3 border-t border-hairline">
                        <span className="text-xs text-charcoal/50">Update status:</span>
                        <select
                          value={order.status}
                          disabled={isUpdating}
                          onChange={(e) => updateStatus(order._id, e.target.value)}
                          className="text-xs rounded-md border border-hairline px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold transition capitalize"
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export default AdminCustomOrdersPage;