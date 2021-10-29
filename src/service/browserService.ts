(function () {
    const puppeteer = require("puppeteer");
    let browser;

    async function startBrowser() {
        const launchOptions = {headless: true, /*args: ['--start-fullscreen'],*/ waitUntil: 'networkidle2'};
        browser = await puppeteer.launch(launchOptions);
        const page = await browser.newPage();

        await page.setDefaultNavigationTimeout(0);
        page.on('console', ((msg) => {
            if (msg.text().indexOf('debug') !== -1) {
                console.log(msg.text())
            }
        }));
        return page;
    }

    async function closeBrowser() {
        await browser.close();
    }

    module.exports = {
        startBrowser,
        closeBrowser
    };

})();