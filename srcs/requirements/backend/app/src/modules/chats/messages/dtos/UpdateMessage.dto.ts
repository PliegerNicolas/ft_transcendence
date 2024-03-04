import { IsOptional } from "class-validator";

export class UpdateMessageDto {

    @IsOptional()
    content?: string;

}