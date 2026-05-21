const express = require("express");
const router = express.Router();

const voiceController = require("../controller/voice.controller");

router.post("/text-to-speech", voiceController.generateVoice);

module.exports = router;