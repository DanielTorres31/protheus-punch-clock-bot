import { Page } from 'puppeteer'
import { addNormalizeHTMLTextOnWindow, randomInt } from '../commons'
import Logger from '../config/Logger'

enum PUNCH_TYPE {
    IN = 0,
    OUT = 1,
}

const logger = Logger.getLogger()

const PunchInController = {
    _config: {
        selectors: {
            time: 'input#txtHora',
            justification: 'textarea#txtJust',
            dayLink: 'td.info-cent > a.links',
            submitButton: 'input#Submit',
            backButton: 'input[name="Button"]',
        },
    },

    async punchIn(page: Page, days: string[]) {
        logger.trace('Punching to clock...')

        for (const day of days) {
            const entryTime = await this._punchIn(page, day, PUNCH_TYPE.IN)

            await page.waitForSelector(this._config.selectors.dayLink)

            const exitTime = await this._punchIn(
                page,
                day,
                PUNCH_TYPE.OUT,
                entryTime
            )

            await page.waitForSelector(this._config.selectors.dayLink)

            logger.trace(
                'Launched day',
                day,
                '- Entry:',
                entryTime,
                '- Exit: ',
                exitTime
            )
        }
    },

    async _punchIn(
        page: Page,
        day: string,
        punchType: PUNCH_TYPE,
        entryTime?: string
    ) {
        this._navigatesToPunchInClockPage(page, day)

        page.on('dialog', async dialog => {
            await dialog.accept()
        })

        await page.waitForSelector(this._config.selectors.time)
        await page.waitForSelector(this._config.selectors.justification)

        let time
        if (punchType === PUNCH_TYPE.IN) {
            time = this._getRandomTime()
        } else if (punchType === PUNCH_TYPE.OUT) {
            time = this._addsHoursWorked(entryTime)
        } else {
            throw new Error("Couldn't get date")
        }

        await page.type(this._config.selectors.time, time)
        await page.type(this._config.selectors.justification, 'X')

        if (process.env.PROTHEUS_TEST_MODE === 'ON') {
            await page.click(this._config.selectors.backButton)
        } else {
            await page.click(this._config.selectors.submitButton)
        }

        return time
    },

    async _navigatesToPunchInClockPage(page: Page, day: string) {
        await page.waitForSelector(this._config.selectors.dayLink)
        const links = await page.$$(this._config.selectors.dayLink)

        await addNormalizeHTMLTextOnWindow(page)

        let dayLink
        for (const link of links) {
            const textContent = await link.evaluate(link =>
                window.normalizeHTMLText(link.textContent || '')
            )

            if (textContent === day) {
                dayLink = link
            }
        }

        if (!dayLink) {
            throw new Error('Day not finded.')
        }

        await dayLink.click()
    },

    _getRandomTime() {
        const HOURS_RANGE = {
            MIN: 7,
            MAX: 8,
        }

        const MINUTES_RANGE = {
            MIN: 10,
            MAX: 59,
        }

        return (
            '0' +
            randomInt(HOURS_RANGE.MIN, HOURS_RANGE.MAX) +
            randomInt(MINUTES_RANGE.MIN, MINUTES_RANGE.MAX)
        )
    },

    _addsHoursWorked(entryTime: string | undefined) {
        if (!entryTime) {
            return ''
        }

        const WORKLOAD = 900

        const time = parseInt(entryTime)
        return String(time + WORKLOAD)
    },
}

export default PunchInController
