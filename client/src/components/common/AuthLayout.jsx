function AuthLayout({ eyebrow, title, subtitle, children }) {
  return (
    <div className="min-h-screen flex bg-cream font-body">
      {/* Left panel - brand identity, hidden on small screens */}
      <div className="hidden md:flex md:w-[42%] relative bg-ink text-cream flex-col justify-between p-12 overflow-hidden">
        {/* Subtle pinstripe pattern, evoking woven fabric */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(115deg, #b8924b 0px, #b8924b 1px, transparent 1px, transparent 28px)",
          }}
        />

        {/* Monogram badge */}
        <div className="relative flex items-center gap-3">
          <div className="w-11 h-11 rounded-full border border-gold flex items-center justify-center">
            <span className="font-display text-gold text-sm tracking-wide">F&T</span>
          </div>
          <span className="font-display text-lg tracking-wide">Explicit World</span>
        </div>

        {/* Headline */}
        <div className="relative">
          <p className="text-gold text-xs tracking-[0.2em] uppercase mb-4">
            Made to measure
          </p>
          <h2 className="font-display text-4xl leading-tight mb-4">
            Every garment,
            <br />
            cut to your story.
          </h2>
          <div className="w-16 border-t border-dashed border-gold mb-4" />
          <p className="text-cream/60 text-sm max-w-xs">
            From your measurements to the final stitch, track every step of
            your order in one place.
          </p>
        </div>
      </div>

      {/* Right panel - the actual form content */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-24 py-12">
        <div className="w-full max-w-sm mx-auto">
          {eyebrow && (
            <p className="text-gold text-xs tracking-[0.2em] uppercase mb-3">
              {eyebrow}
            </p>
          )}
          <h1 className="font-display text-3xl text-ink mb-2">{title}</h1>
          {subtitle && <p className="text-charcoal/60 mb-8">{subtitle}</p>}

          {children}
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;