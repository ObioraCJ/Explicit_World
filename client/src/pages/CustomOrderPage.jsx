import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function CustomOrderPage() {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get("product") || "";
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [measurements, setMeasurements] = useState({
    chest: "",
    waist: "",
    hip: "",
    shoulder: "",
    sleeveLength: "",
    inseam: "",
    neck: "",
    height: "",
    notes: "",
  });
  const [fabricChoice, setFabricChoice] = useState("");
  const [color, setColor] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [referenceImages, setReferenceImages] = useState([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleMeasurementChange = (field, value) => {
    setMeasurements((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e) => {
    setReferenceImages(Array.from(e.target.files).slice(0, 5));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      if (productId) formData.append("product", productId);
      formData.append("fabricChoice", fabricChoice);
      formData.append("color", color);
      formData.append("specialInstructions", specialInstructions);

      const measurementsPayload = {
        chest: Number(measurements.chest),
        waist: Number(measurements.waist),
      };
      ["hip", "shoulder", "sleeveLength", "inseam", "neck", "height"].forEach((field) => {
        if (measurements[field]) measurementsPayload[field] = Number(measurements[field]);
      });
      if (measurements.notes) measurementsPayload.notes = measurements.notes;

      formData.append("measurements", JSON.stringify(measurementsPayload));

      referenceImages.forEach((file) => formData.append("styleReferenceImages", file));

      await api.post("/custom-orders", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSubmitted(true);
    } catch (err) {
      const backendErrors = err.response?.data?.errors;
      if (backendErrors && backendErrors.length > 0) {
        setError(backendErrors.map((e) => e.message).join(" "));
      } else {
        setError(err.response?.data?.message || "Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <h1 className="font-display text-2xl text-ink mb-2">Request received!</h1>
        <p className="text-charcoal/60 mb-6">
          Our team will review your measurements and reach out with a quote and
          timeline shortly. You can track this request from your orders page.
        </p>
        <Link
          to="/orders"
          className="inline-block bg-ink text-cream rounded-md px-6 py-3 font-medium tracking-wide hover:bg-gold-deep transition"
        >
          View my orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 lg:px-8 py-10">
      <p className="text-gold text-xs tracking-[0.2em] uppercase mb-2">Bespoke</p>
      <h1 className="font-display text-3xl text-ink mb-2">Custom Tailoring Request</h1>
      <p className="text-charcoal/60 mb-8">
        Tell us your measurements and preferences, and we'll get back to you with a
        quote and estimated completion date.
      </p>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <h2 className="font-display text-lg text-ink mb-1">Measurements (cm)</h2>
          <p className="text-xs text-charcoal/50 mb-4">Chest and waist are required</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-charcoal tracking-wide mb-1.5">
                CHEST *
              </label>
              <input
                type="number"
                required
                min="1"
                value={measurements.chest}
                onChange={(e) => handleMeasurementChange("chest", e.target.value)}
                className="w-full rounded-md border border-hairline px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-charcoal tracking-wide mb-1.5">
                WAIST *
              </label>
              <input
                type="number"
                required
                min="1"
                value={measurements.waist}
                onChange={(e) => handleMeasurementChange("waist", e.target.value)}
                className="w-full rounded-md border border-hairline px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-charcoal tracking-wide mb-1.5">
                HIP
              </label>
              <input
                type="number"
                min="1"
                value={measurements.hip}
                onChange={(e) => handleMeasurementChange("hip", e.target.value)}
                className="w-full rounded-md border border-hairline px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-charcoal tracking-wide mb-1.5">
                SHOULDER
              </label>
              <input
                type="number"
                min="1"
                value={measurements.shoulder}
                onChange={(e) => handleMeasurementChange("shoulder", e.target.value)}
                className="w-full rounded-md border border-hairline px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-charcoal tracking-wide mb-1.5">
                SLEEVE LENGTH
              </label>
              <input
                type="number"
                min="1"
                value={measurements.sleeveLength}
                onChange={(e) => handleMeasurementChange("sleeveLength", e.target.value)}
                className="w-full rounded-md border border-hairline px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-charcoal tracking-wide mb-1.5">
                INSEAM
              </label>
              <input
                type="number"
                min="1"
                value={measurements.inseam}
                onChange={(e) => handleMeasurementChange("inseam", e.target.value)}
                className="w-full rounded-md border border-hairline px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-charcoal tracking-wide mb-1.5">
                NECK
              </label>
              <input
                type="number"
                min="1"
                value={measurements.neck}
                onChange={(e) => handleMeasurementChange("neck", e.target.value)}
                className="w-full rounded-md border border-hairline px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-charcoal tracking-wide mb-1.5">
                HEIGHT
              </label>
              <input
                type="number"
                min="1"
                value={measurements.height}
                onChange={(e) => handleMeasurementChange("height", e.target.value)}
                className="w-full rounded-md border border-hairline px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold transition"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-medium text-charcoal tracking-wide mb-1.5">
              MEASUREMENT NOTES (optional)
            </label>
            <textarea
              rows={2}
              value={measurements.notes}
              onChange={(e) => handleMeasurementChange("notes", e.target.value)}
              placeholder="e.g. Prefer a slightly loose fit around the waist"
              className="w-full rounded-md border border-hairline px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold transition"
            />
          </div>
        </div>

        <div>
          <h2 className="font-display text-lg text-ink mb-4">Fabric & Style</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-charcoal tracking-wide mb-1.5">
                FABRIC CHOICE *
              </label>
              <input
                type="text"
                required
                value={fabricChoice}
                onChange={(e) => setFabricChoice(e.target.value)}
                placeholder="e.g. Cotton, Linen, Ankara"
                className="w-full rounded-md border border-hairline px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-charcoal tracking-wide mb-1.5">
                COLOR
              </label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="e.g. Navy Blue"
                className="w-full rounded-md border border-hairline px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-charcoal tracking-wide mb-1.5">
              SPECIAL INSTRUCTIONS
            </label>
            <textarea
              rows={3}
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Any specific styling details, occasion, or deadline we should know about"
              className="w-full rounded-md border border-hairline px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold transition"
            />
          </div>
        </div>

        <div>
          <h2 className="font-display text-lg text-ink mb-1">Reference Images (optional)</h2>
          <p className="text-xs text-charcoal/50 mb-3">
            Upload up to 5 photos of styles you'd like us to recreate
          </p>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleFileChange}
            className="block w-full text-sm text-charcoal/70 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-ink file:text-cream file:text-sm file:font-medium hover:file:bg-gold-deep file:cursor-pointer cursor-pointer"
          />
          {referenceImages.length > 0 && (
            <p className="text-xs text-charcoal/50 mt-2">
              {referenceImages.length} file{referenceImages.length !== 1 ? "s" : ""} selected
            </p>
          )}
        </div>

        {error && (
          <div className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-md px-4 py-3">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-ink text-cream rounded-md py-3 font-medium tracking-wide hover:bg-gold-deep disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isSubmitting ? "Submitting..." : "Submit request"}
        </button>
      </form>
    </div>
  );
}

export default CustomOrderPage;