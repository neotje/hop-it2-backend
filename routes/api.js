"use strict";

const express = require('express');
const router = express.Router();

// api routers
router.use("/user", require("./api/user"));
router.use("/chat", require("./api/chat"));

// api routes
router.get("/version", function (req, res) {
    res.send(require("../package.json").version);
});

module.exports = router;
