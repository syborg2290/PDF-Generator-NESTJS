import { Body, Controller, Get, Post } from '@nestjs/common';
// import * as express from 'express'
import { LoggerClass } from 'src/common/classes/Logger';
import { ImplementLogger } from 'src/common/decorators/logger.decorator';
import { PdfReportService } from '../services/pdf-report.service';

@Controller('pdf-report')
@ImplementLogger
export class PdfReportController extends LoggerClass {
  constructor(private readonly pdfReportService: PdfReportService) {
    super();
  }

  @Post()
  // @Header('Content-type', 'application/pdf')
  async generatePdf(@Body() req) {
    const buffer = await this.pdfReportService.allocateBrowser(req, false);
    return buffer;
  }

  @Get()
  dummyHandler() {
    return 'Hello , its working';
  }
}
