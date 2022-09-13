// import * as puppeteer from 'puppeteer-core';

// async function launchPuppeteer() {
//   return await puppeteer.connect({
//     browserURL: 'http://43.205.130.240:9222',
//   });
// }

// // manages browser connections.
// // creates a pool on startup and allows getting references to
// // the browsers! .
// export class BrowserPool {
//   browsers = [];

//   async get() {
//     // return browser if there is one!
//     if (this.browsers.length > 0) {
//       return this.browsers.splice(0, 1)[0];
//     }

//     // no browser available anymore..
//     // launch a new one!
//     return await launchPuppeteer();
//   }

//   // used for putting a browser back in pool!.
//   handback(browser) {
//     this.browsers.push(browser);
//   }

//   // shuts down all browsers!.
//   async shutDown() {
//     for (const browser of this.browsers) {
//       await browser.close();
//     }
//   }
// }
