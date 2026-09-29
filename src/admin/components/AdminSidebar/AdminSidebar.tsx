import {
	BarChart3,
	LogOut,
	Package,
	PackageSearch,
	Plus,
	Settings2,
	X,
} from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { adminLogout } from '../../../services/adminService'

interface AdminSidebarProps {
	mobileOpen?: boolean
	onClose?: () => void
}

function AdminSidebar({ mobileOpen = false, onClose }: AdminSidebarProps) {
	const navigate = useNavigate()

	const logout = async () => {
		await adminLogout().catch(() => undefined)
		navigate('/admin/login')
	}

	return (
		<>
			{mobileOpen && (
				<div
					className="admin-mobile-overlay"
					onClick={onClose}
					aria-hidden="true"
				/>
			)}

			<aside className={`admin-sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
				<div className="admin-brand-header">
					<div className="admin-brand">
						<span className="brand-mark">✦</span>
						<div className="admin-brand-text">
							<strong>Her Pretty Things</strong>
							<small>Admin Studio</small>
						</div>
					</div>
					{onClose && (
						<button
							type="button"
							className="admin-sidebar-close-btn"
							onClick={onClose}
							aria-label="Close navigation menu"
						>
							<X size={18} />
						</button>
					)}
				</div>

				<nav>
					<NavLink to="/admin" end onClick={onClose}>
						<BarChart3 size={17} />
						Dashboard
					</NavLink>

					<NavLink to="/admin/orders" onClick={onClose}>
						<PackageSearch size={17} />
						Orders
					</NavLink>

					<NavLink to="/admin/products" onClick={onClose}>
						<Package size={17} />
						Products
					</NavLink>

					<NavLink to="/admin/scoop-management" onClick={onClose}>
						<Settings2 size={17} />
						Scoop Management
					</NavLink>

					<NavLink to="/admin/products/add" onClick={onClose}>
						<Plus size={17} />
						Add Product
					</NavLink>
				</nav>

				<button
					className="admin-logout"
					type="button"
					onClick={logout}
				>
					<LogOut size={16} />
					Log out
				</button>
			</aside>
		</>
	)
}

export default AdminSidebar