import { IBase } from "./base";
import { IFieldOption } from "./field-option";
export interface IFieldOptionText extends IBase {
    language: string;
    text: string;
    fieldOption: IFieldOption;
}
