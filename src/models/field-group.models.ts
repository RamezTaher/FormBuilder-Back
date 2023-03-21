import { Schema, model, Document } from "mongoose";
import { IFieldGroup } from "../@types";

const FieldGroupSchema = new Schema(
    {
        name: { type: String },
        form: { type: Schema.Types.ObjectId, ref: "Form" },
        type: { type: Schema.Types.ObjectId, ref: "GroupType" },
    },
    { timestamps: true },
);
export default model<IFieldGroup & Document>("FieldGroup", FieldGroupSchema);
