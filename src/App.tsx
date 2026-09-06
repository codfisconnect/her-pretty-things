import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Footer from './components/Footer/Footer'
import Navbar from './components/Navbar/Navbar'
import About from './pages/About/About'
import Cart from './pages/Cart/Cart'
import Home from './pages/Home/Home'
import Jewellery from './pages/Jewellery/Jewellery'
import Kawaii from './pages/Kawaii/Kawaii'
import ProductDetails from './pages/ProductDetails/ProductDetails'
import Payment from './pages/Payment/Payment'
import PaymentSuccess from './pages/PaymentSuccess/PaymentSuccess'
import Shipping from './pages/Shipping/Shipping'
import Scoops from './pages/Scoops/Scoops'
import './App.css'
import AdminRoutes from './admin/routes/AdminRoutes'

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/admin/*" element={<AdminRoutes />} />
        <Route path="/" element={<Home />} />
        <Route path="/scoops" element={<Scoops />} />
        <Route path="/jewellery" element={<Jewellery />} />
        <Route path="/kawaii" element={<Kawaii />} />
        <Route path="/about" element={<About />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/shipping" element={<Shipping />} />
        <Route path="/payment/:orderId" element={<Payment />} />
        <Route path="/payment/success/:orderId" element={<PaymentSuccess />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}

export default App
