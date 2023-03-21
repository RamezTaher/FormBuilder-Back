import { Schema, model, Document, Query } from "mongoose";
import { IFieldOption } from "../@types";
import FieldOptionText from "./field-option-text.models";
import FieldVariable from "./field-variable.models";
const FieldOptionSchema = new Schema(
    {
        key: { type: String },
        value: { type: String },
        order: { type: Number, default: 1 },
        field: { type: Schema.Types.ObjectId, ref: "Field" },
    },
    { timestamps: true },
);
FieldOptionSchema.pre<Query<IFieldOption & Document>>("findOneAndDelete", async function (next) {
    const id = this.getFilter()["_id"];
    await FieldOptionText.deleteMany({ fieldOption: id });
    await FieldVariable.deleteMany({ referee: id });
    next();
});
export default model<IFieldOption & Document>("FieldOption", FieldOptionSchema);
