import { IBase } from "./base";
import { IForm } from "./form";
export interface IFormTitle extends IBase {
    language: string;
    text: string;
    form: IForm;
}
