import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar/AdminSidebar";
import AdminNavbar from "../components/AdminNavbar/AdminNavbar";
import AdminLogin from "../pages/AdminLogin/AdminLogin";
import Dashboard from "../pages/Dashboard/Dashboard";
import Orders from "../pages/Orders/Orders";
import OrderDetails from "../pages/OrderDetails/OrderDetails";
import { getAdminSession } from "../../services/adminService";
import AddProduct from "../pages/AddProduct/AddProduct";

function AdminRoutes() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  useEffect(() => {
    getAdminSession()
      .then((session) => setAuthenticated(session.authenticated))
      .catch(() => setAuthenticated(false));
  }, []);
  return (
    <Routes>
      <Route
        path="login"
        element={<AdminLogin onLogin={() => setAuthenticated(true)} />}
      />
      <Route
        path="*"
        element={
          authenticated === null ? (
            <div className="admin-loading">Checking admin session...</div>
          ) : authenticated ? (
            <div className="admin-shell">
              <AdminSidebar />
              <div className="admin-main">
                <AdminNavbar />
                <Routes>
                  <Route index element={<Dashboard />} />
                  <Route path="orders" element={<Orders />} />
                  <Route path="orders/:orderId" element={<OrderDetails />} />
				  <Route path="products/add" element={<AddProduct />} />
                  <Route path="*" element={<Navigate to="/admin" replace />} />
                </Routes>
              </div>
            </div>
          ) : (
            <Navigate to="/admin/login" replace />
          )
        }
      />
    </Routes>
  );
}

export default AdminRoutes;
