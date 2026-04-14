import dotenv from "dotenv";
import path from "path";

// .env.local is in project root (parent of backend/)
dotenv.config({ path: path.join(process.cwd(), "..", ".env.local") });

export const config = {
  port: process.env.PORT || 3001,
  sepoliaRpcUrl: process.env.SEPOLIA_RPC_URL || "",
  contractAddress: process.env.CONTRACT_ADDRESS || "",
  privateKey: process.env.PRIVATE_KEY || "",
};
