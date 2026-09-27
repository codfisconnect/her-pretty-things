import { Menu } from 'lucide-react'

interface AdminNavbarProps {
	onToggleMobile?: () => void
}

function AdminNavbar({ onToggleMobile }: AdminNavbarProps) {
	return (
		<header className="admin-topbar">
			<div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
				{onToggleMobile && (
					<button
						type="button"
						className="admin-hamburger-btn"
						onClick={onToggleMobile}
						aria-label="Open navigation menu"
					>
						<Menu size={20} />
					</button>
				)}
				<div>
					<p className="admin-kicker">Her Pretty Things</p>
					<h1>Operations overview</h1>
				</div>
			</div>
			<span className="admin-live-dot">Admin access</span>
		</header>
	)
}

export default AdminNavbar
