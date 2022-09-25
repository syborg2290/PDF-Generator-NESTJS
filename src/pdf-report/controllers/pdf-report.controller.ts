import { Body, Controller, Get, Post, StreamableFile } from '@nestjs/common';
import { createReadStream } from 'fs';
import * as os from 'os';
import { join } from 'path';

// import * as express from 'express'
import { LoggerClass } from 'src/common/classes/Logger';
import { ImplementLogger } from 'src/common/decorators/logger.decorator';
import { PdfReportService } from '../services/pdf-report.service';

@Controller('pdf-report')
@ImplementLogger
export class PdfReportController extends LoggerClass {
  isWin = os.platform() === 'win32';

  constructor(private readonly pdfReportService: PdfReportService) {
    super();
  }

  @Post()
  // @Header('Content-type', 'application/pdf')
  async generatePdf(@Body() req) {
    const responseData = await this.pdfReportService.allocateBrowser(
      req,
      false,
    );
    if (req['responseType'] === 'PRE_SIGNED_URL') {
      return responseData['preSignedURL'];
    } else if (req['responseType'] === 'FILE_STREAM') {
      const file = createReadStream(
        this.isWin
          ? join(process.cwd(), responseData['finalFileName'])
          : responseData['finalFileName'],
      );
      return new StreamableFile(file);
    }
  }

  @Get()
  dummyHandler() {
    return 'Hello , its working';
  }
}
