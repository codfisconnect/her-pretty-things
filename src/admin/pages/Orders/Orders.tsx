import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getAdminOrders,
  type AdminOrder,
} from "../../../services/adminService";
import { AdminState } from "../Dashboard/Dashboard";

function Orders() {
  const [orders, setOrders] = useState<AdminOrder[] | null>(null);
  const [message, setMessage] = useState("");
  useEffect(() => {
    getAdminOrders()
      .then(setOrders)
      .catch((error: unknown) =>
        setMessage(
          error instanceof Error ? error.message : "Could not load orders.",
        ),
      );
  }, []);
  if (!orders) return <AdminState message={message || "Loading orders..."} />;
  return (
    <div className="admin-content">
      <div className="admin-page-heading">
        <div>
          <p className="admin-kicker">Scoop business</p>
          <h2>Orders</h2>
        </div>
      </div>
      <section className="admin-panel">
        <div className="admin-table-head">
          <span>Customer</span>
          <span>Order</span>
          <span>Total</span>
          <span>Payment</span>
          <span>Status</span>
        </div>
        <div className="admin-table-list">
          {orders.length === 0 ? (
            <p className="admin-empty">No orders yet.</p>
          ) : (
            orders.map((order) => (
              <Link
                className="admin-table-row"
                to={`/admin/orders/${order.id}`}
                key={order.id}
              >
                <span>
                  <strong>{order.customer.name}</strong>
                  <small>{order.customer.email}</small>
                </span>
                <span>
                  <strong>{order.orderNumber}</strong>
                  <small>
                    {new Date(order.createdAt).toLocaleDateString("en-IN")}
                  </small>
                </span>
                <strong>₹{order.totalAmount.toLocaleString("en-IN")}</strong>
                <span className="admin-status">{order.paymentStatus}</span>
                <span
                  className={`admin-status status-${order.orderStatus.toLowerCase()}`}
                >
                  {order.orderStatus.replace("_", " ")}
                </span>
              </Link>
            ))
          )}
        </div>
      </section>
      <Link className="admin-mobile-recent" to="/admin">
        Back to dashboard
      </Link>
    </div>
  );
}

export default Orders;
