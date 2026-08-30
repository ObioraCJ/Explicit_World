import { NavLink, Outlet, Link } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingBag, Scissors } from "lucide-react";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/custom-orders", label: "Custom Orders", icon: Scissors },
];

function AdminLayout() {
  return (
    <div className="min-h-screen flex bg-cream">
      <aside className="w-60 flex-shrink-0 bg-ink text-cream flex flex-col">
        <Link to="/" className="flex items-center gap-2.5 px-6 py-5 border-b border-cream/10">
          <div className="w-8 h-8 rounded-full border border-gold flex items-center justify-center">
            <span className="font-display text-gold text-xs tracking-wide">EW</span>
          </div>
          <span className="font-display text-base tracking-wide">Admin</span>
        </Link>

        <nav className="flex-1 py-4">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-6 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-cream/10 text-gold border-r-2 border-gold"
                    : "text-cream/70 hover:bg-cream/5 hover:text-cream"
                }`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        <Link
          to="/"
          className="px-6 py-4 text-sm text-cream/50 hover:text-cream transition border-t border-cream/10"
        >
          ← Back to store
        </Link>
      </aside>

      <main className="flex-1 overflow-x-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;