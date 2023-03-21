const formTitleSchema = {
    type: "object",
    properties: {
        _id: { type: "string" },
        createdAt: { type: "string" },
        updatedAt: { type: "string" },
        language: { type: "string" },
        text: { type: "string" },
    },
};
const fieldOptionTextSchema = {
    type: "object",
    properties: {
        _id: { type: "string" },
        createdAt: { type: "string" },
        updatedAt: { type: "string" },
        language: { type: "string" },
        text: { type: "string" },
    },
};
const fieldQuestionSchema = {
    type: "object",
    properties: {
        _id: { type: "string" },
        createdAt: { type: "string" },
        updatedAt: { type: "string" },
        language: { type: "string" },
        question: { type: "string" },
    },
};
const fieldOptionSchema = {
    type: "object",
    properties: {
        _id: { type: "string" },
        createdAt: { type: "string" },
        updatedAt: { type: "string" },
        key: { type: "string" },
        value: { type: "string" },
        text: {
            type: "array",
            items: fieldOptionTextSchema,
        },
    },
};
const fieldSchema = {
    type: "object",
    properties: {
        createdAt: { type: "string" },
        updatedAt: { type: "string" },
        _id: { type: "string" },
        question: {
            type: "array",
            items: fieldQuestionSchema,
        },
        options: {
            type: "array",
            items: fieldOptionSchema,
        },
        image: { type: "string" },
        type: { type: "string" },
        order: { type: "number" },
        description: { type: "string" },
        value: { type: "string" },
        isRequired: { type: "boolean" },
        form: { type: "string" },
    },
};
const formSchema = {
    type: "object",
    properties: {
        _id: { type: "string" },
        titles: {
            type: "array",
            items: formTitleSchema,
        },
        description: { type: "string" },
        isLive: { type: "boolean" },
        owner: { type: "string" },
        createdAt: { type: "string" },
        updatedAt: { type: "string" },
        fields: { type: "array", items: fieldSchema },
    },
};

const submissionSchema = {
    type: "object",
    properties: {
        form: formSchema,
        _id: { type: "string" },
        createdAt: { type: "string" },
        updatedAt: { type: "string" },
        answers: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    field: { type: "string" },
                    value: { anyOf: [{ type: "string" }, { type: "number" }] },
                },
            },
        },
    },
};
export const createFormDataValidation = {
    response: {
        201: formSchema,
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
export const updateFormTitleDataValidation = {
    params: {
        type: "object",
        properties: {
            formId: { type: "string" },
        },
    },
    body: {
        type: "object",
        properties: {
            text: { type: "string" },
            language: { type: "string" },
        },
    },
    response: {
        200: formSchema,
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
export const getFormDataValidation = {
    params: {
        type: "object",
        properties: {
            formId: { type: "string" },
        },
    },
    response: {
        200: formSchema,
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
export const getUserFormsDataValidation = {
    response: {
        200: {
            type: "object",
            properties: {
                data: {
                    type: "array",
                    items: formSchema,
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

export const addFieldToFormDataValidation = {
    params: {
        type: "object",
        properties: {
            formId: { type: "string" },
        },
    },
    body: {
        type: "object",
        properties: {
            order: { type: "number" },
            type: { type: "string" },
        },
    },
    response: {
        200: formSchema,
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
export const deleteFormDataValidation = {
    params: {
        type: "object",
        properties: {
            formId: { type: "string" },
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
export const deleteFieldDataValidation = {
    params: {
        type: "object",
        properties: {
            formId: { type: "string" },
            fieldId: { type: "string" },
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
export const updateFieldDataValidation = {
    params: {
        type: "object",
        properties: {
            formId: { type: "string" },
            fieldId: { type: "string" },
        },
    },
    body: {
        type: "object",
        properties: {
            order: { type: "number" },
            type: { type: "string" },
            question: { type: "string" },
            value: { type: "string" },
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
export const submitFormDataValidation = {
    params: {
        type: "object",
        properties: {
            formId: { type: "string" },
        },
    },
    body: {
        type: "object",
        properties: {
            answers: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        field: { type: "string" },
                        value: { anyOf: [{ type: "string" }, { type: "number" }] },
                    },
                },
            },
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
export const getFormSubmissionsDataValidation = {
    params: {
        type: "object",
        properties: {
            formId: { type: "string" },
        },
    },
    response: {
        200: {
            type: "array",
            items: submissionSchema,
        },
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
