import { Schema, model, Document, Query } from "mongoose";
import { IField } from "../@types";
import FieldOption from "./field-option.models";
import FieldQuestion from "./field-question.models";
import FieldVariable from "./field-variable.models";

const FieldSchema = new Schema(
    {
        image: { type: String },
        type: { type: String },
        order: { type: Number },
        description: { type: String },
        isRequired: { type: Boolean },
        form: { type: Schema.Types.ObjectId, ref: "Form" },
        group: { type: Schema.Types.ObjectId, ref: "FieldGroup" },
    },
    { timestamps: true },
);
FieldSchema.pre<Query<IField & Document>>("findOneAndDelete", async function (next) {
    const id = this.getFilter()["_id"];
    await FieldQuestion.deleteMany({ field: id });
    await FieldVariable.deleteMany({ referee: id });
    const fo = await FieldOption.find({ field: id });
    for await (const content of fo.map(async el => await FieldOption.findByIdAndDelete(el._id)));
    next();
});
export default model<IField & Document>("Field", FieldSchema);
