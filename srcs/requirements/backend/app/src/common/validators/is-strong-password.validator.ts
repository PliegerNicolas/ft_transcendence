import { ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, registerDecorator } from "class-validator";

@ValidatorConstraint({ name: 'isStrongPassword', async: false })
export class IsStrongPasswordConstraint implements ValidatorConstraintInterface {

    validate(password: string, validationArguments?: ValidationArguments): boolean | Promise<boolean> {
        const rules = [
            { pattern: /[a-z]/, message: 'at least one lowercase letter' },
            { pattern: /[A-Z]/, message: 'at least one uppercase letter' },
            { pattern: /\d/, message: 'at least one digit' },
            { pattern: /[@$!%*?&]/, message: 'at least one special character' }
        ];

        const missingCriteria = rules
            .filter((rule) => !rule.pattern.test(password))
            .map((rule) => rule.message);

        validationArguments.constraints[0] = missingCriteria;

        return (missingCriteria.length === 0);
    }

    defaultMessage(validationArguments?: ValidationArguments): string {
        const missingCritera = validationArguments?.constraints;
        if (missingCritera.length > 0) {
            return (`Password must meet the following criteria: ${missingCritera.join(', ')}`);
        }
        return ('Password must be strong');
    }

}

export function IsStrongPassword(validationOptions?: ValidationOptions) {
    return function(object: Object, propertyName: string) {
        registerDecorator({
            name: 'isStrongPassword',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: IsStrongPasswordConstraint,
            constraints: [[]],
        });
    };
}