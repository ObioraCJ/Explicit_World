import asyncHandler from "express-async-handler";
import streamifier from "streamifier";
import CustomOrder from "../models/CustomOrder.js";
import cloudinary from "../config/cloudinary.js";

const uploadBufferToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// @desc    Create a new custom tailoring order
// @route   POST /api/custom-orders
// @access  Private (customer)
export const createCustomOrder = asyncHandler(async (req, res) => {
  const {
    product,
    measurements,
    fabricChoice,
    color,
    specialInstructions,
    price,
    shippingAddress,
  } = req.body;

  let referenceImageUrls = [];
  if (req.files && req.files.length > 0) {
    const uploadPromises = req.files.map((file) =>
      uploadBufferToCloudinary(file.buffer, "explicit-world/custom-orders")
    );
    referenceImageUrls = await Promise.all(uploadPromises);
  }

  const order = await CustomOrder.create({
    customer: req.user._id,
    product: product || undefined,
    measurements: JSON.parse(measurements),
    fabricChoice,
    color,
    specialInstructions,
    styleReferenceImages: referenceImageUrls,
    price: price || 0,
    shippingAddress: shippingAddress ? JSON.parse(shippingAddress) : undefined,
  });

  res.status(201).json({ success: true, order });
});

// @desc    Get the logged-in customer's own orders
// @route   GET /api/custom-orders/my-orders
// @access  Private (customer)
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await CustomOrder.find({ customer: req.user._id })
    .populate("product", "name images slug")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, orders });
});

// @desc    Get a single order by ID (owner, assigned tailor, or admin only)
// @route   GET /api/custom-orders/:id
// @access  Private
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await CustomOrder.findById(req.params.id)
    .populate("product", "name images slug")
    .populate("customer", "name email phone")
    .populate("assignedTailor", "name email");

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  const isOwner = order.customer._id.toString() === req.user._id.toString();
  const isAssignedTailor =
    order.assignedTailor && order.assignedTailor._id.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAssignedTailor && !isAdmin) {
    res.status(403);
    throw new Error("You are not authorized to view this order");
  }

  res.status(200).json({ success: true, order });
});

// @desc    Get all custom orders (with optional status filter)
// @route   GET /api/custom-orders
// @access  Private/Admin/Tailor
export const getAllOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (status) filter.status = status;

  if (req.user.role === "tailor") {
    filter.assignedTailor = req.user._id;
  }

  const pageNum = Math.max(Number(page), 1);
  const limitNum = Math.min(Number(limit), 50);
  const skip = (pageNum - 1) * limitNum;

  const [orders, total] = await Promise.all([
    CustomOrder.find(filter)
      .populate("customer", "name email")
      .populate("product", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    CustomOrder.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    orders,
    pagination: { total, page: pageNum, pages: Math.ceil(total / limitNum) },
  });
});

// @desc    Update order status (and optionally assign a tailor)
// @route   PUT /api/custom-orders/:id/status
// @access  Private/Admin/Tailor
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note, assignedTailor, estimatedCompletionDate, price } = req.body;

  const order = await CustomOrder.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (
    req.user.role === "tailor" &&
    (!order.assignedTailor || order.assignedTailor.toString() !== req.user._id.toString())
  ) {
    res.status(403);
    throw new Error("You can only update orders assigned to you");
  }

  if (status) order.status = status;
  if (assignedTailor) order.assignedTailor = assignedTailor;
  if (estimatedCompletionDate) order.estimatedCompletionDate = estimatedCompletionDate;
  if (price !== undefined) order.price = price;

  if (note && status) {
    order.statusHistory.push({ status, note, changedAt: new Date() });
  }

  const updatedOrder = await order.save();

  const io = req.app.get("io");
  io.to(order.customer.toString()).emit("orderStatusUpdated", {
    orderId: order._id,
    status: order.status,
    updatedAt: order.updatedAt,
  });

  res.status(200).json({ success: true, order: updatedOrder });
});

// @desc    Cancel an order (customer can cancel their own pending order)
// @route   PUT /api/custom-orders/:id/cancel
// @access  Private (customer)
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await CustomOrder.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (order.customer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("You are not authorized to cancel this order");
  }

  if (!["pending", "confirmed"].includes(order.status)) {
    res.status(400);
    throw new Error("This order can no longer be cancelled - it's already in production");
  }

  order.status = "cancelled";
  await order.save();

  res.status(200).json({ success: true, message: "Order cancelled successfully" });
});