const browserService = require("./browserService");
const cacheService = require("./cacheService");

const hungaryPatentsPageURL = 'http://epub.hpo.hu/e-kutatas/?lang=EN#'
const scrappedData = {};
let page;


async function getPatentCacheData(appNumber) {
    return await cacheService.getData(appNumber);
}

async function getPatentData(appNumber) {
    await asyncDownloadData(appNumber);
    return "Downloading data...";
}

async function asyncDownloadData(appNumber) {
    page = await browserService.startPage();

    let pages = await page.browser().pages();
    let i = 0;
    for (let page of pages) {
        console.log('page ' + i + ' url:', page.url());
        i++;
    }

    await scrape(appNumber);
    await browserService.closePage();
    await cacheService.saveData(scrappedData);
    return scrappedData;
}

async function scrape(appNumberToSearch) {
    // go to page (url address)
    await page.setViewport({width: 1440, height: 768});
    await page.goto(hungaryPatentsPageURL, {waitUntil: 'networkidle2'});

    scrappedData.applicationNumber = appNumberToSearch;
    scrappedData.registrationNumber = "";
    scrappedData.applicationDate = "";
    scrappedData.status = [];
    scrappedData.maintenanceFees = {};

    try {
        // input field
        const [appNumberInput] = await page.$x('//*[@id="ipId"]');
        await appNumberInput.focus();
        await page.keyboard.type(appNumberToSearch);
        // search button click
        const [searchButton] = await page.$x('//*[@id="searchButtonLabel"]');
        await searchButton.click();
        await page.waitForNetworkIdle({waitUntil: 'networkidle2'});
    } catch (err) {
        console.log(err);
        return scrappedData;
    }

    // table > registration number
    scrappedData.registrationNumber = await getContent('.ev_dhx_skyblue > td:nth-child(4)');

    // table > application date
    scrappedData.applicationDate = await getContent('.ev_dhx_skyblue > td:nth-child(9)');

    try {
        // app number > click
        const [appNumberLabel] = await page.$x('/html/body/table[3]/tbody/tr/td[2]/table/' +
            'tbody/tr/td/div[2]/div[2]/table/tbody/tr[2]/td[5]/a/div');
        await appNumberLabel.click();
        await page.waitForNetworkIdle({waitUntil: 'networkidle2'});
    } catch (err) {
        console.log(err);
        return scrappedData;
    }

    // document > status
    scrappedData.status = await scrapeBetweenTagAndHr('#keres', 'span', 'Status data');

    // document > publication date
    // scrappedData.registrationDate = await getContent('');

    // document > applicant
    // scrappedData.applicationOwner = await scrapeSpanChildren('');

    try {
        // e-register > click
        const [eRegisterLabel] = await page.$x('/html/body/table[3]/tbody/tr/td[2]/table/' +
            'tbody/tr/td/div[3]/table[1]/tbody/tr/td[1]/input');
        await eRegisterLabel.click();
        await page.waitForNetworkIdle({waitUntil: 'networkidle2'});
    } catch (err) {
        console.log(err);
        return scrappedData;
    }

    scrappedData.maintenanceFees = await scrapeMaintenanceFees();
}

async function scrapeBetweenTagAndHr(selectorBase, tagToScrape, labelText) {
    const spanElements = await page.$$(selectorBase + ' span'); // Array<ElementHandle>
    let spanPositionY;
    for (let i = 1; i < spanElements.length; i++) {
        let text = await spanElements[i].evaluate((node) => node.textContent);
        let yPosition = await spanElements[i].evaluate(
            (node) => node.getBoundingClientRect().top + document.documentElement.scrollTop
        );
        if (text === labelText) {
            spanPositionY = yPosition;
            break;
        }
    }

    const hrElements = await page.$$(selectorBase + ' hr');
    let hrPositionY;
    for (let i = 1; i < hrElements.length; i++) {
        let yPosition = await hrElements[i].evaluate(
            (node) => node.getBoundingClientRect().top + document.documentElement.scrollTop
        );
        if (yPosition > spanPositionY) {
            hrPositionY = yPosition;
            break;
        }
    }

    const elements = await page.$$(selectorBase + ' ' + tagToScrape);
    let data = [];
    for (let i = 1; i < elements.length; i++) {
        let yPosition = await elements[i].evaluate(
            (node) => node.getBoundingClientRect().top + document.documentElement.scrollTop
        );
        if (yPosition > spanPositionY && yPosition < hrPositionY) {
            let text = await elements[i].evaluate((node) => node.textContent.trim());
            if (text !== '') {
                data.push(text);
            }
        }
    }
    return data;
}

async function scrapeMaintenanceFees() {
    const spanElements = await page.$$('.dhtmlx_wins_body_inner span'); // Array<ElementHandle>
    let maintenanceFeesLabelPositionY;
    for (let i = 1; i < spanElements.length; i++) {
        let text = await spanElements[i].evaluate((node) => node.textContent);
        let yPosition = await spanElements[i].evaluate(
            (node) => node.getBoundingClientRect().top + document.documentElement.scrollTop
        );
        if (text === 'Fenntartási díjak') {
            maintenanceFeesLabelPositionY = yPosition;
            break;
        }
    }

    const hrElements = await page.$$('.dhtmlx_wins_body_inner hr');
    let hrPositionY;
    for (let i = 1; i < hrElements.length; i++) {
        let yPosition = await hrElements[i].evaluate(
            (node) => node.getBoundingClientRect().top + document.documentElement.scrollTop
        );
        if (yPosition > maintenanceFeesLabelPositionY) {
            hrPositionY = yPosition;
            break;
        }
    }

    const rowElements = await page.$$('.dhtmlx_wins_body_inner table');
    let lastRowPositionY;
    for (let i = 1; i < rowElements.length; i++) {
        let yPosition = await rowElements[i].evaluate(
            (node) => node.getBoundingClientRect().top + document.documentElement.scrollTop
        );
        if (yPosition > hrPositionY) {
            break;
        }
        lastRowPositionY = yPosition;
    }

    let lastRowObject = {};
    let columnNameArray = ['payer', 'deposit', 'amount', 'validity', 'remnant'];
    let idx = 0;
    for (let i = 1; i < spanElements.length; i++) {
        let yPosition = await spanElements[i].evaluate(
            (node) => node.getBoundingClientRect().top + document.documentElement.scrollTop
        );
        if (yPosition > lastRowPositionY && yPosition < hrPositionY) {
            let text = await spanElements[i].evaluate((node) => node.textContent.trim());
            if (text !== '') {
                lastRowObject[columnNameArray[idx]] = text;
                idx++;
            }
        }
    }
    return lastRowObject;
}

async function getContent(selector) {
    try {
        return await page.$eval(selector,
            el => {
                return el.textContent.trim();
            }
        );
    } catch (err) {
        console.log(err);
        return "";
    }
}

module.exports = {
    getPatentData,
    getPatentCacheData
};