import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'

// Global Context Providers
import { AuthProvider } from './context/AuthContext'
import { WishlistProvider } from './context/WishlistContext'
import { CartProvider } from './context/CartContext'

// Storefront Layout Elements
import Navbar from './components/Navbar/Navbar'
import Footer from './components/Footer/Footer'
import CartDrawer from './components/CartDrawer/CartDrawer'
import SeasonalCharacterGreeting from './components/SeasonalCharacterGreeting/SeasonalCharacterGreeting'

// Public Store Pages
import Home from './pages/Home/Home'
import Scoops from './pages/Scoops/Scoops'
import Jewellery from './pages/Jewellery/Jewellery'
import Kawaii from './pages/Kawaii/Kawaii'
import Byob from './pages/Byob/Byob'
import PrettyPlayPage from './pages/PrettyPlay/PrettyPlayPage'
import About from './pages/About/About'
import Contact from './pages/Contact/Contact'
import Shipping from './pages/Shipping/Shipping'
import Returns from './pages/Returns/Returns'
import ProductDetails from './pages/ProductDetails/ProductDetails'
import Cart from './pages/Cart/Cart'
import Wishlist from './pages/Wishlist/Wishlist'
import Checkout from './pages/Checkout/Checkout'
import Payment from './pages/Payment/Payment'
import PaymentSuccess from './pages/PaymentSuccess/PaymentSuccess'
import FAQ from './pages/FAQ/FAQ'

// Customer Account Pages
import Login from './pages/Login/Login'
import Register from './pages/Register/Register'
import Profile from './pages/Profile/Profile'
import Orders from './pages/Orders/Orders'
import CustomerOrderDetails from './pages/OrderDetails/CustomerOrderDetails'

// Admin Studio
import AdminRoutes from './admin/routes/AdminRoutes'
import './App.css'

function ScrollToTop() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return null
}

function StoreLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')

  if (isAdmin) {
    return <>{children}</>
  }

  return (
    <>
      <Navbar />
      {children}
      <Footer />
      <CartDrawer />
      <SeasonalCharacterGreeting />
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <ScrollToTop />
            <StoreLayout>
              <Routes>
                {/* Admin Studio */}
                <Route path="/admin/*" element={<AdminRoutes />} />

                {/* Core 4 Shopping Modes */}
                <Route path="/" element={<Home />} />
                <Route path="/scoops" element={<Scoops />} />
                <Route path="/jewellery" element={<Jewellery />} />
                <Route path="/kawaii" element={<Kawaii />} />
                <Route path="/byob" element={<Byob />} />

                {/* Pretty Play Game */}
                <Route path="/play" element={<PrettyPlayPage />} />

                {/* Products & Checkout */}
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/payment/:orderId" element={<Payment />} />
                <Route path="/payment/success/:orderId" element={<PaymentSuccess />} />

                {/* Customer Account */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/orders/:orderId" element={<CustomerOrderDetails />} />

                {/* Brand & Policies */}
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/shipping" element={<Shipping />} />
                <Route path="/return" element={<Returns />} />
                <Route path="/replacement-policy" element={<Returns />} />
                <Route path="/faq" element={<FAQ />} />
              </Routes>
            </StoreLayout>
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
