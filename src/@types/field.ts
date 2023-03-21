import { IBase } from "./base";
import { IForm } from "./form";
import { IFieldQuestion } from "./field-question";
import { IFieldOption } from "./field-option";
import { IFieldGroup } from "./field-group";
import { IFieldVariable } from "./field-variable";
export interface IField extends IBase {
    question: IFieldQuestion[];
    image: string;
    options: IFieldOption[];
    type: string;
    order: number;
    description: string;
    isRequired: boolean;
    form: IForm;
    group: IFieldGroup;
    variables: IFieldVariable[];
}
