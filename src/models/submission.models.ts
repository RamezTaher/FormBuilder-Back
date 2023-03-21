import { Schema, model, Document } from "mongoose";
import { ISubmission } from "../@types";

const SubmissionSchema = new Schema(
    {
        isAnonymous: { type: Boolean },
        answers: [
            {
                field: { type: Schema.Types.ObjectId, ref: "Field" },
                value: { type: Schema.Types.Mixed },
            },
        ],
        form: { type: Schema.Types.ObjectId, ref: "Form" },
    },
    { timestamps: true },
);

export default model<ISubmission & Document>("Submission", SubmissionSchema);
