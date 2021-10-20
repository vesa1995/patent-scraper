const puppeteer = require("puppeteer");

async function getPatentData(appNumber) {
    const appNumberToSearch = appNumber;
    const scrappedData = {};
    const initialPageUrl = 'https://portal.bpo.bg/web/guest/bpo_online/-/bpo/epo_patent-search'
    let launchOptions = {headless: true, /*args: ['--start-fullscreen'],*/ waitUntil: 'networkidle2'};
    let browser = await puppeteer.launch(launchOptions);
    let page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0);
    page.on('console', ((msg) => {
        if (msg.text().indexOf('debug') !== -1) {
            console.log(msg.text())
        }
    }));

    await page.setViewport({width: 1440, height: 768});
    await page.goto(initialPageUrl, {waitUntil: 'networkidle2'});

    // english button
    const [languageChooser] = await page.$x('//*[@id="ctvk_null_null"]');
    await languageChooser.click()
    await page.deleteCookie();

    try {
        // advanced search button
        await page.waitForNetworkIdle();
        const [linkHtml] = await page.$x('//*[@id="_bposervicesportlet_WAR_bposervicesportlet_:main_form:togle_link"]')
        if (linkHtml)
            await linkHtml.click();

        // application number checkbox
        await page.waitForNetworkIdle();
        const [checkbox] = await page.$x('//*[@id="_bposervicesportlet_WAR_bposervicesportlet_:main_form:j_idt24"]')
        if (checkbox)
            await checkbox.click();

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
        // details data
        await page.$eval('#_bposervicesportlet_WAR_bposervicesportlet_\\:j_idt13\\:j_idt62\\:j_idt63', el => {
            return el.outerHTML
        });
        // Details > Application number
        const publicationReferenceId = await page.$eval('#_bposervicesportlet_WAR_bposervicesportlet_\\:j_idt13\\:j_idt62\\:j_idt63 > div:nth-child(1) > div:nth-child(2)', el => {
            return el.textContent
        })
        // Details > Issue/Registration date
        const registrationDate = await page.$eval('#_bposervicesportlet_WAR_bposervicesportlet_\\:j_idt13\\:j_idt62\\:j_idt63 > div:nth-child(2) > div:nth-child(4)', el => {
            return el.textContent
        })
        // Details > Patent number todo maybe var name mistake
        const applicationNumber = await page.$eval('#_bposervicesportlet_WAR_bposervicesportlet_\\:j_idt13\\:j_idt62\\:j_idt63 > div:nth-child(2) > div:nth-child(2)', el => {
            return el.textContent
        })
        // Details > Application date
        const applicationDate = await page.$eval('#_bposervicesportlet_WAR_bposervicesportlet_\\:j_idt13\\:j_idt62\\:j_idt63 > div:nth-child(1) > div:nth-child(4)', el => {
            return el.textContent
        })
        // Details > Last paid
        const lastPaid = await page.$eval('#_bposervicesportlet_WAR_bposervicesportlet_\\:j_idt13\\:j_idt62\\:j_idt63 > div:nth-child(5) > div:nth-child(4)', el => {
            return el.textContent
        })
        // Details > Latest annual fee paid
        const latestAnnualFeePayed = await page.$eval('#_bposervicesportlet_WAR_bposervicesportlet_\\:j_idt13\\:j_idt62\\:j_idt63 > div:nth-child(5) > div:nth-child(2)', el => {
            return el.textContent
        })
        // Applicant/Owner
        const applicationOwner = await page.$eval('#_bposervicesportlet_WAR_bposervicesportlet_\\:j_idt13\\:j_idt62\\:j_idt195 > div > div', el => {
            return el.textContent
        })
        // Details > Status
        const status = await page.$eval('#_bposervicesportlet_WAR_bposervicesportlet_\\:j_idt13\\:j_idt62\\:j_idt63 > div:nth-child(4) > div.ui-grid-col-9', el => {
            return el.textContent
        })

        scrappedData.patentNumber = publicationReferenceId;
        scrappedData.applicationNumber = applicationNumber; // todo mistake, see other todo comment
        scrappedData.registrationDate = registrationDate;
        scrappedData.aplicationDate = applicationDate;
        scrappedData.lastPaid = lastPaid;
        scrappedData.latestAnnualFeePayed = latestAnnualFeePayed;
        scrappedData.aplicationOwner = applicationOwner;
        scrappedData.status = status;
        // todo add scrappedData.url (patent page url) - ovo moze biti da je nemoguce jer nema url,
        //  vec po sesiji server zna sta nama treba

        console.log('#######', scrappedData);
        await browser.close();
    } catch (err) {
        console.log(err);
    }
    return scrappedData;
}

module.exports = {
    getPatentData,
};