import { IBase } from "./base";
import { IForm } from "./form";
import { IGroupType } from "./group-type";
export interface IFieldGroup extends IBase {
    name: string;
    form: IForm;
    type: IGroupType;
}
