import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const measurementSchema = new mongoose.Schema(
  {
    label: { type: String, default: "Default" },
    chest: Number,
    waist: Number,
    hip: Number,
    shoulder: Number,
    sleeveLength: Number,
    inseam: Number,
    neck: Number,
    height: Number,
    notes: String,
  },
  { _id: true, timestamps: true }
);

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, default: "Home" },
    street: String,
    city: String,
    state: String,
    country: String,
    postalCode: String,
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required"], trim: true },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["customer", "tailor", "admin"],
      default: "customer",
    },
    phone: { type: String, trim: true },
    avatar: { type: String, default: "" },
    addresses: [addressSchema],
    measurements: [measurementSchema],
    refreshToken: { type: String, select: false },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;