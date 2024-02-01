import { IsOptional } from "class-validator";

export class UpdateChannelDto {

    @IsOptional()
    name?: string;

}