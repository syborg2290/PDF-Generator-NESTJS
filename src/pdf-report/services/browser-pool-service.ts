import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer-core';
import { ImplementLogger } from '../../common/decorators/logger.decorator';
import { LoggerClass } from './../../common/classes/Logger';

@Injectable()
@ImplementLogger
export class BrowserPoolService extends LoggerClass {
  maxConcurrencyLimit = 100;
  browserPoolMap = new Map();
  lastTimeStamp = null;
  constructor() {
    super();
  }

  async getBrowser(forceNew = false) {
    // If two requests have a difference of 100 seconds , resetting the browserPool.
    if (
      (this.lastTimeStamp &&
        this.lastTimeStamp - new Date().getTime() > 100000) ||
      !this.lastTimeStamp
    ) {
      this.browserPoolMap = new Map();
    }
    this.lastTimeStamp = new Date().getTime();
    this.logger.log(this.browserPoolMap.size);
    if (this.browserPoolMap.size > this.maxConcurrencyLimit && !forceNew) {
      this.logger.log('here first');
      let minCount = Infinity;
      let instanceRunningLeastTask = null;
      for (const [key, value] of this.browserPoolMap) {
        this.logger.log(key);
        this.logger.log(value['runningTasks']);

        if (
          value &&
          value['runningTasks'] &&
          value['runningTasks'] < minCount
        ) {
          this.logger.log('inside if');
          minCount = value['runningTasks'];
          instanceRunningLeastTask = key;
        }
        this.logger.log(instanceRunningLeastTask + 'instanceListKey');
      }
      return {
        key: instanceRunningLeastTask,
        value: this.browserPoolMap.get(instanceRunningLeastTask),
      };
    } else {
      const browserInstance = await puppeteer.connect({
        browserURL: 'http://13.232.239.100:8080',
      });
      // const browserInstance = await puppeteer.launch({
      //   // args: chromium.args,
      //   // defaultViewport: chromium.defaultViewport,
      //   executablePath:
      //     'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      //   headless: true,
      // });
      const key = this.generateUniqueKey(12);
      this.browserPoolMap.set(key, {
        browser: browserInstance,
        runningTasks: 0,
      });
      this.logger.log('here last');
      return {
        key: key,
        value: this.browserPoolMap.get(key),
      };
    }
  }

  generateUniqueKey(length: number) {
    let result = '';
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    this.logger.log(result);
    return result;
  }
}
