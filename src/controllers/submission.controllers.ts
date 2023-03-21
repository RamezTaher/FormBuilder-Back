import { IRequest, IResponse } from "../@types";
import SubmissionAnalysis from "../models/submission-analysis.models";
import Submission from "../models/submission.models";
import Field from "../models/field.models";
import FieldOption from "../models/field-option.models";
import fieldVariableModels from "../models/field-variable.models";
import GroupType from "../models/group-type.models";


export const submitForm = async (req: IRequest, res: IResponse) => {
    const form = req.form;
    const newSubmission = new Submission({
        answers: req.body.answers,
        form: form._id,
    });
    try {
        const savedSubmission = await newSubmission.save();
        const localSA = new SubmissionAnalysis({
            scores: [],
            submission: savedSubmission._id,
            form: form._id,
        });
        for await (const [gtindex, localgt] of (await GroupType.find({ form: form._id })).entries()) {
            localSA.scores.push({ name: localgt.name, value: 0 });
            let totalCount = 0;
            for await (const answer of savedSubmission.answers) {
                const aField = await Field.findById(answer.field).populate("group");
                if (aField?.group) {
                    for await (const afopt of FieldOption.find({
                        field: answer.field,
                        value: { $in: answer.value },
                    })) {
                        const optVar = await fieldVariableModels.findOne({ referee: afopt._id });
                        if (String(aField?.group.type) === String(localgt._id)) {
                            if (optVar?.value) {
                                localSA.scores[gtindex].value =
                                    Number(localSA.scores[gtindex].value) + Number(optVar.value);
                            }
                            totalCount = 1 + totalCount;
                        }
                    }
                }
            }

            localSA.scores[gtindex].value = Number(localSA.scores[gtindex].value) / totalCount;
        }

        const savedSA = await localSA.save();
        return res.code(200).send({ message: savedSA });
    } catch (err) {
        return res.code(500).send({ statusCode: 500, error: "Server Error", message: err });
    }
};

export const getFormSubmissions = async (req: IRequest, res: IResponse) => {
    const { _id } = req.form;

    try {
        const submissions = await Submission.find({ form: _id }).populate("form");

        return res.code(200).send(submissions);
    } catch (err) {
        return res.code(500).send({ statusCode: 500, error: "Server Error", message: err });
    }
};

export const getFormSubmissionAnalysis = async (req: IRequest, res: IResponse) => {
    const { _id } = req.form;

    try {
        const submissions = await SubmissionAnalysis.find({ form: _id })
            .populate("submission")
            .populate("submission.answers.field");

        return res.code(200).send(submissions);
    } catch (err) {
        return res.code(500).send({ statusCode: 500, error: "Server Error", message: err });
    }
};
