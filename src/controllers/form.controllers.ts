import Form from "../models/form.models";
import FormTitle from "../models/form-title.models";
import { IResponse, IRequest } from "../@types";
import { IForm } from "../@types/form";
import { Types } from "mongoose";
import FieldGroup from "../models/field-group.models";
export const createForm = async (req: IRequest, res: IResponse) => {
    const newForm = new Form({
        owner: req.loggedUser?._id,
    });

    try {
        const savedForm = await newForm.save();
        const newFormTitle = new FormTitle({
            text: "Untitled Form",
            form: savedForm._id,
        });
        await newFormTitle.save();
        const form = await Form.aggregate([
            {
                $match: { _id: savedForm._id },
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
                        { $unwind: "$group" },
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
        return res.code(201).send(form[0]);
    } catch (err) {
        return res.code(500).send({ statusCode: 500, error: "Server Error", message: err });
    }
};

export const getUserForms = async (req: IRequest, res: IResponse) => {
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 100;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const sortBy = req.query.sortBy ? req.query.sortBy : "createdAt";
    try {
        const count = await Form.countDocuments();
        const pages = pageSize > 0 ? Math.ceil(count / pageSize) || 1 : null;
        const hasNextPage = page < Number(pages);
        const hasPreviousPage = page > 1;
        const nextPage = hasNextPage ? page + 1 : null;
        const previousPage = hasPreviousPage ? page - 1 : null;
        const pagingCounter = (page - 1) * pageSize + 1;
        const forms = await Form.aggregate([
            { $match: { owner: Types.ObjectId(req.loggedUser?._id) } },
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
            { $skip: (page - 1) * pageSize },
            { $limit: pageSize },
            { $sort: { [sortBy]: -1 } },
        ]);
        return res.code(200).send({
            data: forms,
            pagination: {
                count: count,
                nextPage: nextPage,
                previousPage: previousPage,
                hasNextPage: hasNextPage,
                hasPreviousPage: hasPreviousPage,
                pages: pages,
                page: page,
                limit: pageSize,
                pagingCounter: pagingCounter,
            },
        });
    } catch (err) {
        return res.code(500).send({ statusCode: 500, error: "Server Error", message: err });
    }
};

export const getFormById = async (req: IRequest<{ form: IForm }>, res: IResponse) => {
    const { _id } = req.form;
    try {
        const form = await Form.aggregate([
            {
                $match: { _id: _id },
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

        return res.code(200).send(form[0]);
    } catch (err) {
        return res.code(500).send({ statusCode: 500, error: "Server Error", message: err });
    }
};

export const deleteForm = async (req: IRequest<{ form: IForm }>, res: IResponse) => {
    const id = req.form;
    try {
        await Form.findByIdAndDelete(id);
        return res.code(204).send();
    } catch (err) {
        return res.code(500).send({ statusCode: 500, error: "Server Error", message: err });
    }
};
export const updateFormTitle = async (req: IRequest<{ form: IForm }>, res: IResponse) => {
    const formTitle = req.formTitle;
    const form = req.form;
    try {
        await FormTitle.findByIdAndUpdate(formTitle._id, req.body, { new: true, runValidators: true });
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
        ]);
        return res.code(201).send(updatedForm[0]);
    } catch (err) {
        return res.code(500).send({ statusCode: 500, error: "Server Error", message: err });
    }
};

export const addFormLanguage = async (req: IRequest<{ form: IForm }>, res: IResponse) => {
    const form = req.form;
    try {
        await form.addLanguage(req.body.language);
        return res.code(202).send("accepted");
    } catch (err) {
        return res.code(500).send({ statusCode: 500, error: "Server Error", message: err });
    }
};
export const removeFormLanguage = async (req: IRequest<{ form: IForm }>, res: IResponse) => {
    const form = req.form;
    const language = req.params.language;
    try {
        await form.removeLanguage(language);
        return res.code(200).send(form);
    } catch (err) {
        return res.code(500).send({ statusCode: 500, error: "Server Error", message: err });
    }
};

export const getTranslationFormById = async (req: IRequest, res: IResponse) => {
    const form = req.form;
    const language = req.params.language;
    try {
        const formData = await Form.aggregate([
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
                                    {
                                        $or: [
                                            { $expr: { $eq: ["$language", "$$defaultLanguage"] } },
                                            { $expr: { $eq: ["$language", language] } },
                                        ],
                                    },
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
                                                {
                                                    $or: [
                                                        { $expr: { $eq: ["$language", "$$defaultLanguage"] } },
                                                        { $expr: { $eq: ["$language", language] } },
                                                    ],
                                                },
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
                                                            {
                                                                $or: [
                                                                    {
                                                                        $expr: {
                                                                            $eq: ["$language", "$$defaultLanguage"],
                                                                        },
                                                                    },
                                                                    {
                                                                        $expr: {
                                                                            $eq: ["$language", language],
                                                                        },
                                                                    },
                                                                ],
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

        return res.code(200).send(formData[0]);
    } catch (err) {
        return res.code(500).send({ statusCode: 500, error: "Server Error", message: err });
    }
};
export const getFormForSubmission = async (req: IRequest<{ form: IForm }>, res: IResponse) => {
    const form: IForm = req.form;
    const language = form.translations.indexOf(req.language) !== -1 ? req.language : form.defaultLanguage;
    console.log(language);
    try {
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
                                    { $expr: { $eq: ["$language", language] } },
                                ],
                            },
                        },
                    ],
                    as: "titles",
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
                                                { $expr: { $eq: ["$language", language] } },
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
                                                            { $expr: { $eq: ["$language", language] } },
                                                        ],
                                                    },
                                                },
                                            ],
                                        },
                                    },
                                ],
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
