const cookieParser = require("cookie-parser");
const express = require("express");
const logger = require("morgan");
const path = require("path");

const routes = require("./routes/index");

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", routes);

module.exports = app;
