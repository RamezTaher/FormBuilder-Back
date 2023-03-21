import * as nodemailer from "nodemailer";
export const nodemailerTransporter = nodemailer.createTransport({
    host: process.env.TRANSPORTER_HOST as string,
    port: Number(process.env.TRANSPORTER_PORT),
    auth: {
        user: process.env.TRANSPORTER_AUTH_USER as string,
        pass: process.env.TRANSPORTER_AUTH_PASS as string,
    },
});

