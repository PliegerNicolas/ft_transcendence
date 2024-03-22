import { Test, TestingModule } from '@nestjs/testing';
import { MessagesRightsService } from './messages-rights.service';

describe('MessagesRightsService', () => {
  let service: MessagesRightsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MessagesRightsService],
    }).compile();

    service = module.get<MessagesRightsService>(MessagesRightsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
