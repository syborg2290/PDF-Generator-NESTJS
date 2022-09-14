import {
  Body,
  Controller,
  Get,
  Header,
  Post,
  StreamableFile
} from '@nestjs/common';
import { createReadStream } from 'fs';
import { join } from 'path';

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
  @Header('Content-type', 'application/pdf')
  async generatePdf(@Body() req) {
    const fileName = await this.pdfReportService.allocateBrowser(req, false);
    const file = createReadStream(join(process.cwd(), fileName));
    return new StreamableFile(file);
  }

  @Get()
  dummyHandler() {
    return 'Hello , its working';
  }
}
