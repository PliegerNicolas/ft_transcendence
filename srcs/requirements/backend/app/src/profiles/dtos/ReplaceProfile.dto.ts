import { IsDefined, IsNotEmpty } from "class-validator";

export class ReplaceProfileDto {

    @IsDefined()
    firstName: string;

    @IsDefined()
    lastName: string;

}