// This file contains all the basic configuration logic for the app server to work
import dotenv from "dotenv";

type ServerConfig = {
  PORT: number;
  REDIS_SERVER_URL?: string;
  LOCK_TTL?: number;
  MAIL_PASS?: string;
  MAIL_USER?: string;
};

function loadEnv() {
  dotenv.config();
  console.log(`Environment variables loaded`);
}

loadEnv();

export const serverConfig: ServerConfig = {
    PORT: Number(process.env.PORT) || 3001,
    REDIS_SERVER_URL:
    process.env.REDIS_SERVER_URL || "redis://:myStrongPassword@localhost:6379",
    LOCK_TTL: Number(process.env.LOCK_TTL) || 5000,
    MAIL_PASS: process.env.MAIL_PASS || "",
    MAIL_USER: process.env.MAIL_USER || "",
};
