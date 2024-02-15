import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ParseBigIntPipe } from '../parse-big-int/parse-big-int.pipe';

@Injectable()
export class ParseIdPipe implements PipeTransform {

	private readonly MIN_BIGINT = BigInt('-9223372036854775808');
	private readonly MAX_BIGINT = BigInt('9223372036854775807');
	private parseBigIntPipe = new ParseBigIntPipe();

	transform(value: string, metadata: ArgumentMetadata): bigint {
		const parsedValue = this.parseInt(value, metadata);

		if (parsedValue < this.MIN_BIGINT || parsedValue > this.MAX_BIGINT) throw new BadRequestException('Value is out of range for type bigint');
		else if (parsedValue <= 0n) throw new BadRequestException('A strictly positive bigint integer is required');
  
		return (parsedValue);
	}
  
	private parseInt(value: string, metadata: ArgumentMetadata): bigint {
		try {
			return (this.parseBigIntPipe.transform(value, metadata));
		} catch (error) {
			throw new BadRequestException('Invalid bigint format');
		}
	}

}
