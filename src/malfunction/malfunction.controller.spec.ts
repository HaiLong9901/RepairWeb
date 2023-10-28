import { Test, TestingModule } from '@nestjs/testing';
import { MalfunctionController } from './malfunction.controller';

describe('MalfunctionController', () => {
  let controller: MalfunctionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MalfunctionController],
    }).compile();

    controller = module.get<MalfunctionController>(MalfunctionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
