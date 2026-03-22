import  { Redis } from "ioredis";
import Redlock from "redlock";
import { serverConfig } from ".";

// export const redisclient = new IORedis(serverConfig.REDIS_SERVER_URL);

export function connectToRedis() {
  try {
    let redisClient: Redis;

    return () => {
      if (!redisClient) {
        redisClient = new Redis(serverConfig.REDIS_SERVER_URL, {
          maxRetriesPerRequest: null,
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

export const redLock = new Redlock(
  // You should have one client for each independent redis node
  // or cluster.
  [getRedisConnection()],
  {
    // The expected clock drift; for more details see:
    // http://redis.io/topics/distlock
    driftFactor: 0.01, // multiplied by lock ttl to determine drift time

    // The max number of times Redlock will attempt to lock a resource
    // before erroring.
    retryCount: 10,

    // the time in ms between attempts
    retryDelay: 200, // time in ms

    // the max time in ms randomly added to retries
    // to improve performance under high contention
    // see https://www.awsarchitectureblog.com/2015/03/backoff.html
    retryJitter: 200, // time in ms

    // The minimum remaining time on a lock before an extension is automatically
    // attempted with the `using` API.
    automaticExtensionThreshold: 500, // time in ms
  },
);

