import { Schema, model, Document } from "mongoose";
import { ISubmissionAnalysis } from "../@types";

const SubmissionAnalysisSchema = new Schema(
    {
        scores: [{ name: String, value: Number }],
        submission: { type: Schema.Types.ObjectId, ref: "Submission" },
        form: { type: Schema.Types.ObjectId, ref: "Form" },
    },
    { timestamps: true },
);

export default model<ISubmissionAnalysis & Document>("SubmissionAnalysis", SubmissionAnalysisSchema);
