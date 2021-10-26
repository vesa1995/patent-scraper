const https = require('https')


async function sendData(scrapedData) {
    const dataToSend = new TextEncoder().encode(
        JSON.stringify(scrapedData)
    );

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
            'Content-Type': 'application/json',
            'Content-Length': dataToSend.length
        }
    }

    const req = https.request(options, res => {
        console.log('statusCode =', res.statusCode);

        res.on('data', d => {
            console.log('data:');
            process.stdout.write(d);
            console.log('\n');
        })
    })

    req.on('error', error => {
        console.error('error:\n', error);
    })

    req.write(dataToSend);
    req.end();
}

module.exports = {
    sendData,
};