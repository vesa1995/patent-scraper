const Patent = require("./../model/patent");


async function createPatent(data) {
    try {
        const patent = new Patent({
            applicationNumber: data.applicationNumber,
            registrationNumber: data.registrationNumber,
            applicationDate: data.applicationDate,
            status: Array.from(data.status),
            maintenanceFees: {
                payer: data.maintenanceFees.payer,
                deposit: data.maintenanceFees.deposit,
                amount: data.maintenanceFees.amount,
                validity: data.maintenanceFees.validity,
                remnant: data.maintenanceFees.remnant
            }
        });
        await patent.save(function (error, document) {
            if (error) {
                console.error(error)
            }
            // console.log('patent saved:\n', document)
        });
    } catch (error) {
        throw error
    }
}

async function getPatent(appNumber) {
    const list = await Patent.find({applicationNumber: appNumber}).exec();
    return list[0];
}

module.exports = {
    createPatent,
    getPatent
}