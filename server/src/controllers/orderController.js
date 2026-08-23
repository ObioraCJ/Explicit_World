import asyncHandler from "express-async-handler";
import Stripe from "stripe";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// @desc    Create an order from the user's cart and start a Stripe payment
// @route   POST /api/orders
// @access  Private
export const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod } = req.body;

  const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");

  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error("Your cart is empty");
  }

  // Rebuild each order item as a snapshot, and verify stock is still available
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

  const shippingPrice = itemsPrice > 100000 ? 0 : 2500; // flat rate, free above a threshold
  const taxPrice = Math.round(itemsPrice * 0.075); // example 7.5% VAT
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

  // Cash on delivery skips Stripe entirely - just return the created order
  if (paymentMethod === "cash-on-delivery") {
    cart.items = [];
    await cart.save();
    return res.status(201).json({ success: true, order });
  }

  // Stripe expects amounts in the smallest currency unit (e.g. kobo/cents)
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(totalPrice * 100),
    currency: "ngn",
    metadata: { orderId: order._id.toString(), userId: req.user._id.toString() },
  });

  order.paymentResult = { id: paymentIntent.id, status: paymentIntent.status };
  await order.save();

  res.status(201).json({
    success: true,
    order,
    clientSecret: paymentIntent.client_secret,
  });
});

// @desc    Stripe webhook - confirms payment and finalizes the order
// @route   POST /api/orders/webhook
// @access  Public (verified via Stripe signature, not a user token)
export const stripeWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body, // must be the raw, unparsed body - see server.js
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    const orderId = paymentIntent.metadata.orderId;

    const order = await Order.findById(orderId);
    if (order && !order.isPaid) {
      order.isPaid = true;
      order.paidAt = new Date();
      order.paymentResult = {
        id: paymentIntent.id,
        status: paymentIntent.status,
        updateTime: new Date().toISOString(),
      };
      await order.save();

      // Decrement stock now that payment is actually confirmed
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity },
        });
      }

      // Clear the user's cart now that checkout is fully complete
      await Cart.findOneAndUpdate({ user: order.user }, { items: [] });
    }
  }

  // Always acknowledge receipt so Stripe doesn't keep retrying this event
  res.status(200).json({ received: true });
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