import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur border-b border-hairline">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full border border-gold flex items-center justify-center">
            <span className="font-display text-gold text-xs tracking-wide">EW</span>
          </div>
          <span className="font-display text-lg text-ink tracking-wide hidden sm:block">
            Explicit World
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-charcoal/70">
          <Link to="/shop" className="hover:text-ink transition">
            Shop
          </Link>
          <Link to="/custom-order" className="hover:text-ink transition">
            Custom Tailoring
          </Link>
          {isAuthenticated && (
            <Link to="/orders" className="hover:text-ink transition">
              My Orders
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            to="/cart"
            className="text-charcoal/70 hover:text-ink transition"
            aria-label="Cart"
          >
            <ShoppingBag size={20} />
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                to="/profile"
                className="flex items-center gap-1.5 text-sm text-charcoal/70 hover:text-ink transition"
              >
                <User size={18} />
                <span className="hidden sm:block">{user.name.split(" ")[0]}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-charcoal/50 hover:text-ink transition"
              >
                Log out
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="bg-ink text-cream text-sm font-medium px-4 py-2 rounded-md hover:bg-gold-deep transition"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;