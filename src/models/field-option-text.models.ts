import { Schema, model, Document } from "mongoose";
import { IFieldOptionText } from "../@types";

const FieldOptionTextSchema = new Schema(
    {
        language: { type: String, default: "en" },
        text: { type: String },
        fieldOption: { type: Schema.Types.ObjectId, ref: "FieldOption" },
    },
    { timestamps: true },
);
export default model<IFieldOptionText & Document>("FieldOptionText", FieldOptionTextSchema);
