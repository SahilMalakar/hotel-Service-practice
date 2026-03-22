import { createTransport } from "nodemailer";
import { serverConfig } from ".";

export const transport = createTransport({
    service: "gmail",
    auth: {
        user: serverConfig.MAIL_USER,
        pass: serverConfig.MAIL_PASS,
    }
});

