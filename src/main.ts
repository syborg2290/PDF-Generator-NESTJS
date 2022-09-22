import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as bodyParser from 'body-parser';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { resolve } from 'path';
import { AppModule } from './app.module';
// import otelSDK from './tracing';
// import * as ejs from 'ejs';

async function bootstrap() {
  // await otelSDK.start();
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // This method revokes functionality of all console methods , for encouraging use of logs
  for (const func in console) {
    // eslint-disable-next-line no-console
    console[func] = function () {};
  }

  // const config = new DocumentBuilder()
  //   .setTitle('Reporting API')
  //   .setDescription('Pass a JSON to POST request to build an Excel workbook')
  //   .setVersion('1.0')
  //   .addTag('excel')
  //   .build();
  // const document = SwaggerModule.createDocument(app, config);
  // SwaggerModule.setup('api', app, document);

  app.useStaticAssets(resolve('./src/public'));
  app.setBaseViewsDir(resolve('./src/views'));
  app.setViewEngine('ejs');

  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  await app.listen(80);
}
bootstrap();
