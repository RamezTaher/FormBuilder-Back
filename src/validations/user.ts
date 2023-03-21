export const createUserDataValidation = {
    body: {
        type: "object",
        properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", min: 8 },
            firstName: { type: "string", max: 256 },
            lastName: { type: "string", max: 256 },
        },
    },
    response: {
        204: {},
        400: {
            type: "object",
            properties: {
                statusCode: { type: "number" },
                error: { type: "string" },
                message: { type: "string" },
            },
        },
        500: {
            type: "object",
            properties: {
                statusCode: { type: "number" },
                error: { type: "string" },
                message: { type: "string" },
            },
        },
    },
};

export const loginUserDataSchema = {
    body: {
        type: "object",
        properties: {
            email: { type: "string", format: "email", default: "raedbahri90@gmail.com" },
            password: { type: "string", default: "95729162" },
        },
    },
    response: {
        200: {
            type: "object",
            properties: {
                token: { type: "string" },
                user: {
                    type: "object",
                    properties: {
                        _id: { type: "string" },
                        email: { type: "string", format: "email" },
                        firstName: { type: "string" },
                        lastName: { type: "string" },
                        isAdmin: { type: "boolean" },
                        isVerified: { type: "boolean" },
                        isActive: { type: "boolean" },
                    },
                },
            },
        },
        401: {
            type: "object",
            properties: {
                statusCode: { type: "number" },
                error: { type: "string" },
                message: { type: "string" },
            },
        },
        500: {
            type: "object",
            properties: {
                statusCode: { type: "number" },
                error: { type: "string" },
                message: { type: "string" },
            },
        },
    },
};

export const forgotUserPasswordValidation = {
    body: {
        type: "object",
        properties: {
            email: { type: "string", format: "email" },
        },
    },
    response: {
        200: {
            type: "object",
            properties: {
                message: { type: "string" },
            },
        },
        500: {
            type: "object",
            properties: {
                statusCode: { type: "number" },
                error: { type: "string" },
                message: { type: "string" },
            },
        },
    },
};

export const resetUserPasswordValidation = {
    body: {
        type: "object",
        properties: {
            resetToken: { type: "string" },
            password: { type: "string" },
        },
    },
    response: {
        200: {
            type: "object",
            properties: {
                message: { type: "string" },
            },
        },
        400: {
            type: "object",
            properties: {
                statusCode: { type: "number" },
                error: { type: "string" },
                message: { type: "string" },
            },
        },
        404: {
            type: "object",
            properties: {
                statusCode: { type: "number" },
                error: { type: "string" },
                message: { type: "string" },
            },
        },
        500: {
            type: "object",
            properties: {
                statusCode: { type: "number" },
                error: { type: "string" },
                message: { type: "string" },
            },
        },
    },
};

export const confirmUserEmailValidation = {
    query: {
        type: "object",
        properties: {
            verificationCode: { type: "string" },
        },
    },
    response: {
        200: {
            type: "object",
            properties: {
                token: { type: "string" },
                admin: {
                    type: "object",
                    properties: {
                        _id: { type: "string" },
                        email: { type: "string", format: "email" },
                        firstName: { type: "string" },
                        lastName: { type: "string" },
                        isAdmin: { type: "boolean" },
                        isVerified: { type: "boolean" },
                        isActive: { type: "boolean" },
                    },
                },
            },
        },
        400: {
            type: "object",
            properties: {
                statusCode: { type: "number" },
                error: { type: "string" },
                message: { type: "string" },
            },
        },
        404: {
            type: "object",
            properties: {
                statusCode: { type: "number" },
                error: { type: "string" },
                message: { type: "string" },
            },
        },
        500: {
            type: "object",
            properties: {
                statusCode: { type: "number" },
                error: { type: "string" },
                message: { type: "string" },
            },
        },
    },
};
export const authCheckUserDataValidation = {
    response: {
        200: {
            type: "object",
            properties: {
                user: {
                    type: "object",
                    properties: {
                        _id: { type: "string" },
                        email: { type: "string", format: "email" },
                        firstName: { type: "string" },
                        lastName: { type: "string" },
                        isAdmin: { type: "boolean" },
                        isVerified: { type: "boolean" },
                        isActive: { type: "boolean" },
                    },
                },
            },
        },
        500: {
            type: "object",
            properties: {
                statusCode: { type: "number" },
                error: { type: "string" },
                message: { type: "string" },
            },
        },
    },
};
// export const UserDataValidation = {
//     query: {
//         type: "object",
//         properties: {
//             email: { type: "string", format: "email" },
//             firstName: { type: "string" },
//             lastName: { type: "string" },
//             password: { type: "string" },
//             role: {
//                 type: "object",
//                 properties: {
//                     name: { type: "string" },
//                 },
//             },
//         },
//     },
//     response: {
//         204: {},
//     },
// };

// module.exports.adminQueryValidation = (data) => {
//     const schema = joi.object({
//         firstName: joi.string(),
//         lastName: joi.string(),
//         email: joi.string().email(),
//         role: joi.string(),
//         sortBy: joi.string(),
//         limit: joi.number(),
//         page: joi.number(),
//         pageSize: joi.number(),
//         fields: joi.string(),
//     });

//     return schema.validate(data);
// };
