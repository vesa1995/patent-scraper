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

    const names = ['Luke', 'Eva', 'Phil']; // todo del
    const [first, second] = names;
    console.log(first, second); // 'Luke Eva'

    scrappedData.applicationNumber = appNumberToSearch;
    scrappedData.registrationNumber = "";
    scrappedData.aplicationDate = "";
    scrappedData.status = "";
    scrappedData.registrationDate = "";
    scrappedData.applicationOwner = "";

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

    let selector = '.ev_dhx_skyblue > td:nth-child(4)';
    // table > registration number
    scrappedData.registrationNumber = await getContent(selector);

    selector = '.ev_dhx_skyblue > td:nth-child(9)';
    // table > application date
    scrappedData.aplicationDate = await getContent(selector);

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

    const spans = await page.$$('.dhtmlx_wins_body_inner span'); // Array<ElementHandle>
    console.log('spans[0].toString()', spans[0].toString());
    const str = await spans[0].evaluate((node) => node.innerText);
    console.log("str: ", str);
    const str2 = await spans[2].evaluate((node) => node.textContent);
    console.log("str2: ", str2);
    let saveSpan;
    for (let i = 1; i < spans.length; i++) {
        let txt = await spans[i].evaluate((node) => node.textContent );
        let topPix = await spans[i].evaluate((node) => node.offsetTop );
        if (txt === 'Fenntartási díjak') {
            saveSpan = topPix;
        }
        // console.log(txt + '       .');
    }

    console.log('top offset from window ' + saveSpan);
    const hrs = await page.$$('.dhtmlx_wins_body_inner hr'); // Array<ElementHandle>
    let saveTopPix;
    for (let i = 1; i < hrs.length; i++) {
        let topPix = await hrs[i].evaluate((node) => node.offsetTop );
        console.log(topPix);
        if (topPix > saveSpan) {
            saveTopPix = topPix;
            break;
        }
    }

    const tableElems = await page.$$('.dhtmlx_wins_body_inner table'); // Array<ElementHandle>
    let tableTop;
    let eleeement;
    for (let i = 1; i < tableElems.length; i++) {
        let topPix = await tableElems[i].evaluate((node) => node.offsetTop );
        if (topPix > saveTopPix) {
            break;
        }
        eleeement = tableElems[i];
        tableTop = topPix;
        console.log("TABLE: " + topPix);
    }
    console.log('konacno resenje: '  + eleeement);
    await parseFees(eleeement);

    // e-register > Maintenance fees > zadnji red ima oba podatka valjda
    // scrappedData.lastPaid = lastPaid; // deposit kolona
    // scrappedData.latestAnnualFeePaid = latestAnnualFeePaid; // todo ne znam koja kolona, vrv mora da se racuna
}

async function parseFees(element) {
    let elementsArray = await page.evaluateHandle((node) => node.children, element);
    console.log(elementsArray.length, 'leeeeeeeeeeeeeeen');
    console.log(getContent(elementsArray));
    for (let i = 1; i <= elementsArray.length; i++) {
        let topPix = await elementsArray[i].evaluate((node) => node.textContent );
        console.log(topPix);
    }
    const names = [];
    names.push(await (await element.getProperty('tagName')).jsonValue());
    console.log('ovo radi???? ' , names);
    // for (let i = 1; i <= names.length; i++) {
    //     let gfg = await names[i].evaluate((node) => node.textContent );
    //     console.log(gfg);
    // }

    let childrenCount;
    try {
        childrenCount = await page.$eval(elementsArray,
            el => {
                return el.children.length;
            }
        );
    } catch (err) {
        console.log(err);
        return "";
    }
    let strArray = [];
    for (let i = 1; i < childrenCount; i++) {
        let child = await getContent(elementsArray + ' > td:nth-child(' + i + ')');
        if (child !== "") {
            strArray.push(child);
        }
    }
    console.log(strArray);
    return strArray;
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