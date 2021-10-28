const asyncHandler = require("express-async-handler");
const express = require("express");

const windService = require("../../service/windService");
const patentService = require("../../service/bulgariaService");
const hungaryService = require("../../service/hungaryService");
const requestService = require("../../service/requestService");

const pubSub = require("../../subscribers/pubSub");

const router = new express.Router();

router.get(
    "/wind",
    asyncHandler(async (req, res, next) => {
        const windSpeed = await windService.getWindSpeedAtCurrentLocation();
        res.send(windSpeed);
    })
);

router.get(
    "/patent/:appNumber", // example: /patent/EP10797960
    asyncHandler(async (req, res, next) => {
        const patentData = await patentService.getPatentData(req.params["appNumber"]);
        res.send(patentData);
    })
);

router.get(
    "/hungary/:appNumber", // example: /hungary/E11700404
    asyncHandler(async (req, res, next) => {
        const clientAddress = req.connection.remoteAddress;
        const clientPort = req.connection.remotePort;
        res.send('Downloading data');
        res.end();
        const patentData = await hungaryService.getPatentData(req.params["appNumber"]);
        // await requestService.sendData(clientAddress, clientPort, patentData);
    })
);

router.get(
    "/hungary/cache/:appNumber", // example: /hungary/cache/E11700404
    asyncHandler(async (req, res, next) => {
        const patentData = await hungaryService.getPatentCacheData(req.params["appNumber"]);
        console.log(patentData)
        res.send(patentData);
    })
);

router.get('/talk', function (req, res) {
    sendServerSendEvent(req, res);
});

function sendServerSendEvent(req, res) {
    res.writeHead(200, {
        'Content-Type' : 'text/event-stream',
        'Cache-Control' : 'no-cache',
        'Connection' : 'keep-alive'
    });

    var sseId = (new Date()).toLocaleTimeString();
    var sendInterval = 5000; // send interval in millis

    setInterval(function() {
        writeServerSendEvent(res, sseId, (new Date()).toLocaleTimeString());
    }, sendInterval);

    writeServerSendEvent(res, sseId, (new Date()).toLocaleTimeString());
    // res.end();
}

function writeServerSendEvent(res, sseId, data) {
    res.write('id: ' + sseId + '\n');
    res.write("data: new server event " + data + '\n\n');
}

module.exports = router;
