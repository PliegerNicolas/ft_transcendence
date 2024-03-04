import { ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, registerDecorator } from "class-validator";
import { CreateChannelDto } from "src/modules/chats/channels/dtos/CreateChannel.dto";
import { ChannelMode } from "src/modules/chats/channels/enums/channel-mode.enum";

@ValidatorConstraint({ name: 'isValidChannelPasswordWithMode', async: false })
export class isValidChannelPasswordWithModeConstraint implements ValidatorConstraintInterface {

    validate(password: string, validationArguments?: ValidationArguments): boolean | Promise<boolean> {
        const mode = (validationArguments.object as CreateChannelDto).mode;

        if (mode === ChannelMode.PASSWORD_PROTECTED) return (!!password && password.length >= 8);
        else return (!password);
    }

    defaultMessage(validationArguments?: ValidationArguments): string {
        const mode = (validationArguments.object as CreateChannelDto).mode;

        if (mode === ChannelMode.PASSWORD_PROTECTED) return (`Password is required and must be at least 8 characters long for ${mode} mode`);
        else return (`No password should be provided for ${mode} mode`);
    }

}

export function IsValidChannelPasswordWithMode(validationOptions?: ValidationOptions) {
    return function(object: Object, propertyName: string) {
        registerDecorator({
            name: 'isValidChannelPasswordWithMode',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: isValidChannelPasswordWithModeConstraint,
        });
    };
}