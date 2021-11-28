const asyncHandler = require("express-async-handler");
const express = require("express");

const downloadService = require("../../service/downloadService");
const patentService = require("../../service/bulgariaService");
const hungaryService = require("../../service/hungaryService");
const requestService = require("../../service/requestService");

const router = new express.Router();


router.get(
	"/patent/:appNumber", // example: /patent/EP10797960
	asyncHandler(async (req, res, next) => {
		const patentData = await downloadService.getPatentData(req.params["appNumber"], 'bulgaria');
		res.send(patentData);
	})
);

router.get('/hungary/:appNumber',
	async function (req, res) {
		let longIp = req.connection.remoteAddress.split(':');
		const clientAddress = longIp[longIp.length - 1];
		const clientPort = req.connection.remotePort;
		res.send('Downloading data');
		res.end();
		const patentData = await hungaryService.getPatentData(req.params["appNumber"]);
		// await requestService.sendData(clientAddress, clientPort, patentData); // webhook
	}
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
