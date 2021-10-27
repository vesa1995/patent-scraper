const asyncHandler = require("express-async-handler");
const express = require("express");

const windService = require("../../service/windService");
const patentService = require("../../service/bulgariaService");
const hungaryService = require("../../service/hungaryService");

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
    "/hungary/:appNumber", // example: /hungary/patent/E11700404
    asyncHandler(async (req, res, next) => {
        const patentData = await hungaryService.getPatentData(req.params["appNumber"]);
        res.send(patentData);
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

module.exports = router;
