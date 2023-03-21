import { IBase } from "./base";
import { IForm } from "./form";
export interface IGroupType extends IBase {
    name: string;
    form: IForm;
}
