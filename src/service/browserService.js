const puppeteer = require("puppeteer");
const {fetchData} = require('./requestService');

let browser = null, page;
// cons surfSharkPath = 'C:\\Users\\milos\\AppData\\Local\\Google\\Chrome\\User Data\\Defa' +
//     'ult\\Extensions\\ailoabdmgclmfmhdagmlohpjlbpffblp\\3.9.1_0';
// const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';


async function startPage() {
    // let args = ['--start-fullscreen'];
    // let args = ['--proxy-server=219.100.37.167:443'];
    // let args = [
    //     `--disable-extensions-except=${surfSharkPath}`,
    //     `--load-extension=${surfSharkPath}`,
    // ]
    if (browser == null) {
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
    }
    console.log((await browser.pages()).length, ' - tab number');

    page = await browser.newPage();
    page.on('console', ((msg) => {
        if (msg.text().indexOf('debug') !== -1) {
            console.log(msg.text())
        }
    }));

    await page.setDefaultNavigationTimeout(0);
    // todo move this code somewhere else, this is for bulgaria page only
    await page.deleteCookie({
        name : 'JSESSIONID',
        domain : 'portal.bpo.bg'
    });

    // make puppeteer work while tab (page) is unfocused
    const session = await page.target().createCDPSession();
    await session.send('Page.enable');
    await session.send('Page.setWebLifecycleState', {state: 'active'});

    // thread test
    // await setupPageHeartBit('page' + counter, page);
    // counter++;

    return page;
}
let counter = 0;

async function setupPageHeartBit(pageId, page) {
    page.on('console', msg => console.log(`[${pageId}]: ${msg.text()}`));
    await page.evaluate(() => {
        let i = 0;
        setInterval(() => {
            console.log((++i) + ' heartbit');
        }, 500);
    });
}

async function closePage() {
    await listPages();
    await page.close();
    await listPages();
}

async function closeBrowser() {
    await browser.close();
}

async function listPages() {
    let pages = await browser.pages();
    console.log(pages.length);
    for (let i = 0; i < pages.length; i++) {
        console.log(pages[i].url());
    }
}

module.exports = {
    startPage,
    closePage
};