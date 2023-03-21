import { FastifyInstance, RegisterOptions } from "fastify";
import authRoutes from "./auth.routes";
import formRoutes from "./form.routes";
function routes(fastify: FastifyInstance, options: RegisterOptions, done: () => void) {
    fastify.register(authRoutes, { prefix: "/auth" });
    fastify.register(formRoutes, { prefix: "/forms" });
    done();
}

export default routes;
