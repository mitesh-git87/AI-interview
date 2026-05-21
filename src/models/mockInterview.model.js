const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },

    questionType: {
      type: String,
      enum: ["technical", "behaviour"],
      required: true,
    },

    userTranscript: {
      type: String,
      default: "",
    },

    aiScore: {
      type: Number,
      default: 0,
    },

    goodPoints: {
      type: [String],
      default: [],
    },

    improvements: {
      type: [String],
      default: [],
    },

    missingPoints: {
      type: [String],
      default: [],
    },

    betterAnswer: {
      type: String,
      default: "",
    },

    feedbackSummary: {
      type: String,
      default: "",
    },

    answeredAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  }
);

const mockInterviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    interviewReport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "interviewReport",
      required: true,
    },

    status: {
      type: String,
      enum: ["started", "completed"],
      default: "started",
    },

    currentQuestionIndex: {
      type: Number,
      default: 0,
    },

    totalQuestions: {
      type: Number,
      default: 0,
    },

    totalScore: {
      type: Number,
      default: 0,
    },

    averageScore: {
      type: Number,
      default: 0,
    },

    answers: {
      type: [answerSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const mockInterviewModel = mongoose.model(
  "mockInterview",
  mockInterviewSchema
);

module.exports = mockInterviewModel;