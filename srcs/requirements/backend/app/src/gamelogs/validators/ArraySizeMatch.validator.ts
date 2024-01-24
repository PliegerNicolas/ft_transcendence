import {
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
    ValidationOptions,
    registerDecorator,
  } from "class-validator";
  
@ValidatorConstraint({ name: "arraySizeMatch", async: false })
export class ArraySizeMatchValidator implements ValidatorConstraintInterface {
    validate(value: any, args: ValidationArguments) {
        const [relatedPropertyName] = args.constraints;
        const relatedValue = (args.object as any)[relatedPropertyName];

        if (value && relatedValue) {
            return (value.length === relatedValue.length);
        }
  
        return (false);
    }
  
    defaultMessage(args: ValidationArguments) {
        return ('Arrays must have the same length');
    }
}
  
export function ArraySizeMatch(relatedPropertyName: string, validationOptions?: ValidationOptions) {
    return function (object: Record<string, any>, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [relatedPropertyName],
            validator: ArraySizeMatchValidator,
        });
    };
}
  