import { FastifyInstance, RegisterOptions } from "fastify";

function routes(fastify: FastifyInstance, options: RegisterOptions, done: () => void) {
    // fastify.get("/types", { schema: fieldTypesDataValidation }, getFieldTypes);
    done();
}
