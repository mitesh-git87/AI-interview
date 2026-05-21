const pdfParse = require("pdf-parse");
const generateInterviewReport = require("../services/ai.service");
const interviewReportModel = require("../models/interviewreport.model");

async function generateInterviewReportController(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "resume file is required",
      });
    }

    const { selfDescription, jobDescription } = req.body;

    if (!selfDescription || !jobDescription) {
      return res.status(400).json({
        message: "selfDescription and jobDescription are required",
      });
    }

    const resumecontent = await new pdfParse.PDFParse(
      Uint8Array.from(req.file.buffer)
    ).getText();

    const interviewReportByAi = await generateInterviewReport({
      resume: resumecontent.text,
      selfDescription,
      jobDescription,
    });

    const interviewReport = await interviewReportModel.create({
      user: req.user.id,
      resume: resumecontent.text,
      selfDescription,
      jobDescription,
      ...interviewReportByAi,
    });

    const skillGapsText =
      interviewReportByAi.skillGap && interviewReportByAi.skillGap.length > 0
        ? interviewReportByAi.skillGap.map((gap) => gap.skill).join(", ")
        : "No major skill gaps found";

    const firstTechnicalQuestion =
      interviewReportByAi.technicalQuestion &&
      interviewReportByAi.technicalQuestion.length > 0
        ? interviewReportByAi.technicalQuestion[0].question
        : "No technical question found";

    const firstBehaviourQuestion =
      interviewReportByAi.behaviourQuestion &&
      interviewReportByAi.behaviourQuestion.length > 0
        ? interviewReportByAi.behaviourQuestion[0].question
        : "No behavioral question found";

    const voiceText = `
Hello, your interview report is ready.

Your resume match score is ${interviewReportByAi.matchScore} percent.

Your main skill gaps are: ${skillGapsText}.

Your first technical interview question is:
${firstTechnicalQuestion}

Your first behavioral interview question is:
${firstBehaviourQuestion}

Take a moment to think, then answer the first question.
`;

    return res.status(201).json({
      message: "interview report generated successfully",
      interviewReport,
      voiceText,
    });
  } catch (error) {
    console.log("Interview Report Error:", error);

    return res.status(500).json({
      message: "Failed to generate interview report",
      error: error.message,
    });
  }
}

module.exports = { generateInterviewReportController };