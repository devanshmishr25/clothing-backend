import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        title: String,
        price: Number,
        qty: Number,
        size: String,
        color: String,
        image: String
      }
    ],

    shippingAddress: {
      fullName: String,
      phone: String,
      line1: String,
      city: String,
      state: String,
      pincode: String
    },

    totals: {
      subtotal: { type: Number, default: 0 },
      shipping: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      grandTotal: { type: Number, default: 0 }
    },

    payment: {
      method: { type: String, enum: ["cod", "online"], default: "cod" },
      status: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
      transactionId: String
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
