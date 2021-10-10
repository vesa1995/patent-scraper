const asyncHandler = require("express-async-handler");
const express = require("express");

const windService = require("../../service/windSpeed");
const patentService = require("../../service/patent");

const router = new express.Router();

router.get(
    "/wind",
    asyncHandler(async (req, res, next) => {
        const windSpeed = await windService.getWindSpeedAtCurrentLocation();
        res.send(windSpeed);
    })
);

router.get(
    "/patent",
    asyncHandler(async (req, res, next) => {
        // const patentData = await patentService.getPatentData();
        // res.send(patentData);
        const patentData = patentService.getPatentData();
        res.send(patentData);
    })
);

module.exports = router;
