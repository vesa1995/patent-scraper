// import sd = require('./../model/scrappedData');

(function () {
    const puppeteer = require("puppeteer");
    const bulgariaPatentsPageURL = 'https://portal.bpo.bg/web/guest/bpo_online/-/bpo/epo_patent-search'
    let scrappedData = {
        applicationNumber: String,
        registrationNumber: String,
        registrationDate: String,
        applicationDate: String,
        lastPaid: String,
        latestAnnualFeePaid: String,
        applicationOwner: String,
        status: Array
    };
    let browser;
    let page;

    async function getPatentData(appNumber) {
        await startBrowser();
        await scrap(appNumber);
        await closeBrowser();
        return scrappedData;
    }

    async function startBrowser() {
        const launchOptions = {headless: true, /*args: ['--start-fullscreen'],*/ waitUntil: 'networkidle2'};
        browser = await puppeteer.launch(launchOptions);
        page = await browser.newPage();

        await page.setDefaultNavigationTimeout(0);
        page.on('console', ((msg) => {
            if (msg.text().indexOf('debug') !== -1) {
                console.log(msg.text())
            }
        }));
    }

    async function scrap(appNumberToSearch) {
        try {
            // go to page (url address)
            await page.setViewport({width: 1440, height: 768});
            await page.goto(bulgariaPatentsPageURL, {waitUntil: 'networkidle2'});

            // english button
            const [languageChooser] = await page.$x('//*[@id="ctvk_null_null"]');
            await languageChooser.click()
            await page.deleteCookie();

            // advanced search button
            await page.waitForNetworkIdle();
            const [linkHtml] = await page.$x('//*[@id="_bposervicesportlet_WAR_bposervicesportlet_:main_form:togle_link"]')
            if (linkHtml) {
                await linkHtml.click();
            }

            // application number checkbox
            await page.waitForNetworkIdle();
            const [checkbox] = await page.$x('//*[@id="_bposervicesportlet_WAR_bposervicesportlet_:main_form:j_idt24"]')
            if (checkbox) {
                await checkbox.click();
            }

            // application number form
            await page.waitForNetworkIdle();
            // input field
            const [textBox1] = await page.$x('//*[@id="_bposervicesportlet_WAR_bposervicesportlet_:main_form:app-num-start_input"]');
            await textBox1.focus();
            await page.keyboard.type(appNumberToSearch);
            // search button
            const [button] = await page.$x('//*[@id="_bposervicesportlet_WAR_bposervicesportlet_:main_form:submit_button"]')
            await button.click()
            // search result table
            await page.waitForNetworkIdle();
            // eye button
            const [eyeLink] = await page.$x('//*[@id="_bposervicesportlet_WAR_bposervicesportlet_:main_form:table_result:0:j_idt365"]')
            await eyeLink.click()

            // table page
            await page.waitForNetworkIdle();

            // open all button
            const [expanderLink] = await page.$x('//*[@id="_bposervicesportlet_WAR_bposervicesportlet_:j_idt13:j_idt23:open_all_toggel_panel"]');
            await expanderLink.click()
            // details data (useless code)
            await page.$eval('#_bposervicesportlet_WAR_bposervicesportlet_\\:j_idt13\\:j_idt62\\:j_idt63', el => {
                return el.outerHTML
            });
            // Details > Application number
            const applicationNumber = await page.$eval('#_bposervicesportlet_WAR_bposervicesportlet_\\:j_idt13\\:j_idt62\\:j_idt63 > div:nth-child(1) > div:nth-child(2)', el => {
                return el.textContent.trim();
            })
            // Details > Issue/Registration date
            const registrationDate = await page.$eval('#_bposervicesportlet_WAR_bposervicesportlet_\\:j_idt13\\:j_idt62\\:j_idt63 > div:nth-child(2) > div:nth-child(4)', el => {
                return el.textContent.trim();
            })
            // Details > Patent/Registration number
            const registrationNumber = await page.$eval('#_bposervicesportlet_WAR_bposervicesportlet_\\:j_idt13\\:j_idt62\\:j_idt63 > div:nth-child(2) > div:nth-child(2)', el => {
                return el.textContent.trim();
            })
            // Details > Application date
            const applicationDate = await page.$eval('#_bposervicesportlet_WAR_bposervicesportlet_\\:j_idt13\\:j_idt62\\:j_idt63 > div:nth-child(1) > div:nth-child(4)', el => {
                return el.textContent.trim();
            })
            // Details > Last paid
            const lastPaid = await page.$eval('#_bposervicesportlet_WAR_bposervicesportlet_\\:j_idt13\\:j_idt62\\:j_idt63 > div:nth-child(5) > div:nth-child(4)', el => {
                return el.textContent.trim();
            })
            // Details > Latest annual fee paid
            const latestAnnualFeePaid = await page.$eval('#_bposervicesportlet_WAR_bposervicesportlet_\\:j_idt13\\:j_idt62\\:j_idt63 > div:nth-child(5) > div:nth-child(2)', el => {
                return el.textContent.trim();
            })
            // Applicant/Owner
            const applicationOwner = await page.$eval('#_bposervicesportlet_WAR_bposervicesportlet_\\:j_idt13\\:j_idt62\\:j_idt195 > div > div', el => {
                return el.textContent.trim();
            })
            // Details > Status
            const status = await page.$eval('#_bposervicesportlet_WAR_bposervicesportlet_\\:j_idt13\\:j_idt62\\:j_idt63 > div:nth-child(4) > div.ui-grid-col-9', el => {
                return el.textContent.trim();
            })

            // set data
            scrappedData.applicationNumber = applicationNumber;
            scrappedData.registrationNumber = registrationNumber;
            scrappedData.registrationDate = registrationDate;
            scrappedData.applicationDate = applicationDate;
            scrappedData.lastPaid = lastPaid;
            scrappedData.latestAnnualFeePaid = latestAnnualFeePaid;
            scrappedData.applicationOwner = applicationOwner;
            scrappedData.status = status;

            // output data
            console.log('Patent data:', scrappedData);
        } catch (err) {
            console.log(err);
        }
    }

    async function closeBrowser() {
        await browser.close();
    }

    module.exports = {
        getPatentData,
    };

})();