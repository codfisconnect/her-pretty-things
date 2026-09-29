import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Heart, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import './Auth.css'

const Login: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = (location.state as any)?.from?.pathname || '/profile'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      await login(email.trim(), password)
      navigate(from, { replace: true })
    } catch (err: any) {
      setError(err?.message || 'Invalid email or password. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-page container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon-wrap">
            <Heart size={24} fill="#db2777" color="#db2777" />
          </div>
          <h1>Welcome Back</h1>
          <p>Sign in to view your orders, wishlist, and pretty perks.</p>
        </div>

        {error && (
          <div className="auth-error-banner" role="alert">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label htmlFor="email">Email Address</label>
            <div className="input-with-icon">
              <Mail size={17} className="field-icon" />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                autoComplete="email"
              />
            </div>
          </div>

          <div className="auth-field">
            <div className="label-with-link">
              <label htmlFor="password">Password</label>
            </div>
            <div className="input-with-icon">
              <Lock size={17} className="field-icon" />
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign In'} <ArrowRight size={16} />
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account yet?{' '}
            <Link to="/register" className="auth-link">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}

export default Login
