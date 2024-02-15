import { IsArray, IsEnum, IsNotEmpty, ValidateNested } from "class-validator";
import { GameType } from "../entities/Gamelog.entity";
import { UserResult } from "./UserResult.dto";
import { Transform, Type } from "class-transformer";

export class CreateGamelogDto {

    @IsNotEmpty()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UserResult)
    //@Transform(({ value }) => value.sort((a: UserResult, b: UserResult) => a.id - b.id))
    userResults: UserResult[];

    @IsNotEmpty()
    @IsEnum(GameType, { message: 'Invalid game type' })
    gameType: GameType;

}