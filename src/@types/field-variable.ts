import { IBase } from "./base";
import { IField } from "./field";
import { IFieldOption } from "./field-option";
export interface IFieldVariable extends IBase {
    operation: string;
    value: number;
    onReferee: string;
    referee: IField | IFieldOption;
}
