import { ArgumentMetadata, BadRequestException, Injectable, OnModuleInit, PipeTransform } from '@nestjs/common';
import { EntityManager } from 'typeorm';

@Injectable()
export class BigintPipe implements PipeTransform, OnModuleInit {

	private maxPostgresqlBigInt: bigint;
	private minPostgresqlBigInt: bigint;

	constructor(
		private readonly entityManager: EntityManager,
	) {}

	async onModuleInit() {
		const query = `
				WITH size AS (
					SELECT (pg_column_size(0::bigint) * 8)::bigint AS bits -- Bit size of bigint type
				),
				limits AS (
					SELECT
						bits,
						POWER(2::numeric, bits - 1) -1 AS max,
						-POWER(2::numeric, bits - 1) AS min
					FROM size
				)
				SELECT max::bigint, min::bigint FROM limits;
		`;

        const result = await this.entityManager.query(query);

		if (result[0]) {
			this.maxPostgresqlBigInt = BigInt(result[0].max);
			this.minPostgresqlBigInt = BigInt(result[0].min);
		} else throw new Error(`Couldn't retrieve postgresql's max and min values for BigInt`);
	}

	transform(value: string, metadata?: ArgumentMetadata): bigint {
    	if (!/^-?\d+$/.test(value)) throw new BadRequestException(`Validation failed (numeric string expected)`);

		try {
			const bigintValue = BigInt(value);

			if (bigintValue > this.maxPostgresqlBigInt) throw new BadRequestException('Validation failed (numeric string represents a too big value)');
			else if (bigintValue < this.minPostgresqlBigInt) throw new BadRequestException('Validation failed (number string represents a too small value)');

			return (bigintValue);
		} catch(error) {
			throw new BadRequestException(error.message);
		}
	}

}