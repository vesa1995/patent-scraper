const puppeteer = require("puppeteer");

let browser;

async function startBrowser() {
    // let args = ['--start-fullscreen'];
    // let args = ['--proxy-server=219.100.37.167:443'];
    // const launchOptions = {headless: false, args: args, waitUntil: 'networkidle2'};
    const launchOptions = {
        headless: false,
        // args: args,
        waitUntil: 'networkidle2',
        ignoreDefaultArgs: ["--disable-extensions","--enable-automation"],
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    };
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