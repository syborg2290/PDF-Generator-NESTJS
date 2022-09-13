import { Module } from '@nestjs/common';
import { PdfReportController } from './controllers/pdf-report.controller';
import { BrowserPoolService } from './services/browser-pool-service';
import { PdfReportService } from './services/pdf-report.service';

@Module({
  controllers: [PdfReportController],
  providers: [PdfReportService, BrowserPoolService],
})
export class PdfReportModule {}
