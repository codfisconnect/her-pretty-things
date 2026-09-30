import React, { useEffect, useState } from 'react';
import { Package, ShoppingBag, DollarSign, AlertTriangle } from 'lucide-react';
import { productService } from '../../services/productService';
import { orderService } from '../../services/orderService';
import { useCurrency } from '../../context/CurrencyContext';
import type { Product } from '../../types/Product';
import type { Order } from '../../types/Order';
import './AdminDashboard.css';

export const AdminDashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders] = useState<Order[]>(() => orderService.getStoredOrders());
  const { formatPrice } = useCurrency();

  useEffect(() => {
    productService.getAllProducts().then(setProducts);
  }, []);

  const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
  const lowStock = products.filter(p => p.stock < 15);

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1 className="admin-title">YUSRAA Atelier Admin</h1>
        <span style={{ fontSize: '0.88rem', color: '#8c827a' }}>
          Role: Certified Modest Wear Administrator
        </span>
      </div>

      {/* KPI Stats */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">Total Hijab Revenue</span>
            <DollarSign size={20} color="#9b783e" />
          </div>
          <div className="stat-value">{formatPrice(totalSales)}</div>
        </div>

        <div className="admin-stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">Orders Received</span>
            <ShoppingBag size={20} color="#9b783e" />
          </div>
          <div className="stat-value">{orders.length}</div>
        </div>

        <div className="admin-stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">Active Hijab Designs</span>
            <Package size={20} color="#9b783e" />
          </div>
          <div className="stat-value">{products.length}</div>
        </div>

        <div className="admin-stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">Low Stock Alerts</span>
            <AlertTriangle size={20} color="#b76e00" />
          </div>
          <div className="stat-value">{lowStock.length}</div>
        </div>
      </div>

      {/* Hijab Catalogue Inventory Table */}
      <h2 className="admin-section-heading">Hijab Catalogue &amp; Stock Levels</h2>
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Hijab Name</th>
              <th>Fabric &amp; Category</th>
              <th>Unit Price</th>
              <th>Inventory</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td style={{ fontFamily: 'monospace', color: '#888' }}>{p.id}</td>
                <td style={{ fontWeight: 600 }}>{p.name}</td>
                <td>{p.fabric} ({p.category})</td>
                <td style={{ fontWeight: 600 }}>{formatPrice(p.price)}</td>
                <td>{p.stock} units</td>
                <td>
                  <span className={`admin-badge ${p.stock < 15 ? 'stock-low' : 'confirmed'}`}>
                    {p.stock < 15 ? 'Low Stock' : 'In Stock'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Orders Table */}
      {orders.length > 0 && (
        <div style={{ marginTop: '3.5rem' }}>
          <h2 className="admin-section-heading">Recent Client Orders</h2>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order Reference</th>
                  <th>Client</th>
                  <th>Delivery City</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id}>
                    <td style={{ fontWeight: 700, color: '#9b783e' }}>{o.id}</td>
                    <td>{o.shippingAddress.fullName}</td>
                    <td>{o.shippingAddress.city}, {o.shippingAddress.country}</td>
                    <td>{o.items.length} hijabs</td>
                    <td style={{ fontWeight: 700 }}>{formatPrice(o.total)}</td>
                    <td>
                      <span className="admin-badge confirmed">Confirmed</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
