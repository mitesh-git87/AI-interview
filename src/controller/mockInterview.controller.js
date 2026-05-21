const interviewReportModel = require("../models/interviewreport.model");
const mockInterviewModel = require("../models/mockInterview.model");

const { speechToText } = require("../services/elevenlabs.service");
const { evaluateInterviewAnswer } = require("../services/ai.service");

function getUserId(req) {
  return req.user?._id || req.user?.id;
}

function getQuestionObject(question, questionType) {
  const plainQuestion = question.toObject ? question.toObject() : question;

  return {
    ...plainQuestion,
    questionType,
  };
}

async function startMockInterview(req, res) {
  try {
    const { reportId } = req.params;

    const loggedInUserId = getUserId(req);

    if (!loggedInUserId) {
      return res.status(401).json({
        message: "User not found in request. Please login again.",
      });
    }

    const interviewReport = await interviewReportModel.findById(reportId);

    if (!interviewReport) {
      return res.status(404).json({
        message: "Interview report not found",
      });
    }

    if (!interviewReport.user) {
      return res.status(400).json({
        message: "This interview report does not have a user attached",
      });
    }

    console.log("REPORT USER:", interviewReport.user.toString());

    console.log("LOGGED USER:", loggedInUserId.toString());

    if (interviewReport.user.toString() !== loggedInUserId.toString()) {
      return res.status(403).json({
        message: "You are not allowed to start this interview",
      });
    }

    const technicalQuestions = (interviewReport.technicalQuestion || []).map(
      (question) => getQuestionObject(question, "technical")
    );

    const behaviourQuestions = (interviewReport.behaviourQuestion || []).map(
      (question) => getQuestionObject(question, "behaviour")
    );

    const allQuestions = [...technicalQuestions, ...behaviourQuestions];

    const firstQuestionObj = allQuestions[0];

    if (!firstQuestionObj) {
      return res.status(400).json({
        message: "No question found in this report",
      });
    }

    const mockSession = await mockInterviewModel.create({
      user: loggedInUserId,
      interviewReport: reportId,
      status: "started",
      currentQuestionIndex: 0,
      totalQuestions: allQuestions.length,
      answers: [],
    });

    const voiceText = `
Your mock interview is starting.

First question is:
${firstQuestionObj.question}
`;

    return res.status(200).json({
      message: "Mock interview started",
      sessionId: mockSession._id,
      reportId,
      currentQuestionIndex: 0,
      totalQuestions: allQuestions.length,
      currentQuestion: firstQuestionObj.question,
      currentQuestionType: firstQuestionObj.questionType,
      voiceText,
    });
  } catch (error) {
    console.log("Start Mock Interview Error:", error);

    return res.status(500).json({
      message: "Failed to start mock interview",
      error: error.message,
    });
  }
}

async function answerMockInterviewQuestion(req, res) {
  try {
    const { sessionId } = req.params;

    const loggedInUserId = getUserId(req);

    if (!loggedInUserId) {
      return res.status(401).json({
        message: "User not found in request. Please login again.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Answer audio file is required",
      });
    }

    const mockSession = await mockInterviewModel.findById(sessionId);

    if (!mockSession) {
      return res.status(404).json({
        message: "Mock interview session not found",
      });
    }

    if (mockSession.user.toString() !== loggedInUserId.toString()) {
      return res.status(403).json({
        message: "You are not allowed to answer this interview",
      });
    }

    if (mockSession.status === "completed") {
      return res.status(400).json({
        message: "This mock interview is already completed",
      });
    }

    const interviewReport = await interviewReportModel.findById(
      mockSession.interviewReport
    );

    if (!interviewReport) {
      return res.status(404).json({
        message: "Interview report not found",
      });
    }

    const technicalQuestions = (interviewReport.technicalQuestion || []).map(
      (question) => getQuestionObject(question, "technical")
    );

    const behaviourQuestions = (interviewReport.behaviourQuestion || []).map(
      (question) => getQuestionObject(question, "behaviour")
    );

    const allQuestions = [...technicalQuestions, ...behaviourQuestions];

    const questionIndex = mockSession.currentQuestionIndex;

    const questionObj = allQuestions[questionIndex];

    if (!questionObj) {
      mockSession.status = "completed";
      await mockSession.save();

      return res.status(400).json({
        message: "No more questions found. Interview completed.",
      });
    }

    const userTranscript = await speechToText(req.file.buffer);

    const aiFeedback = await evaluateInterviewAnswer({
      question: questionObj.question,
      userAnswer: userTranscript,
    });

    mockSession.answers.push({
      question: questionObj.question,
      questionType: questionObj.questionType,
      userTranscript,
      aiScore: aiFeedback.score || 0,
      goodPoints: aiFeedback.goodPoints || [],
      improvements: aiFeedback.improvements || [],
      missingPoints: aiFeedback.missingPoints || [],
      betterAnswer: aiFeedback.betterAnswer || "",
      feedbackSummary: aiFeedback.feedbackSummary || "",
    });

    const nextQuestionIndex = questionIndex + 1;
    const nextQuestionObj = allQuestions[nextQuestionIndex];

    mockSession.currentQuestionIndex = nextQuestionIndex;

    mockSession.totalScore = mockSession.answers.reduce((sum, answer) => {
      return sum + Number(answer.aiScore || 0);
    }, 0);

    mockSession.averageScore =
      mockSession.answers.length > 0
        ? mockSession.totalScore / mockSession.answers.length
        : 0;

    if (!nextQuestionObj) {
      mockSession.status = "completed";
    }

    await mockSession.save();

    const goodPointsText =
      aiFeedback.goodPoints && aiFeedback.goodPoints.length > 0
        ? aiFeedback.goodPoints.slice(0, 2).join(", ")
        : "You attempted the answer well";

    const improvementsText =
      aiFeedback.improvements && aiFeedback.improvements.length > 0
        ? aiFeedback.improvements.slice(0, 2).join(", ")
        : "Try to add more structure and examples";

    const voiceText = `
Your answer score is ${aiFeedback.score} out of 10.

Good points: ${goodPointsText}.

Things to improve: ${improvementsText}.

${nextQuestionObj ? `Next question is: ${nextQuestionObj.question}` : "Your mock interview is completed."}
`;

    return res.status(200).json({
      message: "Answer evaluated and saved successfully",
      sessionId: mockSession._id,
      questionIndex,
      question: questionObj.question,
      questionType: questionObj.questionType,
      userTranscript,
      aiFeedback,
      nextQuestionIndex,
      nextQuestion: nextQuestionObj ? nextQuestionObj.question : null,
      nextQuestionType: nextQuestionObj ? nextQuestionObj.questionType : null,
      isCompleted: !nextQuestionObj,
      mockSession,
      voiceText,
    });
  } catch (error) {
    console.log("Answer Mock Interview Error:", error);

    return res.status(500).json({
      message: "Failed to evaluate answer",
      error: error.message,
    });
  }
}

async function getMockInterviewSession(req, res) {
  try {
    const { sessionId } = req.params;

    const loggedInUserId = getUserId(req);

    if (!loggedInUserId) {
      return res.status(401).json({
        message: "User not found in request. Please login again.",
      });
    }

    const mockSession = await mockInterviewModel
      .findById(sessionId)
      .populate("interviewReport");

    if (!mockSession) {
      return res.status(404).json({
        message: "Mock interview session not found",
      });
    }

    if (mockSession.user.toString() !== loggedInUserId.toString()) {
      return res.status(403).json({
        message: "You are not allowed to view this interview",
      });
    }

    return res.status(200).json({
      message: "Mock interview session fetched successfully",
      mockSession,
    });
  } catch (error) {
    console.log("Get Mock Interview Session Error:", error);

    return res.status(500).json({
      message: "Failed to fetch mock interview session",
      error: error.message,
    });
  }
}

module.exports = {
  startMockInterview,
  answerMockInterviewQuestion,
  getMockInterviewSession,
};