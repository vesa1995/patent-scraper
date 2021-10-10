import puppeteer from 'puppeteer'

async function getPatentData() {
    const scrappedData = {};
    const initialPageUrl = 'https://portal.bpo.bg/web/guest/bpo_online/-/bpo/epo_patent-search'
    let launchOptions = {headless: false, args: ['--start-fullscreen'], waitUntil: 'networkidle2'};
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
    const [languageChoser] = await page.$x('//*[@id="ctvk_null_null"]');
    await languageChoser.click()
    await page.deleteCookie();
    await page.waitForTimeout(3000)

    // advanced search button
    await page.waitForSelector('#_bposervicesportlet_WAR_bposervicesportlet_\\:main_form\\:togle_link', {visibe: true});
    const [linkHtml] = await page.$x('//*[@id="_bposervicesportlet_WAR_bposervicesportlet_:main_form:togle_link"]')
    if (linkHtml) {
        await linkHtml.click({delay: 500});
    }

    // application number checkbox
    await page.waitForSelector('#_bposervicesportlet_WAR_bposervicesportlet_\\:main_form\\:j_idt24');
    const [checkbox] = await page.$x('//*[@id="_bposervicesportlet_WAR_bposervicesportlet_:main_form:j_idt24"]')
    if (checkbox) {
        await checkbox.click();
    }

    // application number form
    page.waitForSelector('#_bposervicesportlet_WAR_bposervicesportlet_\\:main_form\\:app-num-panel');
    const timeoutTextBoxes = await page.waitForTimeout(200).then(async () => {
        // input field
        const [textBox1] = await page.$x('//*[@id="_bposervicesportlet_WAR_bposervicesportlet_:main_form:app-num-start_input"]');
        await textBox1.focus({delay: 500});  // todo possible error here, texBox1 could be undefined
        const typed = await page.keyboard.type('EP10797960'); // todo extract this into var
        // search button
        const [button] = await page.$x('//*[@id="_bposervicesportlet_WAR_bposervicesportlet_:main_form:submit_button"]')
        button.click({delay: 500})
        // search result table
        const tableShown = await page.waitForSelector('#_bposervicesportlet_WAR_bposervicesportlet_\\:main_form\\:table_result');
        // eye button
        const [eyeLink] = await page.$x('//*[@id="_bposervicesportlet_WAR_bposervicesportlet_:main_form:table_result:0:j_idt365"]')
        eyeLink.click({delay: 500})
    });

    await page.waitForNavigation();

    await page.waitForTimeout(2000)

    // open all button
    const [expanderLink] = await page.$x('//*[@id="_bposervicesportlet_WAR_bposervicesportlet_:j_idt13:j_idt23:open_all_toggel_panel"]');
    expanderLink.click({delay: 1000})
    // details data
    const detailsData = await page.$eval('#_bposervicesportlet_WAR_bposervicesportlet_\\:j_idt13\\:j_idt62\\:j_idt63', el => {
        return el.outerHTML
    });
    // Details > Application number
    const publicationRefferenceId = await page.$eval('#_bposervicesportlet_WAR_bposervicesportlet_\\:j_idt13\\:j_idt62\\:j_idt63 > div:nth-child(1) > div:nth-child(2)', el => {
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

    scrappedData.patentNumber = publicationRefferenceId;
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
}

module.exports = {
    getPatentData,
};