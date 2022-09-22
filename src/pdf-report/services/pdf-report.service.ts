import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import axios from 'axios';
import { Buffer } from 'buffer';
import * as merge from 'easy-pdf-merge';
import * as ejs from 'ejs';
import * as fs from 'fs';
import * as os from 'os';
import { resolve } from 'path';
import * as puppeteer from 'puppeteer-core';
import { ImplementLogger } from '../../common/decorators/logger.decorator';
import header from '../../views/header/header-script';
import moduleFrontPage from '../../views/module-front-page/module-front-page-script';
import headerHandler from '../../views/pdf-front-page/pdf-front-page-script';
import portlet from '../../views/portlet';
import { LoggerClass } from './../../common/classes/Logger';
import { BrowserPoolService } from './browser-pool-service';

@Injectable()
@ImplementLogger
export class PdfReportService extends LoggerClass {
  footerTemplate;

  s3;
  isWin = os.platform() === 'win32';
  tempPath = this.isWin ? 'src/tmpPdf/' : resolve('./tmpPdf/');

  constructor(private browserPoolService: BrowserPoolService) {
    super();
  }

  async allocateBrowser(event, testing?) {
    const browserInstance = await this.browserPoolService.getBrowser();

    const results = await this.handler(browserInstance, event, testing);
    return results;
  }

  async handler(browserInstance, event, testing?) {
    let dataResponse = null;
    if (event['s3Url']) {
      // hit api
      this.logger.log('GETTING DATA FROM S3');
      await axios.get(event['s3Url']).then((response) => {
        dataResponse = response.data;
      });
    } else {
      dataResponse = JSON.parse(JSON.stringify(event));
    }

    const bucketName = dataResponse['bucketName'];
    const reportKey = dataResponse['reportKey'];

    if (!this.s3) {
      AWS.config.credentials = {
        accessKeyId: '',
        secretAccessKey: '',
      };
      this.s3 = new AWS.S3({ region: 'ap-south-1' });
    }

    const DEPLOYMENT_NAME = process.env['DEPLOYMENT_NAME'];
    let BASE_API_URL = '';

    if (DEPLOYMENT_NAME && DEPLOYMENT_NAME === 'staging') {
      BASE_API_URL = 'https://apistaging.centilytics.com/docs/public/';
    } else if (DEPLOYMENT_NAME && DEPLOYMENT_NAME !== 'production') {
      BASE_API_URL =
        'https://api-' + DEPLOYMENT_NAME + '.centilytics.com/docs/public/';
    } else {
      BASE_API_URL = 'https://api.centilytics.com/docs/public/';
    }
    try {
      process.env['PUPPETEER_SKIP_CHROMIUM_DOWNLOAD'] = 'true';

      // Initializing Puppeteer Browser And Page
      this.logger.log('Initializing Browser And Page.................');
      const launchOptions = {
        headless: true,
        executablePath: process.env.CHROME_BIN || null,
        args: [
          '--no-sandbox',
          '--headless',
          '--disable-gpu',
          '--disable-dev-shm-usage',
        ],
      };
      if (testing) {
        launchOptions['executablePath'] =
          'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
      } else {
        // launchOptions['args'] = chromium.args;
        // launchOptions['defaultViewport'] = chromium.defaultViewport;
        // launchOptions['executablePath'] = await chromium.executablePath;
      }

      // const browser = await puppeteer.launch(launchOptions);

      // const browser = await puppeteer.connect({
      //   browserURL: 'http://52.66.202.130:9222',
      // });

      const key = browserInstance.key;
      let browser = browserInstance.value['browser'];

      this.browserPoolService.browserPoolMap.set(key, {
        browser: browserInstance,
        runningTasks:
          this.browserPoolService.browserPoolMap.get(key)['runningTasks'] + 1,
      });

      if (!browser || !browser.newPage) {
        browser = this.browserPoolService.getBrowser(true);
      }

      // Setting Basic Fields
      this.logger.log('Setting Basic Fields....');
      const pdfFiles = [];
      const fileName = dataResponse['fileName']
        ? dataResponse['fileName']
        : 'Report';

      this.footerTemplate = `<style>#footer { padding: 0 !important; }</style>
        <div style=' width:100%; -webkit-print-color-adjust: exact;height:20px;clear: both; display: flex; flex-direction: column;'>             
            <span style="color: white; flex: 1; background: #263550;vertical-align: middle; font-size: 7px; display: flex; align-items: center;padding-left: 20px">Powered by Centilytics 2021 &copy;</span>
        </div>`;

      this.logger.log('first breakpoint');

      await this.createPdf(
        browser,
        this.isWin
          ? 'src/views/pdf-front-page/pdf-front-page-template.ejs'
          : resolve('../../views/pdf-front-page/pdf-front-page-template.ejs'),
        dataResponse,
        headerHandler.scriptsToImport,
        headerHandler.script(dataResponse),
        1000,
        {
          path: this.tempPath + fileName + new Date().getTime() + '.pdf',
          format: 'LETTER',
          landscape: true,
          timeout: 0,
        },
        pdfFiles,
      );

      this.logger.log('second breakpoint');

      this.logger.log('Data Response Modules ' + dataResponse['modules']);
      this.logger.log(
        'Keys of Modules ' + Object.keys(dataResponse['modules']),
      );
      const moduleKeys = Object.keys(dataResponse['modules']);
      for (let i = 0; i < moduleKeys.length; i++) {
        this.logger.log(
          'module text',
          dataResponse['modules'][moduleKeys[i]]['moduleText'],
        );
        this.logger.log('Temp Folder Path' + this.tempPath);
        this.logger.log('Calling create PDF');

        await this.createPdf(
          browser,
          this.isWin
            ? 'src/views/module-front-page/module-front-page-template.ejs'
            : resolve(
                '../../views/module-front-page/module-front-page-template.ejs',
              ),
          dataResponse,
          moduleFrontPage.scriptsToImport,
          moduleFrontPage.script(dataResponse['modules'][moduleKeys[i]]),
          1000,
          {
            path: this.tempPath + fileName + new Date().getTime() + '.pdf',
            format: 'LETTER',
            landscape: true,
            timeout: 0,
          },
          pdfFiles,
        );

        for (
          let j = 0;
          j < dataResponse['modules'][moduleKeys[i]]['insights'].length;
          j++
        ) {
          const insightData =
            dataResponse['modules'][moduleKeys[i]]['insights'][j];

          const invocationType = insightData['data']['invocationType']
            ? insightData['data']['invocationType']
            : 'auth';
          await axios
            .get(
              BASE_API_URL +
                insightData['data']['cloud'] +
                '/' +
                insightData['data']['module'] +
                '/' +
                invocationType +
                '/' +
                insightData['data']['page'] +
                '/' +
                insightData['data']['insight'] +
                '/' +
                'description.json',
            )
            .then((response) => {
              if (response.data && response.data['checkDescription']) {
                insightData['data']['checkDescription'] =
                  response.data['checkDescription'];
              }
            })
            .catch((error) => {
              this.logger.log(
                'Description json is not available for this insight.',
              );
            });

          this.logger.log('descr', insightData['data']['checkDescription']);

          insightData['data']['startDate'] = dataResponse['startDate'];
          insightData['data']['endDate'] = dataResponse['endDate'];
          const templateFolderName =
            portlet[insightData['portletType'].toLowerCase()][
              'templateFolderName'
            ];
          const baseDirectory = this.isWin ? 'src/views/' : '../../views/';
          const ejsTemplatePath =
            baseDirectory +
            templateFolderName +
            '/' +
            templateFolderName +
            '-template.ejs';

          await this.createPdf(
            browser,
            this.isWin ? ejsTemplatePath : resolve(ejsTemplatePath),
            dataResponse,
            header.scriptsToImport,
            portlet[insightData['portletType'].toLowerCase()]['script'](
              insightData['data'],
            ),
            3000,
            {
              path: this.tempPath + fileName + new Date().getTime() + '.pdf',
              format: 'Letter',
              landscape: true,
              displayHeaderFooter: true,
              timeout: 0,
              headerTemplate: `<div></div>`,
              footerTemplate: this.footerTemplate,
              printBackground: true,
              preferCSSPageSize: false,
              margin: {
                top: '40px',
                bottom: '40px',
              },
            },
            pdfFiles,
          );
        }
      }

      this.logger.log('PDF Generated.................');

      // Closing Browser
      this.logger.log('Closing Browser and Starting Merging................');
      // await browser.close();

      this.browserPoolService.browserPoolMap.set(key, {
        browser: browserInstance,
        runningTasks:
          this.browserPoolService.browserPoolMap.get(key)['runningTasks'] - 1,
      });

      // Merge PDF(s)
      const finalFileName =
        this.tempPath + fileName + new Date().getTime() + '.pdf';

      await this.mergeMultiplePDF(pdfFiles, finalFileName);

      // const datab = fs.readFileSync(finalFileName, { encoding: 'utf-8' });
      const dataS3 = fs.readFileSync(finalFileName);

      // Uploading PDF To S3
      this.logger.log('Uploading To S3....................');

      const params = {
        Bucket: 'centilytics-reporting',
        Key: finalFileName,
        ContentType: 'application/pdf',
        Body: Buffer.alloc(dataS3.byteLength, dataS3, 'binary'),
        ContentEncoding: 'base64',
      };

      await this.uploadToS3(params);

      this.logger.log('Uploaded To S3....................');

      // return new Blob([datab], { type: 'application/pdf' });
      return finalFileName;

      // if (!testing) {
      //   await this.uploadToS3(params);
      // }

      // this.logger.log('Uploaded To S3 Successfully....................');
      // if (!testing) {
      //   return {
      //     bucket: bucketName,
      //     key: reportKey,
      //   };
      // }
      // return buffer;
    } catch (exception) {
      this.logger.error(exception);
    }
  }

  mergeMultiplePDF = async (pdfFiles, fileName) => {
    this.logger.log(fileName);
    return new Promise((resolve, reject) => {
      this.logger.log('Merging started');
      merge(pdfFiles, fileName, (err) => {
        if (err) {
          reject(err);
        }
        resolve('Success: final Pdf ' + fileName);
      });
    });
  };

  importJsScripts = async (scripts, page) => {
    for (let i = 0; i < scripts.length; i++) {
      await page.addScriptTag({ url: scripts[i] });
    }
  };

  async createPdf(
    browser: puppeteer.Browser,
    ejsFileName: string,
    templateData: any,
    scriptsToImport: string[],
    scriptTagContent: any,
    waitingTime: number,
    pdfOptions: puppeteer.PDFOptions,
    pdfFiles: string[],
  ) {
    this.logger.log('PDF path' + pdfOptions.path);
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0);
    // Generating HTML string from ejs file
    const pageContent: string = await ejs.renderFile(ejsFileName, templateData);

    this.logger.log('this is page content');
    await page.setContent(pageContent, { waitUntil: 'networkidle0' });
    await this.importJsScripts(scriptsToImport, page);
    await page.addScriptTag({
      content: scriptTagContent,
    });
    const session = await page.target().createCDPSession();
    await session.send('Page.enable');
    await session.send('Page.setWebLifecycleState', { state: 'active' });
    await page.waitForTimeout(waitingTime);
    await page.emulateMediaType('screen');
    await page.pdf(pdfOptions);
    this.logger.log('a pdf generated');
    pdfFiles.push(pdfOptions.path);
  }

  async setter(data) {
    this.tempPath = data['tempPath'];

    this.logger.log('using accessKeyId:', data['accessKeyId']);
    this.s3 = new AWS.S3({
      secretAccessKey: data['secretAccessKey'],
      accessKeyId: data['accessKeyId'],
      region: data['region'],
    });
  }

  uploadToS3 = async (params) => {
    return await this.s3.putObject(params).promise();
  };
}
