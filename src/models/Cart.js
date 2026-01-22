import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true, required: true },

    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        qty: { type: Number, required: true, min: 1 },
        size: { type: String, default: "" },
        color: { type: String, default: "" }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("Cart", cartSchema);
