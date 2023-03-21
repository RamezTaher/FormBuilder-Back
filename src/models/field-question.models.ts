import { Schema, model, Document } from "mongoose";
import { IFieldQuestion } from "../@types";

const FieldQuestionSchema = new Schema(
    {
        language: { type: String, default: "en" },
        question: { type: String },
        field: { type: Schema.Types.ObjectId, ref: "Field" },
    },
    { timestamps: true },
);
export default model<IFieldQuestion & Document>("FieldQuestion", FieldQuestionSchema);
