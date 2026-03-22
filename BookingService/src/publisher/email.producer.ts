import { mailerQueue } from "../queues/mailer.queue";
import { NotificationTypes } from "../utils/schema/types";



export const MAILER_PAYLOAD = "payload-mailer";

export const addMailToQueue = async (payload: NotificationTypes) => {
  await mailerQueue.add(MAILER_PAYLOAD, payload);

  console.log("email added to queue : ", JSON.stringify(payload));
};
