const puppeteer = require("puppeteer");
const {fetchData} = require('./requestService');

let browser, page;
const surfSharkPath = 'C:\\Users\\milos\\AppData\\Local\\Google\\Chrome\\User Data\\Defa' +
    'ult\\Extensions\\ailoabdmgclmfmhdagmlohpjlbpffblp\\3.9.0_0'; // todo hard-coded value
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'; // todo hard-coded value


async function startPage() {
    // let args = ['--start-fullscreen'];
    // let args = ['--proxy-server=219.100.37.167:443'];
    let args = [
        `--disable-extensions-except=${surfSharkPath}`,
        `--load-extension=${surfSharkPath}`,
    ]

    let webSocketDebuggerUrl = await fetchData();

    // const launchOptions = {headless: false, args: args, waitUntil: 'networkidle2'};
    const launchOptions = {
        headless: false,
        args: args,
        waitUntil: 'networkidle2',
        browserWSEndpoint: webSocketDebuggerUrl,
        ignoreDefaultArgs: ["--enable-automation"],
        executablePath: chromePath
    };

    // browser = await puppeteer.launch(launchOptions);
    browser = await puppeteer.connect(launchOptions);

    page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0);
    page.on('console', ((msg) => {
        if (msg.text().indexOf('debug') !== -1) {
            // console.log(msg.text())
        }
    }));
    return page;
}

async function closePage() {
    await page.close();
}

async function closeBrowser() {
    await browser.close();
}

module.exports = {
    startPage,
    closePage
};