import { IsNotEmpty } from "class-validator";

export class ReplaceMessageDto {

    @IsNotEmpty()
    content: string;

}