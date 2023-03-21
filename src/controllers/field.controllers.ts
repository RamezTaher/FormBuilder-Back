import { IRequest, IField, IResponse, IForm, IFieldOptionText } from "../@types";
import Question from "../models/field-question.models";
import Field from "../models/field.models";
import FieldOption from "../models/field-option.models";
import Form from "../models/form.models";
import FieldOptionText from "../models/field-option-text.models";
import FieldQuestion from "../models/field-question.models";
import { IFieldOption } from "../@types/field-option";
import { IFieldQuestion } from "../@types/field-question";
import FieldGroup from "../models/field-group.models";
import GroupType from "../models/group-type.models";
import { IFieldVariable } from "../@types/field-variable";
import FieldVariable from "../models/field-variable.models";
export const deleteField = async (req: IRequest<{ field: IField }>, res: IResponse) => {
    const { _id } = req.field;
    try {
        await Field.findByIdAndDelete(_id);
        return res.code(204).send();
    } catch (err) {
        return res.code(500).send({ statusCode: 500, error: "Server Error", message: err });
    }
};
export const updateField = async (req: IRequest<{ field: IField }>, res: IResponse) => {
    const field: IField = req.field;
    const form: IForm = req.form;
    if (!["checkboxes", "radio"].includes(field.type) && ["checkboxes", "radio"].includes(req.body.type)) {
        const newFieldOption = new FieldOption({
            key: "option 1",
            value: "option 1",
            field: field._id,
        });
        const savedNewFieldOption = await newFieldOption.save();
        const newFieldOptionText = new FieldOptionText({
            language: req.body.language,
            text: "option 1",
            fieldOption: savedNewFieldOption._id,
        });
        await newFieldOptionText.save();
    } else if (["checkboxes", "radio"].includes(field.type) && !["checkboxes", "radio"].includes(req.body.type)) {
        const fo = await FieldOption.find({ field: field._id });
        for await (const content of fo.map(async el => await FieldOption.findByIdAndDelete(el._id)));
    }
    try {
        await FieldQuestion.findByIdAndUpdate(
            req.body.question._id,
            { question: req.body.question.text },
            { new: true },
        );
        await Field.findByIdAndUpdate(field._id, req.body, { new: true });
        const f = await Form.aggregate([
            {
                $match: { _id: form._id },
            },
            {
                $lookup: {
                    from: "formtitles",
                    let: {
                        formId: "$_id",
                        defaultLanguage: "$defaultLanguage",
                    },
                    pipeline: [
                        {
                            $match: {
                                $and: [
                                    { $expr: { $eq: ["$form", "$$formId"] } },
                                    { $expr: { $eq: ["$language", "$$defaultLanguage"] } },
                                ],
                            },
                        },
                    ],
                    as: "titles",
                },
            },
            {
                $lookup: {
                    from: "fieldgroups",
                    localField: "_id",
                    foreignField: "form",
                    as: "groups",
                },
            },
            {
                $lookup: {
                    from: "grouptypes",
                    localField: "_id",
                    foreignField: "form",
                    as: "groupTypes",
                },
            },
            {
                $lookup: {
                    from: "fields",
                    let: {
                        formId: "$_id",
                        defaultLanguage: "$defaultLanguage",
                    },
                    as: "fields",
                    pipeline: [
                        {
                            $match: { $expr: { $eq: ["$form", "$$formId"] } },
                        },
                        {
                            $sort: { order: 1 },
                        },
                        {
                            $lookup: {
                                from: "fieldquestions",
                                as: "question",
                                let: { fieldId: "$_id" },
                                pipeline: [
                                    {
                                        $match: {
                                            $and: [
                                                { $expr: { $eq: ["$field", "$$fieldId"] } },
                                                { $expr: { $eq: ["$language", "$$defaultLanguage"] } },
                                            ],
                                        },
                                    },
                                ],
                            },
                        },
                        {
                            $lookup: {
                                from: "fieldoptions",
                                as: "options",
                                let: { fieldId: "$_id" },
                                pipeline: [
                                    {
                                        $match: { $expr: { $eq: ["$field", "$$fieldId"] } },
                                    },
                                    {
                                        $lookup: {
                                            from: "fieldoptiontexts",
                                            as: "text",
                                            let: { fieldOptionId: "$_id" },
                                            pipeline: [
                                                {
                                                    $match: {
                                                        $and: [
                                                            { $expr: { $eq: ["$fieldOption", "$$fieldOptionId"] } },
                                                            { $expr: { $eq: ["$language", "$$defaultLanguage"] } },
                                                        ],
                                                    },
                                                },
                                            ],
                                        },
                                    },
                                    {
                                        $lookup: {
                                            from: "fieldvariables",
                                            localField: "_id",
                                            foreignField: "referee",
                                            as: "variable",
                                        },
                                    },
                                    {
                                        $unwind: { path: "$variable", preserveNullAndEmptyArrays: true },
                                    },
                                ],
                            },
                        },
                        {
                            $lookup: {
                                from: "fieldgroups",
                                localField: "group",
                                foreignField: "_id",
                                as: "group",
                            },
                        },
                        {
                            $unwind: { path: "$group", preserveNullAndEmptyArrays: true },
                        },
                        {
                            $lookup: {
                                from: "fieldvariables",
                                localField: "_id",
                                foreignField: "referee",
                                as: "variables",
                            },
                        },
                    ],
                },
            },
        ]);

        return res.code(200).send(f[0]);
    } catch (err) {
        return res.code(500).send({ statusCode: 500, error: "Server Error", message: err });
    }
};

export const addFieldToForm = async (req: IRequest, res: IResponse) => {
    const { _id } = req.form;
    try {
        const newField = new Field({
            order: req.body.order,
            form: _id,
            type: req.body.type,
        });

        const savedField = await newField.save();
        const newQuestion = new Question({
            language: req.body.language,
            field: savedField._id,
            question: "Ask and they shall respond",
        });
        await newQuestion.save();
        const form = await Form.aggregate([
            {
                $match: { _id: _id },
            },
            {
                $lookup: {
                    from: "fieldgroups",
                    localField: "_id",
                    foreignField: "form",
                    as: "groups",
                },
            },
            {
                $lookup: {
                    from: "grouptypes",
                    localField: "_id",
                    foreignField: "form",
                    as: "groupTypes",
                },
            },
            {
                $lookup: {
                    from: "fields",
                    let: {
                        formId: "$_id",
                        defaultLanguage: "$defaultLanguage",
                    },
                    pipeline: [
                        {
                            $match: { $expr: { $eq: ["$form", "$$formId"] } },
                        },
                        {
                            $sort: { order: 1 },
                        },
                        {
                            $lookup: {
                                from: "fieldquestions",
                                as: "question",
                                let: { fieldId: "$_id" },
                                pipeline: [
                                    {
                                        $match: {
                                            $and: [
                                                { $expr: { $eq: ["$field", "$$fieldId"] } },
                                                { $expr: { $eq: ["$language", "$$defaultLanguage"] } },
                                            ],
                                        },
                                    },
                                ],
                            },
                        },
                        {
                            $lookup: {
                                from: "fieldoptions",
                                as: "options",
                                let: { fieldId: "$_id" },
                                pipeline: [
                                    {
                                        $match: { $expr: { $eq: ["$field", "$$fieldId"] } },
                                    },
                                    {
                                        $lookup: {
                                            from: "fieldoptiontexts",
                                            as: "text",
                                            let: { fieldOptionId: "$_id" },
                                            pipeline: [
                                                {
                                                    $match: {
                                                        $and: [
                                                            { $expr: { $eq: ["$fieldOption", "$$fieldOptionId"] } },
                                                            { $expr: { $eq: ["$language", "$$defaultLanguage"] } },
                                                        ],
                                                    },
                                                },
                                            ],
                                        },
                                    },
                                    {
                                        $lookup: {
                                            from: "fieldvariables",
                                            localField: "_id",
                                            foreignField: "referee",
                                            as: "variable",
                                        },
                                    },
                                    {
                                        $unwind: { path: "$variable", preserveNullAndEmptyArrays: true },
                                    },
                                ],
                            },
                        },
                        {
                            $lookup: {
                                from: "fieldgroups",
                                localField: "group",
                                foreignField: "_id",
                                as: "group",
                            },
                        },
                        {
                            $unwind: { path: "$group", preserveNullAndEmptyArrays: true },
                        },
                        {
                            $lookup: {
                                from: "fieldvariables",
                                localField: "_id",
                                foreignField: "referee",
                                as: "variables",
                            },
                        },
                    ],
                    as: "fields",
                },
            },
        ]);
        return res.code(200).send(form[0]);
    } catch (err) {
        return res.code(500).send({ statusCode: 500, error: "Server Error", message: err });
    }
};
export const deleteFieldOption = async (req: IRequest<{ field: IField }>, res: IResponse) => {
    const { _id } = req.fieldOption;
    try {
        await FieldOption.findByIdAndDelete(_id);
        return res.code(204).send();
    } catch (err) {
        return res.code(500).send({ statusCode: 500, error: "Server Error", message: err });
    }
};
export const updateFieldOption = async (req: IRequest<{ field: IField }>, res: IResponse) => {
    const { _id } = req.fieldOption;
    try {
        const field = await FieldOption.findByIdAndUpdate(_id, req.body, { new: true });
        return res.code(200).send(field);
    } catch (err) {
        return res.code(500).send({ statusCode: 500, error: "Server Error", message: err });
    }
};

export const addFieldOption = async (req: IRequest<{ field: IField }>, res: IResponse) => {
    const { _id } = req.field;
    const form = req.form;
    try {
        const newFieldOption = new FieldOption({
            key: `option ${req.body.order}`,
            value: `option ${req.body.order}`,
            order: req.body.order,
            field: _id,
        });
        const savedNewFieldOption = await newFieldOption.save();
        const newFieldOptionText = new FieldOptionText({
            language: form.defaultLanguage,
            text: `option ${req.body.order}`,
            fieldOption: savedNewFieldOption._id,
        });
        await newFieldOptionText.save();

        const f = await Form.aggregate([
            {
                $match: { _id: form._id },
            },
            {
                $lookup: {
                    from: "formtitles",
                    let: {
                        formId: "$_id",
                        defaultLanguage: "$defaultLanguage",
                    },
                    pipeline: [
                        {
                            $match: {
                                $and: [
                                    { $expr: { $eq: ["$form", "$$formId"] } },
                                    { $expr: { $eq: ["$language", "$$defaultLanguage"] } },
                                ],
                            },
                        },
                    ],
                    as: "titles",
                },
            },
            {
                $lookup: {
                    from: "fieldgroups",
                    localField: "_id",
                    foreignField: "form",
                    as: "groups",
                },
            },
            {
                $lookup: {
                    from: "grouptypes",
                    localField: "_id",
                    foreignField: "form",
                    as: "groupTypes",
                },
            },
            {
                $lookup: {
                    from: "fields",
                    let: {
                        formId: "$_id",
                        defaultLanguage: "$defaultLanguage",
                    },
                    as: "fields",
                    pipeline: [
                        {
                            $match: { $expr: { $eq: ["$form", "$$formId"] } },
                        },
                        {
                            $sort: { order: 1 },
                        },
                        {
                            $lookup: {
                                from: "fieldquestions",
                                as: "question",
                                let: { fieldId: "$_id" },
                                pipeline: [
                                    {
                                        $match: {
                                            $and: [
                                                { $expr: { $eq: ["$field", "$$fieldId"] } },
                                                { $expr: { $eq: ["$language", "$$defaultLanguage"] } },
                                            ],
                                        },
                                    },
                                ],
                            },
                        },
                        {
                            $lookup: {
                                from: "fieldoptions",
                                as: "options",
                                let: { fieldId: "$_id" },
                                pipeline: [
                                    {
                                        $match: { $expr: { $eq: ["$field", "$$fieldId"] } },
                                    },
                                    {
                                        $lookup: {
                                            from: "fieldoptiontexts",
                                            as: "text",
                                            let: { fieldOptionId: "$_id" },
                                            pipeline: [
                                                {
                                                    $match: {
                                                        $and: [
                                                            {
                                                                $expr: {
                                                                    $eq: ["$fieldOption", "$$fieldOptionId"],
                                                                },
                                                            },
                                                            {
                                                                $expr: {
                                                                    $eq: ["$language", "$$defaultLanguage"],
                                                                },
                                                            },
                                                        ],
                                                    },
                                                },
                                            ],
                                        },
                                    },
                                    {
                                        $lookup: {
                                            from: "fieldvariables",
                                            localField: "_id",
                                            foreignField: "referee",
                                            as: "variable",
                                        },
                                    },
                                    {
                                        $unwind: { path: "$variable", preserveNullAndEmptyArrays: true },
                                    },
                                ],
                            },
                        },
                        {
                            $lookup: {
                                from: "fieldgroups",
                                localField: "group",
                                foreignField: "_id",
                                as: "group",
                            },
                        },
                        {
                            $unwind: { path: "$group", preserveNullAndEmptyArrays: true },
                        },
                        {
                            $lookup: {
                                from: "fieldvariables",
                                localField: "_id",
                                foreignField: "referee",
                                as: "variables",
                            },
                        },
                    ],
                },
            },
        ]);

        return res.code(200).send(f[0]);
    } catch (err) {
        return res.code(500).send({ statusCode: 500, error: "Server Error", message: err });
    }
};

export const updateFieldOptions = async (req: IRequest, res: IResponse) => {
    const { _id } = req.field;
    const form = req.form;
    const allOptions: IFieldOption[] = req.body.options;
    try {
        allOptions.forEach(async el => {
            await FieldOption.findByIdAndUpdate(
                el._id,
                {
                    order: el.order,
                    value: el.text[0].text,
                    key: el.text[0].text,
                },
                { new: true },
            );
            await FieldOptionText.findByIdAndUpdate(el.text[0]._id, { text: el.text[0].text }, { new: true });
        });
        const f = await Form.aggregate([
            {
                $match: { _id: form._id },
            },
            {
                $lookup: {
                    from: "formtitles",
                    let: {
                        formId: "$_id",
                        defaultLanguage: "$defaultLanguage",
                    },
                    pipeline: [
                        {
                            $match: {
                                $and: [
                                    { $expr: { $eq: ["$form", "$$formId"] } },
                                    { $expr: { $eq: ["$language", "$$defaultLanguage"] } },
                                ],
                            },
                        },
                    ],
                    as: "titles",
                },
            },
            {
                $lookup: {
                    from: "fieldgroups",
                    localField: "_id",
                    foreignField: "form",
                    as: "groups",
                },
            },
            {
                $lookup: {
                    from: "grouptypes",
                    localField: "_id",
                    foreignField: "form",
                    as: "groupTypes",
                },
            },
            {
                $lookup: {
                    from: "fields",
                    let: {
                        formId: "$_id",
                        defaultLanguage: "$defaultLanguage",
                    },
                    as: "fields",
                    pipeline: [
                        {
                            $match: { $expr: { $eq: ["$form", "$$formId"] } },
                        },
                        {
                            $sort: { order: 1 },
                        },
                        {
                            $lookup: {
                                from: "fieldquestions",
                                as: "question",
                                let: { fieldId: "$_id" },
                                pipeline: [
                                    {
                                        $match: {
                                            $and: [
                                                { $expr: { $eq: ["$field", "$$fieldId"] } },
                                                { $expr: { $eq: ["$language", "$$defaultLanguage"] } },
                                            ],
                                        },
                                    },
                                ],
                            },
                        },
                        {
                            $lookup: {
                                from: "fieldoptions",
                                as: "options",
                                let: { fieldId: "$_id" },
                                pipeline: [
                                    {
                                        $match: { $expr: { $eq: ["$field", "$$fieldId"] } },
                                    },
                                    {
                                        $lookup: {
                                            from: "fieldoptiontexts",
                                            as: "text",
                                            let: { fieldOptionId: "$_id" },
                                            pipeline: [
                                                {
                                                    $match: {
                                                        $and: [
                                                            {
                                                                $expr: {
                                                                    $eq: ["$fieldOption", "$$fieldOptionId"],
                                                                },
                                                            },
                                                            {
                                                                $expr: {
                                                                    $eq: ["$language", "$$defaultLanguage"],
                                                                },
                                                            },
                                                        ],
                                                    },
                                                },
                                            ],
                                        },
                                    },
                                    {
                                        $lookup: {
                                            from: "fieldvariables",
                                            localField: "_id",
                                            foreignField: "referee",
                                            as: "variable",
                                        },
                                    },
                                    {
                                        $unwind: { path: "$variable", preserveNullAndEmptyArrays: true },
                                    },
                                ],
                            },
                        },
                        {
                            $lookup: {
                                from: "fieldgroups",
                                localField: "group",
                                foreignField: "_id",
                                as: "group",
                            },
                        },
                        {
                            $unwind: { path: "$group", preserveNullAndEmptyArrays: true },
                        },
                        {
                            $lookup: {
                                from: "fieldvariables",
                                localField: "_id",
                                foreignField: "referee",
                                as: "variables",
                            },
                        },
                    ],
                },
            },
        ]);

        return res.code(200).send(f[0]);
    } catch (err) {
        return res.code(500).send({ statusCode: 500, error: "Server Error", message: err });
    }
};
export const deleteFieldOptionText = async (req: IRequest<{ field: IField }>, res: IResponse) => {
    const { _id } = req.fieldOptionText;
    try {
        await FieldOption.findByIdAndDelete(_id);
        return res.code(204).send();
    } catch (err) {
        return res.code(500).send({ statusCode: 500, error: "Server Error", message: err });
    }
};
export const updateFieldOptionText = async (req: IRequest<{ field: IField }>, res: IResponse) => {
    const { _id } = req.fieldOptionText;
    try {
        const field = await FieldOptionText.findByIdAndUpdate(_id, req.body, { new: true });
        return res.code(200).send(field);
    } catch (err) {
        return res.code(500).send({ statusCode: 500, error: "Server Error", message: err });
    }
};

export const addFieldOptionText = async (req: IRequest<{ field: IField }>, res: IResponse) => {
    const { _id } = req.fieldOptionText;
    try {
        const newFieldOptionText = new FieldOptionText({
            language: req.body.language,
            text: req.body.text,
            fieldOption: _id,
        });
        await newFieldOptionText.save();

        return res.code(202).send("accepted");
    } catch (err) {
        return res.code(500).send({ statusCode: 500, error: "Server Error", message: err });
    }
};

export const addFieldQuestion = async (req: IRequest<{ field: IField }>, res: IResponse) => {
    const { _id } = req.field;
    try {
        const newQuestion = new FieldQuestion({
            language: req.body.language,
            field: _id,
            question: req.body.question,
        });
        await newQuestion.save();
        return res.code(202).send("accepted");
    } catch (err) {
        return res.code(500).send({ statusCode: 500, error: "Server Error", message: err });
    }
};
export const deleteFieldQuestion = async (req: IRequest<{ field: IField }>, res: IResponse) => {
    const { _id } = req.fieldQuestion;
    try {
        await FieldQuestion.findByIdAndDelete(_id);
        return res.code(204).send();
    } catch (err) {
        return res.code(500).send({ statusCode: 500, error: "Server Error", message: err });
    }
};
export const updateFieldQuestion = async (req: IRequest<{ field: IField }>, res: IResponse) => {
    const { _id } = req.fieldQuestion;
    try {
        const field = await FieldQuestion.findByIdAndUpdate(_id, req.body, { new: true });
        return res.code(200).send(field);
    } catch (err) {
        return res.code(500).send({ statusCode: 500, error: "Server Error", message: err });
    }
};

export const translateFieldQuestions = async (req: IRequest<{ field: IField }>, res: IResponse) => {
    const field = req.field;
    const allQuestions: IFieldQuestion[] = req.body.questions;
    try {
        allQuestions.forEach(async q => {
            if (q._id) {
                await FieldQuestion.findByIdAndUpdate(q._id, { question: q.question }, { new: true });
            } else {
                const newQuestion = new FieldQuestion({
                    language: q.language,
                    field: field._id,
                    question: q.question,
                });
                await newQuestion.save();
            }
        });
        return res.code(204).send();
    } catch (err) {
        return res.code(500).send({ statusCode: 500, error: "Server Error", message: err });
    }
};
export const translateFieldOptions = async (req: IRequest, res: IResponse) => {
    const allOptions: IFieldOption[] = req.body.options;
    try {
        allOptions.forEach(async el => {
            el.text.forEach(async fot => {
                if (fot._id) {
                    await FieldOptionText.findByIdAndUpdate(fot._id, { text: fot.text }, { new: true });
                } else {
                    const newFot = new FieldOptionText({
                        text: fot.text,
                        language: fot.language,
                        fieldOption: fot.fieldOption,
                    });
                    await newFot.save();
                }
            });
        });
        return res.code(204).send();
    } catch (err) {
        return res.code(500).send({ statusCode: 500, error: "Server Error", message: err });
    }
};

export const updateFieldGroup = async (req: IRequest, res: IResponse) => {
    const field = req.field;
    const form = req.form;
    try {
        if (req.body.group._id) {
            await Field.findByIdAndUpdate(field._id, { group: req.body.group._id }, { new: true });
        } else {
            const newGroup = new FieldGroup({
                name: req.body.group.name,
                form: form._id,
            });
            const savedGroup = await newGroup.save();
            await Field.findByIdAndUpdate(field._id, { group: savedGroup._id }, { new: true });
        }
        const updatedForm = await Form.aggregate([
            {
                $match: { _id: form._id },
            },
            {
                $lookup: {
                    from: "formtitles",
                    let: {
                        formId: "$_id",
                        defaultLanguage: "$defaultLanguage",
                    },
                    pipeline: [
                        {
                            $match: {
                                $and: [
                                    { $expr: { $eq: ["$form", "$$formId"] } },
                                    { $expr: { $eq: ["$language", "$$defaultLanguage"] } },
                                ],
                            },
                        },
                    ],
                    as: "titles",
                },
            },
            {
                $lookup: {
                    from: "fieldgroups",
                    localField: "_id",
                    foreignField: "form",
                    as: "groups",
                },
            },
            {
                $lookup: {
                    from: "grouptypes",
                    localField: "_id",
                    foreignField: "form",
                    as: "groupTypes",
                },
            },
            {
                $lookup: {
                    from: "fields",
                    let: {
                        formId: "$_id",
                        defaultLanguage: "$defaultLanguage",
                    },
                    as: "fields",
                    pipeline: [
                        {
                            $match: { $expr: { $eq: ["$form", "$$formId"] } },
                        },
                        {
                            $sort: { order: 1 },
                        },
                        {
                            $lookup: {
                                from: "fieldquestions",
                                as: "question",
                                let: { fieldId: "$_id" },
                                pipeline: [
                                    {
                                        $match: {
                                            $and: [
                                                { $expr: { $eq: ["$field", "$$fieldId"] } },
                                                { $expr: { $eq: ["$language", "$$defaultLanguage"] } },
                                            ],
                                        },
                                    },
                                ],
                            },
                        },
                        {
                            $lookup: {
                                from: "fieldoptions",
                                as: "options",
                                let: { fieldId: "$_id" },
                                pipeline: [
                                    {
                                        $match: { $expr: { $eq: ["$field", "$$fieldId"] } },
                                    },
                                    {
                                        $lookup: {
                                            from: "fieldoptiontexts",
                                            as: "text",
                                            let: { fieldOptionId: "$_id" },
                                            pipeline: [
                                                {
                                                    $match: {
                                                        $and: [
                                                            { $expr: { $eq: ["$fieldOption", "$$fieldOptionId"] } },
                                                            { $expr: { $eq: ["$language", "$$defaultLanguage"] } },
                                                        ],
                                                    },
                                                },
                                            ],
                                        },
                                    },
                                    {
                                        $lookup: {
                                            from: "fieldvariables",
                                            localField: "_id",
                                            foreignField: "referee",
                                            as: "variable",
                                        },
                                    },
                                    {
                                        $unwind: { path: "$variable", preserveNullAndEmptyArrays: true },
                                    },
                                ],
                            },
                        },
                        {
                            $lookup: {
                                from: "fieldgroups",
                                localField: "group",
                                foreignField: "_id",
                                as: "group",
                            },
                        },
                        {
                            $unwind: { path: "$group", preserveNullAndEmptyArrays: true },
                        },
                        {
                            $lookup: {
                                from: "fieldvariables",
                                localField: "_id",
                                foreignField: "referee",
                                as: "variables",
                            },
                        },
                    ],
                },
            },
        ]);
        return res.code(201).send(updatedForm[0]);
    } catch (err) {
        return res.code(500).send({ statusCode: 500, error: "Server Error", message: err });
    }
};
export const updateGroupTypes = async (req: IRequest, res: IResponse) => {
    const fieldGroup = req.fieldGroup;
    const form = req.form;
    try {
        if (req.body.groupType._id) {
            await FieldGroup.findByIdAndUpdate(fieldGroup._id, { type: req.body.groupType._id }, { new: true });
        } else {
            const newGroup = new GroupType({
                name: req.body.groupType.name,
                form: form._id,
            });
            const savedGroup = await newGroup.save();
            await FieldGroup.findByIdAndUpdate(fieldGroup._id, { type: savedGroup._id }, { new: true });
        }
        const updatedForm = await Form.aggregate([
            {
                $match: { _id: form._id },
            },
            {
                $lookup: {
                    from: "formtitles",
                    let: {
                        formId: "$_id",
                        defaultLanguage: "$defaultLanguage",
                    },
                    pipeline: [
                        {
                            $match: {
                                $and: [
                                    { $expr: { $eq: ["$form", "$$formId"] } },
                                    { $expr: { $eq: ["$language", "$$defaultLanguage"] } },
                                ],
                            },
                        },
                    ],
                    as: "titles",
                },
            },
            {
                $lookup: {
                    from: "fieldgroups",
                    localField: "_id",
                    foreignField: "form",
                    as: "groups",
                },
            },
            {
                $lookup: {
                    from: "grouptypes",
                    localField: "_id",
                    foreignField: "form",
                    as: "groupTypes",
                },
            },
            {
                $lookup: {
                    from: "fields",
                    let: {
                        formId: "$_id",
                        defaultLanguage: "$defaultLanguage",
                    },
                    as: "fields",
                    pipeline: [
                        {
                            $match: { $expr: { $eq: ["$form", "$$formId"] } },
                        },
                        {
                            $sort: { order: 1 },
                        },
                        {
                            $lookup: {
                                from: "fieldquestions",
                                as: "question",
                                let: { fieldId: "$_id" },
                                pipeline: [
                                    {
                                        $match: {
                                            $and: [
                                                { $expr: { $eq: ["$field", "$$fieldId"] } },
                                                { $expr: { $eq: ["$language", "$$defaultLanguage"] } },
                                            ],
                                        },
                                    },
                                ],
                            },
                        },
                        {
                            $lookup: {
                                from: "fieldoptions",
                                as: "options",
                                let: { fieldId: "$_id" },
                                pipeline: [
                                    {
                                        $match: { $expr: { $eq: ["$field", "$$fieldId"] } },
                                    },
                                    {
                                        $lookup: {
                                            from: "fieldoptiontexts",
                                            as: "text",
                                            let: { fieldOptionId: "$_id" },
                                            pipeline: [
                                                {
                                                    $match: {
                                                        $and: [
                                                            { $expr: { $eq: ["$fieldOption", "$$fieldOptionId"] } },
                                                            { $expr: { $eq: ["$language", "$$defaultLanguage"] } },
                                                        ],
                                                    },
                                                },
                                            ],
                                        },
                                    },
                                    {
                                        $lookup: {
                                            from: "fieldvariables",
                                            localField: "_id",
                                            foreignField: "referee",
                                            as: "variable",
                                        },
                                    },
                                    {
                                        $unwind: { path: "$variable", preserveNullAndEmptyArrays: true },
                                    },
                                ],
                            },
                        },
                        {
                            $lookup: {
                                from: "fieldgroups",
                                localField: "group",
                                foreignField: "_id",
                                as: "group",
                            },
                        },
                        {
                            $unwind: { path: "$group", preserveNullAndEmptyArrays: true },
                        },
                        {
                            $lookup: {
                                from: "fieldvariables",
                                localField: "_id",
                                foreignField: "referee",
                                as: "variables",
                            },
                        },
                    ],
                },
            },
        ]);
        return res.code(201).send(updatedForm[0]);
    } catch (err) {
        return res.code(500).send({ statusCode: 500, error: "Server Error", message: err });
    }
};
export const updateFieldOptionsVariable = async (req: IRequest, res: IResponse) => {
    const field = req.field;
    const form = req.form;
    const vars: IFieldVariable[] = req.body.vars;

    try {
        vars.forEach(async v => {
            if (v._id) {
                await FieldVariable.findByIdAndUpdate(v._id, { operation: v.operation, value: v.value });
            } else {
                const newVar = new FieldVariable({
                    operation: v.operation,
                    value: v.value,
                    onReferee: "FieldOption",
                    referee: v.referee,
                });
                await newVar.save();
            }
        });
        const f = await Form.aggregate([
            {
                $match: { _id: form._id },
            },
            {
                $lookup: {
                    from: "formtitles",
                    let: {
                        formId: "$_id",
                        defaultLanguage: "$defaultLanguage",
                    },
                    pipeline: [
                        {
                            $match: {
                                $and: [
                                    { $expr: { $eq: ["$form", "$$formId"] } },
                                    { $expr: { $eq: ["$language", "$$defaultLanguage"] } },
                                ],
                            },
                        },
                    ],
                    as: "titles",
                },
            },
            {
                $lookup: {
                    from: "fieldgroups",
                    localField: "_id",
                    foreignField: "form",
                    as: "groups",
                },
            },
            {
                $lookup: {
                    from: "grouptypes",
                    localField: "_id",
                    foreignField: "form",
                    as: "groupTypes",
                },
            },
            {
                $lookup: {
                    from: "fields",
                    let: {
                        formId: "$_id",
                        defaultLanguage: "$defaultLanguage",
                    },
                    as: "fields",
                    pipeline: [
                        {
                            $match: { $expr: { $eq: ["$form", "$$formId"] } },
                        },
                        {
                            $sort: { order: 1 },
                        },
                        {
                            $lookup: {
                                from: "fieldquestions",
                                as: "question",
                                let: { fieldId: "$_id" },
                                pipeline: [
                                    {
                                        $match: {
                                            $and: [
                                                { $expr: { $eq: ["$field", "$$fieldId"] } },
                                                { $expr: { $eq: ["$language", "$$defaultLanguage"] } },
                                            ],
                                        },
                                    },
                                ],
                            },
                        },
                        {
                            $lookup: {
                                from: "fieldoptions",
                                as: "options",
                                let: { fieldId: "$_id" },
                                pipeline: [
                                    {
                                        $match: { $expr: { $eq: ["$field", "$$fieldId"] } },
                                    },
                                    {
                                        $lookup: {
                                            from: "fieldoptiontexts",
                                            as: "text",
                                            let: { fieldOptionId: "$_id" },
                                            pipeline: [
                                                {
                                                    $match: {
                                                        $and: [
                                                            { $expr: { $eq: ["$fieldOption", "$$fieldOptionId"] } },
                                                            { $expr: { $eq: ["$language", "$$defaultLanguage"] } },
                                                        ],
                                                    },
                                                },
                                            ],
                                        },
                                    },
                                    {
                                        $lookup: {
                                            from: "fieldvariables",
                                            localField: "_id",
                                            foreignField: "referee",
                                            as: "variable",
                                        },
                                    },
                                    {
                                        $unwind: { path: "$variable", preserveNullAndEmptyArrays: true },
                                    },
                                ],
                            },
                        },
                        {
                            $lookup: {
                                from: "fieldgroups",
                                localField: "group",
                                foreignField: "_id",
                                as: "group",
                            },
                        },
                        {
                            $unwind: { path: "$group", preserveNullAndEmptyArrays: true },
                        },
                        {
                            $lookup: {
                                from: "fieldvariables",
                                localField: "_id",
                                foreignField: "referee",
                                as: "variables",
                            },
                        },
                    ],
                },
            },
        ]);

        return res.code(200).send(f[0]);
    } catch (err) {
        return res.code(500).send({ statusCode: 500, error: "Server Error", message: err });
    }
};
// export const createFieldGroup = async (req: IRequest, res: IResponse) => {
//     const field = req.field;
//     const form = req.form;
//     try {
//         const newGroup = new FieldGroup({
//             name: req.body.group.name,
//             form: form._id,
//         });
//         const savedGroup = await newGroup.save();
//         await Field.findByIdAndUpdate(field._id, { group: savedGroup._id }, { new: true });
//         return res.code(200).send();
//     } catch (err) {
//         return res.code(500).send({ statusCode: 500, error: "Server Error", message: err });
//     }
// };
