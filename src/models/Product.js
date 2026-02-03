import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, default: "" },

    price: { type: Number, required: true, min: 0 },
    mrp: { type: Number, default: 0, min: 0 },

    images: [{ url: String, publicId: String }],


    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    brand: { type: String, default: "" },

    sizes: [{ type: String }],
    colors: [{ type: String }],

    stock: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },

    ratingsAverage: { type: Number, default: 0 },
    ratingsCount: { type: Number, default: 0 },

  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
