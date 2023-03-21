import { Schema, model, Document } from "mongoose";
import * as uniqueValidator from "mongoose-unique-validator";
import { IUser } from "../@types";

interface IUserDocument extends Document {
    authToJSON: () => Partial<IUser>;
}
const UserSchema = new Schema(
    {
        firstName: { type: String, max: 64 },
        lastName: { type: String, max: 64 },
        email: {
            type: String,
            required: [true, "can't be blank"],
            index: true,
            lowercase: true,
            unique: true,
            maxlength: 512,
        },
        password: { type: String, required: [true, "can't be blank"], minlength: 8, maxlength: 1024 },
        isVerified: { type: Boolean, default: false },
        isActive: { type: Boolean, default: false },
        isAdmin: { type: Boolean, default: true },
        // role: { type: Schema.Types.ObjectId, ref: "Role" },
    },
    { timestamps: true },
);

UserSchema.plugin(uniqueValidator.default, { message: "is already taken." });

UserSchema.methods.authToJSON = function () {
    return {
        _id: this._id,
        email: this.email,
        firstName: this.firstName,
        lastName: this.lastName,
        isAdmin: this.isAdmin,
        isVerified: this.isVerified,
        isActive: this.isActive,
    };
};
export default model<IUserDocument & IUser>("User", UserSchema);

