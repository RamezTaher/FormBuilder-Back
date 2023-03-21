import { Schema, model, Document, Query } from "mongoose";
import { IGroupType } from "../@types";
import FieldGroup from "./field-group.models";

const GroupTypeSchema = new Schema(
    {
        name: { type: String },
        form: { type: Schema.Types.ObjectId, ref: "Form" },
    },
    { timestamps: true },
);

GroupTypeSchema.pre<Query<IGroupType & Document>>("findOneAndDelete", async function (next) {
    const id = this.getFilter()["_id"];
    await FieldGroup.deleteMany({ type: id });
    next();
});

export default model<IGroupType & Document>("GroupType", GroupTypeSchema);
    