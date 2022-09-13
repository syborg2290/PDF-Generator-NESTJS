import { Test, TestingModule } from '@nestjs/testing';
import { PdfReportController } from './pdf-report.controller';

describe('PdfReportController', () => {
  let controller: PdfReportController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PdfReportController],
    }).compile();

    controller = module.get<PdfReportController>(PdfReportController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
