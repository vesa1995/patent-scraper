// const puppeteer = require("puppeteer");
const browserService = require("./browserService");
// const {ElementHandle} = require("puppeteer");
// const {save} = require("debug");

const bulgariaPatentsPageURL = 'http://epub.hpo.hu/e-kutatas/?lang=EN#'
const scrappedData = {};
let page;

async function getPatentData(appNumber) {
    page = await browserService.startBrowser();
    await scrape(appNumber);
    await browserService.closeBrowser();
    return scrappedData;
}

async function scrape(appNumberToSearch) {
    // go to page (url address)
    await page.setViewport({width: 1440, height: 768});
    await page.goto(bulgariaPatentsPageURL, {waitUntil: 'networkidle2'});

    scrappedData.applicationNumber = appNumberToSearch;
    scrappedData.registrationNumber = "";
    scrappedData.aplicationDate = "";
    scrappedData.status = [];
    scrappedData.registrationDate = "";
    scrappedData.applicationOwner = "";
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
    scrappedData.aplicationDate = await getContent('.ev_dhx_skyblue > td:nth-child(9)');

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
    scrappedData.status = await parseStatus('#keres > table:nth-child(18) > tbody:nth-child(1) > ' +
        'tr:nth-child(1) > td:nth-child(1) > table:nth-child(1) > tbody:nth-child(1) > ' +
        'tr:nth-child(1) > td:nth-child(2)');

    // document > publication date
    scrappedData.registrationDate = await getContent('#keres > table:nth-child(32) > ' +
        'tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(1) > table:nth-child(2) > ' +
        'tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(2) > span:nth-child(1)');

    // document > applicant
    scrappedData.applicationOwner = await parseStatus('#keres > table:nth-child(24) > ' +
        'tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(1) > table:nth-child(1) > ' +
        'tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(2)');

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

    // maintenance fees parsing... from here to end
    const spanElements = await page.$$('.dhtmlx_wins_body_inner span'); // Array<ElementHandle>
    // console.log('spans[0].toString()', spans[0].toString());
    // const str = await spans[0].evaluate((node) => node.innerText);
    // console.log("str: ", str);
    // const str2 = await spans[2].evaluate((node) => node.textContent);
    // console.log("str2: ", str2);
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
    // console.log('top offset from window ' + maintenanceFeesLabelPositionY);

    const hrElements = await page.$$('.dhtmlx_wins_body_inner hr');
    let hrPositionY;
    for (let i = 1; i < hrElements.length; i++) {
        let yPosition = await hrElements[i].evaluate(
            (node) => node.getBoundingClientRect().top + document.documentElement.scrollTop
        );
        // console.log(topPix);
        if (yPosition > maintenanceFeesLabelPositionY) {
            hrPositionY = yPosition;
            break;
        }
    }

    const rowElements = await page.$$('.dhtmlx_wins_body_inner table');
    let lastRowPositionY;
    // let lastRowElement;
    for (let i = 1; i < rowElements.length; i++) {
        let yPosition = await rowElements[i].evaluate(
            (node) => node.getBoundingClientRect().top + document.documentElement.scrollTop
        );
        if (yPosition > hrPositionY) {
            break;
        }
        lastRowPositionY = yPosition;
        // lastRowElement = rowElements[i];
        // console.log("TABLE: " + yPosition);
    }
    // console.log('ceo red: '  + lastRowElement);

    // const spanElements = await page.$$('.dhtmlx_wins_body_inner span');
    // let rowSpanPositionY;
    let lastRowObject = {};
    let columnNameArray = ['Payer', 'Deposit', 'Amount', 'Validity', 'Remnant'];
    let idx = 0;
    for (let i = 1; i < spanElements.length; i++) {
        let yPosition = await spanElements[i].evaluate(
            (node) => node.getBoundingClientRect().top + document.documentElement.scrollTop
        );
        if (yPosition >= lastRowPositionY && yPosition <= hrPositionY) {
            let text = await spanElements[i].evaluate((node) => node.textContent.trim());
            if (text !== '') {
                lastRowObject[columnNameArray[idx]] = text;
                idx++;
            }
        }
        // console.log(yPosition, lastRowPositionY, hrPositionY, await spanElements[i].evaluate((node) => node.textContent));
        // rowSpanPositionY = yPosition;
    }
    // console.log('res = ' + columnNameArray);
    scrappedData.maintenanceFees = lastRowObject;

    // e-register > Maintenance fees > zadnji red ima oba podatka valjda
    // scrappedData.lastPaid = lastPaid; // deposit kolona
    // scrappedData.latestAnnualFeePaid = latestAnnualFeePaid; // todo ne znam koja kolona, vrv mora da se racuna
}

async function parseStatus(selector) {
    let childrenCount;
    try {
        childrenCount = await page.$eval(selector,
            el => {
                return el.children.length;
            }
        );
    } catch (err) {
        console.log(err);
        return "";
    }
    let strArray = [];
    for (let i = 1; i < childrenCount; i = i + 2) {
        let child = await getContent(selector + ' > span:nth-child(' + i + ')');
        if (child !== "") {
            strArray.push(child);
        }
    }
    return strArray;
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
};