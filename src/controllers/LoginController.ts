import { Page } from 'puppeteer'
import ProtheusConfig from '../config/ProtheusConfig'

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
        await page.goto(this._config.URL)

        page.on('console', args => console.log(args.text()))

        await this._fillsForm(page)

        await page.click(this._config.selectors.submitButton)
        await page.waitForNavigation()
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
