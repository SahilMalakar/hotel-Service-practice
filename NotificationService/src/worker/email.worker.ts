import { Job, Worker } from "bullmq";
import { NotificationTypes } from "../utils/schema/types";
import { MAILER_QUEUE } from "../queues/mailer.queue";
import { getRedisConnection } from "../config/redis.config";
import { error, log } from "console";
import { MAILER_PAYLOAD } from "../publisher/email.producer";
import { readMailTemplate } from "../utils/templets/templet.handler";
import { sendEmail } from "../services/mail.service";
import logger from "../config/logger.config";

export const setUpMailerWorker = () => {
  const emailWorker = new Worker<NotificationTypes>(
    MAILER_QUEUE,
    async (job: Job) => {
      if (job.name !== MAILER_PAYLOAD) {
        throw new Error("invalid job user");
      }

      // call the service layer from here
      const payload = job.data;
      console.log("Processing email for : ", JSON.stringify(payload));

      const emailContent = await readMailTemplate(
        payload.templateId,
        payload.params,
      );

      await sendEmail(payload.to, payload.subject, emailContent);

      logger.info(
        `email sent to  ${payload.to} with subject ${payload.subject}`,
      );
    },
    {
      connection: getRedisConnection() as any,
    },
  );

  emailWorker.on("failed", () => {
    error(`email processing failed by worker`);
  });

  emailWorker.on("completed", () => {
    log("email processing completed successfully");
  });
};
