import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import { config } from "./config/index.js";
import escrowRoutes from "./routes/escrow.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/escrow", escrowRoutes);

app.listen(config.port, () => {
  console.log(`ChainSteps API running on port ${config.port}`);
  console.log(`Contract: ${config.contractAddress}`);
  console.log(`RPC: ${config.sepoliaRpcUrl ? "configured" : "missing"}`);
});
