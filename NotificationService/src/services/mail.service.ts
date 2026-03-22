import { serverConfig } from "../config";
import logger from "../config/logger.config";
import { transport } from "../config/mail.config";
import { InternalServerError } from "../utils/errors/app.error";

export async function sendEmail(to:string,subject:string,body:string) {
    try {
        transport.sendMail({
            from: serverConfig.MAIL_USER,
            to,
            subject,
            html:body
        })
        logger.info(`email sent ${to} with subject : ${subject}`);
    } catch (error) {
        throw new InternalServerError("failed to send email")
    }
}