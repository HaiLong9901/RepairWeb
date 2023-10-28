import { Test, TestingModule } from '@nestjs/testing';
import { MalfunctionService } from './malfunction.service';

describe('MalfunctionService', () => {
  let service: MalfunctionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MalfunctionService],
    }).compile();

    service = module.get<MalfunctionService>(MalfunctionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
