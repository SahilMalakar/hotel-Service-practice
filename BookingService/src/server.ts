import express from "express";
import { serverConfig } from "./config";
import {
  appErrorHandler,
  genericErrorHandler,
} from "./middlewares/error.middleware";
import logger from "./config/logger.config";
import { attachCorrelationIdMiddleware } from "./middlewares/correlation.middleware";
import { bookingRouter } from "./routers/v1/booking.router";
const app = express();

app.use(express.json());

// Registering all the routers and their corresponding routes with out app server object.

app.use(attachCorrelationIdMiddleware);

// Add the error handler middleware
app.use("/api/v1",bookingRouter)

app.use(appErrorHandler);
app.use(genericErrorHandler);

app.listen(serverConfig.PORT, async () => {
  logger.info(`Server is running on http://localhost:${serverConfig.PORT}`);
});
