import { IBase } from "./base";
import { IForm } from "./form";
import { ISubmission } from "./submission";
export interface ISubmissionAnalysis extends IBase {
    form: IForm;
    submission: ISubmission;
    scores: { name: string; value: number }[];
}
