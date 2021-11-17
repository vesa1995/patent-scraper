const hungaryService = require("./hungaryService");
const bulgariaService = require("./bulgariaService");
const browserService = require("./browserService");
const cacheService = require("./cacheService");

let scrappedData = {};
let page;


async function getPatentCacheData(appNumber) {
	return await cacheService.getData(appNumber);
}

async function getPatentData(appNumber, country) {
	await asyncDownloadData(appNumber, country);
	return "Downloading data...";
}

async function asyncDownloadData(appNumber, country) {
	page = await browserService.startPage();

	// let pages = await page.browser().pages();
	// let i = 0;
	// for (let page of pages) {
	// 	console.log('page ' + i + ' url:', page.url());
	// 	i++;
	// }

	if (country === 'hungary'){
		scrappedData = await hungaryService.scrape(appNumber, page);
	} else if (country === 'bulgaria') {
		scrappedData = await bulgariaService.scrape(appNumber, page);
	}
	await browserService.closePage();
	// await cacheService.saveData(scrappedData);
	return scrappedData;
}

module.exports = {
	getPatentCacheData,
	getPatentData
};