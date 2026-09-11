import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-ink text-cream/60">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 grid sm:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-full border border-gold flex items-center justify-center">
              <span className="font-display text-gold text-xs tracking-wide">EW</span>
            </div>
            <span className="font-display text-base text-cream tracking-wide">
              Explicit World
            </span>
          </div>
          <p className="text-sm max-w-xs">
            Ready-made pieces and made-to-measure tailoring, cut by hand.
          </p>
        </div>

        <div>
          <p className="text-xs tracking-[0.15em] uppercase text-cream/40 mb-3">Shop</p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/shop" className="hover:text-cream transition">
                All products
              </Link>
            </li>
            <li>
              <Link to="/custom-order" className="hover:text-cream transition">
                Custom tailoring
              </Link>
            </li>
            <li>
              <Link to="/orders" className="hover:text-cream transition">
                Track an order
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs tracking-[0.15em] uppercase text-cream/40 mb-3">Contact</p>
          <ul className="space-y-2 text-sm">
            <li>hello@explicitworld.com</li>
            <li>+234 800 000 0000</li>
            <li>Lagos, Nigeria</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-cream/10 py-5 text-center text-xs text-cream/40">
        © {new Date().getFullYear()} Explicit World. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;