import { nodemailerTransporter } from "../../config/nodemailer";
const sendEmailVerificationOnRegister = async (data: {
    email: string;
    firstName: string;
    lastName: string;
    token: string;
}) => {
    await nodemailerTransporter.sendMail({
        from: process.env.TRANSPORTER_EMAIL,
        to: data.email, // list of receivers
        subject: "Email confirmation", // Subject line
        html: `<h1>Email Confirmation</h1>
        <h2>Hello ${data.firstName} ${data.lastName}</h2>
        <p>Thank you for subscribing. Please confirm your email by clicking on the following link</p>
        <a href=http://localhost:8000/email_confirmed?verificationCode=${data.token}> Click here</a>
        </div>`, // html body
    });
};

const sendEmailInvitationToUser = async (data: { email: string; code: string }) => {
    await nodemailerTransporter.sendMail({
        from: process.env.TRANSPORTER_EMAIL,
        to: data.email, // list of receivers
        subject: "You are invited to Sapious platform", // Subject line
        html: `<h1>Invitation to Sapious</h1>
        <p>Thank you for subscribing. Please confirm your email by clicking on the following link</p>
            <div>Your invitation Code ${data.code}</div>
        </div>`, // html body
    });
};
const sendEmailVerificationOnForgotPassword = async (data: {
    email: string;
    firstName: string;
    lastName: string;
    token: string;
}) => {
    await nodemailerTransporter.sendMail({
        from: process.env.TRANSPORTER_EMAIL,
        to: data.email, // list of receivers
        subject: "Reset password", // Subject line
        html: `<h1>Reset password</h1>
            <h2>Hello ${data.firstName} ${data.lastName}</h2>
        <p>please click this link to reset your password</p>
        <a href=http://localhost:8000/reset_password/${data.token}> Click here</a>
        </div>`, // html body
    });
};

export { sendEmailVerificationOnRegister, sendEmailInvitationToUser, sendEmailVerificationOnForgotPassword };

