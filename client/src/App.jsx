import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/common/Navbar";
import LoginPage from "./pages/Auth/LoginPage";
import RegisterPage from "./pages/Auth/RegisterPage";
import ForgotPasswordPage from "./pages/Auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/Auth/ResetPasswordPage";
import ShopPage from "./pages/ShopPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import PaymentCallbackPage from "./pages/PaymentCallbackPage";
import OrdersPage from "./pages/OrdersPage";
import CustomOrderPage from "./pages/CustomOrderPage";
import AdminRoute from "./routes/AdminRoute";
import AdminLayout from "./pages/Admin/AdminLayout";
import AdminDashboardPage from "./pages/Admin/AdminDashboardPage";
import AdminProductsPage from "./pages/Admin/AdminProductsPage";
import AdminProductFormPage from "./pages/Admin/AdminProductFormPage";
import AdminOrdersPage from "./pages/Admin/AdminOrdersPage";

function Home() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-cream">
      <div className="text-center">
        <h1 className="font-display text-4xl text-ink mb-2">Explicit World</h1>
        <p className="text-charcoal/60">Home page coming soon.</p>
      </div>
    </div>
  );
}

function SiteLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SiteLayout><Home /></SiteLayout>} />
          <Route path="/shop" element={<SiteLayout><ShopPage /></SiteLayout>} />
          <Route path="/products/:slug" element={<SiteLayout><ProductDetailPage /></SiteLayout>} />
          <Route path="/cart" element={<SiteLayout><CartPage /></SiteLayout>} />
          <Route path="/checkout" element={<SiteLayout><CheckoutPage /></SiteLayout>} />
          <Route path="/payment/callback" element={<SiteLayout><PaymentCallbackPage /></SiteLayout>} />
          <Route path="/orders" element={<SiteLayout><OrdersPage /></SiteLayout>} />
          <Route path="/custom-order" element={<SiteLayout><CustomOrderPage /></SiteLayout>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboardPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="products/new" element={<AdminProductFormPage />} />
            <Route path="products/:id/edit" element={<AdminProductFormPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;