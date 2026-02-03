import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },

    passwordHash: { type: String, required: true },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },

    // ✅ Profile fields
    phone: { type: String },
    avatar: { type: String }, // profile image URL

    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
