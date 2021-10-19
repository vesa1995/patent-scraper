const asyncHandler = require("express-async-handler");
const express = require("express");

const windService = require("../../service/windService");
const patentService = require("../../service/patentService");
const authorService = require("../../service/authorService");

const router = new express.Router();

router.get(
    "/wind",
    asyncHandler(async (req, res, next) => {
        const windSpeed = await windService.getWindSpeedAtCurrentLocation();
        res.send(windSpeed);
    })
);

router.get(
    "/patent/:appNumber", // EP10797960
    asyncHandler(async (req, res, next) => {
        const patentData = await patentService.getPatentData(req.params["appNumber"]);
        res.send(patentData);
    })
);

router.post(
    "/author/:name",
    asyncHandler(async (req, res, next) => {
        const patentData = await authorService.createAuthor(req.params["name"]);
        res.send(patentData);
    })
);

module.exports = router;
