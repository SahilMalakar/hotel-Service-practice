import Redis from "ioredis";
import { serverConfig } from ".";

//signleton pattern to connect to signle redis instance only
export function connectToRedis() {
  try {
    let redisClient: Redis;

    return () => {
      if (!redisClient) {
        redisClient = new Redis(serverConfig.REDIS_SERVER_URL as string, {
          maxRetriesPerRequest:null
        });

        redisClient.on("connect", () => {
          console.log("✅ Redis connected");
        });

        redisClient.on("error", (err) => {
          console.error("❌ Redis error:", err);
        });
      }

      return redisClient;
    };

  } catch (error) {
    
    console.log(`error connecting redis :`, error);

    throw error;
  }
}

export const getRedisConnection = connectToRedis();