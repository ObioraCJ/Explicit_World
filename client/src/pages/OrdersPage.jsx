import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

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

const orderStatusStyles = {
  processing: "bg-amber-50 text-amber-700 border-amber-200",
  shipped: "bg-blue-50 text-blue-700 border-blue-200",
  delivered: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

const customOrderStatusStyles = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  cutting: "bg-blue-50 text-blue-700 border-blue-200",
  stitching: "bg-blue-50 text-blue-700 border-blue-200",
  fitting: "bg-blue-50 text-blue-700 border-blue-200",
  ready: "bg-green-50 text-green-700 border-green-200",
  delivered: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

function StatusBadge({ status, styles }) {
  return (
    <span
      className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full border capitalize ${
        styles[status] || "bg-hairline/30 text-charcoal/60 border-hairline"
      }`}
    >
      {status}
    </span>
  );
}

function OrdersPage() {
  const [tab, setTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [customOrders, setCustomOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [ordersRes, customOrdersRes] = await Promise.all([
          api.get("/orders/my-orders"),
          api.get("/custom-orders/my-orders"),
        ]);
        setOrders(ordersRes.data.orders);
        setCustomOrders(customOrdersRes.data.orders);
      } catch (err) {
        setError("Couldn't load your orders. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (isLoading) {
    return <div className="text-center py-24 text-charcoal/50">Loading your orders...</div>;
  }

  if (error) {
    return <div className="text-center py-24 text-red-700">{error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-8 py-10">
      <h1 className="font-display text-3xl text-ink mb-6">My Orders</h1>

      <div className="flex gap-6 border-b border-hairline mb-8">
        <button
          onClick={() => setTab("orders")}
          className={`pb-3 text-sm font-medium border-b-2 -mb-px transition ${
            tab === "orders"
              ? "border-ink text-ink"
              : "border-transparent text-charcoal/50 hover:text-charcoal"
          }`}
        >
          Shop Orders ({orders.length})
        </button>
        <button
          onClick={() => setTab("custom")}
          className={`pb-3 text-sm font-medium border-b-2 -mb-px transition ${
            tab === "custom"
              ? "border-ink text-ink"
              : "border-transparent text-charcoal/50 hover:text-charcoal"
          }`}
        >
          Custom Tailoring ({customOrders.length})
        </button>
      </div>

      {tab === "orders" && (
        <>
          {orders.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-charcoal/60 mb-4">You haven't placed any orders yet.</p>
              <Link to="/shop" className="text-gold-deep font-medium hover:underline">
                Browse the shop
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order._id} className="border border-hairline rounded-lg p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div>
                      <p className="text-sm text-charcoal/50">
                        Order placed {formatDate(order.createdAt)}
                      </p>
                      <p className="text-xs text-charcoal/40 font-mono">#{order._id}</p>
                    </div>
                    <StatusBadge status={order.orderStatus} styles={orderStatusStyles} />
                  </div>

                  <div className="space-y-1 mb-3">
                    {order.items.map((item, i) => (
                      <p key={i} className="text-sm text-charcoal/70">
                        {item.name} × {item.quantity}
                      </p>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-hairline">
                    <span className="text-xs text-charcoal/50">
                      {order.isPaid ? "Paid" : "Payment pending"}
                    </span>
                    <span className="font-medium text-ink">{formatPrice(order.totalPrice)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === "custom" && (
        <>
          {customOrders.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-charcoal/60 mb-4">You haven't placed any custom orders yet.</p>
              <Link to="/custom-order" className="text-gold-deep font-medium hover:underline">
                Start a custom order
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {customOrders.map((order) => (
                <div key={order._id} className="border border-hairline rounded-lg p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div>
                      <p className="text-sm text-charcoal/50">
                        Requested {formatDate(order.createdAt)}
                      </p>
                      <p className="text-xs text-charcoal/40 font-mono">#{order._id}</p>
                    </div>
                    <StatusBadge status={order.status} styles={customOrderStatusStyles} />
                  </div>

                  <p className="text-sm text-charcoal/70 mb-1">
                    Fabric: <span className="text-ink">{order.fabricChoice}</span>
                    {order.color && <span> · Color: {order.color}</span>}
                  </p>
                  {order.product && (
                    <p className="text-sm text-charcoal/70 mb-3">
                      Based on: {order.product.name}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-hairline">
                    <span className="text-xs text-charcoal/50">
                      {order.estimatedCompletionDate
                        ? `Est. completion: ${formatDate(order.estimatedCompletionDate)}`
                        : "Completion date not yet set"}
                    </span>
                    <span className="font-medium text-ink">{formatPrice(order.price)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default OrdersPage;