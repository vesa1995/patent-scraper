const https = require('https')
const http = require('http')
// const {backendUrl, backendPort, backendEndpoint} = require('./../config/constants');
const chromeDebugUrl = 'http://127.0.0.1:9222/json/version';


async function fetchData() {
    return new Promise((resolve, reject) => {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

        const options = {
            hostname: '127.0.0.1',
            port: '9222',
            path: '/json/version',
            method: 'GET',
            connection: 'keep-alive',
            accept: '*/*',
            headers: {
                'Content-Type': 'application/json',
            }
        }

        const req = http.request(options, res => {
            // console.log('statusCode =', res.statusCode);

            res.on('data', dataStream => {
                const data = JSON.parse(dataStream);
                // console.log(data);
                resolve(data.webSocketDebuggerUrl);
            });
        });

        req.on('error', error => {
            console.error(error);
            reject(error);
        });

        req.end();
    });
}

async function sendData(clientAddress, clientPort, scrapedData) { // todo use Promise like in fetchData
    const dataToSend = new TextEncoder().encode(
        JSON.stringify(scrapedData)
    );

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    const options = {
        hostname: clientAddress,
        port: clientPort,
        // path: backendEndpoint,
        method: 'POST',
        connection: 'keep-alive',
        accept: '*/*',
        data: dataToSend,
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': dataToSend.length
        }
    }

    const req = https.request(options, res => {
        console.log('statusCode =', res.statusCode);

        res.on('data', dataStream => {
            const data = JSON.parse(dataStream);
            // console.log(data);
        })
    })

    req.on('error', error => {
        console.error(error);
    })

    req.write(dataToSend);
    req.end();
}

module.exports = {
    sendData,
    fetchData,
};