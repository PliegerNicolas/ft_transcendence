import { Controller } from '@nestjs/common';
import { Serialize } from 'src/common/serialization/decorators/serialization/serialization.decorator';

@Controller()
@Serialize()
export class PasswordHashingController {}
