import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { notFound, errorHandler } from "./middleware/error.js";

import authRoutes from "./routes/auth.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import productRoutes from "./routes/product.routes.js";
import orderRoutes from "./routes/order.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import adminRoutes from "./routes/admin.routes.js";

const app = express();

app.get("/", (req, res) => {
  res.send("Clothing Backend API is running ✅ Use /health or /docs");
});


app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

// ✅ Put this AFTER app is created
app.get("/", (req, res) => {
  res.send("Clothing Backend API is running ✅ Use /health or /docs");
});

app.get("/health", (req, res) => {
  res.json({ ok: true, message: "Backend running ✅" });
});

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
