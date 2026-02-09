import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        title: String,
        price: Number,
        qty: Number,
        size: String,
        color: String,
        image: String,
      },
    ],

    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      line1: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },

    totals: {
      subtotal: { type: Number, default: 0 },
      shipping: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      grandTotal: { type: Number, default: 0 },
    },

    payment: {
      method: { type: String, enum: ["cod"], default: "cod" },
      status: {
        type: String,
        enum: ["pending", "paid", "failed"],
        default: "pending",
      },
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending",
    },

    statusHistory: [
      {
        status: String,
        at: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.model("Order", orderSchema);
