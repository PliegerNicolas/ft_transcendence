import { Test, TestingModule } from '@nestjs/testing';
import { GatewaysGateway } from './gateways.gateway';

describe('GatewaysGateway', () => {
  let gateway: GatewaysGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GatewaysGateway],
    }).compile();

    gateway = module.get<GatewaysGateway>(GatewaysGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
