const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/auth.middlewares");
const upload = require("../middlewares/file.middlewares");

const mockInterviewController = require("../controller/mockInterview.controller");

router.get("/start/:reportId", authMiddleware.authUser, mockInterviewController.startMockInterview);

router.post("/answer/:sessionId", authMiddleware.authUser, upload.single("answerAudio"), mockInterviewController.answerMockInterviewQuestion);

router.get("/session/:sessionId", authMiddleware.authUser, mockInterviewController.getMockInterviewSession);

module.exports = router;