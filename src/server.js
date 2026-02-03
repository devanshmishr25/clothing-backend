import dotenv from "dotenv";
dotenv.config({ quiet: true }); // Load env FIRST

import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(
      `Server running at http://localhost:${PORT}`
    );
  });
}

start();
