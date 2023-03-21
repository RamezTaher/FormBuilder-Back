import { IBase } from "./base";
import { IUser } from "./user";
import { IField } from "./field";
import { IFieldGroup, IGroupType } from ".";
export interface IForm extends IBase {
    owner: IUser;
    defaultLanguage: string;
    title: string;
    description: string;
    groupTypes: IGroupType[];
    groups: IFieldGroup[];
    fields: IField[];
    isLive: boolean;
    translations: string[];
}
