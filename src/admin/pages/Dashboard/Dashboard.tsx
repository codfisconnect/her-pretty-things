import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getAdminDashboard,
  type AdminDashboard,
} from "../../../services/adminService";

const money = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;
function Dashboard() {
  const [data, setData] = useState<AdminDashboard | null>(null);
  const [message, setMessage] = useState("");
  useEffect(() => {
    getAdminDashboard()
      .then(setData)
      .catch((error: unknown) =>
        setMessage(
          error instanceof Error ? error.message : "Could not load dashboard.",
        ),
      );
  }, []);
  if (!data) return <AdminState message={message || "Loading dashboard..."} />;
  const cards = [
    ["Total orders", data.metrics.totalOrders],
    ["Pending payment", data.metrics.pendingPayment],
    ["Paid orders", data.metrics.paidOrders],
    ["Processing", data.metrics.processing],
    ["Shipped", data.metrics.shipped],
    ["Revenue", money(data.metrics.revenue)],
  ];
  return (
    <div className="admin-content">
      <div className="admin-page-heading">
        <div>
          <p className="admin-kicker">Today at a glance</p>
          <h2>Dashboard</h2>
        </div>
        <Link className="admin-outline-button" to="/admin/orders">
          View all orders
        </Link>
      </div>
      <div className="admin-metric-grid">
        {cards.map(([label, value]) => (
          <div className="admin-metric" key={String(label)}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <section className="admin-panel">
        <div className="admin-panel-heading">
          <div>
            <p className="admin-kicker">Latest activity</p>
            <h3>Recent orders</h3>
          </div>
          <Link to="/admin/orders">See all</Link>
        </div>
        <AdminOrderRows orders={data.recentOrders} />
      </section>
    </div>
  );
}

export function AdminOrderRows({
  orders,
}: {
  orders: AdminDashboard["recentOrders"];
}) {
  return orders.length === 0 ? (
    <p className="admin-empty">No orders yet.</p>
  ) : (
    <div className="admin-order-list">
      {orders.map((order) => (
        <Link
          className="admin-order-row"
          to={`/admin/orders/${order.id}`}
          key={order.id}
        >
          <span>
            <strong>{order.customer.name}</strong>
            <small>
              {order.orderNumber} ·{" "}
              {new Date(order.createdAt).toLocaleDateString("en-IN")}
            </small>
          </span>
          <span>
            <strong>{money(order.totalAmount)}</strong>
            <small
              className={`admin-status status-${order.orderStatus.toLowerCase()}`}
            >
              {order.orderStatus.replace("_", " ")}
            </small>
          </span>
        </Link>
      ))}
    </div>
  );
}
export function AdminState({ message }: { message: string }) {
  return (
    <div className="admin-content">
      <div className="admin-state">{message}</div>
    </div>
  );
}
export default Dashboard;
