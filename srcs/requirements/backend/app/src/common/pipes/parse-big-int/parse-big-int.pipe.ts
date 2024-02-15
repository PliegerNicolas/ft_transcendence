import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseBigIntPipe implements PipeTransform {

	transform(value: string, metadata: ArgumentMetadata): bigint {
    	const parsedValue = BigInt(value);

		if (!this.isBigInt(parsedValue)) {
    		throw new BadRequestException('Invalid bigint format');
		}

    	return (parsedValue);
	}

	private isBigInt(value: any): value is bigint {
		return (typeof value === 'bigint');
	}

}
