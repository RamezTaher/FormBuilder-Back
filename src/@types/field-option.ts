import { IField } from "./field";
import { IBase } from "./base";
import { IFieldOptionText } from "./field-option-text";
import { IFieldVariable } from "./field-variable";
export interface IFieldOption extends IBase {
    text: IFieldOptionText[];
    value: string;
    order: number;
    key: string;
    field: IField;
    variable: IFieldVariable;
}
