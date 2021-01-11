import { Page } from 'puppeteer'
import ProtheusConfig from '../config/ProtheusConfig'
import Logger from '../config/Logger'

const logger = Logger.getLogger()

const LoginController = {
    _config: {
        URL: ProtheusConfig.BASE_URL + '/portal',
        selectors: {
            login: 'input#txtNome',
            password: 'input#txtSenha',
            portalType: 'select[name="cTipoPortal"]',
            submitButton: 'input[name="Button"].btnlogin',
        },
    },

    async login(page: Page) {
        logger.trace('Accessing Protheus...')
        await page.goto(this._config.URL)

        page.on('console', args => console.log(args.text()))

        await this._fillsForm(page)

        logger.trace('Trying to login with', ProtheusConfig.USER)
        await page.click(this._config.selectors.submitButton)
        await page.waitForNavigation()
        logger.trace('Successfully logged in')
    },

    async _fillsForm(page: Page) {
        await page.type(this._config.selectors.login, ProtheusConfig.USER)
        await page.type(
            this._config.selectors.password,
            ProtheusConfig.PASSWORD
        )
        await page.select(
            this._config.selectors.portalType,
            ProtheusConfig.PORTAL_TYPE
        )
    },
}

export default LoginController
