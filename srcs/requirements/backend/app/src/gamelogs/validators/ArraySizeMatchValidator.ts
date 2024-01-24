import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

@ValidatorConstraint({ name: 'arraySizeMatch', async: false })
export class ArraySizeMatchValidator implements ValidatorConstraintInterface {
    validate(values: any[], args: ValidationArguments) {
        const propertyName = args.constraints[0];

        if (
            values && args.object
            && args.object.hasOwnProperty(propertyName)
            && Array.isArray(args.object[propertyName])
        ) {
            const targetArray = args.object[propertyName];
            return (values.length === targetArray.length);
        }

        return (true);
    }

    defaultMessage(args: ValidationArguments) {
        return (`${args.property} and ${args.constraints[0]} must be of the same size`);
    }
}
