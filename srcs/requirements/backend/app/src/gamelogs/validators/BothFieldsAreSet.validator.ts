import { ValidationOptions, registerDecorator, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ async: false })
export class BothFieldsAreSetConstraint implements ValidatorConstraintInterface {
    validate(value: any, args: ValidationArguments) {
        const fieldName = args.constraints[0];
        const otherFieldValue = args.object[fieldName];

        return (!!value && !!otherFieldValue) || (!value && !otherFieldValue);
    }

    defaultMessage(args: ValidationArguments) {
        return ('Either both fields should be set or both should be empty');
    }
}

export function BothFieldsAreSet(otherField: string, validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [otherField],
            validator: BothFieldsAreSetConstraint,
        });
    };
}