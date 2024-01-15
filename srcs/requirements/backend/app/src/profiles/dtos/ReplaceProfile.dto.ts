import { IsDefined } from "class-validator";

export class ReplaceProfileDto {

    @IsDefined()
    firstName: string;

    @IsDefined()
    lastName: string;

}