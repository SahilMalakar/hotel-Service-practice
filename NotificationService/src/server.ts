import express from "express";
import { serverConfig } from "./config";
import {
  appErrorHandler,
  genericErrorHandler,
} from "./middlewares/error.middleware";
import logger from "./config/logger.config";
import { attachCorrelationIdMiddleware } from "./middlewares/correlation.middleware";
import { setUpMailerWorker } from "./worker/email.worker";
import { addMailToQueue } from "./publisher/email.producer";

const app = express();

app.use(express.json());

// Registering all the routers and their corresponding routes with out app server object.

app.use(attachCorrelationIdMiddleware);

// Add the error handler middleware

app.use(appErrorHandler);
app.use(genericErrorHandler);

app.listen(serverConfig.PORT, async () => {
  logger.info(`Server is running on http://localhost:${serverConfig.PORT}`);
  setUpMailerWorker();
  logger.info("Mailer worker setup completed");

  const testNotifications = [
    {
      to: "sahilmalakar150@gmail.com",
      subject: "Welcome to MyApp",
      templateId: "welcome",
      params: {
        name: "Sahil",
        appName: "MyApp",
      },
    },
    {
      to: "dazzbikram@gmail.com",
      subject: "Welcome to MyApp",
      templateId: "welcome",
      params: {
        name: "Bikram",
        appName: "MyApp",
      },
    },
    {
      to: "rakhimalakar1985@gmail.com",
      subject: "Welcome to MyApp",
      templateId: "welcome",
      params: {
        name: "Rakhi",
        appName: "MyApp",
      },
    },
  ];

  for (const notification of testNotifications) {
    await addMailToQueue(notification);
  }

  console.log("rendered the final email response : ", testNotifications);
});
