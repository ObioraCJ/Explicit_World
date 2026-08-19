import asyncHandler from "express-async-handler";
import streamifier from "streamifier";
import Product from "../models/Product.js";
import cloudinary from "../config/cloudinary.js";

// Helper: uploads a single file buffer to Cloudinary and returns the resulting URL
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

// @desc    Create a new product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    category,
    price,
    discountPrice,
    isCustomizable,
    fabricOptions,
    availableSizes,
    stock,
    sku,
    tags,
  } = req.body;

  if (!req.files || req.files.length === 0) {
    res.status(400);
    throw new Error("At least one product image is required");
  }

  const uploadPromises = req.files.map((file) =>
    uploadBufferToCloudinary(file.buffer, "explicit-world/products")
  );
  const imageUrls = await Promise.all(uploadPromises);

  const product = await Product.create({
    name,
    description,
    category,
    price,
    discountPrice: discountPrice || undefined,
    isCustomizable: isCustomizable === "true" || isCustomizable === true,
    fabricOptions: fabricOptions ? JSON.parse(fabricOptions) : [],
    availableSizes: availableSizes ? JSON.parse(availableSizes) : [],
    stock,
    sku: sku || undefined,
    tags: tags ? JSON.parse(tags) : [],
    images: imageUrls,
    createdBy: req.user._id,
  });

  res.status(201).json({ success: true, product });
});

// @desc    Get all products with filtering, search, sorting, and pagination
// @route   GET /api/products
// @access  Public
export const getProducts = asyncHandler(async (req, res) => {
  const {
    category,
    minPrice,
    maxPrice,
    isCustomizable,
    search,
    sort,
    page = 1,
    limit = 12,
  } = req.query;

  const filter = { isActive: true };

  if (category) filter.category = category;
  if (isCustomizable) filter.isCustomizable = isCustomizable === "true";
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { tags: { $regex: search, $options: "i" } },
    ];
  }

  const sortOptions = {
    "price-asc": { price: 1 },
    "price-desc": { price: -1 },
    newest: { createdAt: -1 },
    rating: { averageRating: -1 },
  };
  const sortBy = sortOptions[sort] || sortOptions.newest;

  const pageNum = Math.max(Number(page), 1);
  const limitNum = Math.min(Number(limit), 50);
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(filter).sort(sortBy).skip(skip).limit(limitNum),
    Product.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    products,
    pagination: {
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      limit: limitNum,
    },
  });
});

// @desc    Get a single product by slug
// @route   GET /api/products/:slug
// @access  Public
export const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, isActive: true }).populate(
    "reviews.user",
    "name avatar"
  );

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  res.status(200).json({ success: true, product });
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const updatableFields = [
    "name",
    "description",
    "category",
    "price",
    "discountPrice",
    "stock",
    "sku",
    "isActive",
  ];
  updatableFields.forEach((field) => {
    if (req.body[field] !== undefined) product[field] = req.body[field];
  });

  if (req.body.isCustomizable !== undefined) {
    product.isCustomizable =
      req.body.isCustomizable === "true" || req.body.isCustomizable === true;
  }
  if (req.body.fabricOptions) product.fabricOptions = JSON.parse(req.body.fabricOptions);
  if (req.body.availableSizes) product.availableSizes = JSON.parse(req.body.availableSizes);
  if (req.body.tags) product.tags = JSON.parse(req.body.tags);

  if (req.files && req.files.length > 0) {
    const uploadPromises = req.files.map((file) =>
      uploadBufferToCloudinary(file.buffer, "explicit-world/products")
    );
    const newImageUrls = await Promise.all(uploadPromises);
    product.images.push(...newImageUrls);
  }

  const updatedProduct = await product.save();
  res.status(200).json({ success: true, product: updatedProduct });
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  await product.deleteOne();
  res.status(200).json({ success: true, message: "Product deleted successfully" });
});

// @desc    Add a review to a product
// @route   POST /api/products/:id/reviews
// @access  Private
export const addProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const alreadyReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  );
  if (alreadyReviewed) {
    res.status(400);
    throw new Error("You have already reviewed this product");
  }

  product.reviews.push({
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  });

  product.recalculateRatings();
  await product.save();

  res.status(201).json({ success: true, message: "Review added successfully" });
});