import { IField } from "./field";
import { IBase } from "./base";
export interface IFieldQuestion extends IBase {
    language: string;
    question: string;
    field: IField;
}
