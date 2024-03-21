import { Test, TestingModule } from '@nestjs/testing';
import { ChannelCronService } from './channel-cron.service';

describe('ChannelCronService', () => {
  let service: ChannelCronService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChannelCronService],
    }).compile();

    service = module.get<ChannelCronService>(ChannelCronService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
