const puppeteer = require("puppeteer");
const {fetchData} = require('./requestService');

let browser, page;
// const surfSharkPath = 'C:\\Users\\milos\\AppData\\Local\\Google\\Chrome\\User Data\\Defa' +
//     'ult\\Extensions\\ailoabdmgclmfmhdagmlohpjlbpffblp\\3.9.1_0';
// const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';


async function startPage() {
    // let args = ['--start-fullscreen'];
    // let args = ['--proxy-server=219.100.37.167:443'];
    // let args = [
    //     `--disable-extensions-except=${surfSharkPath}`,
    //     `--load-extension=${surfSharkPath}`,
    // ]

    let webSocketDebuggerUrl = await fetchData();

    const connectOptions = {
        // headless: false,
        // args: args,
        waitUntil: 'networkidle2',
        browserWSEndpoint: webSocketDebuggerUrl,
        // ignoreDefaultArgs: ["--enable-automation"],
        // executablePath: chromePath
    };
    browser = await puppeteer.connect(connectOptions);

    page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0);
    page.on('console', ((msg) => {
        if (msg.text().indexOf('debug') !== -1) {
            // console.log(msg.text())
        }
    }));
    await page.deleteCookie({
        name : 'JSESSIONID',
        domain : 'portal.bpo.bg'
    });

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