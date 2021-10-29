const patentService = require('./patentService.ts');


async function saveData(data) {
    await patentService.createPatent(data);
}

async function getData(appNumber) {
    return await patentService.getPatent(appNumber);
}

module.exports = {
    saveData,
    getData
}