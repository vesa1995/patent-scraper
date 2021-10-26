// const http = require('http');
const https = require('https')


async function sendData(scrapedData) {
    console.log('req service: ', scrapedData);

    // https://localhost:5001/api/Text/home
    // http://localhost:5000/api/Text/home

    const dataToSend = new TextEncoder().encode(
        JSON.stringify({
            "applicationNumber": "E11700404",
            "registrationNumber": "E021367",
            "aplicationDate": "2011.01.12",
            "status": [ "Under protection", "Under definitive patent protection" ],
            "maintenanceFees": {
                "Payer": "DANUBIA Szabadalmi és Jogi Iroda Kft.",
                "Deposit": "2021.01.05",
                "Amount": "148,500",
                "Validity": "11 (2021)",
                "Remnant": "0"
            }
        })
    );
    // const dataToSend = '123456767854567';

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    const options = {
        hostname: 'localhost',
        port: 5001,
        path: '/api/Text/hungary',
        method: 'POST',
        connection: 'keep-alive',
        accept: '*/*',
        data: dataToSend,
        headers: {
            'Content-Type': 'application/json', // application/json  |  text/plain
            'Content-Length': dataToSend.length
        }
    }


    const req = https.request(options, res => {
        console.log(`statusCode: ${res.statusCode}`)

        res.on('data', d => {
            console.log('data:');
            process.stdout.write(d);
        })
    })

    req.on('error', error => {
        console.log('error:');
        console.error(error);
    })

    req.write(dataToSend);
    req.end();
}

module.exports = {
    sendData,
};