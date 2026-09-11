import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Shirt, Briefcase, Palette, Watch } from "lucide-react";
import api from "../services/api";
import ProductCard from "../components/product/ProductCard";
import dashImg from "../assets/dash-img.webp";

const CATEGORIES = [
  { value: "suits", label: "Suits", icon: Briefcase },
  { value: "shirts", label: "Shirts", icon: Shirt },
  { value: "traditional-wear", label: "Traditional Wear", icon: Palette },
  { value: "accessories", label: "Accessories", icon: Watch },
];

const PROCESS = ["Consultation", "Measurement", "Creation", "Fitting"];

function Hero() {
  return (
    <section className="relative bg-ink text-cream overflow-hidden 'min-h-[600px]' flex items-center">
      <img
        src={dashImg}
        alt="Model wearing a tailored traditional outfit"
        className="absolute inset-0 w-full h-full object-cover object-top"
      />
      <div className="absolute inset-0 'bg-gradient-to-r' from-ink via-ink/85 to-ink/20" />
      <div className="absolute inset-0 'bg-gradient-to-t' from-ink/70 via-transparent to-transparent" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-20 w-full">
        <div className="max-w-xl">
          <p className="text-gold text-xs tracking-[0.2em] uppercase mb-5">
            Men's Wear · Tailoring · Style
          </p>
          <h1 className="font-display text-4xl sm:text-5xl leading-[1.1] mb-6">
            Wear it now, or
            <br />
            have it made for you.
          </h1>
          <p className="text-cream/70 max-w-md mb-8 leading-relaxed">
            Shop ready-made pieces from the collection, or send us your
            measurements and we'll cut something that's yours alone.
          </p>
          <div className="flex flex-wrap gap-4 mb-6">
            <Link
              to="/shop"
              className="bg-gold text-ink px-6 py-3 rounded-md font-medium tracking-wide hover:bg-gold-deep hover:text-cream transition"
            >
              Shop the collection
            </Link>
            <Link
              to="/custom-order"
              className="border border-cream/40 px-6 py-3 rounded-md font-medium tracking-wide hover:border-gold hover:text-gold transition"
            >
              Start a custom order
            </Link>
          </div>
          <p className="text-gold/80 text-xs tracking-[0.15em] uppercase">
            Wear Confidence · Rule Your World
          </p>
        </div>
      </div>
    </section>
  );
}

function CategorySection() {
  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
      <h2 className="font-display text-2xl text-ink mb-8">Shop by category</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {CATEGORIES.map(({ value, label, icon: Icon }) => (
          <Link
            key={value}
            to={`/shop?category=${value}`}
            className="group border border-hairline rounded-lg p-6 flex flex-col items-center text-center gap-3 hover:border-gold transition"
          >
            <div className="w-12 h-12 rounded-full border border-hairline flex items-center justify-center group-hover:border-gold group-hover:text-gold-deep transition">
              <Icon size={20} className="text-charcoal/70 group-hover:text-gold-deep transition" />
            </div>
            <span className="text-sm font-medium text-ink">{label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function BespokePromo() {
  return (
    <section className="relative bg-ink text-cream overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(115deg, #b8924b 0px, #b8924b 1px, transparent 1px, transparent 28px)",
        }}
      />
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-16 grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <p className="text-gold text-xs tracking-[0.2em] uppercase mb-4">Made to measure</p>
          <h2 className="font-display text-3xl leading-tight mb-4">
            Bring your vision.
            <br />
            We'll build it around you.
          </h2>
          <div className="w-16 border-t border-dashed border-gold mb-4"></div>
          <p className="text-cream/60 max-w-md mb-6">
            Discuss your occasion and style, share your measurements, and
            we'll cut, construct, and fit a garment made specifically for you.
          </p>
          <Link
            to="/custom-order"
            className="inline-block bg-gold text-ink px-6 py-3 rounded-md font-medium tracking-wide hover:bg-gold-deep hover:text-cream transition"
          >
            Start your custom order
          </Link>
        </div>
        <div className="hidden lg:block">
          <div className="border border-cream/15 rounded-lg p-8 space-y-5">
            {PROCESS.map((step, i) => (
              <div key={step} className="flex items-center gap-4">
                <span className="w-8 h-8 rounded-full border border-gold text-gold text-sm flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <span className="text-sm text-cream/80">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function NewArrivals() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get("/products", { params: { limit: 4, sort: "newest" } });
        setProducts(data.products);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (isLoading || products.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-display text-2xl text-ink">New arrivals</h2>
        <Link to="/shop" className="text-sm text-gold-deep font-medium hover:underline">
          View all
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-10">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
}

function HomePage() {
  return (
    <div>
      <Hero />
      <CategorySection />
      <BespokePromo />
      <NewArrivals />
    </div>
  );
}

export default HomePage;