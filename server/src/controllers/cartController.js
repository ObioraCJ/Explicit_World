import asyncHandler from "express-async-handler";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// @desc    Get the logged-in user's cart (creates an empty one if none exists yet)
// @route   GET /api/cart
// @access  Private
export const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate(
    "items.product",
    "name images price discountPrice stock isActive"
  );

  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  res.status(200).json({ success: true, cart });
});

// @desc    Add an item to the cart (or increase quantity if it's already there)
// @route   POST /api/cart/items
// @access  Private
export const addCartItem = asyncHandler(async (req, res) => {
  const { productId, quantity = 1, size } = req.body;

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    res.status(404);
    throw new Error("Product not found");
  }

  if (product.stock < quantity) {
    res.status(400);
    throw new Error(`Only ${product.stock} units of this product are in stock`);
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  const existingItem = cart.items.find(
    (item) => item.product.toString() === productId && item.size === size
  );

  if (existingItem) {
    existingItem.quantity += Number(quantity);
  } else {
    cart.items.push({ product: productId, quantity, size });
  }

  await cart.save();
  await cart.populate("items.product", "name images price discountPrice stock isActive");

  res.status(200).json({ success: true, cart });
});

// @desc    Update the quantity of a specific cart item
// @route   PUT /api/cart/items/:itemId
// @access  Private
export const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    res.status(400);
    throw new Error("Quantity must be at least 1");
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }

  const item = cart.items.id(req.params.itemId);
  if (!item) {
    res.status(404);
    throw new Error("Item not found in cart");
  }

  const product = await Product.findById(item.product);
  if (product && product.stock < quantity) {
    res.status(400);
    throw new Error(`Only ${product.stock} units of this product are in stock`);
  }

  item.quantity = quantity;
  await cart.save();
  await cart.populate("items.product", "name images price discountPrice stock isActive");

  res.status(200).json({ success: true, cart });
});

// @desc    Remove a single item from the cart
// @route   DELETE /api/cart/items/:itemId
// @access  Private
export const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }

  cart.items = cart.items.filter((item) => item._id.toString() !== req.params.itemId);

  await cart.save();
  await cart.populate("items.product", "name images price discountPrice stock isActive");

  res.status(200).json({ success: true, cart });
});

// @desc    Clear all items from the cart (e.g. after a successful checkout)
// @route   DELETE /api/cart
// @access  Private
export const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (cart) {
    cart.items = [];
    await cart.save();
  }

  res.status(200).json({ success: true, message: "Cart cleared" });
});