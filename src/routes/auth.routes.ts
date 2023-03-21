import { FastifyInstance, RegisterOptions } from "fastify";
import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcryptjs";
import User from "../models/user.models";
import {
    loginUserDataSchema,
    createUserDataValidation,
    authCheckUserDataValidation,
    confirmUserEmailValidation,
    forgotUserPasswordValidation,
    resetUserPasswordValidation,
} from "../validations/user";
import { env } from "process";
import { IRequest, IResponse, IUser } from "../@types";
import { SEND_FORGOT_PASSWORD_EMAIL, SEND_VERIFICATION_EMAIL } from "../constants";
function routes(fastify: FastifyInstance, options: RegisterOptions, done: () => void) {
    fastify.get(
        "/authcheck",
        { preValidation: fastify.verifyToken, schema: authCheckUserDataValidation },
        async (req: IRequest, res: IResponse) => {
            try {
                const user = await User.findById(req.loggedUser?._id);

                return res.code(200).send({ user: user });
            } catch (err) {
                return res.code(500).send({ statusCode: 500, error: "Server Error", message: err });
            }
        },
    );
    fastify.post(
        "/register",
        {
            schema: createUserDataValidation,
        },
        async (req: IRequest, res: IResponse) => {
            try {
                // Checking if the email is validation
                const existEmail = await User.findOne({ email: req.body.email });

                if (existEmail) {
                    return res
                        .code(400)
                        .send({ statusCode: 400, error: "register failed", message: "Email already exist" });
                }

                // Hashing the password
                const salt = await bcrypt.genSalt(16);
                const hashedPassword = await bcrypt.hash(req.body.password, salt);
                // Creating new user
                const token = jwt.sign({ email: req.body.email }, env.VERIFICATION_SECRET_KEY as string, {
                    expiresIn: "2h",
                });
                const user = new User({
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    phoneNumber: req.body.phoneNumber,
                    email: req.body.email,
                    password: hashedPassword,
                });
                const savedUser = await user.save();
                return res.code(202).send({ message: "Register valid" });
            } catch (err) {
                return res.code(500).send({ statusCode: 500, error: "Server Error", message: err });
            }
        },
    );
    fastify.post(
        "/login",
        {
            schema: loginUserDataSchema,
        },
        async (req: IRequest, res: IResponse) => {
            // Checking if email is valid
            try {
                const user = await User.findOne({ email: req.body.email });

                if (!user) {
                    return res
                        .code(401)
                        .send({ statusCode: 401, error: "login failed", message: "wrong email or password" });
                }
                // Validate password
                const isPasswordValid = await bcrypt.compare(req.body.password, user?.password);

                if (!isPasswordValid) {
                    return res
                        .code(401)
                        .send({ statusCode: 401, error: "login failed", message: "wrong email or password" });
                }
                console.log(user);
                // Generating Token
                const token = jwt.sign(
                    {
                        _id: user._id,
                        email: user.email,
                        isAdmin: user.isAdmin,
                        isVerified: user.isVerified,
                        isActive: user.isActive,
                    },
                    env.TOKEN_SECRET_KEY as string,
                    {
                        expiresIn: "2 days",
                    },
                );
                return res.code(200).send({ token: token, user: user });
            } catch (err) {
                return res.code(500).send({ statusCode: 500, error: "Server Error", message: err });
            }
        },
    );
    fastify.get(
        "/confirm_email",
        {
            schema: confirmUserEmailValidation,
        },
        async (req: IRequest, res: IResponse) => {
            const { verificationCode } = req.query;

            if (!verificationCode) {
                return res
                    .code(404)
                    .send({ statusCode: 404, error: "confirmation failed", message: "verification code not found" });
            }
            try {
                jwt.verify(verificationCode, env.VERIFICATION_SECRET_KEY as string);
            } catch (err) {
                return res
                    .code(400)
                    .send({ statusCode: 400, error: "confirmation failed", message: "Invalid verification Token" });
            }

            try {
                const user = await User.findOne({ verificationCode: verificationCode });

                if (!user) {
                    return res
                        .code(404)
                        .send({ statusCode: 404, error: "confirmation failed", message: "User not found" });
                }
                if (user.isVerified) {
                    return res.code(200).send({ message: "your account already verified, please sign in" });
                }
                user.isVerified = true;
                const verifiedUser = await user.save();
                const token = jwt.sign(
                    {
                        _id: user._id,
                        email: user.email,
                        isAdmin: user.isAdmin,
                        isVerified: user.isVerified,
                        isActive: user.isActive,
                    },
                    env.TOKEN_SECRET_KEY as string,
                    {
                        expiresIn: "2 days",
                    },
                );

                return res.code(200).send({ user: verifiedUser, token: token });
            } catch (err) {
                return res.code(500).send({ statusCode: 500, error: "Server Error", message: err });
            }
        },
    );
    fastify.post(
        "/forgot_password",
        { schema: forgotUserPasswordValidation },
        async (req: IRequest, res: IResponse) => {
            try {
                const userExist = await User.findOne({ email: req.body.email });

                if (!userExist) {
                    return res.code(200).send({
                        message:
                            "If your email address exists in our database, you will receive a password recovery link at your email address in a few minutes.",
                    });
                }
                const token = jwt.sign({ email: req.body.email }, env.FORGOT_SECRET_KEY as string, {
                    expiresIn: "2h",
                });
                return res.code(200).send({
                    message:
                        "If your email address exists in our database, you will receive a password recovery link at your email address in a few minutes.",
                });
            } catch (err) {
                return res.code(500).send({ statusCode: 500, error: "Server Error", message: err });
            }
        },
    );
    fastify.post(
        "/reset_password",
        {
            schema: resetUserPasswordValidation,
        },
        async (req: IRequest, res: IResponse) => {
            let tokenData: Partial<IUser>;
            if (!req.body.resetToken) {
                return res.code(404).send({ statusCode: 404, error: "resetToken", message: "resetToken not found" });
            }
            try {
                tokenData = <IUser>jwt.verify(req.body.resetToken, env.FORGOT_SECRET_KEY as string);
            } catch (err) {
                return res
                    .code(400)
                    .send({ statusCode: 400, error: "resetToken", message: "Invalid verification Token" });
            }

            try {
                const user = await User.findOne({ email: tokenData.email });
                // Hashing the password
                const salt = await bcrypt.genSalt(16);
                const hashedPassword = await bcrypt.hash(req.body.password, salt);
                if (user) {
                    user.password = <string>hashedPassword;
                    await user?.save();
                }

                return res.code(200).send({ message: "login to your account with the new password" });
            } catch (err) {
                return res.code(500).send({ statusCode: 500, error: "Server Error", message: err });
            }
        },
    );
    done();
}

export default routes;
