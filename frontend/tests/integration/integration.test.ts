/**
 * @jest-environment node
 */

import axios from 'axios'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import { Builder, By } from 'selenium-webdriver'
import * as chrome from 'selenium-webdriver/chrome'
import { Browser, PageLoadStrategy } from 'selenium-webdriver/lib/capabilities'

let localConfig: Record<string, string | number | boolean> = {}
try {
  localConfig = dotenv.parse(fs.readFileSync(`${__dirname}/../../.env.${process.env.NODE_ENV}.local`, 'utf8')) || {}
} catch (error) {
  // In case the .env.*.local file does not exist or can't be parsed, just leave the localConfig empty
}
const config: Record<string, string | number | boolean | undefined> = {
  ...process.env,
  ...dotenv.parse(fs.readFileSync(`${__dirname}/../../.env.${process.env.NODE_ENV}`, 'utf8')),
  ...localConfig,
}

describe(`webclient test on ${config.TEST_ORIGIN}`, () => {
  it('return 200', async () => {
    const response = await axios.get(`${config.TEST_ORIGIN}/`)
    expect(typeof response).toBe('object')
    expect(response.status).toBe(200)
  })

  it ('loads the page', async () => {
    const chromeOptions = new chrome.Options()
    chromeOptions.setPageLoadStrategy(PageLoadStrategy.NORMAL)
    // chromeOptions.addArguments('--ignore-certificate-error')
    chromeOptions.addArguments('--disable-extensions')
    chromeOptions.addArguments('--disable-popup-blocking')
    chromeOptions.addArguments('enable-automation')
    chromeOptions.headless()

    const builder = new Builder()
      .forBrowser(Browser.CHROME)
      .setChromeOptions(chromeOptions)

    // Check if gitlab pipeline is running and connected to default selenium webserver
    if (process.env.CI === 'true') {
      builder.usingServer('http://selenium-chrome:4444/wd/hub')
    }

    const driver = builder.build()

    await driver.manage().window().setRect({ width: 1280, height: 1024 })
    await driver.navigate().to(config.TEST_ORIGIN as string)
    const elements = await driver.findElements(By.css('h1'))
    expect(elements.length === 1)
    const titleText = await elements[0].getText()
    expect(titleText.indexOf('Lightning Tip Cards')).toBe(0)
  }, 60000)
})
