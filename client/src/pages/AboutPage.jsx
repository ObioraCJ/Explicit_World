import { Link } from "react-router-dom";
import { Ruler, Sparkles, Palette, CalendarCheck } from "lucide-react";

const STANDARDS = [
  {
    icon: Ruler,
    title: "Precision Fit",
    description: "Measurements and proportions are considered for a clean, confident silhouette.",
  },
  {
    icon: Sparkles,
    title: "Quality Finishing",
    description: "Attention to seams, structure, buttons, collars, cuffs and presentation.",
  },
  {
    icon: Palette,
    title: "Personal Style",
    description: "Custom colours, fabrics and design details allow each client to stand apart.",
  },
  {
    icon: CalendarCheck,
    title: "Occasion Ready",
    description: "Wedding, corporate, traditional, formal and smart-casual dressing.",
  },
];

const COLLECTIONS = [
  {
    name: "Agbada Collection",
    description: "Regal traditional silhouettes crafted for weddings, celebrations and statement occasions.",
    category: "traditional-wear",
  },
  {
    name: "Senator Collection",
    description: "Clean Nigerian native tailoring with refined structure, comfort and confident detail.",
    category: "traditional-wear",
  },
  {
    name: "Suits & Tuxedos",
    description: "Sharp contemporary tailoring for executives, weddings, ceremonies and formal events.",
    category: "suits",
  },
  {
    name: "Trousers & Separates",
    description: "Precisely cut trousers and versatile separates designed to complete your wardrobe.",
    category: "trousers",
  },
];

const PROCESS = [
  { title: "Consultation", description: "Discuss the occasion, preferred style, colour and design details." },
  { title: "Measurement", description: "Accurate measurements and fit preferences are recorded." },
  { title: "Creation", description: "Your garment is cut, constructed and finished with attention to detail." },
  { title: "Fitting", description: "Final fitting and adjustments ensure a polished result." },
];

function AboutPage() {
  return (
    <div>
      <section className="bg-ink text-cream">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 py-20 text-center">
          <p className="text-gold text-xs tracking-[0.2em] uppercase mb-4">
            Men's Wear · Tailoring · Style
          </p>
          <h1 className="font-display text-4xl mb-6">The Explicit World Standard</h1>
          <p className="text-cream/70 leading-relaxed max-w-2xl mx-auto">
            Explicit World is a premium men's tailoring brand focused on creating garments
            that look distinguished, fit confidently and feel made for the individual. From
            Nigerian native wear to modern suits, every piece is shaped around clean
            finishing, strong proportions and timeless masculine style.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STANDARDS.map(({ icon: Icon, title, description }) => (
            <div key={title} className="border border-hairline rounded-lg p-6">
              <div className="w-11 h-11 rounded-full border border-gold flex items-center justify-center mb-4">
                <Icon size={18} className="text-gold-deep" />
              </div>
              <h3 className="font-display text-lg text-ink mb-2">{title}</h3>
              <p className="text-sm text-charcoal/60 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-cream border-y border-hairline">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-16">
          <h2 className="font-display text-2xl text-ink mb-8">Our Collections</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {COLLECTIONS.map((collection) => (
              <Link
                key={collection.name}
                to={`/shop?category=${collection.category}`}
                className="group block border border-hairline rounded-lg p-6 hover:border-gold transition"
              >
                <h3 className="font-display text-lg text-ink mb-2 group-hover:text-gold-deep transition">
                  {collection.name}
                </h3>
                <p className="text-sm text-charcoal/60 leading-relaxed">
                  {collection.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 lg:px-8 py-16">
        <p className="text-gold-deep text-xs tracking-[0.2em] uppercase mb-2">
          Custom Tailoring
        </p>
        <h2 className="font-display text-2xl text-ink mb-3">
          Bring your vision. We turn measurements, fabric and design ideas into a
          finished garment built around you.
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
          {PROCESS.map((step, i) => (
            <div key={step.title}>
              <span className="inline-block w-8 h-8 rounded-full border border-gold text-gold-deep text-sm flex items-center justify-center mb-3">
                {i + 1}
              </span>
              <h3 className="font-medium text-ink mb-1">{step.title}</h3>
              <p className="text-sm text-charcoal/60 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-ink text-cream text-center">
        <div className="max-w-2xl mx-auto px-6 lg:px-8 py-16">
          <h2 className="font-display text-3xl mb-2">
            Your style. Your fit. Your statement.
          </h2>
          <p className="text-gold text-sm tracking-[0.15em] uppercase mb-8">
            Wear Confidence · Rule Your World
          </p>
          <Link
            to="/custom-order"
            className="inline-block bg-gold text-ink px-6 py-3 rounded-md font-medium tracking-wide hover:bg-gold-deep hover:text-cream transition"
          >
            Start your custom order
          </Link>
        </div>
      </section>
    </div>
  );
}

export default AboutPage;