import { ElementHandle, Page } from 'puppeteer'

const HOLIDAYS = (process.env.PROTHEUS_HOLIDAYS || '').split(',')

export const addNormalizeHTMLTextOnWindow = async (page: Page) => {
    await page.evaluate(() => {
        window.normalizeHTMLText = (str: string) => {
            const pattern = /[\f\n\r\t\v ]{2,}/g
            const replacement = ' '

            return str.replace(pattern, replacement).trim()
        }
    })
}

export const isBusinessDay = async (dayLink: ElementHandle<Element>) => {
    const stringDate = await dayLink.evaluate(dayLink =>
        window.normalizeHTMLText(dayLink.textContent || '')
    )

    const SATURDAY = 6
    const SUNDAY = 0

    const date = parseDate(stringDate)

    const isWeekday = date.getDay() !== SATURDAY && date.getDay() !== SUNDAY

    const isHoliday = HOLIDAYS.includes(stringDate)

    return isWeekday && !isHoliday
}

export const parseDate = (date: string) => {
    const DATE_FORMAT = '{year}-{month}-{day}T03:00:00.000Z'
    const [day, month, year] = date.split('/')

    const ISODateString = DATE_FORMAT.replace('{day}', day)
        .replace('{month}', month)
        .replace('{year}', '20' + year)

    return new Date(ISODateString)
}

export const randomInt = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1) + min)
}
