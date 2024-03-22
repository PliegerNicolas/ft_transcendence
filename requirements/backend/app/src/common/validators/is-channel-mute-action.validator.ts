import { ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, registerDecorator } from "class-validator";
import { ChannelAccessDto } from "src/modules/chats/channels/dtos/ChannelAccess.dto";
import { ChannelAccessAction } from "src/modules/chats/channels/enums/channel-access-action.enum";

@ValidatorConstraint({ name: 'isChannelMuteAction', async: false })
export class isChannelMuteActionConstraint implements ValidatorConstraintInterface {

    validate(duration: number, validationArguments?: ValidationArguments): boolean | Promise<boolean> {
        const action: ChannelAccessAction = (validationArguments.object as ChannelAccessDto).action;

        if (action !== ChannelAccessAction.MUTE && duration) return (false);

        return (true);
    }

    defaultMessage(validationArguments?: ValidationArguments): string {
        const propertyName: string = validationArguments.property;

        return (`${propertyName} can only be set with action ${ChannelAccessAction.MUTE}`);
    }

}

export function IsChannelMuteAction(validationOptions?: ValidationOptions) {
    return function(object: Object, propertyName: string) {
        registerDecorator({
            name: 'IsChannelMuteAction',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: isChannelMuteActionConstraint,
        });
    };
}