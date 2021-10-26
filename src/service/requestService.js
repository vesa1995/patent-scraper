// const http = require('http');
const https = require('https')


async function sendData(scrapedData) {
    console.log('req service: ', scrapedData);

    // https://localhost:5001/api/Text/home
    // http://localhost:5000/api/Text/home

    const text = new TextEncoder().encode(
        JSON.stringify({
            data: 'Buy the milk'
        })
    )

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    const options = {
        hostname: 'localhost',
        port: 5001,
        path: '/api/Text/home',
        method: 'GET',
        connection: 'keep-alive',
        accept: '*/*',
    }


    const req = https.request(options, res => {
        console.log(`statusCode: ${res.statusCode}`)

        res.on('data', d => {
            process.stdout.write(d)
        })
    })

    req.on('error', error => {
        console.error(error)
    })

    req.end()
}

module.exports = {
    sendData,
};