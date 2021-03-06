import { ElementHandle, Page } from 'puppeteer'
import ProtheusConfig from '../config/ProtheusConfig'
import { addNormalizeHTMLTextOnWindow, isBusinessDay } from '../commons'
import Logger from '../config/Logger'

declare global {
    interface Window {
        normalizeHTMLText: (str: string) => string
    }
}

const logger = Logger.getLogger()

const TimeclockController = {
    _config: {
        URL: ProtheusConfig.BASE_URL + '/portal/W_PWSA400.APW',
        selectors: {
            punchInClockLink: 'td.info-cent > a.links',
            dayLink: 'td.info-cent > a.links',
        },
    },

    async getDaysToPunchInClock(page: Page) {
        logger.trace('Getting days to launchs...')
        await page.goto(this._config.URL)

        await this._navigatesToPunchInClockPage(page)
        return await this._getDaysToPunchInClock(page)
    },

    async _navigatesToPunchInClockPage(page: Page) {
        await page.waitForSelector(this._config.selectors.punchInClockLink)
        const link = await page.$(this._config.selectors.punchInClockLink)
        await link?.click()
    },

    async _getDaysToPunchInClock(page: Page) {
        await page.waitForNavigation()
        await page.waitForSelector(this._config.selectors.dayLink)

        await addNormalizeHTMLTextOnWindow(page)

        const daysLinks = await page.$$(this._config.selectors.dayLink)
        const weekdaysLinks = await this._filterBusinessDays(daysLinks)

        return weekdaysLinks
    },

    async _filterBusinessDays(daysLinks: ElementHandle[]) {
        const weekdays = []
        for (const dayLink of daysLinks) {
            if (await isBusinessDay(dayLink)) {
                weekdays.push(
                    await dayLink.evaluate(dayLink =>
                        window.normalizeHTMLText(dayLink.textContent || '')
                    )
                )
            }
        }

        return weekdays
    },
}

export default TimeclockController
