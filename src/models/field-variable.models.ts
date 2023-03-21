import { Schema, model, Document } from "mongoose";
import { IFieldVariable } from "../@types";

const FieldVariableSchema = new Schema(
    {
        operation: { type: String },
        value: { type: Number },
        onReferee: {
            type: String,
            required: true,
            enum: ["Field", "FieldOption"],
        },
        referee: {
            type: Schema.Types.ObjectId,
            required: true,
            refPath: "onReferee",
        },
    },
    { timestamps: true },
);
export default model<IFieldVariable & Document>("FieldVariable", FieldVariableSchema);
