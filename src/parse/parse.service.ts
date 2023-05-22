import { Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer';

@Injectable()
export class ParseService {
  async parseWebPage() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto('https://www.edpnet.com/en/wholesale/jobs/');

    const jobHandles = await page.$$('#jobs .g9');

    const resultArr = [];

    for (const jobHandle of jobHandles) {
      const [title = null, url] = await Promise.all([
        page.evaluate((el) => el.querySelector('h3').textContent, jobHandle),
        page.evaluate(
          (el) => el.querySelector('a.dialog-link').getAttribute('href'),
          jobHandle,
        ),
      ]);
      resultArr.push({
        title,
        url: url ? `https://www.edpnet.com${url}` : null,
      });
    }
    return resultArr;
  }
}
