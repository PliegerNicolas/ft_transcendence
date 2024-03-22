import { Transform } from "class-transformer";

export class GetChannelDto {

    @Transform(({ value }) => value?.length > 0 ? value.trim() : null)
    password?: string;

}