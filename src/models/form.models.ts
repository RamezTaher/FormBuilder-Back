import { Schema, model, Query, Document } from "mongoose";
import * as uniqueValidator from "mongoose-unique-validator";

import { IForm } from "../@types";
import FieldOptionText from "./field-option-text.models";
import FieldQuestion from "./field-question.models";
import FieldOption from "./field-option.models";
import Field from "./field.models";
import FormTitle from "./form-title.models";
import GroupType from "./group-type.models";
import FieldGroup from "./field-group.models";
import Submission from "./submission.models";
const FormSchema = new Schema(
    {
        defaultLanguage: { type: String, default: "en" },
        translations: {
            type: [{ type: String }],
            default: ["en"],
        },
        owner: { type: Schema.Types.ObjectId, ref: "User" },
        description: { type: String },
        isLive: { type: Boolean, default: false },
    },
    { timestamps: true },
);
FormSchema.pre<Query<IForm & Document>>("findOneAndDelete", async function (next) {
    const id = this.getFilter()["_id"];
    await FormTitle.deleteMany({ form: id });
    const fo = await Field.find({ field: id });
    for await (const content of fo.map(async el => await Field.findByIdAndDelete(el._id)));
    await GroupType.deleteMany({ form: id });
    await FieldGroup.deleteMany({ form: id });
    await Submission.deleteMany({ form: id });
    next();
});
FormSchema.methods.addLanguage = async function (language: string) {
    if (this.translations.indexOf(language) === -1) {
        this.translations.push(language);
        const title = new FormTitle({
            form: this._id,
            language: language,
            text: "",
        });
        await title.save();
        const f = await Field.find({ form: this._id });
        for await (const content of f.map(async el => {
            const newFQ = new FieldQuestion({
                language: language,
                text: "",
                field: el._id,
            });
            await newFQ.save();
        }));
        const fo = await FieldOption.find({ form: this._id });
        for await (const content of fo.map(async el => {
            const newFO = new FieldOptionText({
                language: language,
                text: "",
                fieldOption: el._id,
            });
            await newFO.save();
        }));
        return this.save();
    }
};
FormSchema.methods.removeLanguage = async function (language: string) {
    if (this.translations.indexOf(language) !== -1) {
        this.translations = this.translations.filter((trans: string) => trans !== language);

        await FieldOptionText.deleteMany({ language: language });
        await FieldQuestion.deleteMany({ language: language });
    }
    this.save();
};
export default model<IForm & Document>("Form", FormSchema);
