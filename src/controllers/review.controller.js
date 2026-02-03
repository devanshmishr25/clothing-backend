import Review from "../models/Review.js";
import Product from "../models/Product.js";

// Add or update review
export async function addReview(req, res) {
  const { rating, comment } = req.body;

  const productId = req.params.id;

  let review = await Review.findOne({
    product: productId,
    user: req.user.id
  });

  if (review) {
    review.rating = rating;
    review.comment = comment;
    await review.save();
  } else {
    review = await Review.create({
      product: productId,
      user: req.user.id,
      rating,
      comment
    });
  }

  // Recalculate product rating
  const stats = await Review.aggregate([
    { $match: { product: review.product } },
    {
      $group: {
        _id: "$product",
        avgRating: { $avg: "$rating" },
        count: { $sum: 1 }
      }
    }
  ]);

  await Product.findByIdAndUpdate(productId, {
    ratingsAverage: stats[0].avgRating,
    ratingsCount: stats[0].count
  });

  res.json({ message: "Review saved" });
}

// Get reviews
export async function getReviews(req, res) {
  const reviews = await Review.find({
    product: req.params.id
  }).populate("user", "name");

  res.json(reviews);
}
