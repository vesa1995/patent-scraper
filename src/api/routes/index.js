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
    "/hungary/patent/:appNumber", // example: /hungary/patent/E11700404
    asyncHandler(async (req, res, next) => {
        const patentData = await hungaryService.getPatentData(req.params["appNumber"]);
        res.send(patentData);
    })
);

router.get(
    "/hungary/patent", // example: /hungary/patent/?app_num=E11700404&cache=yes
    asyncHandler(async (req, res, next) => {
        let appNumber = req.query.app_num;
        let cache = req.query.cache; // todo change param name maybe?
        const patentData = await hungaryService.getPatentCacheData(appNumber, cache);
        console.log(patentData)
        res.send(patentData);
    })
);

module.exports = router;
