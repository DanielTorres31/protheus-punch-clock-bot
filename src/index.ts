import * as dotenv from 'dotenv'
dotenv.config()

import * as puppeteer from 'puppeteer'
import { Page } from 'puppeteer'
import LoginController from './controllers/LoginController'
import TimeclockController from './controllers/TimeclockController'
import PunchInController from './controllers/PunchInController'

main()
async function main() {
    const browser = await puppeteer.launch({ headless: false })
    try {
        const pages = await browser.pages()
        const page = pages[0]

        skipStylesRequests(page)

        await LoginController.login(page)

        const days = await TimeclockController.getDaysToPunchInClock(page)

        await PunchInController.punchIn(page, days)

        await browser.close()
    } catch (err) {
        console.error(err)
        await browser.close()
    }
}

function skipStylesRequests(page: Page) {
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
