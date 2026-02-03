import Wishlist from "../models/Wishlist.js";

// GET wishlist
export async function getWishlist(req, res) {
  let wishlist = await Wishlist.findOne({ user: req.user.id })
    .populate("products");

  if (!wishlist) {
    wishlist = await Wishlist.create({
      user: req.user.id,
      products: []
    });
  }

  res.json(wishlist.products);
}

// ADD product
export async function addToWishlist(req, res) {
  const { productId } = req.body;

  let wishlist = await Wishlist.findOne({ user: req.user.id });

  if (!wishlist) {
    wishlist = await Wishlist.create({
      user: req.user.id,
      products: []
    });
  }

  if (!wishlist.products.includes(productId)) {
    wishlist.products.push(productId);
    await wishlist.save();
  }

  res.json({ message: "Added to wishlist" });
}

// REMOVE product
export async function removeFromWishlist(req, res) {
  const { productId } = req.params;

  const wishlist = await Wishlist.findOne({ user: req.user.id });

  if (!wishlist)
    return res.status(404).json({ message: "Wishlist not found" });

  wishlist.products = wishlist.products.filter(
    p => p.toString() !== productId
  );

  await wishlist.save();

  res.json({ message: "Removed from wishlist" });
}
