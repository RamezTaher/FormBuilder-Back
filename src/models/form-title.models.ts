import { Schema, model, Document } from "mongoose";
import { IFormTitle } from "../@types";
interface IFormTitleDocument extends Document {
    slugify: (text: string) => string;
}
const FormTitleSchema = new Schema(
    {
        language: { type: String, default: "en" },
        text: { type: String },
        form: { type: Schema.Types.ObjectId, ref: "Form" },
    },
    { timestamps: true },
);

export default model<IFormTitle & IFormTitleDocument>("FormTitle", FormTitleSchema);
