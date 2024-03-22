import { ArgumentMetadata, BadRequestException, Injectable } from '@nestjs/common';
import { BigintPipe } from '../bigint/bigint.pipe';

@Injectable()
export class IdPipe extends BigintPipe {

	transform(value: string, metadata?: ArgumentMetadata): bigint {
		const transformedValue: bigint = super.transform(value, metadata);

		if (transformedValue <= 0) throw new BadRequestException(`Validation failed (ID should be strictly positive)`);

		return (transformedValue);
	}

}