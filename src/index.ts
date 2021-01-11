import * as dotenv from 'dotenv'
dotenv.config()

import * as puppeteer from 'puppeteer'
import { Page } from 'puppeteer'
import Logger from './config/Logger'
import LoginController from './controllers/LoginController'
import TimeclockController from './controllers/TimeclockController'
import PunchInController from './controllers/PunchInController'

const logger = Logger.getLogger()

main()
async function main() {
    logger.trace('Starting Chromium...')
    const browser = await puppeteer.launch({ headless: false })

    try {
        const pages = await browser.pages()
        const page = pages[0]

        abortStylesRequests(page)

        await LoginController.login(page)

        const days = await TimeclockController.getDaysToPunchInClock(page)

        await PunchInController.punchIn(page, days)
        logger.trace('Successfully concluded')

        logger.trace('Closing Chromium...')
        await browser.close()
    } catch (err) {
        logger.error(err)
        await browser.close()
    }
}

function abortStylesRequests(page: Page) {
    page.setRequestInterception(true)
    page.on('request', (request: any) => {
        if (
            ['image', 'stylesheet', 'font'].indexOf(request.resourceType()) !==
            -1
        ) {
            request.abort()
        } else {
            request.continue()
        }
    })
}
