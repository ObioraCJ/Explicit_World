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

const STATUS_OPTIONS = ["processing", "shipped", "delivered", "cancelled"];

const statusStyles = {
  processing: "bg-amber-50 text-amber-700 border-amber-200",
  shipped: "bg-blue-50 text-blue-700 border-blue-200",
  delivered: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const { data } = await api.get("/orders", { params });
      setOrders(data.orders);
    } catch (err) {
      setError("Couldn't load orders.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const updateStatus = async (orderId, orderStatus) => {
    setUpdatingId(orderId);
    try {
      const { data } = await api.put(`/orders/${orderId}/status`, { orderStatus });
      setOrders((prev) => prev.map((o) => (o._id === orderId ? data.order : o)));
    } catch (err) {
      alert(err.response?.data?.message || "Couldn't update order status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const confirmBankTransfer = async (orderId) => {
    if (!window.confirm("Confirm you've received this bank transfer payment?")) return;

    setUpdatingId(orderId);
    try {
      const { data } = await api.put(`/orders/${orderId}/confirm-payment`);
      setOrders((prev) => prev.map((o) => (o._id === orderId ? data.order : o)));
    } catch (err) {
      alert(err.response?.data?.message || "Couldn't confirm payment.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl text-ink">Orders</h1>
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
            <p className="text-center py-10 text-charcoal/50">No orders found.</p>
          ) : (
            orders.map((order) => {
              const isExpanded = expandedId === order._id;
              const isUpdating = updatingId === order._id;

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
                          {order.user?.name || "Unknown customer"}
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
                          statusStyles[order.orderStatus]
                        }`}
                      >
                        {order.orderStatus}
                      </span>
                      <span className="text-sm font-medium text-ink w-24 text-right">
                        {formatPrice(order.totalPrice)}
                      </span>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1 bg-cream/30">
                      <div className="grid sm:grid-cols-2 gap-6 mb-4">
                        <div>
                          <p className="text-xs font-medium text-charcoal/50 tracking-wide mb-1">
                            ITEMS
                          </p>
                          {order.items.map((item, i) => (
                            <p key={i} className="text-sm text-charcoal/70">
                              {item.name} × {item.quantity} — {formatPrice(item.price * item.quantity)}
                            </p>
                          ))}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-charcoal/50 tracking-wide mb-1">
                            SHIPPING ADDRESS
                          </p>
                          <p className="text-sm text-charcoal/70">
                            {order.shippingAddress.street}, {order.shippingAddress.city},{" "}
                            {order.shippingAddress.state}, {order.shippingAddress.country}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-hairline">
                        <span className="text-xs text-charcoal/50">
                          Payment: {order.paymentMethod} ·{" "}
                          {order.isPaid ? (
                            <span className="text-green-700 font-medium">Paid</span>
                          ) : (
                            <span className="text-amber-700 font-medium">Pending</span>
                          )}
                        </span>

                        {order.paymentMethod === "bank-transfer" && !order.isPaid && (
                          <button
                            onClick={() => confirmBankTransfer(order._id)}
                            disabled={isUpdating}
                            className="text-xs bg-ink text-cream px-3 py-1.5 rounded-md hover:bg-gold-deep disabled:opacity-50 transition"
                          >
                            Confirm payment received
                          </button>
                        )}

                        <div className="flex items-center gap-2 ml-auto">
                          <span className="text-xs text-charcoal/50">Update status:</span>
                          <select
                            value={order.orderStatus}
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

export default AdminOrdersPage;