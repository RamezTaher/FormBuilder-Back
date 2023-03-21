import * as dotenv from "dotenv";
dotenv.config();
import Fastify, { FastifyInstance } from "fastify";
import { Server, IncomingMessage, ServerResponse } from "http";
import helmet from "fastify-helmet";
import compress from "fastify-compress";
import cors from "fastify-cors";
import swagger from "fastify-swagger";
import swaggerOpts from "./config/swagger";
import mongoose from "mongoose";
import routes from "./routes";
import decorators from "./decorators";
import i18next from "i18next";
import middleware from "i18next-http-middleware";
i18next.use(middleware.LanguageDetector).init({
    fallbackLng: "en",
});

const fastify: FastifyInstance<Server, IncomingMessage, ServerResponse> = Fastify({
    logger: {
        prettyPrint:
            process.env.NODE_ENV === "development"
                ? {
                      translateTime: "HH:MM:ss Z",
                      ignore: "pid,hostname",
                  }
                : false,
    },
});

//DB connection
const db_uri = process.env.MONGO_DB_URI || "mongodb://localhost:27017/fis-form-builder";
mongoose.connect(db_uri);
mongoose.connection.on("connected", () => {
    fastify.log.info("DB Connected");
});
mongoose.connection.on("error", err => {
    fastify.log.error("DB Connection failed with - ", err);
});
mongoose.connection.on("disconnected", () => {
    fastify.log.info("DB Disconnected");
});

// register plugin below:
fastify.register(middleware.plugin, {
    i18next,
});
fastify.register(helmet, {
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "validator.swagger.io"],
            scriptSrc: ["'self'", "https: 'unsafe-inline'"],
        },
    },
});
// fastify.register(redis, { port: process.env.REDIS_PORT, host: process.env.REDIS_HOST });
fastify.register(compress);
fastify.register(cors);
fastify.register(swagger, swaggerOpts);
fastify.register(decorators);
fastify.register(routes, { prefix: "/api" });
//server listen
const port = process.env.PORT || 8000;
const start = async () => {
    try {
        await fastify.listen(port);
    } catch (err) {
        fastify.log.error(err);
    }
};
start();
