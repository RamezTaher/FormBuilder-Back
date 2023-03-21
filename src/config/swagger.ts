export default {
    openapi: {
        info: {
            title: "Test swagger",
            description: "testing the fastify swagger api",
            version: "0.1.0",
        },
        servers: [
            {
                url: "http://localhost:8000",
            },
        ],
    },
    exposeRoute: true,
};
