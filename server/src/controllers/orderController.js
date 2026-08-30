import asyncHandler from "express-async-handler";
import crypto from "node:crypto";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import paystack from "../config/paystack.js";

const decrementStockForOrder = async (order) => {
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
  }
};

const finalizePaidOrder = async (order) => {
  if (order.isPaid) return order;

  order.isPaid = true;
  order.paidAt = new Date();
  order.paymentResult = {
    id: order.paymentResult?.id,
    status: "success",
    updateTime: new Date().toISOString(),
  };
  await order.save();

  await decrementStockForOrder(order);
  await Cart.findOneAndUpdate({ user: order.user }, { items: [] });

  return order;
};

// @desc    Create an order from the user's cart
// @route   POST /api/orders
// @access  Private
export const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod } = req.body;

  const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");

  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error("Your cart is empty");
  }

  const orderItems = [];
  let itemsPrice = 0;

  for (const cartItem of cart.items) {
    const product = cartItem.product;

    if (!product || !product.isActive) {
      res.status(400);
      throw new Error(`A product in your cart is no longer available`);
    }
    if (product.stock < cartItem.quantity) {
      res.status(400);
      throw new Error(`Only ${product.stock} units of "${product.name}" are in stock`);
    }

    const unitPrice = product.discountPrice || product.price;
    itemsPrice += unitPrice * cartItem.quantity;

    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.images[0],
      price: unitPrice,
      quantity: cartItem.quantity,
      size: cartItem.size,
    });
  }

  const shippingPrice = itemsPrice > 100000 ? 0 : 2500;
  const taxPrice = Math.round(itemsPrice * 0.075);
  const totalPrice = itemsPrice + shippingPrice + taxPrice;

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
  });

  // Cash on delivery and bank transfer are committed immediately - reserve stock now
  if (paymentMethod === "cash-on-delivery" || paymentMethod === "bank-transfer") {
    await decrementStockForOrder(order);
    cart.items = [];
    await cart.save();

    const response = { success: true, order };

    if (paymentMethod === "bank-transfer") {
      response.bankDetails = {
        bankName: process.env.BANK_NAME,
        accountName: process.env.BANK_ACCOUNT_NAME,
        accountNumber: process.env.BANK_ACCOUNT_NUMBER,
        reference: order._id.toString(),
      };
    }

    return res.status(201).json(response);
  }

  // Paystack path: initialize the transaction and get a hosted payment link
  const { data } = await paystack.post("/transaction/initialize", {
    email: req.user.email,
    amount: Math.round(totalPrice * 100), // Paystack expects kobo, not naira
    reference: order._id.toString(),
    callback_url: `${process.env.CLIENT_URL}/payment/callback`,
  });

  order.paymentResult = { id: data.data.reference, status: "pending" };
  await order.save();

  res.status(201).json({
    success: true,
    order,
    authorizationUrl: data.data.authorization_url,
  });
});

// @desc    Verify a Paystack payment after the customer returns from checkout
// @route   GET /api/orders/verify/:reference
// @access  Private
export const verifyPayment = asyncHandler(async (req, res) => {
  const { reference } = req.params;

  const order = await Order.findById(reference);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (order.isPaid) {
    return res.status(200).json({ success: true, order });
  }

  const { data } = await paystack.get(`/transaction/verify/${reference}`);

  if (data.data.status === "success") {
    const updatedOrder = await finalizePaidOrder(order);
    return res.status(200).json({ success: true, order: updatedOrder });
  }

  res.status(400);
  throw new Error("Payment could not be verified. Please contact support if you were charged.");
});

// @desc    Paystack webhook - the authoritative source of truth for payment confirmation
// @route   POST /api/orders/paystack-webhook
// @access  Public (verified via Paystack signature, not a user token)
export const paystackWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers["x-paystack-signature"];

  const expectedSignature = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
    .update(req.body)
    .digest("hex");

  if (signature !== expectedSignature) {
    return res.status(401).json({ success: false, message: "Invalid signature" });
  }

  const event = JSON.parse(req.body.toString());

  if (event.event === "charge.success") {
    const reference = event.data.reference;
    const order = await Order.findById(reference);

    if (order && !order.isPaid) {
      await finalizePaidOrder(order);
    }
  }

  res.status(200).json({ received: true });
});

// @desc    Manually confirm a bank transfer payment once it's been verified
// @route   PUT /api/orders/:id/confirm-payment
// @access  Private/Admin
export const confirmBankTransferPayment = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (order.paymentMethod !== "bank-transfer") {
    res.status(400);
    throw new Error("This endpoint only applies to bank transfer orders");
  }

  if (order.isPaid) {
    res.status(400);
    throw new Error("This order has already been marked as paid");
  }

  order.isPaid = true;
  order.paidAt = new Date();
  order.paymentResult = {
    status: "manually confirmed",
    updateTime: new Date().toISOString(),
  };

  const updatedOrder = await order.save();
  res.status(200).json({ success: true, order: updatedOrder });
});

// @desc    Get the logged-in user's own orders
// @route   GET /api/orders/my-orders
// @access  Private
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, orders });
});

// @desc    Get a single order by ID
// @route   GET /api/orders/:id
// @access  Private (owner or admin)
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user", "name email");

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  const isOwner = order.user._id.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin") {
    res.status(403);
    throw new Error("You are not authorized to view this order");
  }

  res.status(200).json({ success: true, order });
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
export const getAllOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (status) filter.orderStatus = status;

  const pageNum = Math.max(Number(page), 1);
  const limitNum = Math.min(Number(limit), 50);
  const skip = (pageNum - 1) * limitNum;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Order.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    orders,
    pagination: { total, page: pageNum, pages: Math.ceil(total / limitNum) },
  });
});

// @desc    Update order fulfillment status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  order.orderStatus = orderStatus;
  if (orderStatus === "delivered") {
    order.deliveredAt = new Date();
  }

  const updatedOrder = await order.save();
  res.status(200).json({ success: true, order: updatedOrder });
});