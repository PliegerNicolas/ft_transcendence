import { IsNotEmpty } from "class-validator";

export class ReplaceChannelDto {

    @IsNotEmpty()
    name: string;

}