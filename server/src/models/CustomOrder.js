import mongoose from "mongoose";

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "cutting",
        "stitching",
        "fitting",
        "ready",
        "delivered",
        "cancelled",
      ],
      required: true,
    },
    note: { type: String, trim: true },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const customOrderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: false,
    },

    measurements: {
      chest: { type: Number, required: true },
      waist: { type: Number, required: true },
      hip: Number,
      shoulder: Number,
      sleeveLength: Number,
      inseam: Number,
      neck: Number,
      height: Number,
      notes: String,
    },

    fabricChoice: { type: String, required: [true, "Fabric choice is required"] },
    color: { type: String, trim: true },
    styleReferenceImages: {
      type: [String],
      default: [],
    },
    specialInstructions: { type: String, trim: true },

    assignedTailor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "cutting",
        "stitching",
        "fitting",
        "ready",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },
    statusHistory: [statusHistorySchema],

    estimatedCompletionDate: Date,

      price: {
      type: Number,
      default: 0,
      min: [0, "Price cannot be negative"],
    },
    depositPaid: {
      type: Number,
      default: 0,
      min: 0,
    },
    isFullyPaid: {
      type: Boolean,
      default: false,
    },

    shippingAddress: {
      street: String,
      city: String,
      state: String,
      country: String,
      postalCode: String,
    },
  },
  { timestamps: true }
);

customOrderSchema.pre("save", function () {
  if (this.isNew || this.isModified("status")) {
    this.statusHistory.push({ status: this.status, changedAt: new Date() });
  }
});

const CustomOrder = mongoose.model("CustomOrder", customOrderSchema);
export default CustomOrder;