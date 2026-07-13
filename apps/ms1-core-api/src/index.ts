import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`MS1 Core API running on port ${PORT}`);
});
