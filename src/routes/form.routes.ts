import { updateFieldOptionsVariable } from "./../controllers/field.controllers";
import { FastifyInstance, RegisterOptions } from "fastify";
import {
    addFormLanguage,
    createForm,
    deleteForm,
    getFormById,
    getUserForms,
    updateFormTitle,
    getTranslationFormById,
    removeFormLanguage,
    getFormForSubmission,
} from "../controllers/form.controllers";
import { getFormSubmissionsDataValidation, submitFormDataValidation } from "../validations/form";
import Form from "../models/form.models";
import Field from "../models/field.models";
import FieldOption from "../models/field-option.models";
import FormTitle from "../models/form-title.models";
import { IRequest } from "../@types/request";
import {
    addFieldToForm,
    deleteField,
    updateField,
    addFieldOption,
    addFieldOptionText,
    deleteFieldOption,
    addFieldQuestion,
    deleteFieldQuestion,
    updateFieldQuestion,
    updateFieldOptionText,
    updateFieldOptions,
    updateFieldOption,
    translateFieldQuestions,
    translateFieldOptions,
    updateFieldGroup,
} from "../controllers/field.controllers";
import { submitForm, getFormSubmissions, getFormSubmissionAnalysis } from "../controllers/submission.controllers";
import FieldOptionText from "../models/field-option-text.models";
import FieldQuestion from "../models/field-question.models";
import FieldGroup from "../models/field-group.models";
import { updateGroupTypes } from "../controllers/field.controllers";
function routes(fastify: FastifyInstance, options: RegisterOptions, done: () => void) {
    fastify.decorateRequest("form", null);
    fastify.decorateRequest("field", null);
    fastify.addHook("preHandler", async (req: IRequest<{ params: { id: string } }>, res) => {
        // Some code
        const { formId } = req.params;
        const { formTitleId } = req.params;
        const { fieldId } = req.params;
        const { fieldOptionId } = req.params;
        const { fieldOptionTextId } = req.params;
        const { fieldQuestionId } = req.params;
        const { fieldGroupId } = req.params;
        if (
            !formId &&
            !fieldId &&
            !fieldOptionId &&
            !fieldQuestionId &&
            !fieldOptionTextId &&
            !formTitleId &&
            !fieldGroupId
        )
            return;
        if (formId) {
            try {
                const form = await Form.findById(formId);
                if (!form) {
                    return res.code(404).send({ statusCode: 404, error: "NotFound", message: "Object not found" });
                }
                req.form = form;
            } catch (err) {
                return res.code(500).send({ statusCode: 500, error: "Server Error", message: err });
            }
        }
        if (formTitleId) {
            try {
                const formTitle = await FormTitle.findById(formTitleId);
                if (!formTitle) {
                    return res.code(404).send({ statusCode: 404, error: "NotFound", message: "Object not found" });
                }
                req.formTitle = formTitle;
            } catch (err) {
                return res.code(500).send({ statusCode: 500, error: "Server Error", message: err });
            }
        }
        if (fieldId) {
            try {
                const field = await Field.findById(fieldId);
                if (!field) {
                    return res.code(404).send({ statusCode: 404, error: "NotFound", message: "Object not found" });
                }
                req.field = field;
            } catch (err) {
                return res.code(500).send({ statusCode: 500, error: "Server Error", message: err });
            }
        }
        if (fieldOptionId) {
            try {
                const fieldOption = await FieldOption.findById(fieldOptionId);
                if (!fieldOption) {
                    return res.code(404).send({ statusCode: 404, error: "NotFound", message: "Object not found" });
                }
                req.fieldOption = fieldOption;
            } catch (err) {
                return res.code(500).send({ statusCode: 500, error: "Server Error", message: err });
            }
        }
        if (fieldOptionTextId) {
            try {
                const fieldOptionText = await FieldOptionText.findById(fieldOptionTextId);
                if (!fieldOptionText) {
                    return res.code(404).send({ statusCode: 404, error: "NotFound", message: "Object not found" });
                }
                req.fieldOptionText = fieldOptionText;
            } catch (err) {
                return res.code(500).send({ statusCode: 500, error: "Server Error", message: err });
            }
        }
        if (fieldQuestionId) {
            try {
                const fieldQuestion = await FieldQuestion.findById(fieldQuestionId);
                if (!fieldQuestion) {
                    return res.code(404).send({ statusCode: 404, error: "NotFound", message: "Object not found" });
                }
                req.fieldQuestion = fieldQuestion;
            } catch (err) {
                return res.code(500).send({ statusCode: 500, error: "Server Error", message: err });
            }
        }
        if (fieldGroupId) {
            try {
                const fieldGroup = await FieldGroup.findById(fieldGroupId);
                if (!fieldGroup) {
                    return res.code(404).send({ statusCode: 404, error: "NotFound", message: "Object not found" });
                }
                req.fieldGroup = fieldGroup;
            } catch (err) {
                return res.code(500).send({ statusCode: 500, error: "Server Error", message: err });
            }
        }
    });
    fastify.post("/", { preValidation: fastify.verifyToken }, createForm);
    fastify.get("/:formId", getFormById);
    fastify.get("/", { preValidation: fastify.verifyToken }, getUserForms);
    fastify.patch("/:formId/titles/:formTitleId", updateFormTitle);
    fastify.delete("/:formId", deleteForm);

    fastify.put("/:formId/languages", addFormLanguage);
    fastify.delete("/:formId/languages/:language", removeFormLanguage);
    fastify.get("/:formId/languages/:language", getTranslationFormById);

    fastify.post("/:formId/fields", addFieldToForm);
    fastify.delete("/:formId/fields/:fieldId", deleteField);
    fastify.put("/:formId/fields/:fieldId", updateField);
    fastify.put("/:formId/fields/:fieldId/groups", updateFieldGroup);
    fastify.put("/:formId/fields/:fieldId/groups/:fieldGroupId/types", updateGroupTypes);

    fastify.post("/:formId/fields/:fieldId/questions", addFieldQuestion);
    fastify.delete("/:formId/fields/:fieldId/questions/:fieldQuestionId", deleteFieldQuestion);
    fastify.put("/:formId/fields/:fieldId/questions/:fieldQuestionId", updateFieldQuestion);
    fastify.put("/:formId/fields/:fieldId/questions/translate", translateFieldQuestions);

    fastify.post("/:formId/fields/:fieldId/options", addFieldOption);
    fastify.delete("/:formId/fields/:fieldId/options/:fieldOptionId", deleteFieldOption);
    fastify.put("/:formId/fields/:fieldId/options/translate", translateFieldOptions);
    fastify.put("/:formId/fields/:fieldId/options/variables", updateFieldOptionsVariable);
    fastify.put("/:formId/fields/:fieldId/options/:fieldOptionId", updateFieldOption);
    fastify.put("/:formId/fields/:fieldId/options", updateFieldOptions);

    fastify.post("/:formId/fields/:fieldId/options/:fieldOptionId/texts", addFieldOptionText);
    fastify.delete("/:formId/fields/:fieldId/options/:fieldOptionId/texts/:fieldOptionTextId", addFieldOptionText);
    fastify.put("/:formId/fields/:fieldId/options/:fieldOptionId/texts/:fieldOptionTextId", updateFieldOptionText);

    fastify.post("/:formId/submissions", submitForm);
    fastify.get("/:formId/submissions", getFormSubmissions);
    fastify.get("/:formId/s", getFormForSubmission);
    fastify.get("/:formId/analysis", getFormSubmissionAnalysis);
    done();
}

export default routes;
