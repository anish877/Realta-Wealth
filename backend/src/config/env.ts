import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "4000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl: process.env.DATABASE_URL || "",
  jwtSecret: process.env.JWT_SECRET || "dev-secret-change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1h",
  corsOrigin: process.env.CORS_ORIGIN || "*",
  n8nWebhookUrl: process.env.N8N_WEBHOOK_URL || "https://n8n.srv891599.hstgr.cloud/webhook/8077a68e-05f4-40ca-bb66-e20b73808cdb",
};

if (!config.databaseUrl) {
  throw new Error("DATABASE_URL environment variable is required");
}

