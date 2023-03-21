import { IBase } from "./base";
import { IForm } from "./form";
export type Answer = {
    field: string;
    value: number | string | (string | number)[];
};
export interface ISubmission extends IBase {
    answers: Answer[];
    form: IForm;
}
