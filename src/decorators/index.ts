import { FastifyInstance, FastifyReply } from "fastify";
import { IUser, IRequest } from "../@types";
import fp from "fastify-plugin";
import jwt from "jsonwebtoken";

declare module "fastify" {
    export interface FastifyInstance {
        verifyToken(): void;
        isActive(): void;
        isVerified(): void;
    }
}
async function decorators(app: FastifyInstance) {
    app.decorate("verifyToken", (req: IRequest, res: FastifyReply, done: () => void) => {
        const token = req.headers["authorization"];
        if (!token) {
            return res.code(401).send({ statusCode: 401, error: "Access denied", message: "no token provided" });
        }
        try {
            const verified = <IUser>jwt.verify(token, process.env.TOKEN_SECRET_KEY as string);
            req.loggedUser = verified;
        } catch (err) {
            return res.code(401).send({ statusCode: 401, error: "Invalid token", message: err });
        }
        done();
    });
    app.decorate("isActive", (req: IRequest, res: FastifyReply, done: () => void) => {
        if (!req.loggedUser?.isActive) {
            return res
                .code(403)
                .send({ statusCode: 403, error: "Access denied", message: "Forbidden access, not activated" });
        }
        done();
    });
    app.decorate("isVerified", (req: IRequest, res: FastifyReply, done: () => void) => {
        if (!req.loggedUser?.isVerified) {
            return res
                .code(403)
                .send({ statusCode: 403, error: "Access denied", message: "Forbidden access, Email not verified" });
        }
        done();
    });
}
export default fp(decorators);
