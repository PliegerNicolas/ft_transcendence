import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreatePrivateChannelDto {
  
    @IsNotEmpty()
    @IsString()
    @MaxLength(25)
    username: string;

}