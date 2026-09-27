import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Phone, Package, Heart, LogOut, Check, ArrowRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useWishlist } from '../../context/WishlistContext'
import './Profile.css'

const Profile: React.FC = () => {
  const { user, isAuthenticated, logout, updateProfile } = useAuth()
  const { wishlistCount } = useWishlist()
  const navigate = useNavigate()

  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState('')

  if (!isAuthenticated || !user) {
    return (
      <main className="container profile-page">
        <div className="auth-card" style={{ margin: '2rem auto', textAlign: 'center' }}>
          <h2>Please Sign In</h2>
          <p>Sign in to view your profile and orders.</p>
          <Link to="/login" className="button button-dark" style={{ marginTop: '1rem' }}>
            Go to Login
          </Link>
        </div>
      </main>
    )
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSavedMsg('')
    try {
      await updateProfile({ name: name.trim(), phone: phone.trim() })
      setSavedMsg('Profile updated successfully!')
      setTimeout(() => setSavedMsg(''), 3000)
    } catch (err: any) {
      console.error('Update profile error:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <main className="profile-page container">
      {/* Header */}
      <div className="profile-header">
        <div className="profile-avatar">
          {user.name ? user.name[0].toUpperCase() : 'H'}
        </div>
        <div className="profile-header-info">
          <h1>Hello, {user.name || 'Lovely Customer'}!</h1>
          <p>{user.email}</p>
        </div>
        <button type="button" className="profile-logout-btn" onClick={handleLogout}>
          <LogOut size={15} /> Sign Out
        </button>
      </div>

      {/* Quick Nav Cards */}
      <div className="profile-cards-grid">
        <Link to="/orders" className="profile-nav-card">
          <div className="nav-card-icon orders">
            <Package size={22} />
          </div>
          <div className="nav-card-text">
            <h3>My Orders</h3>
            <p>Track packages & view past receipts</p>
          </div>
          <ArrowRight size={18} className="nav-card-arrow" />
        </Link>

        <Link to="/wishlist" className="profile-nav-card">
          <div className="nav-card-icon wishlist">
            <Heart size={22} fill="#db2777" />
          </div>
          <div className="nav-card-text">
            <h3>My Wishlist ({wishlistCount})</h3>
            <p>View your saved favorite pieces</p>
          </div>
          <ArrowRight size={18} className="nav-card-arrow" />
        </Link>
      </div>

      {/* Edit Details Form */}
      <div className="profile-edit-section">
        <h2>Personal Details</h2>
        {savedMsg && (
          <div className="profile-success-banner">
            <Check size={16} />
            <span>{savedMsg}</span>
          </div>
        )}

        <form onSubmit={handleUpdate} className="profile-form">
          <div className="profile-field">
            <label htmlFor="name">Full Name</label>
            <div className="input-with-icon">
              <User size={17} className="field-icon" />
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
              />
            </div>
          </div>

          <div className="profile-field">
            <label htmlFor="email">Email Address</label>
            <div className="input-with-icon">
              <Mail size={17} className="field-icon" />
              <input
                id="email"
                type="email"
                value={user.email}
                disabled
                style={{ opacity: 0.7, cursor: 'not-allowed' }}
              />
            </div>
          </div>

          <div className="profile-field">
            <label htmlFor="phone">Phone Number</label>
            <div className="input-with-icon">
              <Phone size={17} className="field-icon" />
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
              />
            </div>
          </div>

          <button type="submit" className="profile-save-btn" disabled={saving}>
            {saving ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </main>
  )
}

export default Profile
