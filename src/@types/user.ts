import { IRole } from "./role";
import { IBase } from "./base";
export interface IUser extends IBase {
    email: string;
    password: string;
    verificationCode: string;
    firstName: string;
    lastName: string;
    isAdmin: boolean;
    isVerified: boolean;
    role: IRole;
    isActive: boolean;
}
