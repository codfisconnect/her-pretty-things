import {
	BarChart3,
	LogOut,
	Package,
	PackageSearch,
	Plus,
	Settings2,
} from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { adminLogout } from '../../../services/adminService'

function AdminSidebar() {
	const navigate = useNavigate()

	const logout = async () => {
		await adminLogout().catch(() => undefined)
		navigate('/api/admin/login')
	}

	return (
		<aside className="admin-sidebar">
			<div className="admin-brand">
				<span className="brand-mark">✦</span>
				<span>
					Her Pretty Things
					<br />
					<small>Admin studio</small>
				</span>
			</div>

			<nav>
				<NavLink to="/admin" end>
					<BarChart3 size={17} />
					Dashboard
				</NavLink>

				<NavLink to="/admin/orders">
					<PackageSearch size={17} />
					Orders
				</NavLink>
				<NavLink to="/admin/products">
					<Package size={17} />
					Products
				</NavLink>

				<NavLink to="/admin/scoop-management">
					<Settings2 size={17} />
					Scoop Management
				</NavLink>

				<NavLink to="/admin/products/add">
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
	)
}

export default AdminSidebar