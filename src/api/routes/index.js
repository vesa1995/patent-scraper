const asyncHandler = require("express-async-handler");
const express = require("express");

const windSpeed = require("../../service/windSpeed");

const router = new express.Router();

router.get(
    "/wind",
    asyncHandler(async (req, res, next) => {
        const windspeed = await windSpeed.getWindSpeedAtCurrentLocation();
        res.send(windspeed);
    })
);
router.get(
    "/patent",
    asyncHandler(async (req, res, next) => {
        const patentData = await windSpeed.getWindSpeedAtCurrentLocation();
        res.send(patentData);
    })
);

module.exports = router;
