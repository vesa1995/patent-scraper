const puppeteer = require("puppeteer");
const browserService = require("./browserService");

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

    const [appNumberInput] = x('//*[@id="ipId"]');

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
        return scrappedData; // {}
    }

    try {
        // table > registration number
        const registrationNumber = await page.$eval('.ev_dhx_skyblue > td:nth-child(4)',
            el => {
                return el.textContent.trim();
            }
        );
        // table > application date
        const applicationDate = await page.$eval('.ev_dhx_skyblue > td:nth-child(9)',
            el => {
                return el.textContent.trim();
            }
        );
        scrappedData.registrationNumber = registrationNumber;
        scrappedData.aplicationDate = applicationDate;
    } catch (err) {
        console.log(err);
    }

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

    try {
        // document > status
        const status = parseRows('#keres > table:nth-child(18) > tbody:nth-child(1) > ' +
            'tr:nth-child(1) > td:nth-child(1) > table:nth-child(1) > tbody:nth-child(1) > ' +
            'tr:nth-child(1) > td:nth-child(2)');
        // document > publication date
        const registrationDate = await page.$eval('#keres > table:nth-child(32) > ' +
            'tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(1) > table:nth-child(2) > ' +
            'tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(2) > span:nth-child(1)',
            el => {
                return el.textContent.trim();
            }
        );
        scrappedData.status = status;
        scrappedData.registrationDate = registrationDate;
    } catch (err) {
        console.log(err);
    }

    // document > applicant
    let applicationOwner = "";
    try {
        applicationOwner = parseRows('#keres > table:nth-child(24) > ' +
            'tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(1) > table:nth-child(1) > ' +
            'tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(2)');
    } catch (err) {
    }
    // e-register > click
    const [eRegisterLabel] = await page.$x('/html/body/table[3]/tbody/tr/td[2]/table/' +
        'tbody/tr/td/div[3]/table[1]/tbody/tr/td[1]/input');
    await eRegisterLabel.click();
    await page.waitForNetworkIdle({waitUntil: 'networkidle2'});

    // set data
    scrappedData.applicationNumber = appNumberToSearch;

    scrappedData.aplicationOwner = applicationOwner;

    // e-register > Maintenance fees > zadnji red ima oba podatka valjda
    // scrappedData.lastPaid = lastPaid; // deposit kolona
    // scrappedData.latestAnnualFeePaid = latestAnnualFeePaid; // todo ne znam koja kolona, vrv mora da se racuna
    // } catch (err) {
    //     console.log(err);
    // }
}

async function x(xpath) {
    // input field
    const [appNumberInput] = await page.$x('//*[@id="ipId"]');

}

async function eval(selector) {

}

async function parseRows(selector) {
    const childrenCount = await page.$eval(selector, el => {
            return el.children.length;
        }
    );
    let strArray = [];
    for (let i = 1; i < childrenCount; i = i + 2) {
        let child = await page.$eval(selector + ' > span:nth-child(' + i + ')', el => {
            return el.textContent.trim();
        });
        strArray.push(child); // todo dont add if child === undefined
    }
    return strArray;
}


module.exports = {
    getPatentData,
};